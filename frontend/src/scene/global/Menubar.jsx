import React, { useContext, useState, useEffect } from 'react';
import { Badge, Button, Divider, Drawer, Menu, Tag } from 'antd';
import { Link } from 'react-router-dom';
import './global.css';
import { ThemeContext } from '../ThemeContext';
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaCity, FaUser, FaTachometerAlt, FaClipboardList, FaTools } from "react-icons/fa";
import { IoWalletSharp } from "react-icons/io5";
import { LuBox, LuScanLine } from "react-icons/lu";
import { BiNote, BiSupport, BiTagAlt } from "react-icons/bi";
import { BsFillFileEarmarkSpreadsheetFill, BsFillInboxesFill } from "react-icons/bs";
import { CgDanger } from "react-icons/cg";
import StoreDown from './StoreDown'; // Ensure this component is correctly implemented
import { MdEditNotifications, MdFactCheck, MdPriceCheck } from "react-icons/md";
import Solde from '../components/portfeuille/components/SoldeCart';
import DemandeRetrait from '../components/portfeuille/components/DemandeRetrait';
import { useDispatch , useSelector } from 'react-redux';
import { FaUserFriends } from "react-icons/fa"
import { FaBoxesPacking, FaFileInvoiceDollar, FaRegSquarePlus } from "react-icons/fa6";
import { MdPayment } from "react-icons/md";
import { RiDiscountPercentLine } from "react-icons/ri";
import { GrObjectGroup } from "react-icons/gr";
import { CiMenuFries } from 'react-icons/ci';
import { GiSettingsKnobs } from "react-icons/gi";
import { IoIosAdd, IoMdPricetags } from 'react-icons/io';
import { getColisATRToday, getColisExpidée, getColisPret, getColisRamasser, getDemandeRetraitToday, getReclamationToday } from '../../redux/apiCalls/missionApiCalls';
import { FaTruck, FaMoneyBillWave, FaShippingFast, FaListAlt, FaFileImport, FaReceipt } from "react-icons/fa";
import { MdLocalShipping, MdInventory, MdPendingActions } from "react-icons/md";
import { TbTruckDelivery } from "react-icons/tb";
import { AiOutlineFileSync } from "react-icons/ai";

const colorBadge = "rgb(0, 106, 177)"

