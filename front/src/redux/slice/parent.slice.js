import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchMyChildren = createAsyncThunk('parent/fetchChildren', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/parent/children');
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const fetchChildOverview = createAsyncThunk('parent/fetchChildOverview', async (studentId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/parent/child/${studentId}/overview`);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const fetchChildAttendance = createAsyncThunk('parent/fetchChildAttendance', async (studentId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/parent/child/${studentId}/attendance`);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const fetchChildResults = createAsyncThunk('parent/fetchChildResults', async (studentId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/parent/child/${studentId}/results`);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const fetchChildFees = createAsyncThunk('parent/fetchChildFees', async (studentId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/parent/child/${studentId}/fees`);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const fetchChildTimetable = createAsyncThunk('parent/fetchChildTimetable', async (studentId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/parent/child/${studentId}/timetable`);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response.data);
    }
});

export const fetchChildAssignments = createAsyncThunk('parent/fetchChildAssignments', async (studentId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/parent/child/${studentId}/assignments`);
        return response.data;
    } catch (err) { return rejectWithValue(err.response.data); }
});

export const fetchChildExams = createAsyncThunk('parent/fetchChildExams', async (studentId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/parent/child/${studentId}/exams`);
        return response.data;
    } catch (err) { return rejectWithValue(err.response.data); }
});

export const downloadReportCard = createAsyncThunk('parent/downloadReportCard', async ({ studentId, name }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/parent/child/${studentId}/report-card`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `ReportCard_${name}.pdf`);
        document.body.appendChild(link);
        link.click();
        return true;
    } catch (err) { return rejectWithValue(err.message); }
});

export const downloadFeeReceipt = createAsyncThunk('parent/downloadReceipt', async ({ feeId, category }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/parent/receipt/${feeId}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Receipt_${category}.pdf`);
        document.body.appendChild(link);
        link.click();
        return true;
    } catch (err) { return rejectWithValue(err.message); }
});

const parentSlice = createSlice({
    name: 'parent',
    initialState: {
        children: [],
        selectedChild: null,
        overview: null,
        attendance: [],
        results: [],
        fees: [],
        timetable: null,
        assignments: [],
        exams: [],
        
        // Granular Loading Nodes
        childrenLoading: false,
        overviewLoading: false,
        attendanceLoading: false,
        resultsLoading: false,
        feesLoading: false,
        timetableLoading: false,
        assignmentsLoading: false,
        examsLoading: false,
        
        loading: false, // Legacy fallback
        error: null,
    },
    reducers: {
        setSelectedChild: (state, action) => {
            state.selectedChild = action.payload;
        },
        clearParentState: (state) => {
            state.children = [];
            state.selectedChild = null;
            state.overview = null;
            state.attendance = [];
            state.results = [];
            state.fees = [];
            state.timetable = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Children Registry
            .addCase(fetchMyChildren.pending, (state) => { state.childrenLoading = true; })
            .addCase(fetchMyChildren.fulfilled, (state, action) => {
                state.childrenLoading = false;
                state.children = action.payload;
                if (action.payload.length > 0 && !state.selectedChild) {
                    state.selectedChild = action.payload[0];
                }
            })
            .addCase(fetchMyChildren.rejected, (state) => { state.childrenLoading = false; })

            // Child Overview
            .addCase(fetchChildOverview.pending, (state) => { state.overviewLoading = true; })
            .addCase(fetchChildOverview.fulfilled, (state, action) => {
                state.overviewLoading = false;
                state.overview = action.payload;
            })
            .addCase(fetchChildOverview.rejected, (state) => { state.overviewLoading = false; })

            // Attendance Records
            .addCase(fetchChildAttendance.pending, (state) => { state.attendanceLoading = true; })
            .addCase(fetchChildAttendance.fulfilled, (state, action) => {
                state.attendanceLoading = false;
                state.attendance = action.payload;
            })
            .addCase(fetchChildAttendance.rejected, (state) => { state.attendanceLoading = false; })

            // Academic Results
            .addCase(fetchChildResults.pending, (state) => { state.resultsLoading = true; })
            .addCase(fetchChildResults.fulfilled, (state, action) => {
                state.resultsLoading = false;
                state.results = action.payload;
            })
            .addCase(fetchChildResults.rejected, (state) => { state.resultsLoading = false; })

            // Financial Ledger
            .addCase(fetchChildFees.pending, (state) => { state.feesLoading = true; })
            .addCase(fetchChildFees.fulfilled, (state, action) => {
                state.feesLoading = false;
                state.fees = action.payload;
            })
            .addCase(fetchChildFees.rejected, (state) => { state.feesLoading = false; })

            // Timetable Node
            .addCase(fetchChildTimetable.pending, (state) => { state.timetableLoading = true; })
            .addCase(fetchChildTimetable.fulfilled, (state, action) => {
                state.timetableLoading = false;
                state.timetable = action.payload;
            })
            .addCase(fetchChildTimetable.rejected, (state) => { state.timetableLoading = false; })

            // Project Assignments
            .addCase(fetchChildAssignments.pending, (state) => { state.assignmentsLoading = true; })
            .addCase(fetchChildAssignments.fulfilled, (state, action) => {
                state.assignmentsLoading = false;
                state.assignments = action.payload;
            })
            .addCase(fetchChildAssignments.rejected, (state) => { state.assignmentsLoading = false; })

            // Exam Schedule
            .addCase(fetchChildExams.pending, (state) => { state.examsLoading = true; })
            .addCase(fetchChildExams.fulfilled, (state, action) => {
                state.examsLoading = false;
                state.exams = action.payload;
            })
            .addCase(fetchChildExams.rejected, (state) => { state.examsLoading = false; });
    }
});

export const { setSelectedChild, clearParentState } = parentSlice.actions;
export default parentSlice.reducer;
