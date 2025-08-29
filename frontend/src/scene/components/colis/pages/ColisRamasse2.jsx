import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { PlusCircleFilled, CopyOutlined, CheckOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Button, message, Modal, Form, Input, Tooltip, Card, Row, Col, Statistic, Tag, Typography, Collapse, Divider } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import TableDashboard from '../../../global/TableDashboard';
import { BsUpcScan } from "react-icons/bs";
import { getColisRamasse, affectationColisAmeex } from '../../../../redux/apiCalls/colisApiCalls';
import { getLivreurList } from '../../../../redux/apiCalls/livreurApiCall';
import { useDispatch, useSelector } from 'react-redux';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  TeamOutlined,
  ShopOutlined,
  PhoneOutlined,
  DollarOutlined,
  CalendarOutlined,
  EditOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { toast } from 'react-toastify';
import moment from 'moment';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FiRefreshCcw } from 'react-icons/fi';
import { ExclamationCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { IoMdRefresh } from 'react-icons/io';
import { FaPrint as FaPrintIcon, FaTicketAlt, FaDownload, FaBoxes } from 'react-icons/fa';
import { IoQrCodeSharp } from 'react-icons/io5';
import TicketColis2 from '../components/TicketColis2';
import { BsFillInfoCircleFill } from "react-icons/bs";
import request from '../../../../utils/request';
import '../colis.css';

const { Text, Title: AntTitle } = Typography;
const { Panel } = Collapse;

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
  },
  regionCard: {
    background: theme === 'dark' ? '#1e293b' : '#fff',
    border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
    borderRadius: '8px',
    marginBottom: '16px',
  },
  regionHeader: {
    background: theme === 'dark' ? '#0f172a' : '#f8fafc',
    padding: '16px',
    borderBottom: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
    borderRadius: '8px 8px 0 0',
  }
});

