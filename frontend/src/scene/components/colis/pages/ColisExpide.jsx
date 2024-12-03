import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { PlusCircleFilled, DownOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Dropdown, Menu, message, Modal, Form, Input } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import TableDashboard from '../../../global/TableDashboard';
import { MdDeliveryDining } from "react-icons/md";
import { BsUpcScan } from "react-icons/bs";
import { useDispatch, useSelector } from 'react-redux';
import { getColis, getColisForClient, getColisForLivreur } from '../../../../redux/apiCalls/colisApiCalls';
import axios from 'axios';
import { FaBoxesStacked } from "react-icons/fa6";
import { IoQrCodeSharp } from "react-icons/io5";
import { toast } from 'react-toastify';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Tag } from 'antd';
import request from '../../../../utils/request';
import { IoMdRefresh } from 'react-icons/io';

function ColisExpide({ search }) {
  const { theme } = useContext(ThemeContext);
  const [data, setData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentColis, setCurrentColis] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const dispatch = useDispatch();
  const navigate = useNavigate()

  const success = (text) => {
    messageApi.open({
      type: 'success',
      content: text,
    });
  };

  const error = (text) => {
    messageApi.open({
      type: 'error',
      content: text,
    });
  };

  const warning = (text) => {
    messageApi.open({
      type: 'warning',
      content: text,
    });
  };

  // Get Colis Data for the 'Expediée' status
  const { colisData, user, store } = useSelector((state) => ({
    colisData: state.colis.colis || [],
    user: state.auth.user,
    store: state.auth.store,
  }));

  const getDataColis = ()=>{
    if (user?.role) {
      if (user.role === "admin" || user.role === "team") {
        dispatch(getColis("Expediée"));
      } else if (user.role === "client" && store?._id) {
        dispatch(getColisForClient(store._id, "Expediée"));
      } else if (user.role === "livreur") {
        dispatch(getColisForLivreur(user._id, "Expediée"));
      } else if (user.role === "team") {
        dispatch(getColisForClient(user._id, 'Expediée'));
      }
    }
  }
  useEffect(() => {
    getDataColis()
    window.scrollTo(0, 0);
  }, [dispatch, user?.role, store?._id, user._id]);

  useEffect(() => {
    setData(colisData);
  }, [colisData]);

  // Handle Update of Colis Status to "Reçu" for selected colis
  const handleReçu = async () => {
    if (selectedRowKeys.length > 0) {
      setLoading(true);
      try {
        // Send a PUT request to update the status of selected colis
        const response = await request.put('/api/colis/statu/update', {
          colisCodes: selectedRowKeys,
          new_status: 'Reçu'
        });
        setLoading(false);
        success(`${selectedRowKeys.length} colis marqués comme reçus avec succès.`);
        setSelectedRowKeys([]);
        // Update the local data to remove the updated colis
        const newData = data.filter(item => !selectedRowKeys.includes(item.code_suivi));
        setData(newData);
      } catch (err) {
        setLoading(false);
        error("Erreur lors de la mise à jour des colis.");
      }
    } else {
      warning("Veuillez sélectionner au moins un colis.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const columns = [
    {
      title: 'Code Suivi',
      dataIndex: 'code_suivi',
      key: 'code_suivi',
      ...search('code_suivi')
    },
    {
      title: 'Livreur',
      dataIndex: 'livreur',
      key: 'livreur',
      render: (text, record) => (
        <span>
          {record.livreur ? `${record.livreur.nom} - ${record.livreur.tele}` : (
            <Tag icon={<ClockCircleOutlined />} color="default">Operation de Ramassage</Tag>
          )}
        </span>
      ),
    },
    { title: 'Dernière Mise à Jour', dataIndex: 'updatedAt', key: 'updatedAt', render: formatDate },
    { title: 'Destinataire', dataIndex: 'nom', key: 'nom' },
    { title: 'Téléphone', dataIndex: 'tele', key: 'tele' },
    {
      title: 'État',
      dataIndex: 'etat',
      key: 'etat',
      render: (text, record) => (
        record.etat ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>Payée</Tag>
        ) : (
          <Tag color="error" icon={<CloseCircleOutlined />}>Non Payée</Tag>
        )
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (text, record) => (
        <Tag icon={<SyncOutlined spin />} color="processing">
          {record.statut}
        </Tag>
      ),
    },
    { title: 'Date de Livraison', dataIndex: 'date_livraison', key: 'date_livraison' },
    { title: 'Ville', dataIndex: 'ville', key: 'ville', render: (text, record) => <span>{record.ville.nom}</span> },
    { title: 'Adresse', dataIndex: 'adresse', key: 'adresse' },
    { title: 'Prix', dataIndex: 'prix', key: 'prix' },
    { title: 'Nature de Produit', dataIndex: 'nature_produit', key: 'nature_produit' },
  ];

  return (
    <div className='page-dashboard'>
      <Menubar />
      <main className="page-main">
        <Topbar />
        <div className="page-content" style={{ backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray1)', color: theme === 'dark' ? '#fff' : '#002242' }}>
          <div className="content" style={{ backgroundColor: theme === 'dark' ? '#001529' : '#fff' }}>
            <h4>Colis Expidée</h4>
            <div className="bar-action-data">
              <Button icon={<IoMdRefresh />} type="primary" onClick={()=>getDataColis()} >Refresh </Button>
              <Button icon={<FaBoxesStacked/>} type="primary" onClick={handleReçu} loading={loading}>Reçu</Button>
              <Button icon={<IoQrCodeSharp/>} type="primary" onClick={()=>navigate("/dashboard/scan/statu/Reçu")} loading={loading}>Scan</Button>
            </div>
            <TableDashboard
              column={columns}
              data={data}
              id="code_suivi"
              theme={theme}
              onSelectChange={setSelectedRowKeys}
            />
            {contextHolder}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ColisExpide;
