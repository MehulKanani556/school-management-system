
const express = require('express');
const router = express.Router();

const { upload } = require('../middleware/upload');
const { createUser, login, forgotPassword, verifyOtp, changePassword, generateNewToken } = require('../auth/auth');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { getAllUsers, getSingleUser, deleteUser, updateUser } = require('../controllers/user.controller');
const sa = require('../controllers/schoolAdmin.controller');

// auth
router.post('/register', upload.single("photo"), createUser);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify', verifyOtp);
router.post('/change-password', changePassword);
router.post('/generatenewtoken', auth, generateNewToken);

// user
router.get('/users', getAllUsers);
router.get('/users/:id', getSingleUser);
router.delete('/users/:id', auth, deleteUser);
router.put('/users/:id', updateUser);

// ─── School Admin Routes ───────────────────────────────────────────────────────
const schoolAdmin = [auth, requireRole('School_Admin')];

router.get('/school-admin/dashboard', ...schoolAdmin, sa.getDashboardStats);

// Students
router.get('/school-admin/students', ...schoolAdmin, sa.getStudents);
router.post('/school-admin/students', ...schoolAdmin, sa.createStudent);
router.put('/school-admin/students/:id', ...schoolAdmin, sa.updateStudent);
router.delete('/school-admin/students/:id', ...schoolAdmin, sa.deleteStudent);

// Teachers
router.get('/school-admin/teachers', ...schoolAdmin, sa.getTeachers);
router.post('/school-admin/teachers', ...schoolAdmin, sa.createTeacher);
router.put('/school-admin/teachers/:id', ...schoolAdmin, sa.updateTeacher);
router.delete('/school-admin/teachers/:id', ...schoolAdmin, sa.deleteTeacher);
router.patch('/school-admin/teachers/:id/toggle-status', ...schoolAdmin, sa.toggleTeacherStatus);

// Classes
router.get('/school-admin/classes', ...schoolAdmin, sa.getClasses);
router.post('/school-admin/classes', ...schoolAdmin, sa.createClass);
router.put('/school-admin/classes/:id', ...schoolAdmin, sa.updateClass);
router.delete('/school-admin/classes/:id', ...schoolAdmin, sa.deleteClass);

// Fees
router.get('/school-admin/fees', ...schoolAdmin, sa.getFees);
router.post('/school-admin/fees', ...schoolAdmin, sa.createFee);
router.put('/school-admin/fees/:id', ...schoolAdmin, sa.updateFee);

// Exams
router.get('/school-admin/exams', ...schoolAdmin, sa.getExams);
router.post('/school-admin/exams', ...schoolAdmin, sa.createExam);
router.put('/school-admin/exams/:id', ...schoolAdmin, sa.updateExam);
router.delete('/school-admin/exams/:id', ...schoolAdmin, sa.deleteExam);

// Attendance
router.get('/school-admin/attendance', ...schoolAdmin, sa.getAttendance);
router.post('/school-admin/attendance', ...schoolAdmin, sa.saveAttendance);

module.exports = router;