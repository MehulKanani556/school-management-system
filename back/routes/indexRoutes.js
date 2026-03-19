const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const { createUser, login, studentLogin, forgotPassword, verifyOtp, changePassword, generateNewToken } = require('../auth/auth');
const { auth, isSuperAdmin } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { getAllUsers, getSingleUser, deleteUser, updateUser } = require('../controllers/user.controller');
const sa = require('../controllers/schoolAdmin.controller');
const { createSchool, getAllSchools, getSchoolStats, updateSchool, deleteSchool, updateSchoolStatus } = require('../controllers/school.controller');
const tc = require('../controllers/teacher.controller');
const stc = require('../controllers/student.controller');
const hc = require('../controllers/holiday.controller');

// Auth Routes
router.post('/register', upload.single("photo"), createUser);
router.post('/login', login);
router.post('/student-login', studentLogin);
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
const superAdmin = [auth, requireRole('Super_Admin')];

router.get('/school-admin/dashboard', ...schoolAdmin, sa.getDashboardStats);

// Students
router.get('/school-admin/students', ...schoolAdmin, sa.getStudents);
router.post('/school-admin/students', ...schoolAdmin, upload.single('photo'), sa.createStudent);
router.put('/school-admin/students/:id', ...schoolAdmin, upload.single('photo'), sa.updateStudent);
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

// Subjects
router.get('/school-admin/subjects', ...schoolAdmin, sa.getSubjects);
router.post('/school-admin/subjects', ...schoolAdmin, sa.createSubject);
router.put('/school-admin/subjects/:id', ...schoolAdmin, sa.updateSubject);
router.delete('/school-admin/subjects/:id', ...schoolAdmin, sa.deleteSubject);

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

router.post('/superadmin/create-school', ...superAdmin, upload.single('logo'), createSchool);
router.get('/superadmin/all-schools', ...superAdmin, getAllSchools);
router.get('/superadmin/stats', ...superAdmin, getSchoolStats);
router.put('/superadmin/update-school/:id', ...superAdmin, upload.single('logo'), updateSchool); // NEW
router.delete('/superadmin/delete-school/:id', ...superAdmin, deleteSchool);
router.patch('/superadmin/update-status/:id', ...superAdmin, updateSchoolStatus);

// ─── Teacher Routes ───────────────────────────────────────────────────────────
const teacher = [auth, requireRole('Teacher')];

router.get('/teacher/assigned-classes', ...teacher, tc.getAssignedClasses);
router.get('/teacher/assigned-students/:classId', ...teacher, tc.getAssignedClassStudents);
router.get('/teacher/exams/:classId', ...teacher, tc.getExamsByClass);
router.get('/teacher/attendance', ...teacher, tc.getAttendanceByClassAndDate);
router.get('/teacher/marks/:examId', ...teacher, tc.getMarksByExam);
router.post('/teacher/mark-attendance', ...teacher, tc.markAttendance);
router.post('/teacher/add-marks', ...teacher, tc.addMarks);
router.post('/teacher/upload-assignment', ...teacher, upload.single('file'), tc.uploadAssignment);
router.post('/teacher/send-message', ...teacher, upload.single('file'), tc.sendMessage);

// ─── Student Routes ──────────────────────────────────────────────────────────
const student = [auth, requireRole('Student')];

router.get('/student/profile', ...student, stc.getProfile);
router.get('/student/attendance', ...student, stc.getAttendance);
router.get('/student/results', ...student, stc.getResults);
router.get('/student/assignments', ...student, stc.getAssignments);
router.get('/student/timetable', ...student, stc.getTimetable);

// ─── Holiday Routes ───────────────────────────────────────────────────────────
router.get('/holidays', auth, hc.getHolidays); // Read-only for all authenticated
router.post('/school-admin/holidays', ...schoolAdmin, hc.createHoliday);
router.put('/school-admin/holidays/:id', ...schoolAdmin, hc.updateHoliday);
router.delete('/school-admin/holidays/:id', ...schoolAdmin, hc.deleteHoliday);

module.exports = router;