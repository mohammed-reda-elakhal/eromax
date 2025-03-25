import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./Vitrine page/Home";
import Login from './Vitrine page/Login';
import Register from './Vitrine page/Register';
import HomeDashboard from "./scene/components/home/pages/HomeDashboard";
import { ThemeProvider as CustomThemeProvider } from "./scene/ThemeContext";
import ColisList from "./scene/components/colis/pages/ColisList";
import ColisPourRamassage from "./scene/components/colis/pages/ColisPourRamassage";
import AjouterColis from "./scene/components/colis/pages/AjouterColis";
import ColisImport from "./scene/components/colis/pages/ColisImport";
import ProduitList from "./scene/components/stock/pages/ProduitList";
import AjouterProduit from "./scene/components/stock/pages/AjouterProduit";
import ProduitColis from "./scene/components/stock/pages/ProduitColis";
import ColisStock from "./scene/components/stock/pages/ColisStock";
import Portfeuille from "./scene/components/portfeuille/page/Portfeuille";
import React, { useRef, useState } from 'react';
import { QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, FloatButton, Input, Space, Table } from 'antd';
import Highlighter from 'react-highlight-words';
import ColisRamasse from "./scene/components/colis/pages/ColisRamasse";
import ColisExpide from "./scene/components/colis/pages/ColisExpide";
import ColisReçu from "./scene/components/colis/pages/ColisReçu";
import ColisMiseDistribution from "./scene/components/colis/pages/ColisMiseDistribution";
import ColisLivrée from "./scene/components/colis/pages/ColisLivrée";
import Scan from "./scene/components/scan/page/Scan";
import Compte from "./scene/components/compte/page/Compte";
import Profile from "./scene/components/profile/page/Profile";
import Ville from "./scene/components/ville/page/Ville";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RegisterLivreur from "./Vitrine page/RegisterLivreur";
import ProtectedRoute from "./utils/ProtectedRoute";
import Reclamation from "./scene/components/reclamation/page/Reclamation";
import Notification from "./scene/components/notification/page/Notification";
import FormClient from "./scene/components/compte/page/FormClient";
import Client from "./scene/components/compte/page/Client";
import Livreur from "./scene/components/compte/page/Livreur";
import FormLivreur from "./scene/components/compte/page/FormLivreur";
import Team from "./scene/components/compte/page/Team";
import FormTeam from "./scene/components/compte/page/FormTeam";
import Admin from "./scene/components/compte/page/Admin";
import FormAdmin from "./scene/components/compte/page/FormAdmin";
import ReclamationOk from "./scene/components/reclamation/page/ReclamationOk";
import FactureClient from "./scene/components/facture/page/FactureClient";
import FactureDetail from "./scene/components/facture/page/FactureDetailClient";
import FactureLivreur from "./scene/components/facture/page/FactureLivreur";
import FactureDetailLivreur from "./scene/components/facture/page/FactureDetailLivreur";
import MethodePayemet from "./scene/components/payement/page/MethodePayemet";
import MethodePayementOperation from "./scene/components/payement/page/MethodePayementOperation";
import DemandeRetraitTable from "./scene/components/payement/page/DemandeRetraitTable";
import TransactionTable from "./scene/components/payement/page/TransactionTable";
import TicketBatch from "./scene/components/tickets/TicketBatch";
import ScanRecherche from "./scene/components/scan/components/ScanRecherche";
import ScanRamasser from "./scene/components/scan/components/ScanRamasser";
import ScanUpdateStatu from "./scene/components/scan/page/ScanUpdateStatu";
import UpdateColis from "./scene/components/colis/components/UpdateColis";
import StoreInfo from "./scene/components/profile/components/StoreInfo";
import Store from "./scene/components/profile/page/Store";
import PayementProfile from "./scene/components/profile/components/PayementProfile";
import Pyements from "./scene/components/profile/page/Pyements";
import FactureGlobale from "./scene/components/facture/page/FactureGlobale";
import FactureGlobaleDetail from "./scene/components/facture/page/FactureGlobaleDetail";
import FactureRetour from "./scene/components/facture/page/FactureRetour";
import FactureRetourDetail from "./scene/components/facture/page/FactureRetourDetail";
import Promotions from "./scene/components/promotion/page/Promotion";
import Cookies from "js-cookie";

import DocumentProfile from "./scene/components/profile/components/DocumentProfile";

import { useSelector } from "react-redux";
import UpdateColisPage from "./scene/components/colis/pages/UpdateColisPage";
import TransactionPage from "./scene/components/payement/page/TransactionPage";
import ColisAmeex from "./scene/components/colis/pages/ColisAmeex";
import AjouterColisAdmin from "./scene/components/colis/pages/AjouterColisAdmin";
import InfoWalet from "./scene/components/portfeuille/page/InfoWalet";
import TarifLivreur  from "../src/scene/components/tarif livreur/page/TarifLivreur";
import Crbt from "./scene/components/colis/pages/Crbt";
import Tools from "./scene/components/tools/Tools";
import Transfer from "./scene/components/portfeuille/page/Transfer";
import Wallet from "./scene/components/portfeuille/page/Wallet";
import Withdrawal from "./scene/components/portfeuille/page/Withdrawal";


