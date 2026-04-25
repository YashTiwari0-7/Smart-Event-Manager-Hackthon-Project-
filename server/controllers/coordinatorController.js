const eventService = require('../services/eventService');
const coordinatorService = require('../services/coordinatorService');
const coordinatorRegistrationService = require('../services/coordinatorRegistrationService');
const asyncHandler = require('../utils/asyncHandler');

const registerCoordinator = asyncHandler(async (req, res) => {
    const result = await coordinatorRegistrationService.requestCoordinatorRegistration(req.body);

    res.status(200).json(result);
});

const verifyCoordinatorOtp = asyncHandler(async (req, res) => {
    const result = await coordinatorRegistrationService.verifyCoordinatorOtp(req.body);

    res.status(201).json(result);
});

const getAssignedEvents = asyncHandler(async (req, res) => {
    const events = await eventService.getAssignedEvents(req.user._id);

    res.json(events);
});

const configureEventSettings = asyncHandler(async (req, res) => {
    const event = await eventService.configureAssignedEvent(req.params.id, req.user._id, req.body);

    res.json(event);
});

const startEvent = asyncHandler(async (req, res) => {
    const result = await coordinatorService.startEvent({
        eventId: req.params.id,
        coordinatorId: req.user._id
    });

    res.json(result);
});

const markAttendance = asyncHandler(async (req, res) => {
    const attendance = await coordinatorService.markAttendance({
        eventId: req.params.id,
        coordinatorId: req.user._id,
        userIds: req.body.userIds || []
    });

    res.json(attendance);
});

const endEvent = asyncHandler(async (req, res) => {
    const result = await coordinatorService.endEvent({
        eventId: req.params.id,
        coordinatorId: req.user._id
    });

    res.json(result);
});

const saveResult = asyncHandler(async (req, res) => {
    const event = await coordinatorService.saveResult({
        eventId: req.params.id,
        coordinatorId: req.user._id,
        winner: req.body.winner,
        runnerUp: req.body.runnerUp,
        top3: req.body.top3 || []
    });

    res.json(event);
});

const generateCertificates = asyncHandler(async (req, res) => {
    const certificates = await coordinatorService.generateEventCertificates({
        eventId: req.params.id,
        coordinatorId: req.user._id
    });

    res.status(201).json(certificates);
});

const getEventParticipants = asyncHandler(async (req, res) => {
    const participants = await eventService.getEventParticipants(req.params.id, req.user._id);

    res.json(participants);
});

const exportParticipationList = asyncHandler(async (req, res) => {
    const csv = await coordinatorService.exportParticipationList({
        eventId: req.params.id,
        coordinatorId: req.user._id
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="event-${req.params.id}-participants.csv"`);
    res.send(csv);
});

module.exports = {
    registerCoordinator,
    verifyCoordinatorOtp,
    getAssignedEvents,
    configureEventSettings,
    startEvent,
    markAttendance,
    endEvent,
    saveResult,
    generateCertificates,
    getEventParticipants,
    exportParticipationList
};
