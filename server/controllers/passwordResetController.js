const passwordResetService = require('../services/passwordResetService');
const asyncHandler = require('../utils/asyncHandler');

const requestPasswordReset = asyncHandler(async (req, res) => {
    const result = await passwordResetService.requestPasswordReset(req.body);

    res.status(200).json(result);
});

const verifyPasswordResetOtp = asyncHandler(async (req, res) => {
    const result = await passwordResetService.verifyPasswordResetOtp(req.body);

    res.status(200).json(result);
});

const resetPassword = asyncHandler(async (req, res) => {
    const result = await passwordResetService.resetPassword(req.body);

    res.status(200).json(result);
});

module.exports = {
    requestPasswordReset,
    verifyPasswordResetOtp,
    resetPassword
};
