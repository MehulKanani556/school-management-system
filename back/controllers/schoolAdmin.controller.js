const mongoose = require('mongoose');
const Student = require('../models/student.model');
const Teacher = require('../models/teacher.model');
const ClassSection = require('../models/classSection.model');
const Standard = require('../models/standard.model');
const Subject = require('../models/subject.model');
const Exam = require('../models/exam.model');
const FeePayment = require('../models/feePayment.model');
const FeeStructure = require('../models/feeStructure.model');
const Attendance = require('../models/attendance.model');
const User = require('../models/user.model');
const Mark = require('../models/mark.model');
const Holiday = require('../models/holiday.model');
const Payroll = require('../models/payroll.model');
const Leave = require('../models/leave.model');
const Review = require('../models/review.model');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const fs = require('fs');
const csv = require('csv-parser');
const { Parser } = require('json2csv');

const getSchoolId = (req) => req.user.schoolId;
const getSchoolAdminId = (req) => req.user._id;

const parseCSVDate = (dateStr) => {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;

  // Handle DD/MM/YYYY or DD-MM-YYYY
  const parts = String(dateStr).split(/[/ -]/);
  if (parts.length === 3) {
    // If first part is 4 digits, assume YYYY-MM-DD
    if (parts[0].length === 4) return new Date(parts[0], parts[1] - 1, parts[2]);
    // Else assume DD/MM/YYYY
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) return date;
  }
  return undefined;
};

// ─── Mailer ───────────────────────────────────────────────────────────────────
const sendTeacherWelcomeMail = async ({ email, firstName, lastName, employeeId, password, joiningDate }) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const formattedDate = joiningDate
    ? new Date(joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'Not specified';

  await transporter.sendMail({
    from: `"School Management" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to School Management System — Your Account Details',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#0f1117;color:#e2e8f0;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:32px;text-align:center;">
          <h1 style="margin:0;font-size:24px;color:#fff;letter-spacing:2px;">SCHOOL MANAGEMENT</h1>
          <p style="margin:8px 0 0;color:#bfdbfe;font-size:13px;">Teacher Account Created</p>
        </div>
        <div style="padding:32px;">
          <p style="font-size:16px;">Hello, <strong>${firstName} ${lastName}</strong> 👋</p>
          <p style="color:#94a3b8;">Your teacher account has been created. Here are your login credentials:</p>
          <div style="background:#1e293b;border-radius:12px;padding:20px;margin:24px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Employee ID</td><td style="padding:8px 0;font-weight:bold;">${employeeId}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Email</td><td style="padding:8px 0;font-weight:bold;">${email}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Password</td><td style="padding:8px 0;font-weight:bold;color:#60a5fa;">${password}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Joining Date</td><td style="padding:8px 0;font-weight:bold;">${formattedDate}</td></tr>
            </table>
          </div>
          <p style="color:#f59e0b;font-size:13px;">⚠️ Please change your password after first login.</p>
          <p style="color:#64748b;font-size:12px;margin-top:32px;">If you have any issues, contact your school administrator.</p>
        </div>
      </div>
    `,
  });
};

