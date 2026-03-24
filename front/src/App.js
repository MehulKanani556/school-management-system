import React, { Suspense } from 'react';
import './App.css';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { configureStore } from './redux/Store';
import { PersistGate } from 'redux-persist/integration/react';
import { Loader2 } from 'lucide-react';
import Auth from './pages/auth/Auth';
import Home from './pages/Home';
import VerificationPage from './pages/public/VerificationPage';

// Layouts
import SchoolAdminLayout from './pages/schooladmin/SchoolAdminLayout';
import TeacherLayout from './pages/Teacher/TeacherLayout';
import StudentLayout from './pages/Student/StudentLayout';
import ParentLayout from './pages/Parent/ParentLayout';
import AccountantLayout from './pages/Accountant/AccountantLayout';
import LibrarianLayout from './pages/Librarian/LibrarianLayout';
import TransporterLayout from './pages/Transporter/TransporterLayout';


// School Admin Pages
import Dashboard from './pages/schooladmin/Dashboard';
import Students from './pages/schooladmin/Students';
import StudentDetail from './pages/schooladmin/StudentDetail';
import StaffAttendance from './pages/schooladmin/StaffAttendance';
import AssignmentOverview from './pages/schooladmin/AssignmentOverview';
import CertificateHub from './pages/schooladmin/CertificateHub';
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
import StaffRegistry from './pages/schooladmin/StaffRegistry';
import AcademicYears from './pages/schooladmin/AcademicYear';
import Admissions from './pages/schooladmin/Admissions';
import Notifications from './pages/schooladmin/Notifications';

// Super Admin Pages
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import SuperAdminHome from './pages/superadmin/SuperAdminHome';
import AllSchools from './pages/superadmin/AllSchools';
import Revenue from './pages/superadmin/Revenue';
import Security from './pages/superadmin/Security';
import Analytics from './pages/superadmin/Analytics';
import SystemSettings from './pages/superadmin/SystemSettings';
import SuperAdminProfile from './pages/superadmin/SuperAdminProfile';
import UserManagement from './pages/superadmin/UserManagement';
import Support from './pages/superadmin/Support';
import Backups from './pages/superadmin/Backups';
import SuperAdminHolidays from './pages/superadmin/Holidays';
import Notifications from './pages/superadmin/Notifications';
import Messages from './pages/superadmin/Messages';


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
import FeesStudent from './pages/Student/Fees';
import NotificationsStudent from './pages/Student/Notifications';
import AnnouncementsStudent from './pages/Student/Announcements';
import MessagesStudent from './pages/Student/Messages';
import ExamsStudent from './pages/Student/Exams';

// Parent Pages
import ParentDashboard from './pages/Parent/ParentDashboard';
import ChildAttendance from './pages/Parent/ChildAttendance';
import ChildResults from './pages/Parent/ChildResults';
import ChildFees from './pages/Parent/ChildFees';
import ChildTimetable from './pages/Parent/ChildTimetable';
import ChildAssignments from './pages/Parent/ChildAssignments';
import ChildExams from './pages/Parent/ChildExams';
import ParentProfile from './pages/Parent/ParentProfile';
import ParentNotifications from './pages/Parent/ParentNotifications';
import ParentMessages from './pages/Parent/Messages';
import ChildProfile from './pages/Parent/ChildProfile';
import ChildTransport from './pages/Parent/ChildTransport';



// Common Pages
import Holidays from './pages/common/Holidays';

import Maintenance from './pages/common/Maintenance';

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
const TeacherFeeStatus = React.lazy(() => import('./pages/Teacher/ClassFeeStatus'));
const StudentDetailedAttendance = React.lazy(() => import('./pages/Teacher/StudentDetailedAttendance'));
const PerformanceAnalytics = React.lazy(() => import('./pages/Teacher/PerformanceAnalytics'));
const TeacherReviews = React.lazy(() => import('./pages/Teacher/TeacherReviews'));
const TeacherExams = React.lazy(() => import('./pages/Teacher/Exams'));
const TeacherUnifiedCalendar = React.lazy(() => import('./pages/Teacher/UnifiedCalendar'));
const LessonPlans = React.lazy(() => import('./pages/Teacher/LessonPlans'));
const BehaviorLog = React.lazy(() => import('./pages/Teacher/BehaviorLog'));
const PTMMeetings = React.lazy(() => import('./pages/Teacher/PTMMeetings'));
const ClassNoticeboard = React.lazy(() => import('./pages/Teacher/ClassNoticeboard'));
// const AcademicYears = React.lazy(() => import('./pages/schooladmin/AcademicYears'));
// const Admissions = React.lazy(() => import('./pages/schooladmin/Admissions'));

