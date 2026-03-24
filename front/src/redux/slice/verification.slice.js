import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../utils/BASE_URL';


export const verifyIdentity = createAsyncThunk(
  'verification/verifyIdentity',
  async ({ type, id }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/public/verify/${type}/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Verification pipeline offline');
    }
  }
);

const verificationSlice = createSlice({
  name: 'verification',
  initialState: {
    record: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearVerification: (state) => {
      state.record = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyIdentity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyIdentity.fulfilled, (state, action) => {
        state.loading = false;
        state.record = action.payload;
        state.error = null;
      })
      .addCase(verifyIdentity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.record = null;
      });
  },
});

export const { clearVerification } = verificationSlice.actions;
export default verificationSlice.reducer;
