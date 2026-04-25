const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/adminController');

const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(verifyToken, authorizeRoles('admin'));

router.get('/stats', getAdminStats);
router.post('/event', createEvent);
router.get('/events', getAllEvents);
router.get('/event/:id', getEventById);
router.put('/event/:id', updateEvent);
router.delete('/event/:id', deleteEvent);
router.get('/event/:id/participants', getEventParticipants);
router.get('/coordinators', getAllCoordinators);
router.get('/coordinators/pending', getPendingCoordinators);
router.get('/coordinators/approved', getApprovedCoordinators);
router.get('/coordinator/:id', getCoordinatorDetails);
router.post('/coordinator/create', createCoordinator);
router.put('/coordinator/approve/:id', approveCoordinator);
router.delete('/coordinator/:id', deleteCoordinator);

module.exports = router;
