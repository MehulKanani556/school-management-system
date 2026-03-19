import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

const BASE = '/school-admin';

const asyncGet = (name, path) =>
  createAsyncThunk(name, async (params, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`${BASE}${path}`, { params });
      return res.data;
    } catch (e) { return rejectWithValue(e.response?.data); }
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
export const fetchTimetable = asyncGet('sa/timetable', '/timetable');
export const fetchAllTimetables = asyncGet('sa/timetables', '/timetables');
export const fetchPayroll = asyncGet('sa/payroll', '/payroll');
export const fetchLeaves = asyncGet('sa/leaves', '/leaves');
export const fetchReviews = asyncGet('sa/reviews', '/reviews');

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

export const createExam = post('sa/createExam', '/exams');
export const updateExam = put('sa/updateExam', '/exams');
export const deleteExam = del('sa/deleteExam', '/exams');

export const saveAttendance = post('sa/saveAttendance', '/attendance');
export const saveTimetable = post('sa/saveTimetable', '/timetable');

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
export const importStudents = post('sa/importStudents', '/import-students');
export const importTeachers = post('sa/importTeachers', '/import-teachers');

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
  students: [], teachers: [], classes: [], standards: [], subjects: [], feeStructures: [], fees: [], exams: [], attendance: [], holidays: [], timetable: null, timetables: [],
  payroll: [], leaves: [], reviews: [],
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
    const rejected = (state, action) => { state.loading = false; state.error = action.payload?.message || 'Error'; };

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
      .addCase(fetchHolidays.fulfilled, handleList('holidays'))
      .addCase(fetchTimetable.fulfilled, (state, a) => { state.timetable = a.payload; state.loading = false; })
      .addCase(fetchAllTimetables.fulfilled, handleList('timetables'))
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
      .addCase(importStudents.fulfilled, (state, a) => { state.loading = false; state.message = a.payload.message; })
      .addCase(importTeachers.fulfilled, (state, a) => { state.loading = false; state.message = a.payload.message; })
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
      .addCase(applyFeeStructure.fulfilled, (state, a) => { state.loading = false; state.message = a.payload.message || "Fee structure applied successfully"; })
      .addCase(saveTimetable.fulfilled, (state, a) => { state.timetable = a.payload.data || a.payload; state.loading = false; state.message = a.payload.message || "Curriculum timetable published"; })

      // Payroll
      .addCase(fetchPayroll.fulfilled, handleList('payroll'))
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
      });

    // pending/rejected for all
    [
      fetchDashboard, fetchStudents, fetchTeachers, fetchClasses, fetchStandards, fetchSubjects, fetchFeeStructures, fetchFees, fetchExams, fetchAttendance, fetchHolidays, fetchAllTimetables, fetchTimetable,
      createStudent, createTeacher, createClass, createStandard, createSubject, createFeeStructure, createFee, createExam, createHoliday,
      updateStudent, updateTeacher, updateClass, updateStandard, updateSubject, updateFeeStructure, updateFee, updateExam, updateHoliday,
      deleteStudent, deleteTeacher, deleteClass, deleteStandard, deleteSubject, deleteFeeStructure, deleteFee, deleteExam, deleteHoliday,
      saveAttendance, toggleTeacherStatus, applyFeeStructure,
      importStudents, importTeachers, exportStudents, exportTeachers
    ].forEach(thunk => {
      builder.addCase(thunk.pending, pending).addCase(thunk.rejected, rejected);
    });
  },
});

export const { clearError, clearMessage } = schoolAdminSlice.actions;
export default schoolAdminSlice.reducer;
