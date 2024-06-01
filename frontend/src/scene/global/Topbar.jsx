import React, { useContext } from 'react';
import { Switch, Layout , Avatar, Tooltip } from 'antd';
import { ThemeContext } from '../ThemeContext';
import {  UserOutlined } from '@ant-design/icons';
import { MdLightMode  , MdNightlight} from "react-icons/md";
import { Link } from 'react-router-dom';

const { Header } = Layout;

const styleIcon = {
    color : 'var(--gray)',
    fontSize : '24',
    cursor : 'pointer'
}
function Topbar() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
      <Header
        style={{
          backgroundColor: theme === 'dark' ? '#001529' : '#fff',
        }}
        className='top-bar'
      >
        <div className="topbar-logo">
        </div>
        <div className="control-topbar">
            {
                theme === 'dark' ? 
                    <MdNightlight onClick={toggleTheme} style={styleIcon}/> 
                        : 
                    <MdLightMode onClick={toggleTheme} style={styleIcon}/>
            }
            <Tooltip title="Profile" placement="top">
                <Link>
                    <Avatar
                        icon={<UserOutlined />}
                    />
                </Link>
            </Tooltip>
        </div>
      </Header>
  );
}

export default Topbar;
