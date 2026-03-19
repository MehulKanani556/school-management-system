import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Dashboard from './dashboard/Dashboard';

const Home = () => {
    const { user, loading } = useSelector((state) => state.auth);

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-background flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (user?.role === 'Super_Admin') {
        return <Navigate to="/superadmin" replace />;
    }

    return <Dashboard />;
};

export default Home;
