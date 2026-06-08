const User = require('../models/user.model');
const Student = require('../models/student.model');
const Attendance = require('../models/attendance.model');
const Mark = require('../models/mark.model');
const Assignment = require('../models/assignment.model');
const ClassSection = require('../models/classSection.model');
const Submission = require('../models/submission.model');
const FeePayment = require('../models/feePayment.model');
const Exam = require('../models/exam.model');
const School = require('../models/school.model');
const Book = require('../models/book.model');
const BookReservation = require('../models/bookReservation.model');
const Quiz = require('../models/quiz.model');
const Question = require('../models/question.model');
const QuizAttempt = require('../models/quizAttempt.model');
const Teacher = require('../models/teacher.model');
const Subject = require('../models/subject.model');
const StudentEnrollment = require('../models/studentEnrollment.model');
const nc = require('./notification.controller');
const { addAcademicYearFilter } = require('../utils/academicYearHelper');
const reportCardPDF = require('../utils/reportCardPDF');

const PDFDocument = require('pdfkit');
const bcrypt = require('bcrypt');
const ResourceLocker = require('../models/resourceLocker.model');
const Route = require('../models/route.model');


// Helper to get student node
const getStudent = async (studentId) => {
    const student = await Student.findById(studentId)
        .populate({
            path: 'classSection',
            populate: [
                { path: 'standardId' },
                { path: 'subjects', select: 'name code' },
                { path: 'subjectAssignments.subject', select: 'name code' }
            ]
        })
        .populate('schoolId');
    if (!student) throw new Error('Student node not found');
    return student;
};

