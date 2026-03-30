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
    notices: [],
    unreadCount: 0,
    lastMessage: null,
    loading: false,
    error: null
};

export const fetchMyMessages = createAsyncThunk('communication/fetchMessages', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/my-messages');
        return response.data;
    } catch (error) { return rejectWithValue(error.response.data.message); }
});

export const fetchNotices = createAsyncThunk('communication/fetchNotices', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/notices');
        return response.data;
    } catch (error) { return rejectWithValue(error.response.data.message); }
});

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
        addCommunicationMessage: (state, action) => {
            const msg = action.payload;
            if (msg.type === 'Notice') {
                state.notices = [msg, ...state.notices];
            } else if (msg.type === 'Announcement' || msg.type === 'DirectMessage') {
                state.messages = [msg, ...state.messages];
            }
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
                state.messages = action.payload.reverse(); 
            })
            .addCase(sendMessageSlice.fulfilled, (state, action) => {
                const msg = action.payload.data || action.payload;
                if (msg.type === 'Notice') state.notices = [msg, ...state.notices];
                else state.messages = [msg, ...state.messages];
            })
            .addCase(fetchMyMessages.fulfilled, (state, action) => {
                state.messages = action.payload;
                state.loading = false;
            })
            .addCase(fetchNotices.fulfilled, (state, action) => {
                state.notices = action.payload;
                state.loading = false;
            });
    }
});

export const { setUnreadCount, incrementUnreadCount, resetUnreadCount, addCommunicationMessage } = communicationSlice.actions;
export default communicationSlice.reducer;

