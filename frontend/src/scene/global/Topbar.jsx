import React, { useContext, useState } from 'react';
import { Switch, Layout , Avatar, Tooltip, Dropdown, Menu, Badge, Drawer, Divider } from 'antd';
import { ThemeContext } from '../ThemeContext';
import {  UserOutlined } from '@ant-design/icons';
import { MdLightMode  , MdNightlight} from "react-icons/md";
import { Link } from 'react-router-dom';
import { ImProfile , ImExit } from "react-icons/im";
import { IoIosNotifications } from "react-icons/io";
import { IoClose } from "react-icons/io5";

const { Header } = Layout;

const menu = (
  <Menu>
    <Menu.Item style={{width:"150px"}} key="ramasse">
      <Link className='link_topbar' to="/dashboard/profile">
        <ImProfile/>
        Profile
      </Link>
    </Menu.Item>
    <Menu.Item style={{width:"150px"}} key="exit">
      <Link className='link_topbar' to="/dashboard/home ">
        <ImExit/>
        Deconnecter
      </Link>
    </Menu.Item>
  </Menu>
);
const notifications = [
  {
    "id": 1,
    "title":"Nouvelle Promotion",
    "Description":"Dans nouvelle nous offre a notre client fédille possibilitée de mettre leurs stock",
    "date": "26 Jui , 18:05"
  },
  {
    "id": 2,
    "title":"Remerciement",
    "Description":"EROMAX est remercier pour votre confiance, pour profits notre service",
    "date": "26 Jui , 18:05"
  }
]

const styleIcon = {
    color : 'var(--gray)',
    fontSize : '24',
    cursor : 'pointer'
}

function Topbar() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [open, setOpen] = useState(false);
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

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
            <Badge count={5} onClick={showDrawer}>
              <Avatar icon={<IoIosNotifications/>}/>
            </Badge>  
            <Drawer title="Notification" onClose={onClose} open={open}>
              {
                notifications.map((not)=>(
                  <div key={not.id} className='notification_container'>
                    <IoClose className='notification_icon_close'/>
                    <h4>{not.title}</h4>
                    <div className="content_notification">
                        <p>{not.Description}</p>
                        <span>{not.date}</span>
                    </div>
                    <Divider/>
                  </div>
                ))
              }
            </Drawer>
            <Dropdown overlay={menu}>
              <Avatar
                    icon={<UserOutlined />}
                />
            </Dropdown> 
        </div>
      </Header>
  );
}

export default Topbar;
