const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const socketManager = require('../socketManager/socketManager');

// 1. Get user notifications
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate('sender', 'firstName lastName photo role')
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 2. Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient: req.user._id },
            { isRead: true },
            { new: true }
        );
        res.json(notification);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 3. Mark all as read
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { isRead: true }
        );
        res.json({ message: 'Institutional alerts synchronized' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 4. Delete notification
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findOneAndDelete({ _id: id, recipient: req.user._id });
        res.json({ message: 'Alert de-localized from registry' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// INTERNAL HELPER: Send Notification
exports.sendNotification = async ({ schoolId, recipient, sender, type, title, message, link }) => {
    try {
        const notification = await Notification.create({
            schoolId, recipient, sender, type, title, message, link
        });
        
        const populated = await notification.populate('sender', 'firstName lastName photo role');
        
        // Real-time broadcast
        socketManager.sendToUser(recipient, 'new_notification', populated);
        
        return populated;
    } catch (err) {
        console.error('Notification dispatch failure:', err.message);
    }
};
