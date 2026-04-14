const express = require('express');
const router = express.Router();
const staffAttendanceController = require('../controllers/staffAttendance.controller');
const { auth, isSuperAdmin } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const academicYear = require('../middleware/academicYear');

const schoolAdmin = [auth, requireRole('School_Admin'), academicYear];
const teacher = [auth, requireRole('Teacher'), academicYear];
const superAdminAndSchoolAdmin = [auth, requireRole('Super_Admin', 'School_Admin', 'Accountant', 'Transport_Manager'), academicYear];
const authWithYear = [auth, academicYear];

// 1. Bulk mark by admin
router.post('/bulk-mark', ...superAdminAndSchoolAdmin, staffAttendanceController.markBulkAttendance);

// 2. Self attendance (Teacher)
router.post('/self-mark', ...teacher, staffAttendanceController.teacherSelfAttendance);

// 3. Get Staff for attendance marking
router.get('/list', ...superAdminAndSchoolAdmin, staffAttendanceController.getStaffForAttendance);

// 4. Monthly summary aggregation
router.get('/monthly-summary', ...superAdminAndSchoolAdmin, staffAttendanceController.getMonthlySummary);

// 5. Get report
router.get('/report', ...superAdminAndSchoolAdmin, staffAttendanceController.getAttendanceReport);

// 6. Get My History (Self)
router.get('/my-history', ...authWithYear, staffAttendanceController.getMyAttendanceHistory);

// 7. Generic Leave Management
router.post('/apply-leave', ...authWithYear, staffAttendanceController.staffApplyLeave);
router.get('/my-leaves', ...authWithYear, staffAttendanceController.getStaffLeaves);

module.exports = router;
