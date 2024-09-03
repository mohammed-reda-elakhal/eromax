import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import '../compte.css'
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { PlusCircleFilled } from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import TableDashboard from '../../../global/TableDashboard';
import { Tabs } from 'antd';
import { CiBarcode } from "react-icons/ci";
import { MdQrCodeScanner , MdAdminPanelSettings , MdDeliveryDining , MdSupportAgent } from "react-icons/md";
import { FaRegUserCircle } from "react-icons/fa";
import Livreur from './Livreur';
import Client from './Client';
import Team from './Team';
import ClientFormUpdate from '../components/ClientFormUpdate';


const onChange = (key) => {
    console.log(key);
  }; 
  
 

function FormClient() {
    const { theme } = useContext(ThemeContext);
    const {id} = useParams()

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
                        <Title nom='Gestion des utilisateurs' />
                    </div>
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                        }} 
                    >
                        <h4>Gestion des utilisateurs</h4>
                        <ClientFormUpdate />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default FormClient;
