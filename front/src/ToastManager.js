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
        
        // Teacher Sector
        if (teacher?.message) { toast.success(String(teacher.message)); dispatch(clearTeacherMessage()); }
        if (teacher?.error) { toast.error(extractErr(teacher.error)); dispatch(clearTeacherError()); }

        // Auth Entry Point
        if (auth?.message) { toast.success(String(auth.message)); dispatch(clearAuthMessage()); }
        if (auth?.error) { toast.error(extractErr(auth.error)); dispatch(clearAuthError()); }

        // School Admin Registry
        if (schoolAdmin?.message) { toast.success(String(schoolAdmin.message)); dispatch(clearSchoolAdminMessage()); }
        if (schoolAdmin?.error) { toast.error(extractErr(schoolAdmin.error)); dispatch(clearSchoolAdminError()); }

        // Student Portal
        if (student?.message) { toast.success(String(student.message)); dispatch(clearStudentMessage()); }
        if (student?.error) { toast.error(extractErr(student.error)); dispatch(clearStudentError()); }

        // Super Admin Infrastructure
        if (school?.message) { toast.success(String(school.message)); dispatch(clearSchoolMessage()); }
        if (school?.error) { toast.error(extractErr(school.error)); dispatch(clearSchoolError()); }

        // Global Security Registry
        if (user?.message) { toast.success(String(user.message)); dispatch(clearUserMessage()); } 
        if (user?.error) { toast.error(extractErr(user.error)); dispatch(clearUserError()); }

    }, [teacher, auth, schoolAdmin, student, school, user, dispatch]);


    return null;
};

export default ToastManager;