// 1. View Profile
exports.getProfile = async (req, res) => {
    try {
        const student = await getStudent(req.user._id);

        // Attach current-year enrollment status
        const enrollment = await StudentEnrollment.findOne({
            studentId: student._id,
            academicYearId: req.academicYearId
        });

        const profileData = student.toObject();
        profileData.enrollmentStatus = enrollment?.status || 'Active';

        // Use the subjects array (canonical, year-specific) for subject count
        // This avoids subjectAssignments inflation from prior years
        profileData.subjectCount = student.classSection?.subjects?.length || 0;

        res.json(profileData);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 2. Check Attendance
exports.getAttendance = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const student = await getStudent(req.user._id);

        const enrollment = await StudentEnrollment.findOne({ studentId: student._id, academicYearId: req.academicYearId });
        const classSectionId = enrollment?.classSectionId || student.classSection?._id || student.classSection;

        const filter = addAcademicYearFilter({
            classSection: classSectionId,
            'records.studentId': student._id
        }, req.academicYearId);

        if (startDate && endDate) {
            filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const attendance = await Attendance.find(filter)
            .select('date records')
            .sort({ date: -1 });

        // Format to only show this student's status for each date
        const formatted = attendance.map(a => {
            const myRecord = a.records.find(r => r.studentId.toString() === student._id.toString());
            return { 
                date: a.date, 
                status: myRecord?.status || 'N/A', 
                arrivalTime: myRecord?.arrivalTime, 
                departureTime: myRecord?.departureTime,
                remarks: myRecord?.remarks
            };
        });
        res.json(formatted);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 3. View Results (Marks)
exports.getResults = async (req, res) => {
    try {
        const student = await getStudent(req.user._id);
        const marks = await Mark.find(addAcademicYearFilter({ studentId: student._id }, req.academicYearId))
            .populate({
                path: 'examId',
                populate: { path: 'subject', select: 'name' }
            })
            .populate('submittedBy', 'firstName lastName');
        res.json(marks);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 4. Download Assignments
exports.getAssignments = async (req, res) => {
    try {
        const student = await getStudent(req.user._id);
        const enrollment = await StudentEnrollment.findOne({ studentId: student._id, academicYearId: req.academicYearId });
        const classSectionId = enrollment?.classSectionId || student.classSection?._id || student.classSection;

        const assignments = await Assignment.find(addAcademicYearFilter({ classSection: classSectionId }, req.academicYearId))
            .populate('createdBy', 'firstName lastName');
        res.json(assignments);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 5. Submit Assignment (timetable: GET /student/timetable → timetable.controller.getStudentTimetable)
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
                academicYearId: req.academicYearId,
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
        const submissions = await Submission.find(addAcademicYearFilter({ studentId: student._id }, req.academicYearId))
            .populate('assignmentId', 'title subject');
        res.json(submissions);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 8. View Fees
exports.getFees = async (req, res) => {
    try {
        const student = await getStudent(req.user._id);
        const fees = await FeePayment.find(addAcademicYearFilter({ studentId: student._id }, req.academicYearId))
            .populate('studentId', 'firstName lastName')
            .sort({ month: -1 });
        res.json(fees);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 9. Update Profile
exports.updateProfile = async (req, res) => {
    try {
        const studentId = req.user._id;
        const { firstName, lastName, email, gender, dateOfBirth, address, guardianName, guardianContact } = req.body;

        let updateData = { firstName, lastName, email, gender, dateOfBirth, address, guardianName, guardianContact };
        if (req.file) {
            updateData.photo = req.file.location || req.file.path;
        }

        const student = await Student.findByIdAndUpdate(studentId, updateData, { new: true })
            .populate({
                path: 'classSection',
                populate: { path: 'standardId' }
            })
            .populate('schoolId');
        res.json({ message: 'Profile updated successfully', student });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 10. Change Password
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const student = await Student.findById(req.user._id);

        const isMatch = await bcrypt.compare(oldPassword, student.password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect old password' });

        student.password = await bcrypt.hash(newPassword, 10);
        await student.save();

        res.json({ message: 'Security credentials updated successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 11. View Exams (Schedule)
exports.getExams = async (req, res) => {
    try {
        const student = await getStudent(req.user._id);
        const enrollment = await StudentEnrollment.findOne({ studentId: student._id, academicYearId: req.academicYearId });
        const standardId = enrollment?.standardId || student.standard?._id || student.standard;
        const classSectionId = enrollment?.classSectionId || student.classSection?._id || student.classSection;

        const exams = await Exam.find(addAcademicYearFilter({
            standardId: standardId,
            schoolId: student.schoolId._id,
            isPublished: true,
            $or: [
                { classSection: classSectionId },
                { classSection: null }
            ]
        }, req.academicYearId)).populate('subject').sort({ date: 1 });
        res.json(exams);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 12. Download Report Card
exports.downloadReportCard = async (req, res) => {
    try {
        const id = req.user._id;
        const schoolId = req.user.schoolId._id || req.user.schoolId;

        const school = await School.findById(schoolId);
        if (!school) return res.status(404).json({ message: 'School not found' });

        const student = await Student.findOne({ _id: id, schoolId }).populate('standard classSection');
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const enrollment = await StudentEnrollment.findOne({ studentId: id, academicYearId: req.academicYearId })
            .populate('standardId')
            .populate('classSectionId');
        
        const standardToPrint = enrollment?.standardId || student.standard;
        const classSectionToPrint = enrollment?.classSectionId || student.classSection;

        const marks = await Mark.find(addAcademicYearFilter({ studentId: id, schoolId }, req.academicYearId))
            .populate({
                path: 'examId',
                match: { isPublished: true },
                populate: { path: 'subject' }
            });

        const validMarks = marks.filter(m => m.examId !== null);

        reportCardPDF.generatePDF(
            res,
            school,
            student,
            standardToPrint,
            classSectionToPrint,
            validMarks,
            req.academicYearName
        );
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 13. Download Fee Receipt
exports.downloadFeeReceipt = async (req, res) => {
    try {
        const { feeId } = req.params;
        const student = await getStudent(req.user._id);
        const fee = await FeePayment.findById(feeId).populate('academicYearId');

        if (!fee || fee.studentId.toString() !== student._id.toString()) {
            return res.status(404).json({ message: 'Fee record node not found' });
        }

        const enrollment = await StudentEnrollment.findOne({ studentId: student._id, academicYearId: fee.academicYearId })
            .populate('standardId')
            .populate('classSectionId');
        
        const standardToPrint = enrollment?.standardId || student.standard;
        const classSectionToPrint = enrollment?.classSectionId || student.classSection;

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Receipt_${fee.category}_${student.firstName}.pdf`);
        doc.pipe(res);

        // Styling
        const darkColor = '#0f172a';
        const brandColor = '#10b981';
        const lightColor = '#f8fafc';

        // Header Rect
        doc.rect(0, 0, 595, 150).fill(darkColor);
        doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold').text(student.schoolId.name.toUpperCase(), 40, 50);
        doc.fontSize(10).font('Helvetica').fillColor(brandColor).text('OFFICIAL FEE PAYMENT RECEIPT', 40, 85, { characterSpacing: 2 });

        doc.fontSize(10).font('Helvetica-Bold').fillColor('#ffffff').text(`RECEIPT NO: #${fee._id.toString().slice(-8).toUpperCase()}`, 400, 50, { align: 'right', width: 155 });
        doc.fontSize(10).font('Helvetica').fillColor('#94a3b8').text(`DATE: ${new Date(fee.paidDate || fee.updatedAt).toLocaleDateString()}`, 400, 65, { align: 'right', width: 155 });

        let y = 180;

        // Student Info
        doc.fillColor(darkColor).fontSize(12).font('Helvetica-Bold').text('STUDENT DETAILS', 40, y);
        y += 20;
        doc.moveTo(40, y).lineTo(555, y).strokeColor('#e2e8f0').lineWidth(1).stroke();
        y += 15;

        doc.fontSize(10).font('Helvetica-Bold').text('Student Name:', 40, y);
        doc.font('Helvetica').text(`${student.firstName} ${student.lastName}`, 140, y);
        doc.font('Helvetica-Bold').text('Admission No:', 320, y);
        doc.font('Helvetica').text(student.admissionNumber || 'N/A', 420, y);
        y += 20;
        doc.font('Helvetica-Bold').text('Grade/Sec:', 40, y);
        doc.font('Helvetica').text(`Grade ${standardToPrint?.level || 'N/A'} / ${classSectionToPrint?.sectionLabel || 'N/A'}`, 140, y);
        doc.font('Helvetica-Bold').text('Academic Year:', 320, y);
        doc.font('Helvetica').text(fee.academicYearId?.name || fee.academicYear || '2025-26', 420, y);

        y += 40;

        // Payment Details
        doc.fillColor(darkColor).fontSize(12).font('Helvetica-Bold').text('PAYMENT BREAKDOWN', 40, y);
        y += 20;
        doc.rect(40, y, 515, 30).fill(lightColor);
        doc.fillColor(darkColor).fontSize(10).font('Helvetica-Bold').text('DESCRIPTION', 50, y + 10);
        doc.text('AMOUNT (INR)', 450, y + 10, { align: 'right', width: 100 });

        y += 40;
        doc.font('Helvetica').fontSize(10).text(`${fee.category || 'Tuition Fee'}`, 50, y);
        doc.font('Helvetica-Bold').text(`₹${(fee.totalAmount || fee.amount)?.toLocaleString()}`, 450, y, { align: 'right', width: 100 });

        y += 30;
        doc.moveTo(40, y).lineTo(555, y).strokeColor('#e2e8f0').lineWidth(1).stroke();
        y += 15;

        doc.fontSize(12).font('Helvetica-Bold').text('TOTAL PAID:', 350, y);
        doc.fillColor(brandColor).fontSize(14).text(`₹${(fee.paidAmount || fee.totalAmount || fee.amount)?.toLocaleString()}`, 450, y - 2, { align: 'right', width: 100 });

        y += 40;
        doc.rect(40, y, 515, 60).fill('#ecfdf5');
        doc.fillColor('#065f46').fontSize(10).font('Helvetica-Bold').text('PAYMENT STATUS: CONFIRMED', 50, y + 15);
        doc.fontSize(9).font('Helvetica').text('Note: This is a system-generated receipt and does not require a physical signature.', 50, y + 35);

        // Footer
        doc.fontSize(8).fillColor('#94a3b8').text('© School Operations Network 2026 // Synchronized Ledger Entry', 0, 800, { align: 'center', width: 595 });

        doc.end();
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 14. Library Access
exports.getLibraryBooks = async (req, res) => {
    try {
        const student = await getStudent(req.user._id);
        const books = await Book.find({ schoolId: student.schoolId._id }).sort({ title: 1 });
        res.json(books);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.reserveBook = async (req, res) => {
    try {
        const { bookId } = req.body;
        const student = await getStudent(req.user._id);

        const book = await Book.findById(bookId);
        if (!book) return res.status(404).json({ message: 'Book not found' });

        const existing = await BookReservation.findOne({ schoolId: student.schoolId._id, bookId, studentId: student._id, status: 'pending' });
        if (existing) return res.status(400).json({ message: 'You already have a pending reservation for this book' });

        const reservation = await BookReservation.create({
            schoolId: student.schoolId._id,
            bookId,
            studentId: student._id
        });

        res.status(201).json({ message: 'Reservation placed successfully', data: reservation });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMyReservations = async (req, res) => {
    try {
        const student = await getStudent(req.user._id);
        const reservations = await BookReservation.find({ studentId: student._id })
            .populate('bookId', 'title category author')
            .sort({ requestDate: -1 });
        res.json(reservations);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 14. Get Quizzes
exports.getQuizzes = async (req, res) => {
    try {
        const student = await getStudent(req.user._id);
        const enrollment = await StudentEnrollment.findOne({ studentId: student._id, academicYearId: req.academicYearId });
        const standardId = enrollment?.standardId || student.standard?._id || student.standard;

        const quizzes = await Quiz.find(addAcademicYearFilter({
            schoolId: student.schoolId._id,
            standardId: standardId,
            isPublished: true
        }, req.academicYearId)).populate('subjectId', 'name').populate('questions');
        res.json(quizzes);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 15. Submit Quiz
exports.submitQuiz = async (req, res) => {
    try {
        const { quizId, answers } = req.body; // answers: [{ questionId, selectedOption }]
        const student = await getStudent(req.user._id);
        const quiz = await Quiz.findById(quizId).populate('questions');

        if (!quiz) return res.status(404).json({ message: 'Quiz terminal not found' });

        let score = 0;
        let totalPoints = 0;
        const results = quiz.questions.map(q => {
            const studentAns = answers.find(a => a.questionId.toString() === q._id.toString());
            const isCorrect = studentAns && studentAns.selectedOption === q.correctAnswer;
            if (isCorrect) score += q.points;
            totalPoints += q.points;
            return {
                questionId: q._id,
                selectedOption: studentAns ? studentAns.selectedOption : null,
                isCorrect: !!isCorrect
            };
        });

        const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
        const status = percentage >= quiz.passingScore ? 'Passed' : 'Failed';

        let attempt = await QuizAttempt.create({
            quizId,
            studentId: student._id,
            schoolId: student.schoolId._id,
            academicYearId: req.academicYearId,
            answers: results,
            score,
            totalPoints,
            status
        });

        attempt = await attempt.populate({
            path: 'quizId',
            populate: { path: 'subjectId', select: 'name' }
        });

        res.status(201).json({
            message: 'Academic evaluation synchronized',
            score,
            totalPoints,
            status,
            attempt
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 16. Get Quiz History
exports.getQuizHistory = async (req, res) => {
    try {
        const student = await getStudent(req.user._id);
        const attempts = await QuizAttempt.find(addAcademicYearFilter({ studentId: student._id }, req.academicYearId))
            .populate({
                path: 'quizId',
                populate: { path: 'subjectId', select: 'name' }
            })
            .sort({ createdAt: -1 });
        res.json(attempts);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 17. E-Learning Resources
exports.getStudentResources = async (req, res) => {
    try {
        const student = await getStudent(req.user._id);
        const enrollment = await StudentEnrollment.findOne({ studentId: student._id, academicYearId: req.academicYearId });
        const classSectionId = enrollment?.classSectionId || student.classSection?._id || student.classSection;

        const resources = await ResourceLocker.find({
            schoolId: student.schoolId._id,
            $or: [
                { classSection: classSectionId },
                { classSection: null }
            ]
        })
        .populate('teacherId', 'firstName lastName')
        .populate('subject', 'name')
        .sort({ uploadDate: -1 });
        res.json(resources);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// 17. Transport Logistics
exports.getTransport = async (req, res) => {
    try {
        const studentId = req.user._id;
        const route = await Route.findOne({
            'assignedStudents.studentId': studentId
        })
        .populate({
            path: 'vehicleId',
            select: 'registrationNumber type capacity driverName driverContact currentLocation'
        })
        .populate('assignedStudents.studentId', 'firstName lastName')
        .lean();

        if (!route) {
            return res.status(200).json(null);
        }

        const assignment = route.assignedStudents.find(as => as.studentId._id.toString() === studentId.toString());

        res.status(200).json({
            route,
            assignment
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.applyTransport = async (req, res) => {
    try {
        const studentId = req.user._id;
        const student = await Student.findById(studentId);
        
        if (student.transportStatus !== 'None') {
            return res.status(400).json({ message: `Current logistical status: ${student.transportStatus}. Application cannot be duplicated.` });
        }

        student.transportStatus = 'Applied';
        await student.save();

        // Notify Transporter
        const transporters = await User.find({ schoolId: student.schoolId, role: 'Transport_Manager' });
        for (const t of transporters) {
            await nc.sendNotification({
                schoolId: student.schoolId,
                recipient: t._id,
                sender: student._id,
                type: 'Transport',
                title: 'New Student Application',
                message: `Logistics request for ${student.firstName} ${student.lastName} has been filed.`,
                link: '/transporter/students'
            });
        }

        res.json({ message: 'Transport application synthesized. Awaiting administrative clearance.', student });
    } catch (err) { res.status(500).json({ message: err.message }); }
};
