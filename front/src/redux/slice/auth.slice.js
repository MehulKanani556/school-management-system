import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { BASE_URL } from '../../utils/BASE_URL';
import axios from 'axios';

const initialState = {
    user: null,
    isAuthenticated: !!sessionStorage.getItem('token') && sessionStorage.getItem('role') === 'admin',
    loading: false,
    error: null,
    loggedIn: false,
    isLoggedOut: false,
    message: null
};
const handleErrors = (error, dispatch, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || 'An error occurred';

    return rejectWithValue(error.response?.data || { message: errorMessage });
};
export const login = createAsyncThunk(
    'auth/login',
    async(data,{rejectWithValue})=>{
        try {
            try {
                const response = await axios.post(`${BASE_URL}/usrLogin`, data);
                sessionStorage.setItem('token', response.data.token);
                sessionStorage.setItem('userId', response.data.user._id);
                console.log(response.data)
                return response.data;
            } catch (error) {
                return handleErrors(error, null, rejectWithValue);
            }
        } catch (error) {

        }
    }
)
export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/register`, userData);
            sessionStorage.setItem('token', response.data.token);
            sessionStorage.setItem('userId', response.data.user._id);
            return response.data;
        } catch (error) {
            return handleErrors(error, null, rejectWithValue);
        }
    }
);

export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async (email, { rejectWithValue }) => {
        try {
            console.log(email);
            const response = await axios.post(`${BASE_URL}/forgot-password`, { email });
            if (response.status === 200) {
                return response.data; // Assuming the API returns a success message
            }
        } catch (error) {
            return handleErrors(error, null, rejectWithValue);
        }
    }
);

export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async ({ email, otp }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/verify`, { email, otp });
            if (response.status === 200) {
                return response.data; // Assuming the API returns a success message
            }
        } catch (error) {
            return handleErrors(error, null, rejectWithValue);
        }
    }
);

export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async ({ email, newPassword }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/change-password`, { email, newPassword });
            if (response.status === 200) {
                return response.data; // Assuming the API returns a success message
            }
        } catch (error) {
            return handleErrors(error, null, rejectWithValue);
        }
    }
);
export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},

    extraReducers: (builder) => {
        builder

        .addCase(login.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.message = null;
        })
        .addCase(login.fulfilled, (state, action) => {
            state.user = action.payload?.user || null;
            state.isAuthenticated = true;
            state.loading = false;
            state.error = null;
            state.message = action.payload?.message || "Login successfully";
        })
        .addCase(login.rejected, (state, action) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.error = action.payload?.message || "Login Failed";
            state.message = action.payload?.message || "Login Failed";
        })
        .addCase(register.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.message = null;
        })
        .addCase(register.fulfilled, (state, action) => {
            state.user = action.payload?.user || null;
            state.isAuthenticated = true;
            state.loading = false;
            state.error = null;
            state.message = action.payload?.message || "Register successfully";
        })
        .addCase(register.rejected, (state, action) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.error = action.payload?.message || "User Already Exist";
            state.message = action.payload?.message || "User Already Exist";
        })
        .addCase(forgotPassword.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.message = null;
        })
        .addCase(forgotPassword.fulfilled, (state, action) => {
            state.loading = false;
            state.error = null;
            state.message = action.payload?.message || action.payload?.message || "Email Sent Successfully...";
        })
        .addCase(forgotPassword.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || "Forgot Password Failed";
            state.message = action.payload?.message || "Forgot Password Failed";
        })
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
            state.message = action.payload?.message || "Verify OTP Failed";
        })
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
            state.message = action.payload?.message || "Reset Password Failed";
        })

    }

});

export default authSlice.reducer;
