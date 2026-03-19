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
export const fetchStudents  = asyncGet('sa/students',  '/students');
export const fetchTeachers  = asyncGet('sa/teachers',  '/teachers');
export const fetchClasses   = asyncGet('sa/classes',   '/classes');
export const fetchSubjects  = asyncGet('sa/subjects',  '/subjects');
export const fetchFeeStructures = asyncGet('sa/fee-structures', '/fee-structures');
export const fetchFees      = asyncGet('sa/fees',      '/fees');
export const fetchExams     = asyncGet('sa/exams',     '/exams');
export const fetchAttendance = asyncGet('sa/attendance', '/attendance');
export const fetchTimetable = asyncGet('sa/timetable', '/timetable');
export const fetchAllTimetables = asyncGet('sa/timetables', '/timetables');

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
    try { await axiosInstance.delete(`${BASE}${path}/${id}`); return id; }
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

export const createSubject = post('sa/createSubject', '/subjects');
export const updateSubject = put('sa/updateSubject', '/subjects');
export const deleteSubject = del('sa/deleteSubject', '/subjects');

export const createFee = post('sa/createFee', '/fees');
export const updateFee = put('sa/updateFee', '/fees');
export const deleteFee = del('sa/deleteFee', '/fees');

export const createFeeStructure = post('sa/createFeeStructure', '/fee-structures');
export const updateFeeStructure = put('sa/updateFeeStructure', '/fee-structures');
export const deleteFeeStructure = del('sa/deleteFeeStructure', '/fee-structures');
export const applyFeeStructure  = post('sa/applyFeeStructure', '/apply-fee-structure');

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

const initialState = {
  dashboard: null,
  students: [], teachers: [], classes: [], subjects: [], feeStructures: [], fees: [], exams: [], attendance: [], holidays: [], timetable: null, timetables: [],
  loading: false, error: null,
};

const handleList = (key) => (state, action) => { state[key] = action.payload; state.loading = false; };

