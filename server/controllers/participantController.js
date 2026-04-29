const participantRegistrationService = require('../services/participantRegistrationService');
const registrationService = require('../services/registrationService');
const certificateService = require('../services/certificateService');
const asyncHandler = require('../utils/asyncHandler');

const registerParticipant = asyncHandler(async (req, res) => {
    const result = await participantRegistrationService.requestParticipantRegistration(req.body);
    res.status(200).json(result);
});

const verifyParticipantOtp = asyncHandler(async (req, res) => {
    const result = await participantRegistrationService.verifyParticipantOtp(req.body);
    res.status(201).json(result);
});

const getAvailableEvents = asyncHandler(async (req, res) => {
    const events = await registrationService.getAvailableEvents(req.user._id);
    res.json(events);
});

const getMyEvents = asyncHandler(async (req, res) => {
    const result = await registrationService.getParticipationHistory(req.user._id);
    res.json(result);
});

const getAchievements = asyncHandler(async (req, res) => {
    const history = await registrationService.getParticipationHistory(req.user._id);
    const userId = String(req.user._id);

    const achievements = history
        .filter(r => {
            const event = r.event;
            if (!event || event.status !== 'COMPLETED') return false;
            const w = event.results;
            if (!w) return false;
            const ids = [
                String(w.winner?._id || w.winner || ''),
                String(w.runnerUp?._id || w.runnerUp || ''),
                ...(w.top3 || []).map(u => String(u?._id || u || ''))
            ].filter(Boolean);
            return ids.includes(userId);
        })
        .map(r => {
            const event = r.event;
            const w = event.results;
            let position = '';
            if (String(w.winner?._id || w.winner) === userId) position = 'Winner';
            else if (String(w.runnerUp?._id || w.runnerUp) === userId) position = 'Runner-Up';
            else {
                const i = (w.top3 || []).findIndex(u => String(u?._id || u) === userId);
                if (i !== -1) position = `Top 3 — #${i + 1}`;
            }
            return {
                eventId: event._id,
                eventTitle: event.title,
                eventDate: event.eventDate,
                position,
                participationType: event.participationType
            };
        });

    res.json(achievements);
});

const registerForEvent = asyncHandler(async (req, res) => {
    const result = await registrationService.registerForEvent({
        eventId: req.params.id,
        userId: req.user._id
    });
    res.status(201).json(result);
});

const withdrawFromEvent = asyncHandler(async (req, res) => {
    const result = await registrationService.withdrawFromEvent({
        eventId: req.params.id,
        userId: req.user._id
    });
    res.json(result);
});

const createTeam = asyncHandler(async (req, res) => {
    const team = await registrationService.createTeam({
        eventId: req.params.id,
        userId: req.user._id,
        teamName: req.body.teamName
    });
    res.status(201).json(team);
});

const joinTeam = asyncHandler(async (req, res) => {
    const team = await registrationService.joinTeam({
        eventId: req.params.id,
        userId: req.user._id,
        invitationCode: req.body.invitationCode
    });
    res.json(team);
});

const leaveTeam = asyncHandler(async (req, res) => {
    const result = await registrationService.leaveTeam({
        eventId: req.params.id,
        userId: req.user._id
    });

    res.json(result);
});

const removeTeamMember = asyncHandler(async (req, res) => {
    const team = await registrationService.removeTeamMember({
        eventId: req.params.id,
        leaderId: req.user._id,
        memberId: req.body.memberId
    });

    res.json(team);
});

const updateTeamName = asyncHandler(async (req, res) => {
    const team = await registrationService.updateTeamName({
        eventId: req.params.id,
        leaderId: req.user._id,
        teamName: req.body.teamName
    });

    res.json(team);
});

const getMyCertificates = asyncHandler(async (req, res) => {
    const certificates = await certificateService.getUserCertificates(req.user._id);
    res.json(certificates);
});

const downloadCertificate = asyncHandler(async (req, res) => {
    const pdfBuffer = await certificateService.downloadCertificatePDF({
        eventId: req.params.eventId,
        userId: req.user._id,
        type: req.params.type
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${req.params.type}.pdf"`);
    res.send(pdfBuffer);
});

const getHistory = asyncHandler(async (req, res) => {
    const history = await registrationService.getParticipationHistory(req.user._id);
    res.json(history);
});

module.exports = {
    registerParticipant,
    verifyParticipantOtp,
    getAvailableEvents,
    getMyEvents,
    getAchievements,
    registerForEvent,
    withdrawFromEvent,
    createTeam,
    joinTeam,
    leaveTeam,
    removeTeamMember,
    updateTeamName,
    getMyCertificates,
    downloadCertificate,
    getHistory
};
