// components/ColisTable/components/ColisTable.jsx

import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import {
  Button,
  Select,
  DatePicker,
  Avatar,
  Badge,
  Tooltip,
  Popconfirm,
  Typography,
  Spin,
  Form,
  message,
  Drawer,
  Divider,
  Modal,
  Input,
  Card,
  Space, // Import Input for search and facture lookup
} from 'antd';
import { AiFillProduct } from "react-icons/ai";
import { FcDocument } from "react-icons/fc";
import { FaNoteSticky, FaUser } from "react-icons/fa6";
import {
  FaWhatsapp,
  FaPrint,
  FaPenFancy,
  FaClone,
  FaInfoCircle,
  FaCheck,
  FaTruck,
  FaQuestionCircle,
  FaSms,
  FaPlane,
  FaPhoneSlash,
  FaMapMarkerAlt,
  FaHeart,
  FaClock
} from 'react-icons/fa';
import { TbPhoneCall, TbShieldCode, TbTruckDelivery } from 'react-icons/tb';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  DollarOutlined,
  EditOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  PhoneOutlined,
  ShopOutlined,
  TagOutlined
} from '@ant-design/icons';
import { MdDelete, MdOutlinePayment, MdDeliveryDining, MdOutlinePublishedWithChanges } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import moment from 'moment';
import request from '../../../../utils/request';
import {
  FaFileInvoiceDollar,
  FaExternalLinkAlt,
  FaRegClock,
  FaTimesCircle,
  FaFileInvoice
} from 'react-icons/fa';
import { Tag, Result } from 'antd';

// Import actions
import {
  copieColis,
  deleteColis,
  getColis,
  setColisPayant,
  updateStatut
} from '../../../../redux/apiCalls/colisApiCalls';
import { createReclamation, getReclamationsByColis } from '../../../../redux/apiCalls/reclamationApiCalls';
import { getLivreurList } from '../../../../redux/apiCalls/livreurApiCall';
import { getStoreList } from '../../../../redux/apiCalls/storeApiCalls';
import { getAllVilles } from '../../../../redux/apiCalls/villeApiCalls';
import { getFactureByColis } from '../../../../redux/apiCalls/factureApiCalls'; // Import the new action
import { factureActions } from '../../../../redux/slices/factureSlice'; // Ensure factureActions includes setFactureDetail

// Import custom hook
import useColisFilters from '../hooks/useColisFilters';

// Import global components
import TicketColis from '../../tickets/TicketColis';
import TrackingColis from '../../../global/TrackingColis '; // Removed trailing space
import { IoDocumentAttachSharp, IoStorefront } from 'react-icons/io5';
import { createNoteColis, getNoteColisById, updateAdminNote, updateClientNote, updateLivreurNote } from '../../../../redux/apiCalls/noteColisApiCalls';
import { noteColisActions } from '../../../../redux/slices/noteColisSlice';
import { RiUserLocationFill } from 'react-icons/ri';
import { HiStatusOnline } from 'react-icons/hi';
import { BsCalendar2DateFill } from 'react-icons/bs';
import { IoMdOptions } from 'react-icons/io';
import { getStatisticColisReporteeProg } from '../../../../redux/apiCalls/staticsApiCalls';


// Lazy load components for better performance
const FilterBar = React.lazy(() => import('./FilterBar'));
const ActionBar = React.lazy(() => import('./ActionBar'));
const TableList = React.lazy(() => import('./TableList'));
const InfoModal = React.lazy(() => import('../modals/InfoModal'));
const ReclamationModal = React.lazy(() => import('../modals/ReclamationModal'));
const TicketModal = React.lazy(() => import('../modals/TicketModal'));
const AssignLivreurModal = React.lazy(() => import('../modals/AssignLivreurModal'));
const StatusModal = React.lazy(() => import('../modals/StatusModal'));

// Destructure components we need
const { Search } = Input;


// Define status comments
const statusComments = {
  "Annulée": [
    "Client a annulé la commande",
    "Le produit n'est plus disponible",
    "Erreur dans la commande",
  ],
  "Refusée": [
    "Le client a refusé la livraison",
    "Le destinataire était absent",
    "Le produit était endommagé",
  ],
};

// Define statusBadgeConfig mapping each statut to color and icon with professional colors
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

