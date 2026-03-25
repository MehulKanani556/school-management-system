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
            const message = error.response?.data?.message || error.message || 'Security feed interruption';
            return rejectWithValue(typeof message === 'object' ? JSON.stringify(message) : message);
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
            const message = error.response?.data?.message || error.message || 'Provisioning failed';
            return rejectWithValue(typeof message === 'object' ? JSON.stringify(message) : message);
        }
    }
);

export const updateStaff = createAsyncThunk(
    'user/updateStaff',
    async ({ id, staffData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/school-admin/staff/${id}`, staffData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Update failed';
            return rejectWithValue(typeof message === 'object' ? JSON.stringify(message) : message);
        }
    }
);

export const deleteStaff = createAsyncThunk(
    'user/deleteStaff',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/school-admin/staff/${id}`);
            return { id, message: response.data.message };
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Deletion failed';
            return rejectWithValue(typeof message === 'object' ? JSON.stringify(message) : message);
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
            })
            .addCase(updateStaff.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateStaff.fulfilled, (state, action) => {
                state.loading = false;
                state.users = state.users.map(u => u._id === action.payload.user._id ? action.payload.user : u);
                state.message = 'Staff member updated successfully';
            })
            .addCase(updateStaff.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteStaff.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteStaff.fulfilled, (state, action) => {
                state.loading = false;
                state.users = state.users.filter(u => u._id !== action.payload.id);
                state.message = 'Staff member removed successfully';
            })
            .addCase(deleteStaff.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearUserError, clearUserMessage, setUserError, setUserMessage } = userSlice.actions;
export default userSlice.reducer;
