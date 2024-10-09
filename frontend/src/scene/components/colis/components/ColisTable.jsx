import React, { useState, useEffect, useRef } from 'react';
import { Table, Modal, Button, Input, Drawer, Steps } from 'antd';
import { FaWhatsapp, FaPrint, FaPenFancy } from 'react-icons/fa';
import { Si1001Tracklists } from 'react-icons/si';
import { TbPhoneCall } from 'react-icons/tb';
import TicketColis from '../../tickets/TicketColis';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getColis, getColisForClient, getColisForLivreur } from '../../../../redux/apiCalls/colisApiCalls';
import { createReclamation } from '../../../../redux/apiCalls/reclamationApiCalls';
import TableDashboard from '../../../global/TableDashboard';

const ColisTable = ({ theme, darkStyle, search }) => {
  const [state, setState] = useState({
    data: [],
    selectedRowKeys: [],
    selectedRows: [],
    selectedColis: null,
    reclamationModalVisible: false,
    infoModalVisible: false,
    ticketModalVisible: false,
    drawerOpen: false,
    drawerColisUpdate: false,
    reclamationType: 'Type de reclamation',
    subject: '',
    message: '',
    loading: false,
  });

  const componentRef = useRef();
  const dispatch = useDispatch();
  
  const { colisData, user, store } = useSelector((state) => ({
    colisData: state.colis.colis || [],
    user: state.auth.user,
    store: state.auth.store,
  }));

  // Load data based on user role
  useEffect(() => {
    if (user?.role) {
      if (user.role === 'admin') {
        dispatch(getColis(''));
      } else if (user.role === 'client') {
        dispatch(getColisForClient(store._id, ''));
      } else if (user.role === 'livreur') {
        dispatch(getColisForLivreur(user._id, ''));
      }else if (user.role === 'team') {
        dispatch(getColisForClient(user._id, ''));
      }
    }
  }, [dispatch, user?.role, store?._id, user._id]);

  // Update state data when colisData changes
  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      data: Array.isArray(colisData) ? colisData : [],
    }));
  }, [colisData]);

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
    const selectedColis = state.data.find(item => item.id === id);
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

  // Columns definition
  const columnsColis = [
    { title: 'Code Suivi', dataIndex: 'code_suivi', key: 'code_suivi', ...search('code_suivi') },
    { 
      title: 'Livreur', 
      dataIndex: 'livreur', 
      key: 'livreur', 
      render: (text, record) => (
        <span>{record.livreur ? record.livreur.nom + ' - ' + record.livreur.tele : 'Operation de Ramassage'}</span> // Check if 'livreur' exists, otherwise show default message
      )
    },
    { title: 'Dernière Mise à Jour', dataIndex: 'updatedAt', key: 'updatedAt', render: formatDate },
    { title: 'Destinataire', dataIndex: 'nom', key: 'nom', ...search('nom') },
    { title: 'Téléphone', dataIndex: 'tele', key: 'tele' },
    { title: 'État', dataIndex: 'etat', key: 'etat', render: (text, record) => (
        <span className={record.etat ? 'paid' : 'unpaid'}>
          {record.etat ? 'Payée' : 'Non Payée'}
        </span>
      ),
    },
    { title: 'Statut', dataIndex: 'statut', key: 'statut', render: (text, record) => (
        <span className={record.statut.trim() === 'Livrée' ? 'status-delivered' : record.statut.trim() === 'Annulée' || record.statut.trim() === 'Refusée' ? 'status-cancelled' : 'status-pending'}>
          {record.statut}
        </span>
      ),
    },
    { title: 'Date de Livraison', dataIndex: 'date_livraison', key: 'date_livraison' },
    { title: 'Ville', dataIndex: 'ville', key: 'ville', render: (text, record) => <span>{record.ville.nom}</span> },
    { title: 'Tarif (DH)', dataIndex: 'ville', key: 'ville', render: (text, record) => <span>{record.ville.tarif}</span> },

    { title: 'Prix (DH)', dataIndex: 'prix', key: 'prix', ...search('prix') },
    { title: 'Nature de Produit', dataIndex: 'nature_produit', key: 'nature_produit' },
    {
      title: 'Reclamations',
      key: 'reclamations',
      render: (_, record) => (
        <div className="table-reclamation">
           {user.role !== 'team' && user.role !== 'livreur' && user.role !== 'admin' && (
            <button className="btn-dashboard" onClick={() => openReclamationModal(record)}>
              Reclamation
            </button>
           )}
          <div className="table-option">
            <button className="btn-dashboard" onClick={() => handleInfo(record.id)}><FaWhatsapp /></button>
            <button className="btn-dashboard" onClick={() => console.log('More options for record with id:', record.id)}><TbPhoneCall /></button>
          </div>
        </div>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'action',
      render: (_, record) => (
        <div className="table-option">
          <button className="btn-dashboard" onClick={() => setState({ ...state, drawerOpen: true })}>
            <Si1001Tracklists />
          </button>
          <button className="btn-dashboard" onClick={() => handleTicket(record)}>
            <FaPrint />
          </button>
          {user.role !== 'client' && user.role !== 'livreur' && (
            <button className="btn-dashboard" onClick={() => setState({ ...state, drawerColisUpdate: true })}>
              <FaPenFancy />
            </button>
          )}
        </div>
      ),
    }
    
  ];
  

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
    setState({ ...state, reclamationModalVisible: false, subject: '', message: '' });
  };

  const handleCloseTicketModal = () => {
    setState({ ...state, ticketModalVisible: false, selectedColis: {} });
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Ticket-${state.selectedColis?.code_suivi}`,
  });

  const handleDownloadPdf = () => {
    const input = componentRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [450, 460] });
      pdf.addImage(imgData, 'PNG', 0, 0, 450, 460);
      pdf.save(`Ticket-${state.selectedColis?.code_suivi}.pdf`);
    });
  };

  return (
    <>
      <TableDashboard column={columnsColis} data={state.data} id="_id" onSelectChange={handleRowSelection} />
      
      <Modal title="Reclamation" open={state.reclamationModalVisible} onOk={handleCreateReclamation} onCancel={() => setState({ ...state, reclamationModalVisible: false })}>
        <Input placeholder="Subject" value={state.subject} onChange={(e) => setState({ ...state, subject: e.target.value })} style={{ marginBottom: '10px' }} />
        <Input.TextArea placeholder="Message/Description" value={state.message} onChange={(e) => setState({ ...state, message: e.target.value })} rows={4} />
      </Modal>

      <Modal title="Ticket Colis" open={state.ticketModalVisible} onCancel={handleCloseTicketModal} footer={null} width={600}>
        {state.selectedColis && <div ref={componentRef}><TicketColis colis={state.selectedColis} /></div>}
        <Button onClick={handleDownloadPdf} style={{ marginLeft: '10px' }}>Télécharger en PDF</Button>
      </Modal>

      <Drawer title="Les données de colis suivre" onClose={() => setState({ ...state, drawerOpen: false })} open={state.drawerOpen}>
        <Steps progressDot current={1} direction="vertical" items={[{ title: 'Finished', description: 'Description 1' }, { title: 'Finished', description: 'Description 2' }, { title: 'In Progress', description: 'Description 3' }, { title: 'Waiting', description: 'Description 4' }]} />
      </Drawer>

     
    </>
  );
};

export default ColisTable;
