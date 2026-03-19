import React from 'react';
import './App.css';
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
    return <Home />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login"  element={!isAuthenticated ? <Auth /> : <Navigate to="/" />} />
        <Route path="/signup" element={!isAuthenticated ? <Auth /> : <Navigate to="/" />} />
        <Route path="/" element={<HomeRedirect />} />

        {/* School Admin Panel */}
        <Route path="/school-admin" element={
          <RoleRoute role="School_Admin"><SchoolAdminLayout /></RoleRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="students"   element={<Students />} />
          <Route path="teachers"   element={<Teachers />} />
          <Route path="classes"    element={<Classes />} />
          <Route path="fees"       element={<Fees />} />
          <Route path="exams"      element={<Exams />} />
          <Route path="attendance" element={<Attendance />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppRoutes />
      </PersistGate>
    </Provider>
  );
}

export default App;
