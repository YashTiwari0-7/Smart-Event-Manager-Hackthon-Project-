const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/coordinatorController');

const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.post('/register', registerCoordinator);
router.post('/verify-otp', verifyCoordinatorOtp);

router.use(verifyToken, authorizeRoles('coordinator'));

router.get('/events', getAssignedEvents);
router.put('/event/:id/config', configureEventSettings);
router.post('/event/:id/start', startEvent);
router.post('/event/:id/attendance', markAttendance);
router.post('/event/:id/end', endEvent);
router.post('/event/:id/result', saveResult);
router.post('/event/:id/generate-certificates', generateCertificates);
router.get('/event/:id/participants', getEventParticipants);
router.get('/event/:id/export', exportParticipationList);

module.exports = router;
