import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import '../profile.css'
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { Image, Tabs } from 'antd';
import { FaRegUser , FaStore } from "react-icons/fa";
import { IoDocumentAttach } from "react-icons/io5";
import { MdPayment , MdOutlineSecurity } from "react-icons/md";
import ProfileInfo from '../components/ProfileInfo';


function Profile() {
    const { theme } = useContext(ThemeContext);
    const items = [
        {
          key: '1',
          label: <p className='title-tabs'> <FaRegUser size={20}/>Information</p>,
          children: <ProfileInfo/>,
        },
        {
          key: '2',
          label: <p className='title-tabs'> <IoDocumentAttach size={20}/>Document</p>,
          children: 'Content of Tab Pane 2',
        },
        {
          key: '3',
          label: <p className='title-tabs'> <FaStore size={20}/>Bussness</p>,
          children: 'Content of Tab Pane 3',
        },
        {
            key: '4',
            label: <p className='title-tabs'> <MdPayment size={20}/>Payement</p>,
            children: 'Content of Tab Pane 4',
        },
        {
            key: '5',
            label: <p className='title-tabs'> <MdOutlineSecurity size={20}/>Sécuritée</p>,
            children: 'Content of Tab Pane 5',
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
                        <Title nom='Profile' />
                    </div>
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                        }} 
                    >
                        <h4>Profile</h4>
                        <Tabs defaultActiveKey="1" items={items} />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Profile;
