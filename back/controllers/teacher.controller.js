const Teacher = require('../models/teacher.model');
const Timetable = require('../models/timetable.model');
const Student = require('../models/student.model');
const TimetableTemplate = require('../models/timetableTemplate.model');
const nc = require('./notification.controller');
const ClassSection = require('../models/classSection.model');
const Attendance = require('../models/attendance.model');
const Exam = require('../models/exam.model');
const Mark = require('../models/mark.model');
const Assignment = require('../models/assignment.model');
const Message = require('../models/message.model');
const Leave = require('../models/leave.model');
const User = require('../models/user.model');
const Submission = require('../models/submission.model');
const Payroll = require('../models/payroll.model');
const bcrypt = require('bcrypt');

// Helper to get teacher record by user ID
const getTeacher = async (userId) => {
  return await Teacher.findOne({ userId }).populate('schoolId');
};

// 0. Dashboard Stats ──────────────────────────────────────────────────────────
exports.getTeacherDashboard = async (req, res) => {
  try {
    const teacherProfile = await getTeacher(req.user._id);
    if (!teacherProfile) return res.status(404).json({ message: 'Teacher profile node not found' });

    // 1. Assigned classes & student count
    const assignedClasses = await ClassSection.find({
      $or: [
        { classTeacher: teacherProfile._id },
        { 'subjectAssignments.teachers': teacherProfile._id }
      ]
    }).populate('standardId');
    const classIds = assignedClasses.map(c => c._id);
    const studentsCount = await Student.countDocuments({ classSection: { $in: classIds }, deletedAt: null });

    // 2. Attendance % (last 30 days overall average for those classes)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const attendanceRecords = await Attendance.find({ 
        classSection: { $in: classIds },
        date: { $gte: thirtyDaysAgo }
    });

    let totalPossible = 0;
    let totalPresent = 0;
    attendanceRecords.forEach(att => {
        att.records.forEach(r => {
            totalPossible++;
            if (r.status === 'Present') totalPresent++;
        });
    });
    const attendancePercentage = totalPossible > 0 ? Number(((totalPresent / totalPossible) * 100).toFixed(1)) : 0;

    // 3. Assignment stats (active vs total)
    const assignments = await Assignment.find({ createdBy: req.user._id });
    const assignmentCount = assignments.length;
    
    // Top 4 assignments with submission counts
    const recentAssignments = await Promise.all(
        assignments.slice(-4).reverse().map(async (a) => {
            const count = await Submission.countDocuments({ assignmentId: a._id });
            return {
                id: a._id,
                title: a.title,
                dueDate: a.dueDate,
                subject: a.subject,
                submissions: count
            };
        })
    );

    // 4. Classes Summary Grid
    const classesGrid = await Promise.all(assignedClasses.map(async (c) => {
        const count = await Student.countDocuments({ classSection: c._id, deletedAt: null });
        return {
            id: c._id,
            section: c.sectionLabel,
            standard: c.standardId?.level || c.standardId || 'N/A', // Support both populated object and raw level if needed
            students: count
        };
    }));

    res.json({
        stats: {
            classes: assignedClasses.length,
            students: studentsCount,
            attendance: attendancePercentage,
            assignments: assignmentCount
        },
        recentAssignments,
        classesGrid
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// 1. View assigned classes ───────────────────────────────────────────────────
exports.getAssignedClasses = async (req, res) => {
  try {
    const teacher = await getTeacher(req.user._id);
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

    const classes = await ClassSection.find({
      $or: [
        { classTeacher: teacher._id },
        { 'subjectAssignments.teachers': teacher._id }
      ]
    }).populate('standardId', 'level').populate('subjects', 'name');
    res.json(classes);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// 2. Mark attendance ─────────────────────────────────────────────────────────—
exports.markAttendance = async (req, res) => {
  try {
    const { classSection, date, records } = req.body;
    const teacher = await getTeacher(req.user._id);

    // Verify teacher is assigned to this class
    const isAssigned = await ClassSection.findOne({
      _id: classSection,
      $or: [{ classTeacher: teacher._id }, { assignedTeachers: teacher._id }]
    });

    if (!isAssigned) return res.status(403).json({ message: 'Access denied: You are not assigned to this class' });

    const attendance = await Attendance.findOneAndUpdate(
      { schoolId: teacher.schoolId._id, classSection, date: new Date(date) },
      { schoolId: teacher.schoolId._id, classSection, date: new Date(date), records, submittedBy: req.user._id },
      { upsert: true, new: true }
    );
    res.json({ message: 'Attendance registry synchronized', attendance });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// 3. Add marks ────────────────────────────────────────────────────────────────
exports.addMarks = async (req, res) => {
  try {
    const { examId, studentMarks } = req.body; // studentMarks: [{ studentId: ID, score: Number, remarks: String }]
    const teacher = await getTeacher(req.user._id);

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Assessment node not found' });

    // Verify teacher is assigned to the exam's class
    const isAssigned = await ClassSection.findOne({
      _id: exam.classSection,
      $or: [{ classTeacher: teacher._id }, { assignedTeachers: teacher._id }]
    });

    if (!isAssigned) return res.status(403).json({ message: 'Access denied: You are not assigned to this class' });

    const marks = await Promise.all(studentMarks.map(item => 
      Mark.findOneAndUpdate(
        { schoolId: teacher.schoolId._id, examId, studentId: item.studentId },
        { marksObtained: item.score, remarks: item.remarks, submittedBy: req.user._id },
        { upsert: true, new: true }
      )
    ));

    // Trigger Notifications for students
    Promise.all(studentMarks.map(m => nc.sendNotification({
        schoolId: teacher.schoolId._id,
        recipient: m.studentId,
        sender: req.user._id,
        type: 'Mark',
        title: `Performance Assessment: ${exam.title}`,
        message: `Grade secured for ${exam.subject}: ${m.score}/${exam.maxMarks}`,
        link: '/student/results'
    })));

    res.json({ message: 'Performance metrics localized', marks });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// 4. Upload assignment ────────────────────────────────────────────────────────
exports.uploadAssignment = async (req, res) => {
  try {
    const { classSection, title, description, subject, dueDate } = req.body;
    const teacher = await getTeacher(req.user._id);
    const fileUrl = req.file ? req.file.location : null;

    // Verify assignment
    const isAssigned = await ClassSection.findOne({
      _id: classSection,
      $or: [{ classTeacher: teacher._id }, { assignedTeachers: teacher._id }]
    });

    if (!isAssigned) return res.status(403).json({ message: 'Access denied: You are not assigned to this class' });

    const assignment = await Assignment.create({
      schoolId: teacher.schoolId._id,
      classSection, title, description, subject,
      dueDate: new Date(dueDate),
      fileUrl,
      createdBy: req.user._id
    });

    // Notify all students in this class
    const students = await Student.find({ classSection });
    Promise.all(students.map(s => nc.sendNotification({
        schoolId: teacher.schoolId._id,
        recipient: s._id,
        sender: req.user._id,
        type: 'Assignment',
        title: 'New Homework Provisioned',
        message: `${subject}: ${title} (Due: ${new Date(dueDate).toLocaleDateString()})`,
        link: '/student/assignments'
    })));

    res.status(201).json({ message: 'Instructional material synchronized', assignment });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const socketManager = require('../socketManager/socketManager');

// 5. Communicate with students/parents ───────────────────────────────────────—
exports.sendMessage = async (req, res) => {
  try {
    const { targetRole, classSection, subject, content, recipient } = req.body;
    const teacher = await getTeacher(req.user._id);
    const fileUrl = req.file ? req.file.location : null;

    // Create institutional message
    const message = await Message.create({
      schoolId: teacher.schoolId._id,
      sender: req.user._id,
      recipient: recipient || null,
      targetRole: targetRole || 'Student',
      type: recipient ? 'DirectMessage' : 'Announcement',
      classSection: classSection || null,
      subject, content, fileUrl
    });

    const populated = await message.populate('sender', 'firstName lastName photo role');

    // Real-time notification
    if (recipient) {
        socketManager.sendToUser(recipient, 'new_direct_message', populated);
    } else {
        socketManager.broadcastToRole(targetRole || 'Student', 'new_announcement', populated);
    }

    res.status(201).json({ message: 'Communication broadcasted successfully', data: populated });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// 6. View Assigned Class Students ─────────────────────────────────────────────
exports.getAssignedClassStudents = async (req, res) => {
    try {
        const { classId } = req.params;
        const teacher = await getTeacher(req.user._id);

        const isAssigned = await ClassSection.findOne({
            _id: classId,
            $or: [{ classTeacher: teacher._id }, { assignedTeachers: teacher._id }]
        });

        if (!isAssigned) return res.status(403).json({ message: 'Access denied: You are not assigned to this class' });

        const students = await Student.find({ classSection: classId });
        res.json(students);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getStudentDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher = await getTeacher(req.user._id);

        const student = await Student.findById(id).populate('classSection standardId');
        if (!student) return res.status(404).json({ message: 'Student search term not found in registry' });

        // Verify teacher belongs to the same class or is a subject teacher
        const isAssigned = await ClassSection.findOne({
            _id: student.classSection._id,
            $or: [{ classTeacher: teacher._id }, { assignedTeachers: teacher._id }]
        });

        if (!isAssigned) return res.status(403).json({ message: 'Access denied: Target student not in assigned sectors' });

        // 1. Attendance History (Last 90 days)
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const attendance = await Attendance.find({
            classSection: student.classSection._id,
            date: { $gte: ninetyDaysAgo },
            'records.studentId': id
        }).select('date records');

        const attendanceSummary = attendance.map(a => ({
            date: a.date,
            status: a.records.find(r => r.studentId.toString() === id)?.status || 'N/A'
        }));

        // 2. Exam Marks
        const exams = await Exam.find({ schoolId: teacher.schoolId._id, 'studentMarks.studentId': id });
        const examSummary = exams.map(e => ({
            title: e.title,
            subject: e.subject,
            maxMarks: e.maxMarks,
            score: e.studentMarks.find(m => m.studentId.toString() === id)?.score || 0
        }));

        // 3. Assignment Submissions
        const submissions = await Submission.find({ studentId: id }).populate('assignmentId', 'title subject dueDate');

        res.json({
            student,
            attendance: attendanceSummary,
            exams: examSummary,
            submissions
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 7. View Exams for assigned class ─────────────────────────────────────────────
exports.getExamsByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const teacher = await getTeacher(req.user._id);

        const isAssigned = await ClassSection.findOne({
            _id: classId,
            $or: [{ classTeacher: teacher._id }, { assignedTeachers: teacher._id }]
        });

        if (!isAssigned) return res.status(403).json({ message: 'Access denied: You are not assigned to this class' });

        const exams = await Exam.find({ classSection: classId });
        res.json(exams);
    } catch (err) { res.status(500).json({ message: err.message }); }
};
// 8. Fetch existing attendance for editing ──────────────────────────────────
exports.getAttendanceByClassAndDate = async (req, res) => {
    try {
        const { classId, date } = req.query;
        const teacher = await getTeacher(req.user._id);

        const isAssigned = await ClassSection.findOne({
            _id: classId,
            $or: [{ classTeacher: teacher._id }, { assignedTeachers: teacher._id }]
        });

        if (!isAssigned) return res.status(403).json({ message: 'Access denied: You are not assigned to this class' });

        const att = await Attendance.find({ 
            schoolId: teacher.schoolId._id, 
            classSection: classId, 
            date: new Date(date) 
        });
        res.json(att);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 9. Fetch existing marks for an exam ──────────────────────────────────────────
exports.getMarksByExam = async (req, res) => {
    try {
        const { examId } = req.params;
        const teacher = await getTeacher(req.user._id);

        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ message: 'Assessment node not found' });

        const isAssigned = await ClassSection.findOne({
            _id: exam.classSection,
            $or: [{ classTeacher: teacher._id }, { assignedTeachers: teacher._id }]
        });

        if (!isAssigned) return res.status(403).json({ message: 'Access denied: You are not assigned to this class' });

        const marks = await Mark.find({ 
            schoolId: teacher.schoolId._id, 
            examId 
        });
        res.json(marks);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 10. Homework (Assignment) Lifecycle Controls ──────────────────────────────────
exports.getAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({ createdBy: req.user._id })
            .populate({
                path: 'classSection',
                select: 'sectionLabel standardId',
                populate: { path: 'standardId', select: 'gradeLevel' }
            })
            .sort({ createdAt: -1 });
        res.json(assignments);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAssignmentSubmissions = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher = await getTeacher(req.user._id);

        const assignment = await Assignment.findById(id);
        if (!assignment) return res.status(404).json({ message: 'Assignment registry not found' });

        if (assignment.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied: You are not the author of this assignment' });
        }

        const submissions = await Submission.find({ assignmentId: id }).populate('studentId', 'firstName lastName studentId');
        res.json(submissions);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.gradeSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const { score, feedback } = req.body;
        const teacher = await getTeacher(req.user._id);

        const submission = await Submission.findById(id).populate('assignmentId');
        if (!submission) return res.status(404).json({ message: 'Submission node not found' });

        if (submission.assignmentId.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied: You are not authorized to grade this deliverable' });
        }

        submission.marks = score;
        submission.feedback = feedback;
        submission.status = 'Graded';
        await submission.save();

        // Notify student
        nc.sendNotification({
            schoolId: teacher.schoolId._id,
            recipient: submission.studentId,
            sender: req.user._id,
            type: 'Assignment',
            title: 'Academic Deliverable Evaluated',
            message: `Submission for ${submission.assignmentId.title} graded: ${score}`,
            link: '/student/assignments'
        });

        res.json({ message: 'Academic deliverable graded successfully', submission });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const { classSection, title, description, subject, dueDate } = req.body;
        const updateData = { classSection, title, description, subject, dueDate: new Date(dueDate) };
        if (req.file) updateData.fileUrl = req.file.location;

        const assignment = await Assignment.findOneAndUpdate(
            { _id: id, createdBy: req.user._id },
            updateData,
            { new: true }
        );
        if (!assignment) return res.status(404).json({ message: 'Homework node not found' });
        res.json({ message: 'Homework node mapping updated', assignment });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const assignment = await Assignment.findOneAndDelete({ _id: id, createdBy: req.user._id });
        if (!assignment) return res.status(404).json({ message: 'Homework node not found' });
        res.json({ message: 'Homework decommissioned successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 11. Leave Management (Teacher Side) ──────────────────────────────────────────
exports.applyLeave = async (req, res) => {
    try {
        const { type, startDate, endDate, reason } = req.body;
        const teacher = await getTeacher(req.user._id);
        if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

        const leave = await Leave.create({
            schoolId: teacher.schoolId._id,
            teacherId: teacher._id,
            type, startDate, endDate, reason
        });

        res.status(201).json({ message: 'Leave application submitted successfully', leave });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMyLeaves = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

        const leaves = await Leave.find({ teacherId: teacher._id }).sort({ createdAt: -1 });
        res.json(leaves);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 13. Attendance Analytics (Teacher Specific) ──────────────────────────────────
exports.getAttendanceAnalytics = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        if (!teacher) return res.status(404).json({ message: 'Teacher profile node not found' });

        const assignedClasses = await ClassSection.find({
            $or: [{ classTeacher: teacher._id }, { assignedTeachers: teacher._id }]
        });
        const classIds = assignedClasses.map(c => c._id);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const attendance = await Attendance.find({
            classSection: { $in: classIds },
            date: { $gte: thirtyDaysAgo }
        }).sort({ date: 1 });

        // Calculate trends
        const dailyStats = {};
        attendance.forEach(record => {
            const dateStr = record.date.toISOString().split('T')[0];
            if (!dailyStats[dateStr]) dailyStats[dateStr] = { total: 0, present: 0 };
            
            record.records.forEach(r => {
                dailyStats[dateStr].total++;
                if (r.status === 'Present') dailyStats[dateStr].present++;
            });
        });

        const timeline = Object.keys(dailyStats).map(date => ({
            date,
            percentage: Number(((dailyStats[date].present / dailyStats[date].total) * 100).toFixed(1))
        }));

        // Calculate class-wise summary
        const classWise = await Promise.all(assignedClasses.map(async (c) => {
            const classAttendance = attendance.filter(a => a.classSection.toString() === c._id.toString());
            let cTotal = 0, cPresent = 0;
            classAttendance.forEach(a => {
                a.records.forEach(r => {
                    cTotal++;
                    if (r.status === 'Present') cPresent++;
                });
            });
            return {
                section: c.sectionLabel,
                percentage: cTotal > 0 ? Number(((cPresent / cTotal) * 100).toFixed(1)) : 0
            };
        }));

        res.json({ timeline, classWise });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 12. Profile Management ───────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ userId: req.user._id }).populate('userId', 'photo email role');
        if (!teacher) return res.status(404).json({ message: 'Teacher profile node not found' });
        res.json(teacher);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateProfile = async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ userId: req.user._id });
        if (!teacher) return res.status(404).json({ message: 'Teacher profile node not found' });

        const { firstName, lastName, phone, qualifications } = req.body;
        
        // Update Teacher Record
        teacher.firstName = firstName || teacher.firstName;
        teacher.lastName = lastName || teacher.lastName;
        teacher.phone = phone || teacher.phone;
        if (qualifications) {
            teacher.qualifications = Array.isArray(qualifications) ? qualifications : qualifications.split(',').map(q => q.trim());
        }
        await teacher.save();

        // Sync with User Record
        const userUpdate = { firstName, lastName };
        if (req.file) userUpdate.photo = req.file.location;
        await User.findByIdAndUpdate(req.user._id, userUpdate);

        res.json({ message: 'Professional profile synchronized successfully', teacher });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect old password' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: 'Security credentials updated successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 15. Get My Payroll Registry ────────────────────────────────────────────────
exports.getMyPayroll = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        const payroll = await Payroll.find({ teacherId: teacher._id })
            .sort({ year: -1, month: -1 });
        res.json(payroll);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = {
  getTeacherDashboard: exports.getTeacherDashboard,
  getAssignedClasses: exports.getAssignedClasses,
  getAssignedClassStudents: exports.getAssignedClassStudents,
  getStudentDetail: exports.getStudentDetail,
  getExamsByClass: exports.getExamsByClass,
  getAttendanceByClassAndDate: exports.getAttendanceByClassAndDate,
  getMarksByExam: exports.getMarksByExam,
  markAttendance: exports.markAttendance,
  addMarks: exports.addMarks,
  uploadAssignment: exports.uploadAssignment,
  getAssignments: exports.getAssignments,
  updateAssignment: exports.updateAssignment,
  getAssignmentSubmissions: exports.getAssignmentSubmissions,
  gradeSubmission: exports.gradeSubmission,
  deleteAssignment: exports.deleteAssignment,
  applyLeave: exports.applyLeave,
  getMyLeaves: exports.getMyLeaves,
  getAttendanceAnalytics: exports.getAttendanceAnalytics,
  getProfile: exports.getProfile,
  updateProfile: exports.updateProfile,
  changePassword: exports.changePassword,
  sendMessage: exports.sendMessage,
  getMyPayroll: exports.getMyPayroll
};
