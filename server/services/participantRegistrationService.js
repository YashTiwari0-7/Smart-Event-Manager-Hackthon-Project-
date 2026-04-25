const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const ParticipantOtp = require('../models/participantOtpModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const { ROLES } = require('../utils/authConstants');
const { sendOtpEmail } = require('./emailService');

const OTP_EXPIRY_MINUTES = 10;

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString();
};

const requestParticipantRegistration = async (data) => {
    const {
        name,
        age,
        gender,
        institution,
        course,
        mobileNumber,
        email,
        password
    } = data;

    if (!name || !age || !gender || !institution || !course || !mobileNumber || !email) {
        throw new AppError('All participant registration fields are required', 400);
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

    await ParticipantOtp.findOneAndUpdate(
        { email: normalizedEmail },
        {
            name,
            age,
            gender,
            institution,
            course,
            mobileNumber,
            email: normalizedEmail,
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
        subject: 'Participant Registration OTP',
        label: 'participant registration'
    });

    return { message: 'OTP sent successfully' };
};

const verifyParticipantOtp = async ({ email, otp }) => {
    if (!email || !otp) {
        throw new AppError('Email and OTP are required', 400);
    }

    const normalizedEmail = normalizeEmail(email);
    const pendingRequest = await ParticipantOtp.findOne({ email: normalizedEmail });

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

    const participant = await User.create({
        name: pendingRequest.name,
        age: pendingRequest.age,
        gender: pendingRequest.gender,
        institution: pendingRequest.institution,
        institutionName: pendingRequest.institution,
        course: pendingRequest.course,
        mobileNumber: pendingRequest.mobileNumber,
        phoneNumber: pendingRequest.mobileNumber,
        email: pendingRequest.email,
        password: pendingRequest.passwordHash,
        role: ROLES.PARTICIPANT,
        isApproved: true
    });

    await pendingRequest.deleteOne();

    return {
        message: 'Participant registered successfully',
        participant: {
            _id: participant._id,
            name: participant.name,
            email: participant.email,
            role: participant.role,
            isApproved: participant.isApproved
        }
    };
};

module.exports = {
    requestParticipantRegistration,
    verifyParticipantOtp
};
