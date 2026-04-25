const express = require('express');
const router = express.Router();

const { getEventAnalytics } = require('../controllers/analyticsController');

const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(verifyToken, authorizeRoles('admin', 'coordinator'));

router.get('/event/:id', getEventAnalytics);

module.exports = router;
