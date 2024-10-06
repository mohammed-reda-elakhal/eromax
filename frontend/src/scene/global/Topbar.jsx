import React, { useContext, useEffect, useState } from 'react';
import {  Layout , Avatar, Dropdown, Menu, Badge, Drawer, Divider } from 'antd';
import { ThemeContext } from '../ThemeContext';
import {  UserOutlined } from '@ant-design/icons';
import { MdLightMode  , MdNightlight} from "react-icons/md";
import { Link , useNavigate } from 'react-router-dom';
import { ImProfile , ImExit } from "react-icons/im";
import { IoIosNotifications } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { IoWallet } from "react-icons/io5";
import { FaRegEyeSlash } from "react-icons/fa";
import DemandeRetrait from '../components/portfeuille/components/DemandeRetrait';
import { useDispatch , useSelector } from 'react-redux';
import { logoutUser } from '../../redux/apiCalls/authApiCalls';
import { getStoreById } from '../../redux/apiCalls/profileApiCalls';


const { Header } = Layout;


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
let menu;

function Topbar() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [open, setOpen] = useState(false);
  const [showSolde, setShowSolde] = useState(false);
  const [openRetrait, setOpenRetrait] = useState(false);
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const {user , store} = useSelector(state => state.auth)
  const  storeData = useSelector(state => state.profile.store)


  useEffect(()=>{
   if(user?.role ==="client"){
    dispatch(getStoreById(store?._id))
   }
  },[dispatch])
  menu = (
    <Menu>
      <Menu.Item style={{width:"150px"}} key="ramasse">
        <Link className='link_topbar' to={`/dashboard/profile/${user._id}`}>
          <ImProfile/>
          Profile
        </Link>
      </Menu.Item>
      <Menu.Item style={{width:"150px"}} key="exit">
        <Link 
          className='link_topbar'
          onClick={()=>dispatch(logoutUser(navigate))}
        >
          <ImExit/>
          Deconnecter
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

  return (
      <Header
        style={{
          backgroundColor: theme === 'dark' ? '#001529' : '#fff',
        }}
        className='top-bar'
      >
        <div>
        {
          user?.role === 'client' && (
            <div 
              className="topbar-walet"
              style={{
                backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray1)',
                color: theme === 'dark' ? '#fff' : '#002242',
              }}
            > 
              <div className="solde-wallet" onClick={()=>{
                setShowSolde(prev => !prev)
              }}>
                {
                  showSolde ? <p>{storeData.solde} <span>MAD</span></p> : <p><FaRegEyeSlash /> <span>MAD</span></p>
                }
              </div>
              <Avatar icon={<IoWallet/>} size={25} className='wallet_icon' onClick={()=>setOpenRetrait(true)} />
            </div>
          )
        }
        </div>
        <div className="control-topbar">
            {
                theme === 'dark' ? 
                    <MdNightlight onClick={toggleTheme} style={styleIcon}/> 
                        : 
                    <MdLightMode onClick={toggleTheme} style={styleIcon}/>
            }
            <Badge 
              count={5} 
              onClick={showDrawer} 
              style={{ cursor: "pointer" }}
            >
              <Avatar 
                icon={<IoIosNotifications />} 
                style={{ cursor: "pointer" }} // Ensure the Avatar also has pointer style
              />
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
                style={{ cursor: "pointer" }} // Ensure the Avatar also has pointer style
              />
            </Dropdown> 
        </div>
        <Drawer
          title="Demande De Retreit" 
          onClose={()=>setOpenRetrait(prev=>!prev)} 
          open={openRetrait}
        >
          <DemandeRetrait theme={theme} />
        </Drawer>
      </Header>
  );
}

export default Topbar;