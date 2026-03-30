const mongoose = require('mongoose');
const StaffAttendance = require('../models/staffAttendance.model');
const Teacher = require('../models/teacher.model');
const User = require('../models/user.model');

const getSchoolId = (req) => req.user.schoolId;

// 1. Mark Bulk Attendance (Admin)
exports.markBulkAttendance = async (req, res) => {
    try {
        const { date, records } = req.body; // records: [{ teacherId/userId, status, remarks }]
        const schoolId = getSchoolId(req);

        if (!date || !records || !Array.isArray(records)) {
            return res.status(400).json({ message: 'Invalid data provided' });
        }

        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        const bulkOps = records.map(rec => {
            const filter = { 
                schoolId, 
                date: attendanceDate, 
                teacherId: rec.teacherId || null, 
                driverId: rec.driverId || null,
                userId: rec.userId || null 
            };
            
            return {
                updateOne: {
                    filter,
                    update: { 
                        $set: { 
                            status: rec.status, 
                            remarks: rec.remarks, 
                            arrivalTime: rec.arrivalTime, 
                            departureTime: rec.departureTime 
                        } 
                    },
                    upsert: true
                }
            };
        });

        await StaffAttendance.bulkWrite(bulkOps);
        res.json({ message: 'Staff attendance recorded successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 2. Self Attendance (Teacher)
exports.teacherSelfAttendance = async (req, res) => {
    try {
        const { status, arrivalTime } = req.body;
        const schoolId = getSchoolId(req);
        
        // Find teacher record for this user
        const teacher = await Teacher.findOne({ userId: req.user._id, schoolId });
        if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

        const date = new Date();
        date.setHours(0, 0, 0, 0);

        const attendance = await StaffAttendance.findOneAndUpdate(
            { schoolId, teacherId: teacher._id, date },
            { status, arrivalTime, isLate: false }, // Simple logic for now
            { upsert: true, new: true }
        );

        res.json({ message: 'Attendance marked', data: attendance });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 3. Get Staff List for Attendance Marking
exports.getStaffForAttendance = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);
        const { role } = req.query;

        // Fetch teachers
        let teachers = await Teacher.find({ schoolId, isActive: true, deletedAt: null }).select('firstName lastName employeeId');
        
        // Fetch other staff from User model
        let staffFilter = { schoolId, isActive: true, role: { $in: ['Accountant', 'Librarian', 'Transport_Manager'] } };
        if (role && role !== 'Teacher') {
            staffFilter.role = role;
        }
        
        // Fetch Drivers
        let drivers = await mongoose.model('Driver').find({ schoolId }).populate('userId').select('name userId licenseNumber');
        
        const otherStaff = await User.find(staffFilter).select('firstName lastName role');

        res.json({ teachers, otherStaff, drivers });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// (getMonthlySummary) 
exports.getMonthlySummary = async (req, res) => {
    try {
        const { month, year } = req.query;
        const schoolId = getSchoolId(req);

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const summary = await StaffAttendance.aggregate([
            { $match: { schoolId: new mongoose.Types.ObjectId(schoolId), date: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: { teacher: '$teacherId', user: '$userId', driver: '$driverId' },
                    present: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } },
                    absent: { 
                        $sum: { 
                            $cond: [
                                { $regexMatch: { input: { $ifNull: ["$status", ""] }, regex: /absent|abxent|abzent/i } }, 
                                1, 
                                0 
                            ] 
                        } 
                    },
                    leave: { $sum: { $cond: [{ $eq: ['$status', 'Leave'] }, 1, 0] } },
                    halfDay: { $sum: { $cond: [{ $eq: ['$status', 'Half-Day'] }, 1, 0] } },
                    miscellaneous: {
                        $sum: {
                            $cond: [
                                { 
                                    $and: [
                                        { $ne: ["$status", "Present"] },
                                        { $ne: ["$status", "Late"] },
                                        { $ne: ["$status", "Leave"] },
                                        { $ne: ["$status", ""] },
                                        { $not: { $regexMatch: { input: { $ifNull: ["$status", ""] }, regex: /absent|abxent|abzent/i } } },
                                        { $ne: ["$status", "Half-Day"] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'teachers',
                    localField: '_id.teacher',
                    foreignField: '_id',
                    as: 'teacher'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id.user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
                { $lookup: { from: 'drivers', localField: '_id.driver', foreignField: '_id', as: 'driver' } },
                { $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } }
        ]);

        res.json(summary);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 5. Get Attendance Report (Filtered)
exports.getAttendanceReport = async (req, res) => {
    try {
        const { startDate, endDate, teacherId, userId, date } = req.query;
        const schoolId = getSchoolId(req);

        const filter = { schoolId };
        
        if (startDate && endDate) {
            filter.date = { 
                $gte: new Date(startDate).setHours(0, 0, 0, 0), 
                $lte: new Date(endDate).setHours(23, 59, 59, 999) 
            };
        } else if (date) {
            const d = new Date(date);
            filter.date = { 
                $gte: new Date(d).setHours(0, 0, 0, 0), 
                $lte: new Date(d).setHours(23, 59, 59, 999) 
            };
        }

        if (teacherId) filter.teacherId = teacherId;
        if (userId) filter.userId = userId;

        const records = await StaffAttendance.find(filter)
            .populate('teacherId', 'firstName lastName employeeId')
            .populate('driverId', 'name contact licenseNumber')
            .populate('userId', 'firstName lastName role')
            .sort({ date: -1 });

        res.json(records);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 6. Get My Attendance History (Self)
exports.getMyAttendanceHistory = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);
        const filter = { schoolId };

        const teacher = await Teacher.findOne({ userId: req.user._id, schoolId });
        if (teacher) {
            filter.teacherId = teacher._id;
        } else {
            filter.userId = req.user._id;
        }

        const records = await StaffAttendance.find(filter).sort({ date: -1 });
        res.json(records);
    } catch (err) { res.status(500).json({ message: err.message }); }
};
