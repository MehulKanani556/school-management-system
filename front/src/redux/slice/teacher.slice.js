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

const teacherSlice = createSlice({
    name: 'teacher',
    initialState: {
        classes: [],
        students: [],
        exams: [],
        attendance: [],
        marks: [],
        loading: false,
        error: null,
        message: null
    },
    reducers: {
        clearTeacherError: (state) => { state.error = null; },
        clearTeacherMessage: (state) => { state.message = null; }
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
            .addCase(submitAttendance.fulfilled, (state) => { state.message = "Attendance marked successfully"; })
            .addCase(submitMarks.fulfilled, (state) => { state.message = "Marks submitted successfully"; })
            .addCase(uploadAssignment.fulfilled, (state) => { state.message = "Assignment published successfully"; })
            .addCase(sendMessage.fulfilled, (state) => { state.message = "Communication broadcasted successfully"; });
    }
});

export const { clearTeacherError, clearTeacherMessage } = teacherSlice.actions;
export default teacherSlice.reducer;
