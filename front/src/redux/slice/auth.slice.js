import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { BASE_URL } from '../../utils/BASE_URL';
import axios from 'axios';

const initialState = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
    message: null
};

const handleErrors = (error, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

export const login = createAsyncThunk(
    'auth/login',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/login`, data);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('userId', response.data.user._id);
            }
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const studentLogin = createAsyncThunk(
    'auth/studentLogin',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/student-login`, data);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('userId', response.data.user._id);
            }
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/register`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.data.accessToken) {
                localStorage.setItem('token', response.data.accessToken);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('userId', response.data.user._id);
            }
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async (email, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/forgot-password`, { email });
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async ({ email, otp }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/verify`, { email, otp });
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async ({ email, newPassword }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/change-password`, { email, newPassword });
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.clear();
            state.message = "Logged out successfully";
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
            localStorage.setItem('user', JSON.stringify(state.user));
        },
        clearMessage: (state) => {

            state.message = null;
            state.error = null;
        },
        clearAuthError: (state) => {
            state.error = null;
        },
        clearAuthMessage: (state) => {
            state.message = null;
        }
    },

    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.user = action.payload?.user || null;
                state.token = action.payload?.token || null;
                state.isAuthenticated = true;
                state.loading = false;
                state.error = null;
                state.message = action.payload?.message || "Login successfully";
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.error = action.payload?.message || "Login Failed";
            })
            // Student Login
            .addCase(studentLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(studentLogin.fulfilled, (state, action) => {
                state.user = action.payload?.user || null;
                state.token = action.payload?.token || null;
                state.isAuthenticated = true;
                state.loading = false;
                state.error = null;
                state.message = action.payload?.message || "Student Session Initialized";
            })
            .addCase(studentLogin.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.error = action.payload?.message || "Student Access Denied";
            })
            // Register
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.user = action.payload?.user || null;
                state.token = action.payload?.accessToken || null;
                state.isAuthenticated = true;
                state.loading = false;
                state.error = null;
                state.message = action.payload?.message || "Register successfully";
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.error = action.payload?.message || "Registration Failed";
            })
            // Forgot Password
            .addCase(forgotPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(forgotPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.message = action.payload?.message || "Email Sent Successfully...";
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Forgot Password Failed";
            })
            // Verify OTP
            .addCase(verifyOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.message = action.payload?.message || "Otp Verify SuccessFully...";
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Verify OTP Failed";
            })
            // Reset Password
            .addCase(resetPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.message = action.payload?.message || "Password Changed SuccessFully...";
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Reset Password Failed";
            });
    }
});

export const { logout, updateUser, clearAuthError, clearAuthMessage } = authSlice.actions;
export default authSlice.reducer;

