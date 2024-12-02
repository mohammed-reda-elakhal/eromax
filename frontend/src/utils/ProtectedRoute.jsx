import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import Cookies from "js-cookie";

const ProtectedRoute = () => {
    const { user } = useSelector((state) => state.auth);
    const token = localStorage.getItem('token');
    
    if (!user) {
        return <Navigate to="/login" />;
    }

    if (!token) {
        return <Navigate to="/login" />;
    }



    return <Outlet />;
};

export default ProtectedRoute;