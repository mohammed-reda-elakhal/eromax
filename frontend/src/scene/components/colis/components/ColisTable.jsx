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
import { MdDelete, MdOutlinePayment, MdDeliveryDining } from 'react-icons/md';
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
import { createReclamation } from '../../../../redux/apiCalls/reclamationApiCalls';
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


// Lazy load components for better performance
const FilterBar = React.lazy(() => import('./FilterBar'));
const ActionBar = React.lazy(() => import('./ActionBar'));
const TableList = React.lazy(() => import('./TableList'));
const InfoModal = React.lazy(() => import('../modals/InfoModal'));
const ReclamationModal = React.lazy(() => import('../modals/ReclamationModal'));
const TicketModal = React.lazy(() => import('../modals/TicketModal'));
const AssignLivreurModal = React.lazy(() => import('../modals/AssignLivreurModal'));
const StatusModal = React.lazy(() => import('../modals/StatusModal'));

const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input; // Destructure Search if needed


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

// Define statusBadgeConfig mapping each statut to color and icon
const statusBadgeConfig = {
  "Nouveau Colis": { color: 'red', icon: <FaHeart /> },
  "attente de ramassage": { color: 'red', icon: <TbTruckDelivery /> },
  "Ramassée": { color: 'blue', icon: <TbTruckDelivery /> },
  "Mise en Distribution": { color: 'geekblue', icon: <FaTruck /> },
  "Reçu": { color: 'cyan', icon: <CheckCircleOutlined /> },
  "Livrée": { color: 'green', icon: <CheckCircleOutlined /> },
  "Annulée": { color: 'volcano', icon: <CloseCircleOutlined /> },
  "Programmée": { color: 'geekblue', icon: <ClockCircleOutlined /> },
  "Refusée": { color: 'red', icon: <CloseCircleOutlined /> },
  "Boite vocale": { color: 'purple', icon: <FaInfoCircle /> },
  "Pas de reponse jour 1": { color: 'gold', icon: <FaQuestionCircle /> },
  "Pas de reponse jour 2": { color: 'gold', icon: <FaQuestionCircle /> },
  "Pas de reponse jour 3": { color: 'gold', icon: <FaQuestionCircle /> },
  "Pas reponse + sms / + whatsap": { color: 'gold', icon: <FaSms /> },
  "En voyage": { color: 'cyan', icon: <FaPlane /> },
  "Injoignable": { color: 'magenta', icon: <FaPhoneSlash /> },
  "Hors-zone": { color: 'red', icon: <FaMapMarkerAlt /> },
  "Intéressé": { color: 'blue', icon: <FaHeart /> },
  "Numéro Incorrect": { color: 'orange', icon: <FaHeart /> },
  "Reporté": { color: 'geekblue', icon: <FaClock /> },
  "Confirmé Par Livreur": { color: 'blue', icon: <FaCheck /> },
  "Préparer pour Roteur": { color: 'green', icon: <FaCheck /> },
  "En Retou": { color: 'yellow', icon: <FaCheck /> },
  "Endomagé": { color: 'red', icon: <FaHeart /> },
  "Fermée": { color: 'red', icon: <FaHeart /> },
};

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
    reclamationType: 'Type de reclamation',
    subject: '',
    message: '',
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
  } = useSelector((state) => ({
    colisData: state.colis, // Extract the entire 'colis' slice
    livreurList: state.livreur.livreurList || [], // Ensure it's an array
    user: state.auth.user,
    store: state.auth.store,
    stores: state.store.stores || [],
    villes: state.ville.villes || [],
    loading: state.colis.loading, // Extract loading from Redux
    selectedNoteColis : state.noteColis.selectedNoteColis,
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
      "Fermée"
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
    handleDateRangeChange,
    handleApplyFilters,
    handleResetFilters,
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
    setState(prevState => ({
      ...prevState,
      selectedColis: colis,
      reclamationModalVisible: true,
    }));
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
        <div style={tableCellStyles.businessBadge}>
          <ShopOutlined />
          <Typography.Text strong>{record.store?.storeName}</Typography.Text>
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
              <div style={tableCellStyles.businessBadge}>
                <MdDeliveryDining style={{ fontSize: '16px' }} />
                {record.livreur ? (
                  <Typography.Text strong>{record.livreur.nom} </Typography.Text>
                ) : (
                  <Tag icon={<ClockCircleOutlined />} color="default">
                    Operation de Ramassage
                  </Tag>
                )}
              </div>
            ),
    },
  ], []);


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
      gap:'8px',
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
      width: 300,
      render: (text, record) => (
        <>
          {record.replacedColis ? 
            <Badge color="default" dot style={{ marginRight: '5px' }}>
              <FaClone /> {/* Changed icon to FaClone for better representation */}
            </Badge>
            : ""
          }
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
          {record.expedation_type === "ameex" && (
            <p style={{color:"gray", fontSize:"10px", margin: 0}}>{record.code_suivi_ameex}</p>
          )}
          <Divider />
          <div style={{display:'flex' , width:"100%" , justifyContent:"space-around"}}>
            <Tooltip title="Contact via WhatsApp">
              <Button 
                type="primary" 
                icon={<FaWhatsapp />} 
                onClick={() => {
                  // Constructing the message
                  const messageText = `Bonjour, je suis ${user.nom} ${user.prenom}, j'ai besoin de discuter pour le colis de code ${record.code_suivi}.`;
                  
                  // Ensure the message is properly URL-encoded
                  const encodedMessage = encodeURIComponent(messageText);
                  
                  // Open WhatsApp with the encoded message
                  const whatsappUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(phoneNumber)}&text=${encodedMessage}`;
                  window.open(whatsappUrl, '_blank');
                }}
                style={{
                  backgroundColor: '#25D366',
                  borderColor: '#25D366',
                  color: '#fff'
                }}
              />
            </Tooltip>
            <Tooltip title="Call Support">
              <Button 
                type="primary" 
                icon={<TbPhoneCall />} 
                onClick={() => window.location.href = `tel:${phoneNumber}`}
                style={{
                  backgroundColor: '#007bff',
                  borderColor: '#007bff',
                  color: '#fff'
                }}
              />
            </Tooltip>
          </div>
        </>
      ),
    },
    {
      title: 
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaUser /> Distinataire
          </div>,
      dataIndex: 'tele',
      key: 'tele',
      width:250,
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
  
        if (!isValidPhoneNumber && errorMessage) {
          return (
            <div title={errorMessage} placement="topLeft"             style={{display:'flex', gap: '10px', alignItems: 'start' , flexDirection:'column'}}>
                <span>{record.nom}</span>
                <br />
                <Tag icon={<PhoneOutlined />} color="red">{record.tele}</Tag>
                <br />
                <div style={tableCellStyles.priceTag}>
                  <DollarOutlined />
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#52c41a' }}>
                    {record.prix || 'N/A'} DH
                  </span>
                </div>
            </div>
          );
        }
        return (
          <div 
            style={{display:'flex', gap: '10px', alignItems: 'start' , flexDirection:'column'}}
          >
            <span>{record.nom}</span>
            <br />
            <Tag icon={<PhoneOutlined />} color="blue">{record.tele}</Tag>
            <br />
            <div style={tableCellStyles.priceTag}>
                <DollarOutlined />
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#52c41a' }}>
                  {record.prix || 'N/A'} DH
                </span>
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
      width: 300,
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
      render: (text) => (
        <Tag icon={<TagOutlined />} color="cyan" style={{ padding: '6px 12px', borderRadius: '4px' }}>
          {text || 'N/A'}
        </Tag>
      ),
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
      width:250,
      render: (status, record) => {
        const { color, icon } = statusBadgeConfig[status] || { color: 'default', icon: <InfoCircleOutlined /> };
    
        const content = (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {icon}
            <span style={{ marginLeft: 8 }}>{status}</span>
          </span>
        );
    
        // Determine if the status is "Programmée" or "Reporté" to display the corresponding date
        const isProgrammée = status === "Programmée";
        const isReporté = status === "Reporté";
    
        // Retrieve the corresponding date from the record
        const dateToDisplay = isProgrammée
          ? record.date_programme
          : isReporté
          ? record.date_reporte
          : null;
    
        // Format the date if it exists
        const formattedDate = dateToDisplay
          ? moment(dateToDisplay).format('DD-MM-YYYY')
          : null;
    
        return (
          <div>
            {(user?.role === 'admin' || user?.role === 'livreur')  ? (
              <Tag dot color={color} style={{ cursor: 'pointer' }}>
                <span onClick={() => handleStatusClick(record)} style={{ cursor: "pointer" }}>
                  {content}
                </span>
              </Tag>
            ) : (
              <Tag color={color}>
                {content}
              </Tag>
            )}
    
            {/* Conditionally render the date below the status */}
            {formattedDate && (
              <div style={{ marginTop: '4px', marginLeft: '28px' }}>
                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                  {formattedDate}
                </Typography.Text>
              </div>
            )}
    
            {/* If status is 'Livrée' and record.etat is true, show 'Facturée' */}
            {status === "Livrée" && record.etat && (
              <div style={{ marginTop: '4px', marginLeft: '28px' }}>
                <Typography.Text type="secondary" style={{ fontSize: '12px', color: 'blue' }}>
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
      title: 
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IoMdOptions /> Options
          </div>,
      render: (text, record) => (
        <div className="options-actions" style={{ display: 'flex', gap: '10px' }}>
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
            <Tooltip title="File a Reclamation">
              <Button 
                type="primary" 
                onClick={() => openReclamationModal(record)} 
                style={{
                  backgroundColor: '#dc3545',
                  borderColor: '#dc3545',
                  color: '#fff'
                }}
              >
                Reclamation
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
  ], [user, dispatch, navigate, handleInfo, handleTicket, openReclamationModal, handleStatusClick, handleAssignLivreur, state.selectedRowKeys, detailFacture]);

  const columns = useMemo(() => columnsColis, [columnsColis]);

  const handleCreateReclamation = useCallback(() => {
    const { subject, message, selectedColis } = state;

    if (!subject || !message || !selectedColis) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }

    const reclamationData = {
      clientId: store?._id, // Assuming user.store holds the store ID
      colisId: selectedColis._id,
      subject,
      description: message,
    };
    console.log(reclamationData);
    

    dispatch(createReclamation(reclamationData));
    setState(prevState => ({
      ...prevState,
      reclamationModalVisible: false,
      subject: '',
      message: '',
    }));
  }, [state, dispatch, user.store]);

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
          visible={state.factureModalVisible}
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
          handleDateRangeChange={handleDateRangeChange}
          handleApplyFilters={handleApplyFilters}
          handleResetFilters={handleResetFilters}
          stores={stores}
          villes={villes}
          allowedStatuses={allowedStatuses}
          livreurs={livreurList} // Pass livreurList to FilterBar
          user={user}
          theme={theme}
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
          statusBadgeConfig={statusBadgeConfig}
          theme={theme}
          formatDate={formatDate}
        />

        {/* Reclamation Modal */}
        <ReclamationModal
          visible={state.reclamationModalVisible}
          onCreate={handleCreateReclamation}
          onCancel={() => setState(prevState => ({ ...prevState, reclamationModalVisible: false }))}
          subject={state.subject}
          setSubject={(value) => setState(prevState => ({ ...prevState, subject: value }))}
          message={state.message}
          setMessage={(value) => setState(prevState => ({ ...prevState, message: value }))}
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
          title="Suivi du Colis"
          placement="right"
          onClose={() => setState(prevState => ({ ...prevState, drawerOpen: false }))}
          visible={state.drawerOpen}
          width={600}
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
          statusBadgeConfig={statusBadgeConfig}
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
  visible={state.noteColisModalVisible}
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
