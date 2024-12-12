// ColisTable.js
import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Input, Drawer, Typography, Tag, Descriptions, Divider, Tooltip, Form, Select, message } from 'antd';
import { FaWhatsapp, FaPrint, FaPenFancy, FaTicketAlt, FaDownload, FaAmazonPay } from 'react-icons/fa';
import { Si1001Tracklists } from 'react-icons/si';
import { TbPhoneCall, TbTruckDelivery } from 'react-icons/tb';
import { IoSearch } from "react-icons/io5";
import { IoMdRefresh } from 'react-icons/io';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, MinusCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { useReactToPrint } from 'react-to-print';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FiRefreshCcw } from "react-icons/fi";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import TicketColis from '../../tickets/TicketColis';
import TableDashboard from '../../../global/TableDashboard';
import { getColis, getColisForClient, getColisForLivreur, setColisPayant, updateStatut } from '../../../../redux/apiCalls/colisApiCalls';
import { createReclamation } from '../../../../redux/apiCalls/reclamationApiCalls';
import TrackingColis from '../../../global/TrackingColis ';
import moment from 'moment';
import { BsBroadcast } from 'react-icons/bs';
import { MdDelete, MdOutlinePayment } from 'react-icons/md';

const { Text } = Typography;
const { Option } = Select;

