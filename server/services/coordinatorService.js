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
    const upcoming = events.filter(e => e.status === 'OPEN').length;
    const completed = events.filter(e => e.status === 'COMPLETED').length;

    const eventIds = events.map(e => e._id);
    const totalParticipants = await Registration.countDocuments({
        event: { $in: eventIds },
        status: 'registered'
    });

    return { totalAssigned, upcoming, completed, totalParticipants };
};

const endRegistration = async ({ eventId, coordinatorId }) => {
    const event = await getAssignedEvent(eventId, coordinatorId);

    console.log(`Ending registration for event ${eventId}. Current status: ${event.status}`);

    if (event.status !== 'OPEN') {
        throw new AppError('Registration can only be ended for open events', 400);
    }

    event.status = 'CLOSED';
    event.registrationClosedAt = new Date();
    await event.save();

    return { message: 'Registration closed successfully', event };
};

const startEvent = async ({ eventId, coordinatorId }) => {
    const event = await getAssignedEvent(eventId, coordinatorId);

    if (!event.eventDate) {
        throw new AppError('Event date is not configured', 400);
    }

    if (event.status !== 'CLOSED') {
        throw new AppError('Only closed events can be started. End registration first.', 400);
    }

    event.status = 'LIVE';
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
    const presentUserIds = assertObjectIdList(userIds, 'Invalid participant id');

    if (event.status !== 'LIVE') {
        throw new AppError('Attendance can only be marked for live events', 400);
    }

    // Get all registered participants
    const allRegistrations = await Registration.find({
        event: event._id,
        status: 'registered'
    }).select('user');

    const allUserIds = allRegistrations.map(r => String(r.user));
    const presentSet = new Set(presentUserIds.map(String));

    // Sync all participants: mark present or absent
    await Promise.all(
        allUserIds.map((userId) => Attendance.findOneAndUpdate(
            {
                event: event._id,
                user: userId
            },
            {
                markedBy: coordinatorId,
                attended: presentSet.has(userId),
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
        event: event._id
    }).populate('user', 'name email gender');
};

const endEvent = async ({ eventId, coordinatorId }) => {
    const event = await getAssignedEvent(eventId, coordinatorId);

    if (event.status !== 'LIVE') {
        throw new AppError('Only live events can be ended', 400);
    }

    event.status = 'COMPLETED';
    await event.save();

    return { message: 'Event completed successfully', event };
};

const saveResult = async ({ eventId, coordinatorId, winner, runnerUp, top3 = [] }) => {
    const event = await getAssignedEvent(eventId, coordinatorId);

    if (event.status !== 'COMPLETED') {
        throw new AppError('Results can only be assigned after event completion', 400);
    }

    if (event.resultsFinalized) {
        throw new AppError('Results have already been finalized and cannot be changed', 400);
    }

    const isTeam = event.participationType === 'team';

    if (!Array.isArray(top3) || top3.length < 3) {
        throw new AppError('Top 3 selections are required', 400);
    }

    const normalizedTop3 = assertObjectIdList(top3, 'Invalid selection id');

    if (normalizedTop3.length !== 3) {
        throw new AppError('Top 3 must contain three unique selections', 400);
    }

    const finalWinner = winner || normalizedTop3[0];
    const finalRunnerUp = runnerUp || normalizedTop3[1];

    const resultIds = assertObjectIdList(
        [finalWinner, finalRunnerUp, ...normalizedTop3].filter(Boolean),
        'Invalid selection id'
    );

    const uniqueIds = new Set(resultIds.map(String));
    const finalResultIds = (winner || runnerUp) ? resultIds : normalizedTop3;
    const finalUniqueIds = new Set(finalResultIds.map(String));

    if (finalUniqueIds.size !== finalResultIds.length) {
        throw new AppError('Duplicate selections are not allowed in results', 400);
    }

    if (isTeam) {
        // Validation for teams
        const Team = require('../models/teamModel');
        const teams = await Team.find({ _id: { $in: finalResultIds }, event: eventId });
        if (teams.length !== finalUniqueIds.size) {
            throw new AppError('Results can only include teams registered for this event', 400);
        }

        const attendedUserIds = new Set(await getAttendedUserIds(event._id));
        const allTeamsAttended = teams.every(team => 
            team.members.some(memberId => attendedUserIds.has(String(memberId)))
        );

        if (!allTeamsAttended) {
            throw new AppError('Results can only include attended teams', 400);
        }

        event.results = {
            winnerTeam: finalWinner,
            runnerUpTeam: finalRunnerUp,
            top3Teams: normalizedTop3
        };
        
        // Collect all members of winning teams to mark them as winners (for certificate logic)
        const winnerUserIds = [];
        teams.forEach(t => {
            winnerUserIds.push(...t.members);
        });
        event.winners = [...new Set(winnerUserIds)];
    } else {
        // Validation for participants
        await assertRegisteredUsers({
            eventId: event._id,
            userIds: finalResultIds,
            message: 'Results can only include registered participants'
        });

        const attendedUserIds = new Set(await getAttendedUserIds(event._id));
        const allAttended = finalResultIds.every((userId) => attendedUserIds.has(String(userId)));

        if (!allAttended) {
            throw new AppError('Results can only include attended participants', 400);
        }

        event.results = {
            winner: finalWinner,
            runnerUp: finalRunnerUp,
            top3: normalizedTop3
        };
        event.winners = finalResultIds;
    }

    event.resultsFinalized = true;

    const updatedEvent = await event.save();
    
    if (isTeam) {
        await updatedEvent.populate('results.winnerTeam', 'name');
        await updatedEvent.populate('results.runnerUpTeam', 'name');
        await updatedEvent.populate('results.top3Teams', 'name');
    } else {
        await updatedEvent.populate('results.winner', 'name email gender');
        await updatedEvent.populate('results.runnerUp', 'name email gender');
        await updatedEvent.populate('results.top3', 'name email gender');
    }

    return updatedEvent;
};

const generateEventCertificates = async ({ eventId, coordinatorId }) => {
    const event = await getAssignedEvent(eventId, coordinatorId);

    if (event.status !== 'COMPLETED') {
        throw new AppError('Certificates can only be generated after event completion', 400);
    }

    const attendedUserIds = new Set(await getAttendedUserIds(event._id));
    
    // Map of userId -> rank
    const userRankMap = new Map();
    
    if (event.results) {
        if (event.participationType === 'team') {
            const Team = require('../models/teamModel');
            const winnerTeams = await Team.find({
                _id: { $in: [
                    event.results.winnerTeam, 
                    event.results.runnerUpTeam, 
                    ...(event.results.top3Teams || [])
                ].filter(Boolean) }
            });

            const teamRanks = new Map();
            if (event.results.winnerTeam) teamRanks.set(String(event.results.winnerTeam), '1st Place');
            if (event.results.runnerUpTeam) teamRanks.set(String(event.results.runnerUpTeam), '2nd Place');
            (event.results.top3Teams || []).forEach((tid, i) => {
                if (!teamRanks.has(String(tid))) teamRanks.set(String(tid), `Top 3 — #${i + 1}`);
            });

            winnerTeams.forEach(team => {
                const rank = teamRanks.get(String(team._id));
                team.members.forEach(uid => {
                    if (attendedUserIds.has(String(uid))) {
                        userRankMap.set(String(uid), rank);
                    }
                });
            });
        } else {
            if (event.results.winner) userRankMap.set(String(event.results.winner), '1st Place');
            if (event.results.runnerUp) userRankMap.set(String(event.results.runnerUp), '2nd Place');
            (event.results.top3 || []).forEach((uid, i) => {
                if (!userRankMap.has(String(uid))) userRankMap.set(String(uid), `Top 3 — #${i + 1}`);
            });
        }
    }

    const registeredUsers = await Registration.find({
        event: event._id,
        status: 'registered'
    }).select('user');
    
    const achievementUsers = [];
    const participationUsers = [];

    registeredUsers.forEach(reg => {
        const userId = String(reg.user);
        if (attendedUserIds.has(userId)) {
            if (userRankMap.has(userId)) {
                achievementUsers.push({ userId, rank: userRankMap.get(userId) });
            } else {
                participationUsers.push({ userId, rank: null });
            }
        }
    });

    const [participationCertificates, achievementCertificates] = await Promise.all([
        generateCertificatesForUsers({
            usersWithRanks: participationUsers,
            eventId: event._id,
            type: 'participation'
        }),
        generateCertificatesForUsers({
            usersWithRanks: achievementUsers,
            eventId: event._id,
            type: 'achievement'
        })
    ]);

    return {
        participationCertificates,
        achievementCertificates
    };
};

const exportParticipationListCSV = async ({ eventId, coordinatorId }) => {
    const event = await getAssignedEvent(eventId, coordinatorId);
    
    if (event.status === 'OPEN') {
        throw new AppError('Participant list download is only available after registration is closed', 400);
    }

    const isTeam = event.participationType === 'team';

    const registrations = await Registration.find({
        event: eventId,
        status: 'registered'
    })
        .populate('user', 'name email gender phoneNumber mobileNumber institutionName age')
        .populate('team', 'name leader')
        .sort({ createdAt: 1 });

    let rows = [];
    if (isTeam) {
        rows.push('Serial No.,Team Name,Participant Name,Designation,Mobile Number,Institution,Gender,Age');
        registrations.forEach((reg, i) => {
            const user = reg.user;
            const team = reg.team;
            const isLeader = team && String(team.leader) === String(user?._id);
            rows.push([
                i + 1,
                team?.name || '',
                user?.name || '',
                isLeader ? 'Team Leader' : '',
                user?.mobileNumber || user?.phoneNumber || '',
                user?.institutionName || '',
                user?.gender || '',
                user?.age || ''
            ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
        });
    } else {
        rows.push('Serial No.,Participant Name,Mobile Number,Institution,Gender,Age');
        registrations.forEach((reg, i) => {
            const user = reg.user;
            rows.push([
                i + 1,
                user?.name || '',
                user?.mobileNumber || user?.phoneNumber || '',
                user?.institutionName || '',
                user?.gender || '',
                user?.age || ''
            ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
        });
    }

    return rows.join('\n');
};

const exportParticipationListPDF = async ({ eventId, coordinatorId }) => {
    const event = await getAssignedEvent(eventId, coordinatorId);

    if (event.status === 'OPEN') {
        throw new AppError('Participant list download is only available after registration is closed', 400);
    }

    const isTeam = event.participationType === 'team';

    const registrations = await Registration.find({
        event: eventId,
        status: 'registered'
    })
        .populate('user', 'name email gender phoneNumber mobileNumber institutionName age')
        .populate('team', 'name leader')
        .sort({ createdAt: 1 });

    const PDFDocument = require('pdfkit');
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(20).text(`Participant List - ${event.title}`, { align: 'center' });
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown();

        // Table logic
        const columns = isTeam 
            ? ['S.No', 'Team Name', 'Participant Name', 'Designation', 'Mobile', 'Institution', 'Gender', 'Age']
            : ['S.No', 'Participant Name', 'Mobile', 'Institution', 'Gender', 'Age'];
        
        const colWidths = isTeam 
            ? [30, 100, 100, 80, 80, 150, 50, 30]
            : [30, 150, 100, 250, 60, 40];

        let x = 30;
        let y = doc.y;

        // Draw Header
        doc.fontSize(10).font('Helvetica-Bold');
        columns.forEach((col, i) => {
            doc.text(col, x, y, { width: colWidths[i], align: 'left' });
            x += colWidths[i];
        });
        
        doc.moveTo(30, doc.y + 2).lineTo(doc.page.width - 30, doc.y + 2).stroke();
        doc.moveDown();

        // Draw Rows
        doc.font('Helvetica').fontSize(9);
        registrations.forEach((reg, i) => {
            if (doc.y > doc.page.height - 50) doc.addPage({ layout: 'landscape' });
            
            x = 30;
            y = doc.y;
            const user = reg.user;
            const team = reg.team;
            const isLeader = team && String(team.leader) === String(user?._id);

            const rowData = isTeam 
                ? [i + 1, team?.name || '', user?.name || '', isLeader ? 'Team Leader' : '', user?.mobileNumber || user?.phoneNumber || '', user?.institutionName || '', user?.gender || '', user?.age || '']
                : [i + 1, user?.name || '', user?.mobileNumber || user?.phoneNumber || '', user?.institutionName || '', user?.gender || '', user?.age || ''];

            rowData.forEach((val, j) => {
                doc.text(String(val), x, y, { width: colWidths[j], align: 'left' });
                x += colWidths[j];
            });
            doc.moveDown(0.5);
        });

        doc.end();
    });
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
    exportParticipationListCSV,
    exportParticipationListPDF
};
