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

export const fetchAnnouncements = createAsyncThunk('parent/fetchAnnouncements', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/announcements');
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

export const fetchChildBehaviorLogs = createAsyncThunk('parent/fetchChildBehaviorLogs', async (studentId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/parent/child/${studentId}/behavior`);
        return response.data;
    } catch (err) { return rejectWithValue(err.response.data); }
});

export const fetchChildMeetings = createAsyncThunk('parent/fetchChildMeetings', async (studentId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/parent/child/${studentId}/meetings`);
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

export const fetchChildTransport = createAsyncThunk('parent/fetchTransport', async (studentId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/parent/child/${studentId}/transport`);
        return response.data;
    } catch (err) { return rejectWithValue(err.response.data); }
});

export const payChildFee = createAsyncThunk('parent/payFee', async (feeId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/parent/pay-fee/${feeId}`);
        return response.data;
    } catch (err) { return rejectWithValue(err.response.data); }
});

export const verifyFeePayment = createAsyncThunk('parent/verifyFee', async (orderId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/parent/verify-fee/${orderId}`);
        return response.data;
    } catch (err) { return rejectWithValue(err.response.data); }
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
        behaviorLogs: [],
        meetings: [],
        transport: null,
        announcements: [],
        
        // Granular Loading Nodes
        childrenLoading: false,
        overviewLoading: false,
        attendanceLoading: false,
        resultsLoading: false,
        feesLoading: false,
        timetableLoading: false,
        assignmentsLoading: false,
        examsLoading: false,
        behaviorLoading: false,
        meetingsLoading: false,
        transportLoading: false,
        announcementsLoading: false,
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
            state.announcements = [];
        },
        addAnnouncement: (state, action) => {
            state.announcements.unshift(action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            // Announcements
            .addCase(fetchAnnouncements.pending, (state) => { state.announcementsLoading = true; })
            .addCase(fetchAnnouncements.fulfilled, (state, action) => {
                state.announcementsLoading = false;
                state.announcements = action.payload;
            })
            .addCase(fetchAnnouncements.rejected, (state, action) => {
                state.announcementsLoading = false;
                state.error = action.payload || 'Signal sync failed';
            })
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
            .addCase(fetchChildExams.rejected, (state) => { state.examsLoading = false; })

            // Conduct Registry
            .addCase(fetchChildBehaviorLogs.pending, (state) => { state.behaviorLoading = true; })
            .addCase(fetchChildBehaviorLogs.fulfilled, (state, action) => {
                state.behaviorLoading = false;
                state.behaviorLogs = action.payload;
            })
            .addCase(fetchChildBehaviorLogs.rejected, (state) => { state.behaviorLoading = false; })

            // Meeting Protocols
            .addCase(fetchChildMeetings.pending, (state) => { state.meetingsLoading = true; })
            .addCase(fetchChildMeetings.fulfilled, (state, action) => {
                state.meetingsLoading = false;
                state.meetings = action.payload;
            })
            .addCase(fetchChildMeetings.rejected, (state) => { state.meetingsLoading = false; })
            // Transport Node
            .addCase(fetchChildTransport.pending, (state) => { state.transportLoading = true; })
            .addCase(fetchChildTransport.fulfilled, (state, action) => {
                state.transportLoading = false;
                state.transport = action.payload;
            })
            .addCase(fetchChildTransport.rejected, (state) => { state.transportLoading = false; })

            // Fee Payment
            .addCase(payChildFee.pending, (state) => { state.feesLoading = true; })
            .addCase(payChildFee.fulfilled, (state, action) => {
                state.feesLoading = false;
                if (action.payload.fee) {
                    state.fees = state.fees.map(f => f._id === action.payload.fee._id ? action.payload.fee : f);
                }
            })
            .addCase(payChildFee.rejected, (state) => { state.feesLoading = false; })
            
            // Verify Fee
            .addCase(verifyFeePayment.pending, (state) => { state.feesLoading = true; })
            .addCase(verifyFeePayment.fulfilled, (state, action) => {
                state.feesLoading = false;
                if (action.payload.fee) {
                    state.fees = state.fees.map(f => f._id === action.payload.fee._id ? action.payload.fee : f);
                }
            })
            .addCase(verifyFeePayment.rejected, (state) => { state.feesLoading = false; });
    }
});

export const { setSelectedChild, clearParentState, addAnnouncement } = parentSlice.actions;
export default parentSlice.reducer;
