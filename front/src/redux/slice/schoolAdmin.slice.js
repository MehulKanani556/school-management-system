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
export const fetchFees      = asyncGet('sa/fees',      '/fees');
export const fetchExams     = asyncGet('sa/exams',     '/exams');
export const fetchAttendance = asyncGet('sa/attendance', '/attendance');

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

export const createFee = post('sa/createFee', '/fees');
export const updateFee = put('sa/updateFee', '/fees');

export const createExam = post('sa/createExam', '/exams');
export const updateExam = put('sa/updateExam', '/exams');
export const deleteExam = del('sa/deleteExam', '/exams');

export const saveAttendance = post('sa/saveAttendance', '/attendance');

const initialState = {
  dashboard: null,
  students: [], teachers: [], classes: [], fees: [], exams: [], attendance: [],
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
      .addCase(fetchFees.fulfilled, handleList('fees'))
      .addCase(fetchExams.fulfilled, handleList('exams'))
      .addCase(fetchAttendance.fulfilled, handleList('attendance'))
      // create
      .addCase(createStudent.fulfilled, (state, a) => { state.students.push(a.payload); state.loading = false; })
      .addCase(createTeacher.fulfilled, (state, a) => { state.teachers.push(a.payload); state.loading = false; })
      .addCase(createClass.fulfilled, (state, a) => { state.classes.push(a.payload); state.loading = false; })
      .addCase(createFee.fulfilled, (state, a) => { state.fees.push(a.payload); state.loading = false; })
      .addCase(createExam.fulfilled, (state, a) => { state.exams.push(a.payload); state.loading = false; })
      // update
      .addCase(updateStudent.fulfilled, (state, a) => { const i = state.students.findIndex(s => s._id === a.payload._id); if (i !== -1) state.students[i] = a.payload; state.loading = false; })
      .addCase(updateTeacher.fulfilled, (state, a) => { const i = state.teachers.findIndex(t => t._id === a.payload._id); if (i !== -1) state.teachers[i] = a.payload; state.loading = false; })
      .addCase(updateClass.fulfilled, (state, a) => { const i = state.classes.findIndex(c => c._id === a.payload._id); if (i !== -1) state.classes[i] = a.payload; state.loading = false; })
      .addCase(updateFee.fulfilled, (state, a) => { const i = state.fees.findIndex(f => f._id === a.payload._id); if (i !== -1) state.fees[i] = a.payload; state.loading = false; })
      .addCase(updateExam.fulfilled, (state, a) => { const i = state.exams.findIndex(e => e._id === a.payload._id); if (i !== -1) state.exams[i] = a.payload; state.loading = false; })
      // delete
      .addCase(deleteStudent.fulfilled, (state, a) => { state.students = state.students.filter(s => s._id !== a.payload); state.loading = false; })
      .addCase(deleteTeacher.fulfilled, (state, a) => { state.teachers = state.teachers.filter(t => t._id !== a.payload); state.loading = false; })
      .addCase(toggleTeacherStatus.fulfilled, (state, a) => { const t = state.teachers.find(t => t._id === a.payload.id); if (t) t.isActive = a.payload.isActive; state.loading = false; })
      .addCase(deleteClass.fulfilled, (state, a) => { state.classes = state.classes.filter(c => c._id !== a.payload); state.loading = false; })
      .addCase(deleteExam.fulfilled, (state, a) => { state.exams = state.exams.filter(e => e._id !== a.payload); state.loading = false; })
      .addCase(saveAttendance.fulfilled, (state) => { state.loading = false; });

    // pending/rejected for all
    [fetchDashboard, fetchStudents, fetchTeachers, fetchClasses, fetchFees, fetchExams, fetchAttendance,
     createStudent, createTeacher, createClass, createFee, createExam,
     updateStudent, updateTeacher, updateClass, updateFee, updateExam,
     deleteStudent, deleteTeacher, deleteClass, deleteExam, saveAttendance, toggleTeacherStatus
    ].forEach(thunk => {
      builder.addCase(thunk.pending, pending).addCase(thunk.rejected, rejected);
    });
  },
});

export const { clearError } = schoolAdminSlice.actions;
export default schoolAdminSlice.reducer;
