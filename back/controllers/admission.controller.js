const AdmissionEnquiry = require('../models/admissionEnquiry.model');
const Student = require('../models/student.model');
const User = require('../models/user.model');
const PromotionHistory = require('../models/promotionHistory.model');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const getSchoolId = (req) => req.user.schoolId;

exports.getEnquiries = async (req, res) => {
    try {
        const enquiries = await AdmissionEnquiry.find({ schoolId: getSchoolId(req) })
            .populate('standardApplied', 'level name')
            .populate('admissionAssignedTo', 'firstName lastName')
            .sort({ createdAt: -1 });
        res.json(enquiries);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addEnquiry = async (req, res) => {
    try {
        const enquiry = new AdmissionEnquiry({
            ...req.body,
            schoolId: getSchoolId(req),
        });
        await enquiry.save();
        res.status(201).json(enquiry);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateEnquiryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes, followUpDate } = req.body;
        const enquiry = await AdmissionEnquiry.findOneAndUpdate(
            { _id: id, schoolId: getSchoolId(req) },
            { status, notes, followUpDate },
            { new: true }
        );
        if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
        res.json(enquiry);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.admitCandidate = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { enquiryId, admissionNumber, firstName, lastName, gender, dateOfBirth, guardianName, guardianPhone, guardianEmail, address, classId, sectionId, academicYearId, password } = req.body;
        const schoolId = getSchoolId(req);

        // 1. Create User Account
        const hashedPassword = await bcrypt.hash(password || 'password', 10);
        const newUser = new User({
            firstName,
            lastName,
            email: guardianEmail || `${admissionNumber}@school.com`,
            password: hashedPassword,
            role: 'Student',
            schoolId
        });
        await newUser.save({ session });

        // 2. Create Student Profile
        const student = new Student({
            _id: newUser._id,
            schoolId,
            firstName,
            lastName,
            admissionNumber,
            gender,
            dateOfBirth,
            guardianName,
            guardianPhone,
            guardianEmail,
            address,
            standard: classId,
            classSection: sectionId,
            isActive: true
        });
        await student.save({ session });

        // 3. Mark Enquiry as Admitted
        if (enquiryId) {
            await AdmissionEnquiry.findByIdAndUpdate(enquiryId, { status: 'Admitted' }, { session });
        }

        // 4. Create Initial Promotion History (Optional record of initial enrollment)
        const history = new PromotionHistory({
            schoolId,
            studentId: student._id,
            toStandard: classId,
            toAcademicYear: academicYearId,
            promotedBy: req.user._id,
            status: 'Promoted' // Using 'Promoted' as initial admission state
        });
        await history.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ message: 'Candidate enrolled successfully in the institutional matrix', student });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: err.message });
    }
};

exports.getPromotionHistory = async (req, res) => {
    try {
        const { studentId } = req.params;
        const history = await PromotionHistory.find({ studentId, schoolId: getSchoolId(req) })
            .populate('fromStandard toStandard', 'level name')
            .populate('fromAcademicYear toAcademicYear', 'name')
            .populate('promotedBy', 'firstName lastName')
            .sort({ promotionDate: -1 });
        res.json(history);
    } catch (err) { res.status(500).json({ message: err.message }); }
};
