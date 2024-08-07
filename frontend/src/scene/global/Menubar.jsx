import React, { useContext, useState, useEffect } from 'react';
import { PieChartOutlined } from '@ant-design/icons';
import { Drawer, Menu } from 'antd';
import { Link } from 'react-router-dom';
import './global.css';
import { ThemeContext } from '../ThemeContext';
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import StoreDown from './StoreDown';
import { FaTachometerAlt } from "react-icons/fa";
import { FcMoneyTransfer } from "react-icons/fc";
import { LuBox } from "react-icons/lu";
import { BiTagAlt } from "react-icons/bi";
import { BsFillInboxesFill } from "react-icons/bs";
import { IoWalletSharp } from "react-icons/io5";
import { LuScanLine } from "react-icons/lu";
import { FaUser } from "react-icons/fa";





function Menubar() {
  const { theme } = useContext(ThemeContext);
  
  // Get initial collapsed state from localStorage or default to false
  const initialCollapsed = JSON.parse(localStorage.getItem('menuCollapsed')) || false;
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  const toggleCollapsed = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    localStorage.setItem('menuCollapsed', JSON.stringify(newCollapsedState));
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
        localStorage.setItem('menuCollapsed', JSON.stringify(true));
      } else {
        const savedState = JSON.parse(localStorage.getItem('menuCollapsed'));
        setCollapsed(savedState !== null ? savedState : false);
      }
    };

    handleResize(); // Set the initial state
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className='menu-bar'>
      <Menu
        mode="inline"
        theme={theme === 'dark' ? 'dark' : 'light'}
        inlineCollapsed={collapsed}
        className='menu'
      >
        <div className="header-menu">
          {collapsed ? '' : (
            <img
              src={theme === 'dark' ? '/image/logo.png' : '/image/logo-light.png'}
              alt=""
              style={{ width: "50px" }}
            />
          )}
          <button
            onClick={toggleCollapsed}
            style={{
              color: theme === 'dark' ? '#fff' : '#002242',
            }}
          >
            {collapsed ? <FaAngleDoubleRight /> : <FaAngleDoubleLeft />}
          </button>
        </div>
        
        <StoreDown theme={theme} collapsed={collapsed} />

        <Menu.Item icon={<FaTachometerAlt />}>
          <Link to="/dashboard/home">Accueil</Link>
        </Menu.Item>

        <Menu.Item icon={<FaUser />}>
          <Link to="/dashboard/compte">Comptes</Link>
        </Menu.Item>

        <Menu.Item icon={<IoWalletSharp />}>
          <Link to="/dashboard/portfeuille">Portfeuille</Link>
        </Menu.Item>

        <Menu.Item icon={<LuScanLine />}>
          <Link to="/dashboard/scan">Scan</Link>
        </Menu.Item>

        <Menu.SubMenu icon={<LuBox />} title="Colis">
          <Menu.Item icon={<BiTagAlt />}>
            <Link to="/dashboard/list-colis">List Colis</Link>
          </Menu.Item>
          <Menu.Item icon={<BiTagAlt />}>
            <Link 
              to="/dashboard/ajouter-colis/simple"
            >
              Ajouter Colis
            </Link>
          </Menu.Item>
          <Menu.Item icon={<BiTagAlt />}>
            <Link to="/dashboard/colis-ar">Colis Pour Ramassage</Link>
          </Menu.Item>
          <Menu.Item icon={<BiTagAlt />}>
            <Link to="/dashboard/colis-r">Colis Ramasse</Link> 
          </Menu.Item>
          <Menu.Item icon={<BiTagAlt />}>
            <Link to="/dashboard/colis-ex">Colis Expidie</Link> 
          </Menu.Item>
          <Menu.Item icon={<BiTagAlt />}>
            <Link to="/dashboard/colis-rc">Colis Reçu</Link> 
          </Menu.Item>
          <Menu.Item icon={<BiTagAlt />}>
            <Link to="/dashboard/colis-md">Colis Mise en Distribution</Link> 
          </Menu.Item>
          <Menu.Item icon={<BiTagAlt />}>
            <Link to="/dashboard/colis-l">Colis Livrée</Link> 
          </Menu.Item>
          <Menu.Item icon={<BiTagAlt />}>
            <Link to="/dashboard/import-colis">Import Colis</Link> 
          </Menu.Item>

        </Menu.SubMenu>

        <Menu.SubMenu icon={<BsFillInboxesFill />} title="Stock">
          <Menu.Item icon={<BiTagAlt />}>
            <Link to="/dashboard/list-produit">Produit</Link>
          </Menu.Item>
          <Menu.Item icon={<BiTagAlt />}>
            <Link to="/dashboard/ajouter-colis/stock">Ajouter Colis</Link>
          </Menu.Item>
          <Menu.Item icon={<BiTagAlt />}>
            <Link to="/dashboard/colis-stock">Colis Stock</Link>
          </Menu.Item>
          <Menu.Item icon={<BiTagAlt />}>
            <Link to="/dashboard/import-colis">Import Colis (Stock)</Link> 
          </Menu.Item>
        </Menu.SubMenu>
        
      </Menu>
    </div>
  );
}

export default Menubar;
