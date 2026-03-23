import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchFees = createAsyncThunk(
    'accountant/fetchFees',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/accountant/fees');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const collectFee = createAsyncThunk(
    'accountant/collectFee',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/accountant/fees/${id}`, data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const fetchPayroll = createAsyncThunk(
    'accountant/fetchPayroll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/accountant/payroll');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const processPayroll = createAsyncThunk(
    'accountant/processPayroll',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/accountant/payroll/${id}`, data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const fetchFinancialReport = createAsyncThunk(
    'accountant/fetchReport',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/accountant/reports');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

const accountantSlice = createSlice({
    name: 'accountant',
    initialState: {
        fees: [],
        payroll: [],
        report: null,
        loading: false,
        error: null,
        success: null
    },
    reducers: {
        clearStatus: (state) => {
            state.error = null;
            state.success = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFees.fulfilled, (state, action) => {
                state.fees = action.payload;
            })
            .addCase(collectFee.fulfilled, (state, action) => {
                const index = state.fees.findIndex(f => f._id === action.payload._id);
                if (index !== -1) state.fees[index] = action.payload;
                state.success = 'Fee collected successfully';
            })
            .addCase(fetchPayroll.fulfilled, (state, action) => {
                state.payroll = action.payload;
            })
            .addCase(processPayroll.fulfilled, (state, action) => {
                const index = state.payroll.findIndex(p => p._id === action.payload._id);
                if (index !== -1) state.payroll[index] = action.payload;
                state.success = 'Payroll processed successfully';
            })
            .addCase(fetchFinancialReport.fulfilled, (state, action) => {
                state.report = action.payload;
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

export const { clearStatus } = accountantSlice.actions;
export default accountantSlice.reducer;
