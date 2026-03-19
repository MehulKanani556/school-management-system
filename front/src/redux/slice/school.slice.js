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
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data.school;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const updateSchool = createAsyncThunk('school/update', async ({ id, formData }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/superadmin/update-school/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data.school;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const deleteSchool = createAsyncThunk('school/delete', async (id, { rejectWithValue }) => {
    try {
        await axiosInstance.delete(`/superadmin/delete-school/${id}`);
        return id;
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
        error: null
    },
    reducers: {
        clearSchoolError: (state) => {
            state.error = null;
        }
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
                state.schools.unshift(action.payload);
            })
            .addCase(createSchool.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(updateSchool.fulfilled, (state, action) => {
                const index = state.schools.findIndex(s => s._id === action.payload._id);
                if (index !== -1) {
                    state.schools[index] = action.payload;
                }
            })
            .addCase(updateSchool.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(deleteSchool.fulfilled, (state, action) => {
                state.schools = state.schools.filter(s => s._id !== action.payload);
            })
            .addCase(deleteSchool.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(fetchStats.fulfilled, (state, action) => {
                state.stats = action.payload;
            });
    }
});

export const { clearSchoolError } = schoolSlice.actions;
export default schoolSlice.reducer;
