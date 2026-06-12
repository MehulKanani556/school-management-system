const User = require('../models/user.model');
const Student = require('../models/student.model');
const Teacher = require('../models/teacher.model');
const Leave = require('../models/leave.model');
const Mark = require('../models/mark.model');
const Assignment = require('../models/assignment.model');
const Payroll = require('../models/payroll.model');
const Attendance = require('../models/attendance.model');
const Timetable = require('../models/timetable.model');
const StaffAttendance = require('../models/staffAttendance.model');
const ClassSection = require('../models/classSection.model');
const FeePayment = require('../models/feePayment.model');
const StudentEnrollment = require('../models/studentEnrollment.model');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');


exports.getSingleUser = async (req,res)=>{
    try {
        const {id} = req.params;
        const user = await User.findById(id);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        res.status(200).json({user,message:"User fetched successfully"});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getUniversalProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const viewerRole = req.user.role;
        const viewerId = req.user._id;

        // Determine user and studentProfile
        let studentProfile = null;
        let user = null;

        // Try to find in User model first
        user = await User.findById(id).select('-password').populate('schoolId', 'name logo').populate('driverInfo');

        if (user && user.role === 'Student') {
            // Find Student document by email
            studentProfile = await Student.findOne({ email: user.email })
                .populate('standard', 'level name')
                .populate('classSection', 'sectionLabel')
                .populate('schoolId', 'name logo')
                .populate('parentId', 'firstName lastName email photo');
        } else {
            // Check if id is a Student ID directly
            studentProfile = await Student.findById(id)
                .populate('standard', 'level name')
                .populate('classSection', 'sectionLabel')
                .populate('schoolId', 'name logo')
                .populate('parentId', 'firstName lastName email photo');

            if (studentProfile) {
                // Find corresponding User account by email
                user = await User.findOne({ email: studentProfile.email }).select('-password');
            }
        }

        if (studentProfile) {
            // Convert to ObjectId for reliable sub-queries
            const studentObjectId = studentProfile._id;
            const studentUser = user;

            // ── Fallback: if standard or classSection are null (stale references),
            //    look up the most recent active StudentEnrollment record
            if (!studentProfile.standard || !studentProfile.classSection) {
                const enrollment = await StudentEnrollment.findOne({ studentId: studentObjectId, status: 'Active' })
                    .sort({ createdAt: -1 })
                    .populate('standardId', 'level name')
                    .populate('classSectionId', 'sectionLabel');

                if (enrollment) {
                    if (!studentProfile.standard && enrollment.standardId) {
                        studentProfile.standard = enrollment.standardId;
                    }
                    if (!studentProfile.classSection && enrollment.classSectionId) {
                        studentProfile.classSection = enrollment.classSectionId;
                    }
                    // Also recover rollNumber from enrollment if missing
                    if (!studentProfile.rollNumber && enrollment.rollNumber) {
                        studentProfile.rollNumber = enrollment.rollNumber;
                    }
                }
            }

            // ── Auto-generate admissionNumber if missing
            if (!studentProfile.admissionNumber) {
                try {
                    const School = mongoose.model('School');
                    const school = await School.findById(studentProfile.schoolId?._id || studentProfile.schoolId);
                    const schoolNameStr = school ? school.name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4) : 'SCHL';
                    const year = new Date().getFullYear();
                    const prefix = `ADM-${year}-${schoolNameStr}-`;
                    const last = await Student.findOne(
                        { schoolId: studentProfile.schoolId?._id || studentProfile.schoolId, admissionNumber: new RegExp(`^${prefix}`) },
                        { admissionNumber: 1 }
                    ).sort({ admissionNumber: -1 }).lean();
                    let nextNum = 1;
                    if (last?.admissionNumber) {
                        const parts = last.admissionNumber.split('-');
                        const lastNum = parseInt(parts[parts.length - 1], 10);
                        if (!isNaN(lastNum)) nextNum = lastNum + 1;
                    }
                    const newAdmNo = `${prefix}${String(nextNum).padStart(4, '0')}`;
                    await Student.findByIdAndUpdate(studentObjectId, { admissionNumber: newAdmNo });
                    studentProfile.admissionNumber = newAdmNo;
                } catch (admErr) {
                    console.error('Could not auto-generate admissionNumber:', admErr.message);
                }
            }

            let studentDetails = {};
            // Check if viewer has access
            const isSelf = viewerId.toString() === studentObjectId.toString() || 
                           (studentUser && viewerId.toString() === studentUser._id.toString());

            if (viewerRole === 'School_Admin' || viewerRole === 'Super_Admin' || isSelf ||
                viewerRole === 'Accountant' || viewerRole === 'Teacher' ||
                (viewerRole === 'Parent' && studentProfile.parentId?._id?.toString() === viewerId.toString()) ||
                (viewerRole === 'Parent' && studentProfile.parentId?.toString() === viewerId.toString())) {

                // Use ObjectId for all sub-queries to avoid string vs ObjectId mismatch
                const results = await Mark.find({ studentId: studentObjectId })
                    .populate({
                        path: 'examId',
                        populate: { path: 'subject', select: 'name' }
                    });

                const rawAttendance = await Attendance.find({ 'records.studentId': studentObjectId })
                    .sort({ date: -1 })
                    .limit(90);
                const attendance = rawAttendance.map(att => {
                    const record = att.records.find(r => r.studentId?.toString() === studentObjectId.toString());
                    return { date: att.date, status: record?.status || 'Unknown' };
                });

                const leaves = await Leave.find({ studentId: studentObjectId }).sort({ createdAt: -1 });

                // Use effective standard/classSection (original or from enrollment)
                const effectiveSectionId = studentProfile.classSection?._id;
                const effectiveStandardId = studentProfile.standard?._id;

                let assignments = [];
                const assignmentOrConditions = [];
                if (effectiveSectionId) assignmentOrConditions.push({ classSectionId: effectiveSectionId });
                if (effectiveStandardId) assignmentOrConditions.push({ standardId: effectiveStandardId });

                if (assignmentOrConditions.length > 0) {
                    assignments = await Assignment.find({ $or: assignmentOrConditions })
                        .sort({ dueDate: -1 })
                        .limit(10);
                }

                const timetableRaw = effectiveSectionId
                    ? await Timetable.findOne({ classSection: effectiveSectionId })
                        .populate('schedule.periods.subject', 'name')
                        .populate('schedule.periods.teacher', 'firstName lastName')
                    : null;

                let timetable = [];
                if (timetableRaw) {
                    timetableRaw.schedule.forEach(dayNode => {
                        dayNode.periods.forEach(per => {
                            timetable.push({
                                day: dayNode.day,
                                courseId: { name: per.subject?.name || 'Unknown Subject' },
                                teacherId: { name: per.teacher ? `${per.teacher.firstName} ${per.teacher.lastName}` : 'TBD' },
                                startTime: per.startTime,
                                endTime: per.endTime
                            });
                        });
                    });
                }

                const fees = await FeePayment.find({ studentId: studentObjectId })
                    .sort({ createdAt: -1 })
                    .limit(20);

                studentDetails = { results, attendance, leaves, assignments, timetable, fees };
            }

            return res.status(200).json({
                success: true,
                role: 'Student',
                data: {
                    ...studentProfile.toObject(),
                    ...studentDetails
                }
            });
        }

        // 2. Try to find in User model if we haven't already
        let teacherRecord = null;
        if (!user) {
            // Try to find in Teacher model directly (using Teacher _id)
            teacherRecord = await Teacher.findById(id).populate('schoolId', 'name logo');
            if (teacherRecord && teacherRecord.userId) {
                user = await User.findById(teacherRecord.userId).select('-password');
            }
        }

        if (!user && !teacherRecord) {
            return res.status(404).json({ success: false, message: "Identity not detected in platform registry." });
        }

        let extraData = {};
        const activeRole = user ? user.role : 'Teacher';
        const activeId = user ? user._id : id;

        if (activeRole === 'Teacher') {
            if (!teacherRecord) {
                teacherRecord = await Teacher.findOne({ userId: activeId }).populate('schoolId', 'name logo');
            }
            
            let teacherMetrics = {};
            // If viewer is Admin or self
            if (viewerRole === 'School_Admin' || viewerRole === 'Super_Admin' || viewerRole === 'Accountant' || viewerId.toString() === activeId.toString() || (teacherRecord && viewerId.toString() === teacherRecord._id.toString())) {
                const salary = teacherRecord ? await Payroll.find({ teacherId: teacherRecord._id }).sort({ paidAt: -1 }).limit(12) : [];

                const attendance = await StaffAttendance.find({ userId: activeId }).sort({ date: -1 }).limit(30);
                
                // Fetch whole class-timetables where this teacher has any period
                const fullTimetables = teacherRecord ? await Timetable.find({ 'schedule.periods.teacher': teacherRecord._id })
                    .populate('classSection', 'sectionLabel')
                    .populate('schedule.periods.subject', 'name') : [];
                
                // Flatten into teacher-specific engagement nodes for the profile UI
                let timetable = [];
                fullTimetables.forEach(tt => {
                    tt.schedule.forEach(dayNode => {
                        dayNode.periods.forEach(per => {
                            if (per.teacher?.toString() === teacherRecord._id.toString()) {
                                timetable.push({
                                    day: dayNode.day,
                                    courseId: { name: per.subject?.name || 'Institutional Period' },
                                    classId: { sectionLabel: tt.classSection?.sectionLabel || 'Matrix' },
                                    startTime: per.startTime,
                                    endTime: per.endTime
                                });
                            }
                        });
                    });
                });

                // Sort by day if needed (Monday-Sunday)
                const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                timetable.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));

                const classes = teacherRecord ? await ClassSection.find({ classTeacher: teacherRecord._id }).populate('standardId', 'level') : [];
                
                teacherMetrics = { salary, attendance, timetable, classes };
            }

            extraData = { 
                ...(teacherRecord?._doc || {}), 
                ...teacherMetrics 
            };
        } else if (user.role === 'Parent') {
            const children = await Student.find({ parentId: activeId }).select('firstName lastName admissionNumber rollNumber photo');
            extraData = { children };
        } else if (['Accountant', 'Librarian', 'Transport_Manager', 'Driver'].includes(user.role)) {
             // For staff members, fetch their specific record if needed, but for now we have User basic info
             if (viewerRole === 'School_Admin' || viewerRole === 'Super_Admin' || viewerId.toString() === activeId.toString()) {
                const salary = await Payroll.find({ userId: activeId }).sort({ paidAt: -1 }).limit(12);
                const attendance = await StaffAttendance.find({ userId: activeId }).sort({ date: -1 }).limit(30);
                extraData = { salary, attendance };
             }
        }

        res.status(200).json({
            success: true,
            role: user ? user.role : 'Teacher',
            data: {
                ...(user ? user._doc : {}),
                ...extraData
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const query = {};
        if (req.user && req.user.role !== 'Super_Admin') {
            query.schoolId = req.user.schoolId;
        }
        const users = await User.find(query).populate('driverInfo');
        res.status(200).json({ users, message: "Users fetched successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
exports.deleteUser = async (req,res)=>{
    try {
        const {id} = req.user;
        const user = await User.findByIdAndDelete(id);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        res.status(200).json({message:"User deleted successfully"})
    } catch (error) {
        res.status(200).json({message:error.message});
    }
}


exports.updateUser = async (req,res)=>{
    try {
        const {id} = req.user;
        const { firstName, lastName, email,  role } = req.body;
        const photo = req.file.location;
        const user = await User.findByIdAndUpdate(id,{ firstName, lastName, email, role,photo },{new:true});
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        res.status(200).json({user,message:"User updated successfully"});
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}



