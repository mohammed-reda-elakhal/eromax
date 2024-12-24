import React, { useContext, useEffect, useState } from 'react';
import { Layout, Avatar, Dropdown, Menu, Badge, Drawer, Divider, List, Card, Typography, Button } from 'antd';
import { SettingOutlined, LogoutOutlined, ProfileOutlined, DeleteOutlined } from '@ant-design/icons';
import { MdLightMode, MdNightlight } from "react-icons/md";
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';
import { logoutUser } from '../../redux/apiCalls/authApiCalls';
import { useDispatch, useSelector } from 'react-redux';
import { IoIosNotifications, IoMdExit, IoMdWallet } from 'react-icons/io';
import { FaFileArchive, FaPaypal, FaRegEyeSlash, FaStore } from 'react-icons/fa';
import { deleteAllNotifications, getNotificationUserByStore, notificationRead } from '../../redux/apiCalls/notificationApiCalls';
import { getStoreById } from '../../redux/apiCalls/profileApiCalls';
import SoldeCart from '../components/portfeuille/components/SoldeCart';
import DemandeRetrait from '../components/portfeuille/components/DemandeRetrait';
import { notificationActions } from '../../redux/slices/notificationSlice';
import { toast } from 'react-toastify';

const { Header } = Layout;
const { Text } = Typography;

function Topbar() {

  const [openNot, setOpenNot] = useState(false);
  const [showSolde, setShowSolde] = useState(false);
  const [openRetrait, setOpenRetrait] = useState(false);
  // top bar
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user , store } = useSelector((state) => state.auth);
  const storeData = useSelector((state) => state.profile.store);
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
          <Menu.Item key="logout" icon={<IoMdExit />} onClick={logoutFunction}>
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
          <Menu.Item key="logout" icon={<IoMdExit />} onClick={logoutFunction}>
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
        <Menu.Item key="store" icon={<FaStore />} onClick={() => navigate(`/dashboard/bussness`)}>
          Bussness
        </Menu.Item>
        <Menu.Item key="payement" icon={<FaPaypal />} onClick={() => navigate(`/dashboard/payement`)}>
          Payements
        </Menu.Item>
        <Menu.Item key="document" icon={<FaFileArchive />} onClick={() => navigate(`/dashboard/document`)}>
          Documents
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="logout" icon={<IoMdExit />} onClick={logoutFunction}>
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
              }}
            >
              <div className="solde-wallet" onClick={() => setShowSolde((prev) => !prev)}>
                {showSolde ? <p>{storeData.solde} <span>MAD</span></p> : <p><FaRegEyeSlash /> <span>MAD</span></p>}
              </div>
              <Avatar icon={<IoMdWallet />} size={25} className='wallet_icon' onClick={() => setOpenRetrait(true)} />
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
      <Drawer  className={theme === 'dark' ? 'dark-mode' : ''} title="Demande De Retrait" onClose={() => setOpenRetrait((prev) => !prev)} open={openRetrait}>
        <SoldeCart theme={theme} />
        <DemandeRetrait setOpenWallet={setOpenRetrait} theme={theme} />
      </Drawer>
    </Header>
  );
}

export default Topbar;
