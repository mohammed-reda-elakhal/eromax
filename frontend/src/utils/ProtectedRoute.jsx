import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const { user, selectedStore } = useSelector((state) => state.auth);
    
    if (!user) {
        return <Navigate to="/login" />;
    }

    // If user is a client and hasn't selected a store, redirect to select store page
    if (user.role === 'client' && !selectedStore) {
        return <Navigate to="/dashboard/select-store" />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
