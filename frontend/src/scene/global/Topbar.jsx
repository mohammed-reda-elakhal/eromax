import React, { useContext } from 'react';
import { Layout, Avatar, Dropdown, Menu } from 'antd';
import { SettingOutlined, LogoutOutlined, ProfileOutlined } from '@ant-design/icons';
import { MdLightMode, MdNightlight } from "react-icons/md";
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';
import { logoutUser } from '../../redux/apiCalls/authApiCalls';
import { useDispatch, useSelector } from 'react-redux';
import { IoMdExit } from 'react-icons/io';

const { Header } = Layout;

function Topbar() {
  // top bar
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const logoutFunction = () => {
    dispatch(logoutUser(navigate));
    navigate('/login');
  };

  // Dropdown menu for settings, profile, and logout
  const menu = (
    <Menu>
      <Menu.Item key="profile" icon={<ProfileOutlined />} onClick={() => navigate(`/dashboard/profile/${user._id}`)}>
        Profile
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<IoMdExit style={{ marginRight: '8px' }} />} onClick={logoutFunction}>
        Deconnecter
      </Menu.Item>
    </Menu>
  );

  return (
    <Header style={{ backgroundColor: theme === 'dark' ? '#001529' : '#fff', padding: '0 20px' }} className="top-bar">

      <div>

      </div>
      <div className="control-topbar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Theme toggle icon */}
          <Avatar onClick={toggleTheme} style={{ cursor: 'pointer' }} icon={theme === 'dark' ? <MdLightMode size={24} color="#fff" /> : <MdNightlight size={24} color="#000" />}/>
          {/* Dropdown menu for profile, settings, and logout */}
          <Dropdown overlay={menu} trigger={['click']}>
            <Avatar icon={<SettingOutlined />} style={{ cursor: 'pointer' }} />
          </Dropdown>
        </div>
      </div>
    </Header>
  );
}

export default Topbar;
