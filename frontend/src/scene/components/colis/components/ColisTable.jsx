// ColisTable.jsx

import React, { useState, useEffect, useRef } from 'react';
import { 
  Modal, 
  Button, 
  Input, 
  Drawer, 
  Typography, 
  Tag, 
  Descriptions, 
  Divider, 
  Tooltip, 
  Form, 
  Select, 
  message, 
  Spin,
  Badge,
  Col,
  Popconfirm,
  Card
} from 'antd';
import { 
  FaWhatsapp, 
  FaPrint, 
  FaPenFancy, 
  FaTicketAlt, 
  FaDownload, 
  FaInfoCircle, 
  FaClone
} from 'react-icons/fa';
import { 
  FiRefreshCcw 
} from "react-icons/fi";
import { 
  TbPhoneCall, 
  TbTruckDelivery 
} from 'react-icons/tb';
import { 
  IoSearch 
} from "react-icons/io5";
import { 
  IoMdRefresh 
} from 'react-icons/io';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseCircleOutlined, 
  LoadingOutlined 
} from '@ant-design/icons';
import { useReactToPrint } from 'react-to-print';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { MdDelete, MdOutlinePayment, MdDeliveryDining } from 'react-icons/md'; // Imported MdDeliveryDining
import { BsFillInfoCircleFill } from "react-icons/bs"; // Imported BsFillInfoCircleFill
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import TicketColis from '../../tickets/TicketColis';
import TableDashboard from '../../../global/TableDashboard';
import { 
  copieColis,
  deleteColis, 
  getColis, 
  getColisForClient, 
  getColisForLivreur, 
  setColisPayant, 
  updateStatut 
} from '../../../../redux/apiCalls/colisApiCalls';
import { createReclamation } from '../../../../redux/apiCalls/reclamationApiCalls';
import TrackingColis from '../../../global/TrackingColis ';
import moment from 'moment';
import { getLivreurList } from '../../../../redux/apiCalls/livreurApiCall';
import axios from 'axios'; // Import Axios
import request from '../../../../utils/request';

const { Text } = Typography;
const { Option } = Select;

// Define allowed statuses and their comments
const allowedStatuses = [
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
];

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

// Function to determine the color of the status tag
function getStatusTagColor(status) {
  switch (status) {
    case "Livrée":
      return "green";
    case "Annulée":
      return "volcano";
    case "Programmée":
      return "geekblue";
    case "Refusée":
      return "red";
    case "Boite vocale":
      return "purple";
    case "Pas de reponse jour 1":
    case "Pas de reponse jour 2":
    case "Pas de reponse jour 3":
    case "Pas reponse + sms / + whatsap":
      return "gold";
    case "En voyage":
      return "cyan";
    case "Injoignable":
      return "magenta";
    case "Hors-zone":
      return "red";
    case "Intéressé":
      return "blue";
    case "Numéro Incorrect":
      return "orange";
    case "Reporté":
      return "geekblue";
    case "Confirmé Par Livreur":
      return "blue";
    case "Endomagé":
      return "red";
    default:
      return "default";
  }
}

