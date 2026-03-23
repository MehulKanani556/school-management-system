import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchContacts = createAsyncThunk(
    'communication/fetchContacts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/contacts');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const fetchChatHistory = createAsyncThunk(
    'communication/fetchChatHistory',
    async (otherUserId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/chat-history/${otherUserId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const sendMessageSlice = createAsyncThunk(
    'communication/sendMessage',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/my-messages', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

const initialState = {
    contacts: [],
    messages: [],
    unreadCount: 0,
    lastMessage: null,
    loading: false,
    error: null
};

const communicationSlice = createSlice({
    name: 'communication',
    initialState,
    reducers: {
        setUnreadCount: (state, action) => {
            state.unreadCount = action.payload;
        },
        incrementUnreadCount: (state) => {
            state.unreadCount += 1;
        },
        resetUnreadCount: (state) => {
            state.unreadCount = 0;
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchContacts.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchContacts.fulfilled, (state, action) => {
                state.loading = false;
                state.contacts = action.payload;
            })
            .addCase(fetchChatHistory.fulfilled, (state, action) => {
                state.messages = action.payload.reverse(); // Order for UI
            })
            .addCase(sendMessageSlice.fulfilled, (state, action) => {
                state.messages.push(action.payload);
            });
    }
});

export const { setUnreadCount, incrementUnreadCount, resetUnreadCount, addMessage } = communicationSlice.actions;
export default communicationSlice.reducer;