const schoolAdminSlice = createSlice({
  name: 'schoolAdmin',
  initialState,
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload?.message || 'Error'; };

    builder
      .addCase(fetchDashboard.fulfilled, (state, a) => { state.dashboard = a.payload; state.loading = false; })
      .addCase(fetchStudents.fulfilled, handleList('students'))
      .addCase(fetchTeachers.fulfilled, handleList('teachers'))
      .addCase(fetchClasses.fulfilled, handleList('classes'))
      .addCase(fetchSubjects.fulfilled, handleList('subjects'))
      .addCase(fetchFeeStructures.fulfilled, handleList('feeStructures'))
      .addCase(fetchFees.fulfilled, handleList('fees'))
      .addCase(fetchExams.fulfilled, handleList('exams'))
      .addCase(fetchAttendance.fulfilled, handleList('attendance'))
      .addCase(fetchHolidays.fulfilled, handleList('holidays'))
      .addCase(fetchTimetable.fulfilled, (state, a) => { state.timetable = a.payload; state.loading = false; })
      .addCase(fetchAllTimetables.fulfilled, handleList('timetables'))
      // create
      .addCase(createStudent.fulfilled, (state, a) => { state.students.push(a.payload); state.loading = false; })
      .addCase(createTeacher.fulfilled, (state, a) => { state.teachers.push(a.payload); state.loading = false; })
      .addCase(createClass.fulfilled, (state, a) => { state.classes.push(a.payload); state.loading = false; })
      .addCase(createFee.fulfilled, (state, a) => { state.fees.push(a.payload); state.loading = false; })
      .addCase(createExam.fulfilled, (state, a) => { state.exams.push(a.payload); state.loading = false; })
      .addCase(createSubject.fulfilled, (state, a) => { state.subjects.push(a.payload); state.loading = false; })
      .addCase(createHoliday.fulfilled, (state, a) => { state.holidays.push(a.payload); state.loading = false; })
      .addCase(createFeeStructure.fulfilled, (state, a) => { state.feeStructures.push(a.payload); state.loading = false; })
      // update
      .addCase(updateStudent.fulfilled, (state, a) => { const i = state.students.findIndex(s => s._id === a.payload._id); if (i !== -1) state.students[i] = a.payload; state.loading = false; })
      .addCase(updateTeacher.fulfilled, (state, a) => { const i = state.teachers.findIndex(t => t._id === a.payload._id); if (i !== -1) state.teachers[i] = a.payload; state.loading = false; })
      .addCase(updateClass.fulfilled, (state, a) => { const i = state.classes.findIndex(c => c._id === a.payload._id); if (i !== -1) state.classes[i] = a.payload; state.loading = false; })
      .addCase(updateFee.fulfilled, (state, a) => { const i = state.fees.findIndex(f => f._id === a.payload._id); if (i !== -1) state.fees[i] = a.payload; state.loading = false; })
      .addCase(updateExam.fulfilled, (state, a) => { const i = state.exams.findIndex(e => e._id === a.payload._id); if (i !== -1) state.exams[i] = a.payload; state.loading = false; })
      .addCase(updateSubject.fulfilled, (state, a) => { const i = state.subjects.findIndex(s => s._id === a.payload._id); if (i !== -1) state.subjects[i] = a.payload; state.loading = false; })
      .addCase(updateHoliday.fulfilled, (state, a) => { const i = state.holidays.findIndex(h => h._id === a.payload._id); if (i !== -1) state.holidays[i] = a.payload; state.loading = false; })
      .addCase(updateFeeStructure.fulfilled, (state, a) => { const i = state.feeStructures.findIndex(s => s._id === a.payload._id); if (i !== -1) state.feeStructures[i] = a.payload; state.loading = false; })
      // delete
      .addCase(deleteStudent.fulfilled, (state, a) => { state.students = state.students.filter(s => s._id !== a.payload); state.loading = false; })
      .addCase(deleteTeacher.fulfilled, (state, a) => { state.teachers = state.teachers.filter(t => t._id !== a.payload); state.loading = false; })
      .addCase(toggleTeacherStatus.fulfilled, (state, a) => { const t = state.teachers.find(t => t._id === a.payload.id); if (t) t.isActive = a.payload.isActive; state.loading = false; })
      .addCase(deleteClass.fulfilled, (state, a) => { state.classes = state.classes.filter(c => c._id !== a.payload); state.loading = false; })
      .addCase(deleteExam.fulfilled, (state, a) => { state.exams = state.exams.filter(e => e._id !== a.payload); state.loading = false; })
      .addCase(deleteSubject.fulfilled, (state, a) => { state.subjects = state.subjects.filter(s => s._id !== a.payload); state.loading = false; })
      .addCase(deleteHoliday.fulfilled, (state, a) => { state.holidays = state.holidays.filter(h => h._id !== a.payload); state.loading = false; })
      .addCase(saveAttendance.fulfilled, (state) => { state.loading = false; })
      .addCase(deleteFee.fulfilled, (state, a) => { state.fees = state.fees.filter(f => f._id !== a.payload); state.loading = false; })
      .addCase(deleteFeeStructure.fulfilled, (state, a) => { state.feeStructures = state.feeStructures.filter(s => s._id !== a.payload); state.loading = false; })
      .addCase(applyFeeStructure.fulfilled, (state) => { state.loading = false; })
      .addCase(saveTimetable.fulfilled, (state, a) => { state.timetable = a.payload; state.loading = false; });

    // pending/rejected for all
    [
      fetchDashboard, fetchStudents, fetchTeachers, fetchClasses, fetchSubjects, fetchFeeStructures, fetchFees, fetchExams, fetchAttendance, fetchHolidays, fetchAllTimetables, fetchTimetable,
      createStudent, createTeacher, createClass, createSubject, createFeeStructure, createFee, createExam, createHoliday,
      updateStudent, updateTeacher, updateClass, updateSubject, updateFeeStructure, updateFee, updateExam, updateHoliday,
      deleteStudent, deleteTeacher, deleteClass, deleteSubject, deleteFeeStructure, deleteFee, deleteExam, deleteHoliday,
      saveAttendance, toggleTeacherStatus, applyFeeStructure
    ].forEach(thunk => {
      builder.addCase(thunk.pending, pending).addCase(thunk.rejected, rejected);
    });
  },
});

export const { clearError } = schoolAdminSlice.actions;
export default schoolAdminSlice.reducer;
