import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import '../compte.css'
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { PlusCircleFilled } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import TableDashboard from '../../../global/TableDashboard';
import { Tabs } from 'antd';
import { CiBarcode } from "react-icons/ci";
import { MdQrCodeScanner , MdAdminPanelSettings , MdDeliveryDining , MdSupportAgent } from "react-icons/md";
import { FaRegUserCircle } from "react-icons/fa";
import Livreur from './Livreur';
import Client from './Client';
import Team from './Team';


const onChange = (key) => {
    console.log(key);
  }; 
  
 

function Compte() {
    const { theme } = useContext(ThemeContext);
    const items = [
        {
          key: '1',
          label: <p className='title-tabs'> <MdDeliveryDining size={20}/>Livreur</p>,
          children: <Livreur theme={theme}/>,
        },
        {
          key: '2',
          label: <p className='title-tabs'> <FaRegUserCircle size={20}/>Client</p>,
          children: <Client theme={theme} />,
        },
        {
            key: '3',
            label: <p className='title-tabs'> <MdSupportAgent size={20}/>Team</p>,
            children: <Team/>,
        },
        {
            key: '4',
            label: <p className='title-tabs'> <MdAdminPanelSettings size={20}/>Admin</p>,
            children: "tab 4",
        },
    ];
  

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
                        <h4>Gestion des utilisateurs</h4>
                        <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Compte;
