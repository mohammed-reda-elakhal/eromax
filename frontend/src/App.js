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
import { SearchOutlined } from '@ant-design/icons';
import { Button, Input, Space, Table } from 'antd';
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

function App() {

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  
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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          
          <Route path='dashboard' element={<ProtectedRoute/>}>
            <Route path="home" element={<HomeDashboard />} />
            <Route path="compte" element={<Compte />} />
            <Route path="profile/:id" element={<Profile />} />
            <Route path="portfeuille" element={<Portfeuille />} />
            <Route path="scan" element={<Scan />} /> 

          <Route path="list-colis" element={<ColisList search = {getColumnSearchProps} />} />
          <Route path="colis-ar" element={<ColisPourRamassage search = {getColumnSearchProps} />} />
          <Route path="colis-r" element={<ColisRamasse search = {getColumnSearchProps} />} />
          <Route path="colis-ex" element={<ColisExpide search = {getColumnSearchProps} />} />
          <Route path="colis-rc" element={<ColisReçu search = {getColumnSearchProps} />} />
          <Route path="colis-md" element={<ColisMiseDistribution search = {getColumnSearchProps} />} />
          <Route path="colis-l" element={<ColisLivrée search = {getColumnSearchProps} />} />
          <Route path="ajouter-colis/:type" element={<AjouterColis />} />
          <Route path="import-colis" element={<ColisImport />} />

          <Route path="list-produit" element={<ProduitList search = {getColumnSearchProps} />} />
          <Route path="ajouter-produit" element={<AjouterProduit />} />
          <Route path="ajouter-produit-colis" element={<ProduitColis search = {getColumnSearchProps}/>} />
          <Route path="colis-stock" element={<ColisStock />} />
          
        </Route>
      </Routes>
      </BrowserRouter>
    </CustomThemeProvider>
  );
}

export default App;
