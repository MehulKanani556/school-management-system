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
const School = require('../models/school.model');
const { sendFeeReminderMail } = require('../utils/mail');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const fs = require('fs');
const csv = require('csv-parser');
const PDFDocument = require('pdfkit');
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
    const [studentsCount, teachersCount, classesCount, pendingFeesCount, examsCount, accountantCount, librarianCount, transportCount] = await Promise.all([
      Student.countDocuments({ schoolId, isActive: true, deletedAt: null }),
      Teacher.countDocuments({ schoolId, isActive: true, deletedAt: null }),
      ClassSection.countDocuments({ schoolId }),
      FeePayment.countDocuments({ schoolId, status: { $in: ['pending', 'partially_paid', 'overdue'] } }),
      Exam.countDocuments({ schoolId }),
      User.countDocuments({ schoolId, role: 'Accountant', isActive: true }),
      User.countDocuments({ schoolId, role: 'Librarian', isActive: true }),
      User.countDocuments({ schoolId, role: 'Transport_Manager', isActive: true }),
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
      accountants: accountantCount,
      librarians: librarianCount,
      transporters: transportCount,
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

exports.createStaff = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, role, password } = req.body;
    const schoolId = getSchoolId(req);

    const allowedRoles = ['Accountant', 'Librarian', 'Transport_Manager'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role for staff registry' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User with this email already exists' });

    const hashedPassword = await bcrypt.hash(password || email, 10);
    const user = await User.create({
      firstName, lastName, email,
      password: hashedPassword,
      role,
      schoolId,
      photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + ' ' + lastName)}&background=random&color=fff`,
      phoneNumber: phone
    });

    res.status(201).json({ message: 'Staff member provisioned successfully', user });
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
    const students = await Student.find({ schoolId: getSchoolId(req), deletedAt: null }).sort({ createdAt: -1 })
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

    // ─── Parent Node Provisioning ───
    let parentId = null;
    if (req.body.guardianEmail) {
      let parentUser = await User.findOne({ email: req.body.guardianEmail });
      if (!parentUser) {
        // Create new Parent User
        const parentPass = await bcrypt.hash('parent123', 10);
        const nameParts = (req.body.guardianName || 'Parent').split(' ');
        parentUser = await User.create({
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' ') || 'Guardian',
          email: req.body.guardianEmail,
          password: parentPass,
          role: 'Parent',
          schoolId: getSchoolId(req),
          photo: 'https://via.placeholder.com/150'
        });
      }
      parentId = parentUser._id;
    }

    const student = await Student.create({
      ...body,
      schoolId: getSchoolId(req),
      schoolAdminId: getSchoolAdminId(req),
      createdBy: req.user._id,
      password: hashedPassword,
      parentId
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

    // If DOB is changed, update password as well (DDMMYY)
    if (body.dateOfBirth) {
      const d = new Date(body.dateOfBirth);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear()).substring(2); // YY format
      const plainPassword = `${day}${month}${year}`;
      body.password = await bcrypt.hash(plainPassword, 10);
    }

    // ─── Sync Parent Node Linkage ───
    if (body.guardianEmail) {
      let parentUser = await User.findOne({ email: body.guardianEmail });
      if (!parentUser) {
        const parentPass = await bcrypt.hash('parent123', 10);
        const nameParts = (body.guardianName || 'Parent').split(' ');
        parentUser = await User.create({
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' ') || 'Guardian',
          email: body.guardianEmail,
          password: parentPass,
          role: 'Parent',
          schoolId: getSchoolId(req),
        });
      }
      body.parentId = parentUser._id;
    }

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

exports.promoteStudents = async (req, res) => {
  try {
    const { studentIds, fromStandardId, fromClassSectionId, toStandardId, toClassSectionId } = req.body;
    const schoolId = getSchoolId(req);

    // Build filter for source selection
    let filter = { schoolId, deletedAt: null };
    if (Array.isArray(studentIds) && studentIds.length > 0) {
      filter._id = { $in: studentIds };
    } else if (fromClassSectionId) {
      filter.classSection = fromClassSectionId;
    } else if (fromStandardId) {
      filter.standard = fromStandardId;
    } else {
      return res.status(400).json({ message: 'Please specify students or source class to promote' });
    }

    // Check target standard existence
    const targetStandard = await Standard.findOne({ _id: toStandardId, schoolId });
    if (!targetStandard) return res.status(404).json({ message: 'Target grade level (Standard) not found' });

    // Update students
    const updateData = { standard: toStandardId };
    if (toClassSectionId) {
      updateData.classSection = toClassSectionId;
    } else {
      // If moving to next grade but section is not yet decided, clear the old section
      updateData.classSection = null;
    }

    const result = await Student.updateMany(filter, updateData);

    res.json({ 
      message: `Promotion cycle completed. ${result.modifiedCount} records migrated to Level ${targetStandard.level}.`, 
      modifiedCount: result.modifiedCount 
    });
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
    const teachers = await Teacher.find({ schoolId: getSchoolId(req), deletedAt: null }).sort({ createdAt: -1 });
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

    // Fetch standard to ensure subjects match
    const standard = await Standard.findById(standardId);
    if (!standard) return res.status(404).json({ message: 'Standard not found' });

    // Enforce standard subjects
    const standardSubjectIds = standard.subjects.map(s => s.toString());
    const incomingAssignments = req.body.subjectAssignments || [];
    
    // Filter and normalize assignments
    const finalAssignments = standardSubjectIds.map(sId => {
      const existing = incomingAssignments.find(a => (a.subject?._id || a.subject)?.toString() === sId);
      return {
        subject: sId,
        teachers: existing ? (existing.teachers || []).map(t => t._id || t) : []
      };
    });

    const cls = await ClassSection.create({ 
      ...req.body, 
      schoolId,
      subjectAssignments: finalAssignments,
      subjects: standardSubjectIds
    });

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

    // Fetch standard to ensure subjects match
    const standard = await Standard.findById(standardId || req.body.standardId);
    if (!standard) return res.status(404).json({ message: 'Standard not found' });

    // Enforce standard subjects
    const standardSubjectIds = standard.subjects.map(s => s.toString());
    const incomingAssignments = req.body.subjectAssignments || [];

    // Reconcile assignments
    const finalAssignments = standardSubjectIds.map(sId => {
      const existing = incomingAssignments.find(a => (a.subject?._id || a.subject)?.toString() === sId);
      return {
        subject: sId,
        teachers: existing ? (existing.teachers || []).map(t => t._id || t) : []
      };
    });

    const cls = await ClassSection.findOneAndUpdate(
      { _id: req.params.id, schoolId },
      { 
        ...req.body, 
        subjectAssignments: finalAssignments,
        subjects: standardSubjectIds
      }, { new: true }
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
    const schoolId = getSchoolId(req);
    const today = new Date();
    
    // Auto-check overdue and calculate late fees (e.g., 10 per day)
    const overduePayments = await FeePayment.find({ 
        schoolId, 
        status: { $in: ['pending', 'overdue', 'partially_paid'] },
        dueDate: { $lt: today }
    });
    
    for (const payment of overduePayments) {
        const daysLate = Math.floor((today - new Date(payment.dueDate)) / (1000 * 60 * 60 * 24));
        if (daysLate > 0) {
            const calculatedLateFees = daysLate * 10; // 10 per day
            if (payment.lateFees !== calculatedLateFees) {
                payment.lateFees = calculatedLateFees;
                payment.status = 'overdue';
                await payment.save(); // triggers pre-save for totalAmount
            }
        }
    }

    const fees = await FeePayment.find({ schoolId })
      .sort({ createdAt: -1 })
      .populate('studentId', 'firstName lastName admissionNumber');
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
    const { paidAmount, status, paymentMethod, transactionId } = req.body;
    const schoolId = getSchoolId(req);
    const fee = await FeePayment.findOne({ _id: req.params.id, schoolId });
    if (!fee) return res.status(404).json({ message: 'Fee record not found' });
    const updateData = { ...req.body };
    const existing = fee;

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

    // sync school revenue if payment changed
    if (paidAmount !== undefined && paidAmount !== existing.paidAmount) {
        const diff = paidAmount - (existing.paidAmount || 0);
        await School.findByIdAndUpdate(schoolId, { $inc: { revenue: diff } });
    }

    const updated = await FeePayment.findByIdAndUpdate(
      req.params.id,
      updateData, { new: true }
    ).populate('studentId', 'firstName lastName admissionNumber');

    res.json({ message: 'Fee node modified successfully', data: updated });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteFee = async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const fee = await FeePayment.findOne({ _id: req.params.id, schoolId });
    if (fee && fee.paidAmount > 0) {
        await School.findByIdAndUpdate(schoolId, { $inc: { revenue: -fee.paidAmount } });
    }
    await FeePayment.deleteOne({ _id: req.params.id, schoolId });
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

    const payments = [];
    for (const student of filtered) {
        // Calculate scholarship discount
        const scholarship = student.scholarshipPercentage || 0;
        
        for (const item of structure.feeItems) {
            if (!existingKeys.has(`${student._id}-${item.name}`)) {
                const discount = (item.amount * scholarship) / 100;
                payments.push({
                    schoolId,
                    studentId: student._id,
                    amount: item.amount,
                    discount: discount,
                    totalAmount: item.amount - discount,
                    category: item.name,
                    academicYear,
                    feeStructureId: structure._id,
                    status: 'pending',
                    dueDate: new Date(dueDate)
                });
            }
        }
    }

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

exports.getExamAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = getSchoolId(req);

    const exam = await Exam.findById(id).populate('subject');
    if (!exam) return res.status(404).json({ message: 'Exam node not found' });

    const marks = await Mark.find({ examId: id, schoolId }).populate('studentId', 'firstName lastName admissionNumber');

    const maxMarks = exam.maxMarks || 100;
    const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    let totalMarks = 0;
    let highest = 0;
    let lowest = marks.length > 0 ? marks[0].marksObtained : 0;
    const studentPerformance = [];

    let passCount = 0;
    let failCount = 0;

    marks.forEach(m => {
      const percentage = (m.marksObtained / maxMarks) * 100;
      if (percentage >= 90) distribution.A++;
      else if (percentage >= 80) distribution.B++;
      else if (percentage >= 70) distribution.C++;
      else if (percentage >= 60) distribution.D++;
      else distribution.F++;

      if (percentage >= 40) passCount++;
      else failCount++;

      totalMarks += m.marksObtained;
      if (m.marksObtained > highest) highest = m.marksObtained;
      if (m.marksObtained < lowest) lowest = m.marksObtained;
      
      studentPerformance.push({
        name: `${m.studentId?.firstName} ${m.studentId?.lastName}`,
        admissionNumber: m.studentId?.admissionNumber,
        marks: m.marksObtained,
        percentage: Number(percentage.toFixed(1)),
        result: percentage >= 40 ? 'Pass' : 'Fail'
      });
    });

    res.json({
      examName: exam.name,
      totalStudents: marks.length,
      averageMarks: marks.length > 0 ? Number((totalMarks / marks.length).toFixed(1)) : 0,
      highest,
      lowest,
      passCount,
      failCount,
      passRate: marks.length > 0 ? Number(((passCount / marks.length) * 100).toFixed(1)) : 0,
      distribution: [
        { name: 'Grade A (90+)', value: distribution.A, color: '#10b981' },
        { name: 'Grade B (80+)', value: distribution.B, color: '#3b82f6' },
        { name: 'Grade C (70+)', value: distribution.C, color: '#f59e0b' },
        { name: 'Grade D (60+)', value: distribution.D, color: '#6366f1' },
        { name: 'Grade F (<60)', value: distribution.F, color: '#ef4444' }
      ],
      topPerformers: studentPerformance.sort((a, b) => b.marks - a.marks).slice(0, 10),
      studentPerformance // Full list if needed
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.toggleExamPublishStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = getSchoolId(req);
    const exam = await Exam.findOne({ _id: id, schoolId });
    if (!exam) return res.status(404).json({ message: 'Assessment node not found' });
    
    exam.isPublished = !exam.isPublished;
    await exam.save();
    
    res.json({ 
      message: exam.isPublished ? 'Examination Results Published to Students' : 'Examination Pulse Reverted to Draft Status', 
      isPublished: exam.isPublished 
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.generateReportCard = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = getSchoolId(req);

    const school = await School.findById(schoolId);
    if (!school) return res.status(404).json({ message: 'School not found' });

    const student = await Student.findOne({ _id: id, schoolId }).populate('standard classSection');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const marks = await Mark.find({ studentId: id, schoolId })
      .populate({
        path: 'examId',
        match: { isPublished: true },
        populate: { path: 'subject' }
      });

    const validMarks = marks.filter(m => m.examId !== null);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ReportCard_${student.firstName}_${student.lastName}.pdf`);
    doc.pipe(res);

    const primaryColor = '#2563eb';
    const darkColor = '#1e293b';
    const lightColor = '#f8fafc';
    const borderColor = '#e2e8f0';

    // ─── Header ───────────────────────────────────────────────────────────────
    doc.rect(0, 0, 595, 120).fill(darkColor);
    doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold').text(school.name.toUpperCase(), 40, 45);
    doc.fontSize(10).font('Helvetica').fillColor('#94a3b8').text('OFFICIAL ACADEMIC REPORT CARD', 40, 75, { characterSpacing: 2 });
    
    // Academic Year / Term (Optional placeholder)
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#ffffff').text('ANNUAL SESSION 2025-26', 430, 45, { align: 'right', width: 125 });

    let currentY = 150;

    // ─── Student Information ──────────────────────────────────────────────────
    doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('STUDENT INFORMATION', 40, currentY);
    currentY += 15;
    doc.moveTo(40, currentY).lineTo(555, currentY).strokeColor(borderColor).lineWidth(0.5).stroke();
    currentY += 15;

    const col1 = 40;
    const col2 = 300;
    doc.fillColor(darkColor).fontSize(9).font('Helvetica-Bold');
    
    // Grid row 1
    doc.text('Student Name:', col1, currentY);
    doc.font('Helvetica').text(`${student.firstName} ${student.lastName}`, col1 + 80, currentY);
    doc.font('Helvetica-Bold').text('Admission No:', col2, currentY);
    doc.font('Helvetica').text(student.admissionNumber || 'N/A', col2 + 80, currentY);
    
    currentY += 20;
    // Grid row 2
    doc.font('Helvetica-Bold').text('Standard/Grade:', col1, currentY);
    doc.font('Helvetica').text(`Grade ${student.standard?.level || 'N/A'}`, col1 + 80, currentY);
    doc.font('Helvetica-Bold').text('Class Section:', col2, currentY);
    doc.font('Helvetica').text(student.classSection?.sectionLabel || 'N/A', col2 + 80, currentY);

    currentY += 40;

    // ─── Performance Table ────────────────────────────────────────────────────
    doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('ACADEMIC RECORD', 40, currentY);
    currentY += 15;
    doc.moveTo(40, currentY).lineTo(555, currentY).strokeColor(borderColor).lineWidth(0.5).stroke();
    currentY += 15;

    // Table Header
    const colSubject = 40;
    const colExam = 240;
    const colMarks = 400;
    const colTotal = 480;

    doc.rect(40, currentY, 515, 25).fill(lightColor);
    doc.fillColor(darkColor).font('Helvetica-Bold').fontSize(9);
    doc.text('SUBJECT', colSubject + 10, currentY + 8);
    doc.text('EXAMINATION', colExam + 10, currentY + 8);
    doc.text('OBTAINED', colMarks + 10, currentY + 8);
    doc.text('MAX MARKS', colTotal + 10, currentY + 8);

    currentY += 25;
    let totalObtained = 0;
    let totalMax = 0;

    validMarks.forEach((m, i) => {
      if (currentY > 700) { doc.addPage(); currentY = 50; }

      const subjectName = m.examId.subject?.name || 'Subject';
      const examName = m.examId.name;
      const obtained = m.marksObtained;
      const max = m.examId.maxMarks || 100;

      totalObtained += obtained;
      totalMax += max;

      doc.fillColor(darkColor).font('Helvetica').fontSize(9);
      doc.text(subjectName.toUpperCase(), colSubject + 10, currentY + 8);
      doc.text(examName, colExam + 10, currentY + 8);
      doc.font('Helvetica-Bold').text(obtained.toString(), colMarks + 10, currentY + 8, { width: 60, align: 'center' });
      doc.font('Helvetica').text(max.toString(), colTotal + 10, currentY + 8, { width: 60, align: 'center' });

      doc.moveTo(40, currentY + 25).lineTo(555, currentY + 25).strokeColor(lightColor).lineWidth(0.5).stroke();
      currentY += 25;
    });

    currentY += 30;

    // ─── Result Summary ───────────────────────────────────────────────────────
    const summaryX = 350;
    doc.rect(summaryX, currentY, 205, 100).fill(lightColor).strokeColor(borderColor).stroke();
    doc.fillColor(darkColor).fontSize(10).font('Helvetica-Bold').text('FINAL SUMMARY', summaryX + 15, currentY + 15);
    
    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    let grade = 'F';
    let color = '#ef4444';
    if (percentage >= 90) { grade = 'A+'; color = '#10b981'; }
    else if (percentage >= 80) { grade = 'A'; color = '#10b981'; }
    else if (percentage >= 70) { grade = 'B'; color = '#2563eb'; }
    else if (percentage >= 60) { grade = 'C'; color = '#f59e0b'; }
    else if (percentage >= 40) { grade = 'D'; color = '#f59e0b'; }

    doc.font('Helvetica').fontSize(9);
    doc.text(`Total Marks: ${totalObtained} / ${totalMax}`, summaryX + 15, currentY + 35);
    doc.text(`Percentage: ${percentage.toFixed(1)}%`, summaryX + 15, currentY + 50);
    
    doc.fillColor(color).fontSize(28).font('Helvetica-Bold').text(grade, summaryX + 140, currentY + 35);
    doc.fontSize(8).fillColor('#64748b').text('GRADE', summaryX + 140, currentY + 65, { width: 40, align: 'center' });

    // ─── Signatures ───────────────────────────────────────────────────────────
    currentY += 150;
    doc.moveTo(40, currentY).lineTo(180, currentY).strokeColor(darkColor).stroke();
    doc.moveTo(225, currentY).lineTo(365, currentY).strokeColor(darkColor).stroke();
    doc.moveTo(410, currentY).lineTo(550, currentY).strokeColor(darkColor).stroke();

    doc.fillColor(darkColor).fontSize(8).font('Helvetica-Bold');
    doc.text('CLASS TEACHER', 40, currentY + 10, { width: 140, align: 'center' });
    doc.text('PRINCIPAL', 225, currentY + 10, { width: 140, align: 'center' });
    doc.text('PARENT/GUARDIAN', 410, currentY + 10, { width: 140, align: 'center' });

    // Footer
    doc.fontSize(7).fillColor('#94a3b8').text(`${school.name} // Generated on ${new Date().toLocaleDateString()}`, 0, 810, { align: 'center', width: 595 });

    doc.end();
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

