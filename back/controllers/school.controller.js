const School = require('../models/school.model');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const { sendWelcomeMail } = require('../utils/mail');

exports.createSchool = async (req, res) => {
    try {
        const { name, subdomain, adminEmail, address, contact } = req.body;

        // Use uploaded logo if present
        const logo = req.file ? req.file.location : null;

        const checkSchool = await School.findOne({ subdomain });
        if (checkSchool) return res.status(400).json({ message: 'Subdomain already taken' });

        const school = await School.create({
            name,
            subdomain,
            adminEmail,
            logo,
            address,
            contact
        });

        // Automatically create School Admin User
        const checkUser = await User.findOne({ email: adminEmail });
        if (!checkUser) {
            const hashedPassword = await bcrypt.hash(adminEmail, 10);
            const userAvatar = logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}+Admin&background=2563eb&color=fff`;

            const newUser = await User.create({
                firstName: name,
                lastName: 'Administrator',
                email: adminEmail,
                password: hashedPassword,
                role: 'School_Admin',
                schoolId: school._id,
                photo: userAvatar
            });

            // Send Welcome Email
            sendWelcomeMail({
                to: adminEmail,
                subject: 'School Admin Access Provisioned — Welcome to ' + name,
                title: 'SCHOOL MANAGEMENT',
                subtitle: 'School Admin Account Created',
                firstName: name,
                lastName: 'Administrator',
                idLabel: 'Admin ID',
                idValue: newUser._id.toString().slice(-6).toUpperCase(),
                email: adminEmail,
                password: adminEmail, // Plain password as requested (email itself)
                joiningDate: new Date(),
                footerNote: 'If you have any issues, contact system support.'
            }).catch(err => console.error('Mail error during school creation:', err));
        }

        res.status(201).json({ success: true, school, message: 'School created and Admin provisioned successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllSchools = async (req, res) => {
    try {
        const schools = await School.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, schools });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSchoolStats = async (req, res) => {
    try {
        const totalSchools = await School.countDocuments();
        const activeSchools = await School.countDocuments({ isActive: true });

        // Calculate Total Revenue from all schools
        const revenueResult = await School.aggregate([
            { $group: { _id: null, total: { $sum: "$revenue" } } }
        ]);
        const totalRevenue = revenueResult[0] ? revenueResult[0].total : 0;

        res.status(200).json({
            success: true,
            stats: {
                totalSchools,
                activeSchools,
                totalRevenue
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateSchool = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, isActive, address, contact } = req.body;

        const updateData = { name, isActive, address, contact };
        if (req.file) {
            updateData.logo = req.file.location;
        }

        const school = await School.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).json({ success: true, school, message: 'School updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteSchool = async (req, res) => {
    try {
        const { id } = req.params;
        await School.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'School deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateSchoolStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const school = await School.findByIdAndUpdate(id, { isActive }, { new: true });
        res.status(200).json({ success: true, school, message: 'Status updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
