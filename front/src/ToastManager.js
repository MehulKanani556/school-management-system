import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { clearTeacherError, clearTeacherMessage } from './redux/slice/teacher.slice';
import { clearAuthError, clearAuthMessage } from './redux/slice/auth.slice';
import { clearSchoolError, clearSchoolMessage } from './redux/slice/school.slice';
import { clearUserError, clearUserMessage } from './redux/slice/user.slice';
import { clearError as clearSchoolAdminError, clearMessage as clearSchoolAdminMessage } from './redux/slice/schoolAdmin.slice';
import { clearStudentError, clearStudentMessage } from './redux/slice/student.slice';

// Global Feedback Terminal Registry
const ToastManager = () => {
    const dispatch = useDispatch();
    
    // Select situational state clusters
    const teacher = useSelector((s) => s.teacher);
    const auth = useSelector((s) => s.auth);
    const school = useSelector((s) => s.school);
    const user = useSelector((s) => s.user);
    const schoolAdmin = useSelector((s) => s.schoolAdmin);
    const student = useSelector((s) => s.student);

    useEffect(() => {
        const extractErr = (err) => err?.message || (typeof err === 'string' ? err : JSON.stringify(err));
        
        const showSuccess = (msg) => {
            const str = String(msg);
            toast.success(str, { id: str });
        };

        const showError = (err) => {
            const str = extractErr(err);
            const lower = str.toLowerCase();
            const id = (lower.includes('session') || lower.includes('expired') || lower.includes('unauthorized') || lower.includes('token')) 
                ? 'session_expired' 
                : str;
            toast.error(str, { id });
        };

        // Teacher Sector
        if (teacher?.message) { showSuccess(teacher.message); dispatch(clearTeacherMessage()); }
        if (teacher?.error) { showError(teacher.error); dispatch(clearTeacherError()); }

        // Auth Entry Point
        if (auth?.message) { showSuccess(auth.message); dispatch(clearAuthMessage()); }
        if (auth?.error) { showError(auth.error); dispatch(clearAuthError()); }

        // School Admin Registry
        if (schoolAdmin?.message) { showSuccess(schoolAdmin.message); dispatch(clearSchoolAdminMessage()); }
        if (schoolAdmin?.error) { showError(schoolAdmin.error); dispatch(clearSchoolAdminError()); }

        // Student Portal
        if (student?.message) { showSuccess(student.message); dispatch(clearStudentMessage()); }
        if (student?.error) { showError(student.error); dispatch(clearStudentError()); }

        // Super Admin Infrastructure
        if (school?.message) { showSuccess(school.message); dispatch(clearSchoolMessage()); }
        if (school?.error) { showError(school.error); dispatch(clearSchoolError()); }

        // Global Security Registry
        if (user?.message) { showSuccess(user.message); dispatch(clearUserMessage()); } 
        if (user?.error) { showError(user.error); dispatch(clearUserError()); }

    }, [
        teacher?.message, teacher?.error,
        auth?.message, auth?.error,
        schoolAdmin?.message, schoolAdmin?.error,
        student?.message, student?.error,
        school?.message, school?.error,
        user?.message, user?.error,
        dispatch
    ]);


    return null;
};

export default ToastManager;
