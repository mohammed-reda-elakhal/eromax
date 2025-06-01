import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { Button, Modal, Form, message, Card, Divider, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import TableDashboard from '../../../global/TableDashboard';
import { useDispatch, useSelector } from 'react-redux';
import { affectationColisAmeex, getColis, getColisForClient } from '../../../../redux/apiCalls/colisApiCalls';
import { getLivreurList } from '../../../../redux/apiCalls/livreurApiCall';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, MinusCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { BsFillInfoCircleFill } from "react-icons/bs";
import { FaBoxesStacked } from 'react-icons/fa6';
import { IoQrCodeSharp } from 'react-icons/io5';
import request from '../../../../utils/request';
import { IoMdRefresh } from 'react-icons/io';
import { BsUpcScan } from "react-icons/bs";
import {
  PhoneOutlined,
  EnvironmentOutlined,
  ShopOutlined,
  CalendarOutlined,
  EditOutlined,
  TagOutlined,
  CopyOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { Typography } from 'antd';

const getTableCellStyles = (theme) => ({
  codeCell: {
    background: theme === 'dark' ? '#1e293b' : '#f8fafc',
    padding: '12px',
    borderRadius: '6px',
    border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
  },
  dateCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  dateItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: theme === 'dark' ? '#94a3b8' : '#64748b',
    fontWeight: '500',
  },
  destinataireCard: {
    background: 'transparent',
    padding: '12px',
    gap: '8px',
  },
  priceTag: {
    background: 'transparent',
    color: theme === 'dark' ? '#60a5fa' : '#3b82f6',
    padding: '0',
    borderRadius: '0',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    fontWeight: '600',
  },
  businessBadge: {
    background: theme === 'dark' ? '#1e293b' : '#f1f5f9',
    border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`,
    borderRadius: '6px',
    padding: '8px 12px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: theme === 'dark' ? '#e2e8f0' : '#475569',
    fontSize: '13px',
    fontWeight: '500',
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '500',
  },
  phoneTag: {
    background: theme === 'dark' ? '#1e40af' : '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
  },
  productTag: {
    background: theme === 'dark' ? '#0f766e' : '#14b8a6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
  }
});


function ColisRamasse({ search }) {
  const { theme } = useContext(ThemeContext);
  const tableCellStyles = getTableCellStyles(theme);
  const [data, setData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [selectedLivreur, setSelectedLivreur] = useState(null);

  const { livreurList, colisData, user, store } = useSelector(state => ({
    livreurList: state.livreur.livreurList,
    colisData: state.colis.colis || [],
    user: state.auth.user,
    store: state.auth.store,
  }));


  const getDataColis = () => {
    if (user?.role) {
      const queryParams = {
        statut: "Ramassée",
      };
      dispatch(getColis(queryParams));
    }
  };

  useEffect(() => {
    getDataColis();
    dispatch(getLivreurList());
    window.scrollTo(0, 0);
  }, [dispatch, user?.role, store?._id]);

  useEffect(() => {
    setData(colisData);
  }, [colisData]);

  const success = (text) => messageApi.success(text);
  const warning = (text) => messageApi.warning(text);
  const error = (text) => messageApi.error(text);

  const showModal = () => {
    if (selectedRowKeys.length > 0) {
      setSelectedLivreur(null);
      form.resetFields();
      setIsModalVisible(true);
    } else {
      toast.warn("Veuillez sélectionner au moins un colis !");
    }
  };

  const handleAffecterLivreur = async () => {
    if (selectedRowKeys.length > 0 && selectedLivreur) {
      // Get the selected colis data
      const selectedColisData = data.filter(item => selectedRowKeys.includes(item.code_suivi));

      if (selectedLivreur.nom === 'ameex') {
        // Dispatch the custom function for "ameex"
        dispatch(affectationColisAmeex(selectedColisData));
        // Optionally reset selections and close modal
        setSelectedRowKeys([]);
        setSelectedLivreur(null);
        setIsModalVisible(false);
      } else {
        // Existing code for other livreurs
        setLoading(true);
        try {
          // Send a PUT request to update the status of selected colis
          const response = await request.put('/api/colis/statu/affecter', {
            codesSuivi: selectedRowKeys,
            livreurId: selectedLivreur._id
          });
          setLoading(false);
          toast.success(response.data.message);
          setSelectedRowKeys([]);
          // Update the local data to remove the updated colis
          const newData = data.filter(item => !selectedRowKeys.includes(item.code_suivi));
          setData(newData);
          setSelectedLivreur(null);
          setIsModalVisible(false);
        } catch (err) {
          setLoading(false);
          toast.error("Erreur lors de la mise à jour des colis.");
        }
      }
    } else {
      warning('Veuillez sélectionner un livreur');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setSelectedLivreur(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const selectLivreur = (livreur) => {
    setSelectedLivreur(livreur);
  };

  const columns = [
    {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BsUpcScan style={{ fontSize: '14px' }} />
          Code Suivi
        </span>
      ),
      dataIndex: 'code_suivi',
      key: 'code_suivi',
      width: 200,
      render: (text) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Typography.Text
            copyable={{
              tooltips: ['Copier', 'Copié!'],
              icon: [<CopyOutlined key="copy" />, <CheckOutlined key="copied" />],
            }}
            style={{
              fontWeight: '600',
              fontSize: '13px',
              color: theme === 'dark' ? '#60a5fa' : '#3b82f6',
              fontFamily: 'monospace',
              letterSpacing: '0.5px'
            }}
          >
            {text}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CalendarOutlined style={{ fontSize: '14px' }} />
          Date
        </span>
      ),
      dataIndex: 'date',
      key: 'date',
      width: 200,
      render: (text, record) => (
        <div style={tableCellStyles.dateCell}>
          <div style={tableCellStyles.dateItem}>
            <CalendarOutlined style={{ color: theme === 'dark' ? '#60a5fa' : '#3b82f6' }} />
            <span>Créé: {formatDate(record?.createdAt)}</span>
          </div>
          <div style={tableCellStyles.dateItem}>
            <EditOutlined style={{ color: '#52c41a' }} />
            <span>Modifié: {formatDate(record?.updatedAt)}</span>
          </div>
        </div>
      ),
    },
    {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PhoneOutlined style={{ fontSize: '14px' }} />
          Destinataire
        </span>
      ),
      dataIndex: 'nom',
      key: 'nom',
      render: (text, record) => {
        const professionalCardStyle = {
          background: 'transparent',
          padding: '0',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        };

        const nameStyle = {
          color: theme === 'dark' ? '#e2e8f0' : '#475569',
          fontSize: '13px',
          fontWeight: '600',
          textAlign: 'left',
          lineHeight: '1.3',
          marginBottom: '4px'
        };

        const priceStyle = {
          color: theme === 'dark' ? '#60a5fa' : '#3b82f6',
          fontSize: '16px',
          fontWeight: '700',
          textAlign: 'left',
          lineHeight: '1.2'
        };

        return (
          <div style={professionalCardStyle}>
            <div>
              <Typography.Text style={nameStyle}>
                {record.nom?.length > 18 ? record.nom.substring(0, 18) + '...' : record.nom}
              </Typography.Text>
            </div>
            <div>
              <Tag style={tableCellStyles.phoneTag}>
                <PhoneOutlined style={{ marginRight: '4px' }} />
                {record.tele}
              </Tag>
            </div>
            <div>
              <Typography.Text style={priceStyle}>
                {record.prix || 'N/A'} DH
              </Typography.Text>
            </div>
          </div>
        );
      },
    },
    {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <EnvironmentOutlined style={{ fontSize: '14px' }} />
          Ville
        </span>
      ),
      dataIndex: 'ville',
      key: 'ville',
      width: 120,
      render: (text, record) => (
        <Tag
          icon={<EnvironmentOutlined />}
          style={{
            background: theme === 'dark' ? '#0f766e' : '#14b8a6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
            padding: '4px 8px'
          }}
        >
          {record.ville?.nom || 'N/A'}
        </Tag>
      ),
    },
    {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TagOutlined style={{ fontSize: '14px' }} />
          Nature
        </span>
      ),
      dataIndex: 'nature_produit',
      key: 'nature_produit',
      width: 150,
      render: (text) => (
        <Tag
          icon={<TagOutlined />}
          style={tableCellStyles.productTag}
        >
          {text || 'N/A'}
        </Tag>
      ),
    },
    {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShopOutlined style={{ fontSize: '14px' }} />
          Business
        </span>
      ),
      dataIndex: 'store',
      key: 'store',
      render: (text, record) => (
        <div style={tableCellStyles.businessBadge}>
          <ShopOutlined style={{ fontSize: '12px' }} />
          <Typography.Text style={{ fontSize: '13px', fontWeight: '500' }}>
            {record.store?.storeName?.length > 15
              ? record.store.storeName.substring(0, 15) + '...'
              : record.store?.storeName || 'N/A'
            }
          </Typography.Text>
        </div>
      ),
    },
    {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircleOutlined style={{ fontSize: '14px' }} />
          Statut
        </span>
      ),
      dataIndex: 'statut',
      key: 'statut',
      render: (text, record) => {
        let color = 'processing';
        let icon = <SyncOutlined spin />;
        switch (record.statut) {
          case 'Livrée':
            color = 'success';
            icon = <CheckCircleOutlined />;
            break;
          case 'Annulée':
          case 'Refusée':
            color = 'error';
            icon = <CloseCircleOutlined />;
            break;
          case 'Programme':
            color = 'default';
            icon = <ClockCircleOutlined />;
            break;
          case 'Remplacée':
          case 'En Retour':
            color = 'warning';
            icon = <ExclamationCircleOutlined />;
            break;
          case 'Fermée':
            color = 'default';
            icon = <MinusCircleOutlined />;
            break;
          default:
            color = 'processing';
            icon = <SyncOutlined spin />;
        }
        return <Tag icon={icon} color={color}>{record.statut}</Tag>;
      },
     },
  ];

  // Collect unique villes from selected colis
  const selectedColisVilles = data
    .filter(colis => selectedRowKeys.includes(colis.code_suivi))
    .map(colis => colis.ville.nom);

  const uniqueSelectedColisVilles = [...new Set(selectedColisVilles)];

  // Filter livreurs based on whether they cover all the selected colis villes
  const filteredLivreurs = livreurList.reduce(
    (acc, person) => {
      const personVilles = person.villes; // This should be an array of city names
      const coversAllVilles = uniqueSelectedColisVilles.every(ville => personVilles.includes(ville));
      if (coversAllVilles) {
        acc.preferred.push(person);
      } else {
        acc.other.push(person);
      }
      return acc;
    },
    { preferred: [], other: [] }
  );

  return (
    <div className='page-dashboard'>
      <Menubar />
      <main className="page-main">
        <Topbar />
        <div className="page-content" style={{ backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray1)', color: theme === 'dark' ? '#fff' : '#002242' }}>
          <style>
            {`
              /* Global Input Styling Fix */
              .page-content .ant-input,
              .page-content .ant-input-affix-wrapper,
              .page-content .ant-select-selector,
              .page-content .ant-textarea {
                background-color: ${theme === 'dark' ? '#1e293b' : '#fff'} !important;
                border-color: ${theme === 'dark' ? '#334155' : '#d9d9d9'} !important;
                color: ${theme === 'dark' ? '#e2e8f0' : '#000'} !important;
              }

              .page-content .ant-input::placeholder,
              .page-content .ant-input-affix-wrapper::placeholder,
              .page-content .ant-select-selection-placeholder,
              .page-content .ant-textarea::placeholder {
                color: ${theme === 'dark' ? '#94a3b8' : '#8c8c8c'} !important;
              }

              .page-content .ant-input:focus,
              .page-content .ant-input-affix-wrapper:focus,
              .page-content .ant-input-affix-wrapper-focused {
                border-color: ${theme === 'dark' ? '#60a5fa' : '#1890ff'} !important;
                box-shadow: 0 0 0 2px ${theme === 'dark' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(24, 144, 255, 0.2)'} !important;
              }

              .page-content .ant-input-clear-icon {
                color: ${theme === 'dark' ? '#94a3b8' : '#8c8c8c'} !important;
              }

              /* Filter dropdown styling */
              .page-content .ant-table-filter-dropdown {
                background-color: ${theme === 'dark' ? '#1e293b' : '#fff'} !important;
              }

              .page-content .ant-table-filter-dropdown .ant-input {
                background-color: ${theme === 'dark' ? '#1e293b' : '#fff'} !important;
                border-color: ${theme === 'dark' ? '#334155' : '#d9d9d9'} !important;
                color: ${theme === 'dark' ? '#e2e8f0' : '#000'} !important;
              }

              .page-content .ant-table-filter-dropdown .ant-input::placeholder {
                color: ${theme === 'dark' ? '#94a3b8' : '#8c8c8c'} !important;
              }

              /* Select dropdown styling */
              .page-content .ant-select-dropdown {
                background-color: ${theme === 'dark' ? '#1e293b' : '#fff'} !important;
              }

              .page-content .ant-select-item {
                background-color: ${theme === 'dark' ? '#1e293b' : '#fff'} !important;
                color: ${theme === 'dark' ? '#e2e8f0' : '#000'} !important;
              }

              .page-content .ant-select-item:hover {
                background-color: ${theme === 'dark' ? '#334155' : '#f5f5f5'} !important;
              }

              .page-content .ant-select-item-option-selected {
                background-color: ${theme === 'dark' ? '#60a5fa' : '#1890ff'} !important;
                color: #fff !important;
              }
            `}
          </style>
          <div className="content" style={{ backgroundColor: theme === 'dark' ? '#001529' : '#fff' }}>
            <div className="bar-action-data">
              <Button icon={<IoMdRefresh />} type="primary" onClick={() => getDataColis()} >Rafraîchir</Button>
              <Button icon={<FaBoxesStacked />} type="primary" onClick={() => showModal()} loading={loading}>Expédier</Button>
              <Button icon={<IoQrCodeSharp />} type="primary" onClick={() => navigate("/dashboard/scan/statu/Expediée")} loading={loading}>Scanner</Button>
            </div>
            <TableDashboard
              column={columns}
              data={data}
              id="code_suivi"
              theme={theme}
              rowSelection={{
                selectedRowKeys: selectedRowKeys,
                onChange: setSelectedRowKeys,
              }}
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

      <Modal
        title="Sélectionner Livreur"
        visible={isModalVisible}
        onOk={handleAffecterLivreur}
        onCancel={handleCancel}
        width={"90vw"}
      >
        <div className='livreur_list_modal'>
          <h3>Livreurs Préférés</h3>
          <div className="livreur_list_modal_card">
            {filteredLivreurs.preferred.length ? filteredLivreurs.preferred.map(person => (
              <Card
                key={person._id}
                hoverable
                style={{
                  width: 240,
                  margin: '10px',
                  border:
                    selectedLivreur && selectedLivreur._id === person._id
                      ? '2px solid #1890ff'
                      : '1px solid #f0f0f0',
                }}
                onClick={() => selectLivreur(person)}
              >
                <Card.Meta
                  title={<div>{person.username}</div>}
                  description={
                    <>
                      {person.tele}
                      <Button
                        icon={<BsFillInfoCircleFill />}
                        onClick={() =>
                          toast.info(`Villes: ${person.villes.join(', ')}`)
                        }
                        type='primary'
                        style={{ float: 'right' }}
                      />
                    </>
                  }
                />
              </Card>
            )) : <p>Aucun livreur préféré disponible</p>}
          </div>
        </div>
        <Divider />
        <div className='livreur_list_modal'>
          <h3>Autres Livreurs</h3>
          <div className="livreur_list_modal_card">
            {filteredLivreurs.other.map(person => (
              <Card
                key={person._id}
                hoverable
                style={{
                  width: 240,
                  margin: '10px',
                  border:
                    selectedLivreur && selectedLivreur._id === person._id
                      ? '2px solid #1890ff'
                      : '1px solid #f0f0f0',
                }}
                onClick={() => selectLivreur(person)}
              >
                <Card.Meta
                  title={<div>{person.username}</div>}
                  description={
                    <>
                      {person.tele}
                      <Button
                        icon={<BsFillInfoCircleFill />}
                        onClick={() =>
                          toast.info(`Villes: ${person.villes.join(', ')}`)
                        }
                        type='primary'
                        style={{ float: 'right' }}
                      />
                    </>
                  }
                />
              </Card>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ColisRamasse;
