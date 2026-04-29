const eventService = require('../services/eventService');
const coordinatorService = require('../services/coordinatorService');
const asyncHandler = require('../utils/asyncHandler');

const getAssignedEvents = asyncHandler(async (req, res) => {
    const events = await eventService.getAssignedEvents(req.user._id);

    res.json(events);
});

const getAssignedEventById = asyncHandler(async (req, res) => {
    const event = await eventService.getAssignedEventById(req.params.id, req.user._id);

    res.json(event);
});

const configureEventSettings = asyncHandler(async (req, res) => {
    const event = await eventService.configureAssignedEvent(req.params.id, req.user._id, req.body);

    res.json(event);
});

const getEventParticipants = asyncHandler(async (req, res) => {
    const participants = await eventService.getEventParticipants(req.params.id, req.user._id);

    res.json(participants);
});

const getEventTeams = asyncHandler(async (req, res) => {
    const teams = await eventService.getEventTeams(req.params.id, req.user._id);

    res.json(teams);
});

const endRegistration = asyncHandler(async (req, res) => {
    const result = await coordinatorService.endRegistration({
        eventId: req.params.id,
        coordinatorId: req.user._id
    });

    res.json(result);
});

const startEvent = asyncHandler(async (req, res) => {
    const result = await coordinatorService.startEvent({
        eventId: req.params.id,
        coordinatorId: req.user._id
    });

    res.json(result);
});

const getAttendance = asyncHandler(async (req, res) => {
    const attendance = await coordinatorService.getAttendance({
        eventId: req.params.id,
        coordinatorId: req.user._id
    });

    res.json(attendance);
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

const exportParticipationList = asyncHandler(async (req, res) => {
    const format = req.query.format || 'csv';
    
    if (format === 'pdf') {
        const pdfBuffer = await coordinatorService.exportParticipationListPDF({
            eventId: req.params.id,
            coordinatorId: req.user._id
        });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="event-${req.params.id}-participants.pdf"`);
        return res.send(pdfBuffer);
    }

    const csv = await coordinatorService.exportParticipationListCSV({
        eventId: req.params.id,
        coordinatorId: req.user._id
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="event-${req.params.id}-participants.csv"`);
    res.send(csv);
});

const getCoordinatorStats = asyncHandler(async (req, res) => {
    const stats = await coordinatorService.getCoordinatorStats(req.user._id);

    res.json(stats);
});

module.exports = {
    getAssignedEvents,
    getAssignedEventById,
    configureEventSettings,
    getEventParticipants,
    getEventTeams,
    endRegistration,
    startEvent,
    getAttendance,
    markAttendance,
    endEvent,
    saveResult,
    generateCertificates,
    exportParticipationList,
    getCoordinatorStats
};
