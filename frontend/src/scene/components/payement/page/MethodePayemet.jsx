import React, { useContext, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import '../notification.css';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import RecData from '../../../../data/reclamation.json';
import Title from '../../../global/Title';
import { Button, Table, Tabs } from 'antd';
import { FaInfoCircle } from "react-icons/fa";
import { AiFillNotification } from "react-icons/ai";
import { MdNotificationsActive } from "react-icons/md";
import NotificationGlobale from '../components/NotificationGlobale';


const onChange = (key) => {
    console.log(key);
  }; 


function MethodePayemet() {
    const { theme } = useContext(ThemeContext);
    const [data, setData] = useState(RecData);

    const handleEtatChange = (record) => {
        const updatedData = data.map(item => 
            item.code_suivi === record.code_suivi ? { ...item, etat: true } : item
        );
        setData(updatedData);
    };

    const items = [
        {
          key: '1',
          label: <p className='title-tabs'> <AiFillNotification size={20}/>Globale Notification</p>,
          children:<NotificationGlobale theme={theme}/>,
        },
        {
          key: '2',
          label: <p className='title-tabs'> <MdNotificationsActive size={20}/>Event Notification</p>,
          children:" <ReclamationComplete theme={theme} />",
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
                        <Title nom='Notification' />
                    </div>
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                        }} 
                    >
                        <NotificationGlobale theme={theme}/>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default MethodePayemet;
