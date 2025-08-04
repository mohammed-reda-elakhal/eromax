import React, { useEffect, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getColisPaginated } from '../../../../redux/apiCalls/colisApiCalls';
import { getAllVilles } from '../../../../redux/apiCalls/villeApiCalls';
import { getStoreList } from '../../../../redux/apiCalls/storeApiCalls';
import { getLivreurList } from '../../../../redux/apiCalls/livreurApiCall';
// Removed all Ant Design imports
// import { Table, Card, Typography, Tag, Spin, Alert, Select, DatePicker, Row, Col, Button, Tooltip } from 'antd';
// import { ...icons } from '@ant-design/icons';
import {
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, SyncOutlined,
  ExclamationCircleOutlined, CalendarOutlined, EnvironmentOutlined, InfoCircleOutlined, TagOutlined, EditOutlined, ShopOutlined,
  FolderOpenOutlined, AppstoreOutlined, RetweetOutlined, CopyOutlined, WalletOutlined, MoreOutlined, UserOutlined, PlusOutlined,
  ArrowUpOutlined, ArrowDownOutlined, FieldTimeOutlined
} from '@ant-design/icons';
import { FaUser, FaMapMarkerAlt, FaHeart, FaInfoCircle, FaQuestionCircle, FaSms, FaPlane, FaPhoneSlash, FaTruck, FaClock, FaCheck } from 'react-icons/fa';
import { TbShieldCode, TbTruckDelivery } from 'react-icons/tb';
import { AiFillProduct } from 'react-icons/ai';
import { HiStatusOnline } from 'react-icons/hi';
import { BsCalendar2DateFill } from 'react-icons/bs';
import { RiUserLocationFill } from 'react-icons/ri';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import { ThemeContext } from '../../../ThemeContext';
import moment from 'moment';
import Select from 'react-select';
import { Typography, Tooltip, Tag, Divider } from 'antd';
import { Spin, Dropdown, Button, Menu, Popover, Modal, Timeline, Descriptions } from 'antd';
import AssignLivreurModal from '../modals/AssignLivreurModal';
import request from '../../../../utils/request';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import StatusModal from '../modals/StatusModal';
import { Form } from 'antd';
import { updateStatut } from '../../../../redux/apiCalls/colisApiCalls';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import TicketColis2 from '../components/TicketColis2';
// Add reclamation imports
import { createReclamation, getReclamationsByColis } from '../../../../redux/apiCalls/reclamationApiCalls';
import ReclamationModal from '../modals/ReclamationModal';
import { Statistic, Card, Row, Col, Progress } from 'antd';

const STATUT_LIST = [
  "Nouveau Colis",
  "attente de ramassage",
  "Ramassée",
  "Expediée",
  "Reçu",
  "Mise en Distribution",
  "Livrée",
  "Annulée",
  "Programmée",
  "Refusée",
  "En Retour",
  "Préparer pour Roteur",
  "Remplacée",
  "Fermée",
  "Boite vocale",
  "Pas de reponse jour 1",
  "Pas de reponse jour 2",
  "Pas de reponse jour 3",
  "Pas reponse + sms / + whatsap",
  "En voyage",
  "Injoignable",
  "Hors-zone",
  "Intéressé",
  "Numéro Incorrect",
  "Reporté",
  "Confirmé Par Livreur",
  "Endomagé",
  "Prét Pour Expédition",
  "Manque de stock",
  "Intéressé"
];

const STATUS_META = {
  "Nouveau Colis": { color: "blue", icon: <SyncOutlined /> },
  "attente de ramassage": { color: "cyan", icon: <ClockCircleOutlined /> },
  "Ramassée": { color: "geekblue", icon: <CheckCircleOutlined /> },
  "Expediée": { color: "purple", icon: <SyncOutlined /> },
  "Reçu": { color: "green", icon: <CheckCircleOutlined /> },
  "Mise en Distribution": { color: "gold", icon: <SyncOutlined /> },
  "Livrée": { color: "success", icon: <CheckCircleOutlined /> },
  "Annulée": { color: "red", icon: <CloseCircleOutlined /> },
  "Programmée": { color: "orange", icon: <CalendarOutlined /> },
  "Refusée": { color: "volcano", icon: <ExclamationCircleOutlined /> },
  "En Retour": { color: "magenta", icon: <SyncOutlined /> },
  "Préparer pour Roteur": { color: "lime", icon: <SyncOutlined /> },
  "Remplacée": { color: "purple", icon: <SyncOutlined /> },
  "Fermée": { color: "default", icon: <CloseCircleOutlined /> },
  "Boite vocale": { color: "default", icon: <InfoCircleOutlined /> },
  "Pas de reponse jour 1": { color: "default", icon: <InfoCircleOutlined /> },
  "Pas de reponse jour 2": { color: "default", icon: <InfoCircleOutlined /> },
  "Pas de reponse jour 3": { color: "default", icon: <InfoCircleOutlined /> },
  "Pas reponse + sms / + whatsap": { color: "default", icon: <InfoCircleOutlined /> },
  "En voyage": { color: "default", icon: <InfoCircleOutlined /> },
  "Injoignable": { color: "default", icon: <InfoCircleOutlined /> },
  "Hors-zone": { color: "default", icon: <InfoCircleOutlined /> },
  "Intéressé": { color: "default", icon: <InfoCircleOutlined /> },
  "Numéro Incorrect": { color: "default", icon: <ExclamationCircleOutlined /> },
  "Reporté": { color: "orange", icon: <CalendarOutlined /> },
  "Confirmé Par Livreur": { color: "success", icon: <CheckCircleOutlined /> },
  "Endomagé": { color: "volcano", icon: <ExclamationCircleOutlined /> },
  "Prét Pour Expédition": { color: "cyan", icon: <SyncOutlined /> },
  "Manque de stock": { color: "magenta", icon: <ExclamationCircleOutlined /> },
};

