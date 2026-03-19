import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Global API instance mapping
const API = axios.create({ baseURL: '/api' });

// Async Thunk for Situational User Registry Fetching
export const fetchUsers = createAsyncThunk(
    'user/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/users');
            return response.data.users;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Security feed interruption');
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
            });
    },
});

export const { clearUserError, clearUserMessage, setUserError, setUserMessage } = userSlice.actions;
export default userSlice.reducer;
