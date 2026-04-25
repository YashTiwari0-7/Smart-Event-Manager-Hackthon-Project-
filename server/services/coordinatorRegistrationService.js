const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const CoordinatorOtp = require('../models/coordinatorOtpModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const { getMasterAdmin, ROLES } = require('../utils/authConstants');
const {
    sendOtpEmail,
    sendCoordinatorApprovalRequestEmail
} = require('./emailService');

const OTP_EXPIRY_MINUTES = 10;

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString();
};

const requestCoordinatorRegistration = async (data) => {
    const {
        name,
        age,
        gender,
        designation,
        email,
        phoneNumber,
        institutionName,
        password
    } = data;

    if (!name || !age || !gender || !designation || !email || !phoneNumber || !institutionName) {
        throw new AppError('All coordinator registration fields are required', 400);
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ email: normalizedEmail }).select('_id');

    if (existingUser) {
        throw new AppError('User already exists', 400);
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const passwordHash = password ? await bcrypt.hash(String(password), 10) : otpHash;
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await CoordinatorOtp.findOneAndUpdate(
        { email: normalizedEmail },
        {
            name,
            age,
            gender,
            designation,
            email: normalizedEmail,
            phoneNumber,
            institutionName,
            otpHash,
            passwordHash,
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
        subject: 'Coordinator Registration OTP',
        label: 'coordinator registration'
    });

    return { message: 'OTP sent successfully' };
};

const verifyCoordinatorOtp = async ({ email, otp }) => {
    if (!email || !otp) {
        throw new AppError('Email and OTP are required', 400);
    }

    const normalizedEmail = normalizeEmail(email);
    const pendingRequest = await CoordinatorOtp.findOne({ email: normalizedEmail });

    if (!pendingRequest) {
        throw new AppError('OTP request not found or expired', 404);
    }

    if (pendingRequest.expiresAt < new Date()) {
        await pendingRequest.deleteOne();
        throw new AppError('OTP expired', 400);
    }

    const isOtpValid = await bcrypt.compare(String(otp), pendingRequest.otpHash);

    if (!isOtpValid) {
        throw new AppError('Invalid OTP', 400);
    }

    const existingUser = await User.findOne({ email: normalizedEmail }).select('_id');

    if (existingUser) {
        throw new AppError('User already exists', 400);
    }

    const coordinator = await User.create({
        name: pendingRequest.name,
        age: pendingRequest.age,
        gender: pendingRequest.gender,
        designation: pendingRequest.designation,
        email: pendingRequest.email,
        phoneNumber: pendingRequest.phoneNumber,
        institutionName: pendingRequest.institutionName,
        password: pendingRequest.passwordHash,
        role: ROLES.COORDINATOR,
        isApproved: false
    });

    const masterAdmin = getMasterAdmin();

    if (masterAdmin.email) {
        await sendCoordinatorApprovalRequestEmail({
            to: masterAdmin.email,
            coordinator
        });
    }

    await pendingRequest.deleteOne();

    return {
        message: 'Coordinator verification completed. Awaiting admin approval.',
        coordinator: {
            _id: coordinator._id,
            name: coordinator.name,
            email: coordinator.email,
            role: coordinator.role,
            isApproved: coordinator.isApproved
        }
    };
};

module.exports = {
    requestCoordinatorRegistration,
    verifyCoordinatorOtp
};
