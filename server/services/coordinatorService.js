const Attendance = require('../models/attendanceModel');
const Registration = require('../models/registrationModel');
const Event = require('../models/eventModel');
const AppError = require('../utils/appError');
const { getAssignedEvent } = require('./eventService');
const { generateCertificatesForUsers } = require('./certificateService');
const { assertObjectIdList } = require('../utils/validators');

const assertRegisteredUsers = async ({ eventId, userIds, message }) => {
    const registrations = await Registration.find({
        event: eventId,
        user: { $in: userIds },
        status: 'registered'
    }).select('user');

    if (registrations.length !== userIds.length) {
        throw new AppError(message, 400);
    }

    return registrations.map((registration) => String(registration.user));
};

const getAttendedUserIds = async (eventId) => {
    const attendance = await Attendance.find({
        event: eventId,
        attended: true
    }).select('user');

    return attendance.map((item) => String(item.user));
};

const getCoordinatorStats = async (coordinatorId) => {
    const events = await Event.find({ coordinators: coordinatorId });

    const totalAssigned = events.length;
    const upcoming = events.filter(e => e.status === 'open').length;
    const completed = events.filter(e => e.status === 'completed').length;

    const eventIds = events.map(e => e._id);
    const totalParticipants = await Registration.countDocuments({
        event: { $in: eventIds },
        status: 'registered'
    });

    return { totalAssigned, upcoming, completed, totalParticipants };
};

const endRegistration = async ({ eventId, coordinatorId }) => {
    const event = await getAssignedEvent(eventId, coordinatorId);

    if (event.status !== 'open') {
        throw new AppError('Registration can only be ended for open events', 400);
    }

    event.status = 'closed';
    await event.save();

    return { message: 'Registration closed successfully', event };
};

const startEvent = async ({ eventId, coordinatorId }) => {
    const event = await getAssignedEvent(eventId, coordinatorId);

    if (!event.eventDate) {
        throw new AppError('Event date is not configured', 400);
    }

    if (event.status !== 'open' && event.status !== 'closed') {
        throw new AppError('Only open or closed events can be started', 400);
    }

    event.status = 'live';
    await event.save();

    return { message: 'Event started successfully', event };
};

const getAttendance = async ({ eventId, coordinatorId }) => {
    await getAssignedEvent(eventId, coordinatorId);

    return Attendance.find({ event: eventId })
        .populate('user', 'name email gender')
        .sort({ createdAt: -1 });
};

const markAttendance = async ({ eventId, coordinatorId, userIds = [] }) => {
    const event = await getAssignedEvent(eventId, coordinatorId);
    const normalizedUserIds = assertObjectIdList(userIds, 'Invalid participant id');

    if (event.status !== 'live') {
        throw new AppError('Attendance can only be marked for live events', 400);
    }

    if (normalizedUserIds.length === 0) {
        throw new AppError('At least one participant is required', 400);
    }

    await assertRegisteredUsers({
        eventId: event._id,
        userIds: normalizedUserIds,
        message: 'Attendance can only be marked for registered participants'
    });

    await Promise.all(
        normalizedUserIds.map((userId) => Attendance.findOneAndUpdate(
            {
                event: event._id,
                user: userId
            },
            {
                markedBy: coordinatorId,
                attended: true,
                markedAt: new Date()
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            }
        ))
    );

    return Attendance.find({
        event: event._id,
        user: { $in: normalizedUserIds }
    }).populate('user', 'name email gender');
};

const endEvent = async ({ eventId, coordinatorId }) => {
    const event = await getAssignedEvent(eventId, coordinatorId);

    if (event.status !== 'live') {
        throw new AppError('Only live events can be ended', 400);
    }

    event.status = 'completed';
    await event.save();

    return { message: 'Event completed successfully', event };
};

