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
export const fetchStudentTimetable = createAsyncThunk('student/fetchTimetable', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/student/timetable');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchStudentFees = createAsyncThunk('student/fetchFees', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/student/fees');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchStudentExams = createAsyncThunk('student/fetchExams', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/student/exams');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchMySubmissions = createAsyncThunk('student/fetchSubmissions', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/student/my-submissions');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const submitAssignment = createAsyncThunk('student/submitAssignment', async (formData, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/student/submit-assignment', formData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const updateStudentProfile = createAsyncThunk('student/updateProfile', async (formData, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put('/student/profile', formData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const changeStudentPassword = createAsyncThunk('student/changePassword', async (data, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/student/change-password', data);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchStudentQuizzes = createAsyncThunk('student/fetchQuizzes', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/student/quizzes');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const submitQuizAttempt = createAsyncThunk('student/submitQuiz', async (data, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/student/quiz/submit', data);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchQuizHistory = createAsyncThunk('student/fetchQuizHistory', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/student/quiz-history');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchStudentResources = createAsyncThunk('student/fetchResources', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/student/resources');
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
        submissions: [],
        fees: [],
        exams: [],
        timetable: null,
        quizzes: [],
        quizHistory: [],
        resources: [],
        loading: false,
        error: null,
        message: null

    },
    reducers: {
        clearStudentError: (state) => { state.error = null; },
        clearStudentMessage: (state) => { state.message = null; },
        setStudentError: (state, action) => { state.error = action.payload; },
        setStudentMessage: (state, action) => { state.message = action.payload; }
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
            })
            .addCase(fetchStudentTimetable.fulfilled, (state, action) => {
                state.timetable = action.payload;
            })
            .addCase(fetchStudentFees.fulfilled, (state, action) => {
                state.fees = action.payload;
            })
            .addCase(fetchStudentExams.fulfilled, (state, action) => {
                state.exams = action.payload;
            })
            .addCase(fetchMySubmissions.fulfilled, (state, action) => {
                state.submissions = action.payload;
            })
            .addCase(submitAssignment.fulfilled, (state, action) => {
                state.message = action.payload.message;
            })
            .addCase(updateStudentProfile.fulfilled, (state, action) => {
                state.profile = action.payload.student;
                state.message = "Profile synchronized successfully";
            })
            .addCase(changeStudentPassword.fulfilled, (state, action) => {
                state.message = action.payload.message;
            })
            .addCase(fetchStudentQuizzes.fulfilled, (state, action) => {
                state.quizzes = action.payload;
            })
            .addCase(submitQuizAttempt.fulfilled, (state, action) => {
                state.message = action.payload.message;
                state.quizHistory.unshift(action.payload.attempt);
            })
            .addCase(fetchQuizHistory.fulfilled, (state, action) => {
                state.quizHistory = action.payload;
            })
            .addCase(fetchStudentResources.fulfilled, (state, action) => {
                state.resources = action.payload;
            })

            .addMatcher(
                (action) => action.type.endsWith('/rejected'),
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            );
    }
});

export const { clearStudentError, clearStudentMessage, setStudentError, setStudentMessage } = studentSlice.actions;
export default studentSlice.reducer;
