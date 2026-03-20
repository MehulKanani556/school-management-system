const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { 
        type: String, 
        enum: ['Assignment', 'Mark', 'Attendance', 'Fee', 'Announcement', 'Leave', 'General'],
        default: 'General'
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String }, // Optional path to redirect
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
