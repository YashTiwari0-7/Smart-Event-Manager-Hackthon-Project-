const Event = require('../models/eventModel');
const User = require('../models/userModel');
const Registration = require('../models/registrationModel');
const Team = require('../models/teamModel');
const Certificate = require('../models/certificateModel');
const AppError = require('../utils/appError');
const { assertObjectId } = require('../utils/validators');

const getEventAnalytics = async (eventId) => {
    assertObjectId(eventId, 'Invalid event id');

    const event = await Event.findById(eventId)
        .populate('coordinators', 'name email role isApproved')
        .populate('winners', 'name email gender')
        .populate('participants', 'name email gender');

    if (!event) {
        throw new AppError('Event not found', 404);
    }

    const [registrations, teams, certificates] = await Promise.all([
        Registration.find({ event: eventId })
            .populate('user', 'name email gender role')
            .populate('team', 'name members status')
            .sort({ createdAt: -1 }),
        Team.find({ event: eventId })
            .populate('members', 'name email gender')
            .sort({ createdAt: -1 }),
        Certificate.find({ event: eventId })
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
    ]);

    const registeredCount = registrations.filter((item) => item.status === 'registered').length;
    const withdrawnCount = registrations.filter((item) => item.status === 'withdrawn').length;
    const participationCertificates = certificates.filter((item) => item.type === 'participation').length;
    const achievementCertificates = certificates.filter((item) => item.type === 'achievement').length;

    return {
        summary: {
            eventId: event._id,
            title: event.title,
            participationType: event.participationType,
            coordinatorCount: event.coordinators.length,
            participantCount: registeredCount,
            withdrawnCount,
            teamCount: teams.length,
            winnerCount: event.winners.length,
            participationCertificates,
            achievementCertificates
        },
        details: {
            event,
            registrations,
            teams,
            certificates
        }
    };
};

const getOverallAnalytics = async () => {
    const [events, registrations, users] = await Promise.all([
        Event.find().populate('coordinators', 'name email'),
        Registration.find().populate('user', 'name email gender course institution institutionName'),
        User.find({ role: 'participant' }).select('gender course institution institutionName')
    ]);

    const totalEvents = events.length;
    const upcomingEvents = events.filter(e => e.status === 'OPEN').length;
    const ongoingEvents = events.filter(e => e.status === 'LIVE').length;
    const completedEvents = events.filter(e => e.status === 'COMPLETED').length;

    const registered = registrations.filter(r => r.status === 'registered');
    const withdrawn = registrations.filter(r => r.status === 'withdrawn');

    const genderCounts = { male: 0, female: 0, other: 0 };
    registered.forEach(r => {
        const g = r.user?.gender || 'other';
        genderCounts[g] = (genderCounts[g] || 0) + 1;
    });

    const courseCounts = {};
    users.forEach(u => {
        const c = u.course || u.institution || u.institutionName || 'Unknown';
        courseCounts[c] = (courseCounts[c] || 0) + 1;
    });

    const eventStats = events.map(e => {
        const eventRegs = registrations.filter(r => String(r.event) === String(e._id));
        return {
            id: e._id,
            title: e.title,
            status: e.status,
            registered: eventRegs.filter(r => r.status === 'registered').length,
            withdrawn: eventRegs.filter(r => r.status === 'withdrawn').length,
            coordinators: e.coordinators?.map(c => c.name) || []
        };
    });

    return {
        totals: { totalEvents, upcomingEvents, ongoingEvents, completedEvents },
        participation: { total: registered.length, withdrawn: withdrawn.length },
        genderRatio: genderCounts,
        courseDistribution: courseCounts,
        eventStats
    };
};

const getCoordinatorAnalytics = async (coordinatorId) => {
    assertObjectId(coordinatorId, 'Invalid coordinator id');

    const coordinator = await User.findOne({
        _id: coordinatorId,
        role: 'coordinator'
    }).select('-password');

    if (!coordinator) {
        throw new AppError('Coordinator not found', 404);
    }

    const assignedEvents = await Event.find({ coordinators: coordinatorId });

    const eventIds = assignedEvents.map(e => e._id);
    const registrations = await Registration.find({ event: { $in: eventIds } })
        .populate('user', 'name email gender');

    const registered = registrations.filter(r => r.status === 'registered');
    const withdrawn = registrations.filter(r => r.status === 'withdrawn');

    const eventBreakdown = assignedEvents.map(e => {
        const eventRegs = registrations.filter(r => String(r.event) === String(e._id));
        return {
            id: e._id,
            title: e.title,
            status: e.status,
            registered: eventRegs.filter(r => r.status === 'registered').length,
            withdrawn: eventRegs.filter(r => r.status === 'withdrawn').length
        };
    });

    return {
        coordinator: { _id: coordinator._id, name: coordinator.name, email: coordinator.email },
        totalEvents: assignedEvents.length,
        totalRegistered: registered.length,
        totalWithdrawn: withdrawn.length,
        eventBreakdown
    };
};

module.exports = {
    getEventAnalytics,
    getOverallAnalytics,
    getCoordinatorAnalytics
};
