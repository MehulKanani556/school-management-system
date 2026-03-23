const AcademicYear = require('../models/academicYear.model');
const mongoose = require('mongoose');

const getSchoolId = (req) => req.user.schoolId;

exports.getAcademicYears = async (req, res) => {
    try {
        const years = await AcademicYear.find({ schoolId: getSchoolId(req) }).sort({ startDate: -1 });
        res.json(years);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createAcademicYear = async (req, res) => {
    try {
        const { name, startDate, endDate, isCurrent } = req.body;
        const schoolId = getSchoolId(req);

        if (isCurrent) {
            await AcademicYear.updateMany({ schoolId }, { isCurrent: false });
        }

        const newYear = new AcademicYear({
            schoolId,
            name,
            startDate,
            endDate,
            isCurrent: isCurrent || false
        });

        await newYear.save();
        res.status(201).json(newYear);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateAcademicYear = async (req, res) => {
    try {
        const { id } = req.params;
        const { isCurrent } = req.body;
        const schoolId = getSchoolId(req);

        if (isCurrent) {
            await AcademicYear.updateMany({ schoolId, _id: { $ne: id } }, { isCurrent: false });
        }

        const year = await AcademicYear.findOneAndUpdate(
            { _id: id, schoolId },
            req.body,
            { new: true }
        );

        if (!year) return res.status(404).json({ message: 'Academic Cycle not found' });
        res.json(year);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteAcademicYear = async (req, res) => {
    try {
        const { id } = req.params;
        const schoolId = getSchoolId(req);
        // Check if current
        const year = await AcademicYear.findOne({ _id: id, schoolId });
        if (year?.isCurrent) return res.status(400).json({ message: 'Cannot delete the active academic session' });
        
        await AcademicYear.findOneAndDelete({ _id: id, schoolId });
        res.json({ message: 'Academic session purged successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getCurrentYear = async (req, res) => {
    try {
        const year = await AcademicYear.findOne({ schoolId: getSchoolId(req), isCurrent: true });
        res.json(year);
    } catch (err) { res.status(500).json({ message: err.message }); }
};
