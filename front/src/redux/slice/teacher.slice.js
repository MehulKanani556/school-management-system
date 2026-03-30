import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchDashboard = createAsyncThunk('teacher/fetchDashboard', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/teacher/dashboard');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchAssignedClasses = createAsyncThunk('teacher/fetchClasses', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/teacher/assigned-classes');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchClassStudents = createAsyncThunk('teacher/fetchStudents', async (classId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/teacher/assigned-students/${classId}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const generateRollNumbers = createAsyncThunk('teacher/generateRollNumbers', async (classId, { rejectWithValue, dispatch }) => {
    try {
        const response = await axiosInstance.post(`/teacher/generate-roll-numbers/${classId}`);
        dispatch(fetchClassStudents(classId));
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchStudentDetail = createAsyncThunk('teacher/fetchStudentDetail', async (studentId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/teacher/student-detail/${studentId}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchSubmissions = createAsyncThunk('teacher/fetchSubmissions', async (assignmentId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/teacher/assignments/${assignmentId}/submissions`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchPayroll = createAsyncThunk('teacher/fetchPayroll', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/teacher/payroll');
        return response.data;
    } catch (error) { return rejectWithValue(error.response.data.message); }
});

export const gradeSubmissionThunk = createAsyncThunk('teacher/gradeSubmission', async ({ id, score, feedback }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/teacher/grade-submission/${id}`, { score, feedback });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const submitAttendance = createAsyncThunk('teacher/markAttendance', async (data, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/teacher/mark-attendance', data);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const submitMarks = createAsyncThunk('teacher/addMarks', async (data, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/teacher/add-marks', data);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const uploadAssignment = createAsyncThunk('teacher/uploadAssignment', async (formData, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/teacher/upload-assignment', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const sendMessage = createAsyncThunk('teacher/sendMessage', async (formData, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/teacher/send-message', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});
export const fetchExamSchedule = createAsyncThunk('teacher/fetchExams', async (classId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/teacher/exam-schedule?classId=${classId || ''}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchAssignments = createAsyncThunk('teacher/fetchAssignments', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/teacher/assignments');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const updateAssignment = createAsyncThunk('teacher/updateAssignment', async ({ id, formData }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/teacher/assignments/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const deleteAssignment = createAsyncThunk('teacher/deleteAssignment', async (id, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.delete(`/teacher/assignments/${id}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchTeacherAttendance = createAsyncThunk('teacher/fetchAttendance', async (params, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/teacher/attendance`, { params });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchAttendanceAnalytics = createAsyncThunk('teacher/fetchAttendanceAnalytics', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/teacher/attendance-analytics');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchTeacherMarks = createAsyncThunk('teacher/fetchMarks', async (examId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/teacher/marks/${examId}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchTeacherTimetable = createAsyncThunk('teacher/fetchTimetable', async (classId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/teacher/timetable/${classId}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const applyLeave = createAsyncThunk('teacher/applyLeave', async (data, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/teacher/apply-leave', data);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchMyLeaves = createAsyncThunk('teacher/fetchMyLeaves', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/teacher/my-leaves');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchProfile = createAsyncThunk('teacher/fetchProfile', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/teacher/profile');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const updateProfile = createAsyncThunk('teacher/updateProfile', async (formData, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put('/teacher/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const changeTeacherPassword = createAsyncThunk('teacher/changePassword', async (data, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/teacher/change-password', data);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const fetchFeeStatus = createAsyncThunk('teacher/fetchFees', async (params = {}, { rejectWithValue }) => {
    try {
        const { classId } = params;
        const response = await axiosInstance.get(`/teacher/get-fee-status?classId=${classId || ''}`);
        return response.data;
    } catch (error) { return rejectWithValue(error.response.data.message); }
});

export const fetchMyMessages = createAsyncThunk('teacher/fetchMessages', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/my-messages');
        return response.data;
    } catch (error) { return rejectWithValue(error.response.data.message); }
});

export const fetchPerformanceAnalytics = createAsyncThunk('teacher/fetchPerformance', async (params = {}, { rejectWithValue }) => {
    try {
        const { classId, subjectId } = params;
        const response = await axiosInstance.get(`/teacher/performance-analytics?classId=${classId || ''}&subjectId=${subjectId || ''}`);
        return response.data;
    } catch (error) { return rejectWithValue(error.response.data.message); }
});

export const fetchNotices = createAsyncThunk('teacher/fetchNotices', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/notices');
        return response.data;
    } catch (error) { return rejectWithValue(error.response.data.message); }
});

export const fetchContacts = createAsyncThunk('teacher/fetchContacts', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/contacts');
        return response.data;
    } catch (error) { return rejectWithValue(error.response.data.message); }
});

export const fetchDetailedAttendance = createAsyncThunk('teacher/fetchDetailedAttendance', async (studentId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`/teacher/student-attendance/${studentId}`);
        return response.data;
    } catch (error) { return rejectWithValue(error.response.data.message); }
});

export const retractAnnouncement = createAsyncThunk('teacher/retractAnnouncement', async (id, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.delete(`/teacher/retract-announcement/${id}`);
        return response.data;
    } catch (error) { return rejectWithValue(error.response.data.message); }
});

export const importAttendanceBulk = createAsyncThunk('teacher/bulkAttendance', async (data, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/teacher/bulk-attendance', data);
        return response.data;
    } catch (error) { return rejectWithValue(error.response.data.message); }
});

export const fetchTeacherReviews = createAsyncThunk('teacher/fetchReviews', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/teacher/reviews');
        return response.data;
    } catch (error) { return rejectWithValue(error.response.data.message); }
});

export const fetchUnifiedCalendar = createAsyncThunk('teacher/fetchUnifiedCalendar', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/teacher/unified-calendar');
        return response.data;
    } catch (error) { return rejectWithValue(error.response.data.message); }
});

export const fetchLessonPlans = createAsyncThunk('teacher/fetchLessonPlans', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/teacher/lesson-plans');
        return response.data;
    } catch (error) { return rejectWithValue(error.response.data.message); }
});

export const createLessonPlan = createAsyncThunk('teacher/createLessonPlan', async (data, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/teacher/lesson-plans', data);
        return response.data;
    } catch (error) { return rejectWithValue(error.response.data.message); }
});

