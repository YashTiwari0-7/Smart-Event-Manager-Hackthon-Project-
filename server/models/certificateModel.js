const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
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
        type: {
            type: String,
            enum: ['participation', 'achievement'],
            required: true
        },
        url: {
            type: String,
            required: true
        },
        rank: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
);

certificateSchema.index({ user: 1, event: 1, type: 1 }, { unique: true });
certificateSchema.index({ event: 1, type: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);
