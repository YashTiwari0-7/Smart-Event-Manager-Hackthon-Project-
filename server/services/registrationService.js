const crypto = require('crypto');
const Event = require('../models/eventModel');
const User = require('../models/userModel');
const Team = require('../models/teamModel');
const Registration = require('../models/registrationModel');
const Certificate = require('../models/certificateModel');
const AppError = require('../utils/appError');
const { ROLES } = require('../utils/authConstants');
const {
    assertObjectId,
    assertRegistrationOpen
} = require('../utils/validators');

const assertEventConfigured = (event) => {
    if (!event.participationType || !event.registrationStartDate || !event.registrationEndDate || !event.eventDate) {
        throw new AppError('Event registration is not configured yet', 400);
    }

    if (event.participationType === 'team' && (!event.maxTeamSize || event.maxTeamSize <= 0)) {
        throw new AppError('Team event is not configured yet', 400);
    }

    if (event.participationType === 'individual' && (!event.totalSlots || event.totalSlots <= 0)) {
        throw new AppError('Individual event is not configured yet', 400);
    }
};

const isSameEventTime = (left, right) => {
    return new Date(left).getTime() === new Date(right).getTime();
};

const assertNoTimeConflict = async ({ userId, event }) => {
    const registrations = await Registration.find({
        user: userId,
        status: 'registered'
    }).populate('event', 'eventDate');

    const hasConflict = registrations.some((registration) => {
        return registration.event
            && registration.event._id.toString() !== event._id.toString()
            && registration.event.eventDate
            && event.eventDate
            && isSameEventTime(registration.event.eventDate, event.eventDate);
    });

    if (hasConflict) {
        throw new AppError(
            'Cannot register: already registered in another event at the same date and time',
            400
        );
    }
};

const getIndividualRegistrationCounts = async (event) => {
    const registrations = await Registration.find({
        event: event._id,
        status: 'registered'
    }).populate('user', 'gender');

    const reservedType = event.genderSpecification?.type;
    const reservedGenderCount = registrations.filter((registration) => {
        return registration.user && registration.user.gender === reservedType;
    }).length;

    return {
        totalRegistered: registrations.length,
        reservedGenderCount,
        otherGenderCount: registrations.length - reservedGenderCount
    };
};

const validateIndividualSlots = async ({ event, participant }) => {
    const counts = await getIndividualRegistrationCounts(event);

    if (counts.totalRegistered >= event.totalSlots) {
        throw new AppError('No slots available for this event', 400);
    }

    const genderSpecification = event.genderSpecification || {};

    if (!genderSpecification.enabled) {
        return;
    }

    const reservedType = genderSpecification.type;
    const reservedSlots = genderSpecification.reservedSlots || 0;
    const remainingSlots = event.totalSlots - reservedSlots;

    const openSlotsTaken = counts.otherGenderCount + Math.max(0, counts.reservedGenderCount - reservedSlots);

    if (participant.gender === reservedType) {
        if (counts.reservedGenderCount >= reservedSlots && openSlotsTaken >= remainingSlots) {
            throw new AppError(`Both reserved and open slots are full`, 400);
        }
    } else {
        if (openSlotsTaken >= remainingSlots) {
            throw new AppError('Open slots are full', 400);
        }
    }
};

const validateTeamGender = (event, members) => {
    const genderSpecification = event.genderSpecification || {};

    if (!genderSpecification.enabled) {
        return;
    }

    const matchingGenderCount = members.filter((member) => {
        return member.gender === genderSpecification.type;
    }).length;

    if (matchingGenderCount < genderSpecification.minCount) {
        throw new AppError(
            `Team must include at least ${genderSpecification.minCount} ${genderSpecification.type} member(s)`,
            400
        );
    }
};

const getAvailableSlots = async (event) => {
    if (event.participationType !== 'individual') {
        return null;
    }

    const registeredCount = await Registration.countDocuments({
        event: event._id,
        status: 'registered'
    });

    return Math.max((event.totalSlots || 0) - registeredCount, 0);
};