// ─── Dashboard Stats ───────────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const schoolId = getSchoolId(req);

    // 1. Basic Stats
    const [studentsCount, teachersCount, classesCount, pendingFeesCount, examsCount] = await Promise.all([
      Student.countDocuments({ schoolId, isActive: true, deletedAt: null }),
      Teacher.countDocuments({ schoolId, isActive: true, deletedAt: null }),
      ClassSection.countDocuments({ schoolId }),
      FeePayment.countDocuments({ schoolId, status: { $in: ['pending', 'partially_paid', 'overdue'] } }),
      Exam.countDocuments({ schoolId }),
    ]);

    // 2. Recent Activity (Latest additions)
    const [recentStudents, recentTeachers, recentExams] = await Promise.all([
      Student.find({ schoolId, deletedAt: null }).sort({ createdAt: -1 }).limit(3).select('firstName lastName createdAt'),
      Teacher.find({ schoolId, deletedAt: null }).sort({ createdAt: -1 }).limit(3).select('firstName lastName createdAt'),
      Exam.find({ schoolId }).sort({ createdAt: -1 }).limit(3).populate('subject', 'name').select('title createdAt'),
    ]);

    const activity = [
      ...recentStudents.map(s => ({ type: 'student', name: `${s.firstName} ${s.lastName}`, date: s.createdAt, action: 'Added new student' })),
      ...recentTeachers.map(t => ({ type: 'teacher', name: `${t.firstName} ${t.lastName}`, date: t.createdAt, action: 'Added new teacher' })),
      ...recentExams.map(e => ({ type: 'exam', name: e.title || e.subject?.name, date: e.createdAt, action: 'Scheduled new exam' })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    // 3. Attendance Trends (Last 7 records)
    const last7Attendance = await Attendance.find({ schoolId })
      .sort({ date: -1 })
      .limit(7)
      .select('date records');

    const attendanceTrends = last7Attendance.map(a => {
      const total = a.records.length;
      const present = a.records.filter(r => r.status === 'present').length;
      return {
        date: a.date.toISOString().split('T')[0],
        percentage: total > 0 ? Math.round((present / total) * 100) : 0
      };
    }).reverse();

    // 4. Fee Collection Trends (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentPayments = await FeePayment.find({
      schoolId,
      status: { $in: ['paid', 'partially_paid'] },
      paidDate: { $gte: sixMonthsAgo }
    }).select('paidAmount paidDate');

    const monthlyFees = {};
    recentPayments.forEach(p => {
      if (p.paidDate) {
        const month = p.paidDate.toLocaleString('default', { month: 'short' });
        monthlyFees[month] = (monthlyFees[month] || 0) + (p.paidAmount || 0);
      }
    });

    // Ensure we have last 6 months even if no data
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.toLocaleString('default', { month: 'short' });
      last6Months.push({ month: m, amount: monthlyFees[m] || 0 });
    }

    // 5. Calendar (Upcoming Exams & Holidays)
    const today = new Date();
    const [upcomingExams, upcomingHolidays] = await Promise.all([
      Exam.find({ schoolId, date: { $gte: today } }).sort({ date: 1 }).limit(5).populate('subject', 'name'),
      Holiday.find({ schoolId, startDate: { $gte: today } }).sort({ startDate: 1 }).limit(5),
    ]);

    const calendar = [
      ...upcomingExams.map(e => ({ type: 'exam', title: e.title || `Exam: ${e.subject?.name}`, date: e.date })),
      ...upcomingHolidays.map(h => ({ type: 'holiday', title: h.title, date: h.startDate, endDate: h.endDate })),
    ].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5);

    // 6. Exam Performance (Avg marks for last 5 exams with results)
    const recentExamsWithMarks = await Mark.aggregate([
      { $match: { schoolId: new mongoose.Types.ObjectId(schoolId) } },
      { $group: { _id: '$examId', avg: { $avg: '$marksObtained' } } },
      { $sort: { _id: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'exams', localField: '_id', foreignField: '_id', as: 'exam' } },
      { $unwind: '$exam' },
      { $lookup: { from: 'subjects', localField: 'exam.subject', foreignField: '_id', as: 'subject' } },
      { $unwind: '$subject' },
      { $project: { title: { $ifNull: ['$exam.title', '$subject.name'] }, avg: { $round: ['$avg', 0] } } }
    ]);

    // 7. Alerts
    const overdueFees = await FeePayment.countDocuments({ schoolId, status: 'overdue' });
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(); endOfDay.setHours(23, 59, 59, 999);
    const examsToday = await Exam.countDocuments({
      schoolId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    // 8. Growth Metrics (Comparison)
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [newStudentsThisMonth, newStudentsLastMonth, newTeachersThisMonth] = await Promise.all([
      Student.countDocuments({ schoolId, createdAt: { $gte: startOfThisMonth } }),
      Student.countDocuments({ schoolId, createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } }),
      Teacher.countDocuments({ schoolId, createdAt: { $gte: startOfThisMonth } }),
    ]);

    const studentGrowth = newStudentsLastMonth === 0 ? (newStudentsThisMonth > 0 ? 100 : 0) : Math.round(((newStudentsThisMonth - newStudentsLastMonth) / newStudentsLastMonth) * 100);

    // Growth Insight calculation
    let growthInsight = "Keep monitoring student engagement for better results.";
    if (recentExamsWithMarks.length >= 2) {
      const latestAvg = recentExamsWithMarks[0].avg;
      const prevAvg = recentExamsWithMarks[1].avg;
      const diff = latestAvg - prevAvg;
      if (diff > 0) growthInsight = `Overall student performance has improved by ${diff}% compared to previous assessments.`;
      else if (diff < 0) growthInsight = `Alert: Average marks have dipped by ${Math.abs(diff)}%. Reviewing curriculum recommended.`;
    }
    console.log("aa", recentPayments);

    res.json({
      students: studentsCount,
      teachers: teachersCount,
      classes: classesCount,
      pendingFees: pendingFeesCount,
      exams: examsCount,
      activity,
      attendanceTrends,
      feeTrends: last6Months,
      calendar,
      examPerformance: recentExamsWithMarks,
      alerts: {
        overdueFees,
        examsToday
      },
      metrics: {
        studentGrowth,
        newTeachers: newTeachersThisMonth,
        growthInsight
      }
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Standards ────────────────────────────────────────────────────────────────
exports.getStandards = async (req, res) => {
  try {
    const standards = await Standard.find({ schoolId: getSchoolId(req) }).populate('subjects', 'name code');
    res.json(standards);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createStandard = async (req, res) => {
  try {
    const standard = await Standard.create({ ...req.body, schoolId: getSchoolId(req) });
    const populated = await standard.populate('subjects', 'name code');
    res.status(201).json({ message: 'Standard node created successfully', data: populated });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateStandard = async (req, res) => {
  try {
    const standard = await Standard.findOneAndUpdate(
      { _id: req.params.id, schoolId: getSchoolId(req) },
      req.body, { new: true }
    ).populate('subjects', 'name code');
    if (!standard) return res.status(404).json({ message: 'Standard not found' });
    res.json({ message: 'Standard node modified successfully', data: standard });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteStandard = async (req, res) => {
  try {
    await Standard.findOneAndDelete({ _id: req.params.id, schoolId: getSchoolId(req) });
    res.json({ message: 'Standard deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Students ─────────────────────────────────────────────────────────────────
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find({ schoolId: getSchoolId(req), deletedAt: null })
      .populate('standard', 'level name')
      .populate('classSection', 'sectionLabel');
    res.json(students);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createStudent = async (req, res) => {
  try {
    const { dateOfBirth } = req.body;
    const body = { ...req.body };
    if (req.file) body.photo = req.file.location;

    // Generate password from DOB (DDMMYY)
    let plainPassword = '';
    if (dateOfBirth) {
      const d = new Date(dateOfBirth);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear()).substring(2);
      plainPassword = `${day}${month}${year}`;
    }

    const hashedPassword = await bcrypt.hash(plainPassword || '123456', 10);

    const student = await Student.create({
      ...body,
      schoolId: getSchoolId(req),
      schoolAdminId: getSchoolAdminId(req),
      createdBy: req.user._id,
      password: hashedPassword
    });

    const populated = await student.populate([
      { path: 'standard', select: 'level name' },
      { path: 'classSection', select: 'sectionLabel' }
    ]);
    res.status(201).json({ message: 'Student node provisioned successfully', data: populated });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateStudent = async (req, res) => {
  try {
    const body = { ...req.body };
    if (req.file) body.photo = req.file.location;

    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, schoolId: getSchoolId(req) },
      body, { new: true }
    ).populate([
      { path: 'standard', select: 'level name' },
      { path: 'classSection', select: 'sectionLabel' }
    ]);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student identity updated successfully', data: student });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteStudent = async (req, res) => {
  try {
    await Student.findOneAndUpdate(
      { _id: req.params.id, schoolId: getSchoolId(req) },
      { deletedAt: new Date(), isActive: false }
    );
    res.json({ message: 'Student record deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Teacher Validation ───────────────────────────────────────────────────────
const validateTeacher = (body) => {
  const { firstName, lastName, email, phone, joiningDate } = body;
  const errors = {};

  if (!firstName?.trim()) errors.firstName = 'First name is required';
  else if (firstName.trim().length < 2) errors.firstName = 'First name must be at least 2 characters';

  if (!lastName?.trim()) errors.lastName = 'Last name is required';
  else if (lastName.trim().length < 2) errors.lastName = 'Last name must be at least 2 characters';

  if (!email?.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Invalid email address';

  if (!phone?.trim()) errors.phone = 'Phone number is required';
  else if (!/^[0-9+\-\s()]{7,15}$/.test(phone.trim())) errors.phone = 'Invalid phone number (7-15 digits)';

  if (joiningDate && isNaN(new Date(joiningDate).getTime())) errors.joiningDate = 'Invalid joining date';

  return errors;
};

// ─── Teachers ─────────────────────────────────────────────────────────────────
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({ schoolId: getSchoolId(req), deletedAt: null });
    res.json(teachers);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createTeacher = async (req, res) => {
  try {
    const errors = validateTeacher(req.body);
    if (Object.keys(errors).length) return res.status(422).json({ message: 'Validation failed', errors });

    const { email, phone, firstName, lastName, qualifications, joiningDate } = req.body;

    // check duplicate email/phone across teachers
    const duplicate = await Teacher.findOne({ $or: [{ email: email.trim() }, { phone: phone.trim() }] });
    if (duplicate) {
      const field = duplicate.email === email.trim() ? 'Email' : 'Phone number';
      return res.status(400).json({ message: `${field} is already registered` });
    }

    // check if user with this email already exists
    const existingUser = await User.findOne({ email: email.trim() });
    if (existingUser) return res.status(400).json({ message: 'A user with this email already exists' });

    // password = email (plain), hash for storage
    const plainPassword = email.trim();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    console.log("asas", req.user);
    // create User record
    const user = await User.create({
      firstName, lastName,
      email: email.trim(),
      password: hashedPassword,
      role: 'Teacher',
      schoolId: getSchoolId(req),
      photo: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(`${firstName} ${lastName}`) + '&background=2563eb&color=fff',
    });

    // create Teacher record linked to user
    const teacher = await Teacher.create({
      ...req.body,
      email: email.trim(),
      phone: phone.trim(),
      schoolId: getSchoolId(req),

      schoolAdminId: getSchoolAdminId(req),
      userId: user._id,
      qualifications,
      joiningDate
    });

    // send welcome email (non-blocking — don't fail if mail fails)
    sendTeacherWelcomeMail({
      email: email.trim(), firstName, lastName,
      employeeId: teacher.employeeId,
      password: plainPassword,
      joiningDate: teacher.joiningDate,
    }).catch(err => console.error('Mail error:', err));

    res.status(201).json({ message: 'Teacher node provisioned successfully', data: teacher });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateTeacher = async (req, res) => {
  try {
    const errors = validateTeacher(req.body);
    if (Object.keys(errors).length) return res.status(422).json({ message: 'Validation failed', errors });

    const { email, phone } = req.body;
    const duplicate = await Teacher.findOne({
      _id: { $ne: req.params.id },
      $or: [{ email: email.trim() }, { phone: phone.trim() }],
    });
    if (duplicate) {
      const field = duplicate.email === email.trim() ? 'Email' : 'Phone number';
      return res.status(400).json({ message: `${field} is already registered` });
    }

    const teacher = await Teacher.findOneAndUpdate(
      { _id: req.params.id, schoolId: getSchoolId(req) },
      req.body, { new: true }
    );
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    // sync name/email on linked User too
    if (teacher.userId) {
      await User.findByIdAndUpdate(teacher.userId, {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: email.trim(),
      });
    }

    res.json({ message: 'Teacher identity updated successfully', data: teacher });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.toggleTeacherStatus = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ _id: req.params.id, schoolId: getSchoolId(req) });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    teacher.isActive = !teacher.isActive;
    await teacher.save();

    // sync isActive on linked User
    if (teacher.userId) {
      await User.findByIdAndUpdate(teacher.userId, { isActive: teacher.isActive });
    }

    res.json({ isActive: teacher.isActive, message: `Teacher ${teacher.isActive ? 'activated' : 'deactivated'}` });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findOneAndUpdate(
      { _id: req.params.id, schoolId: getSchoolId(req) },
      { deletedAt: new Date(), isActive: false }
    );
    if (teacher && teacher.userId) {
      await User.findByIdAndUpdate(teacher.userId, { isActive: false });
    }
    res.json({ message: 'Teacher record deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Classes ──────────────────────────────────────────────────────────────────
exports.getClasses = async (req, res) => {
  try {
    const classes = await ClassSection.find({ schoolId: getSchoolId(req) })
      .populate('standardId', 'level name')
      .populate('classTeacher', 'firstName lastName')
      .populate('subjectAssignments.subject', 'name code')
      .populate('subjectAssignments.teachers', 'firstName lastName');
    res.json(classes);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createClass = async (req, res) => {
  try {
    const { standardId, sectionLabel, classTeacher } = req.body;
    const schoolId = getSchoolId(req);

    // Check if section already exists in this standard
    const existingSection = await ClassSection.findOne({ schoolId, standardId, sectionLabel });
    if (existingSection) return res.status(400).json({ message: `Section ${sectionLabel} already exists for this Standard` });

    // Check if teacher is already a class teacher for another section
    if (classTeacher) {
      const alreadyAssigned = await ClassSection.findOne({ schoolId, classTeacher });
      if (alreadyAssigned) return res.status(400).json({ message: 'Teacher is already assigned as a Class Teacher to another section' });
    }

    const cls = await ClassSection.create({ ...req.body, schoolId });
    const populated = await cls.populate([
      { path: 'standardId', select: 'level' },
      { path: 'classTeacher', select: 'firstName lastName' },
      { path: 'subjectAssignments.subject', select: 'name code' },
      { path: 'subjectAssignments.teachers', select: 'firstName lastName' }
    ]);
    res.status(201).json({ message: 'Academic section created successfully', data: populated });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateClass = async (req, res) => {
  try {
    const { standardId, sectionLabel, classTeacher } = req.body;
    const schoolId = getSchoolId(req);

    // Check for duplicate section
    const existingSection = await ClassSection.findOne({
      schoolId, standardId, sectionLabel,
      _id: { $ne: req.params.id }
    });
    if (existingSection) return res.status(400).json({ message: `Section ${sectionLabel} already exists for this Standard` });

    // Check if teacher is already a class teacher elsewhere
    if (classTeacher) {
      const alreadyAssigned = await ClassSection.findOne({
        schoolId, classTeacher,
        _id: { $ne: req.params.id }
      });
      if (alreadyAssigned) return res.status(400).json({ message: 'Teacher is already assigned as a Class Teacher to another section' });
    }

    const cls = await ClassSection.findOneAndUpdate(
      { _id: req.params.id, schoolId },
      req.body, { new: true }
    ).populate([
      { path: 'standardId', select: 'level' },
      { path: 'classTeacher', select: 'firstName lastName' },
      { path: 'subjectAssignments.subject', select: 'name code' },
      { path: 'subjectAssignments.teachers', select: 'firstName lastName' }
    ]);
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.json({ message: 'Academic section modified successfully', data: cls });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteClass = async (req, res) => {
  try {
    await ClassSection.findOneAndDelete({ _id: req.params.id, schoolId: getSchoolId(req) });
    res.json({ message: 'Class deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Fees ─────────────────────────────────────────────────────────────────────
exports.getFees = async (req, res) => {
  try {
    const fees = await FeePayment.find({ schoolId: getSchoolId(req) }).populate('studentId', 'firstName lastName admissionNumber');
    res.json(fees);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createFee = async (req, res) => {
  try {
    const fee = await FeePayment.create({ ...req.body, schoolId: getSchoolId(req) });
    const populated = await FeePayment.findById(fee._id).populate('studentId', 'firstName lastName admissionNumber');
    res.status(201).json({ message: 'Fee node created successfully', data: populated });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateFee = async (req, res) => {
  try {
    const { paidAmount } = req.body;
    const existing = await FeePayment.findOne({ _id: req.params.id, schoolId: getSchoolId(req) });
    if (!existing) return res.status(404).json({ message: 'Fee record not found' });

    const updateData = { ...req.body };

    // If paidAmount is provided, automatically update status
    if (paidAmount !== undefined) {
      if (paidAmount >= existing.amount) {
        updateData.status = 'paid';
        updateData.paidDate = new Date();
      } else if (paidAmount > 0) {
        updateData.status = 'partially_paid';
        updateData.paidDate = new Date();
      } else {
        updateData.status = 'pending';
      }
    } else if (req.body.status === 'paid') {
      // Manual status override to 'paid'
      updateData.paidAmount = existing.amount;
      updateData.paidDate = new Date();
    }

    const fee = await FeePayment.findByIdAndUpdate(
      req.params.id,
      updateData, { new: true }
    ).populate('studentId', 'firstName lastName admissionNumber');

    res.json({ message: 'Fee node modified successfully', data: fee });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteFee = async (req, res) => {
  try {
    await FeePayment.findOneAndDelete({ _id: req.params.id, schoolId: getSchoolId(req) });
    res.json({ message: 'Fee record deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Fee Structures ────────────────────────────────────────────────────────────
exports.getFeeStructures = async (req, res) => {
  try {
    const structures = await FeeStructure.find({ schoolId: getSchoolId(req) }).populate('standardId', 'level name');
    res.json(structures);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createFeeStructure = async (req, res) => {
  try {
    const sub = await FeeStructure.create({ ...req.body, schoolId: getSchoolId(req) });
    const populated = await sub.populate('standardId', 'level name');
    res.status(201).json({ message: 'Fee structure node created successfully', data: sub });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateFeeStructure = async (req, res) => {
  try {
    const sub = await FeeStructure.findOneAndUpdate(
      { _id: req.params.id, schoolId: getSchoolId(req) },
      req.body, { new: true }
    ).populate('standardId', 'level name');
    if (!sub) return res.status(404).json({ message: 'Fee structure not found' });
    res.json({ message: 'Fee structure node modified successfully', data: sub });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteFeeStructure = async (req, res) => {
  try {
    await FeeStructure.findOneAndDelete({ _id: req.params.id, schoolId: getSchoolId(req) });
    res.json({ message: 'Fee structure deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Apply structure to students (Generate Fees)
exports.applyFeeStructure = async (req, res) => {
  try {
    const { standardId, dueDate, academicYear } = req.body;
    const schoolId = getSchoolId(req);

    const structure = await FeeStructure.findOne({ schoolId, standardId, academicYear });
    if (!structure) return res.status(404).json({ message: 'No structure found for this standard' });

    // find students in this standard
    const filtered = await Student.find({ schoolId, standard: standardId });

    if (!filtered.length) return res.status(404).json({ message: 'No students found in this grade' });

    // Guard against duplicates
    const existingPayments = await FeePayment.find({ schoolId, academicYear });
    const existingKeys = new Set(existingPayments.map(p => `${p.studentId}-${p.category}`));

    const payments = filtered.flatMap(s =>
      structure.feeItems
        .filter(item => !existingKeys.has(`${s._id}-${item.name}`))
        .map(item => ({
          schoolId,
          studentId: s._id,
          amount: item.amount,
          category: item.name,
          academicYear,
          feeStructureId: structure._id,
          status: 'pending',
          dueDate: new Date(dueDate)
        }))
    );

    if (!payments.length) return res.status(400).json({ message: 'Fees already applied for all students in this grade' });

    await FeePayment.insertMany(payments);
    res.json({ message: `Successfully generated ${payments.length} fee records` });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Exams ────────────────────────────────────────────────────────────────────
exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.find({ schoolId: getSchoolId(req) })
      .populate('standardId', 'level name')
      .populate('classSection', 'sectionLabel')
      .populate('subject', 'name code');
    res.json(exams);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createExam = async (req, res) => {
  try {
    const body = { ...req.body };
    if (!body.classSection) delete body.classSection; // Handle "whole grade"
    const exam = await Exam.create({ ...body, schoolId: getSchoolId(req) });
    const populated = await exam.populate([
      { path: 'standardId', select: 'level name' },
      { path: 'classSection', select: 'sectionLabel' },
      { path: 'subject', select: 'name code' }
    ]);
    res.status(201).json({ message: 'Examination node created successfully', data: populated });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateExam = async (req, res) => {
  try {
    const body = { ...req.body };
    if (!body.classSection) body.classSection = null; // Correctly unset if empty
    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.id, schoolId: getSchoolId(req) },
      body, { new: true }
    ).populate([
      { path: 'standardId', select: 'level name' },
      { path: 'classSection', select: 'sectionLabel' },
      { path: 'subject', select: 'name code' }
    ]);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json({ message: 'Examination node modified successfully', data: exam });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteExam = async (req, res) => {
  try {
    await Exam.findOneAndDelete({ _id: req.params.id, schoolId: getSchoolId(req) });
    res.json({ message: 'Exam deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Attendance ───────────────────────────────────────────────────────────────
exports.getAttendance = async (req, res) => {
  try {
    const { classSection, date } = req.query;
    const filter = { schoolId: getSchoolId(req) };
    if (classSection) filter.classSection = classSection;
    if (date) filter.date = new Date(date);
    const attendance = await Attendance.find(filter)
      .populate('standardId', 'level')
      .populate('classSection', 'sectionLabel')
      .populate('records.studentId', 'firstName lastName admissionNumber');
    res.json(attendance);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.saveAttendance = async (req, res) => {
  try {
    const { standardId, classSection, date, records } = req.body;
    const schoolId = getSchoolId(req);
    const attendance = await Attendance.findOneAndUpdate(
      { schoolId, standardId, classSection, date: new Date(date) },
      { schoolId, standardId, classSection, date: new Date(date), records, submittedBy: req.user._id },
      { upsert: true, new: true }
    );
    res.json({ message: 'Attendance registry committed successfully', data: attendance });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Subjects ─────────────────────────────────────────────────────────────────
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ schoolId: getSchoolId(req) });
    res.json(subjects);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createSubject = async (req, res) => {
  try {
    const sub = await Subject.create({ ...req.body, schoolId: getSchoolId(req) });
    res.status(201).json({ message: 'Subject node created successfully', data: sub });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateSubject = async (req, res) => {
  try {
    const sub = await Subject.findOneAndUpdate(
      { _id: req.params.id, schoolId: getSchoolId(req) },
      req.body, { new: true }
    );
    if (!sub) return res.status(404).json({ message: 'Subject not found' });
    res.json({ message: 'Subject node modified successfully', data: sub });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteSubject = async (req, res) => {
  try {
    await Subject.findOneAndDelete({ _id: req.params.id, schoolId: getSchoolId(req) });
    res.json({ message: 'Subject deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Payroll ──────────────────────────────────────────────────────────────────
exports.getAllPayroll = async (req, res) => {
  try {
    const payroll = await Payroll.find({ schoolId: getSchoolId(req) }).populate('teacherId', 'firstName lastName employeeId');
    res.json(payroll);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createPayroll = async (req, res) => {
  try {
    const { teacherId, month, year, bonus, deductions, status, paymentDate, remarks } = req.body;
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const baseSalary = teacher.baseSalary || 0;
    const totalAmount = baseSalary + (Number(bonus) || 0) - (Number(deductions) || 0);

    const payroll = await Payroll.create({
      schoolId: getSchoolId(req),
      teacherId, month, year, baseSalary, bonus, deductions, totalAmount, status, paymentDate, remarks,
      submittedBy: req.user._id
    });
    const populated = await payroll.populate('teacherId', 'firstName lastName employeeId');
    res.status(201).json({ message: 'Payroll record created successfully', data: populated });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updatePayroll = async (req, res) => {
  try {
    const { bonus, deductions, status, paymentDate, remarks } = req.body;
    const payroll = await Payroll.findOne({ _id: req.params.id, schoolId: getSchoolId(req) });
    if (!payroll) return res.status(404).json({ message: 'Payroll record not found' });

    payroll.bonus = bonus !== undefined ? Number(bonus) : payroll.bonus;
    payroll.deductions = deductions !== undefined ? Number(deductions) : payroll.deductions;
    payroll.status = status || payroll.status;
    payroll.paymentDate = paymentDate || payroll.paymentDate;
    payroll.remarks = remarks || payroll.remarks;
    payroll.totalAmount = payroll.baseSalary + (Number(payroll.bonus) || 0) - (Number(payroll.deductions) || 0);

    await payroll.save();
    const populated = await payroll.populate('teacherId', 'firstName lastName employeeId');
    res.json({ message: 'Payroll record modified successfully', data: populated });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deletePayroll = async (req, res) => {
  try {
    await Payroll.findOneAndDelete({ _id: req.params.id, schoolId: getSchoolId(req) });
    res.json({ message: 'Payroll record removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Leave Management ─────────────────────────────────────────────────────────
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ schoolId: getSchoolId(req) }).populate('teacherId', 'firstName lastName employeeId').sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const leave = await Leave.findOne({ _id: req.params.id, schoolId: getSchoolId(req) });
    if (!leave) return res.status(404).json({ message: 'Leave application not found' });

    leave.status = status;
    leave.actionedBy = req.user._id;
    leave.actionedAt = new Date();
    await leave.save();

    const populated = await leave.populate('teacherId', 'firstName lastName employeeId');
    res.json({ message: `Leave application ${status} successfully`, data: populated });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Teacher Reviews ──────────────────────────────────────────────────────────
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ schoolId: getSchoolId(req) })
      .populate('teacherId', 'firstName lastName employeeId')
      .populate('reviewerId', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createReview = async (req, res) => {
  try {
    const review = await Review.create({
      ...req.body,
      schoolId: getSchoolId(req),
      reviewerId: req.user._id
    });
    const populated = await review.populate([
      { path: 'teacherId', select: 'firstName lastName employeeId' },
      { path: 'reviewerId', select: 'firstName lastName' }
    ]);
    res.status(201).json({ message: 'Performance review node created', data: populated });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, schoolId: getSchoolId(req) },
      req.body, { new: true }
    ).populate([
      { path: 'teacherId', select: 'firstName lastName employeeId' },
      { path: 'reviewerId', select: 'firstName lastName' }
    ]);
    if (!review) return res.status(404).json({ message: 'Performance review not found' });
    res.json({ message: 'Performance review node modified', data: review });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteReview = async (req, res) => {
  try {
    await Review.findOneAndDelete({ _id: req.params.id, schoolId: getSchoolId(req) });
    res.json({ message: 'Performance review node removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.exportStudents = async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const students = await Student.find({ schoolId, deletedAt: null })
      .populate('standard', 'level')
      .populate('classSection', 'sectionLabel');

    const fields = [
      { label: 'First Name', value: 'firstName' },
      { label: 'Last Name', value: 'lastName' },
      { label: 'Admission Number', value: 'admissionNumber' },
      { label: 'Roll Number', value: 'rollNumber' },
      { label: 'Date of Birth', value: (row) => row.dateOfBirth ? row.dateOfBirth.toISOString().split('T')[0] : '' },
      { label: 'Gender', value: 'gender' },
      { label: 'Standard', value: 'standard.level' },
      { label: 'Section', value: 'classSection.sectionLabel' },
      { label: 'Guardian Name', value: 'guardianName' },
      { label: 'Guardian Contact', value: 'guardianContact' },
      { label: 'Address', value: 'address' }
    ];

    const parser = new Parser({ fields });
    const csvData = parser.parse(students);

    res.header('Content-Type', 'text/csv');
    res.attachment(`Students_${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csvData);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.importStudents = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const schoolId = getSchoolId(req);
    const results = [];
    const standards = await Standard.find({ schoolId });
    const sections = await ClassSection.find({ schoolId });

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          const processed = [];
          for (const row of results) {
            const std = standards.find(s => String(s.level) === row.Standard);
            const sec = std ? sections.find(s => s.sectionLabel === row.Section && String(s.standardId) === String(std._id)) : null;

            let plainPassword = '123456';
            const dob = parseCSVDate(row['Date of Birth']);
            if (dob) {
              plainPassword = `${String(dob.getDate()).padStart(2, '0')}${String(dob.getMonth() + 1).padStart(2, '0')}${String(dob.getFullYear()).substring(2)}`;
            }
            const hashedPassword = await bcrypt.hash(plainPassword, 10);

            processed.push({
              firstName: row['First Name'],
              lastName: row['Last Name'],
              admissionNumber: row['Admission Number'] || undefined,
              rollNumber: row['Roll Number'],
              dateOfBirth: dob,
              gender: (row.Gender || 'other').toLowerCase(),
              guardianName: row['Guardian Name'],
              guardianContact: row['Guardian Contact'],
              address: row.Address,
              standard: std ? std._id : undefined,
              classSection: sec ? sec._id : undefined,
              schoolId,
              schoolAdminId: req.user._id,
              createdBy: req.user._id,
              password: hashedPassword
            });
          }

          await Student.insertMany(processed);
          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
          res.status(201).json({ message: `${processed.length} students imported successfully` });
        } catch (err) { res.status(500).json({ message: err.message }); }
      });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.exportTeachers = async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const teachers = await Teacher.find({ schoolId, deletedAt: null });

    const fields = [
      { label: 'First Name', value: 'firstName' },
      { label: 'Last Name', value: 'lastName' },
      { label: 'Employee ID', value: 'employeeId' },
      { label: 'Email', value: 'email' },
      { label: 'Phone', value: 'phone' },
      { label: 'Qualifications', value: (row) => row.qualifications?.join(', ') || '' },
      { label: 'Joining Date', value: (row) => row.joiningDate ? row.joiningDate.toISOString().split('T')[0] : '' }
    ];

    const parser = new Parser({ fields });
    const csvData = parser.parse(teachers);

    res.header('Content-Type', 'text/csv');
    res.attachment(`Teachers_${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csvData);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.importTeachers = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const schoolId = getSchoolId(req);
    const results = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          let count = 0;
          for (const row of results) {
            const email = row.Email?.trim();
            if (!email) continue;

            const existing = await User.findOne({ email });
            if (existing) continue;

            const hashedPassword = await bcrypt.hash(email, 10);
            const user = await User.create({
              firstName: row['First Name'],
              lastName: row['Last Name'],
              email,
              password: hashedPassword,
              role: 'Teacher',
              schoolId,
              photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(row['First Name'] + ' ' + row['Last Name'])}&background=2563eb&color=fff`,
            });

            await Teacher.create({
              firstName: row['First Name'],
              lastName: row['Last Name'],
              email,
              phone: row.Phone,
              employeeId: row['Employee ID'] || undefined,
              schoolId,
              schoolAdminId: req.user._id,
              userId: user._id,
              qualifications: row.Qualifications ? row.Qualifications.split(',').map(q => q.trim()) : [],
              joiningDate: parseCSVDate(row['Joining Date'])
            });
            count++;
          }

          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
          res.status(201).json({ message: `${count} teachers imported successfully` });
        } catch (err) { res.status(500).json({ message: err.message }); }
      });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
