import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchVehicles = createAsyncThunk(
    'transport/fetchVehicles',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/transport/vehicles');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const addVehicleSlice = createAsyncThunk(
    'transport/addVehicle',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/transport/vehicles', data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const updateVehicleSlice = createAsyncThunk(
    'transport/updateVehicle',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/transport/vehicles/${id}`, data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const deleteVehicleSlice = createAsyncThunk(
    'transport/deleteVehicle',
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/transport/vehicles/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const fetchRoutesSlice = createAsyncThunk(
    'transport/fetchRoutes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/transport/routes');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const addRouteSlice = createAsyncThunk(
    'transport/addRoute',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/transport/routes', data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const updateRouteSlice = createAsyncThunk(
    'transport/updateRoute',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/transport/routes/${id}`, data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const deleteRouteSlice = createAsyncThunk(
    'transport/deleteRoute',
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/transport/routes/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const assignStudentSlice = createAsyncThunk(
    'transport/assignStudent',
    async ({ routeId, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/transport/routes/${routeId}/assign-student`, data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

const transportSlice = createSlice({
    name: 'transport',
    initialState: {
        vehicles: [],
        routes: [],
        loading: false,
        error: null,
        success: null
    },
    reducers: {
        clearStatus: (state) => {
            state.error = null;
            state.success = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchVehicles.fulfilled, (state, action) => {
                state.vehicles = action.payload;
            })
            .addCase(addVehicleSlice.fulfilled, (state, action) => {
                state.vehicles.unshift(action.payload);
                state.success = 'Vehicle added';
            })
            .addCase(updateVehicleSlice.fulfilled, (state, action) => {
                const index = state.vehicles.findIndex(v => v._id === action.payload._id);
                if (index !== -1) state.vehicles[index] = action.payload;
                state.success = 'Vehicle updated';
            })
            .addCase(deleteVehicleSlice.fulfilled, (state, action) => {
                state.vehicles = state.vehicles.filter(v => v._id !== action.payload);
                state.success = 'Vehicle deleted';
            })
            .addCase(fetchRoutesSlice.fulfilled, (state, action) => {
                state.routes = action.payload;
            })
            .addCase(addRouteSlice.fulfilled, (state, action) => {
                state.routes.unshift(action.payload);
                state.success = 'Route created';
            })
            .addCase(updateRouteSlice.fulfilled, (state, action) => {
                const index = state.routes.findIndex(r => r._id === action.payload._id);
                if (index !== -1) state.routes[index] = action.payload;
                state.success = 'Route updated';
            })
            .addCase(deleteRouteSlice.fulfilled, (state, action) => {
                state.routes = state.routes.filter(r => r._id !== action.payload);
                state.success = 'Route deleted';
            })
            .addCase(assignStudentSlice.fulfilled, (state, action) => {
                const index = state.routes.findIndex(r => r._id === action.payload._id);
                if (index !== -1) state.routes[index] = action.payload;
                state.success = 'Student assigned';
            })
            .addMatcher(
                (action) => action.type.endsWith('/rejected'),
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            );
    }
});

export const { clearStatus } = transportSlice.actions;
export default transportSlice.reducer;