export const logBehavior = createAsyncThunk('teacher/logBehavior', async (data, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/teacher/behavior-log', data);
        return response.data;
    } catch (error) { return rejectWithValue(error.response.data.message); }
});

export const fetchBehaviorLogs = createAsyncThunk('teacher/fetchBehaviorLogs', async (params = {}, { rejectWithValue }) => {
    try {
        const { studentId, classId } = params;
        const response = await axiosInstance.get(`/teacher/behavior-logs?studentId=${studentId || ''}&classId=${classId || ''}`);
        return response.data;
    } catch (error) { return rejectWithValue(error.response.data.message); }
});

export const updateBehavior = createAsyncThunk('teacher/updateBehavior', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/teacher/behavior-log/${id}`, data);
        return response.data;
    } catch (error) { return rejectWithValue(error.response.data.message); }
});

export const deleteBehavior = createAsyncThunk('teacher/deleteBehavior', async (id, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.delete(`/teacher/behavior-log/${id}`);
        return { id, ...response.data };
    } catch (error) { return rejectWithValue(error.response.data.message); }
});

export const scheduleMeeting = createAsyncThunk('teacher/scheduleMeeting', async (data, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/teacher/meetings', data);
        return response.data;
    } catch (error) { return rejectWithValue(error.response.data.message); }
});

export const fetchMeetings = createAsyncThunk('teacher/fetchMeetings', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/teacher/meetings');
        return response.data;
    } catch (error) { return rejectWithValue(error.response.data.message); }
});

export const updateMeeting = createAsyncThunk('teacher/updateMeeting', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/teacher/meetings/${id}`, data);
        return response.data;
    } catch (error) { return rejectWithValue(error.response.data.message); }
});

export const deleteMeeting = createAsyncThunk('teacher/deleteMeeting', async (id, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.delete(`/teacher/meetings/${id}`);
        return { id, ...response.data };
    } catch (error) { return rejectWithValue(error.response.data.message); }
});

