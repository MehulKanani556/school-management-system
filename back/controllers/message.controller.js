const Message = require('../models/message.model');
const User = require('../models/user.model');
const socketManager = require('../socketManager/socketManager');

// Create an announcement
exports.createAnnouncement = async (req, res) => {
    try {
        const { targetRole, classSection, subject, content } = req.body;
        const schoolId = req.user.schoolId;

        const announcement = await Message.create({
            schoolId,
            sender: req.user._id,
            type: 'Announcement',
            targetRole: targetRole || 'All',
            classSection,
            subject,
            content,
            fileUrl: req.file ? req.file.location : null
        });

        const populated = await announcement.populate('sender', 'firstName lastName photo role');
        
        // Real-time broadcast
        socketManager.broadcastToRole(targetRole, 'new_announcement', populated);

        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a Notice (Notice Board)
exports.createNotice = async (req, res) => {
    try {
        const { subject, content } = req.body;
        const schoolId = req.user.schoolId;

        const notice = await Message.create({
            schoolId,
            sender: req.user._id,
            type: 'Notice',
            targetRole: 'All',
            subject,
            content,
            fileUrl: req.file ? req.file.location : null
        });

        const populated = await notice.populate('sender', 'firstName lastName photo role');
        
        // Real-time broadcast
        socketManager.broadcastNotice('new_notice', populated);

        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Send a direct message to a specific user (e.g. Admin to Teacher)
exports.sendMessage = async (req, res) => {
    try {
        const { recipient, subject, content } = req.body;
        const schoolId = req.user.schoolId;

        const message = await Message.create({
            schoolId,
            sender: req.user._id,
            recipient,
            type: 'DirectMessage',
            targetRole: 'Specific',
            subject,
            content,
            fileUrl: req.file ? req.file.location : null
        });

        const populated = await message.populate([
            { path: 'sender', select: 'firstName lastName photo role' },
            { path: 'recipient', select: 'firstName lastName photo role' }
        ]);
        
        // Real-time send
        socketManager.sendToUser(recipient, 'new_direct_message', populated);

        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all announcements for the school
exports.getAnnouncements = async (req, res) => {
    try {
        const announcements = await Message.find({ 
            schoolId: req.user.schoolId, 
            type: 'Announcement' 
        }).populate('sender', 'firstName lastName photo role').sort({ createdAt: -1 });
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all notices for the school
exports.getNotices = async (req, res) => {
    try {
        const notices = await Message.find({ 
            schoolId: req.user.schoolId, 
            type: 'Notice' 
        }).populate('sender', 'firstName lastName photo role').sort({ createdAt: -1 });
        res.json(notices);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get personal feed (messages/announcements where user is involved)
exports.getMyMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            schoolId: req.user.schoolId,
            $or: [
                { recipient: req.user._id },
                { sender: req.user._id },
                { 
                    type: 'Announcement', 
                    targetRole: { $in: ['All', req.user.role] } 
                }
            ]
        })
        .populate('sender', 'firstName lastName photo role')
        .populate('recipient', 'firstName lastName photo role')
        .sort({ createdAt: -1 });
        
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get available contacts in the school (excluding self and students for now)
exports.getContacts = async (req, res) => {
    try {
        const users = await User.find({ 
            schoolId: req.user.schoolId, 
            _id: { $ne: req.user._id },
            role: { $in: ['School_Admin', 'Teacher'] }
        }).select('firstName lastName photo role');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete a message/announcement
exports.deleteMessage = async (req, res) => {
    try {
        await Message.findOneAndDelete({ _id: req.params.id, schoolId: req.user.schoolId });
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
