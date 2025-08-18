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
import { deleteAllNotifications, getNotificationUserByStore, notificationRead } from '../../redux/apiCalls/notificationApiCalls';
import { getStoreById } from '../../redux/apiCalls/profileApiCalls';
import SoldeCart from '../components/portfeuille/components/SoldeCart';
import DemandeRetrait from '../components/portfeuille/components/DemandeRetrait';
import { notificationActions } from '../../redux/slices/notificationSlice';
import { toast } from 'react-toastify';
import InfoWalet from '../components/portfeuille/page/InfoWalet';
import WalletInfo from '../components/portfeuille/components/WalletInfo';

const { Header } = Layout;
const { Text } = Typography;

function Topbar() {

  const [openNot, setOpenNot] = useState(false);
  const [showSolde, setShowSolde] = useState(false);
  const [openRetrait, setOpenRetrait] = useState(false);
  // top bar
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user , store } = useSelector((state) => state.auth);
  const { selectedWallet } = useSelector((state) => state.wallet);
  const notificationUser = useSelector((state) => state.notification.notification_user);

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
      dispatch(getNotificationUserByStore());
    } else if(user?.role === "livreur"){
      dispatch(getNotificationUserByStore());
    }
  }, [dispatch]);

  const handleDeleteAll = () => {
    // Assuming we have the user ID in user._id
    if (user && user._id) {
      dispatch(deleteAllNotifications(user._id));
    } else {
      toast.error("User not found");
    }
  };


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

  const onDelete = (id) => {
    try {
      dispatch(notificationActions.removeNotificationUser(id));
      dispatch(notificationRead(id));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Header style={{ backgroundColor: theme === 'dark' ? '#001529' : '#fff', padding: '0 20px' }} className="top-bar">
      <div>

      </div>
      <div className="control-topbar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' , gap:'12px' }}>
          {/* Store wallet for client */}
          {user?.role === 'client' && (
            <div
              className="topbar-walet"
              style={{
                backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray1)',
                color: theme === 'dark' ? '#fff' : '#002242',
                padding: '8px 16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: `1px solid ${theme === 'dark' ? '#1890ff' : '#e8e8e8'}`
              }}
              onClick={() => setShowSolde(prev => !prev)}
            >
              <div 
                className="solde-wallet"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {showSolde ? (
                  <>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>
                      {selectedWallet?.solde?.toLocaleString() || '0'} <span>DH</span>
                    </p>
                    <FaRegEye 
                      style={{ 
                        color: theme === 'dark' ? '#1890ff' : '#1890ff',
                        fontSize: '16px'
                      }} 
                    />
                  </>
                ) : (
                  <>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>
                      •••••• <span>DH</span>
                    </p>
                    <FaRegEyeSlash 
                      style={{ 
                        color: theme === 'dark' ? '#1890ff' : '#1890ff',
                        fontSize: '16px'
                      }} 
                    />
                  </>
                )}
              </div>
              <Avatar 
                icon={<IoMdWallet />} 
                size={25} 
                className='wallet_icon' 
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenRetrait(true);
                }}
                style={{
                  backgroundColor: theme === 'dark' ? '#1890ff' : '#1890ff',
                  cursor: 'pointer'
                }}
              />
            </div>
          )}

          {
            user?.role === "admin" ? "":
            /* Notification element */
            <Badge count={notificationUser.length} onClick={() => setOpenNot(prev => !prev)} style={{ cursor: "pointer" }}>
              <Avatar icon={<IoIosNotifications />} style={{ cursor: "pointer" }} />
            </Badge>
          }
         

          {/* Notification drawer */}
          <Drawer
            className={theme === 'dark' ? 'dark-mode' : ''}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Notification</span>
                <Button 
                  type="primary" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={handleDeleteAll}
                  size="small"
                >
                  Touts
                </Button>
              </div>
            }
            onClose={() => setOpenNot(prev => !prev)}
            open={openNot}
            width={400}
          >
            <List
              dataSource={notificationUser}
              itemLayout="vertical"
              renderItem={(not) => (
                <List.Item
                  key={not._id}
                  extra={
                    <Button 
                      type="text" 
                      size="small" 
                      onClick={() => onDelete(not._id)} 
                      icon={<DeleteOutlined />} 
                    />
                  }
                  style={{ padding: '8px 0' }}
                >
                  <List.Item.Meta
                    title={
                      <Text strong style={{ fontSize: '14px', marginBottom: '4px', display: 'block' }}>
                        {not.title}
                      </Text>
                    }
                    description={
                      <>
                        <Text style={{ fontSize: '13px' }}>{not.description}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {new Date(not.createdAt).toLocaleString()}
                        </Text>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Drawer>


          {/* Theme toggle */}
          <Avatar onClick={toggleTheme} style={{ cursor: 'pointer' }} icon={theme === 'dark' ? <MdLightMode size={24} color="#fff" /> : <MdNightlight size={24} color="#000" />} />

          {/* Dropdown menu for profile, settings, and logout */}
          <Dropdown overlay={getMenuItems()} trigger={['click']}>
            <Avatar icon={<SettingOutlined />} style={{ cursor: 'pointer' }} />
          </Dropdown>
        </div>
      </div>

      {/* Withdraw request drawer */}
      <Drawer className={theme === 'dark' ? 'dark-mode' : ''} title="Wallet Information" onClose={() => setOpenRetrait((prev) => !prev)} open={openRetrait}>
        <WalletInfo theme={theme} showTransactions={false} />
      </Drawer>
    </Header>
  );
}

export default Topbar;