function ColisPaginated() {
  const dispatch = useDispatch();
  const { theme } = useContext(ThemeContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState({
    ville: '',
    store: '',
    livreur: '',
    statut: '',
    dateRange: ['', ''],
    code_suivi: '',
    tele: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    ville: '',
    store: '',
    livreur: '',
    statut: '',
    dateRange: ['', ''],
    code_suivi: '',
    tele: '',
  });
  const {user } = useSelector(state => ({
    user: state.auth.user
  }));
  const { colisPaginatedList } = useSelector(state => state.colis);
  const statistics = colisPaginatedList.statistics || {};
  const mainStatusOrder = [
    "Nouveau Colis",
    "attente de ramassage",
    "Ramassée",
    "Expediée",
    "Livrée",
    "Annulée",
    "Refusée",
    "Programmée",
    "En Retour",
    "Mise en Distribution"
  ];
  const villes = useSelector(state => state.ville.villes);
  const stores = useSelector(state => state.store.stores);
  const livreurs = useSelector(state => state.livreur.livreurList);
  const [suiviModalOpen, setSuiviModalOpen] = useState(false);
  const [selectedColis, setSelectedColis] = useState(null);
  // Add state for details modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsColis, setDetailsColis] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignSelectedColis, setAssignSelectedColis] = useState(null);
  const [assignSelectedLivreur, setAssignSelectedLivreur] = useState(null);
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // Status modal state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusType, setStatusType] = useState("");
  const [statusColis, setStatusColis] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketColisList, setTicketColisList] = useState([]);
  // Add reclamation state
  const [state, setState] = useState({
    reclamationModalVisible: false,
    selectedColis: null,
    initialMessage: '',
  });

  // Status comments
  const statusComments = {
    "Annulée": [
      "Client a annulé la commande / الزبون ألغى الطلب",
      "Le produit n'est plus disponible / المنتج لم يعد متوفراً",
      "Erreur dans la commande / خطأ في الطلب",
      "Adresse incorrecte / العنوان غير صحيح",
      "Numéro de téléphone injoignable / رقم الهاتف غير متاح",
      "Client a commandé par erreur / الزبون طلب بالخطأ",
      "Client a changé d'avis / الزبون غير رأيه",
      "Client a trouvé moins cher / الزبون وجد سعراً أقل",
      "Client ne répond pas / الزبون لا يرد",
      "Client a déjà reçu le produit / الزبون استلم المنتج مسبقاً"
    ],
    "Refusée": [
      "Le client a refusé la livraison / الزبون رفض الاستلام",
      "Le destinataire était absent / لم يكن المستلم موجوداً",
      "Le produit était endommagé / المنتج كان تالفاً",
      "Produit ne correspond pas à la commande / المنتج لا يطابق الطلب",
      "Client n'a plus besoin du produit / الزبون لم يعد بحاجة للمنتج",
      "Client n'a pas d'argent / الزبون ليس لديه مال",
      "Client a changé d'avis / الزبون غير رأيه",
      "Client a trouvé moins cher / الزبون وجد سعراً أقل",
      "Client a déjà reçu le produit / الزبون استلم المنتج مسبقاً",
      "Client n'a pas pu être contacté / لم يتمكن من التواصل مع الزبون"
    ],
  };

  // Status badge config
  const getStatusBadgeConfig = (theme) => ({
    "Nouveau Colis": {
      color: theme === 'dark' ? '#dc2626' : '#ef4444',
      icon: <FaHeart />,
      textColor: 'white'
    },
    "attente de ramassage": {
      color: theme === 'dark' ? '#ea580c' : '#f97316',
      icon: <TbTruckDelivery />,
      textColor: 'white'
    },
    "Ramassée": {
      color: theme === 'dark' ? '#1e40af' : '#3b82f6',
      icon: <TbTruckDelivery />,
      textColor: 'white'
    },
    "Mise en Distribution": {
      color: theme === 'dark' ? '#1e40af' : '#3b82f6',
      icon: <FaTruck />,
      textColor: 'white'
    },
    "Reçu": {
      color: theme === 'dark' ? '#0891b2' : '#06b6d4',
      icon: <CheckCircleOutlined />,
      textColor: 'white'
    },
    "Livrée": {
      color: theme === 'dark' ? '#059669' : '#10b981',
      icon: <CheckCircleOutlined />,
      textColor: 'white'
    },
    "Annulée": {
      color: theme === 'dark' ? '#dc2626' : '#ef4444',
      icon: <CloseCircleOutlined />,
      textColor: 'white'
    },
    "Programmée": {
      color: theme === 'dark' ? '#7c3aed' : '#8b5cf6',
      icon: <ClockCircleOutlined />,
      textColor: 'white'
    },
    "Refusée": {
      color: theme === 'dark' ? '#dc2626' : '#ef4444',
      icon: <CloseCircleOutlined />,
      textColor: 'white'
    },
    "Boite vocale": {
      color: theme === 'dark' ? '#7c3aed' : '#8b5cf6',
      icon: <FaInfoCircle />,
      textColor: 'white'
    },
    "Pas de reponse jour 1": {
      color: theme === 'dark' ? '#d97706' : '#f59e0b',
      icon: <FaQuestionCircle />,
      textColor: 'white'
    },
    "Pas de reponse jour 2": {
      color: theme === 'dark' ? '#d97706' : '#f59e0b',
      icon: <FaQuestionCircle />,
      textColor: 'white'
    },
    "Pas de reponse jour 3": {
      color: theme === 'dark' ? '#d97706' : '#f59e0b',
      icon: <FaQuestionCircle />,
      textColor: 'white'
    },
    "Pas reponse + sms / + whatsap": {
      color: theme === 'dark' ? '#d97706' : '#f59e0b',
      icon: <FaSms />,
      textColor: 'white'
    },
    "En voyage": {
      color: theme === 'dark' ? '#0891b2' : '#06b6d4',
      icon: <FaPlane />,
      textColor: 'white'
    },
    "Injoignable": {
      color: theme === 'dark' ? '#be185d' : '#ec4899',
      icon: <FaPhoneSlash />,
      textColor: 'white'
    },
    "Hors-zone": {
      color: theme === 'dark' ? '#dc2626' : '#ef4444',
      icon: <FaMapMarkerAlt />,
      textColor: 'white'
    },
    "Intéressé": {
      color: theme === 'dark' ? '#1e40af' : '#3b82f6',
      icon: <FaHeart />,
      textColor: 'white'
    },
    "Numéro Incorrect": {
      color: theme === 'dark' ? '#ea580c' : '#f97316',
      icon: <FaHeart />,
      textColor: 'white'
    },
    "Reporté": {
      color: theme === 'dark' ? '#7c3aed' : '#8b5cf6',
      icon: <FaClock />,
      textColor: 'white'
    },
    "Confirmé Par Livreur": {
      color: theme === 'dark' ? '#1e40af' : '#3b82f6',
      icon: <FaCheck />,
      textColor: 'white'
    },
    "Préparer pour Roteur": {
      color: theme === 'dark' ? '#059669' : '#10b981',
      icon: <FaCheck />,
      textColor: 'white'
    },
    "En Retou": {
      color: theme === 'dark' ? '#d97706' : '#f59e0b',
      icon: <FaCheck />,
      textColor: 'white'
    },
    "Endomagé": {
      color: theme === 'dark' ? '#dc2626' : '#ef4444',
      icon: <FaHeart />,
      textColor: 'white'
    },
    "Fermée": {
      color: theme === 'dark' ? '#dc2626' : '#ef4444',
      icon: <FaHeart />,
      textColor: 'white'
    },
  });

  // Allowed statuses
  const allowedStatuses = React.useMemo(() => {
    if (user?.role === 'admin') {
      return [
        "Nouveau Colis",
        "attente de ramassage",
        "Ramassée",
        "Mise en Distribution",
        "Reçu",
        "Livrée",
        "Annulée",
        "Programmée",
        "Refusée",
        "Boite vocale",
        "Pas de reponse jour 1",
        "Pas de reponse jour 2",
        "Pas de reponse jour 3",
        "Pas reponse + sms / + whatsap",
        "En voyage",
        "Injoignable",
        "Hors-zone",
        "Intéressé",
        "Numéro Incorrect",
        "Reporté",
        "Confirmé Par Livreur",
        "Endomagé",
        "Préparer pour Roteur",
        "En Retour",
        "Fermée",
        "Prét Pour Expédition",
        "Manque de stock",
        "Intéressé"
      ];
    } else if (user?.role === 'livreur') {
      return [
        "Mise en Distribution",
        "Reçu",
        "Livrée",
        "Annulée",
        "Programmée",
        "Refusée",
        "Boite vocale",
        "Pas de reponse jour 1",
        "Pas de reponse jour 2",
        "Pas de reponse jour 3",
        "Pas reponse + sms / + whatsap",
        "En voyage",
        "Injoignable",
        "Hors-zone",
        "Intéressé",
        "Numéro Incorrect",
        "Reporté",
        "Confirmé Par Livreur",
        "Endomagé",
        "Préparer pour Roteur",
        "Manque de stock",
        "Intéressé"
      ];
    } else {
      return [];
    }
  }, [user?.role]);

  useEffect(() => {
    dispatch(getAllVilles());
    dispatch(getStoreList());
    dispatch(getLivreurList());
  }, [dispatch]);

  useEffect(() => {
    const params = {
      page: currentPage,
      limit: pageSize,
      ville: appliedFilters.ville || undefined,
      store: appliedFilters.store || undefined,
      livreur: appliedFilters.livreur || undefined,
      statut: appliedFilters.statut || undefined,
      code_suivi: appliedFilters.code_suivi || undefined,
      tele: appliedFilters.tele || undefined,
    };
    if (appliedFilters.dateRange && appliedFilters.dateRange[0] && appliedFilters.dateRange[1]) {
      params.dateFrom = moment(appliedFilters.dateRange[0]).startOf('day').toISOString();
      params.dateTo = moment(appliedFilters.dateRange[1]).endOf('day').toISOString();
    }
    dispatch(getColisPaginated(params));
  }, [dispatch, currentPage, pageSize, appliedFilters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setAppliedFilters(filters);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleReset = () => {
    const emptyFilters = { ville: '', store: '', livreur: '', statut: '', dateRange: ['', ''], code_suivi: '', tele: '' };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setCurrentPage(1);
  };

  // Helper to get selected data
  const getSelectedData = () => {
    if (selectedRowIds.length === 0) return colisPaginatedList.data || [];
    return (colisPaginatedList.data || []).filter(row => selectedRowIds.includes(row._id));
  };

  // Navigate to ProfileUser page
  const handleViewProfile = (store) => {
    if (store?._id) {
      navigate(`/dashboard/profile-user/${store._id}`);
    } else {
      message.warning('Impossible de naviguer vers le profil: ID de boutique manquant');
    }
  };

  // Handle ticket generation
  const handleGenerateTickets = () => {
    const dataToUse = getSelectedData();
    if (dataToUse.length === 0) {
      toast.error("Aucun colis sélectionné pour générer les tickets!");
      return;
    }
    setTicketColisList(dataToUse);
    setTicketModalOpen(true);
  };

  // Handle reclamation creation
  const handleCreateReclamation = () => {
    const { initialMessage, selectedColis } = state;
    if (!initialMessage || !selectedColis) {
      toast.error("Veuillez remplir le message initial.");
      return;
    }
    if (!selectedColis._id) {
      toast.error("Impossible de créer une réclamation: ID du colis manquant.");
      console.error('Missing colis ID:', selectedColis);
      return;
    }
    const reclamationData = {
      colisId: selectedColis._id,
      initialMessage: initialMessage
    };
    const loadingToast = toast.loading("Création de la réclamation en cours...");
    dispatch(createReclamation(reclamationData))
      .then((response) => {
        toast.dismiss(loadingToast);
        if (response && response.reclamation) {
          toast.success("Réclamation créée avec succès!");
          setState(prev => ({ ...prev, reclamationModalVisible: false, initialMessage: '', selectedColis: null }));
        } else {
          toast.error("Erreur lors de la création de la réclamation.");
        }
      })
      .catch((error) => {
        toast.dismiss(loadingToast);
        console.error('Error creating reclamation:', error);
        toast.error(error?.response?.data?.message || "Erreur lors de la création de la réclamation.");
      });
  };

  // Function to open reclamation modal
  const openReclamationModal = (colis) => {
    const defaultMessage = `Je souhaite signaler un problème concernant le colis ${colis.code_suivi}.\n\nDétails du problème: ___`;
    setState(prev => ({ ...prev, selectedColis: colis, initialMessage: defaultMessage, reclamationModalVisible: true }));
  };

  // Export Excel function with Arabic support
  const handleExportExcel = () => {
    const exportData = getSelectedData();
    if (!exportData || exportData.length === 0) {
      toast.error("Aucune donnée à exporter!");
      return;
    }

    try {
      // Prepare headers
      const headers = [
        'Code Suivi',
        'Prix (DH)',
        'Nom Destinataire',
        'Téléphone',
        'Adresse',
        'Ville',
        'Région',
        'Date Création',
        'Statut',
        'Commentaire'
      ];

      // Prepare data rows
      const dataRows = exportData.map(colis => [
        colis.code_suivi || '',
        colis.prix || '',
        colis.nom || '',
        colis.tele || '',
        colis.adresse || '',
        colis.ville?.nom || '',
        colis.ville?.region?.nom || '',
        colis.createdAt ? moment(colis.createdAt).format('DD/MM/YYYY HH:mm') : '',
        colis.statut || '',
        colis.commentaire || ''
      ]);

      // Create CSV content with proper escaping for Arabic text
      const csvContent = [
        headers.join(','),
        ...dataRows.map(row =>
          row.map(cell => {
            // Properly escape cells containing Arabic text, commas, quotes, or newlines
            const cellStr = String(cell || '');
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n') || cellStr.includes('\r') || /[\u0600-\u06FF]/.test(cellStr)) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          }).join(',')
        )
      ].join('\r\n');

      // Add BOM (Byte Order Mark) for proper UTF-8 encoding in Excel
      const BOM = '\uFEFF';
      const csvWithBOM = BOM + csvContent;

      // Create and download file with proper encoding
      const blob = new Blob([csvWithBOM], {
        type: 'text/csv;charset=utf-8;'
      });

      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `colis_export_${moment().format('YYYY-MM-DD_HH-mm')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Export réussi! ${exportData.length} colis exportés avec support Arabic.`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Erreur lors de l'export des données.");
    }
  };

  // Helper for status color
  const getStatusStyle = (statut) => {
    switch (statut) {
      case 'Livrée': return { background: '#d1fae5', color: '#065f46' };
      case 'Annulée': return { background: '#fee2e2', color: '#991b1b' };
      case 'Programmée': return { background: '#fef3c7', color: '#92400e' };
      case 'Reporté': return { background: '#fef3c7', color: '#92400e' };
      case 'Ramassée': return { background: '#e0e7ff', color: '#3730a3' };
      default: return { background: '#f3f4f6', color: '#374151' };
    }
  };

  // Responsive styles remain
  const responsiveStyles = `
.colis-paginated-responsive .filter-bar-container {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px;
}
.colis-paginated-responsive .filter-bar-date-row {
  flex-direction: row;
  gap: 6px;
}
@media (max-width: 768px) {
  .colis-paginated-responsive .filter-bar-container {
    flex-direction: column !important;
    gap: 4px !important;
    padding: 4px !important;
  }
  .colis-paginated-responsive .filter-bar-date-row {
    flex-direction: column !important;
    gap: 4px !important;
  }
  .colis-paginated-responsive .filter-bar-select {
    font-size: 12px !important;
    min-height: 24px !important;
    padding: 2px 4px !important;
  }
  .colis-paginated-responsive table {
    font-size: 12px !important;
  }
  .colis-paginated-responsive th {
    font-size: 13px !important;
    padding: 6px 4px !important;
    min-width: 120px !important;
  }
  .colis-paginated-responsive td {
    font-size: 12px !important;
    padding: 6px 4px !important;
    min-width: 120px !important;
  }
  .colis-paginated-responsive .table-content {
    overflow-x: auto !important;
  }
}
`;

  // Table columns as array of objects for rendering
  const baseColumns = [
    { key: 'code_suivi', label: <><TbShieldCode /> Code</>, render: (record) => (
      <div style={{ minHeight: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'monospace', color: theme === 'dark' ? '#60a5fa' : '#3b82f6', fontSize: 14, whiteSpace: 'nowrap', textAlign: 'center', display: 'block', fontWeight: 'bold' }}>
          <Typography.Text
            copyable={{ text: record.code_suivi }}
            style={{ color: theme === 'dark' ? '#60a5fa' : '#3b82f6', background: 'none', fontSize: 14, fontFamily: 'monospace', fontWeight: 'bold', marginRight: 4 }}
          >
            {record.code_suivi}
          </Typography.Text>
        </span>
        {record.expedation_type === 'ameex' && record.code_suivi_ameex && (
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>AMEEX: {record.code_suivi_ameex}</span>
        )}
        {/* Attribute icons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 6, justifyContent: 'center' }}>
          <Tooltip title="Ouvrir">
            <FolderOpenOutlined style={{ fontSize: 16, color: record.ouvrir ? (theme === 'dark' ? '#22d3ee' : '#0ea5e9') : '#cbd5e1' }} />
          </Tooltip>
          <Tooltip title="Simple">
            <AppstoreOutlined style={{ fontSize: 16, color: record.is_simple ? (theme === 'dark' ? '#34d399' : '#10b981') : '#cbd5e1' }} />
          </Tooltip>
          <Tooltip title="Remplacé">
            <RetweetOutlined style={{ fontSize: 16, color: record.is_remplace ? (theme === 'dark' ? '#f59e42' : '#f59e42') : '#cbd5e1' }} />
          </Tooltip>
          <Tooltip title="Fragile">
            <ExclamationCircleOutlined style={{ fontSize: 16, color: record.is_fragile ? (theme === 'dark' ? '#f87171' : '#ef4444') : '#cbd5e1' }} />
          </Tooltip>
          <Tooltip title="Wallet Processed">
            <WalletOutlined style={{ fontSize: 16, color: record.wallet_prosseced ? (theme === 'dark' ? '#facc15' : '#eab308') : '#cbd5e1' }} />
          </Tooltip>
        </div>
      </div>
    ) },
    { key: 'destinataire', label: <><FaUser /> Destinataire</>, render: (record) => {
      const phoneRegex = /^0[67]\d{8}$/;
      const isValidPhoneNumber = phoneRegex.test(record.tele);
      return (
        <div style={{ minHeight: 60, display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center' }}>
          <span style={{ color: theme === 'dark' ? '#94a3b8' : '#475569', fontSize: 13, fontWeight: 600 }}>{record.nom?.length > 18 ? record.nom.substring(0, 18) + '...' : record.nom}</span>
          <span style={{ color: isValidPhoneNumber ? (theme === 'dark' ? '#60a5fa' : '#64748b') : (theme === 'dark' ? '#fca5a5' : '#dc2626'), fontSize: 12, fontWeight: 500 }}>{record.tele}</span>
          <span style={{ color: theme === 'dark' ? '#60a5fa' : '#3b82f6', fontSize: 16, fontWeight: 700 }}>{record.prix || 'N/A'} DH</span>
        </div>
      );
    } },
    { key: 'nature_produit', label: <><AiFillProduct /> Produit</>, render: (record) => {
      const text = record.nature_produit;
      if (!text) {
        return <span style={{ background: theme === 'dark' ? '#374151' : '#9ca3af', color: 'white', borderRadius: 4, fontSize: 12, fontWeight: 500, padding: '2px 8px' }}>N/A</span>;
      }
      const words = text.split(' ');
      const shortText = words.slice(0, 2).join(' ');
      const displayText = shortText.length > 20 ? shortText.substring(0, 20) + '...' : shortText;
      const hasMore = text.length > displayText.length;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {hasMore ? (
            <Tooltip title={text} placement="top">
              <span style={{ background: theme === 'dark' ? '#0f766e' : '#14b8a6', color: 'white', borderRadius: 4, fontSize: 12, fontWeight: 500, padding: '2px 8px', cursor: 'pointer' }}>{displayText}</span>
            </Tooltip>
          ) : (
            <span style={{ background: theme === 'dark' ? '#0f766e' : '#14b8a6', color: 'white', borderRadius: 4, fontSize: 12, fontWeight: 500, padding: '2px 8px' }}>{displayText}</span>
          )}
        </div>
      );
    } },
    { key: 'adresse', label: <><FaMapMarkerAlt /> Adresse</>, render: (record) => (
      <div style={{ minHeight: 60, display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: theme === 'dark' ? '#60a5fa' : '#3b82f6' }}>
          <span>📍 Ville: {record?.ville?.nom}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: theme === 'dark' ? '#22d3ee' : '#059669' }}>
          <span>🏠 {record.adresse}</span>
        </div>
      </div>
    ) },
    // Add Commentaire column
    { key: 'commentaire', label: '📝 Commentaire', render: (record) => (
      <span style={{ fontStyle: 'italic', color: record.commentaire ? (theme === 'dark' ? '#fbbf24' : '#92400e') : '#64748b', fontSize: 13 }}>
        {record.commentaire ? record.commentaire : <span style={{ color: '#bdbdbd' }}>—</span>}
      </span>
    ) },
  ];
  const adminColumns = user?.role === 'admin' ? [
    { key: 'store', label: <>🏬 Store</>, render: (record) => (
      <Tooltip title="Cliquer pour voir le profil détaillé">
        <span
          onClick={() => handleViewProfile(record.store)}
          style={{
            color: record.store?._id ? '#1890ff' : 'inherit',
            cursor: record.store?._id ? 'pointer' : 'default',
            textDecoration: record.store?._id ? 'underline' : 'none',
            transition: 'all 0.3s ease',
            padding: '2px 4px',
            borderRadius: '4px'
          }}
          onMouseEnter={(e) => {
            if (record.store?._id) {
              e.target.style.backgroundColor = theme === 'dark' ? '#1f1f1f' : '#f0f8ff';
              e.target.style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e) => {
            if (record.store?._id) {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.transform = 'scale(1)';
            }
          }}
        >
          {record.store?.storeName || 'N/A'}
        </span>
      </Tooltip>
    ) },
    { key: 'livreur', label: <>🧑‍💼 Livreur</>, render: (record) => (
      <span>{record.livreur?.username || record.livreur?.nom || 'N/A'}</span>
    ) },
  ] : [];
  const statusAndDateColumns = [
    { key: 'statut', label: <><HiStatusOnline /> Statut</>, render: (record) => {
      const statusBadgeConfig = getStatusBadgeConfig(theme);
      const config = statusBadgeConfig[record.statut] || { color: '#64748b', icon: null, textColor: 'white' };

      // Status verification for date display
      const isProgrammée = record.statut === 'Programmée';
      const isReporté = record.statut === 'Reporté';
      const shouldShowDateLivraisant = record.statut === 'Livrée';

      // Retrieve the corresponding date from the record
      const dateToDisplay = isProgrammée
        ? record.date_programme
        : isReporté
        ? record.date_reporte
        : shouldShowDateLivraisant
        ? record.date_livraisant
        : null;

      let extraDate = null;
      if (dateToDisplay) {
        const dateColor = shouldShowDateLivraisant ? '#52c41a' : '#faad14';
        extraDate = (
          <div style={{ fontSize: 11, color: dateColor, marginTop: 2 }}>
            <span>📅 {moment(dateToDisplay).format('DD/MM/YYYY HH:mm')}</span>
          </div>
        );
      }
      // Add comment for Annulée and Refusée
      let extraComment = null;
      if (record.statut === 'Annulée' && record.comment_annule) {
        extraComment = (
          <div style={{ fontSize: 11, color: '#6b7280', fontStyle: 'italic', marginTop: 2 }}>
            <span>📝 {record.comment_annule}</span>
          </div>
        );
      }
      if (record.statut === 'Refusée' && record.comment_refuse) {
        extraComment = (
          <div style={{ fontSize: 11, color: '#6b7280', fontStyle: 'italic', marginTop: 2 }}>
            <span>📝 {record.comment_refuse}</span>
          </div>
        );
      }
      // Make badge clickable for admin/livreur
      const isClickable = user?.role === 'admin' || user?.role === 'livreur';
      const badge = (
        <span style={{
          background: config.color,
          color: config.textColor,
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: 5,
          fontSize: 11,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          cursor: isClickable ? 'pointer' : 'default',
        }}
        onClick={() => {
          if (isClickable) {
            setStatusColis(record);
            setStatusType("");
            setStatusModalOpen(true);
          }
        }}
        >
          {config.icon}
          {record.statut}
        </span>
      );
      return (
        <div>
          {badge}
          {extraDate}
          {extraComment}
        </div>
      );
    } },
    { key: 'dates', label: <><BsCalendar2DateFill /> Dates</>, render: (record) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: theme === 'dark' ? '#60a5fa' : '#3b82f6' }}>
          <span>🗓️ Créé: {moment(record.createdAt).format('DD/MM/YYYY HH:mm')}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: theme === 'dark' ? '#22d3ee' : '#059669' }}>
          <span>✏️ Maj: {moment(record.updatedAt).format('DD/MM/YYYY HH:mm')}</span>
        </div>
      </div>
    ) },
  ];
  const columns = [...baseColumns, ...adminColumns, ...statusAndDateColumns,
    {
      key: 'options',
      label: 'Options',
      render: (record) => {
        // Determine button visibility
        const isAdmin = user?.role === 'admin';
        const isClient = user?.role === 'client';
        const isLivreur = user?.role === 'livreur';
        const statut = record.statut;
        const forbidden = ["Livrée", "Annulée", "Refusée"];
        const canUpdateDelete = (
          isAdmin || // Admin can always update/delete regardless of status
          (isClient && statut === "Nouveau Colis" && !forbidden.includes(statut))
        );
        const menu = (
          <Menu>
            <Menu.Item key="track" onClick={() => { setSelectedColis(record); setSuiviModalOpen(true); }}>
              <Button type="link" icon={<SyncOutlined />} style={{ padding: 0 }}>Suivi</Button>
            </Menu.Item>
            <Menu.Item key="details" onClick={() => { setDetailsColis(record); setDetailsModalOpen(true); }}>
              <Button type="link" icon={<InfoCircleOutlined />} style={{ padding: 0 }}>Détails</Button>
            </Menu.Item>
            {user?.role === 'admin' && (
              <Menu.Item key="affecter" onClick={() => { setAssignSelectedColis(record); setAssignModalOpen(true); }}>
                <Button type="link" icon={<UserOutlined />} style={{ padding: 0 }}>Affecter Livreur</Button>
              </Menu.Item>
            )}
            {user?.role === 'client' && (
              <Menu.Item key="reclamation" onClick={() => {
                dispatch(getReclamationsByColis(record._id))
                  .then((reclamations) => {
                    if (reclamations && reclamations.length > 0) {
                      const openReclamation = reclamations.find(r => r.closed === false);
                      if (openReclamation) {
                        toast.error(
                          <div>
                            Une réclamation est déjà ouverte pour ce colis.
                            <div style={{ marginTop: '10px' }}>
                              <button
                                onClick={() => navigate(`/dashboard/reclamation`, {
                                  state: { viewReclamation: openReclamation._id }
                                })}
                                style={{
                                  padding: '5px 10px',
                                  backgroundColor: '#1890ff',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                Voir la réclamation existante
                              </button>
                            </div>
                          </div>,
                          { autoClose: 8000 }
                        );
                        return;
                      }
                    }
                    setTimeout(() => openReclamationModal(record), 0);
                  })
                  .catch((error) => {
                    console.error('Error checking existing reclamations:', error);
                    toast.error("Erreur lors de la vérification des réclamations existantes.");
                  });
              }}>
                <Button type="link" icon={<ExclamationCircleOutlined />} style={{ padding: 0 }}>Réclamation</Button>
              </Menu.Item>
            )}
            {canUpdateDelete && (
              <Menu.Item key="update" onClick={() => navigate(`/dashboard/colis/update/${record.code_suivi}`)}>
                <Button type="link" icon={<EditOutlined />} style={{ padding: 0 }}>Update</Button>
              </Menu.Item>
            )}
            <Menu.Divider />
            {canUpdateDelete && (
              <Menu.Item key="delete">
                <Button type="link" danger icon={<ExclamationCircleOutlined />} style={{ padding: 0 }}
                  onClick={e => {
                    e.domEvent?.stopPropagation?.();
                    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le colis ${record.code_suivi} ?`)) {
                      handleDeleteColis(record);
                    }
                  }}
                >Delete</Button>
              </Menu.Item>
            )}
          </Menu>
        );
        return (
          <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
            <Button icon={<MoreOutlined />} size="small" style={{ border: 'none', boxShadow: 'none' }} />
          </Dropdown>
        );
      }
    }
  ];

  // Pagination logic
  const totalPages = Math.ceil((colisPaginatedList.total || 0) / (colisPaginatedList.limit || 20));

  // Filter livreurs for modal (preferred: covers all villes of colis, other: rest)
  const filteredLivreurs = React.useMemo(() => {
    if (!assignSelectedColis || !livreurs) return { preferred: [], other: [] };
    const colisVille = assignSelectedColis.ville?.nom;
    if (!colisVille) return { preferred: [], other: livreurs };
    const preferred = livreurs.filter(l => l.villes && l.villes.includes(colisVille));
    const other = livreurs.filter(l => !l.villes || !l.villes.includes(colisVille));
    return { preferred, other };
  }, [assignSelectedColis, livreurs]);

  // Add delete handler
  const handleDeleteColis = async (record) => {
    try {
      await request.delete(`/api/colis/${record._id}`);
      toast.success(`Colis avec le code ${record.code_suivi} a été supprimé avec succès.`);
      dispatch(getColisPaginated({
        page: currentPage,
        limit: pageSize,
        ville: appliedFilters.ville || undefined,
        store: appliedFilters.store || undefined,
        livreur: appliedFilters.livreur || undefined,
        statut: appliedFilters.statut || undefined,
        ...(appliedFilters.dateRange && appliedFilters.dateRange[0] && appliedFilters.dateRange[1] ? {
          dateFrom: moment(appliedFilters.dateRange[0]).startOf('day').toISOString(),
          dateTo: moment(appliedFilters.dateRange[1]).endOf('day').toISOString(),
        } : {})
      }));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erreur lors de la suppression du colis.");
    }
  };

  return (
    <div className='page-dashboard colis-paginated-responsive'>
      <style>{responsiveStyles}</style>
      <Menubar />
      <main className="page-main">
        <Topbar />
        <div className="page-content" style={{ backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray1)', color: theme === 'dark' ? '#fff' : '#002242' }}>
          <div className="content" style={{ backgroundColor: theme === 'dark' ? '#001529' : '#fff', width: '100%', overflowX: 'auto' }}>
            {/* Responsive Statistics Bars */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 12,
              marginTop: 8,
              justifyContent: 'center',
              alignItems: 'flex-start',
            }}>
              {/* Status Bar */}
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 8,
                flexWrap: 'wrap',
                minWidth: 0,
                flex: 2,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Card size="small" bordered style={{ background: 'linear-gradient(90deg, #f3f4f6 60%, #e0e7ff 100%)', borderRadius: 8, textAlign: 'center', minWidth: 80, maxWidth: 120, boxShadow: '0 1px 4px rgba(99,102,241,0.06)', margin: 0, padding: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <InfoCircleOutlined style={{ fontSize: 18, color: '#2563eb', marginBottom: 1 }} />
                    <Statistic title={<span style={{ fontSize: 11, color: '#2563eb', fontWeight: 700 }}>Total</span>} value={statistics?.total || 0} valueStyle={{ color: '#1e293b', fontWeight: 700, fontSize: 15 }} />
                  </div>
                </Card>
                <Card size="small" bordered style={{ background: 'linear-gradient(90deg, #e0f7fa 60%, #d1fae5 100%)', borderRadius: 8, textAlign: 'center', minWidth: 80, maxWidth: 120, boxShadow: '0 1px 4px rgba(16,185,129,0.06)', margin: 0, padding: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <CheckCircleOutlined style={{ fontSize: 18, color: '#059669', marginBottom: 1 }} />
                    <Statistic title={<span style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>Livrée</span>} value={statistics?.delivered || 0} valueStyle={{ color: '#059669', fontWeight: 700, fontSize: 15 }} />
                  </div>
                </Card>
                <Card size="small" bordered style={{ background: 'linear-gradient(90deg, #fff7e6 60%, #fef2f2 100%)', borderRadius: 8, textAlign: 'center', minWidth: 80, maxWidth: 120, boxShadow: '0 1px 4px rgba(245,158,11,0.06)', margin: 0, padding: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <CloseCircleOutlined style={{ fontSize: 18, color: '#f59e42', marginBottom: 1 }} />
                    <Statistic title={<span style={{ fontSize: 11, color: '#f59e42', fontWeight: 700 }}>Refusée</span>} value={statistics?.refused || 0} valueStyle={{ color: '#f59e42', fontWeight: 700, fontSize: 15 }} />
                  </div>
                </Card>
                <Card size="small" bordered style={{ background: 'linear-gradient(90deg, #fef2f2 60%, #fee2e2 100%)', borderRadius: 8, textAlign: 'center', minWidth: 80, maxWidth: 120, boxShadow: '0 1px 4px rgba(239,68,68,0.06)', margin: 0, padding: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <CloseCircleOutlined style={{ fontSize: 18, color: '#dc2626', marginBottom: 1 }} />
                    <Statistic title={<span style={{ fontSize: 11, color: '#dc2626', fontWeight: 700 }}>Annulée</span>} value={statistics?.annulled || 0} valueStyle={{ color: '#dc2626', fontWeight: 700, fontSize: 15 }} />
                  </div>
                </Card>
                <Card size="small" bordered style={{ background: 'linear-gradient(90deg, #f0fdf4 60%, #f3f4f6 100%)', borderRadius: 8, textAlign: 'center', minWidth: 80, maxWidth: 120, boxShadow: '0 1px 4px rgba(16,185,129,0.06)', margin: 0, padding: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <SyncOutlined style={{ fontSize: 18, color: '#f59e42', marginBottom: 1 }} />
                    <Statistic title={<span style={{ fontSize: 11, color: '#f59e42', fontWeight: 700 }}>En cours</span>} value={statistics?.inProgress || 0} valueStyle={{ color: '#f59e42', fontWeight: 700, fontSize: 15 }} />
                  </div>
                </Card>
              </div>
              {/* Time Bar */}
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 8,
                flexWrap: 'wrap',
                minWidth: 0,
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Card size="small" bordered style={{ background: 'linear-gradient(90deg, #e0e7ff 60%, #f3f4f6 100%)', borderRadius: 8, textAlign: 'center', minWidth: 80, maxWidth: 120, boxShadow: '0 1px 4px rgba(99,102,241,0.06)', margin: 0, padding: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <CalendarOutlined style={{ fontSize: 18, color: '#6366f1', marginBottom: 1 }} />
                    <Statistic title={<span style={{ fontSize: 11, color: '#6366f1', fontWeight: 700 }}>Aujourd'hui</span>} value={statistics?.createdToday || 0} valueStyle={{ color: '#1e293b', fontWeight: 700, fontSize: 15 }} />
                  </div>
                </Card>
                <Card size="small" bordered style={{ background: 'linear-gradient(90deg, #d1fae5 60%, #f3f4f6 100%)', borderRadius: 8, textAlign: 'center', minWidth: 80, maxWidth: 120, boxShadow: '0 1px 4px rgba(16,185,129,0.06)', margin: 0, padding: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <FieldTimeOutlined style={{ fontSize: 18, color: '#059669', marginBottom: 1 }} />
                    <Statistic title={<span style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>Cette semaine</span>} value={statistics?.createdThisWeek || 0} valueStyle={{ color: '#1e293b', fontWeight: 700, fontSize: 15 }} />
                  </div>
                </Card>
              </div>
            </div>
            <style>{`
@media (max-width: 768px) {
  .page-dashboard .content > div[style*='flex-direction: row'] {
    flex-direction: column !important;
    gap: 8px !important;
    align-items: stretch !important;
  }
  .page-dashboard .content .ant-card {
    min-width: 90px !important;
    max-width: 100% !important;
    margin-bottom: 4px !important;
  }
  .page-dashboard .content .ant-statistic-title {
    font-size: 10px !important;
  }
  .page-dashboard .content .ant-statistic-content-value {
    font-size: 13px !important;
  }
}
`}</style>
            {/* Filter Bar */}
            <div
              className="filter-bar-container"
              style={{
                marginBottom: 12,
                background: theme === 'dark' ? '#0a192f' : '#fff',
                borderRadius: 8,
                padding: 10,
                boxShadow: theme === 'dark'
                  ? '0 2px 8px rgba(0,0,0,0.45)'
                  : '0 2px 8px rgba(0,0,0,0.08)',
                border: `1px solid ${theme === 'dark' ? '#22304a' : '#e5e7eb'}`,
              }}
            >
              <style>{`
                .filter-bar-grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                  gap: 10px;
                  align-items: center;
                  width: 100%;
                }
                .filter-bar-field {
                  min-width: 0;
                  width: 100%;
                  display: flex;
                  align-items: center;
                  max-width: 250px;
                }
                .filter-bar-select, .filter-bar-input {
                  width: 100%;
                  min-width: 0;
                  max-width: 250px;
                  min-height: 36px;
                  font-size: 15px;
                  border-radius: 5px;
                  padding: 6px 10px;
                  box-sizing: border-box;
                  border: 1px solid #d1d5db;
                  background: ${theme === 'dark' ? '#0a192f' : '#fff'};
                  color: ${theme === 'dark' ? '#fff' : '#222'};
                  transition: border 0.2s;
                }
                .filter-bar-input:focus {
                  border: 1.5px solid #3b82f6;
                  outline: none;
                }
                .filter-bar-btn {
                  min-width: 0;
                  width: 100%;
                  max-width: 250px;
                  min-height: 36px;
                  font-size: 15px;
                  font-weight: 600;
                  border-radius: 5px;
                  border: none;
                  cursor: pointer;
                  transition: background 0.2s, color 0.2s;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 6px;
                }
                .filter-bar-btn.search {
                  background: #10b981;
                  color: #fff;
                }
                .filter-bar-btn.search:hover {
                  background: #059669;
                }
                .filter-bar-btn.reset {
                  background: #ef4444;
                  color: #fff;
                }
                .filter-bar-btn.reset:hover {
                  background: #dc2626;
                }
                @media (max-width: 1200px) {
                  .filter-bar-grid {
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                  }
                  .filter-bar-field, .filter-bar-select, .filter-bar-input, .filter-bar-btn {
                    max-width: 100%;
                  }
                }
                @media (max-width: 700px) {
                  .filter-bar-grid {
                    grid-template-columns: 1fr;
                  }
                  .filter-bar-field, .filter-bar-select, .filter-bar-input, .filter-bar-btn {
                    max-width: 100%;
                  }
                }
              `}</style>
              <div className="filter-bar-grid">
                {/* Ville */}
                <div className="filter-bar-field">
                  <Select
                    classNamePrefix="filter-bar-select"
                    value={villes && villes.find(v => v._id === filters.ville) ? { value: filters.ville, label: villes.find(v => v._id === filters.ville).nom } : null}
                    onChange={option => handleFilterChange('ville', option ? option.value : '')}
                    options={villes ? villes.map(ville => ({ value: ville._id, label: ville.nom })) : []}
                    placeholder="Ville"
                    isClearable
                    styles={{
                      container: (base) => ({ ...base, width: '100%', maxWidth: 250 }),
                      control: (base) => ({
                        ...base,
                        minHeight: 36,
                        fontSize: 15,
                        borderRadius: 5,
                        borderColor: theme === 'dark' ? '#555' : '#d1d5db',
                        background: theme === 'dark' ? '#0a192f' : '#fff',
                        color: theme === 'dark' ? '#fff' : '#222',
                        boxShadow: 'none',
                        cursor: 'pointer',
                        width: '100%',
                        maxWidth: 250,
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: theme === 'dark' ? '#e5e7eb' : '#222',
                        background: 'transparent',
                      }),
                      multiValue: (base) => ({
                        ...base,
                        background: theme === 'dark' ? '#1e293b' : '#e5e7eb',
                        color: theme === 'dark' ? '#e5e7eb' : '#222',
                      }),
                      menu: base => ({ ...base, fontSize: 15, zIndex: 10 }),
                      option: (base, state) => ({
                        ...base,
                        background: state.isSelected ? (theme === 'dark' ? '#003366' : '#e0e7ff') : state.isFocused ? (theme === 'dark' ? '#22304a' : '#f3f4f6') : undefined,
                        color: theme === 'dark' ? '#fff' : '#222',
                        cursor: 'pointer',
                      }),
                    }}
                  />
                </div>
                {/* Store */}
                <div className="filter-bar-field">
                  <Select
                    classNamePrefix="filter-bar-select"
                    value={stores && stores.find(s => s._id === filters.store) ? { value: filters.store, label: stores.find(s => s._id === filters.store).storeName } : null}
                    onChange={option => handleFilterChange('store', option ? option.value : '')}
                    options={stores ? stores.map(store => ({ value: store._id, label: store.storeName })) : []}
                    placeholder="Store"
                    isClearable
                    styles={{
                      container: (base) => ({ ...base, width: '100%', maxWidth: 250 }),
                      control: (base) => ({
                        ...base,
                        minHeight: 36,
                        fontSize: 15,
                        borderRadius: 5,
                        borderColor: theme === 'dark' ? '#555' : '#d1d9db',
                        background: theme === 'dark' ? '#0a192f' : '#fff',
                        color: theme === 'dark' ? '#fff' : '#222',
                        boxShadow: 'none',
                        cursor: 'pointer',
                        width: '100%',
                        maxWidth: 250,
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: theme === 'dark' ? '#e5e7eb' : '#222',
                        background: 'transparent',
                      }),
                      multiValue: (base) => ({
                        ...base,
                        background: theme === 'dark' ? '#1e293b' : '#e5e7eb',
                        color: theme === 'dark' ? '#e5e7eb' : '#222',
                      }),
                      menu: base => ({ ...base, fontSize: 15, zIndex: 10 }),
                      option: (base, state) => ({
                        ...base,
                        background: state.isSelected ? (theme === 'dark' ? '#003366' : '#e0e7ff') : state.isFocused ? (theme === 'dark' ? '#22304a' : '#f3f4f6') : undefined,
                        color: theme === 'dark' ? '#fff' : '#222',
                        cursor: 'pointer',
                      }),
                    }}
                  />
                </div>
                {/* Livreur */}
                <div className="filter-bar-field">
                  <Select
                    classNamePrefix="filter-bar-select"
                    value={livreurs && livreurs.find(l => l._id === filters.livreur) ? { value: filters.livreur, label: livreurs.find(l => l._id === filters.livreur).username || livreurs.find(l => l._id === filters.livreur).nom } : null}
                    onChange={option => handleFilterChange('livreur', option ? option.value : '')}
                    options={livreurs ? livreurs.map(livreur => ({ value: livreur._id, label: livreur.username || livreur.nom })) : []}
                    placeholder="Livreur"
                    isClearable
                    styles={{
                      container: (base) => ({ ...base, width: '100%', maxWidth: 250 }),
                      control: (base) => ({
                        ...base,
                        minHeight: 36,
                        fontSize: 15,
                        borderRadius: 5,
                        borderColor: theme === 'dark' ? '#555' : '#d1d5db',
                        background: theme === 'dark' ? '#0a192f' : '#fff',
                        color: theme === 'dark' ? '#fff' : '#222',
                        boxShadow: 'none',
                        cursor: 'pointer',
                        width: '100%',
                        maxWidth: 250,
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: theme === 'dark' ? '#e5e7eb' : '#222',
                        background: 'transparent',
                      }),
                      multiValue: (base) => ({
                        ...base,
                        background: theme === 'dark' ? '#1e293b' : '#e5e7eb',
                        color: theme === 'dark' ? '#e5e7eb' : '#222',
                      }),
                      menu: base => ({ ...base, fontSize: 15, zIndex: 10 }),
                      option: (base, state) => ({
                        ...base,
                        background: state.isSelected ? (theme === 'dark' ? '#003366' : '#e0e7ff') : state.isFocused ? (theme === 'dark' ? '#22304a' : '#f3f4f6') : undefined,
                        color: theme === 'dark' ? '#fff' : '#222',
                        cursor: 'pointer',
                      }),
                    }}
                  />
                </div>
                {/* Statut */}
                <div className="filter-bar-field">
                  <Select
                    classNamePrefix="filter-bar-select"
                    value={filters.statut ? { value: filters.statut, label: filters.statut } : null}
                    onChange={option => handleFilterChange('statut', option ? option.value : '')}
                    options={STATUT_LIST.map(statut => ({ value: statut, label: statut }))}
                    placeholder="Statut"
                    isClearable
                    styles={{
                      container: (base) => ({ ...base, width: '100%', maxWidth: 250 }),
                      control: (base) => ({
                        ...base,
                        minHeight: 36,
                        fontSize: 15,
                        borderRadius: 5,
                        borderColor: theme === 'dark' ? '#555' : '#d1d5db',
                        background: theme === 'dark' ? '#0a192f' : '#fff',
                        color: theme === 'dark' ? '#fff' : '#222',
                        boxShadow: 'none',
                        cursor: 'pointer',
                        width: '100%',
                        maxWidth: 250,
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: theme === 'dark' ? '#e5e7eb' : '#222',
                        background: 'transparent',
                      }),
                      multiValue: (base) => ({
                        ...base,
                        background: theme === 'dark' ? '#1e293b' : '#e5e7eb',
                        color: theme === 'dark' ? '#e5e7eb' : '#222',
                      }),
                      menu: base => ({ ...base, fontSize: 15, zIndex: 10 }),
                      option: (base, state) => ({
                        ...base,
                        background: state.isSelected ? (theme === 'dark' ? '#003366' : '#e0e7ff') : state.isFocused ? (theme === 'dark' ? '#22304a' : '#f3f4f6') : undefined,
                        color: theme === 'dark' ? '#fff' : '#222',
                        cursor: 'pointer',
                      }),
                    }}
                  />
                </div>
                {/* Code Suivi */}
                <div className="filter-bar-field">
                  <input
                    className="filter-bar-input"
                    type="text"
                    value={filters.code_suivi}
                    onChange={e => handleFilterChange('code_suivi', e.target.value)}
                    placeholder="Code Suivi"
                  />
                </div>
                {/* Téléphone */}
                <div className="filter-bar-field">
                  <input
                    className="filter-bar-input"
                    type="text"
                    value={filters.tele}
                    onChange={e => handleFilterChange('tele', e.target.value)}
                    placeholder="Téléphone"
                  />
                </div>
                {/* Date From */}
                <div className="filter-bar-field">
                  <input
                    className="filter-bar-input"
                    type="date"
                    value={filters.dateRange[0]}
                    onChange={e => handleFilterChange('dateRange', [e.target.value, filters.dateRange[1]])}
                    placeholder="Date début"
                  />
                </div>
                {/* Date To */}
                <div className="filter-bar-field">
                  <input
                    className="filter-bar-input"
                    type="date"
                    value={filters.dateRange[1]}
                    onChange={e => handleFilterChange('dateRange', [filters.dateRange[0], e.target.value])}
                    placeholder="Date fin"
                  />
                </div>
                {/* Search Button */}
                <button
                  className="filter-bar-btn search"
                  onClick={handleSearch}
                  type="button"
                >
                  <span role="img" aria-label="search">🔍</span> Rechercher
                </button>
                {/* Reset Button */}
                <button
                  className="filter-bar-btn reset"
                  onClick={handleReset}
                  type="button"
                >
                  <span role="img" aria-label="reset">🗑️</span> Réinitialiser
                </button>
              </div>
            </div>
            
            {/* Action Bar */}
            <div
              style={{
                marginBottom: 12,
                background: theme === 'dark' ? '#0a192f' : '#fff',
                borderRadius: 8,
                padding: 12,
                boxShadow: theme === 'dark'
                  ? '0 2px 8px rgba(0,0,0,0.45)'
                  : '0 2px 8px rgba(0,0,0,0.08)',
                border: `1px solid ${theme === 'dark' ? '#22304a' : '#e5e7eb'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ 
                  fontSize: 14, 
                  fontWeight: 600, 
                  color: theme === 'dark' ? '#e2e8f0' : '#374151' 
                }}>
                  Actions
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: 8 }}>
                {/* Nouveau Colis Button (admin/client only) */}
                {(user?.role === 'admin' || user?.role === 'client') && (
                  <button
                    onClick={() => {
                      if (user?.role === 'admin') {
                        navigate('/dashboard/ajouter/colis/admin/normal');
                      } else if (user?.role === 'client') {
                        navigate('/dashboard/ajouter-colis/normal');
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 16px',
                      borderRadius: 6,
                      border: 'none',
                      background: theme === 'dark' ? '#2563eb' : '#3b82f6',
                      color: 'white',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => { e.target.style.background = theme === 'dark' ? '#1d4ed8' : '#2563eb'; }}
                    onMouseLeave={e => { e.target.style.background = theme === 'dark' ? '#2563eb' : '#3b82f6'; }}
                  >
                    <PlusOutlined style={{ fontSize: 14 }} />
                    Nouveau Colis
                  </button>
                )}
                {/* Refresh Button */}
                <button
                  onClick={() => {
                    dispatch(getColisPaginated({
                      page: currentPage,
                      limit: pageSize,
                      ville: appliedFilters.ville || undefined,
                      store: appliedFilters.store || undefined,
                      livreur: appliedFilters.livreur || undefined,
                      statut: appliedFilters.statut || undefined,
                      ...(appliedFilters.dateRange && appliedFilters.dateRange[0] && appliedFilters.dateRange[1] ? {
                        dateFrom: moment(appliedFilters.dateRange[0]).startOf('day').toISOString(),
                        dateTo: moment(appliedFilters.dateRange[1]).endOf('day').toISOString(),
                      } : {})
                    }));
                    toast.success("Données actualisées avec succès!");
                  }}
                  disabled={colisPaginatedList.loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: 'none',
                    background: theme === 'dark' ? '#059669' : '#10b981',
                    color: 'white',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: colisPaginatedList.loading ? 'not-allowed' : 'pointer',
                    opacity: colisPaginatedList.loading ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!colisPaginatedList.loading) {
                      e.target.style.background = theme === 'dark' ? '#047857' : '#059669';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!colisPaginatedList.loading) {
                      e.target.style.background = theme === 'dark' ? '#059669' : '#10b981';
                    }
                  }}
                >
                  <SyncOutlined style={{ fontSize: 14 }} />
                  Actualiser
                </button>

                {/* Ticket Button */}
                <button
                  onClick={handleGenerateTickets}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: 'none',
                    background: theme === 'dark' ? '#7c3aed' : '#8b5cf6',
                    color: 'white',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = theme === 'dark' ? '#6d28d9' : '#7c3aed';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = theme === 'dark' ? '#7c3aed' : '#8b5cf6';
                  }}
                >
                  <TagOutlined style={{ fontSize: 14 }} />
                  Ticket
                </button>

                {/* Export Excel Button */}
                <button
                  onClick={handleExportExcel}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: 'none',
                    background: theme === 'dark' ? '#dc2626' : '#ef4444',
                    color: 'white',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = theme === 'dark' ? '#b91c1c' : '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = theme === 'dark' ? '#dc2626' : '#ef4444';
                  }}
                >
                  <FolderOpenOutlined style={{ fontSize: 14 }} />
                  Export Excel
                </button>
              </div>
            </div>
            {/* End Action Bar */}
            
            {colisPaginatedList.loading ? (
              <div style={{ textAlign: 'center', margin: '40px auto', fontSize: 20 }}>
                <Spin size="large" tip="Chargement..." />
              </div>
            ) : colisPaginatedList.error ? (
              <div style={{ color: 'red', textAlign: 'center', margin: '20px auto', fontWeight: 'bold' }}>{colisPaginatedList.error}</div>
            ) : (
              <div className="table-content" style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'transparent', borderRadius: 12, boxShadow: theme === 'dark' ? '0 2px 8px rgba(0,0,0,0.45)' : '0 2px 8px rgba(0,0,0,0.08)', marginTop: 8, fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th style={{ width: 40, minWidth: 40 }}>
                        <input
                          type="checkbox"
                          checked={colisPaginatedList.data && colisPaginatedList.data.length > 0 && selectedRowIds.length === colisPaginatedList.data.length}
                          indeterminate={selectedRowIds.length > 0 && selectedRowIds.length < (colisPaginatedList.data ? colisPaginatedList.data.length : 0)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedRowIds((colisPaginatedList.data || []).map(row => row._id));
                            } else {
                              setSelectedRowIds([]);
                            }
                          }}
                        />
                      </th>
                      {columns.map(col => (
                        <th key={col.key} style={{ background: theme === 'dark' ? '#1e293b' : '#f8fafc', color: theme === 'dark' ? '#fff' : '#222', fontWeight: 700, fontSize: 15, borderBottom: `2px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`, padding: 8, minWidth: 120 }}>{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {colisPaginatedList.data && colisPaginatedList.data.length > 0 ? (
                      colisPaginatedList.data.map((record, idx) => [
                        <tr key={record._id || idx} style={{ background: theme === 'dark' ? '#0a192f' : '#fff', color: theme === 'dark' ? '#e2e8f0' : '#222', fontSize: 13, borderBottom: `1px solid ${theme === 'dark' ? '#22304a' : '#e5e7eb'}` }}>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={selectedRowIds.includes(record._id)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setSelectedRowIds(prev => [...prev, record._id]);
                                } else {
                                  setSelectedRowIds(prev => prev.filter(id => id !== record._id));
                                }
                              }}
                            />
                          </td>
                          {columns.map(col => (
                            <td key={col.key} style={{ padding: 8, verticalAlign: 'top', maxWidth: 180, wordBreak: 'break-word', minWidth: 120 }}>{col.render(record)}</td>
                          ))}
                        </tr>
                      ])
                    ) : (
                      <tr><td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: 24 }}>Aucun colis trouvé.</td></tr>
                    )}
                  </tbody>
                </table>
                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, margin: '24px 0' }}>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: currentPage === 1 ? '#e5e7eb' : '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    Précédent
                  </button>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>
                    Page {currentPage} / {totalPages || 1} | Total: {colisPaginatedList.total || 0} résultats
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: (currentPage === totalPages || totalPages === 0) ? '#e5e7eb' : '#fff', cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer' }}
                  >
                    Suivant
                  </button>
                  <select
                    value={pageSize}
                    onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                    style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: 6, fontSize: 15 }}
                  >
                    {[10, 20, 50, 100].map(size => (
                      <option key={size} value={size}>{size} / page</option>
                    ))}
                  </select>
                </div>
                {/* Suivi Modal */}
                <Modal
                  open={suiviModalOpen}
                  onCancel={() => { setSuiviModalOpen(false); setSelectedColis(null); }}
                  title={selectedColis ? `Suivi du colis: ${selectedColis.code_suivi}` : 'Suivi du colis'}
                  footer={null}
                  width={500}
                >
                  {selectedColis && selectedColis.suivi_colis && selectedColis.suivi_colis.status_updates && selectedColis.suivi_colis.status_updates.length > 0 ? (
                    <Timeline mode="left">
                      {selectedColis.suivi_colis.status_updates.map((suivi, i) => (
                        <Timeline.Item key={suivi._id || i} color={i === selectedColis.suivi_colis.status_updates.length - 1 ? 'blue' : 'gray'}>
                          <div style={{ fontWeight: 600, color: '#3b82f6', fontSize: 15 }}>{suivi.status}</div>
                          <div style={{ color: '#64748b', fontSize: 13 }}>{moment(suivi.date).format('DD/MM/YYYY HH:mm')}</div>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  ) : (
                    <div style={{ color: '#64748b', fontStyle: 'italic' }}>Aucun historique de suivi trouvé.</div>
                  )}
                </Modal>
                {/* Details Modal */}
                <Modal
                  open={detailsModalOpen}
                  onCancel={() => { setDetailsModalOpen(false); setDetailsColis(null); }}
                  title={detailsColis ? (
                    <span>
                      <TbShieldCode style={{ color: '#3b82f6', marginRight: 8, fontSize: 20 }} />
                      Détails du colis: <span style={{ color: '#3b82f6', fontWeight: 700 }}>{detailsColis.code_suivi}</span>
                    </span>
                  ) : 'Détails du colis'}
                  footer={null}
                  width={800}
                >
                  {detailsColis && (
                    <div>
                      {/* General Info */}
                      <Divider orientation="left"><Tag color="blue"><InfoCircleOutlined /> Informations Générales</Tag></Divider>
                      <Descriptions bordered column={2} size="small">
                        <Descriptions.Item label="Code Suivi">
                          <Tag color="geekblue" style={{ fontWeight: 700 }}>{detailsColis.code_suivi}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Statut">
                          <Tag color={detailsColis.statut === 'Livrée' ? 'green' : detailsColis.statut === 'Annulée' ? 'red' : 'blue'}>{detailsColis.statut}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Statut Final">{detailsColis.statu_final}</Descriptions.Item>
                        <Descriptions.Item label="Date Création">{moment(detailsColis.createdAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
                        <Descriptions.Item label="Date Mise à jour">{moment(detailsColis.updatedAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
                        <Descriptions.Item label="Date Livraison">{detailsColis.date_livraisant ? moment(detailsColis.date_livraisant).format('DD/MM/YYYY HH:mm') : '—'}</Descriptions.Item>
                        <Descriptions.Item label="Date Programmée">{detailsColis.date_programme ? moment(detailsColis.date_programme).format('DD/MM/YYYY HH:mm') : '—'}</Descriptions.Item>
                        <Descriptions.Item label="Expédition Type">{detailsColis.expedation_type}</Descriptions.Item>
                        <Descriptions.Item label="ID Colis">{detailsColis.id_Colis}</Descriptions.Item>
                      </Descriptions>

                      {/* Adresse & Ville */}
                      <Divider orientation="left"><Tag color="cyan"><EnvironmentOutlined /> Adresse & Ville</Tag></Divider>
                      <Descriptions bordered column={2} size="small">
                        <Descriptions.Item label="Nom Destinataire">{detailsColis.nom}</Descriptions.Item>
                        <Descriptions.Item label="Téléphone">{detailsColis.tele}</Descriptions.Item>
                        <Descriptions.Item label="Adresse">{detailsColis.adresse}</Descriptions.Item>
                        <Descriptions.Item label="Ville">{detailsColis.ville?.nom}</Descriptions.Item>
                        <Descriptions.Item label="Région">{detailsColis.ville?.region?.nom}</Descriptions.Item>
                      </Descriptions>

                      {/* Store & Livreur */}
                      <Divider orientation="left"><Tag color="purple"><ShopOutlined /> Store & Livreur</Tag></Divider>
                      <Descriptions bordered column={2} size="small">
                        <Descriptions.Item label="Store">
                          <Tooltip title="Cliquer pour voir le profil détaillé">
                            <span
                              onClick={() => handleViewProfile(detailsColis.store)}
                              style={{
                                color: detailsColis.store?._id ? '#1890ff' : 'inherit',
                                cursor: detailsColis.store?._id ? 'pointer' : 'default',
                                textDecoration: detailsColis.store?._id ? 'underline' : 'none',
                                transition: 'all 0.3s ease',
                                padding: '2px 4px',
                                borderRadius: '4px'
                              }}
                              onMouseEnter={(e) => {
                                if (detailsColis.store?._id) {
                                  e.target.style.backgroundColor = theme === 'dark' ? '#1f1f1f' : '#f0f8ff';
                                  e.target.style.transform = 'scale(1.02)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (detailsColis.store?._id) {
                                  e.target.style.backgroundColor = 'transparent';
                                  e.target.style.transform = 'scale(1)';
                                }
                              }}
                            >
                              {detailsColis.store?.storeName || 'N/A'}
                            </span>
                          </Tooltip>
                        </Descriptions.Item>
                        <Descriptions.Item label="Livreur">{detailsColis.livreur?.username || detailsColis.livreur?.nom}</Descriptions.Item>
                        <Descriptions.Item label="Téléphone Store">{detailsColis.store?.tele}</Descriptions.Item>
                        <Descriptions.Item label="Téléphone Livreur">{detailsColis.livreur?.tele}</Descriptions.Item>
                      </Descriptions>

                      {/* Produit & Commentaires */}
                      <Divider orientation="left"><Tag color="gold"><AiFillProduct /> Produit & Commentaires</Tag></Divider>
                      <Descriptions bordered column={2} size="small">
                        <Descriptions.Item label="Nature Produit">{detailsColis.nature_produit}</Descriptions.Item>
                        <Descriptions.Item label="Prix Colis"><Tag color="green">{detailsColis.prix} DH</Tag></Descriptions.Item>
                        <Descriptions.Item label="Prix à Payer">{detailsColis.prix_payer} DH</Descriptions.Item>
                        <Descriptions.Item label="Commentaire">{detailsColis.commentaire}</Descriptions.Item>
                        <Descriptions.Item label="Commentaire Annulation">{detailsColis.comment_annule}</Descriptions.Item>
                        <Descriptions.Item label="Commentaire Refus">{detailsColis.comment_refuse}</Descriptions.Item>
                        <Descriptions.Item label="Produits">
                          {detailsColis.produits && detailsColis.produits.length > 0 ? (
                            <ul style={{ margin: 0, paddingLeft: 16 }}>
                              {detailsColis.produits.map((prod, idx) => (
                                <li key={idx}><Tag color="blue">{JSON.stringify(prod)}</Tag></li>
                              ))}
                            </ul>
                          ) : '—'}
                        </Descriptions.Item>
                      </Descriptions>

                      {/* CRBT & Tarifs */}
                      <Divider orientation="left"><Tag color="magenta"><WalletOutlined /> CRBT & Tarifs</Tag></Divider>
                      <Descriptions bordered column={2} size="small">
                        <Descriptions.Item label="Prix Colis (CRBT)">{detailsColis.crbt?.prix_colis} DH</Descriptions.Item>
                        <Descriptions.Item label="Tarif Livraison">{detailsColis.crbt?.tarif_livraison} DH</Descriptions.Item>
                        <Descriptions.Item label="Tarif Refus">{detailsColis.crbt?.tarif_refuse} DH</Descriptions.Item>
                        <Descriptions.Item label="Tarif Fragile">{detailsColis.crbt?.tarif_fragile} DH</Descriptions.Item>
                        <Descriptions.Item label="Tarif Supplémentaire">{detailsColis.crbt?.tarif_supplementaire} DH</Descriptions.Item>
                        <Descriptions.Item label="Prix à Payant">{detailsColis.crbt?.prix_a_payant} DH</Descriptions.Item>
                        <Descriptions.Item label="Total Tarif">{detailsColis.crbt?.total_tarif} DH</Descriptions.Item>
                        <Descriptions.Item label="Tarif Ajouter">
                          {detailsColis.tarif_ajouter && (
                            <div>
                              <div>Value: {detailsColis.tarif_ajouter.value}</div>
                              <div>Description: {detailsColis.tarif_ajouter.description}</div>
                            </div>
                          )}
                        </Descriptions.Item>
                      </Descriptions>

                      {/* Autres */}
                      <Divider orientation="left"><Tag color="lime"><TagOutlined /> Autres</Tag></Divider>
                      <Descriptions bordered column={2} size="small">
                        <Descriptions.Item label="Ouvrir">
                          <Tag color={detailsColis.ouvrir ? 'green' : 'red'}>{detailsColis.ouvrir ? 'Oui' : 'Non'}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Simple">
                          <Tag color={detailsColis.is_simple ? 'green' : 'red'}>{detailsColis.is_simple ? 'Oui' : 'Non'}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Remplacé">
                          <Tag color={detailsColis.is_remplace ? 'green' : 'red'}>{detailsColis.is_remplace ? 'Oui' : 'Non'}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Fragile">
                          <Tag color={detailsColis.is_fragile ? 'green' : 'red'}>{detailsColis.is_fragile ? 'Oui' : 'Non'}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Wallet Processed">
                          <Tag color={detailsColis.wallet_prosseced ? 'green' : 'red'}>{detailsColis.wallet_prosseced ? 'Oui' : 'Non'}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Pret Payant">
                          <Tag color={detailsColis.pret_payant ? 'green' : 'red'}>{detailsColis.pret_payant ? 'Oui' : 'Non'}</Tag>
                        </Descriptions.Item>
                      </Descriptions>
                    </div>
                  )}
                </Modal>
                {/* Assign Livreur Modal */}
                <AssignLivreurModal
                  visible={assignModalOpen}
                  onAssign={async () => {
                    if (!assignSelectedLivreur) {
                      toast.error("Veuillez sélectionner un livreur.");
                      return;
                    }
                    setLoadingAssign(true);
                    try {
                      await request.put('/api/colis/statu/affecter', {
                        codesSuivi: [assignSelectedColis.code_suivi],
                        livreurId: assignSelectedLivreur._id,
                      });
                      toast.success("Livreur assigné avec succès.");
                      setAssignModalOpen(false);
                      setAssignSelectedColis(null);
                      setAssignSelectedLivreur(null);
                      setLoadingAssign(false);
                      dispatch(getColisPaginated({
                        page: currentPage,
                        limit: pageSize,
                        ville: appliedFilters.ville || undefined,
                        store: appliedFilters.store || undefined,
                        livreur: appliedFilters.livreur || undefined,
                        statut: appliedFilters.statut || undefined,
                        ...(appliedFilters.dateRange && appliedFilters.dateRange[0] && appliedFilters.dateRange[1] ? {
                          dateFrom: moment(appliedFilters.dateRange[0]).startOf('day').toISOString(),
                          dateTo: moment(appliedFilters.dateRange[1]).endOf('day').toISOString(),
                        } : {})
                      }));
                    } catch (err) {
                      setLoadingAssign(false);
                      toast.error(err?.response?.data?.message || "Erreur lors de l'assignation du livreur.");
                    }
                  }}
                  onCancel={() => {
                    setAssignModalOpen(false);
                    setAssignSelectedColis(null);
                    setAssignSelectedLivreur(null);
                  }}
                  filteredLivreurs={filteredLivreurs}
                  assignSelectedLivreur={assignSelectedLivreur}
                  selectAssignLivreur={setAssignSelectedLivreur}
                  loadingAssign={loadingAssign}
                  theme={theme}
                  toast={toast}
                  selectedColis={assignSelectedColis}
                />
                {/* Status Modal */}
                <StatusModal
                  visible={statusModalOpen}
                  onOk={async () => {
                    try {
                      const values = await form.validateFields();
                      const { status, comment, date, note } = values;
                      let dateField = null;
                      if (status === "Programmée") dateField = "date_programme";
                      else if (status === "Reporté") dateField = "date_reporte";
                      await dispatch(updateStatut(statusColis._id, status, comment, dateField && date ? date.format('YYYY-MM-DD') : null, note));
                      toast.success("Statut mis à jour avec succès.");
                      setStatusModalOpen(false);
                      setStatusColis(null);
                      setStatusType("");
                      form.resetFields();
                      dispatch(getColisPaginated({
                        page: currentPage,
                        limit: pageSize,
                        ville: appliedFilters.ville || undefined,
                        store: appliedFilters.store || undefined,
                        livreur: appliedFilters.livreur || undefined,
                        statut: appliedFilters.statut || undefined,
                        ...(appliedFilters.dateRange && appliedFilters.dateRange[0] && appliedFilters.dateRange[1] ? {
                          dateFrom: moment(appliedFilters.dateRange[0]).startOf('day').toISOString(),
                          dateTo: moment(appliedFilters.dateRange[1]).endOf('day').toISOString(),
                        } : {})
                      }));
                    } catch (err) {
                      toast.error("Erreur lors de la mise à jour du statut.");
                    }
                  }}
                  onCancel={() => {
                    setStatusModalOpen(false);
                    setStatusColis(null);
                    setStatusType("");
                    form.resetFields();
                  }}
                  form={form}
                  selectedColis={statusColis}
                  allowedStatuses={allowedStatuses}
                  statusBadgeConfig={getStatusBadgeConfig(theme)}
                  statusComments={statusComments}
                  statusType={statusType}
                  setStatusType={setStatusType}
                  theme={theme}
                />
                {/* Ticket Modal */}
                <Modal
                  open={ticketModalOpen}
                  onCancel={() => {
                    setTicketModalOpen(false);
                    setTicketColisList([]);
                  }}
                  title={
                    <span>
                      <TagOutlined style={{ color: '#8b5cf6', marginRight: 8, fontSize: 20 }} />
                      Tickets Colis ({ticketColisList.length} colis)
                    </span>
                  }
                  footer={null}
                  width={800}
                  style={{ top: 20 }}
                  bodyStyle={{ 
                    height: '70vh', 
                    overflow: 'hidden',
                    padding: 0
                  }}
                >
                  <div style={{ height: '100%', width: '100%' }}>
                    <TicketColis2 colisList={ticketColisList} />
                  </div>
                </Modal>
                {/* Reclamation Modal */}
                <ReclamationModal
                  open={state.reclamationModalVisible}
                  onCreate={handleCreateReclamation}
                  onCancel={() => setState(prev => ({ ...prev, reclamationModalVisible: false }))}
                  initialMessage={state.initialMessage}
                  setInitialMessage={val => setState(prev => ({ ...prev, initialMessage: val }))}
                  selectedColis={state.selectedColis}
                  theme={theme}
                />
                <ToastContainer />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ColisPaginated; 