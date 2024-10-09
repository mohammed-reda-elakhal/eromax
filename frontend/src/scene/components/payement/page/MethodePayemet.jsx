import React, { useContext, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import '../payement.css';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import RecData from '../../../../data/reclamation.json';
import Title from '../../../global/Title';
import { Button, Table, Tabs } from 'antd';
import { FaInfoCircle } from "react-icons/fa";
import { AiFillNotification } from "react-icons/ai";
import { MdNotificationsActive } from "react-icons/md";
import ListMethodePayement from '../components/ListMethodePayement';
import { PlusCircleFilled } from '@ant-design/icons';
import { Link } from 'react-router-dom';


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
                        <Link to={`/dashboard/payement/ajouter`} className='btn-dashboard'>
                            <PlusCircleFilled style={{marginRight:"8px"}} />
                            Ajouter Methode Payement
                        </Link>
                    </div>
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                        }} 
                    >
                        <ListMethodePayement/>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default MethodePayemet;
