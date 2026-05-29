const Teacher = require('../models/teacher.model');
const Timetable = require('../models/timetable.model');
const Student = require('../models/student.model');
const StudentEnrollment = require('../models/studentEnrollment.model');
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
const SystemSetting = require('../models/systemSetting.model');
const bcrypt = require('bcrypt');
const { addAcademicYearFilter } = require('../utils/academicYearHelper');

// Helper to get teacher record by user ID
const getTeacher = async (userId) => {
    return await Teacher.findOne({ userId }).populate('schoolId');
};

// 0. Dashboard Stats ──────────────────────────────────────────────────────────
exports.getTeacherDashboard = async (req, res) => {
    try {
        const teacherProfile = await getTeacher(req.user._id);
        if (!teacherProfile) return res.status(404).json({ message: 'Teacher profile node not found' });

        // 1. Assigned classes & student count (using StudentEnrollment for accuracy)
        const assignedClasses = await ClassSection.find({
            academicYearId: req.academicYearId,
            $or: [
                { classTeacher: teacherProfile._id },
                { 'subjectAssignments.teachers': teacherProfile._id }
            ]
        }).populate('standardId');
        const classIds = assignedClasses.map(c => c._id);

        const enrollments = await StudentEnrollment.find({
            classSectionId: { $in: classIds },
            academicYearId: req.academicYearId,
            status: 'Active'
        }).populate({
            path: 'studentId',
            match: { deletedAt: null }
        });
        const activeStudents = enrollments.filter(e => e.studentId);
        const studentsCount = activeStudents.length;

        // 2. Attendance % (last 30 days overall average for those classes)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const attendanceRecords = await Attendance.find({
            academicYearId: req.academicYearId,
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

        // 3. Assignment stats (active vs total) - Year scoped
        const assignments = await Assignment.find(addAcademicYearFilter({ createdBy: req.user._id }, req.academicYearId));
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

        // 4. Classes Summary Grid (using StudentEnrollment for correctness per year)
        const classesGrid = await Promise.all(assignedClasses.map(async (c) => {
            const enrollmentsForClass = await StudentEnrollment.find({
                classSectionId: c._id,
                academicYearId: req.academicYearId,
                status: 'Active'
            }).populate({
                path: 'studentId',
                match: { deletedAt: null }
            });
            const activeStudentsForClass = enrollmentsForClass.filter(e => e.studentId);
            return {
                id: c._id,
                section: c.sectionLabel,
                standard: c.standardId?.level || c.standardId || 'N/A',
                students: activeStudentsForClass.length,
                isClassTeacher: c.classTeacher?.toString() === teacherProfile._id.toString()
            };
        }));

        // 5. Upcoming Deadlines (within next 3 days) - Year scoped
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        const deadlinesCount = await Assignment.countDocuments(
            addAcademicYearFilter({
                createdBy: req.user._id,
                dueDate: { $gte: new Date(), $lte: threeDaysFromNow }
            }, req.academicYearId)
        );

        const myClass = assignedClasses.find(c => c.classTeacher?.toString() === teacherProfile._id.toString());

        // Fetch actual alerts (upcoming assignments within 3 days) - Year scoped
        const alerts = await Assignment.find(
            addAcademicYearFilter({
                createdBy: req.user._id,
                dueDate: { $gte: new Date(), $lte: threeDaysFromNow }
            }, req.academicYearId)
        ).sort({ dueDate: 1 }).limit(3);

        res.json({
            profile: teacherProfile,
            classesGrid: classesGrid,
            stats: {
                classes: assignedClasses.length,
                students: studentsCount,
                attendance: attendancePercentage,
                assignments: assignmentCount,
                upcomingDeadlines: deadlinesCount
            },
            recentAssignments,
            alerts: alerts.map(a => ({
                id: a._id,
                title: a.title,
                due: a.dueDate
            })),
            myClass: myClass ? {
                id: myClass._id,
                section: myClass.sectionLabel,
                standard: myClass.standardId?.level || 'N/A'
            } : null
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 1. View assigned classes ───────────────────────────────────────────────────
exports.getAssignedClasses = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

        const { onlyClassTeacher } = req.query;
        const filter = { academicYearId: req.academicYearId };

        if (onlyClassTeacher === 'true') {
            filter.classTeacher = teacher._id;
        } else {
            filter.$or = [
                { classTeacher: teacher._id },
                { 'subjectAssignments.teachers': teacher._id }
            ];
        }

        const classes = await ClassSection.find(filter).populate('standardId', 'level').populate('subjects', 'name');
        const classesWithRole = classes.map(c => {
            const classObj = c.toObject();
            classObj.isClassTeacher = c.classTeacher?.toString() === teacher._id.toString();
            return classObj;
        });
        res.json(classesWithRole);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 1b. Get teacher's subjects and standards (for quiz creation dropdowns)
exports.getTeacherContext = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

        const classes = await ClassSection.find({
            academicYearId: req.academicYearId,
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

        // Verify teacher is the designated classTeacher of this class
        const isAssigned = await ClassSection.findOne({
            _id: targetClass,
            classTeacher: teacher._id
        });

        if (!isAssigned) return res.status(403).json({ message: 'Access denied: You can only take attendance for class sections where you are the designated Class Teacher.' });

        const attendance = await Attendance.findOneAndUpdate(
            { schoolId: teacher.schoolId._id, classSection: targetClass, date: new Date(date), academicYearId: req.academicYearId },
            { 
                schoolId: teacher.schoolId._id, 
                standardId: isAssigned.standardId,
                classSection: targetClass, 
                date: new Date(date), 
                records, 
                submittedBy: req.user._id,
                academicYearId: req.academicYearId
            },
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

        const exam = await Exam.findById(examId).populate('subject');
        if (!exam) return res.status(404).json({ message: 'Assessment node not found' });

        // Verify teacher is assigned to the exam's class.
        // Exams can be standard-wide (classSection = null), so we must handle both cases.
        let isAssigned = null;

        if (exam.classSection) {
            // Case 1: Exam is tied to a specific class section
            isAssigned = await ClassSection.findOne({
                _id: exam.classSection,
                $or: [{ classTeacher: teacher._id }, { 'subjectAssignments.teachers': teacher._id }]
            });
        } else if (exam.standardId) {
            // Case 2: Standard-wide exam (classSection is null) — check by standardId
            isAssigned = await ClassSection.findOne({
                standardId: exam.standardId,
                academicYearId: req.academicYearId,
                $or: [{ classTeacher: teacher._id }, { 'subjectAssignments.teachers': teacher._id }]
            });
        }

        if (!isAssigned) return res.status(403).json({ message: 'Access denied: You are not assigned to this class' });

        const marks = await Promise.all(studentMarks.map(item =>
            Mark.findOneAndUpdate(
                { schoolId: teacher.schoolId._id, examId, studentId: item.studentId, academicYearId: req.academicYearId },
                { marksObtained: item.score, remarks: item.remarks, submittedBy: req.user._id, academicYearId: req.academicYearId },
                { upsert: true, new: true }
            )
        ));

        // Trigger Notifications for students (Lazy populate for message body)
        const subLabel = exam.subject?.name || exam.subject || 'Institutional Subject';
        Promise.all(studentMarks.map(m => nc.sendNotification({
            schoolId: teacher.schoolId._id,
            recipient: m.studentId,
            sender: req.user._id,
            type: 'Mark',
            title: `Performance Assessment: ${exam.name}`,
            message: `Grade secured for ${subLabel}: ${m.score}/${exam.maxMarks}`,
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
            createdBy: req.user._id,
            academicYearId: req.academicYearId
        });

        await assignment.populate({
            path: 'classSection',
            select: 'sectionLabel standardId',
            populate: { path: 'standardId', select: 'level name' }
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
        const finalType = recipient ? 'DirectMessage' : (req.body.type || 'Announcement');
        const message = await Message.create({
            schoolId: teacher.schoolId._id,
            sender: req.user._id,
            recipient: recipient || null,
            targetRole: classSection ? 'Specific' : (targetRole || 'Student'),
            type: finalType,
            classSection: classSection || null,
            subject, content, fileUrl
        });

        const populated = await message.populate('sender', 'firstName lastName photo role');

        // Real-time notification
        if (finalType === 'DirectMessage') {
            socketManager.sendToUser(recipient, 'NEW_MESSAGE', {
                ...populated.toJSON(),
                senderName: `${populated.sender.firstName} ${populated.sender.lastName}`
            });
            await nc.sendNotification({
                schoolId: teacher.schoolId._id,
                recipient,
                sender: req.user._id,
                type: 'General',
                title: `New Message from ${populated.sender.firstName} ${populated.sender.lastName}`,
                message: content.length > 60 ? content.substring(0, 60) + '...' : content,
                link: '/communication?tab=messages'
            });
        } else if (finalType === 'Notice') {
            if (classSection) {
                socketManager.sendToClass(classSection, 'NEW_NOTICE', populated);
            } else {
                socketManager.broadcastNotice('NEW_NOTICE', populated);
            }
        } else {
            socketManager.broadcastToRole(targetRole || 'Student', 'NEW_ANNOUNCEMENT', populated);
        }

        res.status(201).json({ message: 'Communication dispatched successfully', data: populated });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 6. View Assigned Class Students ─────────────────────────────────────────────
exports.getAssignedClassStudents = async (req, res) => {
    try {
        const { classId } = req.params;
        const teacher = await getTeacher(req.user._id);
        const academicYearId = req.academicYearId;

        const isAssigned = await ClassSection.findOne({
            _id: classId,
            $or: [{ classTeacher: teacher._id }, { 'subjectAssignments.teachers': teacher._id }]
        });

        if (!isAssigned) return res.status(403).json({ message: 'Access denied: You are not assigned to this class' });

        // Filter students by enrollment in the active academic year
        if (academicYearId) {
            const enrollments = await StudentEnrollment.find({
                classSectionId: classId,
                academicYearId: academicYearId,
                status: 'Active'
            }).populate({
                path: 'studentId',
                match: { deletedAt: null }
            }).lean();

            const students = enrollments
                .filter(e => e.studentId)
                .map(e => e.studentId);

            return res.json(students);
        }

        // Fallback: show all students if no academic year
        const students = await Student.find({ classSection: classId, deletedAt: null });
        res.json(students);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 6b. Generate Roll Numbers ───────────────────────────────────────────────—
exports.generateRollNumbers = async (req, res) => {
    try {
        const { classId } = req.params;
        const teacher = await getTeacher(req.user._id);
        const academicYearId = req.academicYearId;

        const isAssigned = await ClassSection.findOne({
            _id: classId,
            $or: [{ classTeacher: teacher._id }, { 'subjectAssignments.teachers': teacher._id }]
        });

        if (!isAssigned) return res.status(403).json({ message: 'Access denied: You are not assigned to this sectors population' });

        // Get students enrolled in the active academic year
        let students;
        if (academicYearId) {
            const enrollments = await StudentEnrollment.find({
                classSectionId: classId,
                academicYearId: academicYearId,
                status: 'Active'
            }).populate({
                path: 'studentId',
                match: { deletedAt: null }
            }).lean();

            students = enrollments
                .filter(e => e.studentId)
                .map(e => e.studentId);
        } else {
            students = await Student.find({ classSection: classId, deletedAt: null });
        }
        
        // Sorting logic: Girls first, then Boys, then others
        // Within each group, sort by name ascending
        const sortedStudents = students.sort((a, b) => {
            const genderOrder = { 'female': 1, 'male': 2, 'other': 3 };
            const genderA = genderOrder[a.gender] || 4;
            const genderB = genderOrder[b.gender] || 4;

            if (genderA !== genderB) return genderA - genderB;

            const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
            const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
            return nameA.localeCompare(nameB);
        });

        // Update each student with new roll number
        const updates = sortedStudents.map((s, index) => {
            return Student.findByIdAndUpdate(s._id, { rollNumber: (index + 1).toString() }, { new: true });
        });

        await Promise.all(updates);

        res.json({ message: 'Roll sequence synchronized successfully' });
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

        // Verify teacher is assigned to this class section in any role
        const isAssigned = await ClassSection.findOne({
            _id: targetRef,
            $or: [{ classTeacher: teacher._id }, { 'subjectAssignments.teachers': teacher._id }]
        });

        if (!isAssigned) return res.status(403).json({ message: 'Access denied: You are not assigned to this class section.' });

        const mongoose = require('mongoose');
        const filter = {
            schoolId: new mongoose.Types.ObjectId(teacher.schoolId._id),
            classSection: new mongoose.Types.ObjectId(targetRef)
        };

        const { startDate, endDate, type } = req.query;
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Ensure full inclusion of the end date
            filter.date = { $gte: start, $lte: end };
        } else if (date) {
            filter.date = new Date(date);
        }

        if (type === 'marked-dates') {
            const markedDates = await Attendance.aggregate([
                { $match: filter },
                { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } } },
                { $project: { date: '$_id', marked: { $literal: true }, _id: 0 } }
            ]);
            return res.json(markedDates);
        }

        const att = await Attendance.find(filter);
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

        // Verify teacher is assigned. Handle both class-specific and standard-wide exams.
        let isAssigned = null;

        if (exam.classSection) {
            isAssigned = await ClassSection.findOne({
                _id: exam.classSection,
                $or: [{ classTeacher: teacher._id }, { 'subjectAssignments.teachers': teacher._id }]
            });
        } else if (exam.standardId) {
            isAssigned = await ClassSection.findOne({
                standardId: exam.standardId,
                academicYearId: req.academicYearId,
                $or: [{ classTeacher: teacher._id }, { 'subjectAssignments.teachers': teacher._id }]
            });
        }

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
        const assignments = await Assignment.find(addAcademicYearFilter({ createdBy: req.user._id }, req.academicYearId))
            .populate({
                path: 'classSection',
                select: 'sectionLabel standardId',
                populate: { path: 'standardId', select: 'level name' }
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

        const submissions = await Submission.find(addAcademicYearFilter({ assignmentId: id }, req.academicYearId))
            .populate('studentId', 'firstName lastName studentId');
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

        await assignment.populate({
            path: 'classSection',
            select: 'sectionLabel standardId',
            populate: { path: 'standardId', select: 'level name' }
        });

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
            academicYearId: req.academicYearId,
            $or: [{ classTeacher: teacher._id }, { 'subjectAssignments.teachers': teacher._id }]
        }).populate('standardId', 'level');
        const classIds = assignedClasses.map(c => c._id);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const attendance = await Attendance.find({
            academicYearId: req.academicYearId,
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
                section: `Grade ${c.standardId?.level || 'N/A'} (${c.sectionLabel})`,
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

        const populatedTeacher = await Teacher.findById(teacher._id).populate('userId', 'photo email role');
        res.json({ message: 'Professional profile synchronized successfully', teacher: populatedTeacher });
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
        const { classId } = req.query;
        let classIds = [];

        if (classId && classId !== 'all') {
            classIds = [classId];
            // Integrity Check: ensure teacher is assigned to this sector
            const isAssigned = await ClassSection.exists({
                _id: classId,
                academicYearId: req.academicYearId,
                $or: [{ classTeacher: teacher._id }, { 'subjectAssignments.teachers': teacher._id }]
            });
            if (!isAssigned) return res.status(403).json({ message: 'Pedagogical security clearance insufficient for this sector node' });
        } else {
            const assignedClasses = await ClassSection.find({
                academicYearId: req.academicYearId,
                $or: [{ classTeacher: teacher._id }, { 'subjectAssignments.teachers': teacher._id }]
            });
            classIds = assignedClasses.map(c => c._id);
        }

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
                photo: s.photo,
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
            academicYearId: req.academicYearId,
            $or: [{ classTeacher: teacher._id }, { 'subjectAssignments.teachers': teacher._id }]
        });
        const classIds = assignedClasses.map(c => c._id);
        const standardIds = assignedClasses.map(c => c.standardId).filter(Boolean);

        const exams = await Exam.find({
            academicYearId: req.academicYearId,
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
        const academicYearId = req.academicYearId;

        // Find class section and verify teacher is the designated classTeacher
        const cs = await ClassSection.findOne({ _id: classSectionId, classTeacher: teacher._id });
        if (!cs) return res.status(403).json({ message: 'Access denied: You can only import attendance in bulk for class sections where you are the designated Class Teacher.' });

        // Resolve admissionNumbers → studentIds from active enrollments
        const VALID_STATUSES = ['Present', 'Absent', 'Late'];
        const admissionNumbers = attendanceData.map(e => e.admissionNumber).filter(Boolean);
        const students = await Student.find({
            admissionNumber: { $in: admissionNumbers },
            schoolId: teacher.schoolId._id,
            deletedAt: null
        }).select('_id admissionNumber').lean();

        const admissionToId = {};
        students.forEach(s => { admissionToId[s.admissionNumber] = s._id; });

        // Build validated records (skip rows with unknown admissionNumber or invalid status)
        const resolvedRecords = [];
        const skipped = [];
        attendanceData.forEach(entry => {
            const studentId = admissionToId[entry.admissionNumber];
            // Normalize status: capitalise first letter, default to 'Present'
            const rawStatus = entry.status ? entry.status.trim() : 'Present';
            const status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
            const validStatus = VALID_STATUSES.includes(status) ? status : 'Present';

            if (!studentId) { skipped.push(entry.admissionNumber); return; }
            resolvedRecords.push({ studentId, status: validStatus });
        });

        if (resolvedRecords.length === 0) {
            return res.status(400).json({ message: 'No valid student records found. Check admission numbers.', skipped });
        }

        // Upsert the Attendance document with all required fields
        const attendance = await Attendance.findOneAndUpdate(
            { schoolId: teacher.schoolId._id, classSection: classSectionId, date: new Date(date) },
            {
                $setOnInsert: {
                    standardId: cs.standardId,
                    academicYearId,
                    submittedBy: req.user._id
                }
            },
            { upsert: true, new: true }
        );

        // Ensure required fields are set on the in-memory document
        if (!attendance.standardId) attendance.standardId = cs.standardId;
        if (!attendance.academicYearId) attendance.academicYearId = academicYearId;

        // Merge resolved records into existing attendance
        const currentRecords = attendance.records || [];
        resolvedRecords.forEach(entry => {
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

        res.json({
            message: `Synchronized ${resolvedRecords.length} records successfully.`,
            count: resolvedRecords.length,
            skipped: skipped.length > 0 ? skipped : undefined
        });
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
        
        // Find classes and standards assigned to the teacher
        const assignedClasses = await ClassSection.find({
            academicYearId: req.academicYearId,
            $or: [
                { classTeacher: teacher._id },
                { 'subjectAssignments.teachers': teacher._id }
            ]
        });
        const classIds = assignedClasses.map(c => c._id);
        const standardIds = assignedClasses.map(c => c.standardId);

        const [timetable, exams, assignments, leaves] = await Promise.all([
            Timetable.find({ academicYearId: req.academicYearId, 'schedule.periods.teacher': teacher._id })
                .populate({
                    path: 'classSection',
                    populate: { path: 'standardId' }
                })
                .populate('schedule.periods.subject')
                .populate('schedule.periods.teacher'),
            Exam.find({ 
                academicYearId: req.academicYearId,
                $or: [
                    { classSection: { $in: classIds } },
                    { standardId: { $in: standardIds }, classSection: null }
                ],
                schoolId: teacher.schoolId._id 
            }).populate('classSection').populate('subject'),
            Assignment.find(addAcademicYearFilter({ createdBy: req.user._id }, req.academicYearId)),
            Leave.find({ teacherId: teacher._id, status: 'approved' })
        ]);

        res.json({ timetable, exams, assignments, leaves });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 19. Get exams for teacher's assigned classes ──────────────────────────────
exports.getExamsByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const queryClassId = req.query.classId;
        const targetClassId = classId || queryClassId;

        const teacher = await getTeacher(req.user._id);
        const assignedClasses = await ClassSection.find({
            academicYearId: req.academicYearId,
            $or: [{ classTeacher: teacher._id }, { 'subjectAssignments.teachers': teacher._id }]
        });
        const standardIds = assignedClasses.map(c => c.standardId);

        let query = { schoolId: teacher.schoolId._id, academicYearId: req.academicYearId };

        if (targetClassId) {
            // Strict filtering by specific class context or global standard allocation
            const targetClass = await ClassSection.findById(targetClassId);
            if (targetClass) {
                query.$or = [
                    { classSection: targetClassId },
                    { standardId: targetClass.standardId, classSection: null }
                ];
            } else {
                query.classSection = targetClassId;
            }
        } else {
            // Fallback: Broad pedagogical reach across all assigned sectors
            query.$or = [
                { classSection: { $in: assignedClasses.map(c => c._id) } },
                { standardId: { $in: standardIds }, classSection: null }
            ];
        }

        const exams = await Exam.find(query)
            .populate('subject', 'name')
            .sort({ date: 1 });

        const formatted = await Promise.all(exams.map(async (e) => {
            const hasMarks = await Mark.exists({ examId: e._id });
            
            // Contextual resolution for global standard assignments
            let resolvedClassId = e.classSection;
            if (!resolvedClassId && e.standardId) {
                const fallbackClass = assignedClasses.find(c => c.standardId.toString() === e.standardId.toString());
                if (fallbackClass) {
                    resolvedClassId = fallbackClass._id;
                }
            }

            return {
                _id: e._id,
                subject: e.subject?.name || 'Unknown',
                title: e.name,
                date: e.date,
                maxMarks: e.maxMarks,
                type: e.type,
                classSectionId: targetClassId || resolvedClassId,
                isEvaluated: !!hasMarks
            };
        }));

        res.json(formatted);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 21. Lesson Plans ──────────────────────────────────────────────────────────
exports.getLessonPlans = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        const plans = await LessonPlan.find(addAcademicYearFilter({ teacherId: teacher._id }, req.academicYearId))
            .populate({ path: 'classSection', select: 'sectionLabel standardId', populate: { path: 'standardId', select: 'level name' } })
            .populate('subject', 'name')
            .sort({ date: -1 });
        res.json(plans);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createLessonPlan = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        const newPlan = new LessonPlan({ 
            ...req.body, 
            teacherId: teacher._id, 
            schoolId: teacher.schoolId._id,
            academicYearId: req.academicYearId
        });
        await newPlan.save();
        const populated = await newPlan.populate([
            { path: 'classSection', select: 'sectionLabel' },
            { path: 'subject', select: 'name' }
        ]);
        res.status(201).json({ message: 'Pedagogical directive ARCHIVED successfully', plan: populated });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateLessonPlan = async (req, res) => {
    try {
        const updatedPlan = await LessonPlan.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate({ path: 'classSection', select: 'sectionLabel standardId', populate: { path: 'standardId', select: 'level name' } })
            .populate('subject', 'name');
        res.json({ message: 'Lesson plan updated successfully', plan: updatedPlan });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteLessonPlan = async (req, res) => {
    try {
        await LessonPlan.findByIdAndDelete(req.params.id);
        res.json({ message: 'Lesson plan deleted successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 22. Behavior / Discipline Log ────────────────────────────────────────────────
exports.logBehavior = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        const log = new BehaviorLog({ 
            ...req.body, 
            teacherId: teacher._id, 
            schoolId: teacher.schoolId._id,
            academicYearId: req.academicYearId
        });
        await log.save();
        res.status(201).json({ message: 'Conduct vector localized to student registry' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getBehaviorLogs = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        const { studentId, classId } = req.query;
        let query = addAcademicYearFilter({ schoolId: teacher.schoolId._id }, req.academicYearId);
        
        if (studentId) query.studentId = studentId;
        if (classId) {
            const students = await Student.find({ classSection: classId, schoolId: teacher.schoolId._id }).select('_id');
            query.studentId = { $in: students.map(s => s._id) };
        }
        
        const logs = await BehaviorLog.find(query)
            .populate('studentId', 'firstName lastName')
            .populate('teacherId', 'firstName lastName')
            .sort({ date: -1 });
            
        res.json(logs);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateBehaviorLog = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        const log = await BehaviorLog.findOneAndUpdate(
            { _id: req.params.id, teacherId: teacher._id, schoolId: teacher.schoolId._id },
            req.body,
            { new: true }
        );
        if (!log) return res.status(404).json({ message: 'Behavior log node not found or security clearance insufficient' });
        res.json({ message: 'Conduct vector recalibrated successfully', log });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteBehaviorLog = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        const log = await BehaviorLog.findOneAndDelete({ _id: req.params.id, teacherId: teacher._id, schoolId: teacher.schoolId._id });
        if (!log) return res.status(404).json({ message: 'Behavior log node not found or security clearance insufficient' });
        res.json({ message: 'Conduct vector purged from institutional memory' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 23. Parent-Teacher Meetings (PTM) ───────────────────────────────────────────
exports.scheduleMeeting = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        const meetingData = { ...req.body };
        if (!meetingData.studentId || meetingData.studentId === '') {
            delete meetingData.studentId;
        }
        if (!meetingData.parentId || meetingData.parentId === '') {
            delete meetingData.parentId;
        }
        const meeting = new Meeting({ ...meetingData, teacherId: teacher._id, schoolId: teacher.schoolId._id });
        await meeting.save();
        const populated = await meeting.populate([
            { path: 'studentId', select: 'firstName lastName' },
            { path: 'classSection', select: 'sectionLabel' }
        ]);
        res.status(201).json({ message: 'Pedagogical protocol SYNCHRONIZED', meeting: populated });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMeetings = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        const meetings = await Meeting.find({ 
            teacherId: teacher._id,
            schoolId: teacher.schoolId._id // Filter by school
        })
            .populate([
                { path: 'studentId', select: 'firstName lastName' },
                { path: 'classSection', select: 'sectionLabel gradeLevel standardId', populate: { path: 'standardId', select: 'level' } }
            ])
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
        const resources = await ResourceLocker.find({ 
            teacherId: teacher._id, 
            schoolId: teacher.schoolId._id // Filter by school
        })
            .populate({
                path: 'classSection',
                select: 'sectionLabel standardId',
                populate: { path: 'standardId', select: 'level' }
            })
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
        if (req.file) {
            question.fileUrl = req.file.location || req.file.path;
        }
        await question.save();
        res.status(201).json({ message: 'Evaluation node recorded successfully', question });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.bulkAddQuestions = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        const { questions } = req.body; 

        if (!Array.isArray(questions)) return res.status(400).json({ message: 'Payload must be an array of nodes' });

        const mapped = questions.map(q => ({
            ...q,
            teacherId: teacher._id,
            schoolId: teacher.schoolId._id
        }));

        const saved = await QuestionBank.insertMany(mapped);
        res.status(201).json({ message: `Successfully archived ${saved.length} nodes to vault`, count: saved.length });
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
        const quizzes = await Quiz.find(addAcademicYearFilter({ 
            createdBy: req.user._id, 
            schoolId: teacher.schoolId._id 
        }, req.academicYearId))
            .populate('subjectId', 'name')
            .populate('standardId', 'level')
            .populate('questions')
            .sort({ createdAt: -1 })
            .lean();

        // Calculate stats for each quiz
        const quizzesWithStats = await Promise.all(quizzes.map(async (quiz) => {
            const attempts = await QuizAttempt.find(addAcademicYearFilter({ quizId: quiz._id }, req.academicYearId));
            const total = attempts.length;
            const passed = attempts.filter(a => a.status === 'Passed').length;
            const avgScore = total > 0 ? (attempts.reduce((acc, a) => acc + a.score, 0) / attempts.reduce((acc, a) => acc + a.totalPoints, 0)) * 100 : 0;
            const passRate = total > 0 ? (passed / total) * 100 : 0;

            return {
                ...quiz,
                stats: { total, passed, avgScore: Math.round(avgScore), passRate: Math.round(passRate) }
            };
        }));

        res.json(quizzesWithStats);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createQuiz = async (req, res) => {
    try {
        const teacher = await getTeacher(req.user._id);
        const { title, description, subjectId, standardId, duration, passingScore, questions } = req.body;

        const quiz = await Quiz.create({
            title, description, subjectId, standardId,
            schoolId: teacher.schoolId._id,
            academicYearId: req.academicYearId,
            createdBy: req.user._id,
            duration: duration || 30,
            passingScore: passingScore || 40,
            questions: [],
            isPublished: false
        });

        // Create questions with quizId
        const createdQuestions = await Promise.all(
            (questions || []).map(q => Question.create({
                quizId: quiz._id, 
                text: q.text,
                options: q.options,
                correctAnswer: q.correctAnswer,
                points: q.points || 10
            }))
        );

        // Update quiz with question references
        quiz.questions = createdQuestions.map(q => q._id);
        await quiz.save();

        await quiz.populate([
            { path: 'subjectId', select: 'name' },
            { path: 'standardId', select: 'level' },
            { path: 'questions' }
        ]);

        res.status(201).json({ message: 'Quiz node created', quiz });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, subjectId, standardId, duration, passingScore, questions } = req.body;

        const quiz = await Quiz.findOne({ _id: id, createdBy: req.user._id });
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        quiz.title = title;
        quiz.description = description;
        quiz.subjectId = subjectId;
        quiz.standardId = standardId;
        quiz.duration = duration || 30;
        quiz.passingScore = passingScore || 40;

        if (questions) {
            // Delete old questions associated with this quiz
            await Question.deleteMany({ quizId: id });

            // Create new questions
            const createdQuestions = await Promise.all(
                (questions || []).map(q => Question.create({
                    quizId: id,
                    text: q.text,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    points: q.points || 10
                }))
            );

            // Set new question references on the quiz
            quiz.questions = createdQuestions.map(q => q._id);
        }

        await quiz.save();

        await quiz.populate([
            { path: 'subjectId', select: 'name' },
            { path: 'standardId', select: 'level' },
            { path: 'questions' }
        ]);

        res.json({ message: 'Quiz updated successfully', quiz });
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
        const attempts = await QuizAttempt.find(addAcademicYearFilter({ quizId: id }, req.academicYearId))
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
    generateRollNumbers: exports.generateRollNumbers,
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
    updateBehaviorLog: exports.updateBehaviorLog,
    deleteBehaviorLog: exports.deleteBehaviorLog,
    scheduleMeeting: exports.scheduleMeeting,
    getMeetings: exports.getMeetings,
    updateMeeting: exports.updateMeeting,
    deleteMeeting: exports.deleteMeeting,
    uploadResource: exports.uploadResource,
    getResources: exports.getResources,
    deleteResource: exports.deleteResource,
    addQuestion: async (req, res) => {
        try {
            const teacher = await getTeacher(req.user._id);
            const question = new QuestionBank({
                ...req.body,
                teacherId: teacher._id,
                schoolId: teacher.schoolId._id
            });
            if (req.file) {
                question.fileUrl = req.file.location || req.file.path;
            }
            await question.save();
            res.status(201).json({ message: 'Evaluation node recorded successfully', question });
        } catch (err) { res.status(500).json({ message: err.message }); }
    },
    bulkAddQuestions: exports.bulkAddQuestions,
    getQuestions: exports.getQuestions,
    generateExam: exports.generateExam,
    getMyQuizzes: exports.getMyQuizzes,
    createQuiz: exports.createQuiz,
    updateQuiz: exports.updateQuiz,
    deleteQuiz: exports.deleteQuiz,
    toggleQuizPublish: exports.toggleQuizPublish,
    getQuizAttempts: exports.getQuizAttempts,
    getCustomQuestionTypes: async (req, res) => {
        try {
            const key = `QUESTION_TYPES_${req.user.schoolId}`;
            const row = await SystemSetting.findOne({ key });
            const defaults = ['MCQ', 'FillInBlank', 'OneWord', 'TrueFalse', 'ShortAnswer', 'LongAnswer'];
            res.json(row?.value || defaults);
        } catch (err) { res.status(500).json({ message: err.message }); }
    },
    saveCustomQuestionTypes: async (req, res) => {
        try {
            const { types } = req.body;
            const key = `QUESTION_TYPES_${req.user.schoolId}`;
            await SystemSetting.findOneAndUpdate(
                { key },
                { key, value: types, description: 'Custom question types for school' },
                { upsert: true }
            );
            res.json(types);
        } catch (err) { res.status(500).json({ message: err.message }); }
    },
};

