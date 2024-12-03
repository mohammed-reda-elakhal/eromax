import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';

import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { PlusCircleFilled, DownOutlined } from '@ant-design/icons';
//import { Button, Popconfirm, Dropdown, Menu, message, Modal, Form, Input } from 'antd';
import Input from 'antd/es/input';
import Space from 'antd/es/space';
import Button from 'antd/es/button';
import Form from 'antd/es/form'
import Modal from 'antd/es/modal/Modal';
import { Menu } from 'antd';
import Avatar from 'antd';
import { message } from 'antd';
import Popconfirm from 'antd/es/popconfirm';
import Dropdown from 'antd/es/dropdown';
import FloatButton from 'antd/es/float-button';
import { Link, useNavigate } from 'react-router-dom';
import TableDashboard from '../../../global/TableDashboard';
import { MdDeliveryDining } from "react-icons/md";
import { BsUpcScan } from "react-icons/bs";
import { useDispatch, useSelector } from 'react-redux';
import { colisActions} from '../../../../redux/slices/colisSlice';
import { getColis, getColisForClient, getColisForLivreur, updateStatut } from '../../../../redux/apiCalls/colisApiCalls';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Tag } from 'antd';
import request from '../../../../utils/request';
import { FaBoxesStacked } from 'react-icons/fa6';
import { IoQrCodeSharp } from 'react-icons/io5';
import { IoMdRefresh } from 'react-icons/io';


function ColisReçu({search}) {
    const { theme } = useContext(ThemeContext);
  const [data, setData] = useState([]);
  const dispatch = useDispatch();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentColis, setCurrentColis] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

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
  const { colisData, user, store } = useSelector((state) => ({
    colisData: state.colis.colis || [],  // Corrected the casing of colisData
    user: state.auth.user,
    store: state.auth.store,
  }));
  const getDataColis = ()=>{
    if (user?.role) {
      if (user.role === "admin" || user.role === "team") {
        dispatch(getColis("Reçu"));
      } else if (user.role === "client" && store?._id) {
        dispatch(getColisForClient(store._id , "Reçu"));
      }else if (user.role === "livreur"){
        dispatch(getColisForLivreur(user._id , "Reçu"));
      }else if (user.role === "team") {
        dispatch(getColisForClient(user._id,'Reçu'));  // Use getColisForLivreur for 'livreur'
      }
    }
  }
  useEffect(() => {
    getDataColis()
    window.scrollTo(0, 0);
  }, [dispatch, user?.role, store?._id, user._id]);

useEffect(() => {
  if (colisData) {
      setData(colisData); // Update data state with the fetched colis
  }
}, [colisData]);



const handleDistribution = async (colisId) => {
  if (selectedRowKeys.length > 0) {
    setLoading(true);
    try {
      // Send a PUT request to update the status of selected colis
      const response = await request.put('/api/colis/statu/update', {
        colisCodes: selectedRowKeys,
        new_status: 'Mise en Distribution'
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


  const showModal = (record) => {
    setCurrentColis(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleModifier = () => {
    if (selectedRowKeys.length === 1) {
      const record = colisData.find(item => item.id === selectedRowKeys[0]);
      showModal(record);
    } else {
      warning("Veuillez sélectionner une seule colonne.");
    }
  };

  const confirmSuppression = () => {
    const newData = colisData.filter(item => !selectedRowKeys.includes(item.id));
    setData(newData);
    setSelectedRowKeys([]);
    success(`${selectedRowKeys.length} colis supprimés.`);
  };

  const handleSuppremer = () => {
    if (selectedRowKeys.length > 0) {
      Modal.confirm({
        title: 'Confirmation de suppression',
        content: `Êtes-vous sûr de vouloir supprimer ${selectedRowKeys.length} colis ?`,
        okText: 'Oui',
        cancelText: 'Non',
        onOk: confirmSuppression,
      });
    } else {
      warning("Veuillez sélectionner une colonne");
    }
  };





  const menu = (
    <Menu>
      <Menu.Item key="ramasse" onClick={() => handleDistribution()}>
        Mise en Distribution
      </Menu.Item>
      <Menu.Item key="modifier" onClick={handleModifier}>
        Modifier
      </Menu.Item>
      <Menu.Item key="suppremer" onClick={handleSuppremer}>
        Suppremer
      </Menu.Item>
    </Menu>
  );

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
          {
            record.livreur 
            ? 
            record.livreur.nom + ' - ' + record.livreur.tele 
            : 
            <Tag icon={<ClockCircleOutlined />} color="default">
               Operation de Ramassage
            </Tag>
           
          }
        </span> // Check if 'livreur' exists, otherwise show default message
      )
    },
    { title: 'Dernière Mise à Jour', dataIndex: 'updatedAt', key: 'updatedAt', render: formatDate },
    {
      title: 'Destinataire',
      dataIndex: 'nom',
      key: 'nom',
    },
    {
      title: 'Téléphone',
      dataIndex: 'tele',
      key: 'tele',
    },
    {
      title: 'État',
      dataIndex: 'etat',
      key: 'etat',
      render: (text, record) => (
        record.etat ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Payée
          </Tag>
        ) : (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            Non Payée
          </Tag>
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
    {
      title: 'Date de Livraison',
      dataIndex: 'date_livraison',
      key: 'date_livraison',
    },
    {
      title: 'Ville',
      dataIndex: 'ville',
      key: 'ville',
      render: (text, record) => (
        <span>
          {record.ville.nom}
        </span>
      ),
    },
    {
      title: 'Prix',
      dataIndex: 'prix',
      key: 'prix',
    },
    {
      title: 'Nature de Produit',
      dataIndex: 'nature_produit',
      key: 'nature_produit',
    }
  ];

  return (
    <div className='page-dashboard'>
      <Menubar />
      <main className="page-main">
        <Topbar />
        <div
          className="page-content"
          style={{
            backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray1)',
            color: theme === 'dark' ? '#fff' : '#002242',
          }}
        >
          <div
            className="content"
            style={{
              backgroundColor: theme === 'dark' ? '#001529' : '#fff',
            }}
          >
            <h4>Colis Reçu</h4>
            <div className="bar-action-data">
              <Button icon={<IoMdRefresh />} type="primary" onClick={()=>getDataColis()} >Refresh </Button>
              <Button icon={<FaBoxesStacked/>} type="primary" onClick={handleDistribution} loading={loading}>Mise en Distribution</Button>
              <Button icon={<IoQrCodeSharp/>} type="primary" onClick={()=>navigate("/dashboard/scan/statu/Mise en Distribution")} loading={loading}>Scan</Button>
            </div>
            <TableDashboard
              column={columns}
              data={data} // Use the local data state, not the Redux state
              id="code_suivi"
              theme={theme}
              onSelectChange={setSelectedRowKeys}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
export default ColisReçu;
