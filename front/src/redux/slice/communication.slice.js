import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    unreadCount: 0,
    lastMessage: null,
    hasNew: false
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
            state.hasNew = true;
        },
        resetUnreadCount: (state) => {
            state.unreadCount = 0;
            state.hasNew = false;
        },
        setLastMessage: (state, action) => {
            state.lastMessage = action.payload;
        }
    }
});

export const { setUnreadCount, incrementUnreadCount, resetUnreadCount, setLastMessage } = communicationSlice.actions;
export default communicationSlice.reducer;
