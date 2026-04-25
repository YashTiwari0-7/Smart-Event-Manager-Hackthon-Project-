const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: String,

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },

        coordinators: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],

        configOwner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },

        status: {
            type: String,
            enum: ['upcoming', 'ongoing', 'completed'],
            default: 'upcoming'
        },

        participationType: {
            type: String,
            enum: ['individual', 'team']
        },

        maxTeamSize: {
            type: Number,
            default: 0
        },

        totalSlots: {
            type: Number,
            default: 0
        },

        genderSpecification: {
            enabled: {
                type: Boolean,
                default: false
            },
            type: {
                type: String,
                enum: ['male', 'female', 'none'],
                default: 'none'
            },
            minCount: {
                type: Number,
                default: 0
            },
            reservedSlots: {
                type: Number,
                default: 0
            }
        },

        registrationStartDate: Date,
        registrationEndDate: Date,
        eventDate: Date,

        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],

        teams: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Team'
            }
        ],

        winners: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],

        results: {
            winner: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                default: null
            },
            runnerUp: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                default: null
            },
            top3: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            ]
        }
    },
    { timestamps: true }
);

eventSchema.index({ createdBy: 1 });
eventSchema.index({ coordinators: 1 });
eventSchema.index({ configOwner: 1 });
eventSchema.index({ status: 1 });

module.exports = mongoose.model('Event', eventSchema);
