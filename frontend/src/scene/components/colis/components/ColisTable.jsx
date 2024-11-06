// ColisTable.js
import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Input, Drawer, Typography, Tag, Descriptions, Divider } from 'antd';
import { FaWhatsapp, FaPrint, FaPenFancy, FaTicketAlt } from 'react-icons/fa';
import { Si1001Tracklists } from 'react-icons/si';
import { TbPhoneCall } from 'react-icons/tb';
import { IoSearch } from "react-icons/io5";
import { IoMdRefresh } from 'react-icons/io';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { useReactToPrint } from 'react-to-print';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FiRefreshCcw } from "react-icons/fi";
import TicketColis from '../../tickets/TicketColis';
import TableDashboard from '../../../global/TableDashboard';
import { getColis, getColisForClient, getColisForLivreur } from '../../../../redux/apiCalls/colisApiCalls';
import { createReclamation } from '../../../../redux/apiCalls/reclamationApiCalls';
import TrackingColis from '../../../global/TrackingColis ';

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

  // Define important columns for the main table
  const columnsColis = [
    {
      title: 'Code Suivi',
      dataIndex: 'code_suivi',
      key: 'code_suivi',
      width: 200,
      render: (text , record) => (
        <>
           {
            record.replacedColis ? 
            <Tag icon={<FiRefreshCcw />}>
            </Tag>
            :
            ""
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
        </>
      ),
    },
    {
      title: 'Destinataire',
      dataIndex: 'nom',
      key: 'nom',
    },
    {
      title: 'Téléphone',
      dataIndex: 'tele',
      key: 'tele',
    },
    {
      title: 'Ville',
      dataIndex: ['ville', 'nom'],
      key: 'ville',
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
      render: (status) => {
        switch (status) {
          case 'Livrée':
            return <Tag icon={<CheckCircleOutlined />} color="success">{status}</Tag>;
          case 'Annulée':
          case 'Refusée':
            return <Tag icon={<CloseCircleOutlined />} color="error">{status}</Tag>;
          case 'Programme':
            return <Tag icon={<ClockCircleOutlined />} color="default">Programme</Tag>;
          case 'Remplacée':
            return <Tag icon={<ExclamationCircleOutlined  />} color="warning">{status}</Tag>;
          default:
            return <Tag icon={<SyncOutlined spin />} color="processing">{status}</Tag>;
        }
      },
    },
  ];

 // Define expandable content with three segments
 const expandedRowRender = (record) => (
  <div style={{ padding: '10px 20px' }}>
    {/* Colis Data Segment */}
    <Descriptions title="Detail de Colis" bordered size="small" column={1} style={{ marginBottom: '20px' }}>
      <Descriptions.Item label="Dernière Mise à Jour">{formatDate(record.updatedAt)}</Descriptions.Item>
      <Descriptions.Item label="Commentaire">{record.commentaire || 'N/A'}</Descriptions.Item>
      <Descriptions.Item label="Nature de Produit">{record.nature_produit || 'N/A'}</Descriptions.Item>
      <Descriptions.Item label="État">
        {record.etat ? <Tag color="success" icon={<CheckCircleOutlined />}>Payée</Tag> : <Tag color="error" icon={<CloseCircleOutlined />}>Non Payée</Tag>}
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
      :
      ""

    }

    {/* Store Data Segment */}
    <Descriptions title="Information de Bussness" bordered size="small" column={1} style={{ marginBottom: '20px' }}>
      <Descriptions.Item label="Store Name">{record.store?.storeName || 'N/A'}</Descriptions.Item>
      <Descriptions.Item label="Adresse">{record.store?.adress || 'N/A'}</Descriptions.Item>
      <Descriptions.Item label="Téléphone">{record.store?.tele || 'N/A'}</Descriptions.Item>
    </Descriptions>

    {/* Livreur Data Segment */}
    <Descriptions title="Livreur" bordered size="small" column={1} style={{ marginBottom: '20px' }}>
      <Descriptions.Item label="Livreur">
        {record.livreur ? `${record.livreur.nom} - ${record.livreur.tele}` : <Tag icon={<ClockCircleOutlined />} color="default">Operation de Ramassage</Tag>}
      </Descriptions.Item>
    </Descriptions>

    {/* Action Buttons */}
    <div className="expanded-actions" style={{ marginTop: '10px' }}>
      {user.role !== 'team' && user.role !== 'livreur' && user.role !== 'admin' && (
        <Button 
          type="primary" 
          icon={<FaWhatsapp />} 
          onClick={() => handleInfo(record._id)} 
          style={{ marginRight: '8px' }}
        >
          Info
        </Button>
      )}
      <Button 
        type="primary" 
        icon={<TbPhoneCall />} 
        onClick={() => console.log('More options for record with id:', record._id)} 
        style={{ marginRight: '8px' }}
      >
        Call
      </Button>
      <Button 
        type="primary" 
        icon={<Si1001Tracklists />} 
        onClick={() => setState(prevState => ({ ...prevState, drawerOpen: true, selectedColis: record }))}
        style={{ marginRight: '8px' }}
      >
        Track
      </Button>
      <Button 
        type="primary" 
        icon={<FaPrint />} 
        onClick={() => handleTicket(record)} 
        style={{ marginRight: '8px' }}
      >
        Print
      </Button>
      {user.role !== 'client' && user.role !== 'livreur' && (
        <Button 
          type="primary" 
          icon={<FaPenFancy />} 
          onClick={() => navigate(`/dashboard/colis/update/${record.code_suivi}`)}
          style={{ marginRight: '8px' }}
        >
          Edit
        </Button>
      )}
      {
        user?.role === "client" && (
          <Button 
            type="primary" 
            onClick={() => openReclamationModal(record)} 
          >
            Reclamation
          </Button>
        )
      }
    </div>
  </div>
);

  // Columns for main table
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

  return (
    <>
      {/* Action Bar */}
      <div className="bar-action-data" style={{ marginBottom: '16px' }}>
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
      </div>

      {/* Search Input */}
      <Input
        placeholder="Recherche ..."
        value={state.searchTerm}
        onChange={handleSearch}
        style={{ marginBottom: '16px', width: "50%" }}
        size='large'
        suffix={<IoSearch />}
      />

      {/* Main Table with Expandable Rows */}
      <TableDashboard
        column={columns}
        data={state.filteredData}
        id="_id"
        onSelectChange={handleRowSelection}
        expandable={{
          expandedRowRender: expandedRowRender,
          rowExpandable: (record) => true, // Allow all rows to be expandable
        }}
      />

      {/* Reclamation Modal */}
      <Modal 
        title="Reclamation" 
        visible={state.reclamationModalVisible} 
        onOk={handleCreateReclamation} 
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
      >
        {
        state.selectedColis && (
          <TrackingColis codeSuivi={state.selectedColis.code_suivi} /> 
        )
      
        }
      </Drawer>
    </>
  );
};

export default ColisTable;
