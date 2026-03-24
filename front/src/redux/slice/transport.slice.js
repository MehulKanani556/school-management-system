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

export const addMaintenanceSlice = createAsyncThunk(
    'transport/addMaintenance',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/transport/vehicles/${id}/maintenance`, data);
            return response.data.data;
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

export const unassignStudentSlice = createAsyncThunk(
    'transport/unassignStudent',
    async ({ routeId, studentId }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/transport/routes/${routeId}/unassign-student`, { studentId });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const addFuelLogSlice = createAsyncThunk(
    'transport/addFuelLog',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/transport/vehicles/${id}/fuel-logs`, data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const addInsuranceRenewalSlice = createAsyncThunk(
    'transport/addInsuranceRenewal',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/transport/vehicles/${id}/insurance-renewals`, data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const updateVehicleLocationSlice = createAsyncThunk(
    'transport/updateVehicleLocation',
    async ({ id, lat, lng }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/transport/vehicles/${id}/location`, { lat, lng });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

// Drivers
export const fetchDriversSlice = createAsyncThunk(
    'transport/fetchDrivers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/transport/drivers');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const addDriverSlice = createAsyncThunk(
    'transport/addDriver',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/transport/drivers', data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const updateDriverSlice = createAsyncThunk(
    'transport/updateDriver',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/transport/drivers/${id}`, data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const deleteDriverSlice = createAsyncThunk(
    'transport/deleteDriver',
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/transport/drivers/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

// Trip Logs
export const fetchTripLogsSlice = createAsyncThunk(
    'transport/fetchTripLogs',
    async (params, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/transport/trip-logs', { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const recordTripSlice = createAsyncThunk(
    'transport/recordTrip',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/transport/trip-logs', data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const updateTripStatusSlice = createAsyncThunk(
    'transport/updateTripStatus',
    async ({ id, status, delayReason }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/transport/trip-logs/${id}/status`, { status, delayReason });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const toggleBoardingSlice = createAsyncThunk(
    'transport/toggleBoarding',
    async ({ id, studentId, boarded }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/transport/trip-logs/${id}/toggle-boarding`, { studentId, boarded });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const fetchTransportAnalyticsSlice = createAsyncThunk(
    'transport/fetchAnalytics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/transport/analytics');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const bulkAssignStudentSlice = createAsyncThunk(
    'transport/bulkAssignStudent',
    async ({ routeId, studentIds, pickupStop, dropoffStop }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/transport/routes/${routeId}/bulk-assign`, { studentIds, pickupStop, dropoffStop });
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
        drivers: [],
        tripLogs: [],
        analytics: null,
        loading: false,
        error: null,
        message: null
    },
    reducers: {
        clearTransportMessage: (state) => {
            state.error = null;
            state.message = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchVehicles.fulfilled, (state, action) => {
                state.vehicles = action.payload;
                state.loading = false;
            })
            .addCase(addVehicleSlice.fulfilled, (state, action) => {
                state.vehicles.unshift(action.payload);
                state.message = 'Vehicle asset registered';
            })
            .addCase(updateVehicleSlice.fulfilled, (state, action) => {
                const index = state.vehicles.findIndex(v => v._id === action.payload._id);
                if (index !== -1) state.vehicles[index] = action.payload;
                state.message = "Vehicle identity synchronized";
            })
            .addCase(addMaintenanceSlice.fulfilled, (state, action) => {
                const index = state.vehicles.findIndex(v => v._id === action.payload._id);
                if (index !== -1) {
                    state.vehicles[index] = action.payload;
                }
                state.message = 'Maintenance record synthesized';
            })
            .addCase(addFuelLogSlice.fulfilled, (state, action) => {
                const index = state.vehicles.findIndex(v => v._id === action.payload._id);
                if (index !== -1) {
                    state.vehicles[index] = { ...state.vehicles[index], ...action.payload };
                }
                state.message = 'Fuel allocation logged';
            })
            .addCase(addInsuranceRenewalSlice.fulfilled, (state, action) => {
                const index = state.vehicles.findIndex(v => v._id === action.payload._id);
                if (index !== -1) {
                    state.vehicles[index] = { ...state.vehicles[index], ...action.payload };
                }
                state.message = 'Insurance matrix updated';
            })
            .addCase(updateVehicleLocationSlice.fulfilled, (state, action) => {
                const index = state.vehicles.findIndex(v => v._id === action.payload._id);
                if (index !== -1) {
                    state.vehicles[index] = { ...state.vehicles[index], ...action.payload };
                }
                // No toast for location updates to avoid spam
            })
            .addCase(deleteVehicleSlice.fulfilled, (state, action) => {
                state.vehicles = state.vehicles.filter(v => v._id !== action.payload);
                state.message = 'Mobility unit decommissioned';
            })
            .addCase(fetchRoutesSlice.fulfilled, (state, action) => {
                state.routes = action.payload;
            })
            .addCase(addRouteSlice.fulfilled, (state, action) => {
                state.routes.unshift(action.payload);
                state.message = 'Mobility matrix created';
            })
            .addCase(updateRouteSlice.fulfilled, (state, action) => {
                const index = state.routes.findIndex(r => r._id === action.payload._id);
                if (index !== -1) state.routes[index] = action.payload;
                state.message = 'Route vector updated';
            })
            .addCase(deleteRouteSlice.fulfilled, (state, action) => {
                state.routes = state.routes.filter(r => r._id !== action.payload);
                state.message = 'Route vector purged';
            })
            .addCase(assignStudentSlice.fulfilled, (state, action) => {
                const index = state.routes.findIndex(r => r._id === action.payload._id);
                if (index !== -1) state.routes[index] = action.payload;
                state.message = 'Entity displacement assigned';
            })
            .addCase(unassignStudentSlice.fulfilled, (state, action) => {
                const index = state.routes.findIndex(r => r._id === action.payload._id);
                if (index !== -1) state.routes[index] = action.payload;
                state.message = 'Entity displacement unassigned';
            })
            .addCase(bulkAssignStudentSlice.fulfilled, (state, action) => {
                const index = state.routes.findIndex(r => r._id === action.payload._id);
                if (index !== -1) state.routes[index] = action.payload;
                state.message = 'Bulk allocation synthesized';
            })
            // Drivers
            .addCase(fetchDriversSlice.fulfilled, (state, action) => {
                state.drivers = action.payload;
            })
            .addCase(addDriverSlice.fulfilled, (state, action) => {
                state.drivers.unshift(action.payload);
                state.message = 'Operator profile registered';
            })
            .addCase(updateDriverSlice.fulfilled, (state, action) => {
                const index = state.drivers.findIndex(d => d._id === action.payload._id);
                if (index !== -1) state.drivers[index] = action.payload;
                state.message = 'Operator profile updated';
            })
            .addCase(deleteDriverSlice.fulfilled, (state, action) => {
                state.drivers = state.drivers.filter(d => d._id !== action.payload);
                state.message = 'Operator profile terminated';
            })
            // Trip Logs
            .addCase(fetchTripLogsSlice.fulfilled, (state, action) => {
                state.tripLogs = action.payload;
            })
            .addCase(recordTripSlice.fulfilled, (state, action) => {
                state.tripLogs.unshift(action.payload);
                state.message = 'Transit sequence recorded';
            })
            .addCase(updateTripStatusSlice.fulfilled, (state, action) => {
                const index = state.tripLogs.findIndex(l => l._id === action.payload._id);
                if (index !== -1) state.tripLogs[index] = action.payload;
                state.message = `Sequence status: ${action.payload.status}`;
            })
            .addCase(toggleBoardingSlice.fulfilled, (state, action) => {
                const index = state.tripLogs.findIndex(l => l._id === action.payload._id);
                if (index !== -1) state.tripLogs[index] = action.payload;
            })
            // Analytics
            .addCase(fetchTransportAnalyticsSlice.fulfilled, (state, action) => {
                state.analytics = action.payload;
                state.loading = false;
            })
            .addMatcher(
                (action) => action.type.endsWith('/pending'),
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                (action) => action.type.endsWith('/fulfilled'),
                (state) => {
                    state.loading = false;
                }
            )
            .addMatcher(
                (action) => action.type.endsWith('/rejected'),
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            );
    }
});

export const { clearTransportMessage } = transportSlice.actions;
export default transportSlice.reducer;
