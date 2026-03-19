const Message = require('../models/message.model');
const User = require('../models/user.model');

// Create a broad announcement or notice
exports.createAnnouncement = async (req, res) => {
    try {
        const { targetRole, classSection, subject, content } = req.body;
        const schoolId = req.user.schoolId;

        const announcement = await Message.create({
            schoolId,
            sender: req.user._id,
            targetRole,
            classSection,
            subject,
            content,
            fileUrl: req.file ? req.file.location : null
        });

        res.status(201).json(announcement);
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
            subject,
            content,
            fileUrl: req.file ? req.file.location : null
        });

        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all announcements/notices for the school
exports.getAnnouncements = async (req, res) => {
    try {
        const announcements = await Message.find({ 
            schoolId: req.user.schoolId, 
            recipient: { $exists: false } 
        }).populate('sender', 'firstName lastName photo role');
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get personal messages for the user
exports.getMyMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            schoolId: req.user.schoolId,
            $or: [
                { recipient: req.user._id },
                { sender: req.user._id, recipient: { $exists: true } }
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

// Delete a message/announcement
exports.deleteMessage = async (req, res) => {
    try {
        await Message.findOneAndDelete({ _id: req.params.id, schoolId: req.user.schoolId });
        res.json({ message: 'Message deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
