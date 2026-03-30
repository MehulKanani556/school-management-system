import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchAcademicYears = createAsyncThunk(
  'academicYear/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/school-admin/academic-years');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  academicYears: [],
  activeAcademicYearId: localStorage.getItem('activeAcademicYearId') || null,
  activeAcademicYear: null,
  loading: false,
  error: null,
};

const academicYearSlice = createSlice({
  name: 'academicYear',
  initialState,
  reducers: {
    setActiveYear: (state, action) => {
      state.activeAcademicYearId = action.payload;
      state.activeAcademicYear = state.academicYears.find(y => y._id === action.payload) || null;
      localStorage.setItem('activeAcademicYearId', action.payload);
      // Optional: Force reload or notify application to refetch data
    },
    clearActiveYear: (state) => {
      state.activeAcademicYearId = null;
      state.activeAcademicYear = null;
      localStorage.removeItem('activeAcademicYearId');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAcademicYears.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAcademicYears.fulfilled, (state, action) => {
        state.loading = false;
        state.academicYears = action.payload;
        if (!state.activeAcademicYearId && action.payload.length > 0) {
          const current = action.payload.find(y => y.isCurrent) || action.payload[0];
          state.activeAcademicYearId = current._id;
          state.activeAcademicYear = current;
          localStorage.setItem('activeAcademicYearId', current._id);
        } else if (state.activeAcademicYearId) {
          state.activeAcademicYear = action.payload.find(y => y._id === state.activeAcademicYearId) || null;
        }
      })
      .addCase(fetchAcademicYears.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setActiveYear, clearActiveYear } = academicYearSlice.actions;
export default academicYearSlice.reducer;
