const express = require('express');
const router = express.Router();

const {
    registerParticipant,
    verifyParticipantOtp,
    getAvailableEvents,
    registerForEvent,
    withdrawFromEvent,
    createTeam,
    joinTeam,
    getMyCertificates,
    getHistory
} = require('../controllers/participantController');

const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.post('/register', registerParticipant);
router.post('/verify-otp', verifyParticipantOtp);

router.use(verifyToken, authorizeRoles('participant'));

router.get('/events', getAvailableEvents);
router.post('/event/:id/register', registerForEvent);
router.post('/event/:id/withdraw', withdrawFromEvent);
router.post('/event/:id/team/create', createTeam);
router.post('/event/:id/team/join', joinTeam);
router.get('/certificates', getMyCertificates);
router.get('/history', getHistory);

module.exports = router;
