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
const bcrypt = require('bcrypt');


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

        // 1. Try to find in Student model (since they don't have a separate User record)
        let studentProfile = await Student.findById(id)
            .populate('standard', 'level name')
            .populate('classSection', 'sectionLabel')
            .populate('schoolId', 'name logo')
            .populate('parentId', 'firstName lastName email photo');

        if (studentProfile) {
            let studentDetails = {};
            // If viewer is Admin or self or Parent of child
            if (viewerRole === 'School_Admin' || viewerRole === 'Super_Admin' || viewerId.toString() === id || (viewerRole === 'Parent' && studentProfile.parentId?._id.toString() === viewerId.toString())) {
                const results = await Mark.find({ studentId: id })
                    .populate({
                        path: 'examId',
                        populate: { path: 'subject', select: 'name' }
                    });
                const rawAttendance = await Attendance.find({ 'records.studentId': id }).sort({ date: -1 }).limit(30);
                const attendance = rawAttendance.map(att => {
                    const record = att.records.find(r => r.studentId?.toString() === id);
                    return { date: att.date, status: record?.status || 'Unknown' };
                });
                const leaves = await Leave.find({ studentId: id }).sort({ createdAt: -1 });
                const assignments = await Assignment.find({ 
                    $or: [
                        { classSectionId: studentProfile.classSection?._id },
                        { standardId: studentProfile.standard?._id }
                    ]
                }).sort({ dueDate: -1 }).limit(10);

                const timetableRaw = studentProfile.classSection ? await Timetable.findOne({ classSection: studentProfile.classSection._id })
                    .populate('schedule.periods.subject', 'name')
                    .populate('schedule.periods.teacher', 'firstName lastName') : null;
                
                let timetable = [];
                if (timetableRaw) {
                    timetableRaw.schedule.forEach(dayNode => {
                        dayNode.periods.forEach(per => {
                            timetable.push({
                                day: dayNode.day,
                                courseId: { name: per.subject?.name || 'Institutional Period' },
                                teacherId: { name: per.teacher ? `${per.teacher.firstName} ${per.teacher.lastName}` : 'TBD' },
                                startTime: per.startTime,
                                endTime: per.endTime
                            });
                        });
                    });
                }

                const fees = await FeePayment.find({ studentId: id }).sort({ date: -1 }).limit(10);

                studentDetails = { results, attendance, leaves, assignments, timetable, fees };
            }

            return res.status(200).json({
                success: true,
                role: 'Student',
                data: {
                    ...studentProfile._doc,
                    ...studentDetails
                }
            });
        }

        // 2. Try to find in User model
        let user = await User.findById(id).select('-password').populate('schoolId', 'name logo');
        
        let teacherRecord = null;
        if (!user) {
            // 3. Try to find in Teacher model directly (using Teacher _id)
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
            if (viewerRole === 'School_Admin' || viewerRole === 'Super_Admin' || viewerId.toString() === activeId.toString() || (teacherRecord && viewerId.toString() === teacherRecord._id.toString())) {
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
        } else if (user.role === 'Accountant' || user.role === 'Librarian' || user.role === 'Transport_Manager') {
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
        const users = await User.find(query);
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



