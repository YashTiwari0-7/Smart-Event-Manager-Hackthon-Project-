const express = require('express');
const router = express.Router();

const {
    createEvent,
    getAllEvents,
    updateEvent,
    deleteEvent,
    getPendingCoordinators,
    approveCoordinator
} = require('../controllers/adminController');

const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(verifyToken, authorizeRoles('admin'));

router.post('/event', createEvent);
router.get('/events', getAllEvents);
router.put('/event/:id', updateEvent);
router.delete('/event/:id', deleteEvent);
router.get('/coordinators/pending', getPendingCoordinators);
router.put('/coordinator/approve/:id', approveCoordinator);

module.exports = router;
