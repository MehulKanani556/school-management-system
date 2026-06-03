const Message = require('../models/message.model');
const User = require('../models/user.model');
const Student = require('../models/student.model');
const Vehicle = require('../models/vehicle.model');
const Route = require('../models/route.model');
const Driver = require('../models/driver.model');
const socketManager = require('../socketManager/socketManager');
const nc = require('./notification.controller');

// Helper to enrich Parent and Student profiles with children, grade, and section details
const enrichUserProfiles = async (users, schoolId) => {
    if (!users) return users;
    
    const isArray = Array.isArray(users);
    const userList = isArray ? users : [users];
    
    // 1. Gather all Parent IDs and Student Emails
    const parentIds = [];
    const studentEmails = [];
    
    for (let u of userList) {
        if (!u) continue;
        const role = u.role;
        const email = u.email;
        const id = u._id;
        
        if (role === 'Parent' && id) {
            parentIds.push(id);
        } else if (role === 'Student' && email) {
            studentEmails.push(email);
        }
    }
    
    // 2. Fetch children/students in bulk queries
    let parentToChildrenMap = {};
    let emailToStudentMap = {};
    
    if (parentIds.length > 0) {
        const children = await Student.find({ parentId: { $in: parentIds }, schoolId })
            .populate({
                path: 'classSection',
                populate: { path: 'standardId', select: 'level name' }
            })
            .populate('standard', 'level name')
            .lean();
            
        // Group by parentId
        for (let c of children) {
            if (c.parentId) {
                const pIdStr = c.parentId.toString();
                if (!parentToChildrenMap[pIdStr]) {
                    parentToChildrenMap[pIdStr] = [];
                }
                parentToChildrenMap[pIdStr].push(c);
            }
        }
    }
    
    if (studentEmails.length > 0) {
        const students = await Student.find({ email: { $in: studentEmails }, schoolId })
            .populate({
                path: 'classSection',
                populate: { path: 'standardId', select: 'level name' }
            })
            .populate('standard', 'level name')
            .lean();
            
        for (let s of students) {
            if (s.email) {
                emailToStudentMap[s.email] = s;
            }
        }
    }
    
    // 3. Map back to user objects
    const enrichedList = [];
    for (let u of userList) {
        if (!u) {
            enrichedList.push(u);
            continue;
        }
        const uObj = u.toObject ? u.toObject() : { ...u };
        
        if (uObj.role === 'Parent') {
            const children = parentToChildrenMap[uObj._id.toString()] || [];
            if (children.length > 0) {
                const childStrings = children.map(c => {
                    let grade = '';
                    let sec = '';
                    if (c.classSection) {
                        grade = c.classSection.standardId?.name || c.classSection.standardId?.level || '';
                        sec = c.classSection.sectionLabel || '';
                    }
                    if (!grade && c.standard) {
                        grade = c.standard.name || c.standard.level || '';
                    }
                    const sectionStr = sec ? `-${sec}` : '';
                    const gradeSectionStr = grade ? ` (${grade}${sectionStr})` : '';
                    return `${c.firstName} ${c.lastName}${gradeSectionStr}`;
                });
                uObj.parentInfo = `Parent / ${childStrings.join(', ')}`;
            } else {
                uObj.parentInfo = 'Parent';
            }
        } else if (uObj.role === 'Student') {
            const student = emailToStudentMap[uObj.email];
            if (student) {
                let grade = '';
                let sec = '';
                if (student.classSection) {
                    grade = student.classSection.standardId?.name || student.classSection.standardId?.level || '';
                    sec = student.classSection.sectionLabel || '';
                }
                if (!grade && student.standard) {
                    grade = student.standard.name || student.standard.level || '';
                }
                const sectionStr = sec ? `-${sec}` : '';
                uObj.studentInfo = grade ? `${grade}${sectionStr}` : '';
            }
        }
        enrichedList.push(uObj);
    }
    
    return isArray ? enrichedList : enrichedList[0];
};

