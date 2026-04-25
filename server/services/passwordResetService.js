const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const PasswordResetOtp = require('../models/passwordResetOtpModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const { getMasterAdmin, ROLES } = require('../utils/authConstants');
const { sendOtpEmail } = require('./emailService');

const OTP_EXPIRY_MINUTES = 10;

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * Step 1: Request password reset — sends OTP to registered email
 * Only for participant and coordinator roles
 */
const requestPasswordReset = async ({ email }) => {
    if (!email) {
        throw new AppError('Email is required', 400);
    }

    const normalizedEmail = normalizeEmail(email);

    // Block admin password reset
    const masterAdmin = getMasterAdmin();
    const masterAdminEmail = masterAdmin.email ? String(masterAdmin.email).trim().toLowerCase() : null;

    if (masterAdminEmail && normalizedEmail === masterAdminEmail) {
        throw new AppError('Password reset is not available for admin accounts', 403);
    }

    const user = await User.findOne({ email: normalizedEmail }).select('role');

    if (!user) {
        throw new AppError('No account found with this email', 404);
    }

    if (user.role === ROLES.ADMIN) {
        throw new AppError('Password reset is not available for admin accounts', 403);
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await PasswordResetOtp.findOneAndUpdate(
        { email: normalizedEmail },
        {
            email: normalizedEmail,
            otpHash,
            expiresAt
        },
        {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
        }
    );

    await sendOtpEmail({
        to: normalizedEmail,
        otp,
        subject: 'Password Reset OTP - Smart Event Manager',
        label: 'password reset'
    });

    return { message: 'OTP sent to your registered email' };
};

/**
 * Step 2: Verify OTP
 */
const verifyPasswordResetOtp = async ({ email, otp }) => {
    if (!email || !otp) {
        throw new AppError('Email and OTP are required', 400);
    }

    const normalizedEmail = normalizeEmail(email);
    const resetRequest = await PasswordResetOtp.findOne({ email: normalizedEmail });

    if (!resetRequest) {
        throw new AppError('OTP request not found. Please request a new OTP.', 404);
    }

    if (resetRequest.expiresAt < new Date()) {
        await resetRequest.deleteOne();
        throw new AppError('OTP expired. Please request a new OTP.', 400);
    }

    const isOtpValid = await bcrypt.compare(String(otp), resetRequest.otpHash);

    if (!isOtpValid) {
        throw new AppError('Invalid OTP', 400);
    }

    return { message: 'OTP verified successfully', verified: true };
};

/**
 * Step 3: Reset password after OTP verification
 */
const resetPassword = async ({ email, otp, newPassword }) => {
    if (!email || !otp || !newPassword) {
        throw new AppError('Email, OTP and new password are required', 400);
    }

    if (String(newPassword).length < 6) {
        throw new AppError('Password must be at least 6 characters', 400);
    }

    const normalizedEmail = normalizeEmail(email);
    const resetRequest = await PasswordResetOtp.findOne({ email: normalizedEmail });

    if (!resetRequest) {
        throw new AppError('OTP request not found. Please request a new OTP.', 404);
    }

    if (resetRequest.expiresAt < new Date()) {
        await resetRequest.deleteOne();
        throw new AppError('OTP expired. Please request a new OTP.', 400);
    }

    const isOtpValid = await bcrypt.compare(String(otp), resetRequest.otpHash);

    if (!isOtpValid) {
        throw new AppError('Invalid OTP', 400);
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(String(newPassword), salt);
    await user.save();

    await resetRequest.deleteOne();

    return { message: 'Password reset successfully. You can now login with your new password.' };
};

module.exports = {
    requestPasswordReset,
    verifyPasswordResetOtp,
    resetPassword
};