const getAvailableEvents = async (userId) => {
    let events = await Event.find({
        participationType: { $in: ['individual', 'team'] }
    })
        .select('title description participationType totalSlots maxTeamSize genderSpecification registrationStartDate registrationEndDate eventDate status')
        .sort({ registrationStartDate: 1, createdAt: -1 });

    return Promise.all(events.map(async (event) => ({
        _id: event._id,
        title: event.title,
        description: event.description,
        participationType: event.participationType,
        totalSlots: event.totalSlots,
        maxTeamSize: event.maxTeamSize,
        availableSlots: await getAvailableSlots(event),
        genderSpecification: event.genderSpecification,
        registrationStartDate: event.registrationStartDate,
        registrationEndDate: event.registrationEndDate,
        eventDate: event.eventDate,
        status: event.status
    })));
};

const getEventForRegistration = async (eventId) => {
    assertObjectId(eventId, 'Invalid event id');

    const event = await Event.findById(eventId);

    if (!event) {
        throw new AppError('Event not found', 404);
    }

    assertEventConfigured(event);
    assertRegistrationOpen(event);

    if (event.status !== 'OPEN') {
        throw new AppError('Registration is not available for this event', 400);
    }

    return event;
};

const assertNoDuplicateRegistration = async ({ eventId, userId }) => {
    const existingRegistration = await Registration.findOne({
        event: eventId,
        user: userId,
        status: 'registered'
    }).select('_id');

    if (existingRegistration) {
        throw new AppError('User already registered for this event', 400);
    }
};

const assertNoPendingTeamMembership = async ({ eventId, userId }) => {
    const team = await Team.findOne({
        event: eventId,
        members: userId,
        isComplete: false
    }).select('_id');

    if (team) {
        throw new AppError('User already joined a team for this event', 400);
    }
};

const registerForEvent = async ({ eventId, userId }) => {
    const event = await getEventForRegistration(eventId);

    if (event.participationType !== 'individual') {
        throw new AppError('Use team create or join for team events', 400);
    }

    await assertNoDuplicateRegistration({ eventId: event._id, userId });
    await assertNoPendingTeamMembership({ eventId: event._id, userId });
    await assertNoTimeConflict({ userId, event });

    const participant = await User.findById(userId).select('gender role');

    if (!participant || participant.role !== ROLES.PARTICIPANT) {
        throw new AppError('Participant user not found', 404);
    }

    await validateIndividualSlots({ event, participant });

    await Registration.findOneAndUpdate(
        {
            user: userId,
            event: event._id
        },
        {
            team: null,
            status: 'registered'
        },
        {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        }
    );

    event.participants.addToSet(userId);
    await event.save();

    return { message: 'Registered successfully' };
};

const generateInvitationCode = () => {
    // Generate a 6-character alphanumeric code
    return crypto.randomBytes(3).toString('hex').toUpperCase();
};

const createTeam = async ({ eventId, userId, teamName }) => {
    const event = await getEventForRegistration(eventId);

    if (event.participationType !== 'team') {
        throw new AppError('Team creation is only available for team events', 400);
    }

    await assertNoDuplicateRegistration({ eventId: event._id, userId });
    await assertNoPendingTeamMembership({ eventId: event._id, userId });
    await assertNoTimeConflict({ userId, event });

    const normalizedTeamName = teamName || `${event.title} Team ${Date.now()}`;
    const existingTeam = await Team.findOne({
        event: event._id,
        name: normalizedTeamName
    }).select('_id');

    if (existingTeam) {
        throw new AppError('Team name already exists for this event', 400);
    }

    let invitationCode = generateInvitationCode();
    while (await Team.findOne({ invitationCode }).select('_id')) {
        invitationCode = generateInvitationCode();
    }

    const team = await Team.create({
        name: normalizedTeamName,
        event: event._id,
        leader: userId,
        members: [userId],
        capacity: event.maxTeamSize,
        invitationCode,
        isComplete: event.maxTeamSize === 1
    });

    event.teams.addToSet(team._id);
    await event.save();

    if (team.isComplete) {
        await completeTeamRegistration({ event, team });
    }

    return team.populate('members', 'name email gender');
};

