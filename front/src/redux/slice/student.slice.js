import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchStudentProfile = createAsyncThunk('student/fetchProfile', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/student/profile');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchStudentAttendance = createAsyncThunk('student/fetchAttendance', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/student/attendance');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchStudentResults = createAsyncThunk('student/fetchResults', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/student/results');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchStudentAssignments = createAsyncThunk('student/fetchAssignments', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/student/assignments');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

const studentSlice = createSlice({
    name: 'student',
    initialState: {
        profile: null,
        attendance: [],
        results: [],
        assignments: [],
        loading: false,
        error: null
    },
    reducers: {
        clearStudentError: (state) => { state.error = null; }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStudentProfile.pending, (state) => { state.loading = true; })
            .addCase(fetchStudentProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
            })
            .addCase(fetchStudentAttendance.fulfilled, (state, action) => {
                state.attendance = action.payload;
            })
            .addCase(fetchStudentResults.fulfilled, (state, action) => {
                state.results = action.payload;
            })
            .addCase(fetchStudentAssignments.fulfilled, (state, action) => {
                state.assignments = action.payload;
            });
    }
});

export const { clearStudentError } = studentSlice.actions;
export default studentSlice.reducer;