const ColisTable = ({ theme, darkStyle, search }) => {
  const [state, setState] = useState({
    data: [],
    filteredData: [],
    searchTerm: '',
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
  });

  // States for Status Modal
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [statusType, setStatusType] = useState("");
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  // States for Assign Livreur Modal
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [assignSelectedLivreur, setAssignSelectedLivreur] = useState(null);
  const [loadingAssign, setLoadingAssign] = useState(false); // Loading state for assignment

  const phoneNumber = '+212630087302';

  const componentRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Extracting Redux states including loading
  const { livreurList, colisData, user, store, loading } = useSelector((state) => ({
    colisData: state.colis.colis || [],
    livreurList: state.livreur.livreurList,
    user: state.auth.user,
    store: state.auth.store,
    loading: state.colis.loading, // <-- Extract loading from Redux
  }));

  // Fetch data based on user role
  const getDataColis = () => {
    if (user?.role) {
      switch (user.role) {
        case 'admin':
          dispatch(getColis(''));
          break;
        case 'client':
          dispatch(getColisForClient(store._id, ''));
          break;
        case 'livreur':
          dispatch(getColisForLivreur(user._id, ''));
          break;
        case 'team':
          dispatch(getColisForClient(user._id, ''));
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    getDataColis();
    dispatch(getLivreurList());
  }, [dispatch, user?.role, store?._id, user._id]);

  // Update state when colisData changes
  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      data: Array.isArray(colisData) ? colisData : [],
      filteredData: Array.isArray(colisData) ? colisData : [],
    }));
  }, [colisData]);

  // Filter data based on search term
  useEffect(() => {
    const { searchTerm, data } = state;
    const filteredData = data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setState(prevState => ({ ...prevState, filteredData }));
  }, [state.searchTerm, state.data]);

  const handleSearch = (e) => {
    setState(prevState => ({ ...prevState, searchTerm: e.target.value }));
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
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // Handle opening the status modal when clicking on the status Tag
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
      const { status, comment, deliveryTime } = values;

      if (status === "Programmée" && !deliveryTime) {
        message.error("Veuillez sélectionner un temps de livraison pour une livraison programmée.");
        return;
      }

      // Dispatch updateStatut
      if (status === "Programmée") {
        dispatch(updateStatut(state.selectedColis._id, status, comment, deliveryTime));
      } else {
        dispatch(updateStatut(state.selectedColis._id, status, comment));
      }

      const newData = state.data.map(item => {
        if (item._id === state.selectedColis._id) {
          return { ...item, statut: status, comment, deliveryTime };
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
    setAssignSelectedLivreur(null);
    setAssignModalVisible(true);
  };

  // Function to select a livreur
  const selectAssignLivreur = (livreur) => {
    setAssignSelectedLivreur(livreur);
  };

  // Function to handle the assignment confirmation
  const handleConfirmAssignLivreur = async () => {
    if (!assignSelectedLivreur) {
      message.error("Veuillez sélectionner un livreur.");
      return;
    }

    try {
      setLoadingAssign(true);
      // Send a PUT request to assign the livreur
      const response = await request.put('/api/colis/statu/affecter', {
        codesSuivi: state.selectedRowKeys,
        livreurId: assignSelectedLivreur._id
      });
      setLoadingAssign(false);
      toast.success(response.data.message);
      handleCancelAssignLivreur();
      // Update the local data to remove the assigned colis
      const newData = state.data.filter(item => !state.selectedRowKeys.includes(item.code_suivi));
      setState(prevState => ({
        ...prevState,
        data: newData,
        filteredData: newData,
        selectedRowKeys: [],
        assignModalVisible: false,
        selectedLivreur: null,
      }));
    } catch (err) {
      setLoadingAssign(false);
      toast.error("Erreur lors de l'assignation du livreur.");
      console.error(err);
    }
  };

  // Function to cancel the assignment modal
  const handleCancelAssignLivreur = () => {
    setAssignModalVisible(false);
    setAssignSelectedLivreur(null);
  };

  // Compute filteredLivreurs based on the selected colis's villes
  const selectedColisVilles = state.data
    .filter(colis => state.selectedRowKeys.includes(colis.code_suivi))
    .map(colis => colis.ville.nom);

  const uniqueSelectedColisVilles = [...new Set(selectedColisVilles)];

  // **Added Filter to Exclude Livreur with username 'ameex'**
  const filteredLivreurs = livreurList
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

  // Define columns for the table
  const columnsColis = [
    {
      title: 'Code Suivi',
      dataIndex: 'code_suivi',
      key: 'code_suivi',
      ...search('code_suivi'),
      width: 200,
      render: (text, record) => (
        <>
          {record.replacedColis ? 
            <Tag icon={<FiRefreshCcw />} color="default" style={{ marginRight: '5px' }} />
            : ""
          }
          <Typography.Text
            copyable
            style={{ width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {text}
          </Typography.Text>
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
      title: 'Bussiness',
      dataIndex: 'store',
      key: 'store',
      render : (text , record) => (
        <>
          <strong>{record.store?.storeName} <br/> {record.store?.tele || 'N/A'}</strong>
          {
            user?.role === "admin" ? <p> <strong>Adresse : </strong>{record.store?.adress || 'N/A'} </p> : ""
          }
        </>
      )
    },
    {
      title: 'Livreur',
      dataIndex: ['livreur', 'nom'],
      key: 'livreur_nom',
      render: (text ,record) => (
        <>
           {record.livreur ? <p>{record.livreur.nom} <br/> {record.livreur.tele} </p> : <Tag icon={<ClockCircleOutlined />} color="default">Opération de Ramassage</Tag>}
        </>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      ...search('statut'),
      render: (status, record) => {
        return user?.role === 'admin' ? (
          <Tag
            color={getStatusTagColor(status)}
            style={{ cursor: 'pointer' }}
            onClick={() => handleStatusClick(record)}
          >
            {status}
          </Tag>
        ) : (
          <Tag
            color={getStatusTagColor(status)}
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Destinataire',
      dataIndex: 'tele',
      key: 'tele',
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
            <Tooltip title={errorMessage} placement="topLeft">
              <Typography.Text >
                <span>{record.nom}</span>
                <br />
                <span style={{ color: 'red', fontWeight: 'bold', cursor: 'pointer' }}> {text} </span>
                <br />
                <span>{record?.ville.nom}</span>
                <br />
                <span>{record?.prix} DH</span>
              </Typography.Text>
            </Tooltip>
          );
        }
        return (
          <Typography.Text>
            <span>{record.nom}</span>
            <br />
            <span style={{ color: 'green', fontWeight: 'bold' }}> {text} </span>
            <br />
            <span>{record?.ville.nom}</span>
            <br />
            <span>{record?.prix} DH</span>
          </Typography.Text>
        );
      },
    }, 
    {
      title: 'Adresse',
      dataIndex: 'adresse',
      key: 'adresse',
    },
    {
      title: 'Nature de Produit',
      dataIndex: 'nature_produit',
      key: 'nature_produit',
      ...search('nature_produit'),
      render: (text) => text || 'N/A',
    },
    {
      title: 'Options',
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
          {user.role !== 'livreur' && (
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
              <Tooltip title="Copie de colis">
              <Popconfirm
                title="Êtes-vous sûr de vouloir copie ce colis?"
                description={`Code Suivi: ${record.code_suivi}`}
                okText="Oui"
                okType="warning"
                cancelText="Non"
                onConfirm={() => {
                  dispatch(copieColis(record._id));
                  message.success(`Colis avec le code ${record.code_suivi} a été cloner avec succès.`);
                }}
                onCancel={() => {
                  // Optional: Handle cancellation if needed
                  message.info('Copie annulée.');
                }}
              >
                <Button 
                  type="primary" 
                  style={{
                    backgroundColor: ' #5CB338',
                    borderColor: ' #5CB338',
                    color: '#fff'
                  }}
                  icon={<FaClone />}
                />
              </Popconfirm>
              </Tooltip>
              <Tooltip title="Colis est déjà payant">
                <Button 
                  type="primary" 
                  onClick={() => dispatch(setColisPayant(record._id))} 
                  style={{
                    backgroundColor: 'green',
                    borderColor: 'green',
                    color: '#fff'
                  }}
                  icon={<MdOutlinePayment />}
                />
              </Tooltip>
              <Tooltip title="Affecter Livreur">
                <Button 
                  type="primary" 
                  icon={<MdDeliveryDining />} 
                  onClick={() => {
                    setState(prevState => ({
                      ...prevState,
                      selectedRowKeys: [record.code_suivi]
                    }));
                    handleAssignLivreur();
                  }}
                  style={{
                    backgroundColor: '#ff9800',
                    borderColor: '#ff9800',
                    color: '#fff'
                  }}
                />
              </Tooltip>
            </>
          )}
          {
            (record?.statut === "attente de ramassage" || record?.statut === "Nouveau Colis") &&
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
                  // Optional: Handle cancellation if needed
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
          }
        </div>
      ),
    }
  ];

  const columns = columnsColis;

  const openReclamationModal = (colis) => {
    setState(prevState => ({
      ...prevState,
      selectedColis: colis,
      reclamationModalVisible: true,
    }));
  };

  const handleCreateReclamation = () => {
    const { subject, message, selectedColis } = state;

    if (!subject || !message || !selectedColis) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }

    const reclamationData = {
      clientId: store._id,
      colisId: selectedColis._id,
      subject,
      description: message,
    };

    dispatch(createReclamation(reclamationData));
    setState(prevState => ({
      ...prevState,
      reclamationModalVisible: false,
      subject: '',
      message: '',
    }));
  };

  const handleCloseTicketModal = () => {
    setState(prevState => ({
      ...prevState,
      ticketModalVisible: false,
      selectedColis: null,
    }));
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Ticket-${state.selectedColis?.code_suivi}`,
  });

  const handleBatchTickets = () => {
    if (state.selectedRows.length === 0) {
      toast.error("Veuillez sélectionner au moins un colis.");
      return;
    }
    navigate('/dashboard/tickets', { state: { selectedColis: state.selectedRows } });
  };

  // Export to Excel Function
  const exportToExcel = () => {
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
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Selected Colis");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `Selected_Colis_${moment().format('YYYYMMDD_HHmmss')}.xlsx`);
  };

  return (
    <div className={`colis-form-container ${theme === 'dark' ? 'dark-mode' : ''}`} style={{width:"100%", overflowX: 'auto'}}>
      {contextHolder}
      {/* Spinner for Global Loading */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        </div>
      )}
      {/* Action Bar */}
      <div className="bar-action-data" style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        <Button 
          icon={<IoMdRefresh />} 
          type="primary" 
          onClick={getDataColis} 
          style={{ marginRight: '8px' }}
        >
          Rafraîchir
        </Button>
        <Button 
          icon={<FaTicketAlt />} 
          type="primary" 
          onClick={handleBatchTickets}
        >
          Tickets
        </Button>
        <Button 
          icon={<FaDownload />} 
          type="default" 
          onClick={exportToExcel}
          disabled={state.selectedRowKeys.length === 0}
        >
          Exporter en Excel
        </Button>
      </div>

      {/* Search Input */}
      <Input
        placeholder="Recherche ..."
        value={state.searchTerm}
        onChange={handleSearch}
        style={{ marginBottom: '16px', width: "300px" }}
        size='large'
        suffix={<IoSearch />}
      />

      {/* Main Table with Loading */}
      <TableDashboard
        column={columns}
        data={state.filteredData}
        id="_id"
        theme={theme}
        rowSelection={{
          selectedRowKeys: state.selectedRowKeys,
          onChange: handleRowSelection,
        }}
        loading={loading} // Pass loading prop to TableDashboard
        scroll={{ x: 'max-content' }} // Added horizontal scroll for large number of columns
      />

      {/* Info Modal */}
      <Modal
        title="Détails du Colis"
        visible={state.infoModalVisible}
        onCancel={closeInfoModal}
        footer={null}
        className={theme === 'dark' ? 'dark-mode' : ''}
        width={'90%'}
      >
        {state.selectedColis && (
          <Descriptions
            bordered
            layout="vertical"
            className="responsive-descriptions"
          >
            <Descriptions.Item label="Code Suivi">
              <Col xs={24} sm={12} md={8}>
                {state.selectedColis.code_suivi}
              </Col>
            </Descriptions.Item>
            <Descriptions.Item label="Destinataire">
              <Col xs={24} sm={12} md={8}>
                {state.selectedColis.nom}
              </Col>
            </Descriptions.Item>
            <Descriptions.Item label="Téléphone">
              <Col xs={24} sm={12} md={8}>
                {state.selectedColis.tele}
              </Col>
            </Descriptions.Item>
            <Descriptions.Item label="Adresse">
              <Col xs={24} sm={12} md={8}>
                {state.selectedColis.adresse}
              </Col>
            </Descriptions.Item>
            <Descriptions.Item label="Ville">
              <Col xs={24} sm={12} md={8}>
                {state.selectedColis.ville?.nom || 'N/A'}
              </Col>
            </Descriptions.Item>
            <Descriptions.Item label="Business">
              <Col xs={24} sm={12} md={8}>
                {state.selectedColis.store?.storeName || 'N/A'}
              </Col>
            </Descriptions.Item>
            <Descriptions.Item label="Nature de Produit">
              <Col xs={24} sm={12} md={8}>
                {state.selectedColis.nature_produit || 'N/A'}
              </Col>
            </Descriptions.Item>
            <Descriptions.Item label="Prix (DH)">
              <Col xs={24} sm={12} md={8}>
                {state.selectedColis.prix}
              </Col>
            </Descriptions.Item>
            <Descriptions.Item label="Statut">
              <Col xs={24} sm={12} md={8}>
                <Badge status="processing" text={state.selectedColis.statut} />
              </Col>
            </Descriptions.Item>
            <Descriptions.Item label="Commentaire">
              <Col xs={24} sm={12} md={8}>
                {state.selectedColis.commentaire || 'N/A'}
              </Col>
            </Descriptions.Item>
            <Descriptions.Item label="Date de Création">
              <Col xs={24} sm={12} md={8}>
                {formatDate(state.selectedColis.createdAt)}
              </Col>
            </Descriptions.Item>
            <Descriptions.Item label="Dernière mise à jour">
              <Col xs={24} sm={12} md={8}>
                {formatDate(state.selectedColis.updatedAt)}
              </Col>
            </Descriptions.Item>
            {/* New Data Added */}
            <Descriptions.Item label="État">
              <Col xs={24} sm={12} md={8}>
                {state.selectedColis.etat ? 
                  <Tag color="success" icon={<CheckCircleOutlined />}>Payée</Tag> 
                  : 
                  <Tag color="error" icon={<CloseCircleOutlined />}>Non Payée</Tag>
                }
              </Col>
            </Descriptions.Item>

            <Descriptions.Item label="Prés payant">
              <Col xs={24} sm={12} md={8}>
                {state.selectedColis.pret_payant ? 
                  <Tag color="success" icon={<CheckCircleOutlined />}>Payée</Tag> 
                  : 
                  <Tag color="error" icon={<CloseCircleOutlined />}>Non Payée</Tag>
                }
              </Col>
            </Descriptions.Item>

            <Descriptions.Item label="Autres Options">
              <Col xs={24} sm={12} md={8}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  <Tag color={state.selectedColis.ouvrir ? 'green' : 'red'}>
                    Ouvrir: {state.selectedColis.ouvrir ? 'Oui' : 'Non'}
                  </Tag>
                  <Tag color={state.selectedColis.is_simple ? 'green' : 'red'}>
                    Is Simple: {state.selectedColis.is_simple ? 'Oui' : 'Non'}
                  </Tag>
                  <Tag color={state.selectedColis.is_remplace ? 'green' : 'red'}>
                    Is Remplace: {state.selectedColis.is_remplace ? 'Oui' : 'Non'}
                  </Tag>
                  <Tag color={state.selectedColis.is_fragile ? 'green' : 'red'}>
                    Is Fragile: {state.selectedColis.is_fragile ? 'Oui' : 'Non'}
                  </Tag>
                </div>
              </Col>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Reclamation Modal */}
      <Modal 
        title="Reclamation" 
        visible={state.reclamationModalVisible} 
        onOk={handleCreateReclamation} 
        className={theme === 'dark' ? 'dark-mode' : ''}
        onCancel={() => setState(prevState => ({ ...prevState, reclamationModalVisible: false }))}
      >
        <Input 
          placeholder="Sujet" 
          value={state.subject} 
          onChange={(e) => setState(prevState => ({ ...prevState, subject: e.target.value }))} 
          style={{ marginBottom: '10px' }} 
        />
        <Input.TextArea 
          placeholder="Message/Description" 
          value={state.message} 
          onChange={(e) => setState(prevState => ({ ...prevState, message: e.target.value }))} 
          rows={4} 
        />
      </Modal>

      {/* Ticket Modal */}
      <Modal 
        title="Ticket Colis" 
        visible={state.ticketModalVisible} 
        onCancel={handleCloseTicketModal} 
        footer={null} 
        width={600}
        className={theme === 'dark' ? 'dark-mode' : ''}
      >
        {state.selectedColis && (
          <div ref={componentRef}>
            <TicketColis colis={state.selectedColis} />
          </div>
        )}
      </Modal>

      {/* Tracking Drawer */}
      <Drawer 
        title="Les données de suivi du colis" 
        onClose={() => setState(prevState => ({ ...prevState, drawerOpen: false }))} 
        visible={state.drawerOpen}
        className={theme === 'dark' ? 'dark-mode' : ''}
      >
        {state.selectedColis && (
          <TrackingColis theme={theme} codeSuivi={state.selectedColis.code_suivi} />
        )}
      </Drawer>

      {/* Change Status Modal */}
      <Modal
        title={`Changer le Statut de ${state.selectedColis ? state.selectedColis.code_suivi : ''}`}
        visible={isStatusModalVisible}
        onOk={handleStatusOk}
        onCancel={handleStatusCancel}
        okText="Confirmer"
        cancelText="Annuler"
        className={theme === 'dark' ? 'dark-mode' : ''}
      >
        <Form form={form} layout="vertical" name="form_status">
          <Form.Item
            name="status"
            label="Nouveau Statut"
            rules={[{ required: true, message: 'Veuillez sélectionner un statut!' }]}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {allowedStatuses.map((status, index) => (
                <Tag.CheckableTag
                  key={index}
                  checked={statusType === status}
                  onChange={() => {
                    form.setFieldsValue({ status, comment: undefined, deliveryTime: undefined });
                    setStatusType(status);
                  }}
                  style={{ cursor: 'pointer' }}
                  color={getStatusTagColor(status)}
                >
                  {status}
                </Tag.CheckableTag>
              ))}
            </div>
          </Form.Item>

          {statusType && (statusComments[statusType] ? (
            <Form.Item
              name="comment"
              label="Commentaire"
              rules={[{ required: true, message: 'Veuillez sélectionner un commentaire!' }]}
            >
              <Select placeholder="Sélectionner un commentaire">
                {statusComments[statusType].map((comment, idx) => (
                  <Option key={idx} value={comment}>
                    {comment}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            <Form.Item
              name="comment"
              label="Commentaire"
            >
              <Input.TextArea placeholder="Ajouter un commentaire (facultatif)" rows={3} />
            </Form.Item>
          ))}

          {statusType === "Programmée" && (
            <Form.Item
              name="deliveryTime"
              label="Temps de Livraison"
              rules={[{ required: true, message: 'Veuillez sélectionner un temps de livraison!' }]}
            >
              <Select placeholder="Sélectionner un temps de livraison">
                <Option value="1 jours">Demain</Option>
                <Option value="2 jours">Dans 2 jours</Option>
                <Option value="3 jours">Dans 3 jours</Option>
                <Option value="4 jours">Dans 4 jours</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Assign Livreur Modal */}
      <Modal
        title={`Affecter un Livreur aux Colis Sélectionnés`}
        visible={assignModalVisible}
        onOk={handleConfirmAssignLivreur}
        onCancel={handleCancelAssignLivreur}
        okText="Affecter"
        cancelText="Annuler"
        width={"80vw"}
        confirmLoading={loadingAssign}
      >
        <div className='livreur_list_modal'>
          <h3>Livreurs Préférés</h3>
          <div className="livreur_list_modal_card" style={{ display: 'flex', flexWrap: 'wrap' }}>
            {filteredLivreurs.preferred.length ? filteredLivreurs.preferred.map(person => (
              <Card
                key={person._id}
                hoverable
                style={{
                  width: 240,
                  margin: '10px',
                  border:
                    assignSelectedLivreur && assignSelectedLivreur._id === person._id
                      ? '2px solid #1890ff'
                      : '1px solid #f0f0f0',
                }}
                onClick={() => selectAssignLivreur(person)}
              >
                <Card.Meta
                  title={<div>{person.username}</div>}
                  description={
                    <>
                      {person.tele}
                      <Button
                        icon={<BsFillInfoCircleFill />}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the card's onClick
                          toast.info(`Villes: ${person.villes.join(', ')}`);
                        }}
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
          <div className="livreur_list_modal_card" style={{ display: 'flex', flexWrap: 'wrap' }}>
            {filteredLivreurs.other.length ? filteredLivreurs.other.map(person => (
              <Card
                key={person._id}
                hoverable
                style={{
                  width: 240,
                  margin: '10px',
                  border:
                    assignSelectedLivreur && assignSelectedLivreur._id === person._id
                      ? '2px solid #1890ff'
                      : '1px solid #f0f0f0',
                }}
                onClick={() => selectAssignLivreur(person)}
              >
                <Card.Meta
                  title={<div>{person.username}</div>}
                  description={
                    <>
                      {person.tele}
                      <Button
                        icon={<BsFillInfoCircleFill />}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the card's onClick
                          toast.info(`Villes: ${person.villes.join(', ')}`);
                        }}
                        type='primary'
                        style={{ float: 'right' }}
                      />
                    </>
                  }
                />
              </Card>
            )) : <p>Aucun autre livreur disponible</p>}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ColisTable;
