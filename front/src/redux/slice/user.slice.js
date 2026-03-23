import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

// Async Thunk for Situational User Registry Fetching
export const fetchUsers = createAsyncThunk(
    'user/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/users');
            return response.data.users;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Security feed interruption');
        }
    }
);

export const addStaff = createAsyncThunk(
    'user/addStaff',
    async (staffData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/school-admin/staff', staffData);
            return response.data.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Provisioning failed');
        }
    }
);

const initialState = {
    users: [],
    loading: false,
    error: null,
    message: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearUserError: (state) => { state.error = null; },
        clearUserMessage: (state) => { state.message = null; },
        setUserError: (state, action) => { state.error = action.payload; },
        setUserMessage: (state, action) => { state.message = action.payload; }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload || [];
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(addStaff.pending, (state) => {
                state.loading = true;
            })
            .addCase(addStaff.fulfilled, (state, action) => {
                state.loading = false;
                state.users.unshift(action.payload);
                state.message = 'Staff member provisioned successfully';
            })
            .addCase(addStaff.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearUserError, clearUserMessage, setUserError, setUserMessage } = userSlice.actions;
export default userSlice.reducer;
