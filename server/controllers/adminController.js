const eventService = require('../services/eventService');
const asyncHandler = require('../utils/asyncHandler');

const createEvent = asyncHandler(async (req, res) => {
    const event = await eventService.createEvent(req.body, req.user._id);

    res.status(201).json(event);
});

const getAllEvents = asyncHandler(async (req, res) => {
    const events = await eventService.getAllEvents();

    res.json(events);
});

const getEventById = asyncHandler(async (req, res) => {
    const event = await eventService.getEventById(req.params.id);

    res.json(event);
});

const updateEvent = asyncHandler(async (req, res) => {
    const event = await eventService.updateEvent(req.params.id, req.body);

    res.json(event);
});

const deleteEvent = asyncHandler(async (req, res) => {
    await eventService.deleteEvent(req.params.id);

    res.json({ message: 'Event deleted successfully' });
});

const getEventParticipants = asyncHandler(async (req, res) => {
    const participants = await eventService.getEventParticipantsForAdmin(req.params.id);

    res.json(participants);
});

const getPendingCoordinators = asyncHandler(async (req, res) => {
    const coordinators = await eventService.getPendingCoordinators();

    res.json(coordinators);
});

const getApprovedCoordinators = asyncHandler(async (req, res) => {
    const coordinators = await eventService.getApprovedCoordinators();

    res.json(coordinators);
});

const getAllCoordinators = asyncHandler(async (req, res) => {
    const coordinators = await eventService.getAllCoordinators();

    res.json(coordinators);
});

const approveCoordinator = asyncHandler(async (req, res) => {
    const coordinator = await eventService.approveCoordinator(req.params.id);

    res.json({
        message: 'Coordinator approved successfully',
        coordinator
    });
});

const createCoordinator = asyncHandler(async (req, res) => {
    const coordinator = await eventService.createCoordinatorByAdmin(req.body);

    res.status(201).json({
        message: 'Coordinator created successfully. Credentials sent via email.',
        coordinator
    });
});

const deleteCoordinator = asyncHandler(async (req, res) => {
    await eventService.deleteCoordinator(req.params.id);

    res.json({ message: 'Coordinator deleted successfully' });
});

const getCoordinatorDetails = asyncHandler(async (req, res) => {
    const details = await eventService.getCoordinatorDetails(req.params.id);

    res.json(details);
});

const getAdminStats = asyncHandler(async (req, res) => {
    const stats = await eventService.getAdminStats();

    res.json(stats);
});

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    getEventParticipants,
    getPendingCoordinators,
    getApprovedCoordinators,
    getAllCoordinators,
    approveCoordinator,
    createCoordinator,
    deleteCoordinator,
    getCoordinatorDetails,
    getAdminStats
};
