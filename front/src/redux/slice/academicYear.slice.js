import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';
import { setActiveAcademicYearId, normalizeYearId, getActiveAcademicYearId } from '../../utils/academicYearContext';
import {
  fetchDashboard,
  fetchStudents,
  fetchFees,
  fetchFeeStructures,
  fetchExams,
  fetchFeeSummary,
  fetchAllTimetables,
  fetchHolidays,
  fetchAssignmentsOverview,
  fetchClasses,
  clearYearSensitiveData,
} from './schoolAdmin.slice';
import {
  fetchDashboard as fetchTeacherDashboard,
  fetchAssignedClasses,
  fetchAssignments as fetchTeacherAssignments,
} from './teacher.slice';
import {
  fetchFees as fetchAccountantFees,
  fetchFeeStructures as fetchAccountantFeeStructures,
  fetchFinancialReport,
  fetchPayroll,
} from './accountant.slice';

export const fetchAcademicYears = createAsyncThunk(
  'academicYear/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/academic-years');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

/** Refetch all data that depends on x-academic-year-id header */
export const refetchYearSensitiveData = createAsyncThunk(
  'academicYear/refetchSensitive',
  async (_, { dispatch, getState }) => {
    const role = getState().auth?.user?.role;
    const yearId = getActiveAcademicYearId();
    if (!yearId) return { role, skipped: true };

    dispatch(clearYearSensitiveData());

    const tasks = [];
    if (role === 'School_Admin') {
      tasks.push(
        dispatch(fetchDashboard()),
        dispatch(fetchStudents()),
        dispatch(fetchFees()),
        dispatch(fetchFeeStructures()),
        dispatch(fetchExams()),
        dispatch(fetchFeeSummary()),
        dispatch(fetchAllTimetables()),
        dispatch(fetchHolidays()),
        dispatch(fetchAssignmentsOverview()),
        dispatch(fetchClasses({ academicYearId: yearId })),
      );
    } else if (role === 'Teacher') {
      tasks.push(
        dispatch(fetchTeacherDashboard()),
        dispatch(fetchAssignedClasses()),
        dispatch(fetchTeacherAssignments()),
      );
    } else if (role === 'Accountant') {
      tasks.push(
        dispatch(fetchAccountantFees()),
        dispatch(fetchAccountantFeeStructures()),
        dispatch(fetchPayroll()),
        dispatch(fetchFinancialReport({})),
      );
    }

    await Promise.all(tasks);
    return { role, yearId };
  }
);

export const changeAcademicYear = createAsyncThunk(
  'academicYear/change',
  async (yearId, { dispatch }) => {
    setActiveAcademicYearId(yearId);
    dispatch(setActiveYear(yearId));
    await dispatch(refetchYearSensitiveData());
    return yearId;
  }
);

const stored = typeof window !== 'undefined' ? localStorage.getItem('activeAcademicYearId') : null;
if (stored) setActiveAcademicYearId(stored);

const initialState = {
  academicYears: [],
  activeAcademicYearId: stored || null,
  activeAcademicYear: null,
  loading: false,
  switching: false,
  error: null,
};

const academicYearSlice = createSlice({
  name: 'academicYear',
  initialState,
  reducers: {
    setActiveYear: (state, action) => {
      const id = normalizeYearId(action.payload);
      state.activeAcademicYearId = id || null;
      state.activeAcademicYear =
        state.academicYears.find((y) => normalizeYearId(y._id) === id) || null;
      setActiveAcademicYearId(id || null);
    },
    clearActiveYear: (state) => {
      state.activeAcademicYearId = null;
      state.activeAcademicYear = null;
      setActiveAcademicYearId(null);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAcademicYears.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAcademicYears.fulfilled, (state, action) => {
        state.loading = false;
        state.academicYears = action.payload || [];

        const list = state.academicYears;
        const storedId = normalizeYearId(state.activeAcademicYearId);
        const match = list.find((y) => normalizeYearId(y._id) === storedId);

        const pick = match || list.find((y) => y.isCurrent) || list[0];
        if (pick) {
          const id = normalizeYearId(pick._id);
          state.activeAcademicYearId = id;
          state.activeAcademicYear = pick;
          setActiveAcademicYearId(id);
        } else {
          state.activeAcademicYearId = null;
          state.activeAcademicYear = null;
          setActiveAcademicYearId(null);
        }
      })
      .addCase(fetchAcademicYears.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(changeAcademicYear.pending, (state) => {
        state.switching = true;
      })
      .addCase(changeAcademicYear.fulfilled, (state) => {
        state.switching = false;
      })
      .addCase(changeAcademicYear.rejected, (state) => {
        state.switching = false;
      })
      .addCase(refetchYearSensitiveData.pending, (state) => {
        state.switching = true;
      })
      .addCase(refetchYearSensitiveData.fulfilled, (state) => {
        state.switching = false;
      })
      .addCase(refetchYearSensitiveData.rejected, (state) => {
        state.switching = false;
      });
  },
});

export const { setActiveYear, clearActiveYear } = academicYearSlice.actions;
export default academicYearSlice.reducer;