function Menubar() {
  const { theme } = useContext(ThemeContext);
  const [collapsed, setCollapsed] = useState(JSON.parse(localStorage.getItem('menuCollapsed')) || false);
  const [isNewReclamation, setIsNewReclamation] = useState(false);
  const [showNewBadge, setShowNewBadge] = useState(false);
  const [openWallet, setOpenWallet] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [userData , setUserData] = useState({})
  const {user} = useSelector(state => state.auth );


    const { demandeRetrait , openReclamationsCount, colis, reclamations , colisExp , colisPret , client , colisR } = useSelector((state) => ({
          demandeRetrait: state.mission.demandeRetrait,
          openReclamationsCount: state.mission.openReclamationsCount,
          colis: state.mission.colis,
          colisR: state.mission.colisR,
          colisExp: state.mission.colisExp,
          colisPret: state.mission.colisPret,
          reclamations: state.mission.reclamations,
          client : state.mission.client,
      }));

      let totaleColisAdmin = colis.length + colisR.length;
      let totaleCompteAdmin = client.length ;
      let totalRetrait = demandeRetrait.length ;
      let totalReclamation = reclamations.length

      const dispatch = useDispatch();

      // Function to dispatch actions based on the user role
      const getData = () => {
          if(user?.role === "admin"){
              dispatch(getDemandeRetraitToday());
              dispatch(getReclamationToday());
              dispatch(getColisATRToday());
              dispatch(getColisRamasser());
          }else if(user?.role === "livreur"){
              dispatch(getColisExpidée())
              dispatch(getColisPret())
          }
      };

  useEffect(()=>{
    setUserData(user)
    getData()
  },[dispatch])

  // Handle the "New" badge for reclamation feature
  useEffect(() => {
    // Check if we should show the badge
    const badgeInfo = localStorage.getItem('reclamationNewBadge');

    if (badgeInfo) {
      // Parse the stored data
      const { showUntil } = JSON.parse(badgeInfo);
      const currentTime = new Date().getTime();

      // If the current time is before the expiration time, show the badge
      if (currentTime < showUntil) {
        setShowNewBadge(true);
      } else {
        // If expired, remove from localStorage
        localStorage.removeItem('reclamationNewBadge');
        setShowNewBadge(false);
      }
    } else {
      // If no badge info exists, create it (feature is new)
      const currentTime = new Date().getTime();
      const showUntil = currentTime + (48 * 60 * 60 * 1000); // 48 hours in milliseconds

      localStorage.setItem('reclamationNewBadge', JSON.stringify({
        showUntil
      }));

      setShowNewBadge(true);
    }
  }, [])




  const toggleCollapsed = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    localStorage.setItem('menuCollapsed', JSON.stringify(newCollapsedState));
  };
  const toggleMenu = () =>{
    setOpenMenu(prev => !prev)
    if(!openMenu){
      setCollapsed(true)
    }
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // On mobile devices, keep it collapsed
        setCollapsed(true);
        localStorage.setItem('menuCollapsed', JSON.stringify(true));
      } else {
        // On laptop/desktop devices, force it open
        setOpenMenu(true);
        setCollapsed(false);
        localStorage.setItem('menuCollapsed', JSON.stringify(false));
      }
    };

    handleResize(); // Set the initial state on load
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={openMenu ? 'menu-bar-open' : 'menu-bar'}>
      <Menu
        mode="inline"
        theme={theme === 'dark' ? 'dark' : 'light'}
        inlineCollapsed={collapsed}
        className='menu'
      >
        <div className= {collapsed ?  'open-menu' : 'open-menu-c'}>
          <Button type='primary' icon={<CiMenuFries />} onClick={toggleMenu}>
          </Button>
        </div>
        <div className={`header-menu reclamation-item`}>

            <img
              src={'/image/eromax_logo.png'}
              alt=""
              style={collapsed ? { width: '60px'} : { width: '100px'}}
              onClick={toggleCollapsed}
            />
        </div>



        {/* admin menu items  */}

        <Menu.Item icon={<FaTachometerAlt />}>
          <Link to="/dashboard/home">Accueil</Link>
        </Menu.Item>
        {
          userData.role ==="admin" && (
            <Menu.Item icon={<LuScanLine />}>
              <Link to="/dashboard/scan">Scan</Link>
            </Menu.Item>
          )
        }

        {
          (userData.role === "admin" || userData.role === "client") && (
            <Menu.Item icon={<CgDanger />} className="reclamation-item-with-badge">
              <Link to="/dashboard/reclamation">
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    Reclamation
                  </span>
                  {openReclamationsCount > 0 ? (
                    <Badge count={openReclamationsCount} color={colorBadge} style={{ marginLeft: '8px' }} />
                  ) : ""}
                </span>
              </Link>
            </Menu.Item>
          )
        }

        {
          userData.role === "admin" &&(
            <Menu.Item icon={<FaTools />}>
              <Link to="/dashboard/Tools">Tools</Link>
            </Menu.Item>
          )
        }

        {
          (userData.role === "admin" || userData.role === "team") && (
            <Menu.SubMenu
              icon={<MdInventory />}
              title={
                <span>
                  Colis {totaleColisAdmin > 0 ? <Badge count={totaleColisAdmin} color={colorBadge} /> : ""}
                </span>
              }
            >
              <Menu.Item icon={<FaRegSquarePlus />}>
                <Link to="/dashboard/ajouter/colis/admin/simple">Ajouter Colis</Link>
              </Menu.Item>
              <Menu.Item icon={<FaListAlt />}>
                <Link to="/dashboard/list-colis">List Colis</Link>
              </Menu.Item>
              <Menu.Item icon={<FaShippingFast />}>
                <Link to="/dashboard/colis-ar">
                  Colis Pour Ramassage {colis.length > 0 ? <Badge count={colis.length} color={colorBadge} /> : ""}
                </Link>
              </Menu.Item>
              <Menu.Item icon={<MdLocalShipping />}>
                <Link to="/dashboard/colis-r">
                  Colis Ramasse {colisR.length > 0 ? <Badge count={colisR.length} color={colorBadge} /> : ""}
                </Link>
              </Menu.Item>
              <Menu.Item icon={<MdFactCheck />}>
                <Link to="/dashboard/facture/globale">Fichier</Link>
              </Menu.Item>
            </Menu.SubMenu>
          )
        }



         {
          userData.role ==="admin" && (
            <Menu.SubMenu
              icon={<FaMoneyBillWave />}
              title={
                <span>
                  Payements {totalRetrait > 0 ? <Badge count={totalRetrait} color={colorBadge} /> : ""}
                </span>
              }
            >
              <Menu.Item icon={<IoWalletSharp />} className={isNewReclamation ? "change-color-animation" : ""}>
                <Link to="/dashboard/demande-retrait">
                  Demande retrait {demandeRetrait.length > 0 ? <Badge count={demandeRetrait.length} color={colorBadge} /> : ""}
                </Link>
              </Menu.Item>
              <Menu.Item icon={<FaFileInvoiceDollar />}>
                <Link to={'/dashboard/transaction'}>
                  Transactions
                </Link>
              </Menu.Item>
              <Menu.Item icon={<MdPayment />} className={isNewReclamation ? "change-color-animation" : ""}>
                <Link to="/dashboard/payement/list">
                  Methode Payement
                </Link>
              </Menu.Item>
            </Menu.SubMenu>
          )
        }
        {
          userData.role === "admin" &&(
            <Menu.SubMenu icon={<FaFileInvoiceDollar />} title="Facture">
                  <Menu.Item icon={<BiTagAlt />}>
                    <Link to="/dashboard/facture/client">Facture ( client )</Link>
                  </Menu.Item>
                  <Menu.Item icon={<AiOutlineFileSync />}>
                    <Link to="/dashboard/facture/retour">Bon Retour</Link>
                  </Menu.Item>
                  <Menu.Item icon={<FaReceipt />}>
                    <Link to="/dashboard/facture/livreur">Facture ( Livreur )</Link>
                  </Menu.Item>
                  <Menu.Item icon={<BiTagAlt />}>
                    <Link to="/dashboard/crbt">Crbt</Link>
                  </Menu.Item>
            </Menu.SubMenu>
          )
        }
        {
          userData.role ==="admin" && (
            <Menu.SubMenu icon={<FaUserFriends />} title={
              <span>
                Compte {totaleCompteAdmin > 0 ? <Badge count={totaleCompteAdmin} color={colorBadge} /> : ""}
              </span>
            }>
              <Menu.Item icon={<BiTagAlt />}>
                <Link to="/dashboard/compte/client">Client {client.length > 0 ? <Badge count={client.length} color={colorBadge} /> : ""}</Link>
              </Menu.Item>
              <Menu.Item icon={<BiTagAlt />}>
                <Link to="/dashboard/compte/livreur">Livreur</Link>
              </Menu.Item>
              {
                userData.type ==="super" && (
                  <Menu.Item icon={<BiTagAlt />}>
                    <Link to="/dashboard/compte/admin">Admin</Link>
                  </Menu.Item>
                )
              }
            </Menu.SubMenu>
          )
        }


        {
          userData.role === "admin" &&(
            <Menu.SubMenu icon={<IoMdPricetags />} title="Tarif">
                  <Menu.Item icon={<FaCity />}>
                    <Link to="/dashboard/ville">Villes</Link>
                  </Menu.Item>
                  <Menu.Item icon={<MdPriceCheck />}>
                    <Link to="/dashboard/tarif-livreur">Livreur</Link>
                  </Menu.Item>

            </Menu.SubMenu>
          )
        }

        {
          userData.role ==="client" && (
            <>
              <Menu.SubMenu icon={<IoWalletSharp />} title="Portfeuille">
                <Menu.Item icon={<IoWalletSharp />}>
                  <Link to={"/dashboard/portfeuille"}>Portfeuille</Link>
                </Menu.Item>
                <Menu.Item icon={<FaFileInvoiceDollar />}>
                  <Link to={'/dashboard/transaction'}>List transactions</Link>
                </Menu.Item>
                <Menu.Item icon={<FaMoneyBillWave />} className={isNewReclamation ? "change-color-animation" : ""}>
                <Link to="/dashboard/demande-retrait">
                  Demande retrait {demandeRetrait.length > 0 ? <Badge count={demandeRetrait.length} color={colorBadge} /> : ""}
                </Link>
              </Menu.Item>
              </Menu.SubMenu>

              <Drawer
                title="Portfeuille"
                open={openWallet}
                onClose={() => setOpenWallet(prev => !prev)}
              >
                <Solde />
                <DemandeRetrait setOpenWallet = {setOpenWallet} theme={theme} />
              </Drawer>
            </>
          )
        }






        {
          userData.role ==="client" && (
            <Menu.SubMenu icon={<MdInventory />} title="Gestion colis">
              <Menu.Item icon={<FaRegSquarePlus />}>
                <Link to="/dashboard/ajouter-colis/simple">Ajouter Colis</Link>
              </Menu.Item>
              <Menu.Item icon={<FaListAlt />}>
                <Link to="/dashboard/list-colis">List Colis</Link>
              </Menu.Item>
              <Menu.Item icon={<FaShippingFast />}>
                <Link to="/dashboard/colis-ar">Colis Pour Ramassage</Link>
              </Menu.Item>
              <Menu.Item icon={<FaFileImport />}>
                <Link to="/dashboard/import-colis">Import Colis</Link>
              </Menu.Item>
              <Menu.Item icon={<FaReceipt />}>
                <Link to="/dashboard/facture/globale">Fichier</Link>
              </Menu.Item>
            </Menu.SubMenu>
          )
        }

        {
          userData.role === "admin" &&(
            <Menu.SubMenu icon={<GiSettingsKnobs />} title="Général">
                  <Menu.Item icon={<BiNote />}>
                    <Link to="/dashboard/gnotification">Notifications</Link>
                  </Menu.Item>
                  <Menu.Item icon={<RiDiscountPercentLine />}>
                    <Link to="/dashboard/promotion">Promotions</Link>
                  </Menu.Item>

            </Menu.SubMenu>
          )
        }
        {
          userData.role ==="livreur" && (
            <Menu.Item icon={<LuScanLine />}>
              <Link to="/dashboard/scan">Scan</Link>
            </Menu.Item>
          )
        }

        {
          userData.role ==="livreur" && (
            <Menu.SubMenu icon={<TbTruckDelivery />} title="Espace Livreur">
              <Menu.Item icon={<FaTruck />}>
                <Link to="/dashboard/list-colis">List Colis</Link>
              </Menu.Item>
              <Menu.Item icon={<MdLocalShipping />}>
                <Link to="/dashboard/colis-ex">Colis Expidée</Link>
              </Menu.Item>
              <Menu.Item icon={<FaShippingFast />}>
                <Link to="/dashboard/colis-rc">Colis Reçu</Link>
              </Menu.Item>
              <Menu.Item icon={<MdPendingActions />}>
                <Link to="/dashboard/colis-md">Colis Mise en distrubution</Link>
              </Menu.Item>
              <Menu.Item icon={<MdFactCheck />}>
                <Link to="/dashboard/colis-l">Colis Livrée</Link>
              </Menu.Item>
            </Menu.SubMenu>
          )
        }

        {
          userData.role === "client"&& (
            <Menu.SubMenu icon={<FaFileInvoiceDollar />} title="Facture">
              <Menu.Item icon={<BiTagAlt />}>
                <Link to="/dashboard/facture/client">Facture ( client )</Link>
              </Menu.Item>
              <Menu.Item icon={<AiOutlineFileSync />}>
                <Link to="/dashboard/facture/retour">Bon Retour</Link>
              </Menu.Item>
            </Menu.SubMenu>
          )
        }

        {
          userData.role === "livreur"&& (
            <Menu.SubMenu icon={<FaFileInvoiceDollar />} title="Facture">
              <Menu.Item icon={<AiOutlineFileSync />}>
                <Link to="/dashboard/facture/retour">Bon Retour</Link>
              </Menu.Item>
              <Menu.Item icon={<FaReceipt />}>
                <Link to="/dashboard/facture/livreur">Facture ( Livreur )</Link>
              </Menu.Item>
            </Menu.SubMenu>
          )
        }

        <Menu.Item icon={<BiSupport />}>
          <Link to="/dashboard/support">Support</Link>
        </Menu.Item>

      </Menu>

    </div>
  );
}

export default Menubar;