function ColisRamasse2() {
  const { theme } = useContext(ThemeContext);
  const tableCellStyles = getTableCellStyles(theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [openTicket, setOpenTicket] = useState(false);
  const [colis, setColis] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  // Add selection states for each group
  const [selectedRows, setSelectedRows] = useState({});
  const [selectAllGroups, setSelectAllGroups] = useState({});
  
  // Add livreur assignment states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLivreur, setSelectedLivreur] = useState(null);
  const [form] = Form.useForm();

  const { colisRamasseList, user, store, livreurList } = useSelector((state) => ({
    colisRamasseList: state.colis.colisRamasseList,
    user: state.auth.user,
    store: state.auth.store,
    livreurList: state.livreur.livreurList,
  }));

  const [openBatchTicket, setOpenBatchTicket] = useState(false);

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

  const handleTicket = (colis) => {
    console.log('handleTicket called with colis:', colis);
    setOpenTicket(true);
    setColis(colis);
  };

  // Handle individual row selection
  const handleRowSelection = (groupIndex, selectedRowKeys, selectedRows) => {
    setSelectedRows(prev => ({
      ...prev,
      [groupIndex]: selectedRowKeys
    }));
  };

  // Handle select all for a specific group
  const handleSelectAllGroup = (groupIndex, groupColis) => {
    const allKeys = groupColis.map(colis => colis.code_suivi);
    setSelectedRows(prev => ({
      ...prev,
      [groupIndex]: allKeys
    }));
    setSelectAllGroups(prev => ({
      ...prev,
      [groupIndex]: true
    }));
  };

  // Handle deselect all for a specific group
  const handleDeselectAllGroup = (groupIndex) => {
    setSelectedRows(prev => ({
      ...prev,
      [groupIndex]: []
    }));
    setSelectAllGroups(prev => ({
      ...prev,
      [groupIndex]: false
    }));
  };

  // Get all selected colis across all groups
  const getAllSelectedColis = () => {
    const allSelected = [];
    Object.values(selectedRows).forEach(selectedKeys => {
      allSelected.push(...selectedKeys);
    });
    return allSelected;
  };

  // Get selected colis count for a specific group
  const getSelectedCountForGroup = (groupIndex) => {
    return selectedRows[groupIndex]?.length || 0;
  };

  // Check if all items in a group are selected
  const isGroupFullySelected = (groupIndex, groupColis) => {
    const selectedCount = getSelectedCountForGroup(groupIndex);
    return selectedCount === groupColis.length && groupColis.length > 0;
  };

  // Fetch colis ramassée grouped by region
  const getDataColisRamasse = () => {
    if (user?.role) {
      dispatch(getColisRamasse());
    }
  };

  useEffect(() => {
    getDataColisRamasse();
    dispatch(getLivreurList());
    window.scrollTo(0, 0);
  }, [dispatch, user?.role, store?._id, user._id]);

  // Hide page for "livreur" role
  if (user?.role === 'livreur') {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // Show modal for livreur assignment
  const showModal = () => {
    const allSelected = getAllSelectedColis();
    if (allSelected.length > 0) {
      setSelectedLivreur(null);
      form.resetFields();
      setIsModalVisible(true);
    } else {
      toast.warn("Veuillez sélectionner au moins un colis !");
    }
  };

  // Handle livreur assignment
  const handleAffecterLivreur = async () => {
    const allSelected = getAllSelectedColis();
    if (allSelected.length > 0 && selectedLivreur) {
      if (selectedLivreur.nom === 'ameex') {
        // Get selected colis data for ameex
        const selectedColisData = [];
        colisRamasseList.groupedColis.forEach(group => {
          group.colis.forEach(colis => {
            if (allSelected.includes(colis.code_suivi)) {
              selectedColisData.push(colis);
            }
          });
        });
        
        dispatch(affectationColisAmeex(selectedColisData));
        setSelectedRows({});
        setSelectAllGroups({});
        setSelectedLivreur(null);
        setIsModalVisible(false);
      } else {
        setLoading(true);
        try {
          const response = await request.put('/api/colis/statu/affecter', {
            codesSuivi: allSelected,
            livreurId: selectedLivreur._id
          });
          setLoading(false);
          toast.success(response.data.message);
          setSelectedRows({});
          setSelectAllGroups({});
          setSelectedLivreur(null);
          setIsModalVisible(false);
          // Refresh data after assignment
          getDataColisRamasse();
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

  const selectLivreur = (livreur) => {
    setSelectedLivreur(livreur);
  };

  // Collect unique villes from selected colis
  const getAllSelectedColisData = () => {
    const selectedColisData = [];
    colisRamasseList.groupedColis.forEach(group => {
      group.colis.forEach(colis => {
        if (getAllSelectedColis().includes(colis.code_suivi)) {
          selectedColisData.push(colis);
        }
      });
    });
    return selectedColisData;
  };

  const selectedColisVilles = getAllSelectedColisData()
    .map(colis => colis.villeData?.nom)
    .filter(Boolean);

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

  const exportToExcel = () => {
    try {
      const allSelected = getAllSelectedColis();
      
      if (allSelected.length === 0) {
        toast.error("Veuillez sélectionner au moins un colis à exporter.");
        return;
      }

      // Get selected colis data grouped by region
      const selectedColisByRegion = {};
      
      colisRamasseList.groupedColis.forEach(group => {
        const regionName = group.region?.nom || 'Région non définie';
        const selectedColisInRegion = group.colis.filter(colis => 
          allSelected.includes(colis.code_suivi)
        );
        
        if (selectedColisInRegion.length > 0) {
          selectedColisByRegion[regionName] = selectedColisInRegion;
        }
      });

      // If only one region, export with region name in filename
      const regionNames = Object.keys(selectedColisByRegion);

      if (regionNames.length === 1) {
        const regionName = regionNames[0];
        const colisToExport = selectedColisByRegion[regionName];

        // Map data to standardized Excel format
        const dataToExport = colisToExport.map(colis => ({
          'Code Suivi': colis.code_suivi || '',
          'Prix (DH)': colis.prix || '',
          'Nom Destinataire': colis.nom || '',
          'Téléphone': colis.tele || '',
          'Adresse': colis.adresse || '',
          'Ville': colis.villeData?.nom || '',
          'Région': colis.regionData?.nom || '',
          'Date Création': colis.createdAt ? moment(colis.createdAt).format('DD/MM/YYYY HH:mm') : '',
          'Statut': colis.statut || '',
          'Commentaire': colis.commentaire || '',
          'Ouvrir': colis.ouvrir ? 'Oui' : 'Non',
          'Simple': colis.is_simple ? 'Oui' : 'Non',
          'Remplacé': colis.is_remplace ? 'Oui' : 'Non',
          'Fragile': colis.is_fragile ? 'Oui' : 'Non',
          'Nature Produit': colis.nature_produit || ''
        }));

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Colis Ramassée");

        // Generate filename with region and date
        const sanitizedRegionName = regionName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
        const fileName = `Colis_Ramassée_${sanitizedRegionName}_${moment().format('YYYYMMDD_HHmmss')}.xlsx`;

        // Generate and save file
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(dataBlob, fileName);

        toast.success(`Exporté vers Excel avec succès! (${colisToExport.length} colis de ${regionName})`);
      } else {
        // Multiple regions export - create separate files for each region
        regionNames.forEach(regionName => {
          const colisToExport = selectedColisByRegion[regionName];

          // Map data to standardized Excel format
          const dataToExport = colisToExport.map(colis => ({
            'Code Suivi': colis.code_suivi || '',
            'Prix (DH)': colis.prix || '',
            'Nom Destinataire': colis.nom || '',
            'Téléphone': colis.tele || '',
            'Adresse': colis.adresse || '',
            'Ville': colis.villeData?.nom || '',
            'Région': colis.regionData?.nom || '',
            'Date Création': colis.createdAt ? moment(colis.createdAt).format('DD/MM/YYYY HH:mm') : '',
            'Statut': colis.statut || '',
            'Commentaire': colis.commentaire || '',
            'Ouvrir': colis.ouvrir ? 'Oui' : 'Non',
            'Simple': colis.is_simple ? 'Oui' : 'Non',
            'Remplacé': colis.is_remplace ? 'Oui' : 'Non',
            'Fragile': colis.is_fragile ? 'Oui' : 'Non',
            'Nature Produit': colis.nature_produit || ''
          }));

          // Create worksheet
          const worksheet = XLSX.utils.json_to_sheet(dataToExport);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, "Colis Ramassée");

          // Generate filename with region and date
          const sanitizedRegionName = regionName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
          const fileName = `Colis_Ramassée_${sanitizedRegionName}_${moment().format('YYYYMMDD_HHmmss')}.xlsx`;

          // Generate and save file
          const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
          const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
          saveAs(dataBlob, fileName);
        });

        const totalColis = allSelected.length;
        toast.success(`Exporté vers Excel avec succès! (${totalColis} colis répartis sur ${regionNames.length} régions)`);
      }
    } catch (error) {
      console.error("Erreur lors de l'exportation vers Excel:", error);
      toast.error("Échec de l'exportation vers Excel.");
    }
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
          <Text
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
          </Text>
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
              <Text style={nameStyle}>
                {record.nom?.length > 18 ? record.nom.substring(0, 18) + '...' : record.nom}
              </Text>
            </div>
            <div>
              <Tag style={tableCellStyles.phoneTag}>
                <PhoneOutlined style={{ marginRight: '4px' }} />
                {record.tele}
              </Tag>
            </div>
            <div>
              <Text style={priceStyle}>
                {record.prix || 'N/A'} DH
              </Text>
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
          {record.villeData?.nom || 'N/A'}
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
          <Text style={{ fontSize: '13px', fontWeight: '500' }}>
            {record.storeData?.storeName?.length > 15
              ? record.storeData.storeName.substring(0, 15) + '...'
              : record.storeData?.storeName || 'N/A'
            }
          </Text>
        </div>
      ),
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
            <div className="page-content-header">
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                icon={<IoMdRefresh />}
                type="primary"
                onClick={getDataColisRamasse}
                loading={colisRamasseList.loading}
              >
                Refresh
              </Button>
              <Tooltip title="Exporter les colis sélectionnés vers Excel">
                <Button
                  icon={<FaDownload />}
                  type="default"
                  onClick={exportToExcel}
                  disabled={getAllSelectedColis().length === 0}
                >
                  Export Excel ({getAllSelectedColis().length})
                </Button>
              </Tooltip>
              <Tooltip title="Générer les tickets PDF pour la sélection">
                <Button
                  icon={<FaPrintIcon />}
                  type="default"
                  onClick={() => setOpenBatchTicket(true)}
                  disabled={getAllSelectedColis().length === 0}
                >
                  Tickets PDF ({getAllSelectedColis().length})
                </Button>
              </Tooltip>
              <Button 
                icon={<FaBoxes />} 
                type="primary" 
                onClick={() => showModal()} 
                loading={loading}
                disabled={getAllSelectedColis().length === 0}
              >
                Expédier ({getAllSelectedColis().length})
              </Button>
              <Button 
                icon={<IoQrCodeSharp />} 
                type="primary" 
                onClick={() => navigate("/dashboard/scan/statu/Expediée")} 
                loading={loading}
              >
                Scanner
              </Button>
            </div>
          </div>
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Total Colis"
                    value={colisRamasseList.total}
                    valueStyle={{ color: theme === 'dark' ? '#60a5fa' : '#3b82f6' }}
                    prefix={<FaBoxes />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Régions"
                    value={colisRamasseList.groupedColis.length}
                    valueStyle={{ color: theme === 'dark' ? '#14b8a6' : '#0f766e' }}
                    prefix={<EnvironmentOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Moyenne par Région"
                    value={colisRamasseList.groupedColis.length > 0 
                      ? Math.round(colisRamasseList.total / colisRamasseList.groupedColis.length) 
                      : 0}
                    valueStyle={{ color: theme === 'dark' ? '#f59e0b' : '#d97706' }}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Dernière MAJ"
                    value={moment().format('HH:mm')}
                    valueStyle={{ color: theme === 'dark' ? '#10b981' : '#059669' }}
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            {/* Search Input */}
            <div style={{ marginBottom: '16px' }}>
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

            {/* Grouped Colis by Region */}
            {colisRamasseList.loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <SyncOutlined spin style={{ fontSize: '24px', color: theme === 'dark' ? '#60a5fa' : '#3b82f6' }} />
                <div style={{ marginTop: '16px' }}>Chargement des colis...</div>
              </div>
            ) : colisRamasseList.error ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#ff4d4f' }}>
                <ExclamationCircleOutlined style={{ fontSize: '24px' }} />
                <div style={{ marginTop: '16px' }}>{colisRamasseList.error}</div>
              </div>
            ) : (
              <Collapse 
                defaultActiveKey={colisRamasseList.groupedColis.map((_, index) => index)}
                style={{ background: 'transparent' }}
              >
                {colisRamasseList.groupedColis.map((group, groupIndex) => {
                  // Filter colis based on search query
                  const filteredColis = group.colis.filter(colis => {
                    if (!searchQuery.trim()) return true;
                    const lowerCaseQuery = searchQuery.toLowerCase();
                    return (
                      colis.code_suivi.toLowerCase().includes(lowerCaseQuery) ||
                      colis.nom.toLowerCase().includes(lowerCaseQuery) ||
                      colis.tele.toLowerCase().includes(lowerCaseQuery) ||
                      (colis.villeData?.nom && colis.villeData.nom.toLowerCase().includes(lowerCaseQuery)) ||
                      (colis.storeData?.storeName && colis.storeData.storeName.toLowerCase().includes(lowerCaseQuery))
                    );
                  });

                  if (filteredColis.length === 0) return null;

                  const selectedCount = getSelectedCountForGroup(groupIndex);
                  const isFullySelected = isGroupFullySelected(groupIndex, filteredColis);

                  return (
                    <Panel
                      key={groupIndex}
                      header={
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <EnvironmentOutlined style={{ color: theme === 'dark' ? '#60a5fa' : '#3b82f6' }} />
                            <Text strong style={{ fontSize: '16px' }}>
                              {group.region?.nom || 'Région non définie'}
                            </Text>
                            <Tag color="blue" style={{ marginLeft: '8px' }}>
                              {filteredColis.length} colis
                            </Tag>
                            {selectedCount > 0 && (
                              <Tag color="green" style={{ marginLeft: '8px' }}>
                                {selectedCount} sélectionné(s)
                              </Tag>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Total: {group.count}
                            </Text>
                            {filteredColis.length > 0 && (
                              <Button
                                size="small"
                                type={isFullySelected ? "default" : "primary"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isFullySelected) {
                                    handleDeselectAllGroup(groupIndex);
                                  } else {
                                    handleSelectAllGroup(groupIndex, filteredColis);
                                  }
                                }}
                                style={{ marginLeft: '8px' }}
                              >
                                {isFullySelected ? 'Désélectionner tout' : 'Sélectionner tout'}
                              </Button>
                            )}
                          </div>
                        </div>
                      }
                      style={tableCellStyles.regionCard}
                    >
                      <TableDashboard
                        column={columns}
                        data={filteredColis}
                        id="code_suivi"
                        theme={theme}
                        rowSelection={{
                          selectedRowKeys: selectedRows[groupIndex] || [],
                          onChange: (selectedRowKeys, selectedRows) => handleRowSelection(groupIndex, selectedRowKeys, selectedRows),
                        }}
                        style={{
                          backgroundColor: 'transparent',
                          borderRadius: '8px',
                          overflow: 'hidden',
                        }}
                        pagination={{
                          pageSize: 10,
                          showSizeChanger: true,
                          showQuickJumper: true,
                          showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} colis`,
                          size: 'small',
                          position: ['bottomCenter'],
                        }}
                      />
                    </Panel>
                  );
                })}
              </Collapse>
            )}

            {/* Ticket Modal */}
            <Modal
              width={800}
              open={openTicket}
              onCancel={() => {
                setOpenTicket(false);
                setColis(null);
              }}
              onOk={() => {
                setOpenTicket(false);
                setColis(null);
              }}
              footer={null}
              title="Ticket Colis"
            >
              {colis ? (
                <TicketColis2 colis={colis} showDownloadButton={true} />
              ) : (
                <div>Chargement...</div>
              )}
            </Modal>

            {/* Livreur Assignment Modal */}
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

            {/* Batch Ticket Modal */}
            <Modal
              width={800}
              open={openBatchTicket}
              onCancel={() => setOpenBatchTicket(false)}
              footer={null}
              title="Tickets Colis (Sélection)"
            >
              <TicketColis2 colisList={getAllSelectedColisData()} />
            </Modal>

            {contextHolder}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ColisRamasse2; 