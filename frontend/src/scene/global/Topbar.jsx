import React, { useContext, useEffect, useState } from 'react';
import { Layout, Avatar, Dropdown, Menu, Badge, Drawer, Divider, List, Card, Typography, Button } from 'antd';
import { SettingOutlined, LogoutOutlined, ProfileOutlined, DeleteOutlined } from '@ant-design/icons';
import { MdLightMode, MdNightlight } from "react-icons/md";
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';
import { logoutUser } from '../../redux/apiCalls/authApiCalls';
import { useDispatch, useSelector } from 'react-redux';
import { IoIosNotifications, IoMdExit, IoMdWallet } from 'react-icons/io';
import { FaFileArchive, FaPaypal, FaRegEyeSlash, FaRegEye, FaStore } from 'react-icons/fa';
import { getStoreById } from '../../redux/apiCalls/profileApiCalls';

const { Header } = Layout;
const { Text } = Typography;

function Topbar() {
  // top bar
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user , store } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const logoutFunction = () => {
    navigate('/login');
    dispatch(logoutUser(navigate));
    window.location.reload();
  };

  useEffect(() => {
    if (user?.role === "client") {
      dispatch(getStoreById(store?._id));
    } else if(user?.role === "livreur"){
    }
  }, [dispatch]);


  // Dropdown menu based on role
  const getMenuItems = () => {
    if (user?.role === 'admin') {
      return (
        <Menu>
          <Menu.Item key="profile" icon={<ProfileOutlined />} onClick={() => navigate(`/dashboard/profile/${user._id}`)}>
            Profile
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="logout" icon={<IoMdExit />} onClick={logoutFunction} style={{ color: '#ff4d4f' }}>
            Deconnecter
          </Menu.Item>
        </Menu>
      );
    }

    if (user?.role === 'livreur') {
      return (
        <Menu>
          <Menu.Item key="profile" icon={<ProfileOutlined />} onClick={() => navigate(`/dashboard/profile/${user._id}`)}>
            Profile
          </Menu.Item>
          <Menu.Item key="document" icon={<FaFileArchive />} onClick={() => navigate(`/dashboard/document`)}>
            Documents
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="logout" icon={<IoMdExit />} onClick={logoutFunction} style={{ color: '#ff4d4f' }}>
            Deconnecter
          </Menu.Item>
        </Menu>
      );
    }

    // For client role, display all items
    return (
      <Menu>
        <Menu.Item key="profile" icon={<ProfileOutlined />} onClick={() => navigate(`/dashboard/profile/${user._id}`)}>
          Profile
        </Menu.Item>
        <Menu.Item key="document" icon={<FaFileArchive />} onClick={() => navigate(`/dashboard/document`)}>
          Documents
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="logout" icon={<IoMdExit />} onClick={logoutFunction} style={{ color: '#ff4d4f' }}>
          Deconnecter
        </Menu.Item>
      </Menu>
    );
  };


  return (
    <Header style={{ backgroundColor: theme === 'dark' ? '#001529' : '#fff', padding: '0 20px' }} className="top-bar">
      <div>

      </div>
      <div className="control-topbar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' , gap:'12px' }}>
         
         


          {/* Theme toggle */}
          <Avatar onClick={toggleTheme} style={{ cursor: 'pointer' }} icon={theme === 'dark' ? <MdLightMode size={24} color="#fff" /> : <MdNightlight size={24} color="#000" />} />

          {/* Dropdown menu for profile, settings, and logout */}
          <Dropdown overlay={getMenuItems()} trigger={['click']}>
            <Avatar icon={<SettingOutlined />} style={{ cursor: 'pointer' }} />
          </Dropdown>
        </div>
      </div>

    
    </Header>
  );
}

export default Topbar;
