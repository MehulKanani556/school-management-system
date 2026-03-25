import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        profileModal: {
            open: false,
            userId: null,
            role: null
        }
    },
    reducers: {
        openProfileModal: (state, action) => {
            state.profileModal.open = true;
            state.profileModal.userId = action.payload; // Just the ID
        },
        closeProfileModal: (state) => {
            state.profileModal.open = false;
            state.profileModal.userId = null;
        }
    }
});

export const { openProfileModal, closeProfileModal } = uiSlice.actions;
export default uiSlice.reducer;
