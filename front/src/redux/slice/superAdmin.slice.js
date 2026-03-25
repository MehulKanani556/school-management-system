import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

const saGet = (name, path) =>
    createAsyncThunk(name, async (params, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/superadmin${path}`, { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    });

export const fetchPlatformAnalytics = saGet('superAdmin/fetchAnalytics', '/analytics');
export const fetchAuditLogs = saGet('superAdmin/fetchAuditLogs', '/audit-logs');
export const fetchSystemSettings = saGet('superAdmin/fetchSettings', '/settings');

export const updateSystemSetting = createAsyncThunk(
    'superAdmin/updateSetting',
    async (settingData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/superadmin/settings', settingData);
            return response.data.setting;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchAdminProfile = saGet('superAdmin/fetchProfile', '/profile');

export const updateAdminProfile = createAsyncThunk(
    'superAdmin/updateProfile',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put('/superadmin/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Revenue
export const fetchRevenueAnalytics = saGet('superAdmin/fetchRevenue', '/revenue');

// Security
export const fetchSecurityOverview = saGet('superAdmin/fetchSecurity', '/security-overview');

// Users
export const fetchPlatformUsers = saGet('superAdmin/fetchUsers', '/users');

// Tickets
export const fetchTickets = saGet('superAdmin/fetchTickets', '/tickets');
export const updateTicketStatus = createAsyncThunk(
    'superAdmin/updateTicketStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.put(`/superadmin/tickets/${id}/status`, { status });
            return res.data.ticket;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);
export const replyToTicket = createAsyncThunk(
    'superAdmin/replyToTicket',
    async ({ id, message }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post(`/superadmin/tickets/${id}/reply`, { message });
            return res.data.ticket;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Backups
export const fetchBackups = saGet('superAdmin/fetchBackups', '/backups');
export const triggerBackup = createAsyncThunk(
    'superAdmin/triggerBackup',
    async (data, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post('/superadmin/backups/trigger', data);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Holidays
export const fetchGlobalHolidays = createAsyncThunk(
    'superAdmin/fetchHolidays',
    async (_, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get('/holidays');
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const createGlobalHoliday = createAsyncThunk(
    'superAdmin/createHoliday',
    async (data, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post('/superadmin/holidays', data);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updateGlobalHoliday = createAsyncThunk(
    'superAdmin/updateHoliday',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.put(`/superadmin/holidays/${id}`, data);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const deleteGlobalHoliday = createAsyncThunk(
    'superAdmin/deleteHoliday',
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/superadmin/holidays/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Schools (Existing functionality often handled by fetchSchools, let's keep it consistent)
export const fetchAllSchools = saGet('superAdmin/fetchAllSchools', '/all-schools');

// User Management Actions
export const updateUserStatus = createAsyncThunk(
    'superAdmin/updateUserStatus',
    async ({ id, isActive }, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.put(`/superadmin/users/${id}/status`, { isActive });
            return { id, isActive, message: res.data.message };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const deletePlatformUser = createAsyncThunk(
    'superAdmin/deleteUser',
    async (id, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.delete(`/superadmin/users/${id}`);
            return { id, message: res.data.message };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Messaging thunks
export const fetchMessageHistory = createAsyncThunk(
    'superAdmin/fetchMessageHistory',
    async (recipientId, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get(`/superadmin/messages/${recipientId}`);
            return res.data.messages;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
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
        revenue: null,
        security: null,
        users: [],
        usersPagination: null,
        tickets: [],
        backups: [],
        holidays: [],
        schools: [],
        messages: [],
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
        const setPending = (state) => { state.loading = true; state.error = null; };
        const setFulfilled = (key) => (state, action) => {
            state.loading = false;
            state[key] = action.payload.data || action.payload;
        };

        builder
            .addCase(fetchPlatformAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.analytics = action.payload.analytics || action.payload;
            })
            .addCase(fetchAuditLogs.fulfilled, (state, action) => {
                state.loading = false;
                state.auditLogs = action.payload.logs;
                state.logsPagination = action.payload.pagination;
            })
            .addCase(fetchSystemSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload.settings || [];
            })

            .addCase(updateSystemSetting.fulfilled, (state, action) => {
                const index = state.settings.findIndex(s => s.key === action.payload.key);
                if (index !== -1) state.settings[index] = action.payload;
                else state.settings.push(action.payload);
                state.success = 'Setting updated successfully';
            })
            .addCase(fetchAdminProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload.user || action.payload;
            })
            .addCase(updateAdminProfile.fulfilled, (state, action) => {
                state.profile = action.payload;
                state.success = 'Profile updated successfully';
            })


            .addCase(fetchRevenueAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.revenue = action.payload;
            })
            .addCase(fetchSecurityOverview.fulfilled, (state, action) => {
                state.loading = false;
                state.security = action.payload;
            })

            .addCase(fetchPlatformUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.users;
                state.usersPagination = action.payload.pagination;
            })
            .addCase(fetchTickets.fulfilled, (state, action) => {
                state.loading = false;
                state.tickets = action.payload.tickets || [];
            })

            .addCase(updateTicketStatus.fulfilled, (state, action) => {
                const idx = state.tickets.findIndex(t => t._id === action.payload._id);
                if (idx !== -1) state.tickets[idx] = action.payload;
                state.success = 'Ticket status updated';
            })
            .addCase(replyToTicket.fulfilled, (state, action) => {
                const idx = state.tickets.findIndex(t => t._id === action.payload._id);
                if (idx !== -1) state.tickets[idx] = action.payload;
                state.success = 'Reply sent successfully';
            })
            .addCase(fetchBackups.fulfilled, (state, action) => {
                state.loading = false;
                state.backups = action.payload.backups || [];
            })

            .addCase(triggerBackup.fulfilled, (state, action) => {
                state.backups.unshift(action.payload.backup);
                state.success = action.payload.message;
            })
            .addCase(fetchGlobalHolidays.fulfilled, (state, action) => {
                state.loading = false;
                state.holidays = action.payload.holidays || action.payload.data || [];
            })
            .addCase(createGlobalHoliday.fulfilled, (state, action) => {
                state.holidays.push(action.payload.data || action.payload);
                state.success = 'Holiday created successfully';
            })
            .addCase(updateGlobalHoliday.fulfilled, (state, action) => {
                const upd = action.payload.data || action.payload;
                const i = state.holidays.findIndex(h => h._id === upd._id);
                if (i !== -1) state.holidays[i] = upd;
                state.success = 'Holiday updated successfully';
            })
            .addCase(deleteGlobalHoliday.fulfilled, (state, action) => {
                state.holidays = state.holidays.filter(h => h._id !== action.payload);
                state.success = 'Holiday removed';
            })
            .addCase(fetchAllSchools.fulfilled, (state, action) => {
                state.loading = false;
                state.schools = action.payload.schools || action.payload.data || [];
            })
            .addCase(updateUserStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.success = action.payload.message;
                const index = state.users.findIndex(u => u._id === action.payload.id);
                if (index !== -1) state.users[index].isActive = action.payload.isActive;
            })
            .addCase(deletePlatformUser.fulfilled, (state, action) => {
                state.loading = false;
                state.success = action.payload.message;
                state.users = state.users.filter(u => u._id !== action.payload.id);
            })
            .addCase(fetchMessageHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.messages = action.payload;
            })
            // Common Loading State
            .addMatcher(
                (action) => action.type.endsWith('/pending'),
                setPending
            )
            // Common Error Handling
            .addMatcher(
                (action) => action.type.endsWith('/rejected'),
                (state, action) => {
                    state.loading = false;
                    const payload = action.payload;
                    let errorMsg = 'Error';
                    
                    if (typeof payload === 'string') {
                        errorMsg = payload;
                    } else if (payload && typeof payload.message === 'string') {
                        errorMsg = payload.message;
                    } else if (action.error && typeof action.error.message === 'string') {
                        errorMsg = action.error.message;
                    } else if (payload && typeof payload === 'object') {
                        errorMsg = JSON.stringify(payload);
                    }
                    
                    state.error = errorMsg;
                }
            );
    }
});

export const { clearStatus } = superAdminSlice.actions;
export default superAdminSlice.reducer;
