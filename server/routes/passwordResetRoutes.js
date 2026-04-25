const express = require('express');
const router = express.Router();

const {
    requestPasswordReset,
    verifyPasswordResetOtp,
    resetPassword
} = require('../controllers/passwordResetController');

router.post('/request', requestPasswordReset);
router.post('/verify-otp', verifyPasswordResetOtp);
router.post('/reset', resetPassword);

module.exports = router;
