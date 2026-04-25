const Event = require('../models/eventModel');
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

module.exports = {
    getEventAnalytics
};