// Parent Pages
const ChildBehavior = React.lazy(() => import('./pages/Parent/ChildBehavior'));
const ChildMeetings = React.lazy(() => import('./pages/Parent/ChildMeetings'));

// Accountant Pages
const AccountantDashboard = React.lazy(() => import('./pages/Accountant/AccountantDashboard'));
const FeeCollection = React.lazy(() => import('./pages/Accountant/FeeCollection'));
const PayrollManagement = React.lazy(() => import('./pages/Accountant/PayrollManagement'));
const FinancialReports = React.lazy(() => import('./pages/Accountant/FinancialReports'));
const FeeStructures = React.lazy(() => import('./pages/Accountant/FeeStructures'));
const AuditLogs = React.lazy(() => import('./pages/Accountant/AuditLogs'));
const AccountantProfile = React.lazy(() => import('./pages/Accountant/AccountantProfile'));
const AccountantMessages = React.lazy(() => import('./pages/Accountant/AccountantMessages'));
const AccountantAnnouncements = React.lazy(() => import('./pages/Accountant/AccountantAnnouncements'));

// Librarian Pages
const LibrarianDashboard = React.lazy(() => import('./pages/Librarian/LibrarianDashboard'));
const BookInventory = React.lazy(() => import('./pages/Librarian/BookInventory'));
const IssueRecords = React.lazy(() => import('./pages/Librarian/IssueRecords'));
const BookCategories = React.lazy(() => import('./pages/Librarian/BookCategories'));
const CirculationHistory = React.lazy(() => import('./pages/Librarian/CirculationHistory'));
const MemberRegistry = React.lazy(() => import('./pages/Librarian/MemberRegistry'));
const LibrarianMessages = React.lazy(() => import('./pages/Librarian/LibrarianMessages'));

