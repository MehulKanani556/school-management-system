import React from 'react';
import './App.css';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { configureStore } from './redux/Store';
import { PersistGate } from 'redux-persist/integration/react';
import Auth from './pages/auth/Auth';
import Home from './pages/Home';
import SchoolAdminLayout from './pages/schooladmin/SchoolAdminLayout';
import Dashboard from './pages/schooladmin/Dashboard';
import Students from './pages/schooladmin/Students';
import Teachers from './pages/schooladmin/Teachers';
import Classes from './pages/schooladmin/Classes';
import Fees from './pages/schooladmin/Fees';
import Exams from './pages/schooladmin/Exams';
import Attendance from './pages/schooladmin/Attendance';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import SuperAdminHome from './pages/superadmin/SuperAdminHome';
import AllSchools from './pages/superadmin/AllSchools';
import Revenue from './pages/superadmin/Revenue';
import Security from './pages/superadmin/Security';
import TeacherLayout from './pages/Teacher/TeacherLayout';
import TeacherDashboard from './pages/Teacher/TeacherDashboard';
import AssignedClasses from './pages/Teacher/AssignedClasses';
import MarkAttendance from './pages/Teacher/MarkAttendance';
import AddMarks from './pages/Teacher/AddMarks';
import Assignments from './pages/Teacher/Assignments';
import Communication from './pages/Teacher/Communication';
import StudentLayout from './pages/Student/StudentLayout';
import StudentDashboard from './pages/Student/StudentDashboard';
import AttendanceHistory from './pages/Student/AttendanceHistory';
import AcademicResults from './pages/Student/AcademicResults';
import AssignmentsStudent from './pages/Student/Assignments';
import Timetable from './pages/Student/Timetable';
import StudentProfile from './pages/Student/StudentProfile';

const { store, persistor } = configureStore();

// Guard: only allow if authenticated + has required role
const RoleRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (role && user?.role !== role) return <Navigate to="/" />;
  return children;
};



function AppRoutes() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Redirect root based on role
  const HomeRedirect = () => {
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (user?.role === 'School_Admin') return <Navigate to="/school-admin" />;
    if (user?.role === 'Teacher') return <Navigate to="/teacher" />;
    if (user?.role === 'Student') return <Navigate to="/student" />;
    return <Home />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Auth /> : <Navigate to="/" />} />
        <Route path="/signup" element={!isAuthenticated ? <Auth /> : <Navigate to="/" />} />
        <Route path="/" element={<HomeRedirect />} />

        {/* Student Panel */}
        <Route path="/student" element={
          <RoleRoute role="Student"><StudentLayout /></RoleRoute>
        }>
          <Route index element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="attendance" element={<AttendanceHistory />} />
          <Route path="results" element={<AcademicResults />} />
          <Route path="assignments" element={<AssignmentsStudent />} />
          <Route path="timetable" element={<Timetable />} />
        </Route>

        {/* Teacher Panel */}
        <Route path="/teacher" element={
          <RoleRoute role="Teacher"><TeacherLayout /></RoleRoute>
        }>
          <Route index element={<TeacherDashboard />} />
          <Route path="classes" element={<AssignedClasses />} />
          <Route path="attendance" element={<MarkAttendance />} />
          <Route path="marks" element={<AddMarks />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="messages" element={<Communication />} />
        </Route>

        {/* School Admin Panel */}
        <Route path="/school-admin" element={
          <RoleRoute role="School_Admin"><SchoolAdminLayout /></RoleRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="classes" element={<Classes />} />
          <Route path="fees" element={<Fees />} />
          <Route path="exams" element={<Exams />} />
          <Route path="attendance" element={<Attendance />} />
        </Route>


        {/* Main Entry Point (Switchboard) */}
        <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />

        {/* Super Admin Domain (Nested Pages) */}
        <Route path="/superadmin" element={isAuthenticated && user?.role === 'Super_Admin' ? <SuperAdminDashboard /> : <Navigate to="/" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminHome />} />
          <Route path="schools" element={<AllSchools />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="security" element={<Security />} />
        </Route>

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f172a',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              fontWeight: '600',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#f43f5e',
                secondary: '#fff',
              },
            },
          }}
        />
        <AppRoutes />
      </PersistGate>
    </Provider>
  );
}

export default App;
