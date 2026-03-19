const Student = require('../models/student.model');
const Teacher = require('../models/teacher.model');
const ClassSection = require('../models/classSection.model');
const Exam = require('../models/exam.model');
const FeePayment = require('../models/feePayment.model');
const Attendance = require('../models/attendance.model');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const getSchoolId = (req) => req.user._id;

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
    const [students, teachers, classes, fees, exams] = await Promise.all([
      Student.countDocuments({ schoolId, isActive: true }),
      Teacher.countDocuments({ schoolId, isActive: true }),
      ClassSection.countDocuments({ schoolId }),
      FeePayment.countDocuments({ schoolId, status: 'pending' }),
      Exam.countDocuments({ schoolId }),
    ]);
    res.json({ students, teachers, classes, pendingFees: fees, exams });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Students ─────────────────────────────────────────────────────────────────
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find({ schoolId: getSchoolId(req) }).populate('classSection', 'gradeLevel sectionLabel');
    res.json(students);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createStudent = async (req, res) => {
  try {
    const student = await Student.create({ ...req.body, schoolId: getSchoolId(req) });
    res.status(201).json(student);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, schoolId: getSchoolId(req) },
      req.body, { new: true }
    );
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteStudent = async (req, res) => {
  try {
    await Student.findOneAndDelete({ _id: req.params.id, schoolId: getSchoolId(req) });
    res.json({ message: 'Student deleted' });
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
    const teachers = await Teacher.find({ schoolId: getSchoolId(req) });
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

    // create User record
    const user = await User.create({
      firstName, lastName,
      email: email.trim(),
      password: hashedPassword,
      role: 'Teacher',
      photo: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(`${firstName} ${lastName}`) + '&background=2563eb&color=fff',
    });

    // create Teacher record linked to user
    const teacher = await Teacher.create({
      ...req.body,
      email: email.trim(),
      phone: phone.trim(),
      schoolId: getSchoolId(req),
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

    res.status(201).json(teacher);
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

    res.json(teacher);
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
    await Teacher.findOneAndDelete({ _id: req.params.id, schoolId: getSchoolId(req) });
    res.json({ message: 'Teacher deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Classes ──────────────────────────────────────────────────────────────────
exports.getClasses = async (req, res) => {
  try {
    const classes = await ClassSection.find({ schoolId: getSchoolId(req) }).populate('classTeacher', 'firstName lastName');
    res.json(classes);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createClass = async (req, res) => {
  try {
    const cls = await ClassSection.create({ ...req.body, schoolId: getSchoolId(req) });
    res.status(201).json(cls);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateClass = async (req, res) => {
  try {
    const cls = await ClassSection.findOneAndUpdate(
      { _id: req.params.id, schoolId: getSchoolId(req) },
      req.body, { new: true }
    );
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.json(cls);
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
    res.status(201).json(fee);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateFee = async (req, res) => {
  try {
    const fee = await FeePayment.findOneAndUpdate(
      { _id: req.params.id, schoolId: getSchoolId(req) },
      req.body, { new: true }
    );
    if (!fee) return res.status(404).json({ message: 'Fee record not found' });
    res.json(fee);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Exams ────────────────────────────────────────────────────────────────────
exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.find({ schoolId: getSchoolId(req) }).populate('classSection', 'gradeLevel sectionLabel');
    res.json(exams);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createExam = async (req, res) => {
  try {
    const exam = await Exam.create({ ...req.body, schoolId: getSchoolId(req) });
    res.status(201).json(exam);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.id, schoolId: getSchoolId(req) },
      req.body, { new: true }
    );
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json(exam);
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
      .populate('classSection', 'gradeLevel sectionLabel')
      .populate('records.studentId', 'firstName lastName admissionNumber');
    res.json(attendance);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.saveAttendance = async (req, res) => {
  try {
    const { classSection, date, records } = req.body;
    const schoolId = getSchoolId(req);
    const attendance = await Attendance.findOneAndUpdate(
      { schoolId, classSection, date: new Date(date) },
      { schoolId, classSection, date: new Date(date), records, submittedBy: req.user._id },
      { upsert: true, new: true }
    );
    res.json(attendance);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
