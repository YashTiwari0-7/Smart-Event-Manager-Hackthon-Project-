const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
    {
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        markedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        attended: {
            type: Boolean,
            default: true
        },
        markedAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

attendanceSchema.index({ event: 1, user: 1 }, { unique: true });
attendanceSchema.index({ event: 1, attended: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
