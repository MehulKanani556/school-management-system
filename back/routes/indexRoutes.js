const express = require('express');
const router = express.Router();
const { upload, localUpload } = require('../middleware/upload');
const { createUser, login, studentLogin, forgotPassword, verifyOtp, changePassword, generateNewToken } = require('../auth/auth');
const { auth, isSuperAdmin } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { getAllUsers, getSingleUser, deleteUser, updateUser } = require('../controllers/user.controller');
const sa = require('../controllers/schoolAdmin.controller');
const { createSchool, getAllSchools, getSchoolStats, updateSchool, deleteSchool, updateSchoolStatus } = require('../controllers/school.controller');
const tc = require('../controllers/teacher.controller');
const stc = require('../controllers/student.controller');
const hc = require('../controllers/holiday.controller');
const tbc = require('../controllers/timetable.controller');
const ttc = require('../controllers/timetableTemplate.controller');

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

router.get('/school-admin/dashboard', ...schoolAdmin, sa.getDashboardStats);

// Students
router.get('/school-admin/students', ...schoolAdmin, sa.getStudents);
router.post('/school-admin/students', ...schoolAdmin, upload.single('photo'), sa.createStudent);
router.put('/school-admin/students/:id', ...schoolAdmin, upload.single('photo'), sa.updateStudent);
router.delete('/school-admin/students/:id', ...schoolAdmin, sa.deleteStudent);
router.get('/school-admin/export-students', ...schoolAdmin, sa.exportStudents);
router.post('/school-admin/import-students', ...schoolAdmin, localUpload.single('file'), sa.importStudents);
router.post('/school-admin/promote-students', ...schoolAdmin, sa.promoteStudents);
router.get('/school-admin/students/:id/report-card', ...schoolAdmin, sa.generateReportCard);

// Teachers
router.get('/school-admin/teachers', ...schoolAdmin, sa.getTeachers);
router.post('/school-admin/teachers', ...schoolAdmin, sa.createTeacher);
router.put('/school-admin/teachers/:id', ...schoolAdmin, sa.updateTeacher);
router.delete('/school-admin/teachers/:id', ...schoolAdmin, sa.deleteTeacher);
router.patch('/school-admin/teachers/:id/toggle-status', ...schoolAdmin, sa.toggleTeacherStatus);
router.get('/school-admin/export-teachers', ...schoolAdmin, sa.exportTeachers);
router.post('/school-admin/import-teachers', ...schoolAdmin, localUpload.single('file'), sa.importTeachers);

// Standards
router.get('/school-admin/standards', ...schoolAdmin, sa.getStandards);
router.post('/school-admin/standards', ...schoolAdmin, sa.createStandard);
router.put('/school-admin/standards/:id', ...schoolAdmin, sa.updateStandard);
router.delete('/school-admin/standards/:id', ...schoolAdmin, sa.deleteStandard);

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
router.get('/school-admin/fee-summary', ...schoolAdmin, sa.getFeeCollectionSummary);
router.post('/school-admin/send-fee-reminders', ...schoolAdmin, sa.sendFeeReminders);
router.post('/school-admin/fees', ...schoolAdmin, sa.createFee);
router.put('/school-admin/fees/:id', ...schoolAdmin, sa.updateFee);
router.delete('/school-admin/fees/:id', ...schoolAdmin, sa.deleteFee);

// Fee Structures
router.get('/school-admin/fee-structures', ...schoolAdmin, sa.getFeeStructures);
router.post('/school-admin/fee-structures', ...schoolAdmin, sa.createFeeStructure);
router.put('/school-admin/fee-structures/:id', ...schoolAdmin, sa.updateFeeStructure);
router.delete('/school-admin/fee-structures/:id', ...schoolAdmin, sa.deleteFeeStructure);
router.post('/school-admin/apply-fee-structure', ...schoolAdmin, sa.applyFeeStructure);

// Exams
router.get('/school-admin/exams', ...schoolAdmin, sa.getExams);
router.post('/school-admin/exams', ...schoolAdmin, sa.createExam);
router.put('/school-admin/exams/:id', ...schoolAdmin, sa.updateExam);
router.delete('/school-admin/exams/:id', ...schoolAdmin, sa.deleteExam);
router.get('/school-admin/exams/:id/analytics', ...schoolAdmin, sa.getExamAnalytics);
router.patch('/school-admin/exams/:id/toggle-publish', ...schoolAdmin, sa.toggleExamPublishStatus);

// Attendance
router.get('/school-admin/attendance', ...schoolAdmin, sa.getAttendance);
router.post('/school-admin/attendance', ...schoolAdmin, sa.saveAttendance);
router.get('/school-admin/attendance-report', ...schoolAdmin, sa.getAttendanceReport);
router.get('/school-admin/attendance-analytics', ...schoolAdmin, sa.getAttendanceAnalytics);
router.get('/school-admin/attendance-alerts', ...schoolAdmin, sa.getLowAttendanceAlerts);
router.get('/school-admin/attendance-export', ...schoolAdmin, sa.exportAttendanceReportCSV);

