import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

const BASE = '/school-admin';

const asyncGet = (name, path) =>
  createAsyncThunk(name, async (params, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`${BASE}${path}`, { params });
      return res.data;
    } catch (e) { 
      return rejectWithValue(e.response?.data); 
    }
  });

const post = (name, path) =>
  createAsyncThunk(name, async (data, { rejectWithValue }) => {
    try { const res = await axiosInstance.post(`${BASE}${path}`, data); return res.data; }
    catch (e) { return rejectWithValue(e.response?.data); }
  });

const put = (name, path) =>
  createAsyncThunk(name, async ({ id, data }, { rejectWithValue }) => {
    try { const res = await axiosInstance.put(`${BASE}${path}/${id}`, data); return res.data; }
    catch (e) { return rejectWithValue(e.response?.data); }
  });

const del = (name, path) =>
  createAsyncThunk(name, async (id, { rejectWithValue }) => {
    try { const res = await axiosInstance.delete(`${BASE}${path}/${id}`); return { id, ...res.data }; }
    catch (e) { return rejectWithValue(e.response?.data); }
  });

export const fetchDashboard = asyncGet('sa/dashboard', '/dashboard');
export const fetchStudents = asyncGet('sa/students', '/students');
export const fetchTeachers = asyncGet('sa/teachers', '/teachers');
export const fetchClasses = asyncGet('sa/classes', '/classes');
export const fetchStandards = asyncGet('sa/standards', '/standards');
export const fetchSubjects = asyncGet('sa/subjects', '/subjects');
export const fetchFeeStructures = asyncGet('sa/fee-structures', '/fee-structures');
export const fetchFees = asyncGet('sa/fees', '/fees');
export const fetchExams = asyncGet('sa/exams', '/exams');
export const fetchAttendance = asyncGet('sa/attendance', '/attendance');
export const fetchAttendanceReport = asyncGet('sa/attendanceReport', '/attendance-report');
export const fetchAttendanceAnalytics = asyncGet('sa/attendanceAnalytics', '/attendance-analytics');
export const fetchAttendanceAlerts = asyncGet('sa/attendanceAlerts', '/attendance-alerts');
export const fetchSchoolPerformance = asyncGet('sa/performance', '/reports/performance');
export const fetchFeeReport = asyncGet('sa/feeReportStatus', '/reports/fees');
export const fetchStudentDetail = createAsyncThunk('sa/studentDetail', async (id, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`${BASE}/students/${id}`);
    return res.data;
  } catch (e) { return rejectWithValue(e.response?.data); }
});

export const exportFeeReport = createAsyncThunk('sa/exportFeeReport', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get('/school-admin/reports/fees-export', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'FeeReport.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    return { success: true };
  } catch (e) { return rejectWithValue(e.response?.data); }
});