// Transporter Pages
const TransporterDashboard = React.lazy(() => import('./pages/Transporter/TransporterDashboard'));
const Vehicles = React.lazy(() => import('./pages/Transporter/Vehicles'));
const TransporterRoutes = React.lazy(() => import('./pages/Transporter/Routes'));
const StudentAssignment = React.lazy(() => import('./pages/Transporter/StudentAssignment'));
const Drivers = React.lazy(() => import('./pages/Transporter/Drivers'));
const TripLogs = React.lazy(() => import('./pages/Transporter/TripLogs'));
const TransporterMessages = React.lazy(() => import('./pages/Transporter/Messages'));
const TransporterProfile = React.lazy(() => import('./pages/Transporter/Profile'));

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
    if (user?.role === 'Parent') return <Navigate to="/parent" />;
    if (user?.role === 'Accountant') return <Navigate to="/accountant" />;
    if (user?.role === 'Librarian') return <Navigate to="/librarian" />;
    if (user?.role === 'Transport_Manager') return <Navigate to="/transporter" />;
    return <Home />;
  };

  return (
    <Router>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center h-screen bg-[#020617]">
          <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic animate-pulse">Synchronizing Neural Core...</span>
        </div>
      }>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Auth /> : <Navigate to="/" />} />
          <Route path="/signup" element={!isAuthenticated ? <Auth /> : <Navigate to="/" />} />
          <Route path="/verify/:type/:id" element={<VerificationPage />} />
          <Route path="/maintenance" element={<Maintenance />} />
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
            <Route path="fees" element={<FeesStudent />} />
            <Route path="notifications" element={<NotificationsStudent />} />
            <Route path="announcements" element={<AnnouncementsStudent />} />
            <Route path="messages" element={<MessagesStudent />} />
            <Route path="exams" element={<ExamsStudent />} />
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
            <Route path="fee-status" element={<TeacherFeeStatus />} />
            <Route path="student-attendance/:studentId" element={<StudentDetailedAttendance />} />
            <Route path="performance-report" element={<PerformanceAnalytics />} />
            <Route path="reviews" element={<TeacherReviews />} />
            <Route path="exam-schedule" element={<TeacherExams />} />
            <Route path="unified-calendar" element={<TeacherUnifiedCalendar />} />
            <Route path="lesson-plans" element={<LessonPlans />} />
            <Route path="behavior-log" element={<BehaviorLog />} />
            <Route path="meetings" element={<PTMMeetings />} />
            <Route path="noticeboard" element={<ClassNoticeboard />} />
          </Route>

          {/* Parent Panel */}
          <Route path="/parent" element={
            <RoleRoute role="Parent"><ParentLayout /></RoleRoute>
          }>
            <Route index element={<ParentDashboard />} />
            <Route path="attendance" element={<ChildAttendance />} />
            <Route path="results" element={<ChildResults />} />
            <Route path="assignments" element={<ChildAssignments />} />
            <Route path="fees" element={<ChildFees />} />
            <Route path="timetable" element={<ChildTimetable />} />
            <Route path="exams" element={<ChildExams />} />
            <Route path="behavior" element={<ChildBehavior />} />
            <Route path="meetings" element={<ChildMeetings />} />
            <Route path="announcements" element={<AnnouncementsStudent />} />
            <Route path="notifications" element={<ParentNotifications />} />
            <Route path="messages" element={<ParentMessages />} />
            <Route path="holidays" element={<Holidays />} />
            <Route path="profile" element={<ParentProfile />} />
            <Route path="child-profile" element={<ChildProfile />} />
            <Route path="transport" element={<ChildTransport />} />
          </Route>


          {/* School Admin Panel */}
          <Route path="/school-admin" element={
            <RoleRoute role="School_Admin"><SchoolAdminLayout /></RoleRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="students/:id" element={<StudentDetail />} />
            <Route path="staff-attendance" element={<StaffAttendance />} />
            <Route path="teachers" element={<Teachers />} />
            <Route path="classes" element={<Classes />} />
            <Route path="fees" element={<Fees />} />
            <Route path="exams" element={<Exams />} />
            <Route path="certificate-hub" element={<CertificateHub />} />
            <Route path="assignments" element={<AssignmentOverview />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="attendance-intelligence" element={<AttendanceAnalytics />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="timetable" element={<AdminTimetable />} />
            <Route path="communication" element={<AdminCommunication />} />
            <Route path="payroll" element={<Payroll />} />
            <Route path="leaves" element={<Leaves />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="reports" element={<Reports />} />
            <Route path="profile" element={<SchoolProfile />} />
            <Route path="staff" element={<StaffRegistry />} />
            <Route path="holidays" element={<Holidays />} />
            <Route path="academic-years" element={<AcademicYears />} />
            <Route path="admissions" element={<Admissions />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          {/* Super Admin Panel */}
          <Route path="/superadmin" element={
            <RoleRoute role="Super_Admin"><SuperAdminDashboard /></RoleRoute>
          }>
            <Route index element={<SuperAdminHome />} />
            <Route path="dashboard" element={<SuperAdminHome />} />
            <Route path="schools" element={<AllSchools />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="security" element={<Security />} />
            <Route path="settings" element={<SystemSettings />} />
            <Route path="profile" element={<SuperAdminProfile />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="support" element={<Support />} />
            <Route path="backups" element={<Backups />} />
            <Route path="holidays" element={<SuperAdminHolidays />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="messages" element={<Messages />} />

          </Route>

          {/* Accountant Panel */}
          <Route path="/accountant" element={
            <RoleRoute role="Accountant"><AccountantLayout /></RoleRoute>
          }>
            <Route index element={<AccountantDashboard />} />
            <Route path="fees" element={<FeeCollection />} />
            <Route path="payroll" element={<PayrollManagement />} />
            <Route path="fee-structures" element={<FeeStructures />} />
            <Route path="reports" element={<FinancialReports />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="profile" element={<AccountantProfile />} />
            <Route path="messages" element={<AccountantMessages />} />
            <Route path="announcements" element={<AccountantAnnouncements />} />
          </Route>

          {/* Librarian Panel */}
          <Route path="/librarian" element={
            <RoleRoute role="Librarian"><LibrarianLayout /></RoleRoute>
          }>
            <Route index element={<LibrarianDashboard />} />
            <Route path="inventory" element={<BookInventory />} />
            <Route path="issue" element={<IssueRecords />} />
            <Route path="return" element={<IssueRecords />} />
            <Route path="records" element={<IssueRecords />} />
            <Route path="categories" element={<BookCategories />} />
            <Route path="history" element={<CirculationHistory />} />
            <Route path="students" element={<MemberRegistry />} />
            <Route path="messages" element={<LibrarianMessages />} />
          </Route>

          {/* Transporter Panel */}
          <Route path="/transporter" element={
            <RoleRoute role="Transport_Manager"><TransporterLayout /></RoleRoute>
          }>
            <Route index element={<TransporterDashboard />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="routes" element={<TransporterRoutes />} />
            <Route path="students" element={<StudentAssignment />} />
            <Route path="drivers" element={<Drivers />} />
            <Route path="logs" element={<TripLogs />} />
            <Route path="messages" element={<TransporterMessages />} />
            <Route path="profile" element={<TransporterProfile />} />
          </Route>
        </Routes>
      </Suspense>
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
