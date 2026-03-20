import React from 'react';
import './App.css';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { configureStore } from './redux/Store';
import { PersistGate } from 'redux-persist/integration/react';
import Auth from './pages/auth/Auth';
import Home from './pages/Home';

// Layouts
import SchoolAdminLayout from './pages/schooladmin/SchoolAdminLayout';
import TeacherLayout from './pages/Teacher/TeacherLayout';
import StudentLayout from './pages/Student/StudentLayout';

// School Admin Pages
import Dashboard from './pages/schooladmin/Dashboard';
import Students from './pages/schooladmin/Students';
import Teachers from './pages/schooladmin/Teachers';
import Classes from './pages/schooladmin/Classes';
import Fees from './pages/schooladmin/Fees';
import Exams from './pages/schooladmin/Exams';
import Attendance from './pages/schooladmin/Attendance';
import AttendanceAnalytics from './pages/schooladmin/AttendanceAnalytics';
import Subjects from './pages/schooladmin/Subjects';
import AdminTimetable from './pages/schooladmin/Timetable';
import AdminCommunication from './pages/schooladmin/Communication';
import Payroll from './pages/schooladmin/Payroll';
import Leaves from './pages/schooladmin/Leaves';
import Reviews from './pages/schooladmin/Reviews';
import Reports from './pages/schooladmin/Reports';
import SchoolProfile from './pages/schooladmin/SchoolProfiles';

// Super Admin Pages
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import SuperAdminHome from './pages/superadmin/SuperAdminHome';
import AllSchools from './pages/superadmin/AllSchools';
import Revenue from './pages/superadmin/Revenue';
import Security from './pages/superadmin/Security';

// Teacher Pages
import TeacherDashboard from './pages/Teacher/TeacherDashboard';
import AssignedClasses from './pages/Teacher/AssignedClasses';
import MarkAttendance from './pages/Teacher/MarkAttendance';
import AddMarks from './pages/Teacher/AddMarks';
import Assignments from './pages/Teacher/Assignments';
import TeacherLeaves from './pages/Teacher/TeacherLeaves';

// Student Pages
import StudentDashboard from './pages/Student/StudentDashboard';
import AttendanceHistory from './pages/Student/AttendanceHistory';
import AcademicResults from './pages/Student/AcademicResults';
import AssignmentsStudent from './pages/Student/Assignments';
import Timetable from './pages/Student/Timetable';
import StudentProfile from './pages/Student/StudentProfile';

// Common Pages
import Holidays from './pages/common/Holidays';

// Utilities & Context
import ToastManager from './ToastManager';
import { SocketProvider } from './context/SocketContext';

// Lazy Loaded Nodes
const TeacherTimetable = React.lazy(() => import('./pages/Teacher/Timetable'));
const TeacherMessages = React.lazy(() => import('./pages/Teacher/Communication'));
const TeacherProfile = React.lazy(() => import('./pages/Teacher/TeacherProfile'));
const TeacherAnalytics = React.lazy(() => import('./pages/Teacher/AttendanceAnalytics'));
const TeacherPayroll = React.lazy(() => import('./pages/Teacher/Payroll'));
const ClassStudents = React.lazy(() => import('./pages/Teacher/ClassStudents'));

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
          <Route path="holidays" element={<Holidays />} />
        </Route>

        {/* Teacher Panel */}
        <Route path="/teacher" element={
          <RoleRoute role="Teacher"><TeacherLayout /></RoleRoute>
        }>
          <Route index element={<TeacherDashboard />} />
          <Route path="classes" element={<AssignedClasses />} />
          <Route path="students/:classId" element={<ClassStudents />} />
          <Route path="attendance" element={<MarkAttendance />} />
          <Route path="marks" element={<AddMarks />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="timetable" element={<TeacherTimetable />} />
          <Route path="messages" element={<TeacherMessages />} />
          <Route path="profile" element={<TeacherProfile />} />
          <Route path="analytics" element={<TeacherAnalytics />} />
          <Route path="payroll" element={<TeacherPayroll />} />
          <Route path="leaves" element={<TeacherLeaves />} />
          <Route path="holidays" element={<Holidays />} />
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
          <Route path="attendance-analytics" element={<AttendanceAnalytics />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="timetable" element={<AdminTimetable />} />
          <Route path="communication" element={<AdminCommunication />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="leaves" element={<Leaves />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<SchoolProfile />} />
        </Route>

        {/* Super Admin Panel */}
        <Route path="/superadmin" element={
          <RoleRoute role="Super_Admin"><SuperAdminHome /></RoleRoute>
        }>
          <Route index element={<SuperAdminDashboard />} />
          <Route path="all-schools" element={<AllSchools />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="security" element={<Security />} />
        </Route>
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SocketProvider>
          <div className="App overflow-hidden">
            <AppRoutes />
            <Toaster position="top-right" reverseOrder={false} />
            <ToastManager />
          </div>
        </SocketProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
