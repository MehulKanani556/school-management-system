import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchFees = createAsyncThunk(
    'accountant/fetchFees',
    async (params, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/accountant/fees', { params });
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
    async (params, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/accountant/payroll', { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const generatePayroll = createAsyncThunk('accountant/generatePayroll', async (data, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/accountant/payroll/generate', data);
        return response.data;
    } catch (err) { return rejectWithValue(err.response.data); }
});

export const createSinglePayroll = createAsyncThunk('accountant/createSinglePayroll', async (data, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/accountant/payroll/single', data);
        return response.data;
    } catch (err) { return rejectWithValue(err.response.data); }
});

export const processPayroll = createAsyncThunk(
    'accountant/processPayroll',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/accountant/payroll/${id}/process`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const updatePayroll = createAsyncThunk('accountant/updatePayroll', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/accountant/payroll/${id}`, data);
        return response.data;
    } catch (err) { return rejectWithValue(err.response.data); }
});

export const deletePayroll = createAsyncThunk('accountant/deletePayroll', async (id, { rejectWithValue }) => {
    try {
        await axiosInstance.delete(`/accountant/payroll/${id}`);
        return id;
    } catch (err) { return rejectWithValue(err.response.data); }
});

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

export const fetchFeeStructures = createAsyncThunk('accountant/fetchFeeStructures', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/accountant/fee-structures');
        return response.data;
    } catch (err) { return rejectWithValue(err.response.data); }
});

export const createFeeStructure = createAsyncThunk('accountant/createFeeStructure', async (data, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/accountant/fee-structures', data);
        return response.data;
    } catch (err) { return rejectWithValue(err.response.data); }
});

export const updateFeeStructure = createAsyncThunk('accountant/updateFeeStructure', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/accountant/fee-structures/${id}`, data);
        return response.data;
    } catch (err) { return rejectWithValue(err.response.data); }
});

export const deleteFeeStructure = createAsyncThunk('accountant/deleteFeeStructure', async (id, { rejectWithValue }) => {
    try {
        await axiosInstance.delete(`/accountant/fee-structures/${id}`);
        return id;
    } catch (err) { return rejectWithValue(err.response.data); }
});

export const applyFeeStructure = createAsyncThunk('accountant/applyFeeStructure', async (data, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/accountant/apply-fee-structure', data);
        return response.data;
    } catch (err) { return rejectWithValue(err.response.data); }
});

export const sendFeeReminders = createAsyncThunk(
    'accountant/sendReminders',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/accountant/send-fee-reminders', data);
            return response.data.message;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

const accountantSlice = createSlice({
    name: 'accountant',
    initialState: {
        fees: [],
        feeStructures: [],
        payroll: [],
        report: null,
        pagination: {
            fees: { total: 0, pages: 1, current: 1 },
            payroll: { total: 0, pages: 1, current: 1 }
        },
        totals: {
            paid: 0,
            pending: 0
        },
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
                state.fees = action.payload.fees || action.payload; // Fallback for old calls
                if (action.payload.total) {
                    state.pagination.fees = {
                        total: action.payload.total,
                        pages: action.payload.pages,
                        current: action.payload.currentPage
                    };
                }
            })
            .addCase(collectFee.fulfilled, (state, action) => {
                const index = state.fees.findIndex(f => f._id === action.payload._id);
                if (index !== -1) state.fees[index] = action.payload;
                state.success = 'Fee collected successfully';
            })
            .addCase(fetchPayroll.fulfilled, (state, action) => {
                state.loading = false;
                state.payroll = action.payload.payroll;
                state.pagination.payroll = {
                    total: action.payload.pagination?.payroll?.total || action.payload.total || 0,
                    pages: action.payload.pagination?.payroll?.pages || action.payload.pages || 1,
                    current: action.payload.pagination?.payroll?.current || action.payload.currentPage || 1
                };
                state.totals.paid = action.payload.totals?.paid || 0;
                state.totals.pending = action.payload.totals?.pending || 0;
            })
            .addCase(generatePayroll.fulfilled, (state, action) => {
                state.loading = false;
                state.success = action.payload.message;
            })
            .addCase(createSinglePayroll.fulfilled, (state, action) => {
                state.loading = false;
                state.payroll.unshift(action.payload.data);
                state.success = action.payload.message;
            })
            .addCase(processPayroll.fulfilled, (state, action) => {
                const index = state.payroll.findIndex(p => p._id === action.payload._id);
                if (index !== -1) state.payroll[index] = action.payload;
                state.success = 'Payroll processed successfully';
            })
            .addCase(updatePayroll.fulfilled, (state, action) => {
                const index = state.payroll.findIndex(p => p._id === action.payload._id);
                if (index !== -1) state.payroll[index] = action.payload;
                state.success = 'Payroll updated successfully';
            })
            .addCase(deletePayroll.fulfilled, (state, action) => {
                state.payroll = state.payroll.filter(p => p._id !== action.payload);
                state.success = 'Payroll record deleted';
            })
            .addCase(fetchFinancialReport.fulfilled, (state, action) => {
                state.report = action.payload;
            })
            .addCase(fetchFeeStructures.fulfilled, (state, action) => {
                state.loading = false;
                state.feeStructures = action.payload;
            })
            .addCase(createFeeStructure.fulfilled, (state, action) => {
                state.feeStructures.unshift(action.payload.data);
            })
            .addCase(updateFeeStructure.fulfilled, (state, action) => {
                const idx = state.feeStructures.findIndex(s => s._id === action.payload.data._id);
                if (idx !== -1) state.feeStructures[idx] = action.payload.data;
            })
            .addCase(deleteFeeStructure.fulfilled, (state, action) => {
                state.feeStructures = state.feeStructures.filter(s => s._id !== action.payload);
            })
            .addCase(applyFeeStructure.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(sendFeeReminders.fulfilled, (state, action) => {
                state.success = action.payload;
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
