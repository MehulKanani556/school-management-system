const Announcement = require('../models/announcement.model');
const mongoose = require('mongoose');

const getSchoolId = (req) => req.user.schoolId;

exports.getAnnouncements = async (req, res) => {
    try {
        const { role, classSectionId, academicYearId } = req.query;
        const schoolId = getSchoolId(req);
        
        const filter = { schoolId, isPublished: true };
        
        if (academicYearId) {
            filter.academicYearId = academicYearId;
        }
        
        if (role) {
            filter.targetRoles = { $in: [role, 'All'] };
        }
        
        if (classSectionId) {
            filter.$or = [
                { targetClassSection: classSectionId },
                { targetClassSection: { $exists: false } },
                { targetClassSection: null }
            ];
        }

        const announcements = await Announcement.find(filter)
            .populate('authorId', 'firstName lastName photo')
            .sort({ createdAt: -1 });
        res.json(announcements);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createAnnouncement = async (req, res) => {
    try {
        const { targetRole, subject, ...rest } = req.body;
        const announcement = new Announcement({
            ...rest,
            title: subject || rest.title,
            targetRole: targetRole || 'All',
            targetRoles: targetRole ? [targetRole] : ['All'],
            schoolId: getSchoolId(req),
            authorId: req.user._id,
        });

        await announcement.save();

        // Trigger announcement emails to parents
        const { handleAnnouncementEmail } = require('../utils/mail');
        handleAnnouncementEmail(announcement, req.user).catch(err => console.error('Error sending announcement email:', err));

        res.status(201).json(announcement);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const announcement = await Announcement.findOneAndUpdate(
            { _id: id, schoolId: getSchoolId(req) },
            req.body,
            { new: true }
        );
        if (!announcement) return res.status(404).json({ message: 'Pulse broadcast not found' });
        res.json(announcement);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        await Announcement.findOneAndDelete({ _id: id, schoolId: getSchoolId(req) });
        res.json({ message: 'Pulse broadcast retracted successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getManagedAnnouncements = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);
        const { academicYearId } = req.query;
        const filter = { schoolId };
        if (academicYearId) {
            filter.academicYearId = academicYearId;
        }
        const announcements = await Announcement.find(filter)
            .populate('authorId', 'firstName lastName photo')
            .populate('targetClassSection', 'sectionLabel')
            .sort({ createdAt: -1 });
        res.json(announcements);
    } catch (err) { res.status(500).json({ message: err.message }); }
};
