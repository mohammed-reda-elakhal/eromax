import React, { useContext } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import { Typography, Button, Space } from 'antd';
import { FaDownload, FaExchangeAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import '../portfeuille.css'
import SoldeCart from '../components/SoldeCart';
import Solde from '../components/Solde';
import DemandeRetrait from '../components/DemandeRetrait';
import DemandeRetraitTable from '../../payement/page/DemandeRetraitTable';
import TransactionTable from '../../payement/page/TransactionTable';
import RetraitTable from '../components/RetraitTable';

function Portfeuille() {
    const { theme } = useContext(ThemeContext);
    const navigate = useNavigate();

    return (
        <div className='page-dashboard'>
            <Menubar />
            <main className="page-main">
                <Topbar />
                <div
                    className="page-content"
                    style={{
                        backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray1)',
                        color: theme === 'dark' ? '#fff' : '#002242',
                    }}
                >
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <Typography.Title level={4}>Portfeuille</Typography.Title>
                        </div>
                        
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Portfeuille