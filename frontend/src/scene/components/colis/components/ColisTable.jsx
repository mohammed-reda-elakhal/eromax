import React, { useState, useEffect, useRef } from 'react';
import { Table, Modal, Divider, Select, Drawer, Steps, Button, Input, Space } from 'antd';
import { IoMdInformationCircleOutline } from "react-icons/io";
import { Si1001Tracklists } from "react-icons/si";
import { FaWhatsapp, FaPrint , FaPenFancy } from "react-icons/fa";
import { TbPhoneCall } from "react-icons/tb";
import TicketColis from '../../tickets/TicketColis';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Highlighter from 'react-highlight-words';
import UpdateColis from './UpdateColis';
import { getColis, getColisForClient, getColisForLivreur } from '../../../../redux/apiCalls/colisApiCalls';
import { SearchOutlined } from '@ant-design/icons';
import TableDashboard from '../../../global/TableDashboard';

const options = [
  { id: 1, name: 'Annulée' },
  { id: 2, name: 'Changer Prix' },
];

const ColisTable = ({ theme, darkStyle, search }) => {
  const [data, setData] = useState([]);
  const [selectedColis, setSelectedColis] = useState(null);
  const [isModalReclamationOpen, setIsModalReclamationOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [drawerColisUpdate, setDrawerColisUpdate] = useState(false);
  const [reclamation, setReclamation] = useState('Type de reclamation');

  const dispatch = useDispatch();
  const { colisData, user, store } = useSelector((state) => ({
    colisData: state.colis.colis || [],
    user: state.auth.user,
    store: state.auth.store,
  }));

  useEffect(() => {
    if (user?.role) {
      if (user.role === "admin") {
        dispatch(getColis(""));
      } else if (user.role === "client" && store?._id) {
        dispatch(getColisForClient(store._id, ""));
      } else if (user.role === "livreur") {
        dispatch(getColisForLivreur(user._id,""));
      }
    }
  }, [dispatch, user?.role, store?._id, user._id]);

  useEffect(() => {
    if (Array.isArray(colisData)) {
      setData(colisData);
    } else {
      setData([]);
    }
  }, [colisData]);

  const handleInfo = (id) => {
    const colis = data.find(item => item.id === id);
    setSelectedColis(colis);
    setIsInfoModalOpen(true);
  };

  const handleTicket = (id) => {
    const colis = data.find(item => item.id === id);
    setSelectedColis(colis);
    setIsTicketModalOpen(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const columnsColis = [
    { title: 'Code Suivi', dataIndex: 'code_suivi', key: 'code_suivi', ...search('code_suivi') },
    { title: 'Dernière Mise à Jour', dataIndex: 'updatedAt', key: 'updatedAt', render: (text) => formatDate(text) },
    { title: 'Destinataire', dataIndex: 'nom', key: 'nom', ...search('nom') },
    { title: 'Téléphone', dataIndex: 'tele', key: 'tele' },
    { 
      title: 'État', 
      dataIndex: 'etat', 
      key: 'etat', 
      render: (text, record) => (
        <span style={{ backgroundColor: record.etat ? 'green' : '#4096ff', color: 'white', padding: '5px', borderRadius: '3px' }}>
          {record.etat ? 'Payée' : 'Non Payée'}
        </span>
      )
    },
    { 
      title: 'Statut', 
      dataIndex: 'statut', 
      key: 'statut', 
      render: (text, record) => (
        <span style={{
          backgroundColor: record.statut.trim() === 'Livrée' ? 'green' :
            record.statut.trim() === 'Annulée' || record.statut.trim() === 'Refusée' ? 'red' :
            'yellow',
          color: 'white', padding: '5px', borderRadius: '3px'
        }}>
          {record.statut}
        </span>
      )
    },
    { title: 'Date de Livraison', dataIndex: 'date_livraison', key: 'date_livraison' },
    { title: 'Ville', dataIndex: 'ville', key: 'ville', ...search('ville') },
    { title: 'Prix', dataIndex: 'prix', key: 'prix', ...search('prix') },
    { title: 'Nature de Produit', dataIndex: 'nature_produit', key: 'nature_produit' },
    {
      title: 'Reclamations',
      key: 'reclamations',
      render: (text, record) => (
        <div className='table-reclamation'>
          <button className='btn-dashboard' onClick={() => setIsModalReclamationOpen(true)}>Reclamation</button>
          <div className='table-option'>
            <button className='btn-dashboard' onClick={() => handleInfo(record.id)}><FaWhatsapp /></button>
            <button className='btn-dashboard' onClick={() => console.log('More options for record with id:', record.id)}><TbPhoneCall /></button>
          </div>
        </div>
      )
    },
    {
      title: 'ACTIONS',
      key: 'action',
      render: (text, record) => (
        <div className='table-option'>
          <button className='btn-dashboard' onClick={() => handleInfo(record.id)}><IoMdInformationCircleOutline /></button>
          <button className='btn-dashboard' onClick={() => setOpenDrawer(true)}><Si1001Tracklists /></button>
          <button className='btn-dashboard' onClick={() => handleTicket(record.id)}><FaPrint /></button>
          {user.role !== 'client' && ( // Conditionally render the update button
            <button className='btn-dashboard' onClick={() => setDrawerColisUpdate(true)}><FaPenFancy /></button>
          )}
        </div>
      )
    }
    
  ];

  const componentRef = useRef();
  const handlePrint = useReactToPrint({ content: () => componentRef.current });

  const handleDownloadPdf = () => {
    const input = componentRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [450, 460] });
      pdf.addImage(imgData, 'PNG', 0, 0, 450, 460);
      pdf.save('ticket.pdf');
    });
  };

  return (
    <>
      <TableDashboard column={columnsColis} data={data} id="id" />
      
      <Modal title="Reclamation" open={isModalReclamationOpen} onOk={() => setIsModalReclamationOpen(false)} onCancel={() => setIsModalReclamationOpen(false)}>
        <p>Nature de Reclamation ...</p>
        <Select
          className='select-reclamation'
          options={options.map(option => ({ value: option.id, label: option.name }))}
          value={reclamation}
          onChange={setReclamation}
          placeholder="Reclamation"
          styles={theme === 'dark' ? darkStyle : {}}
        />
      </Modal>

      <Modal title="Info Colis" open={isInfoModalOpen} onCancel={() => setIsInfoModalOpen(false)} footer={null}>
        {selectedColis && (
          <div className='colis-info-content'>
            <p><strong>Code Suivi:</strong> {selectedColis['code-suivi']}</p>
            <p><strong>Dernière Mise à Jour:</strong> {selectedColis['updated-at']}</p>
            <p><strong>Destinataire:</strong> {selectedColis.nom}</p>
            <p><strong>Téléphone:</strong> {selectedColis.tele}</p>
            <p><strong>État:</strong> {selectedColis.etat ? 'Payée' : 'Non Payée'}</p>
            <p><strong>Statut:</strong> {selectedColis.statut}</p>
            <p><strong>Date de Livraison:</strong> {selectedColis['date_livraison']}</p>
            <p><strong>Ville:</strong> {selectedColis.ville}</p>
            <p><strong>Prix:</strong> {selectedColis.prix}</p>
            <p><strong>Nature de Produit:</strong> {selectedColis['nature_produit']}</p>
          </div>
        )}
      </Modal>

      <Modal title="Ticket Colis" open={isTicketModalOpen} onCancel={() => setIsTicketModalOpen(false)} footer={null}>
        {selectedColis && (
          <div ref={componentRef}>
            <TicketColis colis={selectedColis} />
            <Button onClick={handlePrint}>Imprimer</Button>
            <Button onClick={handleDownloadPdf}>Télécharger Ticket PDF</Button>
          </div>
        )}
      </Modal>

      <Drawer title="Les données de colis suivre" onClose={() => setOpenDrawer(false)} open={openDrawer}>
        <Steps
          progressDot
          current={1}
          direction="vertical"
          items={[
            { title: 'Finished', description: 'Description 1' },
            { title: 'Finished', description: 'Description 2' },
            { title: 'In Progress', description: 'Description 3' },
            { title: 'Waiting', description: 'Description 4' },
          ]}
        />
      </Drawer>

      <Drawer title="Modifier données de Colis" onClose={() => setDrawerColisUpdate(false)} open={drawerColisUpdate} width={720}>
        {selectedColis && <UpdateColis colis={selectedColis} />}
      </Drawer>
    </>
  );
};

export default ColisTable;
