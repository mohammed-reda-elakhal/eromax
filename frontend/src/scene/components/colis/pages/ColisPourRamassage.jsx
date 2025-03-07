import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { PlusCircleFilled, DownOutlined, CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Dropdown, Menu, message, Modal, Form, Input, Tooltip } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import TableDashboard from '../../../global/TableDashboard';
import { MdDeliveryDining } from "react-icons/md";
import { BsUpcScan } from "react-icons/bs";
import { getColis, getColisForClient, getColisForLivreur, updateStatut } from '../../../../redux/apiCalls/colisApiCalls';
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
  
  
  // **Add search state**
  const [searchQuery, setSearchQuery] = useState('');

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

  const menu = (
    <Menu>
      <Menu.Item key="ramasse" onClick={() => handleRamasse()}>
        Ramasse
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
      title: 'Code Suivi',
      dataIndex: 'code_suivi',
      key: 'code_suivi',
      width: 180,
      render: (text, record) => (
        <div style={tableCellStyles.codeCell}>
          {record.replacedColis && (
            <Tag icon={<FiRefreshCcw />} color="geekblue" style={{ marginBottom: '8px' }}>
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
              fontSize: '14px',
              color: '#1677ff',
              display: 'block'
            }}
          >
            {text}
          </Typography.Text>
          {record.expedation_type === "ameex" && (
            <Tag color="purple" style={{ marginTop: '4px' }}>AMEEX: {record.code_suivi_ameex}</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 200,
      render: (text, record) => (
        <div style={tableCellStyles.dateCell}>
          <div style={tableCellStyles.dateItem}>
            <CalendarOutlined style={{ color: '#1677ff' }} />
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
      title: 'Destinataire',
      dataIndex: 'nom',
      key: 'nom',
      render: (text, record) => (
        <div style={tableCellStyles.destinataireCard}>
          <Typography.Text strong style={{ fontSize: '15px', display: 'block', marginBottom: '8px' }}>
            {record.nom}
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
      title: 'Prix',
      dataIndex: 'prix',
      key: 'prix',
      width: 140,
      render: (text, record) => (
        <div style={tableCellStyles.priceTag}>
          <DollarOutlined />
          <span style={{ fontSize: '16px', fontWeight: '600' }}>
            {record.prix || 'N/A'} DH
          </span>
        </div>
      ),
    },
    {
      title: 'Nature',
      dataIndex: 'nature_produit',
      key: 'nature_produit',
      width: 150,
      render: (text) => (
        <Tag 
          icon={<TagOutlined />}
          color="cyan"
          style={{ 
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '13px'
          }}
        >
          {text || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Business',
      dataIndex: 'store',
      key: 'store',
      render: (text, record) => (
        <div style={tableCellStyles.businessBadge}>
          <ShopOutlined />
          <Typography.Text strong>
            {record.store?.storeName}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: 'Statut',
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
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <div className="table-action">
           <Tooltip title="Ticket colis">
            <Button 
              type="primary" 
              icon={<FaPrint />} 
              onClick={() => handleTicket(record)}
              style={{
                backgroundColor: '#0d6efd',
                borderColor: '#0d6efd',
                color: '#fff'
              }}
            />
          </Tooltip>
        </div>
      ),
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
          <div className="page-content-header">
            <Title nom='Colis attend de ramassage' />
            {
                user?.role === "client" ?
                <Link to={`/dashboard/ajouter-colis/simple`} className='btn-dashboard'>
                    <PlusCircleFilled style={{marginRight:"8px"}} />
                    Ajouter Colis
                </Link>:""
            }
          </div>
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
              <div className="bar-action-data" style={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Button 
                  icon={<IoMdRefresh />} 
                  type="primary" 
                  onClick={getDataColis} 
                  style={{ marginRight: '8px' }}
                >
                  Refresh
                </Button>
                <Button 
                  icon={<FaBoxesStacked />} 
                  type="primary" 
                  onClick={handleRamasse} 
                  loading={loading}
                  style={{ marginRight: '8px' }}
                >
                  Ramasser
                </Button>
                <Button 
                  icon={<IoQrCodeSharp />} 
                  type="primary" 
                  onClick={() => navigate("/dashboard/scan/statu/Ramassée")} 
                  loading={loading}
                  style={{ marginRight: '8px' }}
                >
                  Scan
                </Button>
                <Button 
                  icon={<FaDownload />} 
                  type="default" 
                  onClick={exportToExcel}
                  disabled={selectedRowKeys.length === 0}
                >
                  Export to Excel
                </Button>
                <Button 
                  icon={<FaTicketAlt />} 
                  type="primary" 
                  onClick={handleBatchTickets}
                  disabled={selectedRowKeys.length === 0}
                  style={{ 
                    marginRight: '8px',
                    backgroundColor: '#1890ff',
                    borderColor: '#1890ff'
                  }}
                >
                  Tickets Groupés
                </Button>
              </div>
              :
              "" 
            }

            {/* **Add Search Input Here** */}
            <div style={{ marginBottom: '16px' }}>
              <Input
                placeholder="Rechercher des colis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                allowClear
                style={{ width: '300px' }}
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
                backgroundColor: '#fff',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
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
            {contextHolder}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ColisPourRamassage;
