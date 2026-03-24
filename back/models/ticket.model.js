const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
    },
    openedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium',
    },
    status: {
        type: String,
        enum: ['Open', 'In_Progress', 'Resolved', 'Closed'],
        default: 'Open',
    },
    category: {
        type: String,
        enum: ['Technical', 'Billing', 'Feature_Request', 'Account', 'Other'],
        default: 'Technical',
    },
    replies: [{
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        message: String,
        createdAt: {
            type: Date,
            default: Date.now,
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

ticketSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
