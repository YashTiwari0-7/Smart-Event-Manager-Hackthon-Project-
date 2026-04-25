const mongoose = require('mongoose');

const participantOtpSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        age: {
            type: Number,
            required: true
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            required: true
        },
        institution: {
            type: String,
            required: true,
            trim: true
        },
        course: {
            type: String,
            required: true,
            trim: true
        },
        mobileNumber: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        otpHash: {
            type: String,
            required: true
        },
        passwordHash: {
            type: String
        },
        expiresAt: {
            type: Date,
            required: true
        }
    },
    { timestamps: true }
);

participantOtpSchema.index({ email: 1 }, { unique: true });
participantOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('ParticipantOtp', participantOtpSchema);
