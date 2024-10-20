import React, { useContext, useState } from 'react';
import '../scan.css';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { PlusCircleFilled } from '@ant-design/icons';
import ColisData from '../../../../data/colis.json';
import { Link } from 'react-router-dom';
import { Button, Select, Tabs } from 'antd';
import ScanQrcode from '../components/ScanQrcode';
import { CiBarcode } from "react-icons/ci";
import { MdQrCodeScanner } from "react-icons/md";
import ScanBarcode from '../components/ScanBarcode';

const { Option } = Select;

function Scan() {
    const { theme } = useContext(ThemeContext);
    const [oldStatus, setOldStatus] = useState(null);
    const [newStatus, setNewStatus] = useState(null);
    const [selectedLivreur, setSelectedLivreur] = useState(null);
    const [livreurs, setLivreurs] = useState(['Livreur 1', 'Livreur 2', 'Livreur 3']); // Example list of livreurs

    const handleOldStatusChange = (value) => {
        setOldStatus(value);
    };

    const handleNewStatusChange = (value) => {
        setNewStatus(value);
        if (value !== 'expidie') {
            setSelectedLivreur(null); // Reset livreur selection if not 'expidie'
        }
    };

    const handleLivreurChange = (value) => {
        setSelectedLivreur(value);
    };

    const items = [
        {
          key: '1',
          label: <p className='title-tabs'> <CiBarcode size={20}/>bar code</p>,
          children: <ScanBarcode />,
        },
        {
          key: '2',
          label: <p className='title-tabs'> <MdQrCodeScanner size={20}/> Qr code</p>,
          children: <ScanQrcode theme={theme} statu={newStatus} livreur={selectedLivreur} />,
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
                    </div>
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                        }} 
                    >
                        <h4>Scan Colis</h4>

                        {/* Add Select components for old status, new status, and conditional livreur */}
                        <div style={{ marginBottom: '16px' }}>
                            <Select 
                                placeholder="Select New Status" 
                                style={{ width: 200, marginLeft: '16px' }} 
                                onChange={handleNewStatusChange}
                            >
                                <Option value="attend de ramassage">Attente de Ramassage</Option>
                                <Option value="ramasse">Ramassé</Option>
                                <Option value="expidie">Expédié</Option>
                                <Option value="recu">Reçu</Option>
                                <Option value="mise en distribution">Mise en Distribution</Option>
                                <Option value="livree">Livrée</Option>
                                <Option value="annule">Annulé</Option>
                                <Option value="refusee">Refusée</Option>
                            </Select>

                            {newStatus === 'expidie' && (
                                <Select 
                                    placeholder="Select Livreur" 
                                    style={{ width: 200, marginLeft: '16px' }} 
                                    onChange={handleLivreurChange}
                                >
                                    {livreurs.map((livreur, index) => (
                                        <Option key={index} value={livreur}>{livreur}</Option>
                                    ))}
                                </Select>
                            )}
                        </div>

                        <Tabs defaultActiveKey="1" items={items} />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Scan;
