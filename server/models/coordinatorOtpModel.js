const mongoose = require('mongoose');

const coordinatorOtpSchema = new mongoose.Schema(
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
        designation: {
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
        phoneNumber: {
            type: String,
            required: true,
            trim: true
        },
        institutionName: {
            type: String,
            required: true,
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

coordinatorOtpSchema.index({ email: 1 }, { unique: true });
coordinatorOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('CoordinatorOtp', coordinatorOtpSchema);