const allowedStatuses = [
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
    loading: false,
  });

  // New states for Status Modal
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [statusType, setStatusType] = useState("");
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const phoneNumber = '+212664201873';

  const componentRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { colisData, user, store } = useSelector((state) => ({
    colisData: state.colis.colis || [],
    user: state.auth.user,
    store: state.auth.store,
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
      loading: false,
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
      }));
      setIsStatusModalVisible(false);
    }).catch(info => {
      console.log('Validation Failed:', info);
    });
  };

  const handleStatusCancel = () => {
    setIsStatusModalVisible(false);
    setStatusType("");
    form.resetFields();
  };

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
            <Tag icon={<FiRefreshCcw />}></Tag> : ""
          }
          <Typography.Text
            copyable
            style={{ width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {text}
          </Typography.Text>
         
          {
            record.expedation_type ==="ameex" ? 
            <p style={{color:"gray" , size:"10px"}}>{record.code_suivi_ameex}</p> : ""
          }
          <Divider/>
          <div className="expanded-actions" style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
            {user.role !== 'team' && user.role !== 'livreur' && user.role !== 'admin' && (
              <Tooltip title="Contact via WhatsApp">
                <Button 
                  type="primary" 
                  icon={<FaWhatsapp />} 
                  onClick={() => {
                    // Constructing the message
                    const message = `Bonjour, je suis ${user.nom} ${user.prenom}, j'ai besoin de discuter pour le colis de code ${text}.`;
                    
                    // Ensure the message is properly URL-encoded
                    const encodedMessage = encodeURIComponent(message);
                    
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
            )}
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
      title: 'Bussness',
      dataIndex: 'store',
      key: 'store',
      render : (text , record) => (
        <strong>{record.store?.storeName}</strong>
      )
    },
    {
      title: 'Destinataire',
      dataIndex: 'nom',
      key: 'nom',
      ...search('nom'),
    },
    {
      title: 'Téléphone',
      dataIndex: 'tele',
      key: 'tele',
      ...search('tele'),
      render: (text) => {
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
              <Typography.Text style={{ color: 'red', fontWeight: 'bold', cursor: 'pointer' }}>
                {text}
              </Typography.Text>
            </Tooltip>
          );
        }
        return (
          <Typography.Text style={{ color: 'green', fontWeight: 'bold' }}>
            {text}
          </Typography.Text>
        );
      },
    },
    {
      title: 'Ville',
      dataIndex: ['ville', 'nom'],
      key: 'ville',
      ...search('ville'),
    },
    {
      title: 'Adresse',
      dataIndex: 'adresse',
      key: 'adresse',
    },
    {
      title: 'Prix (DH)',
      dataIndex: 'prix',
      key: 'prix',
      ...search('prix'),
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
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
      title: 'Options',
      render: (text, record) => (
        <div className="expanded-actions" style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
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
            <Tooltip title="colis et deja payant">
              <Button 
                type="primary" 
                onClick={() => dispatch(setColisPayant(record._id))} 
                style={{
                  backgroundColor: 'green',
                  borderColor: 'green',
                  color: '#fff'
                }}
                icon={<MdOutlinePayment />}
              >
              </Button>
            </Tooltip>
          )}
          <Tooltip title="supremer colis">
            <Button 
              type="danger" 
              onClick={() => dispatch(setColisPayant(record._id))} 
              style={{
                backgroundColor: '#dc3545',
                borderColor: '#dc3545',
                color: '#fff'
              }}
              icon={<MdDelete />}
            >
            </Button>
          </Tooltip>
        </div>
      ),
    }
  ];

  const expandedRowRender = (record) => (
    <div style={{ padding: '10px 20px' }}>
      <Descriptions title="Detail de Colis" bordered size="small" column={1} style={{ marginBottom: '20px' }}>
        <Descriptions.Item label="Dernière Mise à Jour">{formatDate(record.updatedAt)}</Descriptions.Item>
        <Descriptions.Item label="Commentaire">{record.commentaire || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Nature de Produit">{record.nature_produit || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="État">
          {record.etat ? <Tag color="success" icon={<CheckCircleOutlined />}>Payée</Tag> : <Tag color="error" icon={<CloseCircleOutlined />}>Non Payée</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="Prés payant">
          {record.pret_payant ? <Tag color="success" icon={<CheckCircleOutlined />}>Payée</Tag> : <Tag color="error" icon={<CloseCircleOutlined />}>Non Payée</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="Ouvrir">{record.ouvrir ? 'Oui' : 'Non'}</Descriptions.Item>
        <Descriptions.Item label="Is Simple">{record.is_simple ? 'Oui' : 'Non'}</Descriptions.Item>
        <Descriptions.Item label="Is Remplace">{record.is_remplace ? 'Oui' : 'Non'}</Descriptions.Item>
        <Descriptions.Item label="Is Fragile">{record.is_fragile ? 'Oui' : 'Non'}</Descriptions.Item>
        <Descriptions.Item label="Date de Création">{formatDate(record.createdAt)}</Descriptions.Item>
      </Descriptions>

      {
        record.replacedColis 
        ?
        <Descriptions title="Colis Remplacée" bordered size="small" column={1} style={{ marginBottom: '20px' }}>
          <Descriptions.Item label="Code suivi">{record?.replacedColis?.code_suivi || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Ville">{record?.replacedColis?.ville?.nom || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Prix">{record?.replacedColis?.prix || 'N/A'}</Descriptions.Item>
        </Descriptions>
        : ""
      }

      <Descriptions title="Information de Bussness" bordered size="small" column={1} style={{ marginBottom: '20px' }}>
        <Descriptions.Item label="Store Name">{record.store?.storeName || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Adresse">{record.store?.adress || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Téléphone">{record.store?.tele || 'N/A'}</Descriptions.Item>
      </Descriptions>

      <Descriptions title="Livreur" bordered size="small" column={1} style={{ marginBottom: '20px' }}>
        <Descriptions.Item label="Livreur">
          {record.livreur ? `${record.livreur.nom} - ${record.livreur.tele}` : <Tag icon={<ClockCircleOutlined />} color="default">Operation de Ramassage</Tag>}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );

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
      toast.error("Please fill in all the fields.");
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
      toast.error("Please select at least one colis.");
      return;
    }
    navigate('/dashboard/tickets', { state: { selectedColis: state.selectedRows } });
  };

  // Export to Excel Function
  const exportToExcel = () => {
    const { selectedRows } = state;

    if (selectedRows.length === 0) {
      toast.error("Please select at least one colis to export.");
      return;
    }

    const dataToExport = selectedRows.map(colis => ({
      "Code Suivi": colis.code_suivi,
      "Destinataire": colis.nom,
      "Téléphone": colis.tele,
      "Ville": colis.ville?.nom || 'N/A',
      "Adresse": colis.adresse || 'N/A',
      "Prix (DH)": colis.prix,
      "Nature de Produit": colis.nature_produit
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Selected Colis");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `Selected_Colis_${moment().format('YYYYMMDD_HHmmss')}.xlsx`);
  };

  return (
    <div className={`colis-form-container ${theme === 'dark' ? 'dark-mode' : ''}`} style={{width:"max-content"}}>
      {contextHolder}
      {/* Action Bar */}
      <div className="bar-action-data" style={{ marginBottom: '16px', display: 'flex', gap: '8px' , width:'max-content' }}>
        <Button 
          icon={<IoMdRefresh />} 
          type="primary" 
          onClick={getDataColis} 
          style={{ marginRight: '8px' }}
        >
          Refresh
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
          Export to Excel
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

      {/* Main Table with Expandable Rows */}
      <TableDashboard
        column={columns}
        data={state.filteredData}
        id="_id"
        theme={theme}
        rowSelection={{
          selectedRowKeys: state.selectedRowKeys,
          onChange: handleRowSelection,
        }}
        expandable={{
          expandedRowRender: expandedRowRender,
          rowExpandable: (record) => true,
        }}
      />

      {/* Reclamation Modal */}
      <Modal 
        title="Reclamation" 
        visible={state.reclamationModalVisible} 
        onOk={handleCreateReclamation} 
        className={theme === 'dark' ? 'dark-mode' : ''}
        onCancel={() => setState(prevState => ({ ...prevState, reclamationModalVisible: false }))}
      >
        <Input 
          placeholder="Subject" 
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
        title="Les données de colis suivre" 
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
    </div>
  );
};

export default ColisTable;
