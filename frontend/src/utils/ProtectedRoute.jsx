import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import Cookies from "js-cookie";
import { FloatButton, Tooltip } from 'antd';
import { QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { FaWhatsapp } from 'react-icons/fa';

const phoneNumber = '+212630087302';

const ProtectedRoute = () => {
    const { user } = useSelector((state) => state.auth);
    const token = localStorage.getItem('token');

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (!token) {
        return <Navigate to="/login" />;
    }

    return (
        <>
            <Outlet />
            <Tooltip title="Contactez-nous sur WhatsApp">
                <FloatButton 
                    icon={<FaWhatsapp style={{ color: 'green' }} />} 
                    onClick={() => {
                        const message = `Bonjour, je suis ${user.nom} ${user.prenom}.`;
                        const encodedMessage = encodeURIComponent(message);
                        const whatsappUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(phoneNumber)}&text=${encodedMessage}`;
                        window.open(whatsappUrl, '_blank');
                    }}
                    style={{ 
                        insetInlineEnd: 20,
                        backgroundColor: '#25D366', // WhatsApp Green
                        borderColor: '#25D366',
                        color: '#fff'
                    }} 
                />
            </Tooltip>
        </>
    );
};

export default ProtectedRoute;