function App() {

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const token = localStorage.getItem('token');
  
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1677ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  return (
    <CustomThemeProvider>
      <ToastContainer/>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard/home" /> : <Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/livreur" element={<RegisterLivreur />} />
          
          <Route path='dashboard' element={<ProtectedRoute/>}>
            <Route path="home" element={<HomeDashboard />} />
            <Route path="bussness" element={<Store />} />
            <Route path="payement" element={<Pyements />} />
            <Route path="document" element={<DocumentProfile />} />


            
            <Route path="profile/:id" element={<Profile />} />
            <Route path="portfeuille" element={<Wallet />} />
            <Route path="scan" element={<Scan />} /> 
            <Route path="ville" element={<Ville />} /> 
            <Route path="tarif-livreur" element={<TarifLivreur />} /> 
            <Route path="tarif-livreur/:idLivreur" element={<TarifLivreur />} /> 
            <Route path="reclamation" element={<Reclamation />} />
            <Route path="reclamation-complete" element={<ReclamationOk />} />
            <Route path="gnotification" element={<Notification />} /> 
            <Route path="demande-retrait" element={<Withdrawal />} /> 
            <Route path="transaction" element={<Transfer />} /> 
            <Route path="tickets" element={<TicketBatch />} /> 
            
            <Route path="scan">
              <Route path="recherche" element={<ScanRecherche/>}  />
              <Route path="statu/:statu" element={<ScanUpdateStatu/>}  />
            </Route>

            <Route path="compte">
              <Route path="client" element={<Client search = {getColumnSearchProps}  />}  />
              <Route path="client/:id" element={<FormClient />} /> 
              <Route path="livreur" element={<Livreur />}  />
              <Route path="livreur/:id" element={<FormLivreur />}  />
              <Route path="team" element={<Team />}  />
              <Route path="team/:id" element={<FormTeam />}  />
              <Route path="admin" element={<Admin />}  />
              <Route path="admin/:id" element={<FormAdmin />}  />
            </Route>

            <Route path='facture'>
              <Route path="client/:id" element={<FactureClient />}  />
              <Route path="client" element={<FactureClient />}  />
              <Route path="livreur" element={<FactureLivreur />}  />
              <Route path="livreur/:id" element={<FactureLivreur />}  />
              <Route path="detail/client/:code_facture" element={<FactureDetail />}  />
              <Route path="detail/livreur/:code_facture" element={<FactureDetailLivreur />}  />
              <Route path="globale" element={<FactureGlobale />}  />
              <Route path="globale/:code_facture" element={<FactureGlobaleDetail />}  />
              <Route path="retour" element={<FactureRetour />}  />
              <Route path="retour/:code_facture" element={<FactureRetourDetail />}  />
            </Route>

            <Route path='payement'>
              <Route path="list" element={<MethodePayemet />}  />
              <Route path="ajouter" element={<MethodePayementOperation />}  />
              <Route path="modifier/:id" element={<MethodePayementOperation />}  />
            </Route>

            <Route path="list-colis" element={<ColisList search = {getColumnSearchProps} />} />
            <Route path="crbt" element={<Crbt search = {getColumnSearchProps} />} />
            <Route path="colis-ar" element={<ColisPourRamassage search = {getColumnSearchProps} />} />
            <Route path="colis-r" element={<ColisRamasse search = {getColumnSearchProps} />} />
            <Route path="colis-ex" element={<ColisExpide search = {getColumnSearchProps} />} />
            <Route path="colis-rc" element={<ColisReçu search = {getColumnSearchProps} />} />
            <Route path="colis-md" element={<ColisMiseDistribution search = {getColumnSearchProps} />} />
            <Route path="colis-l" element={<ColisLivrée search = {getColumnSearchProps} />} />
            <Route path="ameex" element={<ColisAmeex search = {getColumnSearchProps} />} />
            <Route path="ajouter-colis/:type" element={<AjouterColis />} />
            <Route path="ajouter/colis/admin/:type" element={<AjouterColisAdmin />} />
            <Route path="import-colis" element={<ColisImport />} />
            <Route path="colis/update/:codeSuivi" element={<UpdateColisPage />} />

            <Route path="list-produit" element={<ProduitList search = {getColumnSearchProps} />} />
            <Route path="ajouter-produit" element={<AjouterProduit />} />
            <Route path="ajouter-produit-colis" element={<ProduitColis search = {getColumnSearchProps}/>} />
            <Route path="colis-stock" element={<ColisStock />} />

            <Route path="Tools" element={<Tools />} />
            


            <Route path="promotion" element={<Promotions />} />
          
        </Route>
      </Routes>
      </BrowserRouter>
    </CustomThemeProvider>
  );
}

export default App;