// Attendance Reports per Student
exports.getAttendanceReport = async (req, res) => {
  try {
    const { classSection, startDate, endDate } = req.query;
    const schoolId = getSchoolId(req);
    const filter = { schoolId };
    if (classSection) filter.classSection = new mongoose.Types.ObjectId(classSection);
    
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const attendanceData = await Attendance.find(filter).lean();
    const studentQuery = { schoolId };
    if (classSection) studentQuery.classSection = classSection;
    const students = await Student.find(studentQuery).select('firstName lastName admissionNumber photo').lean();

    const report = students.map(student => {
      const studentIdStr = student._id.toString();
      let present = 0, absent = 0, late = 0, halfDay = 0, total = 0;
      let lateTimes = [], earlyLeaves = [];

      attendanceData.forEach(record => {
        const studentRec = record.records.find(r => r.studentId.toString() === studentIdStr);
        if (studentRec) {
          total++;
          if (studentRec.status === 'Present') present++;
          else if (studentRec.status === 'Absent') absent++;
          else if (studentRec.status === 'Late') { late++; present++; } 
          else if (studentRec.status === 'Half-Day') { halfDay++; present += 0.5; }

          if (studentRec.isLate) lateTimes.push({ date: record.date, time: studentRec.arrivalTime });
          if (studentRec.isEarlyLeave) earlyLeaves.push({ date: record.date, time: studentRec.departureTime });
        }
      });

      const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;
      return {
        ...student,
        stats: { present, absent, late, halfDay, total, percentage },
        lateArrivals: lateTimes,
        earlyLeaves: earlyLeaves
      };
    });

    res.json(report);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Monthly/Weekly Attendance Analytics
exports.getAttendanceAnalytics = async (req, res) => {
  try {
    const { type, classSection } = req.query; // type: 'weekly' or 'monthly'
    const schoolId = getSchoolId(req);
    const filter = { schoolId };
    if (classSection) filter.classSection = new mongoose.Types.ObjectId(classSection);

    const matchStage = { $match: filter };
    const groupStage = {
      $group: {
        _id: type === 'monthly' ? { $month: '$date' } : { $week: '$date' },
        present: { $sum: { $size: { $filter: { input: '$records', as: 'r', cond: { $in: ['$$r.status', ['Present', 'Late', 'Half-Day']] } } } } },
        total: { $sum: { $size: '$records' } }
      }
    };

    const analytics = await Attendance.aggregate([matchStage, groupStage, { $sort: { '_id': 1 } }]);
    res.json(analytics);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Low Attendance Alerts
exports.getLowAttendanceAlerts = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);
        const threshold = 75; // 75% threshold

        const students = await Student.find({ schoolId, isActive: true })
            .select('firstName lastName classSection admissionNumber photo')
            .populate('classSection', 'sectionLabel');
        const attendanceData = await Attendance.find({ schoolId }).lean();

        const alerts = [];
        students.forEach(student => {
            const studentIdStr = student._id.toString();
            let present = 0, total = 0;
            attendanceData.forEach(record => {
                const studentRec = record.records.find(r => r.studentId.toString() === studentIdStr);
                if (studentRec) {
                    total++;
                    if (['Present', 'Late'].includes(studentRec.status)) present++;
                    else if (studentRec.status === 'Half-Day') present += 0.5;
                }
            });

            const percentage = total > 0 ? (present / total) * 100 : 100;
            if (total > 0 && percentage < threshold) {
                alerts.push({
                    _id: student._id,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    photo: student.photo,
                    admissionNumber: student.admissionNumber,
                    class: student.classSection?.sectionLabel,
                    stats: {
                        percentage: percentage.toFixed(2),
                        presentCount: present,
                        totalCount: total
                    }
                });
            }
        });

        res.json(alerts);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Reports & Analytics ──────────────────────────────────────────────────────
exports.getSchoolWidePerformance = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);
        // published exams
        const exams = await Exam.find({ schoolId, isPublished: true }).populate('subject standardId');
        const examIds = exams.map(e => e._id);
        const marks = await Mark.find({ examId: { $in: examIds }, schoolId }).lean();

        const performance = {
            totalExams: exams.length,
            overallAverage: 0,
            passRate: 0,
            subjectWise: {},
            gradeWise: {},
            subjectChart: [],
            gradeChart: []
        };

        if (marks.length > 0) {
            let totalMarks = 0, totalPass = 0;
            marks.forEach(m => {
                const exam = exams.find(e => e._id.toString() === m.examId.toString());
                if (!exam) return;
                const percent = (m.marksObtained / (exam.maxMarks || 100)) * 100;
                totalMarks += percent;
                if (percent >= 40) totalPass++;

                const subName = exam.subject?.name || 'Other';
                if (!performance.subjectWise[subName]) performance.subjectWise[subName] = { total: 0, count: 0 };
                performance.subjectWise[subName].total += percent;
                performance.subjectWise[subName].count++;

                const gradeName = `Grade ${exam.standardId?.level || 'N/A'}`;
                if (!performance.gradeWise[gradeName]) performance.gradeWise[gradeName] = { total: 0, count: 0 };
                performance.gradeWise[gradeName].total += percent;
                performance.gradeWise[gradeName].count++;
            });

            performance.overallAverage = Number((totalMarks / marks.length).toFixed(1));
            performance.passRate = Number(((totalPass / marks.length) * 100).toFixed(1));
            performance.subjectChart = Object.keys(performance.subjectWise).map(s => ({
                name: s, average: Number((performance.subjectWise[s].total / performance.subjectWise[s].count).toFixed(1))
            }));
            performance.gradeChart = Object.keys(performance.gradeWise).map(g => ({
                name: g, average: Number((performance.gradeWise[g].total / performance.gradeWise[g].count).toFixed(1))
            }));
        }

        res.json(performance);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getFeeCollectionReport = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);
        const fees = await FeePayment.find({ schoolId }).lean();
        
        let totalExpected = 0, totalCollected = 0, totalOutstanding = 0;
        fees.forEach(f => {
            totalExpected += (f.amount || 0);
            if (f.status === 'Paid') totalCollected += (f.amount || 0);
            else totalOutstanding += (f.amount || 0);
        });

        res.json({
            totalExpected, totalCollected, totalOutstanding,
            collectionRate: totalExpected > 0 ? Number(((totalCollected / totalExpected) * 100).toFixed(1)) : 0
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.exportFeeReport = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);
        const fees = await FeePayment.find({ schoolId }).populate('studentId standardId');
        
        const fields = [
            { label: 'Student Name', value: (row) => `${row.studentId?.firstName || 'Unknown'} ${row.studentId?.lastName || ''}` },
            { label: 'Admission No', value: 'studentId.admissionNumber' },
            { label: 'Grade', value: 'standardId.level' },
            { label: 'Month', value: 'month' },
            { label: 'Amount', value: 'amount' },
            { label: 'Status', value: 'status' },
            { label: 'Payment Date', value: (row) => row.paymentDate ? row.paymentDate.toISOString().split('T')[0] : '' }
        ];

        const parser = new Parser({ fields });
        const csvData = parser.parse(fees);

        res.header('Content-Type', 'text/csv');
        res.attachment(`FeeReport_${new Date().toISOString().split('T')[0]}.csv`);
        return res.send(csvData);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.exportAttendanceReportCSV = async (req, res) => {
    try {
        const { classSection, startDate, endDate } = req.query;
        const schoolId = getSchoolId(req);
        const filter = { schoolId };
        if (classSection) filter.classSection = classSection;
        if (startDate && endDate) filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };

        const attendance = await Attendance.find(filter).populate('records.studentId');
        
        const results = [];
        attendance.forEach(record => {
            record.records.forEach(r => {
                results.push({
                    date: record.date.toISOString().split('T')[0],
                    studentName: `${r.studentId?.firstName || 'N/A'} ${r.studentId?.lastName || ''}`,
                    admissionNumber: r.studentId?.admissionNumber || '',
                    status: r.status
                });
            });
        });

        const parser = new Parser({ fields: ['date', 'studentName', 'admissionNumber', 'status'] });
        const csvData = parser.parse(results);
        res.header('Content-Type', 'text/csv');
        res.attachment('AttendanceReport.csv');
        res.send(csvData);
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

    // take from req.body as per user requirement
    const schoolId = req.body.schoolId || getSchoolId(req);
    const schoolAdminId = req.body.schoolAdminId || req.user._id;
    const createdBy = req.body.createdBy || req.user._id;

    const results = [];
    const standards = await Standard.find({ schoolId });
    const sections = await ClassSection.find({ schoolId });

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          const processed = [];
          const skipped = [];

          for (const [index, row] of results.entries()) {
            const firstName = row.firstName || row['First Name'];
            const lastName = row.lastName || row['Last Name'];
            const dobStr = row.dateOfBirth || row['Date of Birth'];
            const standardStr = row.standard || row.Standard;
            const classSectionStr = row.classSection || row.Section;

            // Basic validation
            if (!firstName || !lastName || !dobStr || !standardStr) {
              skipped.push({ row: index + 1, reason: 'Missing required fields (firstName, lastName, dateOfBirth, or standard)' });
              continue;
            }

            const standardLevelMatch = String(standardStr).match(/\d+/);
            const standardLevel = standardLevelMatch ? parseInt(standardLevelMatch[0], 10) : null;

            const std = standards.find(s => s.level === standardLevel);
            if (!std) {
              skipped.push({ row: index + 1, reason: `Standard level "${standardStr}" not found` });
              continue;
            }

            const sec = std ? sections.find(s => s.sectionLabel === classSectionStr && String(s.standardId) === String(std._id)) : null;
            if (classSectionStr && !sec) {
              skipped.push({ row: index + 1, reason: `Section "${classSectionStr}" not found in standard ${standardLevel}` });
              continue;
            }

            const dob = parseCSVDate(dobStr);
            if (!dob) {
              skipped.push({ row: index + 1, reason: `Invalid date format: ${dobStr}` });
              continue;
            }

            let plainPassword = '123456';
            if (dob) {
              const day = String(dob.getDate()).padStart(2, '0');
              const month = String(dob.getMonth() + 1).padStart(2, '0');
              const year = String(dob.getFullYear()).substring(2);
              plainPassword = `${day}${month}${year}`;
            }
            const hashedPassword = await bcrypt.hash(plainPassword, 10);

            processed.push({
              firstName,
              lastName,
              admissionNumber: undefined,
              rollNumber: row.rollNumber || row['Roll Number'] || '',
              dateOfBirth: dob,
              gender: (row.gender || row.Gender || 'other').toLowerCase(),
              guardianName: row.guardianName || row['Guardian Name'],
              guardianContact: row.guardianContact || row['Guardian Contact'],
              address: row.address || row.Address,
              standard: std._id,
              classSection: sec ? sec._id : undefined,
              isActive: row.isActive === 'TRUE' || row.isActive === 'true' || row.isActive === true,
              schoolId,
              schoolAdminId,
              createdBy,
              password: hashedPassword
            });
          }

          // Use sequential creation to ensure the admissionNumber sequence is correct
          for (const studentData of processed) {
            await Student.create(studentData);
          }

          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

          res.status(201).json({
            message: `${processed.length} students imported successfully`,
            totalRows: results.length,
            imported: processed.length,
            skipped: skipped.length,
            details: skipped.length > 0 ? skipped : undefined
          });
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

    const schoolId = req.body.schoolId || getSchoolId(req);
    const schoolAdminId = req.body.schoolAdminId || req.user._id;

    const results = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          let count = 0;
          const skipped = [];

          for (const [index, row] of results.entries()) {
            const firstName = row.firstName || row['First Name'];
            const lastName = row.lastName || row['Last Name'];
            const email = (row.email || row.Email)?.trim();
            const phone = row.phone || row.Phone;
            const employeeId = row.employeeId || row['Employee ID'];
            const qualificationsStr = row.qualifications || row.Qualifications;
            const joiningDateStr = row.joiningDate || row['Joining Date'];

            if (!firstName || !lastName || !email || !phone) {
              skipped.push({ row: index + 1, reason: 'Missing required fields (firstName, lastName, email, or phone)' });
              continue;
            }

            // Check for existing user with this email
            const existingUser = await User.findOne({ email });
            if (existingUser) {
              skipped.push({ row: index + 1, reason: `User with email "${email}" already exists` });
              continue;
            }

            // Check for existing teacher with this phone
            const existingTeacherByPhone = await Teacher.findOne({ phone: String(phone).trim() });
            if (existingTeacherByPhone) {
              skipped.push({ row: index + 1, reason: `Teacher with phone "${phone}" already exists` });
              continue;
            }

            const hashedPassword = await bcrypt.hash(email, 10);
            const isActive = row.isActive === 'TRUE' || row.isActive === 'true' || row.isActive === true;

            const user = await User.create({
              firstName,
              lastName,
              email,
              password: hashedPassword,
              role: 'Teacher',
              schoolId,
              isActive,
              photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + ' ' + lastName)}&background=2563eb&color=fff`,
            });

            await Teacher.create({
              firstName,
              lastName,
              email,
              phone,
              employeeId: employeeId || undefined,
              schoolId,
              schoolAdminId,
              userId: user._id,
              baseSalary: Number(row.baseSalary) || 0,
              isActive,
              qualifications: qualificationsStr ? qualificationsStr.split(',').map(q => q.trim()) : [],
              joiningDate: parseCSVDate(joiningDateStr)
            });
            count++;
          }

          if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

          res.status(201).json({
            message: `${count} teachers imported successfully`,
            totalRows: results.length,
            imported: count,
            skipped: skipped.length,
            details: skipped.length > 0 ? skipped : undefined
          });
        } catch (err) { res.status(500).json({ message: err.message }); }
      });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Fee Analytics
exports.getFeeCollectionSummary = async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const summary = await FeePayment.aggregate([
      { $match: { schoolId: new mongoose.Types.ObjectId(schoolId) } },
      {
        $group: {
          _id: null,
          totalInvoiced: { $sum: "$totalAmount" },
          totalCollected: { $sum: "$paidAmount" },
          totalDiscount: { $sum: "$discount" },
          totalLateFees: { $sum: "$lateFees" },
          pendingCount: { $sum: { $cond: [{ $in: ["$status", ["pending", "overdue", "partially_paid"]] }, 1, 0] } }
        }
      }
    ]);

    const data = summary[0] || { totalInvoiced: 0, totalCollected: 0, totalDiscount: 0, totalLateFees: 0, totalPending: 0 };
    data.totalPending = data.totalInvoiced - data.totalCollected;
    
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Send Bulk Reminders
exports.sendFeeReminders = async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const { studentId } = req.body || {}; // optional filter
    
    const query = { 
        schoolId, 
        status: { $in: ['pending', 'overdue', 'partially_paid'] } 
    };
    if (studentId) query.studentId = studentId;

    const overdueFees = await FeePayment.find(query).populate('studentId');
    
    let sentCount = 0;
    for (const fee of overdueFees) {
      if (fee.studentId && fee.studentId.guardianEmail) {
        await sendFeeReminderMail({
          to: fee.studentId.guardianEmail,
          studentName: `${fee.studentId.firstName} ${fee.studentId.lastName}`,
          category: fee.category,
          amount: fee.totalAmount - fee.paidAmount,
          dueDate: fee.dueDate,
          schoolName: "Your School" // Typically from School model but using placeholder for now
        });
        sentCount++;
      }
    }

    res.json({ message: `Reminders dispatched to ${sentCount} guardians` });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
// ─── School Profile ───────────────────────────────────────────────────────────
// Helper for current academic year (Session starts in April)
const getAcademicYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  return month >= 4 ? `${year}-${(year + 1).toString().slice(-2)}` : `${year - 1}-${year.toString().slice(-2)}`;
};

exports.getSchoolProfile = async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const school = await School.findById(schoolId).lean();
    if (!school) return res.status(404).json({ message: 'School not found' });

    // Inject dynamic academic year
    school.academicYear = getAcademicYear();

    res.json(school);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateSchoolProfile = async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const body = { ...req.body };
    if (req.file) {
      body.logo = req.file.location;
      await User.findByIdAndUpdate(req.user._id, { photo: req.file.location });
    }

    const school = await School.findByIdAndUpdate(schoolId, body, { new: true }).lean();
    if (!school) return res.status(404).json({ message: 'School not found' });

    school.academicYear = getAcademicYear();
    res.json(school);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.changeAdminPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect old password' });

    // Hash and update new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};



