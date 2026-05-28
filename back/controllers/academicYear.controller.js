const AcademicYear = require('../models/academicYear.model');
const mongoose = require('mongoose');

const getSchoolId = (req) => req.user.schoolId;

exports.getAcademicYears = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);
        if (!schoolId) return res.json([]);
        const years = await AcademicYear.find({ schoolId }).sort({ startDate: -1 });
        res.json(years);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createAcademicYear = async (req, res) => {
    try {
        const { name, startDate, endDate, isCurrent } = req.body;
        const schoolId = getSchoolId(req);

        // Date validation: startDate must be before endDate
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) {
            return res.status(400).json({ message: 'Start date must be strictly before end date.' });
        }

        // Session year validation
        const nameMatch = name.match(/^(\d{4})-\d{2}$/);
        if (nameMatch) {
            const expectedStartYear = parseInt(nameMatch[1], 10);
            const actualStartYear = start.getFullYear();
            if (actualStartYear !== expectedStartYear) {
                return res.status(400).json({ 
                    message: `Start date year (${actualStartYear}) must match the session year (${expectedStartYear})` 
                });
            }
        }

        // Overlap validation: check if the new session dates overlap with any existing academic year
        const overlappingYear = await AcademicYear.findOne({
            schoolId,
            startDate: { $lt: end },
            endDate: { $gt: start }
        });

        if (overlappingYear) {
            return res.status(400).json({ 
                message: `Session dates overlap with an existing session: ${overlappingYear.name} (${new Date(overlappingYear.startDate).toLocaleDateString()} - ${new Date(overlappingYear.endDate).toLocaleDateString()})` 
            });
        }

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
        const { name, startDate, endDate, isCurrent } = req.body;
        const schoolId = getSchoolId(req);

        const existingYear = await AcademicYear.findById(id);
        if (!existingYear) return res.status(404).json({ message: 'Academic Cycle not found' });

        const finalName = name || existingYear.name;
        const finalStartDate = startDate ? new Date(startDate) : existingYear.startDate;
        const finalEndDate = endDate ? new Date(endDate) : existingYear.endDate;

        // Date validation: startDate must be before endDate
        if (finalStartDate >= finalEndDate) {
            return res.status(400).json({ message: 'Start date must be strictly before end date.' });
        }

        // Session year validation
        const nameMatch = finalName.match(/^(\d{4})-\d{2}$/);
        if (nameMatch) {
            const expectedStartYear = parseInt(nameMatch[1], 10);
            const actualStartYear = finalStartDate.getFullYear();
            if (actualStartYear !== expectedStartYear) {
                return res.status(400).json({ 
                    message: `Start date year (${actualStartYear}) must match the session year (${expectedStartYear})` 
                });
            }
        }

        // Overlap validation: check if the updated session dates overlap with any other academic year
        const overlappingYear = await AcademicYear.findOne({
            schoolId,
            _id: { $ne: id },
            startDate: { $lt: finalEndDate },
            endDate: { $gt: finalStartDate }
        });

        if (overlappingYear) {
            return res.status(400).json({ 
                message: `Session dates overlap with an existing session: ${overlappingYear.name} (${new Date(overlappingYear.startDate).toLocaleDateString()} - ${new Date(overlappingYear.endDate).toLocaleDateString()})` 
                });
        }

        if (isCurrent) {
            await AcademicYear.updateMany({ schoolId, _id: { $ne: id } }, { isCurrent: false });
        }

        const year = await AcademicYear.findOneAndUpdate(
            { _id: id, schoolId },
            req.body,
            { new: true }
        );

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
