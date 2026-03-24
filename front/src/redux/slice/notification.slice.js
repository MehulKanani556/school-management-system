import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchNotifications = createAsyncThunk('notifications/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/notifications');
        return response.data.notifications;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const markRead = createAsyncThunk('notifications/markRead', async (id, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/notifications/${id}/read`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const markAllRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put('/notifications/read-all');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const deleteNotification = createAsyncThunk('notifications/delete', async (id, { rejectWithValue }) => {
    try {
        await axiosInstance.delete(`/notifications/${id}`);
        return id;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        items: [],
        unreadCount: 0,
        loading: false,
        error: null
    },
    reducers: {
        receiveNotification: (state, action) => {
            state.items.unshift(action.payload);
            state.unreadCount += 1;
        },
        clearNotifications: (state) => {
            state.items = [];
            state.unreadCount = 0;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
                state.unreadCount = action.payload.filter(n => !n.isRead).length;
            })
            .addCase(markRead.fulfilled, (state, action) => {
                const index = state.items.findIndex(n => n._id === action.payload._id);
                if (index !== -1 && !state.items[index].isRead) {
                    state.items[index].isRead = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            .addCase(markAllRead.fulfilled, (state) => {
                state.items.forEach(n => n.isRead = true);
                state.unreadCount = 0;
            })
            .addCase(deleteNotification.fulfilled, (state, action) => {
                const deletedId = action.payload;
                const notif = state.items.find(n => n._id === deletedId);
                if (notif && !notif.isRead) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
                state.items = state.items.filter(n => n._id !== deletedId);
            });
    }
});

export const { receiveNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
