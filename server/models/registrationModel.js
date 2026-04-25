const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true
        },
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            default: null
        },
        status: {
            type: String,
            enum: ['registered', 'withdrawn'],
            default: 'registered'
        }
    },
    { timestamps: true }
);

registrationSchema.index({ user: 1, event: 1 }, { unique: true });
registrationSchema.index({ event: 1, status: 1 });
registrationSchema.index({ team: 1 });

module.exports = mongoose.model('Registration', registrationSchema);
