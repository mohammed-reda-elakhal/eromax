import React, { useContext, useEffect, useState } from 'react';
import { Layout, Avatar, Dropdown, Menu, Badge, Drawer, Divider, List, Card, Typography, Button } from 'antd';
import { ThemeContext } from '../ThemeContext';
import { UserOutlined, DeleteOutlined } from '@ant-design/icons';
import { MdLightMode, MdNightlight } from "react-icons/md";
import { Link, useNavigate } from 'react-router-dom';
import { ImProfile, ImExit } from "react-icons/im";
import { IoIosNotifications, IoMdWallet } from "react-icons/io"; // Correct import
import { FaRegEyeSlash } from "react-icons/fa";
import DemandeRetrait from '../components/portfeuille/components/DemandeRetrait';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../redux/apiCalls/authApiCalls';
import { getStoreById } from '../../redux/apiCalls/profileApiCalls';
import SoldeCart from '../components/portfeuille/components/SoldeCart';
import { getNotificationUserByStore, notificationRead } from '../../redux/apiCalls/notificationApiCalls';
import { useSwipeable } from 'react-swipeable'; // Correct import
import { notificationActions } from '../../redux/slices/notificationSlice';

const { Text } = Typography;
const { Header } = Layout;

const styleIcon = {
  color: 'var(--gray)',
  fontSize: '24',
  cursor: 'pointer',
};

let menu;

function SwipeableNotification({ children, onSwipeLeft }) {
  const handlers = useSwipeable({
    onSwipedLeft: onSwipeLeft,
  });

  return <div {...handlers}>{children}</div>;
}

function Topbar() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [open, setOpen] = useState(false);
  const [showSolde, setShowSolde] = useState(false);
  const [openRetrait, setOpenRetrait] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, store } = useSelector((state) => state.auth);
  const storeData = useSelector((state) => state.profile.store);
  const notificationUser = useSelector((state) => state.notification.notification_user);

  useEffect(() => {
    if (user?.role === "client") {
      dispatch(getStoreById(store?._id));
      dispatch(getNotificationUserByStore());
    }else if(user?.role === "livreur"){
      dispatch(getNotificationUserByStore());
    }
  }, [dispatch, user, store]);

  const logoutFunction = () => {
    dispatch(logoutUser(navigate));
    navigate('/login');
  };

  menu = (
    <Menu>
      <Menu.Item style={{ width: "150px" }} key="ramasse">
        <Link className='link_topbar' to={`/dashboard/profile/${user._id}`}>
          <ImProfile /> Profile
        </Link>
      </Menu.Item>
      <Menu.Item style={{ width: "150px" }} key="exit">
        <Link className='link_topbar' onClick={logoutFunction} to={'/login'}>
          <ImExit /> Deconnecter
        </Link>
      </Menu.Item>
    </Menu>
  );

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const onDelete = (id) => {
    try {
      // Immediately remove the notification from the UI
      dispatch(notificationActions.removeNotificationUser(id));
  
      // Call the API to update the notification's `is_read` status
      dispatch(notificationRead(id));
    } catch (error) {
      console.log(error);
    }
  };
  

  return (
    <Header style={{ backgroundColor: theme === 'dark' ? '#001529' : '#fff' }} className='top-bar'>
      <div>
        {user?.role === 'client' && (
          <div
            className="topbar-walet"
            style={{
              backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray1)',
              color: theme === 'dark' ? '#fff' : '#002242',
            }}
          >
            <div className="solde-wallet" onClick={() => { setShowSolde((prev) => !prev); }}>
              {showSolde ? <p>{storeData.solde} <span>MAD</span></p> : <p><FaRegEyeSlash /> <span>MAD</span></p>}
            </div>
            <Avatar icon={<IoMdWallet />} size={25} className='wallet_icon' onClick={() => setOpenRetrait(true)} />
          </div>
        )}
      </div>
      <div className="control-topbar">
        {theme === 'dark' ? <MdNightlight onClick={toggleTheme} style={styleIcon} /> : <MdLightMode onClick={toggleTheme} style={styleIcon} />}
        <Badge count={notificationUser.length} onClick={showDrawer} style={{ cursor: "pointer" }}>
          <Avatar icon={<IoIosNotifications />} style={{ cursor: "pointer" }} />
        </Badge>

        <Drawer title="Notification" onClose={onClose} open={open} width={400}>
          <List
            dataSource={notificationUser}
            renderItem={(not) => (
                <List.Item key={not._id}>
                  <Card
                    style={{ width: '100%' }}
                    actions={[
                      <Button type="text" onClick={() => onDelete(not._id)} icon={<DeleteOutlined />} />,
                    ]}
                  >
                    <h4>{not.title}</h4>
                    <div className="content_notification">
                      <Text>{not.description}</Text>
                      <Divider />
                      <Text type="secondary">{new Date(not.createdAt).toLocaleString()}</Text>
                    </div>
                  </Card>
                </List.Item>
            )}
          />
        </Drawer>

        <Dropdown overlay={menu}>
          <Avatar icon={<UserOutlined />} style={{ cursor: "pointer" }} />
        </Dropdown>
      </div>

      <Drawer title="Demande De Retrait" onClose={() => setOpenRetrait((prev) => !prev)} open={openRetrait}>
        <SoldeCart theme={theme} />
        <DemandeRetrait setOpenWallet={setOpenRetrait} theme={theme} />
      </Drawer>
    </Header>
  );
}

export default Topbar;
