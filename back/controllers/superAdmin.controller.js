const School = require('../models/school.model');
const User = require('../models/user.model');
const Teacher = require('../models/teacher.model');
const Student = require('../models/student.model');
const AuditLog = require('../models/auditLog.model');
const SystemSetting = require('../models/systemSetting.model');
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
