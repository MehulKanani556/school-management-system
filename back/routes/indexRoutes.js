const express = require('express');
const router = express.Router();
const { upload, localUpload } = require('../middleware/upload');
const { createUser, login, studentLogin, forgotPassword, verifyOtp, changePassword, generateNewToken } = require('../auth/auth');
const { auth, isSuperAdmin } = require('../middleware/auth');
const checkMaintenance = require('../middleware/maintenance');
const { requireRole } = require('../middleware/roleCheck');

// Platform Wide Routing Policies
router.use(checkMaintenance); 
const { getAllUsers, getSingleUser, deleteUser, updateUser } = require('../controllers/user.controller');
const sa = require('../controllers/schoolAdmin.controller');
const { createSchool, getAllSchools, getSchoolStats, updateSchool, deleteSchool, updateSchoolStatus } = require('../controllers/school.controller');
const ayc = require('../controllers/academicYear.controller');
const admc = require('../controllers/admission.controller');
const tc = require("../controllers/teacher.controller");
const nc = require("../controllers/notification.controller");
const stc = require('../controllers/student.controller');
const hc = require('../controllers/holiday.controller');
const tbc = require('../controllers/timetable.controller');
const ttc = require('../controllers/timetableTemplate.controller');
const pc = require('../controllers/parent.controller');
const sac = require('../controllers/superAdmin.controller');
const ac = require('../controllers/accountant.controller');
const lc = require('../controllers/librarian.controller');
const trc = require('../controllers/transport.controller');


// Auth Routes
router.post('/register', upload.single("photo"), createUser);
router.post('/login', login);
router.post('/student-login', studentLogin);
router.post('/forgot-password', forgotPassword);
router.post('/verify', verifyOtp);
router.post('/change-password', changePassword);
router.post('/generatenewtoken', auth, generateNewToken);

// user
router.get('/notifications', auth, nc.getNotifications);
router.put('/notifications/:id/read', auth, nc.markAsRead);
router.put('/notifications/read-all', auth, nc.markAllAsRead);
router.delete('/notifications/:id', auth, nc.deleteNotification);
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
router.post('/school-admin/staff', ...schoolAdmin, sa.createStaff);
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

// Academic Years
router.get('/school-admin/academic-years', ...schoolAdmin, ayc.getAcademicYears);
router.post('/school-admin/academic-years', ...schoolAdmin, ayc.createAcademicYear);
router.put('/school-admin/academic-years/:id', ...schoolAdmin, ayc.updateAcademicYear);
router.delete('/school-admin/academic-years/:id', ...schoolAdmin, ayc.deleteAcademicYear);
router.get('/school-admin/academic-years/current', ...schoolAdmin, ayc.getCurrentYear);

// Admissions
router.get('/school-admin/admissions/enquiries', ...schoolAdmin, admc.getEnquiries);
router.post('/school-admin/admissions/enquiries', ...schoolAdmin, admc.addEnquiry);
router.put('/school-admin/admissions/enquiries/:id', ...schoolAdmin, admc.updateEnquiryStatus);
router.post('/school-admin/admissions/enroll', ...schoolAdmin, admc.admitCandidate);
router.get('/school-admin/students/:studentId/promotion-history', ...schoolAdmin, admc.getPromotionHistory);

// Global Announcements for Dashboards
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

// Analytics
router.get('/superadmin/analytics', ...superAdmin, sac.getPlatformAnalytics);

// Audit Logs
router.get('/superadmin/audit-logs', ...superAdmin, sac.getAuditLogs);

// System Settings
router.get('/superadmin/settings', ...superAdmin, sac.getSystemSettings);
router.post('/superadmin/settings', ...superAdmin, sac.updateSystemSetting);

// Profile Management
router.get('/superadmin/profile', ...superAdmin, sac.getProfile);
router.put('/superadmin/profile', ...superAdmin, upload.single('photo'), sac.updateProfile);
router.post('/superadmin/change-password', ...superAdmin, sac.changePassword);

// ─── Teacher Routes ───────────────────────────────────────────────────────────
const teacher = [auth, requireRole('Teacher')];
 
