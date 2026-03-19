import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchAssignedClasses = createAsyncThunk('teacher/fetchClasses', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/teacher/assigned-classes');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchClassStudents = createAsyncThunk('teacher/fetchStudents', async (classId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/teacher/assigned-students/${classId}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const submitAttendance = createAsyncThunk('teacher/markAttendance', async (data, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/teacher/mark-attendance', data);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const submitMarks = createAsyncThunk('teacher/addMarks', async (data, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/teacher/add-marks', data);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const uploadAssignment = createAsyncThunk('teacher/uploadAssignment', async (formData, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/teacher/upload-assignment', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const sendMessage = createAsyncThunk('teacher/sendMessage', async (formData, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/teacher/send-message', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});
export const fetchExamsByClass = createAsyncThunk('teacher/fetchExams', async (classId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/teacher/exams/${classId}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchAssignments = createAsyncThunk('teacher/fetchAssignments', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/teacher/assignments');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const updateAssignment = createAsyncThunk('teacher/updateAssignment', async ({ id, formData }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/teacher/assignments/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const deleteAssignment = createAsyncThunk('teacher/deleteAssignment', async (id, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.delete(`/teacher/assignments/${id}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchTeacherAttendance = createAsyncThunk('teacher/fetchAttendance', async ({ classId, date }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/teacher/attendance?classId=${classId}&date=${date}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchTeacherMarks = createAsyncThunk('teacher/fetchMarks', async (examId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/teacher/marks/${examId}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchTeacherTimetable = createAsyncThunk('teacher/fetchTimetable', async (classId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/teacher/timetable/${classId}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const applyLeave = createAsyncThunk('teacher/applyLeave', async (data, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/teacher/apply-leave', data);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchMyLeaves = createAsyncThunk('teacher/fetchMyLeaves', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/teacher/my-leaves');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

const teacherSlice = createSlice({
    name: 'teacher',
    initialState: {
        classes: [],
        students: [],
        exams: [],
        attendance: [],
        marks: [],
        timetable: null,
        assignments: [],
        leaves: [],
        loading: false,
        error: null,
        message: null
    },
    reducers: {
        clearTeacherError: (state) => { state.error = null; },
        clearTeacherMessage: (state) => { state.message = null; },
        setTeacherError: (state, action) => { state.error = action.payload; },
        setTeacherMessage: (state, action) => { state.message = action.payload; }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAssignedClasses.pending, (state) => { state.loading = true; })
            .addCase(fetchAssignedClasses.fulfilled, (state, action) => {
                state.loading = false;
                state.classes = action.payload;
            })
            .addCase(fetchClassStudents.fulfilled, (state, action) => {
                state.students = action.payload;
            })
            .addCase(fetchExamsByClass.fulfilled, (state, action) => {
                state.exams = action.payload;
            })
            .addCase(fetchTeacherAttendance.fulfilled, (state, action) => {
                state.attendance = action.payload;
            })
            .addCase(fetchTeacherMarks.fulfilled, (state, action) => {
                state.marks = action.payload;
            })
            .addCase(fetchTeacherTimetable.fulfilled, (state, action) => {
                state.timetable = action.payload;
            })
            .addCase(fetchAssignments.fulfilled, (state, action) => {
                state.loading = false;
                state.assignments = action.payload;
            })
            .addCase(updateAssignment.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload?.message || "Homework updated successfully";
                const upd = action.payload?.assignment || action.payload;
                state.assignments = state.assignments.map(a => a._id === upd._id ? upd : a);
            })
            .addCase(deleteAssignment.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload?.message || "Homework decommissioned";
                state.assignments = state.assignments.filter(a => a._id !== action.meta.arg);
            })
            .addCase(submitAttendance.fulfilled, (state, action) => { state.message = action.payload?.message || "Attendance marked successfully"; })
            .addCase(submitMarks.fulfilled, (state, action) => { state.message = action.payload?.message || "Marks submitted successfully"; })
            .addCase(uploadAssignment.fulfilled, (state, action) => { 
                state.message = action.payload?.message || "Assignment published successfully"; 
                const newAs = action.payload?.assignment || action.payload;
                state.assignments = [newAs, ...state.assignments];
            })
            .addCase(fetchMyLeaves.fulfilled, (state, action) => {
                state.loading = false;
                state.leaves = action.payload;
            })
            .addCase(applyLeave.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload?.message || "Leave application submitted";
                state.leaves = [action.payload.leave || action.payload, ...state.leaves];
            })
            .addCase(sendMessage.fulfilled, (state, action) => { state.message = action.payload?.message || "Communication broadcasted successfully"; });
    }
});

export const { clearTeacherError, clearTeacherMessage, setTeacherError, setTeacherMessage } = teacherSlice.actions;
export default teacherSlice.reducer;
