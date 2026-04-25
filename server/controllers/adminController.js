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

const updateEvent = asyncHandler(async (req, res) => {
    const event = await eventService.updateEvent(req.params.id, req.body);

    res.json(event);
});

const deleteEvent = asyncHandler(async (req, res) => {
    await eventService.deleteEvent(req.params.id);

    res.json({ message: 'Event deleted successfully' });
});

const getPendingCoordinators = asyncHandler(async (req, res) => {
    const coordinators = await eventService.getPendingCoordinators();

    res.json(coordinators);
});

const approveCoordinator = asyncHandler(async (req, res) => {
    const coordinator = await eventService.approveCoordinator(req.params.id);

    res.json({
        message: 'Coordinator approved successfully',
        coordinator
    });
});

module.exports = {
    createEvent,
    getAllEvents,
    updateEvent,
    deleteEvent,
    getPendingCoordinators,
    approveCoordinator
};
