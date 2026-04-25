const nodemailer = require('nodemailer');
const AppError = require('../utils/appError');

const createTransporter = () => {
    if (!process.env.EMAIL_SEND || !process.env.EMAIL_PASS) {
        throw new AppError('Email credentials are not configured', 500);
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_SEND,
            pass: process.env.EMAIL_PASS
        }
    });
};

const sendOtpEmail = async ({ to, otp, subject = 'Registration OTP', label = 'registration' }) => {
    const transporter = createTransporter();

    await transporter.sendMail({
        from: process.env.EMAIL_SEND,
        to,
        subject,
        text: `Your ${label} OTP is ${otp}. It is valid for 10 minutes.`
    });
};

const sendCoordinatorApprovalRequestEmail = async ({ to, coordinator }) => {
    const transporter = createTransporter();

    await transporter.sendMail({
        from: process.env.EMAIL_SEND,
        to,
        subject: 'Coordinator Approval Request',
        text: [
            'A new coordinator request is awaiting approval.',
            `Name: ${coordinator.name}`,
            `Email: ${coordinator.email}`,
            `Designation: ${coordinator.designation || ''}`,
            `Institution: ${coordinator.institutionName || ''}`,
            `Phone: ${coordinator.phoneNumber || ''}`
        ].join('\n')
    });
};

module.exports = {
    sendOtpEmail,
    sendCoordinatorApprovalRequestEmail
};