export const updateLessonPlan = createAsyncThunk('teacher/updateLessonPlan', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/teacher/lesson-plans/${id}`, data);
        return response.data;
    } catch (error) { return rejectWithValue(error.response.data.message); }
});

export const deleteLessonPlan = createAsyncThunk('teacher/deleteLessonPlan', async (id, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.delete(`/teacher/lesson-plans/${id}`);
        return { id, ...response.data };
    } catch (error) { return rejectWithValue(error.response.data.message); }
});

export const fetchMyStaffAttendance = createAsyncThunk('teacher/fetchMyStaffAttendance', async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get('/staff-attendance/my-history');
        return response.data;
    } catch (error) { return rejectWithValue(error.response.data.message); }
});

const teacherSlice = createSlice({
    name: 'teacher',
    initialState: {
        classes: [],
        dashboard: null,
        students: [],
        studentDetail: null,
        submissions: [],
        payroll: [],
        analytics: null, // For performance analytics
        exams: [],
        attendance: [],
        detailedAttendance: [], // For per-student history
        attendanceAnalytics: null,
        marks: [],
        timetable: null,
        assignments: [],
        leaves: [],
        feeStatus: [], // For class fee view
        reviews: [], // For teacher reviews
        messages: [], // For teacher communication
        unifiedCalendar: null, // For unified view
        lessonPlans: [],
        behaviorLogs: [],
        notices: [],
        contacts: [],
        meetings: [],
        profile: null,
        myStaffAttendance: [],
        loading: false,
        error: null,
        message: null
    },
    reducers: {
        clearTeacherError: (state) => { state.error = null; },
        clearTeacherMessage: (state) => { state.message = null; },
        setTeacherError: (state, action) => { state.error = action.payload; },
        setTeacherMessage: (state, action) => { state.message = action.payload; },
        updateTeacherMessages: (state, action) => { 
            const msg = action.payload;
            if (msg.type === 'Notice') {
                state.notices = [msg, ...state.notices];
            } else {
                state.messages = [msg, ...state.messages];
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboard.fulfilled, (state, action) => {
                state.loading = false;
                state.dashboard = action.payload;
            })
            .addCase(fetchAssignedClasses.pending, (state) => { state.loading = true; })
            .addCase(fetchAssignedClasses.fulfilled, (state, action) => {
                state.loading = false;
                state.classes = action.payload;
            })
            .addCase(fetchClassStudents.fulfilled, (state, action) => {
                state.students = action.payload;
            })
            .addCase(generateRollNumbers.fulfilled, (state, action) => {
                state.message = action.payload.message || 'Roll sequence synchronized';
            })
            .addCase(fetchStudentDetail.fulfilled, (state, action) => {
                state.studentDetail = action.payload;
            })
            .addCase(fetchSubmissions.fulfilled, (state, action) => {
                state.loading = false;
                state.submissions = action.payload;
            })
            .addCase(gradeSubmissionThunk.fulfilled, (state, action) => {
              state.loading = false;
              state.message = action.payload.message;
              const index = state.submissions.findIndex(s => s._id === action.payload.submission._id);
              if (index !== -1) state.submissions[index] = action.payload.submission;
            })
            .addCase(fetchPayroll.fulfilled, (state, action) => {
                state.loading = false;
                state.payroll = action.payload;
            })
            .addCase(fetchExamSchedule.fulfilled, (state, action) => {
                state.exams = action.payload;
            })
            .addCase(fetchTeacherAttendance.fulfilled, (state, action) => {
                state.attendance = action.payload;
            })
            .addCase(fetchAttendanceAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.attendanceAnalytics = action.payload;
            })
            .addCase(fetchTeacherMarks.fulfilled, (state, action) => {
                state.marks = action.payload;
            })
            .addCase(fetchTeacherTimetable.fulfilled, (state, action) => {
                state.timetable = action.payload;
            })
            .addCase(fetchAssignments.fulfilled, (state, action) => {
                state.loading = false;
                state.assignments = action.payload;
            })
            .addCase(updateAssignment.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload?.message || "Homework updated successfully";
                const upd = action.payload?.assignment || action.payload;
                state.assignments = state.assignments.map(a => a._id === upd._id ? upd : a);
            })
            .addCase(deleteAssignment.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload?.message || "Homework decommissioned";
                state.assignments = state.assignments.filter(a => a._id !== action.meta.arg);
            })
            .addCase(submitAttendance.fulfilled, (state, action) => { state.message = action.payload?.message || "Attendance marked successfully"; })
            .addCase(submitMarks.fulfilled, (state, action) => { state.message = action.payload?.message || "Marks submitted successfully"; })
            .addCase(uploadAssignment.fulfilled, (state, action) => { 
                state.message = action.payload?.message || "Assignment published successfully"; 
                const newAs = action.payload?.assignment || action.payload;
                state.assignments = [newAs, ...state.assignments];
            })
            .addCase(fetchMyLeaves.fulfilled, (state, action) => {
                state.loading = false;
                state.leaves = action.payload;
            })
            .addCase(applyLeave.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload?.message || "Leave application submitted";
                state.leaves = [action.payload.leave || action.payload, ...state.leaves];
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload.teacher || action.payload;
                state.message = action.payload?.message || "Profile synchronized";
            })
            .addCase(changeTeacherPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload?.message || "Password updated";
            })
            .addCase(sendMessage.fulfilled, (state, action) => { 
                state.message = action.payload?.message || "Communication broadcasted successfully"; 
                const msg = action.payload?.data || action.payload;
                if (msg.type === 'Notice') {
                    state.notices = [msg, ...state.notices];
                } else {
                    state.messages = [msg, ...state.messages];
                }
            })
            .addCase(fetchFeeStatus.fulfilled, (state, action) => {
                state.feeStatus = action.payload;
            })
            .addCase(fetchPerformanceAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.analytics = action.payload;
            })
            .addCase(fetchDetailedAttendance.fulfilled, (state, action) => {
                state.detailedAttendance = action.payload;
            })
            .addCase(retractAnnouncement.fulfilled, (state, action) => {
                state.message = action.payload.message;
            })
            .addCase(importAttendanceBulk.fulfilled, (state, action) => {
                state.message = action.payload.message;
            })
            .addCase(fetchMyMessages.fulfilled, (state, action) => {
                state.messages = action.payload;
                state.loading = false;
            })
            .addCase(fetchNotices.fulfilled, (state, action) => {
                state.notices = action.payload;
                state.loading = false;
            })
            .addCase(fetchContacts.fulfilled, (state, action) => {
                state.contacts = action.payload;
                state.loading = false;
            })
            .addCase(fetchTeacherReviews.fulfilled, (state, action) => {
                state.reviews = action.payload;
                state.loading = false;
            })
            .addCase(fetchUnifiedCalendar.fulfilled, (state, action) => {
                state.unifiedCalendar = action.payload;
                state.loading = false;
            })
            .addCase(fetchLessonPlans.fulfilled, (state, action) => {
                state.lessonPlans = action.payload;
                state.loading = false;
            })
            .addCase(createLessonPlan.fulfilled, (state, action) => {
                state.message = action.payload.message;
                state.lessonPlans = [action.payload.plan, ...state.lessonPlans];
            })
            .addCase(fetchBehaviorLogs.fulfilled, (state, action) => {
                state.behaviorLogs = action.payload;
                state.loading = false;
            })
            .addCase(logBehavior.fulfilled, (state, action) => {
                state.message = action.payload.message;
            })
            .addCase(updateBehavior.fulfilled, (state, action) => {
                state.message = action.payload.message;
                const index = state.behaviorLogs.findIndex(l => l._id === action.payload.log?._id);
                if (index !== -1) state.behaviorLogs[index] = action.payload.log;
            })
            .addCase(deleteBehavior.fulfilled, (state, action) => {
                state.message = action.payload.message;
                state.behaviorLogs = state.behaviorLogs.filter(l => l._id !== action.payload.id);
            })
            .addCase(fetchMeetings.fulfilled, (state, action) => {
                state.meetings = action.payload;
                state.loading = false;
            })
            .addCase(scheduleMeeting.fulfilled, (state, action) => {
                state.message = action.payload.message;
                state.meetings = [...state.meetings, action.payload.meeting].sort((a,b) => new Date(a.date) - new Date(b.date));
            })
            .addCase(updateMeeting.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload.message || 'Meeting updated';
            })
            .addCase(deleteMeeting.fulfilled, (state, action) => {
                state.meetings = state.meetings.filter(m => m._id !== action.payload.id);
                state.loading = false;
                state.message = action.payload.message || 'Meeting deleted';
            })
            .addCase(updateLessonPlan.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload.message || 'Lesson plan updated';
            })
            .addCase(deleteLessonPlan.fulfilled, (state, action) => {
                state.lessonPlans = state.lessonPlans.filter(p => p._id !== action.payload.id);
                state.loading = false;
                state.message = action.payload.message || 'Lesson plan deleted';
            })
            .addCase(fetchMyStaffAttendance.fulfilled, (state, action) => {
                state.myStaffAttendance = action.payload;
                state.loading = false;
            })
            .addMatcher(
                (action) => action.type.endsWith('/fulfilled'),
                (state) => { state.loading = false; }
            )
            .addMatcher(
                (action) => action.type.endsWith('/pending'),
                (state) => { state.loading = true; }
            )
            .addMatcher(
                (action) => action.type.endsWith('/rejected'),
                (state, action) => { 
                    state.loading = false; 
                    state.error = action.payload || "Operation failed in the academic logic layer";
                }
            );
    }
});

export const { clearTeacherError, clearTeacherMessage, setTeacherError, setTeacherMessage, updateTeacherMessages } = teacherSlice.actions;
export default teacherSlice.reducer;
