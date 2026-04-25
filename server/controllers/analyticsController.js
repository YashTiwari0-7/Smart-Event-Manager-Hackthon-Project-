const eventService = require('../services/eventService');
const analyticsService = require('../services/analyticsService');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES } = require('../utils/authConstants');

const getEventAnalytics = asyncHandler(async (req, res) => {
    if (req.user.role === ROLES.COORDINATOR) {
        await eventService.getAssignedEvent(req.params.id, req.user._id);
    }

    const analytics = await analyticsService.getEventAnalytics(req.params.id);

    res.json(analytics);
});

const getOverallAnalytics = asyncHandler(async (req, res) => {
    const analytics = await analyticsService.getOverallAnalytics();

    res.json(analytics);
});

const getCoordinatorAnalytics = asyncHandler(async (req, res) => {
    const analytics = await analyticsService.getCoordinatorAnalytics(req.params.id);

    res.json(analytics);
});

module.exports = {
    getEventAnalytics,
    getOverallAnalytics,
    getCoordinatorAnalytics
};
