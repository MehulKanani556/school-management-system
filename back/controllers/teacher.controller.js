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
const Review = require('../models/review.model');
const Payroll = require('../models/payroll.model');
const LessonPlan = require('../models/lessonPlan.model');
const BehaviorLog = require('../models/behaviorLog.model');
const Meeting = require('../models/meeting.model');
const ResourceLocker = require('../models/resourceLocker.model');
const QuestionBank = require('../models/questionBank.model');
const Quiz = require('../models/quiz.model');
const Question = require('../models/question.model');
const QuizAttempt = require('../models/quizAttempt.model');
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

        // 5. Upcoming Deadlines (within next 3 days)
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        const deadlinesCount = await Assignment.countDocuments({
            createdBy: req.user._id,
            dueDate: { $gte: new Date(), $lte: threeDaysFromNow }
        });

        res.json({
            stats: {
                classes: assignedClasses.length,
                students: studentsCount,
                attendance: attendancePercentage,
                assignments: assignmentCount,
                upcomingDeadlines: deadlinesCount
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

// 1b. Get teacher's subjects and standards (for quiz creation dropdowns)
exports.getTeacherContext = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

        const classes = await ClassSection.find({
            $or: [
                { classTeacher: teacher._id },
                { 'subjectAssignments.teachers': teacher._id }
            ]
        })
            .populate('standardId', 'level name _id')
            .populate('subjects', 'name _id')
            .populate('subjectAssignments.subject', 'name _id')
            .lean();

        // Deduplicate standards
        const standardMap = new Map();
        classes.forEach(c => {
            if (c.standardId) standardMap.set(c.standardId._id.toString(), c.standardId);
        });

        // Deduplicate subjects — from both class.subjects and subjectAssignments
        const subjectMap = new Map();
        classes.forEach(c => {
            (c.subjects || []).forEach(s => { if (s) subjectMap.set(s._id.toString(), s); });
            (c.subjectAssignments || []).forEach(sa => {
                if (sa.subject) subjectMap.set(sa.subject._id.toString(), sa.subject);
            });
        });

        res.json({
            standards: Array.from(standardMap.values()),
            subjects: Array.from(subjectMap.values())
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 2. Mark attendance ─────────────────────────────────────────────────────────—
exports.markAttendance = async (req, res) => {
    try {
        const { classSection, classSectionId, date, records } = req.body;
        const targetClass = classSection || classSectionId;
        const teacher = await getTeacher(req.user._id);


        // Verify teacher is assigned to this class
        const isAssigned = await ClassSection.findOne({
            _id: targetClass,
            $or: [{ classTeacher: teacher._id }, { 'subjectAssignments.teachers': teacher._id }]
        });

        if (!isAssigned) return res.status(403).json({ message: 'Access denied: You are not assigned to this class' });

        const attendance = await Attendance.findOneAndUpdate(
            { schoolId: teacher.schoolId._id, classSection: targetClass, date: new Date(date) },
            { schoolId: teacher.schoolId._id, classSection: targetClass, date: new Date(date), records, submittedBy: req.user._id },
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
            $or: [{ classTeacher: teacher._id }, { 'subjectAssignments.teachers': teacher._id }]
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
            $or: [{ classTeacher: teacher._id }, { 'subjectAssignments.teachers': teacher._id }]
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
            socketManager.sendToUser(recipient, 'NEW_MESSAGE', {
                ...populated.toJSON(),
                senderName: `${populated.sender.firstName} ${populated.sender.lastName}`
            });
        } else {
            socketManager.broadcastToRole(targetRole || 'Student', 'NEW_ANNOUNCEMENT', populated);
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
            $or: [{ classTeacher: teacher._id }, { 'subjectAssignments.teachers': teacher._id }]
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

        const student = await Student.findById(id).populate('classSection standard');
        if (!student) return res.status(404).json({ message: 'Student search term not found in registry' });

        // Verify teacher belongs to the same class or is a subject teacher
        const isAssigned = await ClassSection.findOne({
            _id: student.classSection._id,
            $or: [{ classTeacher: teacher._id }, { 'subjectAssignments.teachers': teacher._id }]
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
        const marks = await Mark.find({ studentId: id, schoolId: teacher.schoolId._id })
            .populate({ path: 'examId', populate: { path: 'subject' } });
        const examSummary = marks.map(m => ({
            title: m.examId?.name, subject: m.examId?.subject?.name,
            maxMarks: m.examId?.maxMarks, score: m.marksObtained
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
// (Removed duplicate getExamsByClass that was causing 403 error due to missing params)

// 8. Fetch existing attendance for editing ──────────────────────────────────
exports.getAttendanceByClassAndDate = async (req, res) => {
    try {
        const { classId, classSection, sectionId, date } = req.query;
        const targetRef = classId || classSection || sectionId;
        const teacher = await getTeacher(req.user._id);

        const isAssigned = await ClassSection.findOne({
            _id: targetRef,
            $or: [{ classTeacher: teacher._id }, { 'subjectAssignments.teachers': teacher._id }]
        });

        if (!isAssigned) return res.status(403).json({ message: 'Access denied: You are not assigned to this class' });

        const att = await Attendance.find({
            schoolId: teacher.schoolId._id,
            classSection: targetRef,
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
            $or: [{ classTeacher: teacher._id }, { 'subjectAssignments.teachers': teacher._id }]
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



exports.fetchMyMessages = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        const messages = await Message.find({
            $or: [
                { sender: req.user._id },
                { recipient: req.user._id },
                { targetRole: 'Teacher', schoolId: teacher.schoolId._id },
                { type: 'Announcement', schoolId: teacher.schoolId._id }
            ]
        }).sort({ createdAt: -1 });
        res.json(messages);
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
            $or: [{ classTeacher: teacher._id }, { 'subjectAssignments.teachers': teacher._id }]
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

// 16. Student Fee Status (Read-only for teachers) ──────────────────────────
exports.getStudentFeeStatus = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        const assignedClasses = await ClassSection.find({
            $or: [{ classTeacher: teacher._id }, { 'subjectAssignments.teachers': teacher._id }]
        });
        const classIds = assignedClasses.map(c => c._id);

        const students = await Student.find({ classSection: { $in: classIds }, deletedAt: null })
            .populate('classSection', 'sectionLabel')
            .populate('standard', 'level');

        const FeePayment = require('../models/feePayment.model');
        const feeStatus = await Promise.all(students.map(async (s) => {
            const fees = await FeePayment.find({ studentId: s._id });
            const pendingAmount = fees.reduce((acc, f) => acc + (f.status !== 'paid' ? (f.totalAmount - f.paidAmount) : 0), 0);
            return {
                studentId: s._id,
                name: `${s.firstName} ${s.lastName}`,
                admissionNumber: s.admissionNumber,
                class: `Grade ${s.standard?.level || 'N/A'}-${s.classSection?.sectionLabel || '?'}`,
                totalPending: pendingAmount,
                status: pendingAmount > 0 ? 'Pending' : 'Cleared'
            };
        }));

        res.json(feeStatus);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 17. Subject-wise Performance Report ─────────────────────────────────────────
exports.getPerformanceAnalytics = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

        const assignedClasses = await ClassSection.find({
            $or: [{ classTeacher: teacher._id }, { 'subjectAssignments.teachers': teacher._id }]
        });
        const classIds = assignedClasses.map(c => c._id);
        const standardIds = assignedClasses.map(c => c.standardId).filter(Boolean);

        const exams = await Exam.find({
            $or: [
                { classSection: { $in: classIds } },
                { standardId: { $in: standardIds }, classSection: null }
            ],
            schoolId: teacher.schoolId._id
        });
        const examIds = exams.map(e => e._id);

        const marks = await Mark.find({ schoolId: teacher.schoolId._id, examId: { $in: examIds } })
            .populate({ path: 'examId', populate: { path: 'subject', select: 'name' } })
            .populate('studentId', 'firstName lastName');

        console.log('Performance Diagnostic:', { classIds, examIds: examIds.length, marks: marks.length });

        // Group by subject
        const stats = {};
        marks.forEach(m => {
            if (!m.examId || !m.examId.subject) return;
            const subject = m.examId.subject.name;
            if (!stats[subject]) {
                stats[subject] = {
                    subject,
                    totalScore: 0,
                    studentCount: 0,
                    maxScore: 0,
                    minScore: m.marksObtained,
                    maxPossible: 0
                };
            }
            stats[subject].totalScore += m.marksObtained;
            stats[subject].studentCount++;
            stats[subject].maxScore = Math.max(stats[subject].maxScore, m.marksObtained);
            stats[subject].minScore = Math.min(stats[subject].minScore, m.marksObtained);
            stats[subject].maxPossible += m.examId.maxMarks;
        });

        const result = Object.values(stats).map(s => ({
            subject: s.subject,
            averageScore: (s.totalScore / s.studentCount),
            averagePercentage: (s.totalScore / s.maxPossible) * 100,
            maxScore: s.maxScore,
            minScore: s.minScore,
            studentCount: s.studentCount
        }));

        res.json(result);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 18. Student Full Attendance History ────────────────────────────────────────
exports.getStudentFullAttendance = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ message: 'Student archive not found' });

        const attendance = await Attendance.find({
            'records.studentId': studentId
        }).sort({ date: -1 });

        const history = attendance.map(a => {
            const record = a.records.find(r => r.studentId.toString() === studentId);
            return {
                date: a.date,
                status: record.status,
                remarks: record.remarks
            };
        });

        res.json(history);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 19. Retract/Delete Announcement ─────────────────────────────────────────────
exports.deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await Message.findById(id);

        if (!message) return res.status(404).json({ message: 'Directive not found' });
        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized: Transmission retraction denied' });
        }

        await Message.findByIdAndDelete(id);
        res.json({ message: 'Institutional directive retracted successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.bulkAttendanceImport = async (req, res) => {
    try {
        const { classSectionId, date, attendanceData } = req.body;
        if (!classSectionId || !date || !attendanceData) return res.status(400).json({ message: "Incomplete sector data" });

        const teacher = await getTeacher(req.user._id);

        // Find or create the attendance document for this class and date
        const cs = await ClassSection.findById(classSectionId);
        const attendance = await Attendance.findOneAndUpdate(
            { schoolId: teacher.schoolId._id, classSection: classSectionId, date: new Date(date) },
            { $setOnInsert: { standardId: cs.standardId, submittedBy: req.user._id } },
            { upsert: true, new: true }
        );

        // Update records array - replace or add student records
        const currentRecords = attendance.records || [];
        attendanceData.forEach(entry => {
            const index = currentRecords.findIndex(r => r.studentId.toString() === entry.studentId.toString());
            if (index !== -1) {
                currentRecords[index].status = entry.status;
            } else {
                currentRecords.push({ studentId: entry.studentId, status: entry.status });
            }
        });

        attendance.records = currentRecords;
        attendance.submittedBy = req.user._id;
        await attendance.save();

        res.json({ message: `Synchronized ${attendanceData.length} records successfully.`, count: attendanceData.length });
    } catch (error) {
        res.status(500).json({ message: "Cluster synchronization failure", error: error.message });
    }
};

exports.getMyReviews = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        if (!teacher) return res.status(404).json({ message: 'Teacher profile node not found' });

        const reviews = await Review.find({ teacherId: teacher._id })
            .populate('reviewerId', 'firstName lastName photo role')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getUnifiedCalendar = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        const [timetable, exams, assignments, leaves] = await Promise.all([
            Timetable.find({ 'schedule.periods.teacher': teacher._id })
                .populate({
                    path: 'classSection',
                    populate: { path: 'standardId' }
                })
                .populate('schedule.periods.subject')
                .populate('schedule.periods.teacher'),
            Exam.find({ schoolId: teacher.schoolId._id }).populate('classSection'),
            Assignment.find({ createdBy: req.user._id }),
            Leave.find({ teacherId: teacher._id, status: 'approved' })
        ]);

        res.json({ timetable, exams, assignments, leaves });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 19. Get exams for teacher's assigned classes ──────────────────────────────
exports.getExamsByClass = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        const assignedClasses = await ClassSection.find({
            $or: [{ classTeacher: teacher._id }, { 'subjectAssignments.teachers': teacher._id }]
        });
        const standardIds = assignedClasses.map(c => c.standardId);

        const exams = await Exam.find({
            $or: [
                { classSection: { $in: assignedClasses.map(c => c._id) } },
                { standardId: { $in: standardIds }, classSection: null }
            ],
            schoolId: teacher.schoolId._id
        })
            .populate('subject', 'name')
            .sort({ date: 1 });

        // Transform to match frontend expectations if necessary
        const formatted = exams.map(e => ({
            _id: e._id,
            subject: e.subject?.name || 'Unknown',
            title: e.name,
            date: e.date,
            maxMarks: e.maxMarks,
            type: e.type
        }));

        res.json(formatted);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 21. Lesson Plans ──────────────────────────────────────────────────────────
exports.getLessonPlans = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        const plans = await LessonPlan.find({ teacherId: teacher._id })
            .populate('classSection', 'sectionLabel')
            .populate('subject', 'name')
            .sort({ date: -1 });
        res.json(plans);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createLessonPlan = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        const newPlan = new LessonPlan({ ...req.body, teacherId: teacher._id, schoolId: teacher.schoolId._id });
        await newPlan.save();
        res.status(201).json({ message: 'Pedagogical directive ARCHIVED successfully', plan: newPlan });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateLessonPlan = async (req, res) => {
    try {
        await LessonPlan.findByIdAndUpdate(req.params.id, req.body);
        res.json({ message: 'Synchronized pedagogical metadata' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteLessonPlan = async (req, res) => {
    try {
        await LessonPlan.findByIdAndDelete(req.params.id);
        res.json({ message: 'Pedagogical directive DELETED successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 22. Behavior / Discipline Log ────────────────────────────────────────────────
exports.logBehavior = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        const log = new BehaviorLog({ ...req.body, teacherId: teacher._id, schoolId: teacher.schoolId._id });
        await log.save();
        res.status(201).json({ message: 'Conduct vector localized to student registry' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getBehaviorLogs = async (req, res) => {
    try {
        const { studentId, classId } = req.query;
        let query = {};
        if (studentId) query.studentId = studentId;
        if (classId) {
            const students = await Student.find({ classSection: classId }).select('_id');
            query.studentId = { $in: students };
        }
        const logs = await BehaviorLog.find(query).populate('studentId', 'firstName lastName').populate('teacherId', 'firstName lastName').sort({ date: -1 });
        res.json(logs);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 23. Parent-Teacher Meetings (PTM) ───────────────────────────────────────────
exports.scheduleMeeting = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        const meeting = new Meeting({ ...req.body, teacherId: teacher._id, schoolId: teacher.schoolId._id });
        await meeting.save();
        const populated = await meeting.populate('studentId', 'firstName lastName');
        res.status(201).json({ message: 'Temporal assessment protocol SYNCHRONIZED', meeting: populated });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMeetings = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        const meetings = await Meeting.find({ teacherId: teacher._id })
            .populate('studentId', 'firstName lastName')
            .sort({ date: 1, startTime: 1 });
        res.json(meetings);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateMeeting = async (req, res) => {
    try {
        await Meeting.findByIdAndUpdate(req.params.id, req.body);
        res.json({ message: 'Synchronized meeting temporal data' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteMeeting = async (req, res) => {
    try {
        await Meeting.findByIdAndDelete(req.params.id);
        res.json({ message: 'Temporal assessment protocol DELETED' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};


// Digital Resource Locker ────────────────────────────────────────────────────────
exports.uploadResource = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        const resource = new ResourceLocker({
            ...req.body,
            teacherId: teacher._id,
            schoolId: teacher.schoolId._id,
        });
        if (req.file) {
            resource.fileUrl = req.file.location || req.file.path;
        }
        await resource.save();
        res.status(201).json({ message: 'Resource archived successfully', resource });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getResources = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        const resources = await ResourceLocker.find({ teacherId: teacher._id })
            .populate('classSection', 'sectionLabel gradeLevel')
            .populate('subject', 'name')
            .sort({ uploadDate: -1 });
        res.json(resources);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteResource = async (req, res) => {
    try {
        await ResourceLocker.findByIdAndDelete(req.params.id);
        res.json({ message: 'Resource expunged successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// Question Bank ────────────────────────────────────────────────────────────────
exports.addQuestion = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        const question = new QuestionBank({
            ...req.body,
            teacherId: teacher._id,
            schoolId: teacher.schoolId._id
        });
        await question.save();
        res.status(201).json({ message: 'Evaluation node recorded successfully', question });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getQuestions = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        const { subjectId, classLevel } = req.query;
        let query = { teacherId: teacher._id };
        if (subjectId) query.subject = subjectId;
        if (classLevel) query.classLevel = classLevel;

        const questions = await QuestionBank.find(query)
            .populate('subject', 'name')
            .sort({ createdAt: -1 });
        res.json(questions);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.generateExam = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        const { subject, classLevel, totalMarks } = req.body;

        const questions = await QuestionBank.find({
            teacherId: teacher._id,
            subject,
            classLevel
        });

        // Simple random generation logic
        let examPaper = [];
        let currentMarks = 0;
        const shuffled = questions.sort(() => 0.5 - Math.random());

        for (let q of shuffled) {
            if (currentMarks + q.marks <= totalMarks) {
                examPaper.push(q);
                currentMarks += q.marks;
            }
            if (currentMarks >= totalMarks) break;
        }

        res.json({
            message: 'Academic assessment generation complete',
            examPaper,
            totalMarks: currentMarks
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
};
// 24. Quiz Management ──────────────────────────────────────────────────────────
exports.getMyQuizzes = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        const quizzes = await Quiz.find({ createdBy: req.user._id, schoolId: teacher.schoolId._id })
            .populate('subjectId', 'name')
            .populate('standardId', 'level')
            .populate('questions')
            .sort({ createdAt: -1 });
        res.json(quizzes);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createQuiz = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        const { title, description, subjectId, standardId, duration, passingScore, questions } = req.body;

        // Create questions first
        const createdQuestions = await Promise.all(
            (questions || []).map(q => Question.create({
                quizId: null, // will update after quiz creation
                text: q.text,
                options: q.options,
                correctAnswer: q.correctAnswer,
                points: q.points || 10
            }))
        );

        const quiz = await Quiz.create({
            title, description, subjectId, standardId,
            schoolId: teacher.schoolId._id,
            createdBy: req.user._id,
            duration: duration || 30,
            passingScore: passingScore || 40,
            questions: createdQuestions.map(q => q._id),
            isPublished: false
        });

        // Back-fill quizId on questions
        await Question.updateMany(
            { _id: { $in: createdQuestions.map(q => q._id) } },
            { quizId: quiz._id }
        );

        res.status(201).json({ message: 'Quiz node created', quiz });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, subjectId, standardId, duration, passingScore } = req.body;
        const quiz = await Quiz.findOneAndUpdate(
            { _id: id, createdBy: req.user._id },
            { title, description, subjectId, standardId, duration, passingScore },
            { new: true }
        ).populate('subjectId', 'name').populate('standardId', 'level').populate('questions');
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        res.json({ message: 'Quiz updated', quiz });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const quiz = await Quiz.findOneAndDelete({ _id: id, createdBy: req.user._id });
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        await Question.deleteMany({ quizId: id });
        await QuizAttempt.deleteMany({ quizId: id });
        res.json({ message: 'Quiz decommissioned' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.toggleQuizPublish = async (req, res) => {
    try {
        const { id } = req.params;
        const quiz = await Quiz.findOne({ _id: id, createdBy: req.user._id });
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        quiz.isPublished = !quiz.isPublished;
        await quiz.save();
        res.json({ message: `Quiz ${quiz.isPublished ? 'published' : 'unpublished'}`, isPublished: quiz.isPublished });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getQuizAttempts = async (req, res) => {
    try {
        const { id } = req.params;
        const quiz = await Quiz.findOne({ _id: id, createdBy: req.user._id });
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        const attempts = await QuizAttempt.find({ quizId: id })
            .populate('studentId', 'firstName lastName admissionNumber')
            .sort({ createdAt: -1 });
        res.json(attempts);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = {
    getTeacherDashboard: exports.getTeacherDashboard,
    getAssignedClasses: exports.getAssignedClasses,
    getTeacherContext: exports.getTeacherContext,
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
    fetchMyMessages: exports.fetchMyMessages,
    getMyPayroll: exports.getMyPayroll,
    getStudentFeeStatus: exports.getStudentFeeStatus,
    getPerformanceAnalytics: exports.getPerformanceAnalytics,
    getStudentFullAttendance: exports.getStudentFullAttendance,
    deleteAnnouncement: exports.deleteAnnouncement,
    bulkAttendanceImport: exports.bulkAttendanceImport,
    getMyReviews: exports.getMyReviews,
    getUnifiedCalendar: exports.getUnifiedCalendar,
    getLessonPlans: exports.getLessonPlans,
    createLessonPlan: exports.createLessonPlan,
    updateLessonPlan: exports.updateLessonPlan,
    deleteLessonPlan: exports.deleteLessonPlan,
    logBehavior: exports.logBehavior,
    getBehaviorLogs: exports.getBehaviorLogs,
    scheduleMeeting: exports.scheduleMeeting,
    getMeetings: exports.getMeetings,
    updateMeeting: exports.updateMeeting,
    deleteMeeting: exports.deleteMeeting,
    uploadResource: exports.uploadResource,
    getResources: exports.getResources,
    deleteResource: exports.deleteResource,
    addQuestion: exports.addQuestion,
    getQuestions: exports.getQuestions,
    generateExam: exports.generateExam,
    getMyQuizzes: exports.getMyQuizzes,
    createQuiz: exports.createQuiz,
    updateQuiz: exports.updateQuiz,
    deleteQuiz: exports.deleteQuiz,
    toggleQuizPublish: exports.toggleQuizPublish,
    getQuizAttempts: exports.getQuizAttempts
};

