import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import '../ville.css'
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import tarifData from '../../../../data/tarif.json'
import Title from '../../../global/Title';
import { Button, Image, Tabs } from 'antd';
import { FaInfoCircle, FaPenFancy, FaPlus, FaRegUser , FaStore } from "react-icons/fa";
import { MdPayment , MdOutlineSecurity, MdDelete } from "react-icons/md";
import TableDashboard from '../../../global/TableDashboard';
import { Link } from 'react-router-dom';


function Ville() {
    const { theme } = useContext(ThemeContext);
    const columns = [
        {
            title: 'Ref',
            dataIndex: 'ref',
            key : 'ref'
        },
        {
            title: 'Nom',
            dataIndex: 'nom',
            key : "nom"
        },
        {
            title: 'Tarif',
            dataIndex: 'tarif',                                                  
            key: 'tarif',
        },
       
        {
            title: 'Action',
            dataIndex: 'action',
            render: (text, record) => (
                <div className='action_user'>
                    <Button 
                        style={{color: 'var(--limon)' , borderColor:"var(--limon)" }} 
                        icon={<FaPenFancy size={20} />}
                    ></Button>
                    <Button 
                        style={{color: 'red' , borderColor:"red" }} 
                        icon={<MdDelete size={20} />}
                        // Add delete logic here
                    ></Button>
                    <Button 
                        style={{color: 'blue' , borderColor:"blue   "}} 
                        icon={<FaInfoCircle size={20} />}
                        // Add more info logic here
                    ></Button>
                </div>
            )
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
                        <Title nom='Ville et Tarif' />
                        
                    </div>
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                        }} 
                    >
                        <h4>Tarif</h4>
                        <Button
                            icon = {<FaPlus/>}
                            type='primary'
                        >
                            Ajouter Tarif
                        </Button>
                        <TableDashboard theme={theme} column={columns} id="id" data={tarifData} />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Ville;