// teacher section
router.get('/teacher/dashboard', ...teacher, tc.getTeacherDashboard);
router.get('/teacher/assigned-classes', ...teacher, tc.getAssignedClasses);
router.get('/teacher/assigned-students/:classId', ...teacher, tc.getAssignedClassStudents);
router.get('/teacher/student-detail/:id', ...teacher, tc.getStudentDetail);
router.get('/teacher/exams/:classId', ...teacher, tc.getExamsByClass);
router.get('/teacher/attendance', ...teacher, tc.getAttendanceByClassAndDate);
router.get('/teacher/marks/:examId', ...teacher, tc.getMarksByExam);
router.post('/teacher/mark-attendance', ...teacher, tc.markAttendance);
router.post('/teacher/add-marks', ...teacher, tc.addMarks);
router.post('/teacher/upload-assignment', ...teacher, upload.single('file'), tc.uploadAssignment);
router.get('/teacher/assignments', ...teacher, tc.getAssignments);
router.put('/teacher/assignments/:id', ...teacher, upload.single('file'), tc.updateAssignment);
router.get('/teacher/payroll', ...teacher, tc.getMyPayroll);
router.get('/teacher/assignments/:id/submissions', ...teacher, tc.getAssignmentSubmissions);
router.post('/teacher/grade-submission/:id', ...teacher, tc.gradeSubmission);
router.delete('/teacher/assignments/:id', ...teacher, tc.deleteAssignment);
router.post('/teacher/apply-leave', ...teacher, tc.applyLeave);
router.get('/teacher/my-leaves', ...teacher, tc.getMyLeaves);
router.get('/teacher/attendance-analytics', ...teacher, tc.getAttendanceAnalytics);
router.get('/teacher/profile', ...teacher, tc.getProfile);
router.put('/teacher/profile', ...teacher, upload.single('photo'), tc.updateProfile);
router.post('/teacher/change-password', ...teacher, tc.changePassword);
router.post('/teacher/send-message', ...teacher, upload.single('file'), tc.sendMessage);
router.get('/teacher/get-fee-status', ...teacher, tc.getStudentFeeStatus);
router.get('/teacher/exam-schedule', ...teacher, tc.getExamsByClass);
// Performance & Analytics
router.get('/teacher/performance-analytics', ...teacher, tc.getPerformanceAnalytics);

// Lesson Plans
router.get('/teacher/lesson-plans', ...teacher, tc.getLessonPlans);
router.post('/teacher/lesson-plans', ...teacher, tc.createLessonPlan);
router.put('/teacher/lesson-plans/:id', ...teacher, tc.updateLessonPlan);

// Behavior Log
router.post('/teacher/behavior-log', ...teacher, tc.logBehavior);
router.get('/teacher/behavior-logs', ...teacher, tc.getBehaviorLogs);

// PTM Scheduling
router.post('/teacher/meetings', ...teacher, tc.scheduleMeeting);
router.get('/teacher/meetings', ...teacher, tc.getMeetings);
router.get('/teacher/student-attendance/:studentId', ...teacher, tc.getStudentFullAttendance);
router.delete('/teacher/retract-announcement/:id', ...teacher, tc.deleteAnnouncement);
router.post('/teacher/bulk-attendance', ...teacher, tc.bulkAttendanceImport);
router.get('/teacher/reviews', ...teacher, tc.getMyReviews);
router.get('/teacher/unified-calendar', ...teacher, tc.getUnifiedCalendar);
router.get('/teacher/timetable/:classId', ...teacher, tbc.getTimetableByClass);

// ─── Student Routes ──────────────────────────────────────────────────────────
const student = [auth, requireRole('Student')];

router.get('/student/profile', ...student, stc.getProfile);
router.put('/student/profile', ...student, upload.single('photo'), stc.updateProfile);
router.get('/student/attendance', ...student, stc.getAttendance);
router.get('/student/results', ...student, stc.getResults);
router.get('/student/assignments', ...student, stc.getAssignments);
router.post('/student/submit-assignment', ...student, upload.single('file'), stc.submitAssignment);
router.get('/student/my-submissions', ...student, stc.getMySubmissions);
router.get('/student/fees', ...student, stc.getFees);
router.get('/student/exams', ...student, stc.getExams);
router.get('/student/report-card', ...student, stc.downloadReportCard);
router.get('/student/fees/:feeId/receipt', ...student, stc.downloadFeeReceipt);
router.post('/student/change-password', ...student, stc.changePassword);
router.get('/student/timetable', ...student, tbc.getStudentTimetable);

// ─── Parent Routes ─────────────────────────────────────────────────────────
const parent = [auth, requireRole('Parent')];

router.get('/parent/children', ...parent, pc.getMyChildren);
router.get('/parent/child/:studentId/overview', ...parent, pc.getChildOverview);
router.get('/parent/child/:studentId/attendance', ...parent, pc.getChildAttendance);
router.get('/parent/child/:studentId/results', ...parent, pc.getChildResults);
router.get('/parent/child/:studentId/fees', ...parent, pc.getChildFees);
router.get('/parent/child/:studentId/timetable', ...parent, pc.getChildTimetable);
router.get('/parent/child/:studentId/assignments', ...parent, pc.getChildAssignments);
router.get('/parent/child/:studentId/exams', ...parent, pc.getChildExams);
router.get('/parent/child/:studentId/behavior', ...parent, pc.getChildBehaviorLogs);
router.get('/parent/child/:studentId/meetings', ...parent, pc.getChildMeetings);
router.get('/parent/holidays', ...parent, pc.getHolidays);

