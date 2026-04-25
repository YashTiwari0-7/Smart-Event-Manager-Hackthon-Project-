const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        age: {
            type: Number
        },
        designation: {
            type: String,
            trim: true
        },
        phoneNumber: {
            type: String,
            trim: true
        },
        mobileNumber: {
            type: String,
            trim: true
        },
        institutionName: {
            type: String,
            trim: true
        },
        institution: {
            type: String,
            trim: true
        },
        course: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['admin', 'coordinator', 'participant'],
            default: 'participant'
        },
        isApproved: {
            type: Boolean,
            default: function () {
                return this.role !== 'coordinator';
            }
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other']
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
