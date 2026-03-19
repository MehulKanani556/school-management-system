import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchSchools = createAsyncThunk('school/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/superadmin/all-schools');
        return response.data.schools;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const createSchool = createAsyncThunk('school/create', async (formData, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/superadmin/create-school', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const updateSchool = createAsyncThunk('school/update', async ({ id, formData }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/superadmin/update-school/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const deleteSchool = createAsyncThunk('school/delete', async (id, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.delete(`/superadmin/delete-school/${id}`);
        return { id, ...response.data };
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchStats = createAsyncThunk('school/fetchStats', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/superadmin/stats');
        return response.data.stats;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

const schoolSlice = createSlice({
    name: 'school',
    initialState: {
        schools: [],
        stats: {
            totalSchools: 0,
            activeSchools: 0,
            totalRevenue: 0
        },
        loading: false,
        error: null,
        message: null
    },
    reducers: {
        clearSchoolError: (state) => { state.error = null; },
        clearSchoolMessage: (state) => { state.message = null; },
        setSchoolError: (state, action) => { state.error = action.payload; },
        setSchoolMessage: (state, action) => { state.message = action.payload; }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSchools.pending, (state) => { state.loading = true; })
            .addCase(fetchSchools.fulfilled, (state, action) => {
                state.loading = false;
                state.schools = action.payload;
            })
            .addCase(fetchSchools.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createSchool.fulfilled, (state, action) => {
                const school = action.payload.school || action.payload;
                state.schools.unshift(school);
                state.message = action.payload.message || "Institutional node deployed";
            })
            .addCase(createSchool.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(updateSchool.fulfilled, (state, action) => {
                const school = action.payload.school || action.payload;
                const index = state.schools.findIndex(s => s._id === school._id);
                if (index !== -1) {
                    state.schools[index] = school;
                }
                state.message = action.payload.message || "Node mapping synchronized";
            })
            .addCase(updateSchool.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(deleteSchool.fulfilled, (state, action) => {
                state.schools = state.schools.filter(s => s._id !== action.payload.id);
                state.message = action.payload.message || "Instance decommissioned";
            })
            .addCase(deleteSchool.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(fetchStats.fulfilled, (state, action) => {
                state.stats = action.payload;
            });
    }
});

export const { clearSchoolError, clearSchoolMessage, setSchoolError, setSchoolMessage } = schoolSlice.actions;
export default schoolSlice.reducer;