export const exportAttendanceReport = createAsyncThunk('sa/exportAttendanceReport', async (params, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get('/school-admin/attendance-export', { params, responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'AttendanceReport.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    return { success: true };
  } catch (e) { return rejectWithValue(e.response?.data); }
});
export const fetchTimetable = createAsyncThunk('sa/timetable', async (classId, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`${BASE}/timetable/${classId}`);
    return res.data;
  } catch (e) { return rejectWithValue(e.response?.data); }
});
export const fetchAllTimetables = asyncGet('sa/timetables', '/timetables');
export const fetchPayroll = asyncGet('sa/payroll', '/payroll');
export const generateBulkPayroll = post('sa/generateBulkPayroll', '/payroll/bulk');
export const fetchStaffAttendance = createAsyncThunk('sa/fetchStaffAttendance', async (params, { rejectWithValue }) => {
  try { const res = await axiosInstance.get('/staff-attendance/report', { params }); return res.data; }
  catch (e) { return rejectWithValue(e.response?.data); }
});
export const saveStaffAttendance = createAsyncThunk('sa/saveStaffAttendance', async (data, { rejectWithValue }) => {
    try { const res = await axiosInstance.post('/staff-attendance/bulk-mark', data); return res.data; }
    catch (e) { return rejectWithValue(e.response?.data); }
});
export const fetchStaffForAttendance = createAsyncThunk('sa/fetchStaffForAttendance', async (params, { rejectWithValue }) => {
    try { const res = await axiosInstance.get('/staff-attendance/list', { params }); return res.data; }
    catch (e) { return rejectWithValue(e.response?.data); }
});
export const fetchStaffMonthlySummary = createAsyncThunk('sa/fetchStaffMonthlySummary', async (params, { rejectWithValue }) => {
    try { const res = await axiosInstance.get('/staff-attendance/monthly-summary', { params }); return res.data; }
    catch (e) { return rejectWithValue(e.response?.data); }
});
export const exportStaffAttendance = createAsyncThunk('sa/exportStaffAttendance', async (params, { rejectWithValue }) => {
    try {
        const res = await axiosInstance.get('/staff-attendance/report', { params: { ...params, export: true }, responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `StaffAttendance_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return { success: true };
    } catch (e) { return rejectWithValue(e.response?.data); }
});
export const fetchAssignmentsOverview = asyncGet('sa/fetchAssignmentsOverview', '/assignments');
export const fetchLeaves = asyncGet('sa/leaves', '/leaves');
export const fetchReviews = asyncGet('sa/reviews', '/reviews');
export const fetchExamAnalytics = createAsyncThunk('sa/fetchExamAnalytics', async (id, { rejectWithValue }) => {
  try { const res = await axiosInstance.get(`/school-admin/exams/${id}/analytics`); return res.data; }
  catch (e) { return rejectWithValue(e.response?.data); }
});
export const fetchTimetableTemplates = asyncGet('sa/timetable-templates', '/timetable-templates');
export const fetchFeeSummary = asyncGet('sa/feeSummary', '/fee-summary');
export const fetchSchoolProfile = asyncGet('sa/school-profile', '/school-profile');
export const updateSchoolProfile = createAsyncThunk('sa/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.put(`${BASE}/school-profile`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  } catch (e) { return rejectWithValue(e.response?.data); }
});

export const changeAdminPassword = createAsyncThunk('sa/changePassword', async (data, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post(`${BASE}/change-password`, data);
    return res.data;
  } catch (e) { return rejectWithValue(e.response?.data); }
});





export const createStudent = post('sa/createStudent', '/students');
export const updateStudent = put('sa/updateStudent', '/students');
export const deleteStudent = del('sa/deleteStudent', '/students');

export const createTeacher = post('sa/createTeacher', '/teachers');
export const updateTeacher = put('sa/updateTeacher', '/teachers');
export const deleteTeacher = del('sa/deleteTeacher', '/teachers');
export const toggleTeacherStatus = createAsyncThunk('sa/toggleTeacherStatus', async (id, { rejectWithValue }) => {
  try { const res = await axiosInstance.patch(`/school-admin/teachers/${id}/toggle-status`); return { id, isActive: res.data.isActive }; }
  catch (e) { return rejectWithValue(e.response?.data); }
});

export const createClass = post('sa/createClass', '/classes');
export const updateClass = put('sa/updateClass', '/classes');
export const deleteClass = del('sa/deleteClass', '/classes');

export const createStandard = post('sa/createStandard', '/standards');
export const updateStandard = put('sa/updateStandard', '/standards');
export const deleteStandard = del('sa/deleteStandard', '/standards');

export const createSubject = post('sa/createSubject', '/subjects');
export const updateSubject = put('sa/updateSubject', '/subjects');
export const deleteSubject = del('sa/deleteSubject', '/subjects');

export const createFee = post('sa/createFee', '/fees');
export const updateFee = put('sa/updateFee', '/fees');
export const deleteFee = del('sa/deleteFee', '/fees');

export const createFeeStructure = post('sa/createFeeStructure', '/fee-structures');
export const updateFeeStructure = put('sa/updateFeeStructure', '/fee-structures');
export const deleteFeeStructure = del('sa/deleteFeeStructure', '/fee-structures');
export const applyFeeStructure = post('sa/applyFeeStructure', '/apply-fee-structure');
export const sendFeeReminders = post('sa/sendFeeReminders', '/send-fee-reminders');

export const createExam = post('sa/createExam', '/exams');
export const updateExam = put('sa/updateExam', '/exams');
export const deleteExam = del('sa/deleteExam', '/exams');

export const saveAttendance = post('sa/saveAttendance', '/attendance');
export const saveTimetable = post('sa/saveTimetable', '/timetable');
export const deleteTimetable = del('sa/deleteTimetable', '/timetable');

export const fetchHolidays = createAsyncThunk('sa/fetchHolidays', async (_, { rejectWithValue }) => {
  try { const res = await axiosInstance.get('/holidays'); return res.data; }
  catch (e) { return rejectWithValue(e.response?.data); }
});

export const createHoliday = post('sa/createHoliday', '/holidays');
export const updateHoliday = put('sa/updateHoliday', '/holidays');
export const deleteHoliday = del('sa/deleteHoliday', '/holidays');

export const createPayroll = post('sa/createPayroll', '/payroll');
export const updatePayroll = put('sa/updatePayroll', '/payroll');
export const deletePayroll = del('sa/deletePayroll', '/payroll');

export const updateLeaveStatus = put('sa/updateLeaveStatus', '/leaves');

export const createReview = post('sa/createReview', '/reviews');
export const updateReview = put('sa/updateReview', '/reviews');
export const deleteReview = del('sa/deleteReview', '/reviews');

export const createTimetableTemplate = post('sa/createTimetableTemplate', '/timetable-templates');
export const updateTimetableTemplate = put('sa/updateTimetableTemplate', '/timetable-templates');
export const deleteTimetableTemplate = del('sa/deleteTimetableTemplate', '/timetable-templates');
export const importStudents = post('sa/importStudents', '/import-students');
export const importTeachers = post('sa/importTeachers', '/import-teachers');
export const promoteStudents = post('sa/promoteStudents', '/promote-students');
export const toggleExamPublishStatus = createAsyncThunk('sa/toggleExamPublishStatus', async (id, { rejectWithValue }) => {
  try { const res = await axiosInstance.patch(`/school-admin/exams/${id}/toggle-publish`); return { id, isPublished: res.data.isPublished, message: res.data.message }; }
  catch (e) { return rejectWithValue(e.response?.data); }
});

// Academic Years
export const fetchAcademicYears = asyncGet('sa/academicYears', '/academic-years');
export const createAcademicYear = post('sa/createAcademicYear', '/academic-years');
export const updateAcademicYear = put('sa/updateAcademicYear', '/academic-years');
export const deleteAcademicYear = del('sa/deleteAcademicYear', '/academic-years');

// Announcements
export const fetchAnnouncements = createAsyncThunk('sa/fetchAnnouncements', async (_, { rejectWithValue }) => {
  try { const res = await axiosInstance.get('/school-admin/announcements/managed'); return res.data; }
  catch (e) { return rejectWithValue(e.response?.data); }
});
export const createAnnouncement = post('sa/createAnnouncement', '/announcements');
export const updateAnnouncement = put('sa/updateAnnouncement', '/announcements');
export const deleteAnnouncement = del('sa/deleteAnnouncement', '/announcements');

// Admissions
export const fetchAdmissions = asyncGet('sa/admissions', '/admissions/enquiries');
export const createEnquiry = post('sa/createEnquiry', '/admissions/enquiries');
export const enrollCandidate = post('sa/enrollCandidate', '/admissions/enroll');

// Notice Board
export const fetchNotices = asyncGet('sa/notices', '/notice-board');
export const createNotice = post('sa/createNotice', '/notice-board');
export const updateNotice = put('sa/updateNotice', '/notice-board');
export const deleteNotice = del('sa/deleteNotice', '/notice-board');
export const toggleNoticePin = createAsyncThunk('sa/toggleNoticePin', async (id, { rejectWithValue }) => {
  try { const res = await axiosInstance.patch(`/school-admin/notice-board/${id}/toggle-pin`); return res.data; }
  catch (e) { return rejectWithValue(e.response?.data); }
});


export const downloadReportCard = createAsyncThunk('sa/downloadReportCard', async ({ id, name }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`/school-admin/students/${id}/report-card`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ReportCard_${name}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    return { success: true };
  } catch (e) { return rejectWithValue(e.response?.data); }
});

export const exportStudents = createAsyncThunk('sa/exportStudents', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get('/school-admin/export-students', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    return { message: "Student Registry Exported" };
  } catch (e) { return rejectWithValue(e.response?.data); }
});

export const exportTeachers = createAsyncThunk('sa/exportTeachers', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get('/school-admin/export-teachers', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Teachers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    return { message: "Teacher Registry Exported" };
  } catch (e) { return rejectWithValue(e.response?.data); }
});

const initialState = {
  dashboard: null,
  students: [], teachers: [], classes: [], standards: [], subjects: [], feeStructures: [], fees: [], exams: [], 
  attendance: [], attendanceReport: [], attendanceAnalytics: [], attendanceAlerts: [],
  schoolPerformance: null, feeReport: null,
  holidays: [], timetable: null, timetables: [],
  payroll: [], staffAttendance: [], assignments: [], leaves: [], reviews: [],timetableTemplates: [],
  examAnalytics: null,
  feeSummary: null,
  studentDetail: null,
  schoolProfile: null,
  staffList: { teachers: [], otherStaff: [] },
  staffMonthlySummary: [],
  academicYears: [], announcements: [], admissions: [], notices: [],
  loading: false, error: null, message: null
};


const handleList = (key) => (state, action) => { state[key] = action.payload; state.loading = false; };

const schoolAdminSlice = createSlice({
  name: 'schoolAdmin',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearMessage: (state) => { state.message = null; }
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { 
      state.loading = false; 
      const errorMsg = action.payload?.message || (typeof action.payload === 'string' ? action.payload : 'Error');
      state.error = errorMsg; 
    };

    builder
      .addCase(fetchDashboard.fulfilled, (state, a) => { state.dashboard = a.payload; state.loading = false; })
      .addCase(fetchStudents.fulfilled, handleList('students'))
      .addCase(fetchTeachers.fulfilled, handleList('teachers'))
      .addCase(fetchClasses.fulfilled, handleList('classes'))
      .addCase(fetchStandards.fulfilled, handleList('standards'))
      .addCase(fetchSubjects.fulfilled, handleList('subjects'))
      .addCase(fetchFeeStructures.fulfilled, handleList('feeStructures'))
      .addCase(fetchFees.fulfilled, handleList('fees'))
      .addCase(fetchExams.fulfilled, handleList('exams'))
      .addCase(fetchAttendance.fulfilled, handleList('attendance'))
      .addCase(fetchAttendanceReport.fulfilled, handleList('attendanceReport'))
      .addCase(fetchAttendanceAnalytics.fulfilled, handleList('attendanceAnalytics'))
      .addCase(fetchAttendanceAlerts.fulfilled, handleList('attendanceAlerts'))
      .addCase(fetchSchoolPerformance.fulfilled, (state, a) => { state.schoolPerformance = a.payload; state.loading = false; })
      .addCase(fetchFeeReport.fulfilled, (state, a) => { state.feeReport = a.payload; state.loading = false; })
      .addCase(fetchHolidays.fulfilled, (state, a) => { state.holidays = a.payload.holidays || a.payload; state.loading = false; })
      .addCase(fetchTimetable.fulfilled, (state, a) => { state.timetable = a.payload; state.loading = false; })
      .addCase(fetchAllTimetables.fulfilled, handleList('timetables'))
      .addCase(fetchTimetableTemplates.fulfilled, handleList('timetableTemplates'))
      .addCase(fetchStudentDetail.fulfilled, (state, a) => { state.studentDetail = a.payload; state.loading = false; })
      // create
      .addCase(createStudent.fulfilled, (state, a) => {
        const item = a.payload.data || a.payload;
        state.students.push(item);
        state.loading = false;
        state.message = a.payload.message || "Student node created";
      })
      .addCase(createTeacher.fulfilled, (state, a) => {
        const item = a.payload.data || a.payload;
        state.teachers.push(item);
        state.loading = false;
        state.message = a.payload.message || "Teacher node created";
      })
      .addCase(createClass.fulfilled, (state, a) => {
        const item = a.payload.data || a.payload;
        state.classes.push(item);
        state.loading = false;
        state.message = a.payload.message || "Academic section created";
      })
      .addCase(createStandard.fulfilled, (state, a) => {
        const item = a.payload.data || a.payload;
        state.standards.push(item);
        state.loading = false;
        state.message = a.payload.message || "Standard node created";
      })
      .addCase(createFee.fulfilled, (state, a) => {
        const item = a.payload.data || a.payload;
        state.fees.push(item);
        state.loading = false;
        state.message = a.payload.message || "Fee node created";
      })
      .addCase(createExam.fulfilled, (state, a) => {
        const item = a.payload.data || a.payload;
        state.exams.push(item);
        state.loading = false;
        state.message = a.payload.message || "Examination node created";
      })
      .addCase(createSubject.fulfilled, (state, a) => {
        const item = a.payload.data || a.payload;
        state.subjects.push(item);
        state.loading = false;
        state.message = a.payload.message || "Subject node created";
      })
      .addCase(createHoliday.fulfilled, (state, a) => {
        const item = a.payload.data || a.payload;
        state.holidays.push(item);
        state.loading = false;
        state.message = a.payload.message || "Holiday terminal entry created";
      })
      .addCase(createFeeStructure.fulfilled, (state, a) => {
        const item = a.payload.data || a.payload;
        state.feeStructures.push(item);
        state.loading = false;
        state.message = a.payload.message || "Fee structure node created";
      })
      .addCase(createTimetableTemplate.fulfilled, (state, a) => {
        const item = a.payload.data || a.payload;
        state.timetableTemplates.push(item);
        state.loading = false;
        state.message = a.payload.message || "Timetable template created";
      })
      .addCase(importStudents.fulfilled, (state, a) => { state.loading = false; state.message = a.payload.message; })
      .addCase(importTeachers.fulfilled, (state, a) => { state.loading = false; state.message = a.payload.message; })
      .addCase(promoteStudents.fulfilled, (state, a) => { state.loading = false; state.message = a.payload.message; })
      .addCase(fetchExamAnalytics.fulfilled, (state, a) => { state.examAnalytics = a.payload; state.loading = false; })
      .addCase(exportStudents.fulfilled, (state, a) => { state.loading = false; state.message = a.payload.message; })
      .addCase(exportTeachers.fulfilled, (state, a) => { state.loading = false; state.message = a.payload.message; })

      // update
      .addCase(updateStudent.fulfilled, (state, a) => {
        const upd = a.payload.data || a.payload;
        const i = state.students.findIndex(s => s._id === upd._id);
        if (i !== -1) state.students[i] = upd;
        state.loading = false;
        state.message = a.payload.message || "Student identity updated";
      })
      .addCase(updateTeacher.fulfilled, (state, a) => {
        const upd = a.payload.data || a.payload;
        const i = state.teachers.findIndex(t => t._id === upd._id);
        if (i !== -1) state.teachers[i] = upd;
        state.loading = false;
        state.message = a.payload.message || "Teacher identity updated";
      })
      .addCase(updateClass.fulfilled, (state, a) => {
        const upd = a.payload.data || a.payload;
        const i = state.classes.findIndex(c => c._id === upd._id);
        if (i !== -1) state.classes[i] = upd;
        state.loading = false;
        state.message = a.payload.message || "Academic section modified";
      })
      .addCase(updateStandard.fulfilled, (state, a) => {
        const upd = a.payload.data || a.payload;
        const i = state.standards.findIndex(s => s._id === upd._id);
        if (i !== -1) state.standards[i] = upd;
        state.loading = false;
        state.message = a.payload.message || "Standard node modified";
      })
      .addCase(updateFee.fulfilled, (state, a) => {
        const upd = a.payload.data || a.payload;
        const idx = state.fees.findIndex(f => f._id === upd._id);
        if (idx !== -1) state.fees[idx] = upd;
        state.loading = false;
        state.message = a.payload.message || "Fee node modified";
      })
      .addCase(updateExam.fulfilled, (state, a) => {
        const upd = a.payload.data || a.payload;
        const i = state.exams.findIndex(e => e._id === upd._id);
        if (i !== -1) state.exams[i] = upd;
        state.loading = false;
        state.message = a.payload.message || "Examination node modified";
      })
      .addCase(updateSubject.fulfilled, (state, a) => {
        const upd = a.payload.data || a.payload;
        const i = state.subjects.findIndex(s => s._id === upd._id);
        if (i !== -1) state.subjects[i] = upd;
        state.loading = false;
        state.message = a.payload.message || "Subject node modified";
      })
      .addCase(updateHoliday.fulfilled, (state, a) => {
        const upd = a.payload.data || a.payload;
        const i = state.holidays.findIndex(h => h._id === upd._id);
        if (i !== -1) state.holidays[i] = upd;
        state.loading = false;
        state.message = a.payload.message || "Holiday entry updated";
      })
      .addCase(updateFeeStructure.fulfilled, (state, a) => {
        const upd = a.payload.data || a.payload;
        const i = state.feeStructures.findIndex(s => s._id === upd._id);
        if (i !== -1) state.feeStructures[i] = upd;
        state.loading = false;
        state.message = a.payload.message || "Fee structure modified";
      })
      .addCase(updateTimetableTemplate.fulfilled, (state, a) => {
        const upd = a.payload.data || a.payload;
        const i = state.timetableTemplates.findIndex(s => s._id === upd._id);
        if (i !== -1) state.timetableTemplates[i] = upd;
        state.loading = false;
        state.message = a.payload.message || "Timetable template modified";
      })

      // delete
      .addCase(deleteStudent.fulfilled, (state, a) => { state.students = state.students.filter(s => s._id !== a.payload.id); state.loading = false; state.message = a.payload.message || "Student decommissioned"; })
      .addCase(deleteTeacher.fulfilled, (state, a) => { state.teachers = state.teachers.filter(t => t._id !== a.payload.id); state.loading = false; state.message = a.payload.message || "Teacher decommissioned"; })
      .addCase(toggleTeacherStatus.fulfilled, (state, a) => { const t = state.teachers.find(t => t._id === a.payload.id); if (t) t.isActive = a.payload.isActive; state.loading = false; state.message = a.payload.message || "Teacher status toggled"; })
      .addCase(deleteClass.fulfilled, (state, a) => { state.classes = state.classes.filter(c => c._id !== a.payload.id); state.loading = false; state.message = a.payload.message || "Class section decommissioned"; })
      .addCase(deleteStandard.fulfilled, (state, a) => { state.standards = state.standards.filter(s => s._id !== a.payload.id); state.loading = false; state.message = a.payload.message || "Standard node removed"; })
      .addCase(deleteExam.fulfilled, (state, a) => { state.exams = state.exams.filter(e => e._id !== a.payload.id); state.loading = false; state.message = a.payload.message || "Examination node removed"; })
      .addCase(deleteSubject.fulfilled, (state, a) => { state.subjects = state.subjects.filter(s => s._id !== a.payload.id); state.loading = false; state.message = a.payload.message || "Subject removed from registry"; })
      .addCase(deleteHoliday.fulfilled, (state, a) => { state.holidays = state.holidays.filter(h => h._id !== a.payload.id); state.loading = false; state.message = a.payload.message || "Holiday terminal entry removed"; })
      .addCase(saveAttendance.fulfilled, (state, a) => { state.loading = false; state.message = a.payload.message || "Sector attendance committed"; })
      .addCase(deleteFee.fulfilled, (state, a) => { state.fees = state.fees.filter(f => f._id !== a.payload.id); state.loading = false; state.message = a.payload.message || "Fee node removed"; })
      .addCase(deleteFeeStructure.fulfilled, (state, a) => { state.feeStructures = state.feeStructures.filter(s => s._id !== a.payload.id); state.loading = false; state.message = a.payload.message || "Fee structure removed"; })
      .addCase(deleteTimetableTemplate.fulfilled, (state, a) => { state.timetableTemplates = state.timetableTemplates.filter(s => s._id !== a.payload.id); state.loading = false; state.message = a.payload.message || "Timetable template removed"; })
      .addCase(applyFeeStructure.fulfilled, (state, a) => { state.loading = false; state.message = a.payload.message || "Fee structure applied successfully"; })
      .addCase(fetchFeeSummary.fulfilled, (state, a) => { state.feeSummary = a.payload; state.loading = false; })
      .addCase(sendFeeReminders.fulfilled, (state, a) => { state.loading = false; state.message = a.payload.message || "Reminders dispatched"; })
      .addCase(saveTimetable.fulfilled, (state, a) => { state.timetable = a.payload.data || a.payload; state.loading = false; state.message = a.payload.message || "Curriculum timetable published"; })
      .addCase(deleteTimetable.fulfilled, (state, a) => { 
        state.timetables = state.timetables.filter(t => t._id !== a.payload.id);
        if (state.timetable?._id === a.payload.id) state.timetable = null;
        state.loading = false; 
        state.message = a.payload.message || "Timetable purged"; 
      })
      .addCase(toggleExamPublishStatus.fulfilled, (state, a) => { 
        const exam = state.exams.find(e => e._id === a.payload.id);
        if (exam) exam.isPublished = a.payload.isPublished;
        state.loading = false;
        state.message = a.payload.message;
      })

      // Payroll
      .addCase(fetchPayroll.fulfilled, handleList('payroll'))
      .addCase(generateBulkPayroll.fulfilled, (state, a) => { state.loading = false; state.message = a.payload.message; })
      .addCase(fetchStaffAttendance.fulfilled, handleList('staffAttendance'))
      .addCase(saveStaffAttendance.fulfilled, (state, a) => { state.loading = false; state.message = a.payload.message; })
      .addCase(fetchAssignmentsOverview.fulfilled, handleList('assignments'))
      .addCase(createPayroll.fulfilled, (state, a) => {
        const item = a.payload.data || a.payload;
        state.payroll.push(item);
        state.loading = false;
        state.message = a.payload.message || "Payroll record added";
      })
      .addCase(updatePayroll.fulfilled, (state, a) => {
        const upd = a.payload.data || a.payload;
        const i = state.payroll.findIndex(p => p._id === upd._id);
        if (i !== -1) state.payroll[i] = upd;
        state.loading = false;
        state.message = a.payload.message || "Payroll record modified";
      })
      .addCase(deletePayroll.fulfilled, (state, a) => {
        state.payroll = state.payroll.filter(p => p._id !== a.payload.id);
        state.loading = false;
        state.message = a.payload.message || "Payroll record removed";
      })

      // Leaves
      .addCase(fetchLeaves.fulfilled, handleList('leaves'))
      .addCase(updateLeaveStatus.fulfilled, (state, a) => {
        const upd = a.payload.data || a.payload;
        const i = state.leaves.findIndex(l => l._id === upd._id);
        if (i !== -1) state.leaves[i] = upd;
        state.loading = false;
        state.message = a.payload.message || "Leave status updated";
      })

      // Reviews
      .addCase(fetchReviews.fulfilled, handleList('reviews'))
      .addCase(createReview.fulfilled, (state, a) => {
        const item = a.payload.data || a.payload;
        state.reviews.push(item);
        state.loading = false;
        state.message = a.payload.message || "Performance review node created";
      })
      .addCase(updateReview.fulfilled, (state, a) => {
        const upd = a.payload.data || a.payload;
        const i = state.reviews.findIndex(r => r._id === upd._id);
        if (i !== -1) state.reviews[i] = upd;
        state.loading = false;
        state.message = a.payload.message || "Performance review modified";
      })
      .addCase(deleteReview.fulfilled, (state, a) => {
        state.reviews = state.reviews.filter(r => r._id !== a.payload.id);
        state.loading = false;
        state.message = a.payload.message || "Performance review removed";
      })
      .addCase(fetchSchoolProfile.fulfilled, (state, a) => {
        state.schoolProfile = a.payload.data || a.payload;
        state.loading = false;
      })
      .addCase(updateSchoolProfile.fulfilled, (state, a) => {
        state.schoolProfile = a.payload.data || a.payload;
        state.loading = false;
        state.message = a.payload.message || "School profile updated";
      })
      .addCase(changeAdminPassword.fulfilled, (state, a) => {
        state.loading = false;
        state.message = a.payload.message || "Password changed successfully";
      })
      
      // Academic Years
      .addCase(fetchAcademicYears.fulfilled, handleList('academicYears'))
      .addCase(createAcademicYear.fulfilled, (state, a) => {
        state.academicYears.push(a.payload.data || a.payload);
        state.loading = false;
        state.message = a.payload.message || "Academic session initialized";
      })
      .addCase(updateAcademicYear.fulfilled, (state, a) => {
        const upd = a.payload.data || a.payload;
        const i = state.academicYears.findIndex(y => y._id === upd._id);
        if (i !== -1) state.academicYears[i] = upd;
        state.loading = false;
        state.message = a.payload.message || "Academic session updated";
      })
      .addCase(deleteAcademicYear.fulfilled, (state, a) => {
        state.academicYears = state.academicYears.filter(y => y._id !== a.payload.id);
        state.loading = false;
        state.message = "Academic session purged";
      })

      // Announcements
      .addCase(fetchAnnouncements.fulfilled, handleList('announcements'))
      .addCase(createAnnouncement.fulfilled, (state, a) => {
        state.announcements.push(a.payload.data || a.payload);
        state.loading = false;
        state.message = "Announcement broadcasted successfully";
      })
      .addCase(updateAnnouncement.fulfilled, (state, a) => {
        const upd = a.payload.data || a.payload;
        const i = state.announcements.findIndex(n => n._id === upd._id);
        if (i !== -1) state.announcements[i] = upd;
        state.loading = false;
      })
      .addCase(deleteAnnouncement.fulfilled, (state, a) => {
        state.announcements = state.announcements.filter(n => n._id !== a.payload.id);
        state.loading = false;
        state.message = "Announcement retracted";
      })

      // Admissions
      .addCase(fetchAdmissions.fulfilled, handleList('admissions'))
      .addCase(createEnquiry.fulfilled, (state, a) => {
        state.admissions.push(a.payload.data || a.payload);
        state.loading = false;
        state.message = "Enquiry recorded in pipeline";
      })
      .addCase(enrollCandidate.fulfilled, (state, a) => {
        state.loading = false;
        state.message = a.payload.message || "Candidate enrolled successfully";
      })

      // Notice Board
      .addCase(fetchNotices.fulfilled, handleList('notices'))
      .addCase(createNotice.fulfilled, (state, a) => {
        state.notices.push(a.payload.data || a.payload);
        state.loading = false;
        state.message = "Notice published to board";
      })
      .addCase(updateNotice.fulfilled, (state, a) => {
        const upd = a.payload.data || a.payload;
        const i = state.notices.findIndex(n => n._id === upd._id);
        if (i !== -1) state.notices[i] = upd;
        state.loading = false;
      })
      .addCase(deleteNotice.fulfilled, (state, a) => {
        state.notices = state.notices.filter(n => n._id !== a.payload.id);
        state.loading = false;
        state.message = "Notice purged from board";
      })
      .addCase(toggleNoticePin.fulfilled, (state, a) => {
        const upd = a.payload.data || a.payload;
        const i = state.notices.findIndex(n => n._id === upd._id);
        if (i !== -1) state.notices[i] = upd;
        state.loading = false;
      })
      .addCase(fetchStaffForAttendance.fulfilled, (state, a) => {
        state.staffList = a.payload;
        state.loading = false;
      })
      .addCase(fetchStaffMonthlySummary.fulfilled, (state, a) => {
        state.staffMonthlySummary = a.payload;
        state.loading = false;
      });


    // pending/rejected for all
    [
      fetchDashboard, fetchStudents, fetchTeachers, fetchClasses, fetchStandards, fetchSubjects, fetchFeeStructures, fetchFees, fetchExams, 
      fetchAttendance, fetchAttendanceReport, fetchAttendanceAnalytics, fetchAttendanceAlerts, fetchStaffAttendance,
      fetchSchoolPerformance, fetchFeeReport, exportFeeReport, exportAttendanceReport,
      fetchHolidays, fetchAllTimetables, fetchTimetable,
      createStudent, createTeacher, createClass, createStandard, createSubject, createFeeStructure, createFee, createExam, createHoliday,
      updateStudent, updateTeacher, updateClass, updateStandard, updateSubject, updateFeeStructure, updateFee, updateExam, updateHoliday,
      deleteStudent, deleteTeacher, deleteClass, deleteStandard, deleteSubject, deleteFeeStructure, deleteFee, deleteExam, deleteHoliday,fetchTimetableTemplates,createTimetableTemplate,updateTimetableTemplate, deleteTimetableTemplate, deleteTimetable,
      saveAttendance, saveStaffAttendance, toggleTeacherStatus, applyFeeStructure,
      importStudents, importTeachers, promoteStudents, exportStudents, exportTeachers,
      fetchExamAnalytics, toggleExamPublishStatus, downloadReportCard, fetchStudentDetail,       
      fetchFeeSummary, sendFeeReminders, generateBulkPayroll,
      fetchSchoolProfile, updateSchoolProfile, changeAdminPassword,
      fetchAcademicYears, createAcademicYear, updateAcademicYear, deleteAcademicYear,
      fetchAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
      fetchAdmissions, createEnquiry, enrollCandidate,
      fetchNotices, createNotice, updateNotice, deleteNotice, toggleNoticePin,
      fetchStaffForAttendance, fetchStaffMonthlySummary, exportStaffAttendance
    ].forEach(thunk => {
      builder.addCase(thunk.pending, pending).addCase(thunk.rejected, rejected);
    });
  },
});

export const { clearError, clearMessage } = schoolAdminSlice.actions;
export default schoolAdminSlice.reducer;