const completeTeamRegistration = async ({ event, team }) => {
    const members = await User.find({
        _id: { $in: team.members },
        role: ROLES.PARTICIPANT
    }).select('name email gender role');

    if (members.length !== team.members.length) {
        throw new AppError('All team members must be participant users', 400);
    }

    validateTeamGender(event, members);

    await Promise.all(team.members.map((memberId) => Registration.findOneAndUpdate(
        {
            user: memberId,
            event: event._id
        },
        {
            team: team._id,
            status: 'registered'
        },
        {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        }
    )));

    team.isComplete = true;
    await team.save();

    team.members.forEach((memberId) => event.participants.addToSet(memberId));
    await event.save();
};

const joinTeam = async ({ eventId, userId, invitationCode }) => {
    if (!invitationCode) {
        throw new AppError('Invitation code is required', 400);
    }

    const event = await getEventForRegistration(eventId);

    if (event.participationType !== 'team') {
        throw new AppError('Team join is only available for team events', 400);
    }

    await assertNoDuplicateRegistration({ eventId: event._id, userId });
    await assertNoPendingTeamMembership({ eventId: event._id, userId });
    await assertNoTimeConflict({ userId, event });

    const team = await Team.findOne({
        event: event._id,
        invitationCode: String(invitationCode).trim().toUpperCase()
    });

    if (!team) {
        throw new AppError('Invalid invitation code', 404);
    }

    if (team.members.some((memberId) => String(memberId) === String(userId))) {
        throw new AppError('User already joined this team', 400);
    }

    if (team.members.length >= team.capacity) {
        throw new AppError('Team is full', 400);
    }

    team.members.addToSet(userId);
    await team.save();

    if (team.members.length === team.capacity) {
        await completeTeamRegistration({ event, team });
    }

    return team.populate('members', 'name email gender');
};

const withdrawFromEvent = async ({ eventId, userId }) => {
    assertObjectId(eventId, 'Invalid event id');

    const event = await Event.findById(eventId);

    if (!event) {
        throw new AppError('Event not found', 404);
    }

    if (!event.registrationStartDate || !event.registrationEndDate) {
        throw new AppError('Event registration dates are not configured', 400);
    }

    const now = new Date();
    if (now < new Date(event.registrationStartDate) || now > new Date(event.registrationEndDate)) {
        throw new AppError('Withdrawal is only allowed between registration start and end dates', 400);
    }

    const registration = await Registration.findOne({
        user: userId,
        event: event._id,
        status: 'registered'
    });

    if (!registration) {
        throw new AppError('Active registration not found', 404);
    }

    registration.status = 'withdrawn';
    await registration.save();

    event.participants.pull(userId);
    event.winners.pull(userId);
    await event.save();

    return { message: 'Withdrawn successfully' };
};

const getParticipationHistory = async (userId) => {
    const registrations = await Registration.find({ user: userId })
        .populate({
            path: 'event',
            select: 'title description participationType eventDate status results',
            populate: [
                { path: 'results.winner', select: 'name email gender' },
                { path: 'results.runnerUp', select: 'name email gender' },
                { path: 'results.top3', select: 'name email gender' }
            ]
        })
        .populate('team', 'name invitationCode members leader capacity isComplete')
        .sort({ createdAt: -1 });

    return registrations.filter((registration) => {
        return registration.event;
    });
};

const getParticipationStats = async (userId) => {
    const registrations = await Registration.find({ user: userId })
        .populate('event', 'title participationType registrationStartDate registrationEndDate eventDate')
        .populate('team', 'name members leader invitationCode capacity isComplete')
        .sort({ createdAt: -1 });

    const certificates = await Certificate.find({ user: userId })
        .populate('event', 'title')
        .sort({ createdAt: -1 });

    return {
        summary: {
            totalRegistrations: registrations.length,
            activeRegistrations: registrations.filter((item) => item.status === 'registered').length,
            withdrawnRegistrations: registrations.filter((item) => item.status === 'withdrawn').length,
            certificates: certificates.length
        },
        registrations,
        certificates
    };
};


