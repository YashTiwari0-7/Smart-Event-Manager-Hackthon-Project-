const express = require('express');
const router = express.Router();

const {
    registerParticipant,
    verifyParticipantOtp,
    getAvailableEvents,
    getMyEvents,
    getAchievements,
    registerForEvent,
    withdrawFromEvent,
    createTeam,
    joinTeam,
    leaveTeam,
    removeTeamMember,
    updateTeamName,
    getMyCertificates,
    downloadCertificate,
    getHistory
} = require('../controllers/participantController');

const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.post('/register', registerParticipant);
router.post('/verify-otp', verifyParticipantOtp);

router.use(verifyToken, authorizeRoles('participant'));

router.get('/events', getAvailableEvents);
router.get('/my-events', getMyEvents);
router.get('/achievements', getAchievements);
router.post('/event/:id/register', registerForEvent);
router.post('/event/:id/withdraw', withdrawFromEvent);
router.post('/event/:id/team/create', createTeam);
router.post('/event/:id/team/join', joinTeam);
router.post('/event/:id/team/leave', leaveTeam);
router.post('/event/:id/team/remove-member', removeTeamMember);
router.post('/event/:id/team/update-name', updateTeamName);
router.get('/certificates', getMyCertificates);
router.get('/certificate/:eventId/:type', downloadCertificate);
router.get('/history', getHistory);

module.exports = router;
