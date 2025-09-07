import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import { Button, message, Modal, Form, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import TableDashboard from '../../../global/TableDashboard';
import { MdDeliveryDining } from 'react-icons/md';
import { IoMdRefresh } from 'react-icons/io';
import { FaBoxesStacked } from 'react-icons/fa6';
import { IoQrCodeSharp } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { getColis } from '../../../../redux/apiCalls/colisApiCalls';
import request from '../../../../utils/request';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  EditOutlined,
  DollarOutlined,
  CopyOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Text } = Typography;

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
    boxShadow:
      theme === 'dark'
        ? '0 2px 4px rgba(0,0,0,0.2)'
        : '0 2px 4px rgba(0,0,0,0.05)',
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
  },
});

function ColisExpide({ search }) {
  const { theme } = useContext(ThemeContext);
  const tableCellStyles = getTableCellStyles(theme);
  const [data, setData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentColis, setCurrentColis] = useState(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  // Retrieve Colis Data for "Expediée" status
  const { colisData, user, store } = useSelector((state) => ({
    colisData: state.colis.colis || [],
    user: state.auth.user,
    store: state.auth.store,
  }));

  const getDataColis = () => {
    if (user?.role) {
      const queryParams = { statut: 'Expediée' };
      dispatch(getColis(queryParams));
    }
  };

  useEffect(() => {
    getDataColis();
    window.scrollTo(0, 0);
  }, [dispatch, user?.role, store?._id, user._id]);

  useEffect(() => {
    setData(colisData);
  }, [colisData]);

  // Update status to "Reçu" for selected colis
  const handleReçu = async () => {
    if (selectedRowKeys.length > 0) {
      setLoading(true);
      try {
        await request.put('/api/colis/statu/update', {
          colisCodes: selectedRowKeys,
          new_status: 'Reçu',
        });
        setLoading(false);
        success(
          `${selectedRowKeys.length} colis marqués comme reçus avec succès.`
        );
        setSelectedRowKeys([]);
        const newData = data.filter(
          (item) => !selectedRowKeys.includes(item.code_suivi)
        );
        setData(newData);
      } catch (err) {
        setLoading(false);
        error('Erreur lors de la mise à jour des colis.');
      }
    } else {
      warning('Veuillez sélectionner au moins un colis.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(
      date.getMonth() + 1
    ).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(
      2,
      '0'
    )}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const columns = [
    {
      title: 'Code Suivi',
      dataIndex: 'code_suivi',
      key: 'code_suivi',
      width: 250,
      render: (text) => (
        <div style={tableCellStyles.codeCell}>
          <Text
            copyable={{
              tooltips: ['Copier', 'Copié!'],
              icon: [<CopyOutlined key="copy" />, <CheckOutlined key="copied" />],
            }}
            style={{ fontWeight: '600', fontSize: '14px', color: '#1677ff' }}
          >
            {text}
          </Text>
        </div>
      ),
    },
    {
      title: 'Livreur',
      dataIndex: 'livreur',
      key: 'livreur',
      width: 300,
      render: (text, record) => (
        <div style={tableCellStyles.businessBadge}>
          <MdDeliveryDining style={{ fontSize: '16px', color: '#1677ff' }} />
          {record.livreur ? (
            <Text strong>
              {record.livreur.nom} - {record.livreur.tele}
            </Text>
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
      width: 250,
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
      width: 250,

      render: (text, record) => (
        <div style={tableCellStyles.destinataireCard}>
          <Text strong style={{ fontSize: '15px', marginBottom: '8px' }}>
            {text}
          </Text>
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
      width: 150,
      key: 'etat',
      render: (text, record) =>
        record.etat ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Payée
          </Tag>
        ) : (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            Non Payée
          </Tag>
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
      title: 'Prix',
      dataIndex: 'prix',
      key: 'prix',
      width: 250,
      render: (text) => (
        <div style={tableCellStyles.priceTag}>
          <DollarOutlined />
          <span
            style={{ fontSize: '16px', fontWeight: '600', color: '#52c41a' }}
          >
            {text !== undefined ? text : 'غير محدد'} DH
          </span>
        </div>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys) => {
      setSelectedRowKeys(selectedRowKeys);
    },
  };

  return (
    <div className="page-dashboard">
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
            style={{ backgroundColor: theme === 'dark' ? '#001529' : '#fff' }}
          >
            <h4>Colis Expidée</h4>
            <div className="bar-action-data">
              <Button
                icon={<IoMdRefresh />}
                type="primary"
                onClick={getDataColis}
              >
                Refresh
              </Button>
              <Button
                icon={<FaBoxesStacked />}
                type="primary"
                onClick={handleReçu}
                loading={loading}
                disabled={selectedRowKeys.length === 0}
              >
                Marquer comme Reçu ({selectedRowKeys.length})
              </Button>
              <Button
                icon={<IoQrCodeSharp />}
                type="primary"
                onClick={() =>
                  navigate('/dashboard/scan/statu/Reçu')
                }
                loading={loading}
              >
                Scan
              </Button>
            </div>
            <TableDashboard
              column={columns}
              data={data}
              rowSelection={rowSelection}
              id="code_suivi"
              theme={theme}
              onSelectChange={setSelectedRowKeys}
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.08)' :'#fff',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            />
            {contextHolder}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ColisExpide;
