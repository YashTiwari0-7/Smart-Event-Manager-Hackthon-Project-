const express = require('express');
const router = express.Router();

const {
    getAssignedEvents,
    getAssignedEventById,
    configureEventSettings,
    getEventParticipants,
    endRegistration,
    startEvent,
    getAttendance,
    markAttendance,
    endEvent,
    saveResult,
    generateCertificates,
    exportParticipationList,
    getCoordinatorStats
} = require('../controllers/coordinatorController');

const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(verifyToken, authorizeRoles('coordinator'));

router.get('/stats', getCoordinatorStats);
router.get('/events', getAssignedEvents);
router.get('/event/:id', getAssignedEventById);
router.put('/event/:id/config', configureEventSettings);
router.get('/event/:id/participants', getEventParticipants);
router.post('/event/:id/end-registration', endRegistration);
router.post('/event/:id/start', startEvent);
router.get('/event/:id/attendance', getAttendance);
router.post('/event/:id/attendance', markAttendance);
router.post('/event/:id/end', endEvent);
router.post('/event/:id/result', saveResult);
router.post('/event/:id/generate-certificates', generateCertificates);
router.get('/event/:id/export', exportParticipationList);

module.exports = router;
