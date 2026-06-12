import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { logout } from '../../redux/slice/auth.slice';
import Header from './Header';
import Sidebar from './Sidebar';
import { fetchNotifications, receiveNotification } from '../../redux/slice/notification.slice';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const SuperAdminDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { socket } = useSocket();

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    useEffect(() => {
        if (!socket) return;
        socket.on('NEW_NOTIFICATION', (notif) => {
            dispatch(receiveNotification(notif));
            toast.success(`System Alert: ${notif.title}`, {
                icon: '⚡',
                style: {
                    borderRadius: '1.5rem',
                    background: '#0f172a',
                    color: '#fff',
                    border: '1px solid #00f2ff',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontSize: '11px'
                }
            });
        });
        return () => socket.off('NEW_NOTIFICATION');
    }, [socket, dispatch]);

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
