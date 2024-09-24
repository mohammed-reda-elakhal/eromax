import React, { useContext, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import '../reclamation.css';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import RecData from '../../../../data/reclamation.json';
import Title from '../../../global/Title';
import { Button, Table, Tabs } from 'antd';
import { FaInfoCircle } from "react-icons/fa";
import { MdOutlineDomainVerification } from "react-icons/md";
import { MdOutlineDangerous } from "react-icons/md";
import ReclamationComplete from '../components/ReclamationComplete';
import ReclamationIncomplete from '../components/ReclamationIncomplete';


const onChange = (key) => {
    console.log(key);
  }; 


function Reclamation() {
    const { theme } = useContext(ThemeContext);
    const [data, setData] = useState(RecData);

    const handleEtatChange = (record) => {
        const updatedData = data.map(item => 
            item.code_suivi === record.code_suivi ? { ...item, etat: true } : item
        );
        setData(updatedData);
    };

    const columns = [
        {
            title: 'Nom Store',
            dataIndex: 'nom',
            key: 'nom'
        },
        {
            title: 'Client',
            dataIndex: 'client',
            key: "client"
        },
        {
            title: 'Telephone',
            dataIndex: 'tele',
            key: 'tele',
        },
        {
            title: 'Code Suivi',
            dataIndex: 'code_suivi',
            key: 'code_suivi',
        },
        {
            title: 'Reclamation',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Etat',
            dataIndex: 'etat',
            key: 'etat',
            render: (etat) => (
                <span style={{ color: etat ? 'green' : 'red' }}>
                    {etat ? 'Complète' : 'Incomplète'}
                </span>
            )
        },
        {
            title: 'Action',
            dataIndex: 'action',
            render: (text, record) => (
                <div className='action_user'>
                    {!record.etat && (
                        <Button 
                            type = 'primary'
                            onClick={() => handleEtatChange(record)}
                        >
                            Complete
                        </Button>
                    )}
                </div>
            )
        }
    ];

    const items = [
        {
          key: '1',
          label: <p className='title-tabs'> <MdOutlineDangerous size={20}/>InComplete</p>,
          children: <ReclamationIncomplete theme={theme}/>,
        },
        {
          key: '2',
          label: <p className='title-tabs'> <MdOutlineDomainVerification size={20}/>Complete</p>,
          children: <ReclamationComplete theme={theme} />,
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
                        <Title nom='Reclamation' />
                    </div>
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                        }} 
                    >
                        <ReclamationIncomplete theme={theme}/>,
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Reclamation;