const ColisTable = ({ theme }) => {
  const [state, setState] = useState({
    data: [],
    filteredData: [],
    selectedRowKeys: [],
    selectedRows: [],
    selectedColis: null,
    reclamationModalVisible: false,
    infoModalVisible: false,
    ticketModalVisible: false,
    drawerOpen: false,
    initialMessage: '',
    factureModalVisible: false, // New state for facture modal visibility
    searchColisId: '', // State to store the searched colis ID
    noteColisModalVisible: false, // NEW: controls visibility of Note Colis modal
  });

  const [clientNoteValue, setClientNoteValue] = useState("");
const [livreurNoteValue, setLivreurNoteValue] = useState("");
const [adminNoteValue, setAdminNoteValue] = useState("");
const [editingClient, setEditingClient] = useState(false);
const [editingLivreur, setEditingLivreur] = useState(false);
const [editingAdmin, setEditingAdmin] = useState(false);


  const [selectColisNote , setSelectColisNote ] = useState("")

  // Mobile detection hook
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const openNoteColisModal = (colisId) => {
    // Dispatch your Redux function to get NoteColis by colisId.
    // (Assuming getNoteColisById is imported and available from your redux actions.)
    dispatch(getNoteColisById(colisId));
    setState(prevState => ({ ...prevState, noteColisModalVisible: true }));
    setSelectColisNote(colisId)
  };

  const { detailFacture } = useSelector((state) => state.facture);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Array of selected code_suivi


  const [tableLoading, setTableLoading] = useState(false);

  // States for Status Modal
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [statusType, setStatusType] = useState("");
  const [form] = Form.useForm();

  // States for Assign Livreur Modal
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [assignSelectedLivreur, setAssignSelectedLivreur] = useState(null);
  const [loadingAssign, setLoadingAssign] = useState(false);

  const phoneNumber = '+212630087302';

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Extract Redux states
  const {
    livreurList,
    colisData,
    user,
    store,
    stores,
    villes,
    loading ,
    selectedNoteColis,
    colisReporteeProg
  } = useSelector((state) => ({
    colisData: state.colis, // Extract the entire 'colis' slice
    livreurList: state.livreur.livreurList || [], // Ensure it's an array
    user: state.auth.user,
    store: state.auth.store,
    stores: state.store.stores || [],
    villes: state.ville.villes || [],
    loading: state.colis.loading, // Extract loading from Redux
    selectedNoteColis : state.noteColis.selectedNoteColis,
    colisReporteeProg : state.statics.colisReporteeProg,
  }));


// Define allowed statuses based on user role
const allowedStatuses = useMemo(() => {
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
    return []; // Or some default set of statuses for other roles
  }
}, [user?.role]);


  // **Add the following two lines to define singleAssignColis state**
  const [singleAssignColis, setSingleAssignColis] = useState(null);

  // Use custom hook for filters
  const {
    filters,
    appliedFilters,
    queryParams,
    handleFilterChange,
    handleApplyFilters,
    handleResetFilters,
    startDate,
    endDate,
    handleStartDateChange,
    handleEndDateChange,
  } = useColisFilters();

  // Debounced Search
  const debouncedSearch = useRef(
    debounce((value) => {
      setState(prevState => ({ ...prevState, searchTerm: value }));
    }, 300)
  ).current;

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Function to open the Reclamation Modal
  const openReclamationModal = useCallback((colis) => {
    // Create a default initial message with the colis code
    const defaultMessage = `Je souhaite signaler un problème concernant le colis ${colis.code_suivi}.\n\nDétails du problème: ___`;

    setState(prevState => ({
      ...prevState,
      selectedColis: colis,
      initialMessage: defaultMessage,
      reclamationModalVisible: true,
    }));

    console.log('Opening reclamation modal for colis:', colis);
  }, []);

  // Fetch data based on user role and appliedFilters
  const getDataColis = useCallback(() => {
    setTableLoading(true); // Start loading
    dispatch(getColis(queryParams)).finally(() => setTableLoading(false));
  }, [dispatch, queryParams]);

  useEffect(() => {
    getDataColis();
    dispatch(getLivreurList()); // Ensure livreurList is fetched
    dispatch(getStoreList());
    dispatch(getAllVilles());

  }, [dispatch, getDataColis]);

  // Update state when colisData changes
  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      data: Array.isArray(colisData.colis) ? colisData.colis : [],
      filteredData: Array.isArray(colisData.colis) ? colisData.colis : [],
      total: colisData.total || 0,
    }));
  }, [colisData]);

  // Search effect
  useEffect(() => {
    const { searchTerm, data } = state;

    setTableLoading(true); // Start loading

    let filteredData = data;

    // Apply search term
    if (searchTerm) {
      filteredData = filteredData.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setState(prevState => ({ ...prevState, filteredData }));
    setTableLoading(false); // End loading
  }, [state.searchTerm, state.data]);

  const handleSearch = (e) => {
    debouncedSearch(e.target.value);
  };

  // Handle row selection
  const handleRowSelection = (selectedRowKeys, selectedRows) => {
    setState(prevState => ({
      ...prevState,
      selectedRowKeys,
      selectedRows,
    }));
  };

  // Show info modal
  const handleInfo = (id) => {
    const selectedColis = state.data.find(item => item._id === id);
    setState(prevState => ({
      ...prevState,
      selectedColis,
      infoModalVisible: true,
    }));
  };

  const closeInfoModal = () => {
    setState(prevState => ({
      ...prevState,
      infoModalVisible: false,
      selectedColis: null,
    }));
  };

  const handleTicket = (record) => {
    setState(prevState => ({
      ...prevState,
      selectedColis: record,
      ticketModalVisible: true,
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // Handle opening the status modal when clicking on the status Badge
  const handleStatusClick = (record) => {
    setState(prevState => ({
      ...prevState,
      selectedColis: record,
    }));
    setStatusType("");
    setIsStatusModalVisible(true);
  };

  const handleStatusOk = () => {
    form.validateFields().then(values => {
      const { status, comment, date, note } = values;

      // Determine if the status is "Programmée" or "Reporté" to assign the correct date field
      let dateField = null;
      if (status === "Programmée") {
        dateField = "date_programme";
      } else if (status === "Reporté") {
        dateField = "date_reporte";
      }

      // Prepare the payload for updateStatut
      const payload = {
        new_status: status,
        comment,
        note,
      };

      if (dateField && date) {
        payload[dateField] = date.format('YYYY-MM-DD'); // Format the date as needed
      }

      // Dispatch updateStatut with the additional fields
      dispatch(updateStatut(state.selectedColis._id, status, comment, dateField && date ? date.format('YYYY-MM-DD') : null, note))
        .then(() => {
          // Optionally, update the local state if not handled by Redux
          const newData = state.data.map(item => {
            if (item._id === state.selectedColis._id) {
              return {
                ...item,
                statut: status,
                commentaire: comment,
                [dateField]: date ? date.format('YYYY-MM-DD') : item[dateField],
                note: note || item.note,
              };
            }
            return item;
          });

          setState(prevState => ({
            ...prevState,
            data: newData,
            filteredData: newData,
            isStatusModalVisible: false,
            selectedColis: null,
          }));
          form.resetFields();
          handleStatusCancel();
        })
        .catch(error => {
          // Handle errors if necessary
          console.error("Error updating status:", error);
          toast.error("Erreur lors de la mise à jour du statut.");
        });
    }).catch(info => {
      console.log('Validation Failed:', info);
    });
  };

  const handleStatusCancel = () => {
    setIsStatusModalVisible(false);
    setStatusType("");
    form.resetFields();
  };

  // Function to open the Assign Livreur modal
  const handleAssignLivreur = () => {
    if (state.selectedRowKeys.length === 0) {
      message.error("Veuillez sélectionner au moins un colis pour assigner un livreur.");
      return;
    }
    setAssignSelectedLivreur(null);
    setAssignModalVisible(true);
  };

  // Function to select a livreur
  const selectAssignLivreur = (livreur) => {
    setAssignSelectedLivreur(livreur);
  };

  // Function to handle the assignment confirmation
  // Inside ColisTable.jsx

// Inside ColisTable.jsx

const handleConfirmAssignLivreur = async () => {
  if (!assignSelectedLivreur) {
    message.error("Veuillez sélectionner un livreur.");
    return;
  }

  if (selectedRowKeys.length === 0) {
    message.error("Veuillez sélectionner au moins un colis pour l'assignation.");
    return;
  }

  try {
    setLoadingAssign(true);
    const response = await request.put('/api/colis/statu/affecter', {
      codesSuivi: selectedRowKeys, // Array of code_suivi
      livreurId: assignSelectedLivreur._id, // Single livreurId
    });
    setLoadingAssign(false);
    handleCancelAssignLivreur();
    getDataColis();
    toast.success("Livreur assigné avec succès.");
  } catch (err) {
    setLoadingAssign(false);
    if (err.response && err.response.data && err.response.data.message) {
      toast.error(`Erreur: ${err.response.data.message}`);
    } else {
      toast.error("Erreur lors de l'assignation du livreur.");
    }
    console.error(err);
  }
};

  // Function to cancel the assignment modal
  const handleCancelAssignLivreur = () => {
    setAssignModalVisible(false);
    setAssignSelectedLivreur(null);
  };

  // Compute selected colis' villes based on selectedRowKeys
  const selectedColisVilles = useMemo(() => {
    return state.data
      .filter(colis => state.selectedRowKeys.includes(colis.code_suivi))
      .map(colis => colis.ville?.nom)
      .filter(ville => ville); // Remove undefined or null
  }, [state.data, state.selectedRowKeys]);

  const uniqueSelectedColisVilles = useMemo(() => {
    return [...new Set(selectedColisVilles)];
  }, [selectedColisVilles]);

  // Ensure livreurList is an array
  const safeLivreurList = useMemo(() => Array.isArray(livreurList) ? livreurList : [], [livreurList]);

  // Filter livreurs: exclude 'ameex' and categorize into preferred and other based on villes coverage
  const filteredLivreurs = useMemo(() => {
    return safeLivreurList
      .filter(livreur => livreur.username !== 'ameex') // Exclude 'ameex'
      .reduce(
        (acc, livreur) => {
          const personVilles = livreur.villes || [];
          const coversAllVilles = uniqueSelectedColisVilles.every(ville => personVilles.includes(ville));
          if (coversAllVilles) {
            acc.preferred.push(livreur);
          } else {
            acc.other.push(livreur);
          }
          return acc;
        },
        { preferred: [], other: [] }
      );
  }, [safeLivreurList, uniqueSelectedColisVilles]);

  // Define adminColumns
  const adminColumns = useMemo(() => [
    {
      title:
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IoStorefront /> Store
          </div>,
      dataIndex: 'store',
      key: 'store',
      width: 200,
      render: (text, record) => (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 0'
        }}>
          <ShopOutlined
            style={{
              fontSize: '12px',
              color: theme === 'dark' ? '#94a3b8' : '#64748b'
            }}
          />
          <Typography.Text
            style={{
              color: '#3b82f6',
              fontSize: '13px',
              fontWeight: '500',
              lineHeight: '1.2',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            onClick={() => {
              if (record.store?._id) {
                navigate(`/dashboard/profile-user/${record.store._id}`);
              } else {
                toast.error("ID de la boutique non disponible");
              }
            }}
          >
            {record.store?.storeName || 'N/A'}
          </Typography.Text>
        </div>
      ),
    },
    {
      title:
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MdDeliveryDining /> Livreur
          </div>,
      dataIndex: ['livreur', 'nom'],
      key: 'livreur_nom',
      width: 200,

      render: (text, record) => (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 0'
        }}>
          <MdDeliveryDining
            style={{
              fontSize: '12px',
              color: theme === 'dark' ? '#94a3b8' : '#64748b'
            }}
          />
          {record.livreur ? (
            <Typography.Text
              style={{
                color: '#3b82f6',
                fontSize: '13px',
                fontWeight: '500',
                lineHeight: '1.2'
              }}
            >
              {record.livreur.nom}
            </Typography.Text>
          ) : (
            <Typography.Text
              style={{
                color: theme === 'dark' ? '#94a3b8' : '#64748b',
                fontSize: '12px',
                fontWeight: '400',
                fontStyle: 'italic',
                lineHeight: '1.2'
              }}
            >
              En attente
            </Typography.Text>
          )}
        </div>
      ),
    },
  ], []);


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
    phoneTagError: {
      background: theme === 'dark' ? '#dc2626' : '#ef4444',
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

  const tableCellStyles = getTableCellStyles(theme);

  // Define columns for the table
  const columnsColis = useMemo(() => [
    {
      title:
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TbShieldCode /> Code
          </div>,
      dataIndex: 'code_suivi',
      key: 'code_suivi',
      width: 180,
      minWidth: 160,
      render: (text, record) => (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '12px 8px',
          background: 'transparent',
          minHeight: '80px',
          justifyContent: 'space-between'
        }}>
          {/* Code suivi - displayed first and prominently */}
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <Typography.Text
              copyable={{
                tooltips: ['Copier', 'Copié!'],
                icon: [<CopyOutlined key="copy" style={{ fontSize: '11px' }} />, <CheckOutlined key="copied" style={{ fontSize: '11px' }} />],
              }}
              style={{
                fontWeight: '700',
                fontSize: '13px',
                color: '#3b82f6',
                margin: 0,
                textAlign: 'center',
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'visible',
                textOverflow: 'clip'
              }}
            >
              {text}
            </Typography.Text>
          </div>

          {/* Divider */}
          <div style={{
            width: '100%',
            height: '1px',
            background: theme === 'dark' ? '#374151' : '#e5e7eb',
            margin: '4px 0'
          }} />

          {/* Ameex code if exists */}
          {record.expedation_type === "ameex" && record.code_suivi_ameex && (
            <div style={{ textAlign: 'center' }}>
              <Typography.Text
                style={{
                  fontSize: '11px',
                  color: '#64748b',
                  margin: 0,
                  fontWeight: '500'
                }}
              >
                AMEEX: {record.code_suivi_ameex}
              </Typography.Text>
            </div>
          )}

          {/* Status badges row */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center', minHeight: '16px' }}>
            {record.replacedColis && (
              <Tag size="small" color="default" style={{ margin: 0, fontSize: '9px', padding: '1px 4px' }}>
                <FaClone style={{ fontSize: '8px' }} />
              </Tag>
            )}
            {record.is_remplace && (
              <Tag size="small" color="orange" style={{ margin: 0, fontSize: '9px', padding: '1px 4px' }}>
                <MdOutlinePublishedWithChanges style={{ fontSize: '8px' }} /> Remplacé
              </Tag>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: 'auto' }}>
            <Tooltip title="WhatsApp">
              <Button
                type="primary"
                icon={<FaWhatsapp />}
                size="small"
                onClick={() => {
                  const messageText = `Bonjour, je suis ${user.nom} ${user.prenom}, j'ai besoin de discuter pour le colis de code ${record.code_suivi}.`;
                  const encodedMessage = encodeURIComponent(messageText);
                  const whatsappUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(phoneNumber)}&text=${encodedMessage}`;
                  window.open(whatsappUrl, '_blank');
                }}
                style={{
                  backgroundColor: '#10b981',
                  borderColor: '#10b981',
                  color: '#fff',
                  fontSize: '10px',
                  height: '22px',
                  width: '26px',
                  padding: 0
                }}
              />
            </Tooltip>
            <Tooltip title="Appeler">
              <Button
                type="primary"
                icon={<TbPhoneCall />}
                size="small"
                onClick={() => window.location.href = `tel:${phoneNumber}`}
                style={{
                  backgroundColor: '#3b82f6',
                  borderColor: '#3b82f6',
                  color: '#fff',
                  fontSize: '10px',
                  height: '22px',
                  width: '26px',
                  padding: 0
                }}
              />
            </Tooltip>
          </div>
        </div>
      ),
    },
    {
      title:
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaUser /> Distinataire
          </div>,
      dataIndex: 'tele',
      key: 'tele',
      width: 200,
      minWidth: 180,
      render: (text , record) => {
        // Validate phone number
        const phoneRegex = /^0[67]\d{8}$/;
        const isValidPhoneNumber = phoneRegex.test(text);

        let errorMessage = '';
        if (text) {
          if (!text.startsWith('06') && !text.startsWith('07') && text.length === 10) {
            errorMessage = 'Le numéro doit commencer par 06 ou 07.';
          } else if ((text.startsWith('06') || text.startsWith('07')) && text.length !== 10) {
            errorMessage = 'Le numéro doit comporter 10 chiffres.';
          } else if (!text.startsWith('06') && !text.startsWith('07') && text.length !== 10) {
            errorMessage = 'Le numéro doit commencer par 06 ou 07 et comporter 10 chiffres.';
          }
        }

        const professionalCardStyle = {
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '12px',
          background: 'transparent',
          minHeight: '80px',
          justifyContent: 'space-between'
        };

        const nameStyle = {
          color: '#475569',
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

        const errorPhoneStyle = {
          color: theme === 'dark' ? '#fca5a5' : '#dc2626',
          fontSize: '12px',
          fontWeight: '500',
          textAlign: 'left',
          lineHeight: '1.2'
        };

        if (!isValidPhoneNumber && errorMessage) {
          return (
            <div style={professionalCardStyle}>
              <div>
                <Typography.Text style={nameStyle}>
                  {record.nom?.length > 18 ? record.nom.substring(0, 18) + '...' : record.nom}
                </Typography.Text>
              </div>
              <div>
                <Typography.Text style={errorPhoneStyle}>
                  {record.tele}
                </Typography.Text>
              </div>
              <div>
                <Typography.Text style={priceStyle}>
                  {record.prix || 'N/A'} DH
                </Typography.Text>
              </div>
            </div>
          );
        }
        return (
          <div style={professionalCardStyle}>
            <div>
              <Typography.Text style={nameStyle}>
                {record.nom?.length > 18 ? record.nom.substring(0, 18) + '...' : record.nom}
              </Typography.Text>
            </div>
            <div>
              <Typography.Text style={phoneStyle}>
                {record.tele}
              </Typography.Text>
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
      title:
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaMapMarkerAlt /> adresse
          </div>,
      dataIndex: 'adresse',
      key: 'adresse',
      width: 250,
      minWidth: 200,
      render : (text , record) =>{
        return(
          <>
            <div style={tableCellStyles.dateCell}>
              <div style={tableCellStyles.dateItem}>
                <EnvironmentOutlined style={{ color: '#1677ff' }} />
                <span>Ville: {record?.ville?.nom}</span>
              </div>
              <div style={tableCellStyles.dateItem}>
                <RiUserLocationFill style={{ color: '#52c41a' }} />
                <span>{text}</span>
              </div>
            </div>
          </>
        )
      }
    },

    {
      title:
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AiFillProduct /> Produit
          </div>,
      dataIndex: 'nature_produit',
      key: 'nature_produit',
      width: 180,
      render: (text) => {
        if (!text) {
          return (
            <Tag style={{
              ...tableCellStyles.productTag,
              background: theme === 'dark' ? '#374151' : '#9ca3af',
            }}>
              N/A
            </Tag>
          );
        }

        // Limit to first 2-3 words (max 20 characters)
        const words = text.split(' ');
        const shortText = words.slice(0, 2).join(' ');
        const displayText = shortText.length > 20 ? shortText.substring(0, 20) + '...' : shortText;
        const hasMore = text.length > displayText.length;

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Tag
              icon={<TagOutlined />}
              style={tableCellStyles.productTag}
            >
              {displayText}
            </Tag>
            {hasMore && (
              <Tooltip title={text}>
                <Button
                  type="text"
                  size="small"
                  icon={<InfoCircleOutlined />}
                  style={{
                    padding: '0 4px',
                    color: theme === 'dark' ? '#60a5fa' : '#3b82f6',
                    minWidth: 'auto'
                  }}
                />
              </Tooltip>
            )}
          </div>
        );
      },
    },
    // Only append the admin columns if user is an admin
    ...(user?.role === 'admin' ? adminColumns : []),
    {
      title:
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiStatusOnline /> Status
          </div>,
      dataIndex: 'statut',
      key: 'statut',
      width: 200,
      minWidth: 180,
      render: (status, record) => {
        const statusBadgeConfig = getStatusBadgeConfig(theme);
        const { color, icon, textColor } = statusBadgeConfig[status] || {
          color: theme === 'dark' ? '#374151' : '#9ca3af',
          icon: <InfoCircleOutlined />,
          textColor: 'white'
        };

        const content = (
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: textColor
          }}>
            {icon}
            <span>{status}</span>
          </span>
        );

        // Determine if the status is "Programmée" or "Reporté" to display the corresponding date
        const isProgrammée = status === "Programmée";
        const isReporté = status === "Reporté";

        // Determine if the status is "livrée", "refusée", or "annule" to display date_livraisant
        // Check for different case variations and normalize status
        const normalizedStatus = status?.toLowerCase();
        const isLivrée = normalizedStatus === "livrée" || normalizedStatus === "livree";
        const isRefusée = normalizedStatus === "refusée" || normalizedStatus === "refusee" || normalizedStatus === "refusé";
        const isAnnule = normalizedStatus === "annule" || normalizedStatus === "annulé" || normalizedStatus === "annulee";
        const shouldShowDateLivraisant = isLivrée || isRefusée || isAnnule;

        // Debug logging
        if (shouldShowDateLivraisant) {
          console.log('Status:', status, 'normalizedStatus:', normalizedStatus, 'shouldShowDateLivraisant:', shouldShowDateLivraisant, 'date_livraisant:', record.date_livraisant);
        }

        // Retrieve the corresponding date from the record
        const dateToDisplay = isProgrammée
          ? record.date_programme
          : isReporté
          ? record.date_reporte
          : shouldShowDateLivraisant
          ? record.date_livraisant
          : null;

        // Format the date if it exists
        let formattedDate = null;
        if (dateToDisplay) {
          try {
            formattedDate = moment(dateToDisplay).format('DD-MM-YYYY');
          } catch (error) {
            console.error('Date formatting error:', error);
            // Fallback: try to display the raw date
            formattedDate = dateToDisplay.toString().substring(0, 10);
          }
        }

        // Additional debugging for date issues
        if (shouldShowDateLivraisant) {
          console.log('dateToDisplay:', dateToDisplay, 'formattedDate:', formattedDate);
        }

        return (
          <div>
            {(user?.role === 'admin' || user?.role === 'livreur') ? (
              <div
                style={{
                  ...tableCellStyles.statusBadge,
                  background: color,
                  cursor: 'pointer',
                  border: 'none'
                }}
                onClick={() => handleStatusClick(record)}
              >
                {content}
              </div>
            ) : (
              <div style={{
                ...tableCellStyles.statusBadge,
                background: color,
                border: 'none'
              }}>
                {content}
              </div>
            )}

            {/* Conditionally render the date below the status */}
            {formattedDate && (
              <div style={{ marginTop: '6px' }}>
                <Typography.Text
                  type="secondary"
                  style={{
                    fontSize: '11px',
                    color: theme === 'dark' ? '#94a3b8' : '#64748b'
                  }}
                >
                  {formattedDate}
                </Typography.Text>
              </div>
            )}

            {/* If status is 'Livrée' and record.etat is true, show 'Facturée' */}
            {status === "Livrée" && record.etat && (
              <div style={{ marginTop: '6px' }}>
                <Typography.Text
                  style={{
                    fontSize: '11px',
                    color: theme === 'dark' ? '#60a5fa' : '#3b82f6',
                    fontWeight: '500'
                  }}
                >
                  Facturée
                </Typography.Text>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title:
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BsCalendar2DateFill /> Date
          </div>,
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
            <EditOutlined style={{ color: theme === 'dark' ? '#10b981' : '#059669' }} />
            <span>Modifié: {formatDate(record?.updatedAt)}</span>
          </div>
        </div>
      ),
    },

    {
      title:
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MdOutlinePayment /> Wallet
          </div>,
      dataIndex: 'wallet_prosseced',
      key: 'wallet_prosseced',
      render: (wallet_prosseced) => (
        <div style={{ textAlign: 'center' }}>
          {wallet_prosseced ? (
            <div style={{
              ...tableCellStyles.statusBadge,
              background: theme === 'dark' ? '#059669' : '#10b981',
              color: 'white'
            }}>
              <CheckCircleOutlined />
              <span>Processed</span>
            </div>
          ) : (
            <div style={{
              ...tableCellStyles.statusBadge,
              background: theme === 'dark' ? '#dc2626' : '#ef4444',
              color: 'white'
            }}>
              <ClockCircleOutlined />
              <span>Pending</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title:
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IoMdOptions /> Options
          </div>,
      width: 220,
      minWidth: 200,
      ...(isMobile ? {} : { fixed: 'right' }),
      render: (text, record) => (
        <div
          className="options-actions"
          style={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            alignItems: 'center',
            maxWidth: '220px'
          }}
        >
          <Tooltip title="Plus d'information">
            <Button
              type="primary"
              icon={<FaInfoCircle />}
              onClick={()=>handleInfo(record._id)}
              style={{
                backgroundColor: '#17a2b8',
                borderColor: '#17a2b8',
                color: '#fff'
              }}
            />
          </Tooltip>
          <Tooltip title="Suivi colis">
            <Button
              type="primary"
              icon={<TbTruckDelivery />}
              onClick={() => setState(prevState => ({ ...prevState, drawerOpen: true, selectedColis: record }))}
              style={{
                backgroundColor: '#17a2b8',
                borderColor: '#17a2b8',
                color: '#fff'
              }}
            />
          </Tooltip>
          <Tooltip title="Ticket colis">
            <Button
              type="primary"
              icon={<FaPrint  />}
              onClick={() => handleTicket(record)}
              style={{
                backgroundColor: '#0d6efd',
                borderColor: '#0d6efd',
                color: '#fff'
              }}
            />
          </Tooltip>
          <Tooltip title="Note Colis">
                <Button
                  type="primary"
                  icon={<FaNoteSticky />}
                  onClick={() => openNoteColisModal(record._id)}
                  style={{ backgroundColor: '#8e44ad', borderColor: '#8e44ad', color: '#fff' }}
                />
              </Tooltip>
          {user.role === 'admin' && (
            <Tooltip title="Edit Record">
              <Button
                type="primary"
                icon={<FaPenFancy />}
                onClick={() => navigate(`/dashboard/colis/update/${record.code_suivi}`)}
                style={{
                  backgroundColor: '#ffac33',
                  borderColor: '#ffac33',
                  color: '#fff'
                }}
              />
            </Tooltip>
          )}
          {user?.role === 'client' && (
            <Tooltip title="Créer une réclamation">
              <Button
                type="primary"
                onClick={() => {
                  // First check if there's an open reclamation for this colis
                  dispatch(getReclamationsByColis(record._id))
                    .then((reclamations) => {
                      if (reclamations && reclamations.length > 0) {
                        // Check if any reclamation is open (not closed)
                        const openReclamation = reclamations.find(r => r.closed === false);

                        if (openReclamation) {
                          // Show error with option to view the existing reclamation
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

                      // If no open reclamation exists, navigate to create a new one
                      navigate('/dashboard/reclamation', {
                        state: {
                          createReclamation: true,
                          colis: record
                        }
                      });
                    })
                    .catch((error) => {
                      console.error('Error checking existing reclamations:', error);
                      toast.error("Erreur lors de la vérification des réclamations existantes.");
                    });
                }}
                style={{
                  backgroundColor: '#dc3545',
                  borderColor: '#dc3545',
                  color: '#fff'
                }}
              >
                Réclamation
              </Button>
            </Tooltip>
          )}
          {user?.role === 'admin' && (
            <>
               {/* New "Assign Livreur" Button */}
            <Tooltip title="Assign Livreur">
              <Button
                type="primary"
                icon={<FaTruck />}
                onClick={() => {
                  setSelectedRowKeys([record.code_suivi]); // Select single Colis
                  setAssignModalVisible(true); // Open the AssignLivreurModal
                }}
                style={{
                  backgroundColor: '#ff9800',
                  borderColor: '#ff9800',
                  color: '#fff'
                }}
              />
            </Tooltip>
              {/* New "Facture" Button */}
              <Tooltip title="Voir Facture">
                <Button
                  type="default"
                  onClick={() => {
                    dispatch(getFactureByColis(record._id)); // Dispatch the action with colis _id
                    setState(prevState => ({ ...prevState, factureModalVisible: true })); // Open the modal
                    console.log(detailFacture);

                  }}
                  style={{
                    backgroundColor: '#ffc107',
                    borderColor: '#ffc107',
                    color: '#fff'
                  }}
                  icon={<IoDocumentAttachSharp />} // Choose an appropriate icon
                >
                </Button>
              </Tooltip>
            </>
          )}
         {(user?.role==="admin" || record?.statut === "attente de ramassage" || record?.statut === "Nouveau Colis") && (
        <Tooltip title="Supprimer colis">
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce colis?"
            description={`Code Suivi: ${record.code_suivi}`}
            okText="Oui"
            okType="danger"
            cancelText="Non"
            onConfirm={() => {
              dispatch(deleteColis(record._id));
              message.success(`Colis avec le code ${record.code_suivi} a été supprimé avec succès.`);
            }}
            onCancel={() => {
              message.info('Suppression annulée.');
            }}
          >
            <Button
              type="primary"
              style={{
                backgroundColor: '#dc3545',
                borderColor: '#dc3545',
                color: '#fff'
              }}
              icon={<MdDelete />}
            />
          </Popconfirm>
        </Tooltip>

      )}
        </div>
      ),
    }
  ], [user, dispatch, navigate, handleInfo, handleTicket, openReclamationModal, handleStatusClick, handleAssignLivreur, state.selectedRowKeys, detailFacture, isMobile]);

  const columns = useMemo(() => columnsColis, [columnsColis]);

  const handleCreateReclamation = useCallback(() => {
    const { initialMessage, selectedColis } = state;

    if (!initialMessage || !selectedColis) {
      toast.error("Veuillez remplir le message initial.");
      return;
    }

    // Ensure we have the colis ID
    if (!selectedColis._id) {
      toast.error("Impossible de créer une réclamation: ID du colis manquant.");
      console.error('Missing colis ID:', selectedColis);
      return;
    }

    const reclamationData = {
      colisId: selectedColis._id,
      initialMessage: initialMessage
    };

    console.log('Creating reclamation with data:', reclamationData);

    // Show loading toast
    const loadingToast = toast.loading("Création de la réclamation en cours...");

    dispatch(createReclamation(reclamationData))
      .then((response) => {
        toast.dismiss(loadingToast);
        if (response && response.reclamation) {
          toast.success("Réclamation créée avec succès!");
          console.log('Reclamation created successfully:', response);

          // Close the modal after successful creation
          setState(prevState => ({
            ...prevState,
            reclamationModalVisible: false,
            initialMessage: '',
          }));
        } else {
          toast.error("Erreur lors de la création de la réclamation.");
        }
      })
      .catch((error) => {
        toast.dismiss(loadingToast);
        console.error('Error creating reclamation:', error);
        toast.error(error?.response?.data?.message || "Erreur lors de la création de la réclamation.");
      });
  }, [state, dispatch]);

  const handleCloseTicketModal = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      ticketModalVisible: false,
      selectedColis: null,
    }));
  }, []);

  const handleBatchTickets = useCallback(() => {
    if (state.selectedRows.length === 0) {
      toast.error("Veuillez sélectionner au moins un colis.");
      return;
    }
    navigate('/dashboard/tickets', { state: { selectedColis: state.selectedRows } });
  }, [state.selectedRows, navigate]);

  // Export to Excel Function
  const exportToExcel = useCallback(() => {
    const { selectedRows } = state;

    if (selectedRows.length === 0) {
      toast.error("Veuillez sélectionner au moins un colis à exporter.");
      return;
    }

    const dataToExport = selectedRows.map(colis => ({
      "Code Suivi": colis.code_suivi,
      "Destinataire": colis.nom,
      "Téléphone": colis.tele,
      "Ville": colis.ville?.nom || 'N/A',
      "Adresse": colis.adresse || 'N/A',
      "Prix (DH)": colis.prix,
      "Nature de Produit": colis.nature_produit,
      "Commentaire": colis.commentaire || 'N/A',
      "État": colis.etat ? "Payée" : "Non Payée",
      "Prés payant": colis.pret_payant ? "Payée" : "Non Payée",
      "Wallet Processed": colis.wallet_prosseced ? "Oui" : "Non",
      "Tarif Ajouter Valeur": colis.tarif_ajouter?.value || 0,
      "Tarif Ajouter Description": colis.tarif_ajouter?.description || 'N/A',
      "CRBT Prix Colis": colis.crbt?.prix_colis || 0,
      "CRBT Tarif Livraison": colis.crbt?.tarif_livraison || 0,
      "CRBT Tarif Refus": colis.crbt?.tarif_refuse || 0,
      "CRBT Tarif Fragile": colis.crbt?.tarif_fragile || 0,
      "CRBT Tarif Supplementaire": colis.crbt?.tarif_supplementaire || 0,
      "CRBT Prix à Payer": colis.crbt?.prix_a_payant || 0,
      "CRBT Total Tarif": colis.crbt?.total_tarif || 0,
      "Ouvrir": colis.ouvrir ? "Oui" : "Non",
      "Is Simple": colis.is_simple ? "Oui" : "Non",
      "Is Remplace": colis.is_remplace ? "Oui" : "Non",
      "Is Fragile": colis.is_fragile ? "Oui" : "Non",
      "Dernière Mise à Jour": formatDate(colis.updatedAt),
      "Date de Création": formatDate(colis.createdAt),
      "Replaced Code Suivi": colis.replacedColis?.code_suivi || 'N/A',
      "Replaced Ville": colis.replacedColis?.ville?.nom || 'N/A',
      "Replaced Prix (DH)": colis.replacedColis?.prix || 'N/A',
      "Store Adresse": colis.store?.adress || 'N/A',
      "Store Téléphone": colis.store?.tele || 'N/A',
      "Livreur Nom": colis.livreur?.nom || 'N/A',
      "Livreur Téléphone": colis.livreur?.tele || 'N/A',
      "Statut": colis.statut,
      "Date Programmée": colis.date_programme ? formatDate(colis.date_programme) : 'N/A',
      "Date Reportée": colis.date_reporte ? formatDate(colis.date_reporte) : 'N/A',
      "Note": colis.note || 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Selected Colis");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `Selected_Colis_${moment().format('YYYYMMDD_HHmmss')}.xlsx`);
  }, [state.selectedRows]);

  return (
    <div className={`colis-form-container ${theme === 'dark' ? 'dark-mode' : ''}`} style={{width:"100%", overflowX: 'auto'}}>
      {/* React Toastify context holder */}
      <ToastContainer /> {/* Added ToastContainer */}

      {/* Spinner for Table Loading */}
      {tableLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        </div>
      )}

      {/* Suspense for lazy-loaded components */}
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '20px 0' }}><Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} /></div>}>
        {/* Facture Modal */}
        <Modal
          title="Détails de la Facture"
          open={state.factureModalVisible}
          onCancel={() => setState(prevState => ({ ...prevState, factureModalVisible: false }))}
          footer={[
            <Button key="close" onClick={() => setState(prevState => ({ ...prevState, factureModalVisible: false }))}>
              Fermer
            </Button>
          ]}
        >
          {detailFacture ? (
  <div style={{ padding: '20px' }}>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Client Facture Section */}
      <Card
        style={{
          backgroundColor: theme === 'dark' ? '#1f1f1f' : '#f8f9fa',
          borderRadius: '8px'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '15px'
        }}>
          <FaFileInvoiceDollar style={{ fontSize: '24px', color: '#1890ff' }} />
          <Typography.Title level={5} style={{ margin: 0 }}>
            Facture Client
          </Typography.Title>
        </div>
        {detailFacture?.clientFacture?.code ? (
          <Button
            type="primary"
            icon={<FaExternalLinkAlt />}
            onClick={() => {
              const url = `/dashboard/facture/detail/client/${detailFacture?.clientFacture.code}`;
              window.open(url, '_blank');
            }}
            style={{ width: '100%' }}
          >
            {detailFacture?.clientFacture.code}
          </Button>
        ) : (
          <Tag icon={<FaTimesCircle />} color="error">
            Pas de facture client
          </Tag>
        )}
      </Card>

      {/* Livreur Facture Section */}
      <Card
        style={{
          backgroundColor: theme === 'dark' ? '#1f1f1f' : '#f8f9fa',
          borderRadius: '8px'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '15px'
        }}>
          <FaTruck style={{ fontSize: '24px', color: '#52c41a' }} />
          <Typography.Title level={5} style={{ margin: 0 }}>
            Facture Livreur
          </Typography.Title>
        </div>
        {detailFacture?.livreurFacture?.code ? (
          <Button
            type="primary"
            icon={<FaExternalLinkAlt />}
            onClick={() => {
              const url = `/dashboard/facture/detail/livreur/${detailFacture.livreurFacture.code}`;
              window.open(url, '_blank');
            }}
            style={{ width: '100%', backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            {detailFacture.livreurFacture.code}
          </Button>
        ) : (
          <Tag icon={<FaTimesCircle />} color="error">
            Pas de facture livreur
          </Tag>
        )}
      </Card>
    </div>
  </div>
) : (
  <Result
    icon={<FaFileInvoice style={{ color: '#ff4d4f' }} />}
    status="error"
    title="Aucune facture trouvée"
    subTitle="Ce colis n'a pas de facture associée pour le moment."
  />
)}
        </Modal>

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          handleFilterChange={handleFilterChange}
          handleApplyFilters={handleApplyFilters}
          handleResetFilters={handleResetFilters}
          stores={stores}
          villes={villes}
          allowedStatuses={allowedStatuses}
          livreurs={livreurList}
          user={user}
          theme={theme}
          startDate={startDate}
          endDate={endDate}
          handleStartDateChange={handleStartDateChange}
          handleEndDateChange={handleEndDateChange}
        />

        {/* Action Bar */}
        <ActionBar
          onRefresh={getDataColis}
          onBatchTickets={handleBatchTickets}
          onExport={exportToExcel}
          selectedRowKeys={state.selectedRowKeys}
          onSearch={handleSearch}
          searchValue={state.searchTerm}
        />

        {/* Table List */}
        <TableList
          columns={columns}
          data={state.filteredData}
          loading={tableLoading}
          rowSelection={{
            selectedRowKeys: state.selectedRowKeys,
            onChange: handleRowSelection,
          }}
          theme={theme}
        />

        {/* Info Modal */}
        <InfoModal
          visible={state.infoModalVisible}
          onClose={closeInfoModal}
          selectedColis={state.selectedColis}
          statusBadgeConfig={getStatusBadgeConfig(theme)}
          theme={theme}
          formatDate={formatDate}
        />

        {/* Reclamation Modal */}
        <ReclamationModal
          open={state.reclamationModalVisible}
          onCreate={handleCreateReclamation}
          onCancel={() => setState(prevState => ({ ...prevState, reclamationModalVisible: false }))}
          initialMessage={state.initialMessage}
          setInitialMessage={(value) => setState(prevState => ({ ...prevState, initialMessage: value }))}
          selectedColis={state.selectedColis}
          theme={theme}
        />

        {/* Ticket Modal */}
        <TicketModal
          visible={state.ticketModalVisible}
          onClose={handleCloseTicketModal}
          selectedColis={state.selectedColis}
          theme={theme}
        />

        {/* Tracking Drawer */}
        <Drawer
          title={
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: theme === 'dark' ? '#fff' : '#262626'
            }}>
              <TbTruckDelivery style={{ fontSize: '18px', color: '#1890ff' }} />
              <span>Suivi du Colis</span>
              {state.selectedColis?.code_suivi && (
                <span style={{
                  fontSize: '14px',
                  color: theme === 'dark' ? '#8c8c8c' : '#8c8c8c',
                  fontWeight: 'normal'
                }}>
                  - {state.selectedColis.code_suivi}
                </span>
              )}
            </div>
          }
          placement="right"
          onClose={() => setState(prevState => ({ ...prevState, drawerOpen: false }))}
          open={state.drawerOpen}
          width={650}
          styles={{
            header: {
              backgroundColor: theme === 'dark' ? '#262626' : '#fff',
              borderBottom: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`,
              padding: '16px 24px'
            },
            body: {
              backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fafafa',
              padding: '0'
            },
            mask: {
              backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.45)'
            },
            content: {
              backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fafafa'
            }
          }}
          className={theme === 'dark' ? 'dark-mode-drawer' : 'light-mode-drawer'}
        >
          <TrackingColis
            theme={theme}
            codeSuivi={state.selectedColis?.code_suivi}
          />
        </Drawer>

        {/* Status Modal */}
        <StatusModal
          visible={isStatusModalVisible}
          onOk={handleStatusOk}
          onCancel={handleStatusCancel}
          form={form}
          selectedColis={state.selectedColis}
          allowedStatuses={allowedStatuses}
          statusBadgeConfig={getStatusBadgeConfig(theme)}
          statusComments={statusComments}
          statusType={statusType}
          setStatusType={setStatusType}
          theme={theme}
        />

        {/* Assign Livreur Modal */}
        <AssignLivreurModal
          visible={assignModalVisible}
          onAssign={handleConfirmAssignLivreur}
          onCancel={handleCancelAssignLivreur}
          filteredLivreurs={filteredLivreurs} // Pass the entire object
          assignSelectedLivreur={assignSelectedLivreur}
          selectAssignLivreur={selectAssignLivreur}
          loadingAssign={loadingAssign}
          theme={theme}
          toast={toast}
          selectedColis={state.filteredData.find(colis => colis.code_suivi === selectedRowKeys[0])} // Pass the selected colis
        />
      </Suspense>
      {/* Note Colis Modal */}
     {/* Note Colis Modal */}
{/* Note Colis Modal */}
<Modal
  title="Note Colis"
  open={state.noteColisModalVisible}
  onCancel={() => {
    setState(prevState => ({
      ...prevState,
      noteColisModalVisible: false,
      editingClient: false,
      editingLivreur: false,
      editingAdmin: false,
    }));
    dispatch(noteColisActions.clearSelectedNoteColis());
    setSelectColisNote('');
  }}
  footer={[
    <Button
      key="close"
      onClick={() => {
        setState(prevState => ({
          ...prevState,
          noteColisModalVisible: false,
          editingClient: false,
          editingLivreur: false,
          editingAdmin: false,
        }));
        dispatch(noteColisActions.clearSelectedNoteColis());
        setSelectColisNote('');
      }}
    >
      Fermer
    </Button>
  ]}
>
  {selectedNoteColis ? (
    <div>
      {/* Client Note Section */}
      <Divider orientation="left">Client Note</Divider>
      {selectedNoteColis.clientNote ? (
        <div style={{ marginBottom: 16 }}>
          <Typography.Text strong>
            {selectedNoteColis.clientNote.createdBy?.nom}{" "}
            {selectedNoteColis.clientNote.createdBy?.prenom} {" "}
            {selectedNoteColis.clientNote.createdBy?.tele}
          </Typography.Text>
          <br />
          {user?.role === "client" && !editingClient ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <Typography.Paragraph style={{ margin: 0 }}>
                {selectedNoteColis.clientNote.note}
              </Typography.Paragraph>
              <Button
                type="link"
                icon={<FaPenFancy />}
                onClick={() => {
                  setEditingClient(true);
                  setClientNoteValue(selectedNoteColis.clientNote.note);
                }}
              />
            </div>
          ) : user?.role === "client" && editingClient ? (
            <div style={{ marginBottom: 16 }}>
              <Input.TextArea
                placeholder="Entrez votre note client"
                value={clientNoteValue}
                onChange={(e) => setClientNoteValue(e.target.value)}
                rows={3}
                style={{marginBottom:'8px'}}
              />
              <Button
                type="primary"
                onClick={() => {
                  if (clientNoteValue.trim() === "") {
                    toast.error("La note ne peut pas être vide");
                    return;
                  }
                  const noteData = { colisId: selectColisNote, note: clientNoteValue };
                  dispatch(updateClientNote(noteData));
                  setEditingClient(false);
                }}
              >
                Enregistrer
              </Button>
            </div>
          ) : (
            <Typography.Paragraph>
              {selectedNoteColis.clientNote.note}
            </Typography.Paragraph>
          )}
        </div>
      ) : (
        user?.role === "client" ? (
          <div style={{ marginBottom: 16 }}>
            <Input.TextArea
              placeholder="Entrez votre note client"
              value={clientNoteValue || ""}
              onChange={(e) => setClientNoteValue(e.target.value)}
              rows={3}
              style={{marginBottom:'8px'}}
            />
            <Button
              type="primary"
              onClick={() => {
                if ((clientNoteValue || "").trim() === "") {
                  toast.error("La note ne peut pas être vide");
                  return;
                }
                const noteData = { colisId: selectColisNote, note: clientNoteValue };
                dispatch(updateClientNote(noteData));
                setClientNoteValue("");
              }}
            >
              Enregistrer
            </Button>
          </div>
        ) : (
          <Typography.Paragraph>Aucune note client</Typography.Paragraph>
        )
      )}

      {/* Livreur Note Section */}
      <Divider orientation="left">Livreur Note</Divider>
      {selectedNoteColis.livreurNote ? (
        <div style={{ marginBottom: 16 }}>
          <Typography.Text strong>
            {selectedNoteColis.livreurNote.createdBy?.nom}{" "}
            {selectedNoteColis.livreurNote.createdBy?.prenom} {selectedNoteColis.livreurNote.createdBy?.tele}
          </Typography.Text>
          <br />
          {user?.role === "livreur" && !editingLivreur ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <Typography.Paragraph style={{ margin: 0 }}>
                {selectedNoteColis.livreurNote.note}
              </Typography.Paragraph>
              <Button
                type="link"
                icon={<FaPenFancy />}
                onClick={() => {
                  setEditingLivreur(true);
                  setLivreurNoteValue(selectedNoteColis.livreurNote.note);
                }}
              />
            </div>
          ) : user?.role === "livreur" && editingLivreur ? (
            <div style={{ marginBottom: 16 }}>
              <Input.TextArea
                placeholder="Entrez votre note livreur"
                value={livreurNoteValue || ""}
                onChange={(e) => setLivreurNoteValue(e.target.value)}
                rows={3}
                style={{marginBottom:'8px'}}
              />
              <Button
                type="primary"
                onClick={() => {
                  if ((livreurNoteValue || "").trim() === "") {
                    toast.error("La note ne peut pas être vide");
                    return;
                  }
                  const noteData = { colisId: selectColisNote, note: livreurNoteValue };
                  dispatch(updateLivreurNote(noteData));
                  setEditingLivreur(false);
                }}
              >
                Enregistrer
              </Button>
            </div>
          ) : (
            <Typography.Paragraph>
              {selectedNoteColis.livreurNote.note}
            </Typography.Paragraph>
          )}
        </div>
      ) : (
        user?.role === "livreur" ? (
          <div style={{ marginBottom: 16 }}>
            <Input.TextArea
              placeholder="Entrez votre note livreur"
              value={livreurNoteValue || ""}
              onChange={(e) => setLivreurNoteValue(e.target.value)}
              rows={3}
              style={{marginBottom:'8px'}}
            />
            <Button
              type="primary"
              onClick={() => {
                if ((livreurNoteValue || "").trim() === "") {
                  toast.error("La note ne peut pas être vide");
                  return;
                }
                const noteData = { colisId: selectColisNote, note: livreurNoteValue };
                dispatch(updateLivreurNote(noteData));
                setLivreurNoteValue("");
              }}
            >
              Enregistrer
            </Button>
          </div>
        ) : (
          <Typography.Paragraph>Aucune note livreur</Typography.Paragraph>
        )
      )}

      {/* Admin Notes Section */}
      <Divider orientation="left">Admin Notes</Divider>
      <div>
        {selectedNoteColis.adminNotes && selectedNoteColis.adminNotes.length > 0 ? (
          <>
            {selectedNoteColis.adminNotes.map((adminNote, index) => {
              const isMine =
                adminNote.createdBy &&
                adminNote.createdBy._id === user?.id;
              return (
                <div key={index} style={{ marginBottom: 8 }}>
                  <Typography.Text strong>
                    {adminNote.createdBy?.nom} {adminNote.createdBy?.prenom} {adminNote.createdBy?.tele}
                  </Typography.Text>
                  <br />
                  {user?.role === "admin" && isMine && !editingAdmin ? (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Typography.Paragraph style={{ margin: 0 }}>
                        {adminNote.note}
                      </Typography.Paragraph>
                      <Button
                        type="link"
                        icon={<FaPenFancy />}
                        onClick={() => {
                          setEditingAdmin(true);
                          setAdminNoteValue(adminNote.note);
                        }}
                      />
                    </div>
                  ) : user?.role === "admin" && editingAdmin && isMine ? (
                    <div style={{ marginBottom: 16 }}>
                      <Input.TextArea
                        placeholder="Entrez votre note admin"
                        value={adminNoteValue || ""}
                        onChange={(e) => setAdminNoteValue(e.target.value)}
                        rows={3}
                        style={{marginBottom:'8px'}}
                      />
                      <Button
                        type="primary"
                        onClick={() => {
                          if ((adminNoteValue || "").trim() === "") {
                            toast.error("La note ne peut pas être vide");
                            return;
                          }
                          const noteData = { colisId: selectColisNote, note: adminNoteValue };
                          dispatch(updateAdminNote(noteData));
                          setEditingAdmin(false);
                        }}
                      >
                        Enregistrer
                      </Button>
                    </div>
                  ) : (
                    <Typography.Paragraph>
                      {adminNote.note}
                    </Typography.Paragraph>
                  )}
                </div>
              );
            })}
            {/* If current admin did not provide any note, show input */}
            {user?.role === "admin" &&
              selectedNoteColis.adminNotes.filter(
                (n) => n.createdBy?._id === user?.id
              ).length === 0 && (
                <div style={{ marginBottom: 16 }}>
                  <Input.TextArea
                    placeholder="Entrez votre note admin"
                    value={adminNoteValue || ""}
                    onChange={(e) => setAdminNoteValue(e.target.value)}
                    rows={3}
                    style={{marginBottom:'8px'}}
                  />
                  <Button
                    type="primary"
                    onClick={() => {
                      if ((adminNoteValue || "").trim() === "") {
                        toast.error("La note ne peut pas être vide");
                        return;
                      }
                      const noteData = { colisId: selectColisNote, note: adminNoteValue };
                      dispatch(updateAdminNote(noteData));
                      setAdminNoteValue("");
                    }}
                  >
                    Enregistrer
                  </Button>
                </div>
              )}
          </>
        ) : (
          user?.role === "admin" && (
            <div style={{ marginBottom: 16 }}>
              <Input.TextArea
                placeholder="Entrez votre note admin"
                value={adminNoteValue || ""}
                onChange={(e) => setAdminNoteValue(e.target.value)}
                rows={3}
                style={{marginBottom:'8px'}}
              />
              <Button
                type="primary"
                onClick={() => {
                  if ((adminNoteValue || "").trim() === "") {
                    toast.error("La note ne peut pas être vide");
                    return;
                  }
                  const noteData = { colisId: selectColisNote, note: adminNoteValue };
                  dispatch(updateAdminNote(noteData));
                  setAdminNoteValue("");
                }}
              >
                Enregistrer
              </Button>
            </div>
          )
        )}
      </div>
    </div>
  ) : (
    <>
      <Typography.Paragraph>
        Aucune note trouvée pour ce colis.
      </Typography.Paragraph>
      <Button
        type="primary"
        onClick={() => dispatch(createNoteColis(selectColisNote))}
      >
        Create Note
      </Button>
    </>
  )}
</Modal>


    </div>
  );
};

export default React.memo(ColisTable);
