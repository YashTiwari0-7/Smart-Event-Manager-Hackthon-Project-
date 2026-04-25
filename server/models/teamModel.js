const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true
        },
        leader: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        invitationCode: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        capacity: {
            type: Number,
            required: true
        },
        isComplete: {
            type: Boolean,
            default: false
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            }
        ]
    },
    { timestamps: true }
);

teamSchema.index({ event: 1, name: 1 }, { unique: true });
teamSchema.index({ event: 1, members: 1 });
teamSchema.index({ invitationCode: 1 }, { unique: true });

module.exports = mongoose.model('Team', teamSchema);
