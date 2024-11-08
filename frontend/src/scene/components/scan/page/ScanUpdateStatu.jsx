import React, { useContext, useState } from 'react';
import '../scan.css';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { Link, useParams } from 'react-router-dom';
import { Button, Row, Col, Card } from 'antd';
import { CiBarcode } from "react-icons/ci";
import { MdOutlineQrCodeScanner } from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CarOutlined, CheckCircleOutlined, DeliveredProcedureOutlined, SearchOutlined, DeploymentUnitOutlined } from '@ant-design/icons';
import ScanRamasser from '../components/ScanRamasser';

const { Meta } = Card;

function ScanUpdateStatu() {
    const { theme } = useContext(ThemeContext);
    const { user } = useSelector(state => state.auth);
    const {statu} = useParams();
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
                    <div className="page-content-header">
                        <Title nom='Scan Colis' />
                    </div>
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                            padding: '20px',
                        }} 
                    >
                        <h4>Scan Pour Modifier statu</h4>
                        <ScanRamasser />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ScanUpdateStatu;