// Documents
router.get('/parent/child/:studentId/report-card', ...parent, pc.downloadChildReportCard);
router.get('/parent/receipt/:feeId', ...parent, pc.downloadChildFeeReceipt);

// Settings
router.put('/parent/profile', ...parent, upload.single('photo'), pc.updateParentProfile);
router.post('/parent/change-password', ...parent, pc.changeParentPassword);


const mc = require('../controllers/message.controller');

// ─── Communication Routes ───────────────────────────────────────────────────
router.get('/school-admin/announcements', ...schoolAdmin, mc.getAnnouncements);
router.post('/school-admin/announcements', ...schoolAdmin, upload.single('file'), mc.createAnnouncement);
router.get('/school-admin/messages', ...schoolAdmin, mc.getMyMessages);
router.post('/school-admin/messages', ...schoolAdmin, upload.single('file'), mc.sendMessage);
router.delete('/school-admin/messages/:id', ...schoolAdmin, mc.deleteMessage);

// Notice Board
router.get('/school-admin/notices', ...schoolAdmin, mc.getNotices);
router.post('/school-admin/notices', ...schoolAdmin, upload.single('file'), mc.createNotice);

// Global (for teachers/students to see)
router.get('/announcements', auth, mc.getAnnouncements);
router.get('/notices', auth, mc.getNotices);
router.get('/my-messages', auth, mc.getMyMessages);
router.get('/chat-history/:otherUserId', auth, mc.getChatHistory);
router.post('/my-messages', auth, mc.sendMessage);
router.get('/contacts', auth, mc.getContacts);

router.get('/holidays', auth, hc.getHolidays); // Read-only for all authenticated
router.post('/school-admin/holidays', ...schoolAdmin, hc.createHoliday);
router.put('/school-admin/holidays/:id', ...schoolAdmin, hc.updateHoliday);
router.delete('/school-admin/holidays/:id', ...schoolAdmin, hc.deleteHoliday);

// ─── Accountant Routes ────────────────────────────────────────────────────────
const accountant = [auth, requireRole('Accountant')];

router.get('/accountant/fees', ...accountant, ac.getFees);
router.get('/accountant/standards', ...accountant, sa.getStandards);
router.put('/accountant/fees/:id', ...accountant, ac.collectFee);
router.get('/accountant/payroll', ...accountant, ac.getPayroll);
router.post('/accountant/payroll/generate', ...accountant, ac.generatePayroll);
router.post('/accountant/payroll/single', ...accountant, ac.createSinglePayroll);
router.put('/accountant/payroll/:id/process', ...accountant, ac.processPayroll);
router.put('/accountant/payroll/:id', ...accountant, ac.updatePayroll);
router.delete('/accountant/payroll/:id', ...accountant, ac.deletePayroll);
router.get('/accountant/reports', ...accountant, ac.getFinancialReport);
router.get('/accountant/teachers', ...accountant, sa.getTeachers);
router.get('/accountant/fee-structures', ...accountant, ac.getFeeStructures);
router.post('/accountant/fee-structures', ...accountant, ac.createFeeStructure);
router.put('/accountant/fee-structures/:id', ...accountant, ac.updateFeeStructure);
router.delete('/accountant/fee-structures/:id', ...accountant, ac.deleteFeeStructure);
router.post('/accountant/apply-fee-structure', ...accountant, ac.applyFeeStructure);
router.post('/accountant/send-fee-reminders', ...accountant, sa.sendFeeReminders);

// ─── Librarian Routes ─────────────────────────────────────────────────────────
const librarian = [auth, requireRole('Librarian')];

router.get('/librarian/books', ...librarian, lc.getBooks);
router.post('/librarian/books', ...librarian, lc.addBook);
router.put('/librarian/books/:id', ...librarian, lc.updateBook);
router.delete('/librarian/books/:id', ...librarian, lc.deleteBook);
router.post('/librarian/issue', ...librarian, lc.issueBook);
router.put('/librarian/return/:id', ...librarian, lc.returnBook);
router.get('/librarian/records', ...librarian, lc.getIssueRecords);

// ─── Transport Routes ──────────────────────────────────────────────────────────
const transportManager = [auth, requireRole('Transport_Manager')];

router.get('/transport/vehicles', ...transportManager, trc.getVehicles);
router.post('/transport/vehicles', ...transportManager, trc.addVehicle);
router.put('/transport/vehicles/:id', ...transportManager, trc.updateVehicle);
router.delete('/transport/vehicles/:id', ...transportManager, trc.deleteVehicle);
router.get('/transport/routes', ...transportManager, trc.getRoutes);
router.post('/transport/routes', ...transportManager, trc.addRoute);
router.put('/transport/routes/:id', ...transportManager, trc.updateRoute);
router.delete('/transport/routes/:id', ...transportManager, trc.deleteRoute);
router.post('/transport/routes/:id/assign-student', ...transportManager, trc.assignStudent);

module.exports = router;
