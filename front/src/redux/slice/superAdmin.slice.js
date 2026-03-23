import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchPlatformAnalytics = createAsyncThunk(
    'superAdmin/fetchAnalytics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/superadmin/analytics');
            return response.data.analytics;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const fetchAuditLogs = createAsyncThunk(
    'superAdmin/fetchAuditLogs',
    async (params, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/superadmin/audit-logs', { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const fetchSystemSettings = createAsyncThunk(
    'superAdmin/fetchSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/superadmin/settings');
            return response.data.settings;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const updateSystemSetting = createAsyncThunk(
    'superAdmin/updateSetting',
    async (settingData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/superadmin/settings', settingData);
            return response.data.setting;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const fetchAdminProfile = createAsyncThunk(
    'superAdmin/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/superadmin/profile');
            return response.data.user;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const updateAdminProfile = createAsyncThunk(
    'superAdmin/updateProfile',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put('/superadmin/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data.user;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

const superAdminSlice = createSlice({
    name: 'superAdmin',
    initialState: {
        analytics: null,
        auditLogs: [],
        logsPagination: null,
        settings: [],
        profile: null,
        loading: false,
        error: null,
        success: null,
    },
    reducers: {
        clearStatus: (state) => {
            state.error = null;
            state.success = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Analytics
            .addCase(fetchPlatformAnalytics.pending, (state) => { state.loading = true; })
            .addCase(fetchPlatformAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.analytics = action.payload;
            })
            // Audit Logs
            .addCase(fetchAuditLogs.fulfilled, (state, action) => {
                state.auditLogs = action.payload.logs;
                state.logsPagination = action.payload.pagination;
            })
            // Settings
            .addCase(fetchSystemSettings.fulfilled, (state, action) => {
                state.settings = action.payload;
            })
            .addCase(updateSystemSetting.fulfilled, (state, action) => {
                const index = state.settings.findIndex(s => s.key === action.payload.key);
                if (index !== -1) state.settings[index] = action.payload;
                else state.settings.push(action.payload);
                state.success = 'Setting updated successfully';
            })
            // Profile
            .addCase(fetchAdminProfile.fulfilled, (state, action) => {
                state.profile = action.payload;
            })
            .addCase(updateAdminProfile.fulfilled, (state, action) => {
                state.profile = action.payload;
                state.success = 'Profile updated successfully';
            })
            // Common Error Handling
            .addMatcher(
                (action) => action.type.endsWith('/rejected'),
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            );
    }
});

export const { clearStatus } = superAdminSlice.actions;
export default superAdminSlice.reducer;
