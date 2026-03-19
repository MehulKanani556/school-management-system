const User = require('../models/user.model');
const Student = require('../models/student.model');
const Attendance = require('../models/attendance.model');
const Mark = require('../models/mark.model');
const Assignment = require('../models/assignment.model');
const ClassSection = require('../models/classSection.model');

// Helper to get student by userId
const getStudent = async (userId) => {
    const student = await Student.findOne({ userId }).populate('classSection schoolId');
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
            'records.student': student._id 
        }).select('date records.$');
        
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
        // Assuming timetable is stored/referenced in ClassSection or we fetch it similarly
        res.json(student.classSection.timetable || []);
    } catch (err) { res.status(500).json({ message: err.message }); }
};