// Create an announcement
exports.createAnnouncement = async (req, res) => {
    try {
        const { targetRole, classSection, subject, content, academicYearId, schoolId: providedSchoolId } = req.body;
        const schoolId = req.user.role === 'Super_Admin' ? (providedSchoolId || null) : req.user.schoolId;

        const announcement = await Message.create({
            schoolId,
            sender: req.user._id,
            type: 'Announcement',
            targetRole: targetRole || 'All',
            classSection,
            subject,
            content,
            academicYearId: academicYearId || req.academicYearId,
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
        const { subject, content, classSection, academicYearId } = req.body;
        const schoolId = req.user.schoolId;

        const notice = await Message.create({
            schoolId,
            sender: req.user._id,
            type: 'Notice',
            targetRole: classSection ? 'Specific' : 'All',
            classSection: classSection || null,
            subject,
            content,
            academicYearId: academicYearId || req.academicYearId,
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
        const { recipient, recipientId, subject, content, type, targetRole, classSection, academicYearId, schoolId: providedSchoolId } = req.body;
        const schoolId = req.user.role === 'Super_Admin' ? (providedSchoolId || null) : req.user.schoolId;
        const fileUrl = req.file ? req.file.location : null;

        const finalType = recipient || recipientId ? 'DirectMessage' : (type || 'Announcement');
        const message = await Message.create({
            schoolId,
            sender: req.user._id,
            recipient: recipient || recipientId || null,
            type: finalType,
            targetRole: classSection ? 'Specific' : (targetRole || 'All'),
            classSection: classSection || null,
            subject: subject || (finalType === 'DirectMessage' ? 'Direct Message' : 'Announcement'),
            content,
            academicYearId: academicYearId || req.academicYearId,
            fileUrl
        });

        const populated = await message.populate([
            { path: 'sender', select: 'firstName lastName photo role' },
            { path: 'recipient', select: 'firstName lastName photo role' }
        ]);
        
        // Real-time notification logic
        if (finalType === 'DirectMessage') {
            socketManager.sendToUser(recipient || recipientId, 'NEW_MESSAGE', {
                ...populated.toJSON(),
                senderName: `${populated.sender.firstName} ${populated.sender.lastName}`
            });
            await nc.sendNotification({
                schoolId,
                recipient: recipient || recipientId,
                sender: req.user._id,
                type: 'Message',
                title: `New Message from ${populated.sender.firstName} ${populated.sender.lastName}`,
                message: content.length > 60 ? content.substring(0, 60) + '...' : content,
                link: '/communication?tab=messages'
            });
        } else if (finalType === 'Notice') {
            if (classSection) {
                socketManager.sendToClass(classSection, 'NEW_NOTICE', populated);
            } else {
                socketManager.broadcastNotice('NEW_NOTICE', populated);
            }
        } else {
            socketManager.broadcastToRole(targetRole || 'All', 'NEW_ANNOUNCEMENT', populated);
        }

        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Get all announcements for the school (with role-based filtering)
exports.getAnnouncements = async (req, res) => {
    try {
        const activeYearId = req.academicYearId || req.query.academicYearId || req.headers['x-academic-year-id'];
        const query = { 
            schoolId: req.user.schoolId, 
            type: 'Announcement' 
        };

        if (activeYearId) {
            query.academicYearId = activeYearId;
        }

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
        const activeYearId = req.academicYearId || req.query.academicYearId || req.headers['x-academic-year-id'];
        const query = { 
            schoolId: req.user.schoolId, 
            type: 'Notice' 
        };

        if (activeYearId) {
            query.academicYearId = activeYearId;
        }

        // If student, only show school-wide notices or their own class notices
        if (req.user.role === 'Student') {
            const student = await Student.findOne({ userId: req.user._id });
            if (student) {
                if (query.academicYearId) {
                    query.$and = [
                        { academicYearId: query.academicYearId },
                        {
                            $or: [
                                { classSection: null },
                                { classSection: student.classSection }
                            ]
                        }
                    ];
                    delete query.academicYearId;
                } else {
                    query.$or = [
                        { classSection: null }, 
                        { classSection: student.classSection }
                    ];
                }
            }
        } 
        // If parent, show notices for all children's classes
        else if (req.user.role === 'Parent') {
            const children = await Student.find({ parentId: req.user._id });
            const classIds = children.map(c => c.classSection).filter(id => id);
            if (query.academicYearId) {
                query.$and = [
                    { academicYearId: query.academicYearId },
                    {
                        $or: [
                            { classSection: null },
                            { classSection: { $in: classIds } }
                        ]
                    }
                ];
                delete query.academicYearId;
            } else {
                query.$or = [
                    { classSection: null },
                    { classSection: { $in: classIds } }
                ];
            }
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
        const activeYearId = req.academicYearId || req.query.academicYearId || req.headers['x-academic-year-id'];
        const baseQuery = { schoolId: req.user.schoolId };
        if (activeYearId) {
            baseQuery.academicYearId = activeYearId;
        }

        const messages = await Message.find({
            ...baseQuery,
            $or: [
                { recipient: req.user._id },
                { sender: req.user._id },
                { type: 'Announcement', targetRole: { $in: ['All', req.user.role] } }
            ]
        })
        .populate('sender', 'firstName lastName photo role email')
        .populate('recipient', 'firstName lastName photo role email')
        .sort({ createdAt: -1 });

        const enrichedMessages = [];
        for (let msg of messages) {
            const msgObj = msg.toObject();
            if (msgObj.sender) {
                msgObj.sender = await enrichUserProfiles(msgObj.sender, req.user.schoolId);
            }
            if (msgObj.recipient) {
                msgObj.recipient = await enrichUserProfiles(msgObj.recipient, req.user.schoolId);
            }
            enrichedMessages.push(msgObj);
        }
        
        res.json(enrichedMessages);
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
        .populate('sender', 'firstName lastName photo role email')
        .populate('recipient', 'firstName lastName photo role email')
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
        const schoolId = req.user.schoolId;
        const currentUserId = req.user._id;
        let contacts = [];

        if (req.user.role === 'School_Admin' || req.user.role === 'Super_Admin') {
            // Admins see everyone in the school
            contacts = await User.find({ 
                schoolId, 
                _id: { $ne: currentUserId } 
            }).select('firstName lastName role photo email');
        } else if (req.user.role === 'Teacher' || req.user.role === 'Transport_Manager') {
            // Strategic staff see all stakeholders
            contacts = await User.find({ 
                schoolId, 
                _id: { $ne: currentUserId },
                role: { $in: ['School_Admin', 'Teacher', 'Student', 'Parent', 'Transport_Manager', 'Driver', 'Accountant', 'Librarian'] } 
            }).select('firstName lastName role photo email');
        } else if (req.user.role === 'Driver') {
            // Drivers see transport team and admin
            contacts = await User.find({
                schoolId,
                _id: { $ne: currentUserId },
                role: { $in: ['School_Admin', 'Transport_Manager', 'Driver'] }
            }).select('firstName lastName role photo email');
        } else if (req.user.role === 'Student' || req.user.role === 'Parent') {
            // Students/Parents see Faculty and Management
            contacts = await User.find({
                schoolId,
                _id: { $ne: currentUserId },
                role: { $in: ['School_Admin', 'Teacher', 'Transport_Manager', 'Accountant', 'Librarian'] }
            }).select('firstName lastName role photo email');
        } else {
            // Accountants/Librarians see other staff
            contacts = await User.find({
                schoolId,
                _id: { $ne: currentUserId },
                role: { $in: ['School_Admin', 'Teacher', 'Accountant', 'Librarian', 'Transport_Manager'] }
            }).select('firstName lastName role photo email');
        }

        const enrichedContacts = await enrichUserProfiles(contacts, schoolId);
        res.json(enrichedContacts);
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

// Toggle pin status on a notice
exports.toggleNoticePin = async (req, res) => {
    try {
        const notice = await Message.findOne({ _id: req.params.id, schoolId: req.user.schoolId, type: 'Notice' });
        if (!notice) return res.status(404).json({ message: 'Notice not found' });
        notice.isPinned = !notice.isPinned;
        await notice.save();
        res.json({ message: `Notice ${notice.isPinned ? 'pinned' : 'unpinned'}`, data: notice });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// Mark all messages from a specific partner as read
exports.markMessagesAsRead = async (req, res) => {
    try {
        const { partnerId } = req.params;
        await Message.updateMany(
            { 
                schoolId: req.user.schoolId,
                sender: partnerId,
                recipient: req.user._id,
                isRead: false
            },
            { isRead: true }
        );
        res.json({ message: 'Messages marked as read' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete all chat history with a specific user
exports.deleteChatHistory = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        
        // Delete all messages between current user and the other user
        const result = await Message.deleteMany({
            schoolId: req.user.schoolId,
            type: 'DirectMessage',
            $or: [
                { sender: req.user._id, recipient: otherUserId },
                { sender: otherUserId, recipient: req.user._id }
            ]
        });

        res.json({ 
            message: 'Chat history cleared successfully',
            deletedCount: result.deletedCount 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
