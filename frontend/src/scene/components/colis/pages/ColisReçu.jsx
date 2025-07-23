// ==================== DÉBUT DU BLOC À COPIER ====================

import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// --- Librairies tierces (antd, react-icons) ---
import { 
  Button, 
  Popconfirm, 
  Dropdown, 
  Menu, 
  message, 
  Modal, 
  Form, 
  Input,
  Tag,
  FloatButton,
  Space,
  Avatar,
  Typography
} from 'antd';
import {
  PlusCircleFilled,
  DownOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ShopOutlined,
  CalendarOutlined,
  EditOutlined,
  DollarOutlined,
  TagOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { MdDeliveryDining } from "react-icons/md";
import { BsUpcScan } from "react-icons/bs";
import { FaBoxesStacked } from 'react-icons/fa6';
import { IoQrCodeSharp } from 'react-icons/io5';
import { IoMdRefresh } from 'react-icons/io';

// --- Fichiers internes au projet ---
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import TableDashboard from '../../../global/TableDashboard';
import request from '../../../../utils/request';

// --- Logique Redux ---
import { getColis, getColisForClient, getColisForLivreur, updateStatut } from '../../../../redux/apiCalls/colisApiCalls';
// Note: colisActions est importé mais n'est pas utilisé dans le code que vous avez fourni.
// Si vous ne l'utilisez pas, vous pouvez le supprimer pour nettoyer le code.
import { colisActions } from '../../../../redux/slices/colisSlice'; 

// ===================== FIN DU BLOC À COPIER =====================

const getTableCellStyles = (theme) => ({
  codeCell: {
    background: theme === 'dark' ? '#1a1a1a' : '#f6f8ff',
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${theme === 'dark' ? '#333' : '#e6e8f0'}`,
  },
  dateCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  dateItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    color: theme === 'dark' ? '#b3b3b3' : '#666',
  },
  destinataireCard: {
    background: theme === 'dark' ? '#1f1f1f' : '#fff',
    padding: '12px',
    borderRadius: '8px',
    boxShadow: theme === 'dark' ? '0 2px 4px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
  },
  priceTag: {
    background: 'linear-gradient(135deg, #00b96b 0%, #008148 100%)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    boxShadow: '0 2px 4px rgba(0,153,85,0.2)',
  },
  businessBadge: {
    background: theme === 'dark' ? '#1a2733' : '#f0f7ff',
    border: `1px solid ${theme === 'dark' ? '#234' : '#bae0ff'}`,
    borderRadius: '6px',
    padding: '8px 12px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: theme === 'dark' ? '#4c9eff' : '#0958d9',
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '500',
  }
});

function ColisReçu({search}) {
    const { theme } = useContext(ThemeContext);
  const tableCellStyles = getTableCellStyles(theme);
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
      const queryParams = {
        statut: "Reçu",
      };
      dispatch(getColis(queryParams));
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
      width: 180,
      render: (text) => (
        <div style={tableCellStyles.codeCell}>
          <Typography.Text
            copyable={{
              tooltips: ['Copier', 'Copié!'],
              icon: [<CopyOutlined key="copy" />, <CheckOutlined key="copied" />],
            }}
            style={{ 
              fontWeight: '600',
              fontSize: '14px',
              color: '#1677ff',
              display: 'block'
            }}
          >
            {text}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: 'Livreur',
      dataIndex: 'livreur',
      key: 'livreur',
      render: (text, record) => (
        <div style={tableCellStyles.businessBadge}>
          <MdDeliveryDining style={{ fontSize: '16px' }} />
          {record.livreur ? (
            <Typography.Text strong>{record.livreur.nom} - {record.livreur.tele}</Typography.Text>
          ) : (
            <Tag icon={<ClockCircleOutlined />} color="default">
              Operation de Ramassage
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 200,
      render: (text) => (
        <div style={tableCellStyles.dateCell}>
          <div style={tableCellStyles.dateItem}>
            <EditOutlined style={{ color: '#52c41a' }} />
            <span>Mise à jour: {formatDate(text)}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Destinataire',
      dataIndex: 'nom',
      key: 'nom',
      render: (text, record) => (
        <div style={tableCellStyles.destinataireCard}>
          <Typography.Text strong style={{ fontSize: '15px', display: 'block', marginBottom: '8px' }}>
            {text}
          </Typography.Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Tag icon={<PhoneOutlined />} color="blue">
              {record.tele}
            </Tag>
            <Tag icon={<EnvironmentOutlined />} color="orange">
              {record.ville.nom}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'État',
      dataIndex: 'etat',
      key: 'etat',
      width: 120,
      render: (etat) => (
        <Tag 
          icon={etat ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={etat ? 'success' : 'error'}
          style={{ 
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '13px'
          }}
        >
          {etat ? 'Payée' : 'Non Payée'}
        </Tag>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      width: 140,
      render: (text) => {
        const statusConfig = {
          'Livrée': { color: '#52c41a', icon: <CheckCircleOutlined />, bg: '#f6ffed', border: '#b7eb8f' },
          'Annulée': { color: '#ff4d4f', icon: <CloseCircleOutlined />, bg: '#fff2f0', border: '#ffccc7' },
          'Refusée': { color: '#ff4d4f', icon: <CloseCircleOutlined />, bg: '#fff2f0', border: '#ffccc7' },
          'Programme': { color: '#faad14', icon: <ClockCircleOutlined />, bg: '#fffbe6', border: '#ffe58f' },
          'En Attente': { color: '#1677ff', icon: <SyncOutlined spin />, bg: '#e6f4ff', border: '#91caff' },
        };

        const config = statusConfig[text] || statusConfig['En Attente'];

        return (
          <div style={{
            ...tableCellStyles.statusBadge,
            color: config.color,
            backgroundColor: config.bg,
            border: `1px solid ${config.border}`,
          }}>
            {config.icon}
            {text}
          </div>
        );
      },
    },
    {
      title: 'Prix',
      dataIndex: 'prix',
      key: 'prix',
      width: 140,
      render: (text) => (
        <div style={tableCellStyles.priceTag}>
          <DollarOutlined />
          <span style={{ fontSize: '16px', fontWeight: '600' }}>
            {text || 'N/A'} DH
          </span>
        </div>
      ),
    },
  ];

  // Add rowSelection configuration
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys) => {
      setSelectedRowKeys(selectedRowKeys);
    },
  };

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
              rowSelection={rowSelection}
              id="code_suivi"
              theme={theme}
              onSelectChange={setSelectedRowKeys}
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
export default ColisReçu;
