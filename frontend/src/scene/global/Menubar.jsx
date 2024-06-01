import React, { useContext, useState } from 'react';
import { PieChartOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import './global.css';
import { ThemeContext } from '../ThemeContext';
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import StoreDown from './StoreDown';

function Menubar() {
  const { theme } = useContext(ThemeContext);
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

 
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
          <Link to="/">Accueil</Link>
        </Menu.Item>
        <Menu.Item icon={<PieChartOutlined />}>
          <Link to="/portfolio">Portfeuille</Link>
        </Menu.Item>
        <Menu.Item icon={<PieChartOutlined />}>
          <Link to="/colis">Colis</Link>
        </Menu.Item>
        <Menu.Item icon={<PieChartOutlined />}>
          <Link to="/stock">Stock</Link>
        </Menu.Item>
        <Menu.Item icon={<PieChartOutlined />}>
          <Link to="/">Accueil</Link>
        </Menu.Item>
        <Menu.Item icon={<PieChartOutlined />}>
          <Link to="/portfolio">Portfeuille</Link>
        </Menu.Item>
        <Menu.Item icon={<PieChartOutlined />}>
          <Link to="/colis">Colis</Link>
        </Menu.Item>
        <Menu.Item icon={<PieChartOutlined />}>
          <Link to="/stock">Stock</Link>
        </Menu.Item>
        <Menu.Item icon={<PieChartOutlined />}>
          <Link to="/">Accueil</Link>
        </Menu.Item>
        <Menu.Item icon={<PieChartOutlined />}>
          <Link to="/portfolio">Portfeuille</Link>
        </Menu.Item>
        <Menu.Item icon={<PieChartOutlined />}>
          <Link to="/colis">Colis</Link>
        </Menu.Item>
        <Menu.Item icon={<PieChartOutlined />}>
          <Link to="/stock">Stock</Link>
        </Menu.Item>
      </Menu>
    </div>
  );
}

export default Menubar;
