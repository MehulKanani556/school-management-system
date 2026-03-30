import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

export const fetchMyAttendance = createAsyncThunk(
    'staff/fetchMyAttendance',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/staff-attendance/my-history');
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const fetchMyLeaves = createAsyncThunk(
    'staff/fetchMyLeaves',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/staff-attendance/my-leaves');
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const applyForLeave = createAsyncThunk(
    'staff/applyForLeave',
    async (leaveData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/staff-attendance/apply-leave', leaveData);
            toast.success('Leave application submitted! (अवकाश आवेदन जमा हो गया)');
            return response.data;
        } catch (err) {
            toast.error(err.response.data.message || 'Submission failed');
            return rejectWithValue(err.response.data);
        }
    }
);

const staffSlice = createSlice({
    name: 'staff',
    initialState: {
        myAttendance: [],
        myLeaves: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyAttendance.pending, (state) => { state.loading = true; })
            .addCase(fetchMyAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.myAttendance = action.payload;
            })
            .addCase(fetchMyAttendance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchMyLeaves.pending, (state) => { state.loading = true; })
            .addCase(fetchMyLeaves.fulfilled, (state, action) => {
                state.loading = false;
                state.myLeaves = action.payload;
            })
            .addCase(applyForLeave.fulfilled, (state, action) => {
                state.myLeaves.unshift(action.payload.leave);
            });
    }
});

export default staffSlice.reducer;
