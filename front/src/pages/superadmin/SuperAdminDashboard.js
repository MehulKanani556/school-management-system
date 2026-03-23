import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { logout } from '../../redux/slice/auth.slice';
import Header from './Header';
import Sidebar from './Sidebar';

const SuperAdminDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <div className="h-screen bg-brand-background text-slate-100 flex font-inter antialiased overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {/* Header - Stays at top */}
                <Header user={user} onLogout={handleLogout} />

                {/* This section scrolls */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
