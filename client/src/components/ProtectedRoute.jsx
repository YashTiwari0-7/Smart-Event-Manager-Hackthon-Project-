import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles = [] }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm text-gray-500 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (roles.length > 0 && user && !roles.includes(user.role)) {
        // Redirect to their own dashboard based on role
        const dashboardMap = {
            admin: '/admin-dashboard',
            coordinator: '/coordinator-dashboard',
            participant: '/participant-dashboard'
        };
        return <Navigate to={dashboardMap[user.role] || '/'} replace />;
    }

    return children;
};

export default ProtectedRoute;
