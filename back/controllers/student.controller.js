const User = require('../models/user.model');
const Student = require('../models/student.model');
const Attendance = require('../models/attendance.model');
const Mark = require('../models/mark.model');
const Assignment = require('../models/assignment.model');
const ClassSection = require('../models/classSection.model');
const Submission = require('../models/submission.model');
const nc = require('./notification.controller');

// Helper to get student node
const getStudent = async (studentId) => {
    const student = await Student.findById(studentId).populate('classSection schoolId');
    if (!student) throw new Error('Student node not found');
    return student;
};

// 1. View Profile
exports.getProfile = async (req, res) => {
    try {
        const student = await getStudent(req.user._id);
        res.json(student);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 2. Check Attendance
exports.getAttendance = async (req, res) => {
    try {
        const student = await getStudent(req.user._id);
        const attendance = await Attendance.find({ 
            classSection: student.classSection._id,
            'records.studentId': student._id 
        }).select('date records.$').sort({ date: -1 });
        
        // Format to only show this student's status for each date
        const formatted = attendance.map(a => ({
            date: a.date,
            status: a.records[0].status
        }));
        res.json(formatted);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 3. View Results (Marks)
exports.getResults = async (req, res) => {
    try {
        const student = await getStudent(req.user._id);
        const marks = await Mark.find({ studentId: student._id }).populate('examId');
        res.json(marks);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 4. Download Assignments
exports.getAssignments = async (req, res) => {
    try {
        const student = await getStudent(req.user._id);
        const assignments = await Assignment.find({ classSection: student.classSection._id }).populate('createdBy', 'firstName lastName');
        res.json(assignments);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 5. View Timetable (from ClassSection)
exports.getTimetable = async (req, res) => {
    try {
        const student = await getStudent(req.user._id);
        res.json(student.classSection.timetable || []);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 6. Submit Assignment
exports.submitAssignment = async (req, res) => {
    try {
        const { assignmentId, comments } = req.body;
        const student = await getStudent(req.user._id);
        const fileUrl = req.file ? req.file.location : null;

        if (!fileUrl) return res.status(400).json({ message: 'Submission payload must include academic deliverable (file)' });

        const assignment = await Assignment.findById(assignmentId);

        const submission = await Submission.findOneAndUpdate(
            { assignmentId, studentId: student._id },
            { 
                schoolId: student.schoolId._id,
                assignmentId, 
                studentId: student._id, 
                fileUrl, 
                comments,
                submittedAt: new Date(),
                status: 'Submitted'
            },
            { upsert: true, new: true }
        );

        // Notify teacher
        nc.sendNotification({
            schoolId: student.schoolId._id,
            recipient: assignment.createdBy,
            sender: req.user._id,
            type: 'Assignment',
            title: 'Academic Deliverable Uploaded',
            message: `${student.firstName} submitted ${assignment.title}`,
            link: '/teacher/assignments'
        });

        res.status(201).json({ message: 'Academic deliverable synchronized', submission });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 7. Get My Submissions
exports.getMySubmissions = async (req, res) => {
    try {
        const student = await getStudent(req.user._id);
        const submissions = await Submission.find({ studentId: student._id }).populate('assignmentId', 'title subject' );
        res.json(submissions);
    } catch (err) { res.status(500).json({ message: err.message }); }
};
