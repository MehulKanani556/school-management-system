import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import toast from 'react-hot-toast';
import { logout } from '../../redux/slice/auth.slice';

import Header from './Header';
import Sidebar from './Sidebar';

const SuperAdminDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        toast.success('Session terminated successfully');
    };

    return (
        <div className="min-h-screen bg-brand-background text-slate-100 flex flex-col font-inter antialiased">
            <main className="flex-1 w-full flex flex-col lg:flex-row relative z-10">
                <div className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0 h-screen">
                    <Sidebar />
                </div>

                <div className="flex-1 min-w-0">
                    <Header user={user} onLogout={handleLogout} />

                    <div className="p-8">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SuperAdminDashboard;
