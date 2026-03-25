const Message = require('../models/message.model');
const User = require('../models/user.model');
const Student = require('../models/student.model');
const socketManager = require('../socketManager/socketManager');
const nc = require('./notification.controller');

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
        
        // Institutional Alerts (Notifications)
        // We broadcast to all connected sockets for general announcements
        socketManager.broadcastToRole(targetRole, 'NEW_NOTIFICATION', {
            _id: announcement._id,
            title: `Broadcast: ${subject}`,
            message: content.substring(0, 50) + '...',
            type: 'Announcement',
            createdAt: new Date(),
            sender: populated.sender,
            link: '/parent'
        });

        // Real-time broadcast for dedicated announcement feed
        socketManager.broadcastToRole(targetRole, 'NEW_ANNOUNCEMENT', populated);

        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a Notice (Notice Board)
exports.createNotice = async (req, res) => {
    try {
        const { subject, content, classSection } = req.body;
        const schoolId = req.user.schoolId;

        const notice = await Message.create({
            schoolId,
            sender: req.user._id,
            type: 'Notice',
            targetRole: classSection ? 'Specific' : 'All',
            classSection: classSection || null,
            subject,
            content,
            fileUrl: req.file ? req.file.location : null
        });

        const populated = await notice.populate('sender', 'firstName lastName photo role');
        
        // Real-time broadcast
        if (classSection) {
            socketManager.sendToClass(classSection, 'NEW_NOTICE', populated);
        } else {
            socketManager.broadcastNotice('NEW_NOTICE', populated);
        }

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
        socketManager.sendToUser(recipient, 'NEW_MESSAGE', {
            ...populated.toJSON(),
            senderName: `${populated.sender.firstName} ${populated.sender.lastName}`
        });

        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all announcements for the school (with role-based filtering)
exports.getAnnouncements = async (req, res) => {
    try {
        const query = { 
            schoolId: req.user.schoolId, 
            type: 'Announcement' 
        };

        // If not school admin, filter by target role
        if (!['School_Admin', 'Super_Admin'].includes(req.user.role)) {
            query.targetRole = { $in: ['All', req.user.role] };
        }

        const announcements = await Message.find(query)
            .populate('sender', 'firstName lastName photo role')
            .sort({ createdAt: -1 });
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all notices for the school (with class filtering for students/parents)
exports.getNotices = async (req, res) => {
    try {
        const query = { 
            schoolId: req.user.schoolId, 
            type: 'Notice' 
        };

        // If student, only show school-wide notices or their own class notices
        if (req.user.role === 'Student') {
            const student = await Student.findOne({ userId: req.user._id });
            if (student) {
                query.$or = [
                    { classSection: null }, 
                    { classSection: student.classSection }
                ];
            }
        } 
        // If parent, show notices for all children's classes
        else if (req.user.role === 'Parent') {
            const children = await Student.find({ parentId: req.user._id });
            const classIds = children.map(c => c.classSection).filter(id => id);
            query.$or = [
                { classSection: null },
                { classSection: { $in: classIds } }
            ];
        }

        const notices = await Message.find(query)
            .populate('sender', 'firstName lastName photo role')
            .sort({ createdAt: -1 });
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

// Get specific chat history between two users with pagination
exports.getChatHistory = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = 50;
        const skip = (page - 1) * limit;

        const messages = await Message.find({
            schoolId: req.user.schoolId,
            type: 'DirectMessage',
            $or: [
                { sender: req.user._id, recipient: otherUserId },
                { sender: otherUserId, recipient: req.user._id }
            ]
        })
        .populate('sender', 'firstName lastName photo role')
        .populate('recipient', 'firstName lastName photo role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get available contacts in the school (excluding self and students for now)
exports.getContacts = async (req, res) => {
    try {
        const query = { 
            schoolId: req.user.schoolId, 
            _id: { $ne: req.user._id }
        };
        
        // Role-based contact filtering
        if (req.user.role === 'Teacher') {
            query.role = { $in: ['School_Admin', 'Teacher', 'Student', 'Parent', 'Transport_Manager'] };
        } else if (req.user.role === 'Transport_Manager') {
            query.role = { $in: ['School_Admin', 'Parent'] };
        } else {
            // Default restricted contacts for other roles
            query.role = { $in: ['School_Admin', 'Teacher', 'Transport_Manager'] };
        }

        const users = await User.find(query).select('firstName lastName photo role');
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
