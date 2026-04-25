const express = require('express');
const router = express.Router();

const {
    getEventAnalytics,
    getOverallAnalytics,
    getCoordinatorAnalytics
} = require('../controllers/analyticsController');

const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(verifyToken, authorizeRoles('admin', 'coordinator'));

router.get('/overall', getOverallAnalytics);
router.get('/event/:id', getEventAnalytics);
router.get('/coordinator/:id', getCoordinatorAnalytics);

module.exports = router;
