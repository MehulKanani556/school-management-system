const Teacher = require('../models/teacher.model');
const ClassSection = require('../models/classSection.model');
const Attendance = require('../models/attendance.model');
const Exam = require('../models/exam.model');
const Mark = require('../models/mark.model');
const Assignment = require('../models/assignment.model');
const Message = require('../models/message.model');
const Student = require('../models/student.model');

// Helper to get teacher record by user ID
const getTeacher = async (userId) => {
  return await Teacher.findOne({ userId }).populate('schoolId');
};

// 1. View assigned classes ───────────────────────────────────────────────────
exports.getAssignedClasses = async (req, res) => {
  try {
    const teacher = await getTeacher(req.user._id);
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

    const classes = await ClassSection.find({
      $or: [
        { classTeacher: teacher._id },
        { assignedTeachers: teacher._id }
      ]
    }).populate('standardId', 'gradeLevel').populate('subjects', 'name');
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
    res.json(attendance);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// 3. Add marks ────────────────────────────────────────────────────────────────
exports.addMarks = async (req, res) => {
  try {
    const { examId, studentMarks } = req.body; // studentMarks: [{ studentId: ID, score: Number, remarks: String }]
    const teacher = await getTeacher(req.user._id);

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

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

    res.json({ message: 'Marks updated successfully', marks });
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

    res.status(201).json(assignment);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// 5. Communicate with students ───────────────────────────────────────────────—
exports.sendMessage = async (req, res) => {
  try {
    const { targetRole, classSection, subject, content, recipientId } = req.body;
    const teacher = await getTeacher(req.user._id);
    const fileUrl = req.file ? req.file.location : null;

    // Create institutional message
    const message = await Message.create({
      schoolId: teacher.schoolId._id,
      sender: req.user._id,
      recipient: recipientId || null,
      targetRole: targetRole || 'Student',
      classSection: classSection || null,
      subject, content, fileUrl
    });

    res.status(201).json({ message: 'Communication broadcasted successfully', data: message });
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
        res.json(assignment);
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
