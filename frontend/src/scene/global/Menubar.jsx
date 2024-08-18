import React, { useContext, useState, useEffect } from 'react';
import { Drawer, Menu } from 'antd';
import { Link } from 'react-router-dom';
import './global.css';
import { ThemeContext } from '../ThemeContext';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaCity, FaUser, FaTachometerAlt } from "react-icons/fa";
import { IoWalletSharp } from "react-icons/io5";
import { LuBox, LuScanLine } from "react-icons/lu";
import { BiTagAlt } from "react-icons/bi";
import { BsFillInboxesFill } from "react-icons/bs";
import { CgDanger } from "react-icons/cg";
import StoreDown from './StoreDown'; // Ensure this component is correctly implemented
import { MdEditNotifications } from "react-icons/md";
import Solde from '../components/portfeuille/components/SoldeCart';
import DemandeRetrait from '../components/portfeuille/components/DemandeRetrait';
import { useSelector } from 'react-redux';

function Menubar() {
  const { theme } = useContext(ThemeContext);
  const [collapsed, setCollapsed] = useState(JSON.parse(localStorage.getItem('menuCollapsed')) || false);
  const [isNewReclamation, setIsNewReclamation] = useState(false);
  const [openWallet, setOpenWallet] = useState(false);
  const { user } = useSelector((state) => state.auth);
  
  // Example data for stores (replace with actual data fetching logic)
  const stores = [{ id: 'store1', storeName: 'Store 1' }, { id: 'store2', storeName: 'Store 2' }] 

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
        <div className={`header-menu reclamation-item`}>
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

        {/* Conditionally render StoreDown if user is a client and there are stores */}
        {user.role === "client" && (
          <StoreDown  theme={theme} collapsed={collapsed} />
        )}

        <Menu.Item icon={<FaTachometerAlt />}>
          <Link to="/dashboard/home" onClick={() => console.log(user.role)}>Accueil</Link>
        </Menu.Item>

        <Menu.Item icon={<CgDanger />} className={isNewReclamation ? "change-color-animation" : ""}>
          <Link to="/dashboard/reclamation">Reclamation</Link>
        </Menu.Item>

        <Menu.Item icon={<FaUser />}>
          <Link to="/dashboard/compte">Comptes</Link>
        </Menu.Item>

        <Menu.Item icon={<MdEditNotifications />}>
          <Link to="/dashboard/notification">Notification</Link>
        </Menu.Item>

        <Menu.Item icon={<FaCity />}>
          <Link to="/dashboard/ville">Villes</Link>
        </Menu.Item>

        <Menu.Item icon={<IoWalletSharp />}>
          <Link onClick={() => setOpenWallet(true)}>Portfeuille</Link>
        </Menu.Item>
        <Drawer
          title="Portfeuille"
          open={openWallet}
          onClose={() => setOpenWallet(prev => !prev)}
        >
          <Solde />
          <DemandeRetrait theme={theme} />
        </Drawer>

        <Menu.Item icon={<LuScanLine />}>
          <Link to="/dashboard/scan">Scan</Link>
        </Menu.Item>

        <Menu.SubMenu icon={<LuBox />} title="Colis">
          <Menu.Item icon={<BiTagAlt />}>
            <Link to="/dashboard/list-colis">List Colis</Link>
          </Menu.Item>
          <Menu.Item icon={<BiTagAlt />}>
            <Link to="/dashboard/ajouter-colis/simple">Ajouter Colis</Link>
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