const saveResult = async ({ eventId, coordinatorId, winner, runnerUp, top3 = [] }) => {
    const event = await getAssignedEvent(eventId, coordinatorId);

    if (event.status !== 'completed') {
        throw new AppError('Results can only be assigned after event completion', 400);
    }

    if (event.resultsFinalized) {
        throw new AppError('Results have already been finalized and cannot be changed', 400);
    }

    if (!winner || !runnerUp || !Array.isArray(top3) || top3.length !== 3) {
        throw new AppError('Winner, runner-up and top 3 are required', 400);
    }

    const normalizedTop3 = assertObjectIdList(top3, 'Invalid top 3 participant id');

    if (normalizedTop3.length !== 3) {
        throw new AppError('Top 3 must contain three unique participants', 400);
    }

    const resultIds = assertObjectIdList(
        [winner, runnerUp, ...normalizedTop3].filter(Boolean),
        'Invalid result participant id'
    );

    // Check for duplicates
    const uniqueIds = new Set(resultIds.map(String));
    if (uniqueIds.size !== resultIds.length) {
        throw new AppError('Duplicate selections are not allowed in results', 400);
    }

    await assertRegisteredUsers({
        eventId: event._id,
        userIds: resultIds,
        message: 'Results can only include registered participants'
    });

    const attendedUserIds = new Set(await getAttendedUserIds(event._id));
    const allAttended = resultIds.every((userId) => attendedUserIds.has(String(userId)));

    if (!allAttended) {
        throw new AppError('Results can only include attended participants', 400);
    }

    event.results = {
        winner,
        runnerUp,
        top3: normalizedTop3
    };
    event.winners = resultIds;
    event.resultsFinalized = true;

    const updatedEvent = await event.save();
    await updatedEvent.populate('results.winner', 'name email gender');
    await updatedEvent.populate('results.runnerUp', 'name email gender');
    await updatedEvent.populate('results.top3', 'name email gender');

    return updatedEvent;
};

const generateEventCertificates = async ({ eventId, coordinatorId }) => {
    const event = await getAssignedEvent(eventId, coordinatorId);

    if (event.status !== 'completed') {
        throw new AppError('Certificates can only be generated after event completion', 400);
    }

    const registeredUsers = await Registration.find({
        event: event._id,
        status: 'registered'
    }).select('user');
    const registeredUserIds = registeredUsers.map((registration) => String(registration.user));
    const attendedUserIds = new Set(await getAttendedUserIds(event._id));
    const resultUserIds = new Set([
        event.results?.winner,
        event.results?.runnerUp,
        ...(event.results?.top3 || [])
    ].filter(Boolean).map((id) => String(id)));

    const attendedRegisteredUserIds = registeredUserIds.filter((userId) => attendedUserIds.has(userId));
    const achievementUserIds = attendedRegisteredUserIds.filter((userId) => resultUserIds.has(userId));
    const participationUserIds = attendedRegisteredUserIds.filter((userId) => !resultUserIds.has(userId));

    const [participationCertificates, achievementCertificates] = await Promise.all([
        generateCertificatesForUsers({
            userIds: participationUserIds,
            eventId: event._id,
            type: 'participation'
        }),
        generateCertificatesForUsers({
            userIds: achievementUserIds,
            eventId: event._id,
            type: 'achievement'
        })
    ]);

    return {
        participationCertificates,
        achievementCertificates
    };
};

const exportParticipationList = async ({ eventId, coordinatorId }) => {
    await getAssignedEvent(eventId, coordinatorId);

    const registrations = await Registration.find({
        event: eventId,
        status: 'registered'
    })
        .populate('user', 'name email gender phoneNumber institutionName')
        .sort({ createdAt: 1 });

    const rows = [
        'Name,Email,Gender,Phone Number,Institution'
    ];

    registrations.forEach((registration) => {
        const user = registration.user;
        rows.push([
            user?.name || '',
            user?.email || '',
            user?.gender || '',
            user?.phoneNumber || '',
            user?.institutionName || ''
        ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','));
    });

    return rows.join('\n');
};

module.exports = {
    getCoordinatorStats,
    endRegistration,
    startEvent,
    getAttendance,
    markAttendance,
    endEvent,
    saveResult,
    generateEventCertificates,
    exportParticipationList
};
