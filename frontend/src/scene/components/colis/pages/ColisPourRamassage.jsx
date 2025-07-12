import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { PlusCircleFilled, CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { Button, message, Modal, Form, Input, Tooltip } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import TableDashboard from '../../../global/TableDashboard';
import { BsUpcScan } from "react-icons/bs";
import { getColis } from '../../../../redux/apiCalls/colisApiCalls';
import { useDispatch, useSelector } from 'react-redux';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Tag } from 'antd';
import { FaBoxesStacked, FaDownload } from 'react-icons/fa6';
import { IoQrCodeSharp } from 'react-icons/io5';
import request from '../../../../utils/request';
import { toast } from 'react-toastify';
import moment from 'moment';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// **Add the following imports:**
import { FiRefreshCcw } from 'react-icons/fi';
import { Typography } from 'antd';
import { ExclamationCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { IoMdRefresh } from 'react-icons/io';
import { FaPrint, FaTicketAlt } from 'react-icons/fa';
import TicketColis from '../../tickets/TicketColis';
import TicketColis2 from '../components/TicketColis2';

// Add these imports at the top
import {
  PhoneOutlined,
  EnvironmentOutlined,
  ShopOutlined,
  CalendarOutlined,
  EditOutlined,
  DollarOutlined,
  TagOutlined
} from '@ant-design/icons';

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

function ColisPourRamassage() { // Removed 'search' prop as it's handled internally
  const { theme } = useContext(ThemeContext);
  const tableCellStyles = getTableCellStyles(theme);
  const [data, setData] = useState([]);
  const dispatch = useDispatch();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentColis, setCurrentColis] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate(); // Get history for redirection
  const [loading, setLoading] = useState(false);
  const [openTicket , setOpenTicket] = useState(false);
  const [colis , setColis] = useState(null);
  const [openBatchTicket, setOpenBatchTicket] = useState(false);

  // **Add search state**
  const [searchQuery, setSearchQuery] = useState('');

  // Helper function to get selected colis data (inspired by ColisRamasse2.jsx)
  const getSelectedColisData = () => {
    return data.filter(colis => selectedRowKeys.includes(colis.code_suivi));
  };

  const success = (text) => {
    messageApi.open({
      type: 'success',
      content: text,
    });
  };

  const handleTicket = (colis) => {
    setOpenTicket(true);
    setColis(colis);
  }

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

  // Recuperation des colis selon le role
  const getDataColis = () => {
    if (user?.role) {
        const queryParams = {
          statut: "attente de ramassage",
        };
        dispatch(getColis(queryParams));
    }
  };

  useEffect(() => {
    getDataColis();
    window.scrollTo(0, 0);
  }, [dispatch, user?.role, store?._id, user._id]);

  // Filter colis for "Attente de Ramassage"
  useEffect(() => {
    setData(colisData);
  }, [colisData]);

  // **Implement search functionality**
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setData(colisData);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filteredData = colisData.filter(colis => {
        // Customize the fields you want to search through
        return (
          colis.code_suivi.toLowerCase().includes(lowerCaseQuery) ||
          colis.nom.toLowerCase().includes(lowerCaseQuery) ||
          colis.tele.toLowerCase().includes(lowerCaseQuery) ||
          (colis.ville?.nom && colis.ville.nom.toLowerCase().includes(lowerCaseQuery)) ||
          (colis.store?.storeName && colis.store.storeName.toLowerCase().includes(lowerCaseQuery))
        );
      });
      setData(filteredData);
    }
  }, [searchQuery, colisData]);

  // Hide page for "livreur" role
  if (user?.role === 'livreur') {
    return null; // This will hide the entire page content for "livreur"
  }

  const handleRamasse = async () => {
    if (selectedRowKeys.length > 0) {
      // Dispatch the updateStatut action to update the server
      setLoading(true);
      try {
        // Send a PUT request to update the status of selected colis
        const response = await request.put('/api/colis/statu/update', {
          colisCodes: selectedRowKeys,
          new_status: 'Ramassée'
        });
        setLoading(false);
        setSelectedRowKeys([]);
        toast.success(response.data.message);
        // Update the local data to remove the updated colis
        const newData = data.filter(item => !selectedRowKeys.includes(item.code_suivi));
        setData(newData);
      } catch (err) {
        setLoading(false);
        error("Erreur lors de la mise à jour des colis.");
      }

    } else {
      warning("Veuillez sélectionner une colonne");
    }
  };

  const showModal = (record) => {
    setCurrentColis(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleModifier = () => {
    if (selectedRowKeys.length === 1) {
      const record = colisData.find(item => item.code_suivi === selectedRowKeys[0]);
      showModal(record);
    } else {
      warning("Veuillez sélectionner une seule colonne.");
    }
  };

  const confirmSuppression = () => {
    const newData = colisData.filter(item => !selectedRowKeys.includes(item.code_suivi));
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

  const handleOk = () => {
    form.validateFields().then(values => {
      const newData = colisData.map(item => {
        if (item.code_suivi === currentColis.code_suivi) {
          return { ...item, ...values };
        }
        return item;
      });
      setData(newData);
      setIsModalVisible(false);
      success("Colis modifié avec succès");
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const exportToExcel = () => {
    try {
      if (selectedRowKeys.length === 0) {
        toast.error("Veuillez sélectionner au moins un colis à exporter.");
        return;
      }

      // Filter selected rows from the data
      const selectedData = data.filter(item => selectedRowKeys.includes(item.code_suivi));

      // Map selectedData to a format suitable for Excel
      const dataToExport = selectedData.map(colis => ({
        "Code Suivi": colis.code_suivi,
        "Destinataire": colis.nom,
        "Téléphone": colis.tele,
        "Ville": colis.ville?.nom || 'N/A',
        "Adresse": colis.adresse || 'N/A',
        "Prix (DH)": colis.prix,
        "Statut": colis.statut,
        "Tarif Ajouter (DH)": colis.tarif_ajouter?.value || 0,
        // Add more fields as needed
      }));

      // Create a worksheet
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);

      // Create a new workbook and append the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Colis Sélectionnés");

      // Generate a buffer
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

      // Create a blob from the buffer
      const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });

      // Save the file
      saveAs(dataBlob, `Colis_Sélectionnés_${moment().format('YYYYMMDD_HHmmss')}.xlsx`);

      // Success toast
      toast.success("Exporté vers Excel avec succès!");

    } catch (error) {
      console.error("Erreur lors de l'exportation vers Excel:", error);
      toast.error("Échec de l'exportation vers Excel.");
    }
  };

  const handleBatchTickets = () => {
    if (selectedRowKeys.length === 0) {
      warning("Veuillez sélectionner au moins un colis.");
      return;
    }
    const selectedTickets = data.filter(colis => selectedRowKeys.includes(colis.code_suivi));
    navigate('/dashboard/tickets', { state: { selectedColis: selectedTickets } });
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
      render: (text, record) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {record.replacedColis && (
            <Tag icon={<FiRefreshCcw />} color="geekblue" style={{ fontSize: '11px' }}>
              Remplacée
            </Tag>
          )}
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
          {record.expedation_type === "ameex" && (
            <Tag color="purple" style={{ fontSize: '11px' }}>AMEEX: {record.code_suivi_ameex}</Tag>
          )}
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

        const phoneStyle = {
          color: theme === 'dark' ? '#94a3b8' : '#64748b',
          fontSize: '12px',
          fontWeight: '500',
          textAlign: 'left',
          lineHeight: '1.2'
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
      width: 140,
      render: (text, record) => {
        const statusConfig = {
          'Livrée': { color: '#52c41a', icon: <CheckCircleOutlined />, bg: '#f6ffed', border: '#b7eb8f' },
          'Annulée': { color: '#ff4d4f', icon: <CloseCircleOutlined />, bg: '#fff2f0', border: '#ffccc7' },
          'Refusée': { color: '#ff4d4f', icon: <CloseCircleOutlined />, bg: '#fff2f0', border: '#ffccc7' },
          'Programme': { color: '#faad14', icon: <ClockCircleOutlined />, bg: '#fffbe6', border: '#ffe58f' },
          'Remplacée': { color: '#722ed1', icon: <ExclamationCircleOutlined />, bg: '#f9f0ff', border: '#d3adf7' },
          'En Retour': { color: '#eb2f96', icon: <ExclamationCircleOutlined />, bg: '#fff0f6', border: '#ffadd2' },
          'Fermée': { color: '#8c8c8c', icon: <MinusCircleOutlined />, bg: '#fafafa', border: '#d9d9d9' },
        };

        const config = statusConfig[record.statut] || { color: '#1677ff', icon: <SyncOutlined spin />, bg: '#e6f4ff', border: '#91caff' };

        return (
          <div style={{
            ...tableCellStyles.statusBadge,
            color: config.color,
            backgroundColor: config.bg,
            border: `1px solid ${config.border}`,
          }}>
            {config.icon}
            {record.statut}
          </div>
        );
      },
    },
    {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <EnvironmentOutlined style={{ fontSize: '14px' }} />
          Adresse
        </span>
      ),
      dataIndex: 'adresse',
      key: 'adresse',
      render: (text, record) => <span style={{ color: theme === 'dark' ? '#a3e635' : '#0ea5e9', fontWeight: 500 }}>{record.adresse || 'N/A'}</span>,
    },
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
            <h4>Colis attend de ramassage</h4>
            {
              user?.role === "admin"
              ?
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                background: theme === 'dark' ? '#0f172a' : '#f8fafc',
                borderRadius: '12px',
                boxShadow: theme === 'dark' ? '0 2px 8px #0f172a33' : '0 2px 8px #e0e7ef33',
                marginBottom: '24px',
                flexWrap: 'wrap',
              }}>
                <Button icon={<IoMdRefresh />} type="primary" onClick={getDataColis} loading={loading}>Refresh</Button>
                <Button icon={<FaBoxesStacked />} type="primary" onClick={handleRamasse} loading={loading} style={{ marginRight: '8px' }}>Ramasser</Button>
                <Button icon={<IoQrCodeSharp />} type="primary" onClick={() => navigate("/dashboard/scan/statu/Ramassée")} loading={loading} style={{ marginRight: '8px' }}>Scan</Button>
                <Button icon={<FaDownload />} type="default" onClick={exportToExcel} disabled={selectedRowKeys.length === 0}>Export to Excel</Button>
                <Button icon={<FaTicketAlt />} type="primary" onClick={() => setOpenBatchTicket(true)} disabled={selectedRowKeys.length === 0} style={{ marginRight: '8px', backgroundColor: '#1890ff', borderColor: '#1890ff' }}>Tickets Groupés</Button>
              </div>
              :
              ""
            }

            {/* **Add Search Input Here** */}
            <div style={{ marginBottom: '16px' }}>
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
              <Input
                placeholder="Rechercher des colis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                allowClear
                style={{
                  width: '300px',
                }}
              />
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
                marginTop: '8px',
              }}
            />
            <Modal
              width={600}
              open={openTicket}
              onCancel={() => {
                setOpenTicket(false)
                setColis(null)
              }}
              onOk={() => {
                setOpenTicket(false)
                setColis(null)
              }}
            >
              <TicketColis colis={colis} showDownloadButton={true} />
            </Modal>
            {/* Batch Ticket Modal */}
            <Modal
              width={800}
              open={openBatchTicket}
              onCancel={() => setOpenBatchTicket(false)}
              footer={null}
              title="Tickets Colis (Sélection)"
            >
              <TicketColis2 colisList={getSelectedColisData()} />
            </Modal>
            {contextHolder}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ColisPourRamassage;