// Reports & Analytics
router.get('/school-admin/reports/performance', ...schoolAdmin, sa.getSchoolWidePerformance);
router.get('/school-admin/reports/fees', ...schoolAdmin, sa.getFeeCollectionReport);
router.get('/school-admin/reports/fees-export', ...schoolAdmin, sa.exportFeeReport);

// Timetable Routes
router.get('/school-admin/timetables', ...schoolAdmin, tbc.getAllTimetables);
router.get('/school-admin/timetable/:classId', ...schoolAdmin, tbc.getTimetableByClass);
router.post('/school-admin/timetable', ...schoolAdmin, tbc.upsertTimetable);
router.get('/school-admin/school-profile', ...schoolAdmin, sa.getSchoolProfile);
router.put('/school-admin/school-profile', ...schoolAdmin, upload.single('logo'), sa.updateSchoolProfile);
router.post('/school-admin/change-password', ...schoolAdmin, sa.changeAdminPassword);



// Timetable Template Routes
router.get('/school-admin/timetable-templates', ...schoolAdmin, ttc.getTemplates);
router.post('/school-admin/timetable-templates', ...schoolAdmin, ttc.createTemplate);
router.put('/school-admin/timetable-templates/:id', ...schoolAdmin, ttc.updateTemplate);
router.delete('/school-admin/timetable-templates/:id', ...schoolAdmin, ttc.deleteTemplate);

// Payroll
router.get('/school-admin/payroll', ...schoolAdmin, sa.getAllPayroll);
router.post('/school-admin/payroll', ...schoolAdmin, sa.createPayroll);
router.put('/school-admin/payroll/:id', ...schoolAdmin, sa.updatePayroll);
router.delete('/school-admin/payroll/:id', ...schoolAdmin, sa.deletePayroll);

// Leaves
router.get('/school-admin/leaves', ...schoolAdmin, sa.getAllLeaves);
router.put('/school-admin/leaves/:id', ...schoolAdmin, sa.updateLeaveStatus);

// Reviews
router.get('/school-admin/reviews', ...schoolAdmin, sa.getAllReviews);
router.post('/school-admin/reviews', ...schoolAdmin, sa.createReview);
router.put('/school-admin/reviews/:id', ...schoolAdmin, sa.updateReview);
router.delete('/school-admin/reviews/:id', ...schoolAdmin, sa.deleteReview);

// ─── Super admin Routes ───────────────────────────────────────────────────────────
const superAdmin = [auth, requireRole('Super_Admin')];

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
router.get('/teacher/assignments', ...teacher, tc.getAssignments);
router.put('/teacher/assignments/:id', ...teacher, upload.single('file'), tc.updateAssignment);
router.delete('/teacher/assignments/:id', ...teacher, tc.deleteAssignment);
router.post('/teacher/apply-leave', ...teacher, tc.applyLeave);
router.get('/teacher/my-leaves', ...teacher, tc.getMyLeaves);
router.post('/teacher/send-message', ...teacher, upload.single('file'), tc.sendMessage);
router.get('/teacher/timetable/:classId', ...teacher, tbc.getTimetableByClass);

// ─── Student Routes ──────────────────────────────────────────────────────────
const student = [auth, requireRole('Student')];

router.get('/student/profile', ...student, stc.getProfile);
router.get('/student/attendance', ...student, stc.getAttendance);
router.get('/student/results', ...student, stc.getResults);
router.get('/student/assignments', ...student, stc.getAssignments);
router.get('/student/timetable', ...student, tbc.getStudentTimetable);

const mc = require('../controllers/message.controller');

// ─── Communication Routes ───────────────────────────────────────────────────
router.get('/school-admin/announcements', ...schoolAdmin, mc.getAnnouncements);
router.post('/school-admin/announcements', ...schoolAdmin, upload.single('file'), mc.createAnnouncement);
router.get('/school-admin/messages', ...schoolAdmin, mc.getMyMessages);
router.post('/school-admin/messages', ...schoolAdmin, upload.single('file'), mc.sendMessage);
router.delete('/school-admin/messages/:id', ...schoolAdmin, mc.deleteMessage);

router.get('/holidays', auth, hc.getHolidays); // Read-only for all authenticated
router.post('/school-admin/holidays', ...schoolAdmin, hc.createHoliday);
router.put('/school-admin/holidays/:id', ...schoolAdmin, hc.updateHoliday);
router.delete('/school-admin/holidays/:id', ...schoolAdmin, hc.deleteHoliday);

module.exports = router;
