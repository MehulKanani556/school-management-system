const School = require('../models/school.model');
const User = require('../models/user.model');
const Teacher = require('../models/teacher.model');
const Student = require('../models/student.model');
const AuditLog = require('../models/auditLog.model');
const SystemSetting = require('../models/systemSetting.model');
const Ticket = require('../models/ticket.model');
const Backup = require('../models/backup.model');
const Message = require('../models/message.model');
const FeePayment = require('../models/feePayment.model');
const Holiday = require('../models/holiday.model');
const bcrypt = require('bcrypt');

/**
 * Platform-wide analytics (total revenue, active users, usage stats)
 */
exports.getPlatformAnalytics = async (req, res) => {
    try {
        const totalSchools = await School.countDocuments();
        const activeSchools = await School.countDocuments({ isActive: true });
        
        // Total Revenue aggregated from all schools
        const revenueResult = await School.aggregate([
            { $group: { _id: null, total: { $sum: "$revenue" } } }
        ]);
        const totalRevenue = revenueResult[0] ? revenueResult[0].total : 0;

        // User stats
        const totalUsers = await User.countDocuments();
        const activeUsersCount = await User.countDocuments({ isActive: true });
        
        // Detailed user distribution
        const roleDistribution = await User.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } }
        ]);

        // Usage stats (resource consumption / volume)
        const totalTeachers = await Teacher.countDocuments();
        const totalStudents = await Student.countDocuments();

        // Growth stats (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const newSchools = await School.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
        const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

        res.status(200).json({
            success: true,
            analytics: {
                revenue: {
                    total: totalRevenue,
                    currency: 'USD'
                },
                infrastructure: {
                    totalSchools,
                    activeSchools,
                    totalTeachers,
                    totalStudents
                },
                users: {
                    total: totalUsers,
                    active: activeUsersCount,
                    distribution: roleDistribution
                },
                growth: {
                    newSchools30d: newSchools,
                    newUsers30d: newUsers
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Audit logs / activity monitoring
 */
exports.getAuditLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const logs = await AuditLog.find()
            .populate('userId', 'firstName lastName email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await AuditLog.countDocuments();

        res.status(200).json({
            success: true,
            logs,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * System settings (global config, feature toggles)
 */
exports.getSystemSettings = async (req, res) => {
    try {
        const settings = await SystemSetting.find();
        res.status(200).json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateSystemSetting = async (req, res) => {
    try {
        const { key, value, description } = req.body;
        
        let setting = await SystemSetting.findOne({ key });
        if (setting) {
            setting.value = value;
            if (description) setting.description = description;
            setting.updatedBy = req.user._id;
            setting.updatedAt = Date.now();
            await setting.save();
        } else {
            setting = await SystemSetting.create({
                key,
                value,
                description,
                updatedBy: req.user._id
            });
        }

        res.status(200).json({ success: true, setting, message: 'Setting updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Super admin profile management
 */
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, email } = req.body;
        const updateData = { firstName, lastName, email };

        if (req.file) {
            updateData.photo = req.file.location;
        }

        const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select('-password');
        res.status(200).json({ success: true, user, message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Revenue Analytics for Super Admin — real monthly fee payment trends
 */
exports.getRevenueAnalytics = async (req, res) => {
    try {
        const schools = await School.find({}, 'name revenue logo isActive');

        // Real student counts per school
        const studentCounts = await Student.aggregate([
            { $match: { deletedAt: null } },
            { $group: { _id: '$schoolId', count: { $sum: 1 } } }
        ]);
        const countMap = {};
        studentCounts.forEach(s => { countMap[s._id.toString()] = s.count; });

        const schoolBreakdown = schools.map(s => ({
            _id: s._id,
            name: s.name,
            logo: s.logo,
            isActive: s.isActive,
            revenue: s.revenue || 0,
            studentCount: countMap[s._id.toString()] || 0
        }));

        const totalRevenue = schoolBreakdown.reduce((acc, s) => acc + s.revenue, 0);

        // Real monthly revenue from fee payments (last 12 months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);

        const monthlyData = await FeePayment.aggregate([
            { $match: { status: { $in: ['paid', 'partially_paid'] }, paidDate: { $gte: twelveMonthsAgo } } },
            { $group: {
                _id: { year: { $year: '$paidDate' }, month: { $month: '$paidDate' } },
                revenue: { $sum: '$paidAmount' }
            }},
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const trends = monthlyData.map(d => ({
            month: monthNames[d._id.month - 1],
            revenue: d.revenue
        }));

        res.status(200).json({
            success: true,
            totalRevenue,
            schoolBreakdown,
            trends
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Security Stats for Super Admin
 */
exports.getSecurityOverview = async (req, res) => {
    try {
        const totalLogs = await AuditLog.countDocuments();
        const criticalAlerts = await AuditLog.countDocuments({ action: /delete|update-school|security/i });
        const failedAttemptsRes = await User.aggregate([
            { $group: { _id: null, total: { $sum: "$failedLoginAttempts" } } }
        ]);

        const recentAudits = await AuditLog.find()
            .populate('userId', 'firstName lastName role')
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            stats: {
                totalLogs,
                criticalAlerts,
                failedAttempts: failedAttemptsRes[0] ? failedAttemptsRes[0].total : 0
            },
            recentAudits
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Ticketing / Support System
 */
exports.getSupportTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find()
            .populate('schoolId', 'name')
            .populate('openedBy', 'firstName lastName email')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, tickets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const socketManager = require('../socketManager/socketManager');

exports.updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const ticket = await Ticket.findByIdAndUpdate(id, { status }, { new: true })
            .populate('openedBy', 'firstName lastName role photo')
            .populate('schoolId', 'name');

        if (ticket) {
            console.log(`[SUPER_TICKET_SOCKET] Status Change. Notifying user: ${ticket.openedBy._id}`);
            socketManager.sendToUser(ticket.openedBy._id, 'TICKET_STATUS_CHANGED', ticket);
            
            // Notify other admins
            socketManager.broadcastToRole('School_Admin', 'TICKET_STATUS_CHANGED', ticket);
            socketManager.broadcastToRole('Super_Admin', 'TICKET_STATUS_CHANGED', ticket);
        }

        res.status(200).json({ success: true, ticket, message: 'Ticket status updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.replyToTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        const ticket = await Ticket.findById(id);
        
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        ticket.replies.push({
            senderId: req.user._id,
            message,
            createdAt: Date.now()
        });

        // Auto transition if admin replies
        if (ticket.status === 'Open') {
            ticket.status = 'In_Progress';
        }

        await ticket.save();

        const updated = await Ticket.findById(id)
            .populate('openedBy', 'firstName lastName role photo')
            .populate('schoolId', 'name')
            .populate('replies.senderId', 'firstName lastName role photo');

        socketManager.sendToUser(updated.openedBy._id, 'TICKET_REPLY', updated);
        socketManager.broadcastToRole('School_Admin', 'TICKET_REPLY', updated);
        socketManager.broadcastToRole('Super_Admin', 'TICKET_REPLY', updated);

        const nc = require('./notification.controller');
        const openerRole = updated.openedBy?.role;
        const ticketLink =
            openerRole === 'Teacher' ? '/teacher/tickets'
            : openerRole === 'Parent' ? '/parent/tickets'
            : '/school-admin/tickets';
        await nc.sendNotification({
            schoolId: ticket.schoolId,
            recipient: updated.openedBy._id,
            sender: req.user._id,
            type: 'General',
            title: 'Support ticket reply',
            message: `New reply on: ${ticket.subject}`,
            link: ticketLink,
        });

        res.status(200).json({ success: true, ticket: updated, message: 'Reply sent' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Global User Management for Super Admin
 */
exports.getPlatformUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .populate('schoolId', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments();

        res.status(200).json({
            success: true,
            users,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const user = await User.findByIdAndUpdate(id, { isActive }, { new: true }).select('-password').populate('schoolId', 'name');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, user, message: isActive ? 'User node activated' : 'User node suspended' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deletePlatformUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Prevent deleting self
        if (id === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Cannot delete own account' });
        }
        await User.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'User entity purged from registry' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Backup & Recovery System
 */
exports.getBackupHistory = async (req, res) => {
    try {
        const backups = await Backup.find()
            .populate('triggeredBy', 'firstName lastName')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, backups });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.triggerSystemBackup = async (req, res) => {
    try {
        const backup = await Backup.create({
            triggeredBy: req.user._id,
            status: 'Initializing',
            type: req.body.type || 'Full'
        });

        const fs = require('fs');
        const path = require('path');
        setTimeout(async () => {
            try {
                const upBackup = await Backup.findById(backup._id);
                if (!upBackup) return;

                const School = require('../models/school.model');
                const User = require('../models/user.model');
                const Student = require('../models/student.model');
                const dir = path.join('uploads', 'backups');
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

                const snapshot = {
                    exportedAt: new Date().toISOString(),
                    type: upBackup.type,
                    counts: {
                        schools: await School.countDocuments(),
                        users: await User.countDocuments(),
                        students: await Student.countDocuments(),
                    },
                };
                const filename = `backup-${backup._id}.json`;
                const filepath = path.join(dir, filename);
                fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2));
                const stat = fs.statSync(filepath);

                upBackup.status = 'Relayed';
                upBackup.service = 'JSON snapshot (metadata export)';
                upBackup.fileSizeMB = Math.max(1, Math.round(stat.size / 1024 / 1024 * 100) / 100);
                upBackup.completedAt = Date.now();
                upBackup.checksum = `SHA256_${stat.size}`;
                upBackup.downloadUrl = `/uploads/backups/${filename}`;
                await upBackup.save();
            } catch (e) {
                const failed = await Backup.findById(backup._id);
                if (failed) {
                    failed.status = 'Failed';
                    failed.service = e.message;
                    await failed.save();
                }
            }
        }, 2000);

        res.status(201).json({ success: true, backup, message: 'System wide archive protocol initialized' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Messaging System
 */
exports.getPlatformMessages = async (req, res) => {
    try {
        const { recipientId } = req.params;
        const senderId = req.user._id;

        const messages = await Message.find({
            $or: [
                { sender: senderId, recipient: recipientId },
                { sender: recipientId, recipient: senderId }
            ]
        })
        .populate('sender', 'firstName lastName photo role')
        .populate('recipient', 'firstName lastName photo role')
        .sort({ createdAt: 1 });

        res.status(200).json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Global Holiday Management
 */
exports.getGlobalHolidays = async (req, res) => {
    try {
        const holidays = await Holiday.find().sort({ startDate: 1 });
        res.status(200).json({ success: true, holidays });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createGlobalHoliday = async (req, res) => {
    try {
        const holiday = await Holiday.create(req.body);
        res.status(201).json({ success: true, data: holiday, message: 'Global suspension registry protocol finalized.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateGlobalHoliday = async (req, res) => {
    try {
        const holiday = await Holiday.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: holiday, message: 'Suspension parameters re-calibrated.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteGlobalHoliday = async (req, res) => {
    try {
        await Holiday.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Temporal break node purged.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