const leaveTeam = async ({ eventId, userId }) => {
    assertObjectId(eventId, 'Invalid event id');

    const event = await Event.findById(eventId);
    if (!event) throw new AppError('Event not found', 404);

    const now = new Date();
    if (event.registrationEndDate && now > new Date(event.registrationEndDate)) {
        throw new AppError('Cannot leave team: registration period has ended', 400);
    }

    const team = await Team.findOne({ event: eventId, members: userId });
    if (!team) throw new AppError('You are not in a team for this event', 404);

    if (String(team.leader) === String(userId)) {
        // Leader cancels whole team
        team.members.forEach(memberId => event.participants.pull(memberId));
        await Registration.updateMany(
            { event: eventId, team: team._id },
            { status: 'withdrawn', team: null }
        );
        event.teams.pull(team._id);
        await event.save();
        await team.deleteOne();
        return { message: 'Team cancelled' };
    }

    team.members.pull(userId);
    team.isComplete = false;
    await team.save();

    await Registration.findOneAndUpdate(
        { user: userId, event: eventId },
        { status: 'withdrawn', team: null }
    );
    event.participants.pull(userId);
    await event.save();

    return { message: 'Left team successfully' };
};

const removeTeamMember = async ({ eventId, leaderId, memberId }) => {
    assertObjectId(eventId, 'Invalid event id');
    assertObjectId(leaderId, 'Invalid leader id');
    assertObjectId(memberId, 'Invalid member id');

    if (String(leaderId) === String(memberId)) {
        throw new AppError('Leader cannot remove themselves using this endpoint. Use leave team instead.', 400);
    }

    const event = await Event.findById(eventId);
    if (!event) throw new AppError('Event not found', 404);

    const now = new Date();
    if (event.registrationEndDate && now > new Date(event.registrationEndDate)) {
        throw new AppError('Cannot remove member: registration period has ended', 400);
    }

    const team = await Team.findOne({ event: eventId, leader: leaderId });
    if (!team) throw new AppError('You are not the leader of a team for this event', 403);

    if (!team.members.includes(memberId)) {
        throw new AppError('User is not a member of your team', 404);
    }

    team.members.pull(memberId);
    if (team.isComplete) {
        team.isComplete = false;
        // Revert all existing members to 'registered' but they are still in a team that is not complete
        // Actually, if a team becomes incomplete, do we revoke their registration? 
        // The requirements say: "Application Status: Pending (team incomplete)".
        // So we just update the team's isComplete flag. The registrations are still technically 'registered' but the UI will see isComplete=false as Pending.
    }
    await team.save();

    await Registration.findOneAndUpdate(
        { user: memberId, event: eventId },
        { status: 'withdrawn', team: null }
    );
    event.participants.pull(memberId);
    await event.save();

    return team.populate('members', 'name email gender');
};

const updateTeamName = async ({ eventId, leaderId, teamName }) => {
    assertObjectId(eventId, 'Invalid event id');
    assertObjectId(leaderId, 'Invalid leader id');

    if (!teamName || String(teamName).trim() === '') {
        throw new AppError('Team name is required', 400);
    }

    const event = await Event.findById(eventId);
    if (!event) throw new AppError('Event not found', 404);

    const team = await Team.findOne({ event: eventId, leader: leaderId });
    if (!team) throw new AppError('You are not the leader of a team for this event', 403);

    if (!team.isComplete) {
        throw new AppError('Team name can only be officially set when all slots are filled', 400);
    }

    const normalizedTeamName = String(teamName).trim();
    
    // Check if name is taken by another team
    const existingTeam = await Team.findOne({
        event: event._id,
        name: normalizedTeamName,
        _id: { $ne: team._id }
    }).select('_id');

    if (existingTeam) {
        throw new AppError('Team name already exists for this event', 400);
    }

    team.name = normalizedTeamName;
    await team.save();

    return team.populate('members', 'name email gender');
};

module.exports = {
    getAvailableEvents,
    registerForEvent,
    createTeam,
    joinTeam,
    leaveTeam,
    removeTeamMember,
    updateTeamName,
    withdrawFromEvent,
    getParticipationHistory,
    getParticipationStats,
    validateTeamGender,
    validateIndividualSlots
};
