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

const getMyCertificates = asyncHandler(async (req, res) => {
    const certificates = await certificateService.getUserCertificates(req.user._id);

    res.json(certificates);
});

const getHistory = asyncHandler(async (req, res) => {
    const history = await registrationService.getParticipationHistory(req.user._id);

    res.json(history);
});

module.exports = {
    registerParticipant,
    verifyParticipantOtp,
    getAvailableEvents,
    registerForEvent,
    withdrawFromEvent,
    createTeam,
    joinTeam,
    getMyCertificates,
    getHistory
};
