const Attendance = require('../models/attendanceModel');
const Registration = require('../models/registrationModel');
const AppError = require('../utils/appError');
const { getAssignedEvent } = require('./eventService');
const { generateCertificatesForUsers } = require('./certificateService');
const { assertObjectIdList } = require('../utils/validators');

const toDateKey = (date) => {
    const value = new Date(date);

    return `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}`;
};

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

const startEvent = async ({ eventId, coordinatorId }) => {
    const event = await getAssignedEvent(eventId, coordinatorId);

    if (!event.eventDate) {
        throw new AppError('Event date is not configured', 400);
    }

    if (event.status !== 'upcoming') {
        throw new AppError('Only upcoming events can be started', 400);
    }

    if (toDateKey(new Date()) !== toDateKey(event.eventDate)) {
        throw new AppError('Event can only be started on eventDate', 400);
    }

    event.status = 'ongoing';
    await event.save();

    return {
        message: 'Event started successfully',
        event
    };
};

const markAttendance = async ({ eventId, coordinatorId, userIds = [] }) => {
    const event = await getAssignedEvent(eventId, coordinatorId);
    const normalizedUserIds = assertObjectIdList(userIds, 'Invalid participant id');

    if (event.status !== 'ongoing') {
        throw new AppError('Attendance can only be marked for ongoing events', 400);
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

    if (event.status !== 'ongoing') {
        throw new AppError('Only ongoing events can be ended', 400);
    }

    event.status = 'completed';
    await event.save();

    return {
        message: 'Event completed successfully',
        event
    };
};

const saveResult = async ({ eventId, coordinatorId, winner, runnerUp, top3 = [] }) => {
    const event = await getAssignedEvent(eventId, coordinatorId);

    if (event.status !== 'completed') {
        throw new AppError('Results can only be assigned after event completion', 400);
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
    const event = await getAssignedEvent(eventId, coordinatorId);

    if (event.participationType !== 'individual') {
        throw new AppError('Participation export is only available for individual events', 400);
    }

    const registrations = await Registration.find({
        event: event._id,
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
    startEvent,
    markAttendance,
    endEvent,
    saveResult,
    generateEventCertificates,
    exportParticipationList
};
