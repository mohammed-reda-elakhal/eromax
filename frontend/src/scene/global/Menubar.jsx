import React, { useContext, useState, useEffect } from 'react';
import { PieChartOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import './global.css';
import { ThemeContext } from '../ThemeContext';
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import StoreDown from './StoreDown';

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

        <Menu.Item icon={<PieChartOutlined />}>
          <Link to="/dashboard/home">Accueil</Link>
        </Menu.Item>

        <Menu.Item icon={<PieChartOutlined />}>
          <Link to="/dashboard/portfeuille">Portfeuille</Link>
        </Menu.Item>

        <Menu.SubMenu icon={<PieChartOutlined />} title="Colis">
          <Menu.Item icon={<PieChartOutlined />}>
            <Link to="/dashboard/list-colis">List Colis</Link>
          </Menu.Item>
          <Menu.Item icon={<PieChartOutlined />}>
            <Link to="/dashboard/ajouter-colis">Ajouter Colis</Link>
          </Menu.Item>
          <Menu.Item icon={<PieChartOutlined />}>
            <Link to="/dashboard/colis-ar">Colis Pour Ramassage</Link>
          </Menu.Item>
          <Menu.Item icon={<PieChartOutlined />}>
            <Link to="/dashboard/import-colis">Import Colis</Link> 
          </Menu.Item>
        </Menu.SubMenu>
        
      </Menu>
    </div>
  );
}

export default Menubar;
