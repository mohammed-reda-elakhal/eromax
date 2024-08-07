import React, { useContext, useEffect, useState } from 'react';
import '../scan.css'
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { PlusCircleFilled } from '@ant-design/icons';
import ColisData from '../../../../data/colis.json';
import { Link } from 'react-router-dom';
import TableDashboard from '../../../global/TableDashboard';
import { MdDeliveryDining } from "react-icons/md";
import { Button } from 'antd';
import ScanQrcode from '../components/ScanQrcode';
import { Tabs } from 'antd';
import { CiBarcode } from "react-icons/ci";
import { MdQrCodeScanner } from "react-icons/md";


const onChange = (key) => {
    console.log(key);
  };
 

function Scan() {
    const { theme } = useContext(ThemeContext);
    const items = [
        {
          key: '1',
          label: <p className='title-tabs'> <CiBarcode size={20}/>bar code</p>,
          children: 'Scanne use bar code and appareil de scan ',
        },
        {
          key: '2',
          label: <p className='title-tabs'> <MdQrCodeScanner size={20}/> Qr code</p>,
          children: <ScanQrcode theme={theme} />,
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
                    <div className="page-content-header">
                        <Title nom='Scan Colis' />
                        <Link to={`/dashboard/ajouter-colis/simple`} className='btn-dashboard'>
                            <PlusCircleFilled style={{marginRight:"8px"}} />
                            Ajouter Colis
                        </Link>
                    </div>
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                        }} 
                    >
                        <h4>Scan Colis</h4>
                        <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Scan;
