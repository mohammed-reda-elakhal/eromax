import React, { useState, useEffect, useRef } from 'react';
import { Table, Modal, Divider, Select, Drawer, Steps, Button } from 'antd';
//import ColisData from '../../../../data/colis.json';
import { IoMdInformationCircleOutline } from "react-icons/io";
import { Si1001Tracklists } from "react-icons/si";
import { FaWhatsapp, FaPrint , FaPenFancy } from "react-icons/fa";
import { TbPhoneCall } from "react-icons/tb";
import TicketColis from '../../tickets/TicketColis';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import TableDashboard from '../../../global/TableDashboard';
import { SearchOutlined } from '@ant-design/icons';
import { Input, Space } from 'antd';
import Highlighter from 'react-highlight-words';
import UpdateColis from './UpdateColis';
import { getColis, getColisForClient, getColisForLivreur } from '../../../../redux/apiCalls/colisApiCalls';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';


const options = [
  { id: 1, name: 'Annulée' },
  { id: 2, name: 'Changer Prix' },
];

const ColisTable = ({ theme, darkStyle ,search }) => {
  const [data, setData] = useState([]);
  const [selectedId , setSelectedId] = useState('')
  const [reclamation, setReclamation] = useState('Type de reclamation');
  const [isModalReclamationOpen, setIsModalReclamationOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedColis, setSelectedColis] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [drawerColisupdate , setDrawerColisupdate] = useState(false)
  const dispatch = useDispatch();
  const showDrawer = () => setOpenDrawer(true);
  const onClose = () => setOpenDrawer(false);
  const showModalReclamation = () => setIsModalReclamationOpen(true);
  const handleReclamationOk = () => setIsModalReclamationOpen(false);
  const handleReclamationCancel = () => setIsModalReclamationOpen(false);

//--------------------------------------------------------------------
/**
 * @Redux integration 
 * @method : GetColis for Admin @access : Admin Only
 * @method : GetColisForClinet for Client itself @access :Client  
 */
 const { colisData, user,store} = useSelector((state) => ({
  colisData: state.colis.colis || [],
  user: state.auth.user,
  store:state.auth.store
}));
useEffect(() => {

  if (user?.role) {
    if (user.role === "admin") {
      dispatch(getColis());
    } else if (user.role === "client"&&store?._id) {
      dispatch(getColisForClient(store._id));
    }else if (user.role === "livreur"){
      dispatch(getColisForLivreur(user._id))

    }
  }
  window.scrollTo(0, 0);
}, [dispatch, user?.role, store?._id,user._id]);
useEffect(() => {
  if (Array.isArray(colisData)) {
    setData(colisData);
  } else {
    setData([]); // Default to an empty array if colisData is not an array
  }
}, [colisData]);
//-------------------------------------------------------------------

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

  const handleSuivi = (id) => {
    console.log('More options for record with id:', id);
  };

  const handleChangeReclamation = (selectedOption) => {
    setReclamation(selectedOption);
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  

  const columnsColis = [
    { 
      title: 'Code Suivi', 
      dataIndex: 'code_suivi', 
      key: 'code_suivi' ,
      ...search('code_suivi'),
    },
    {
      title: 'Dernière Mise à Jour',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text) => formatDate(text), // Format using the function
    },
    { 
      title: 'Destinataire', 
      dataIndex: 'nom', 
      key: 'nom' ,
      ...search('nom'),
    },
    { 
      title: 'Téléphone', 
      dataIndex: 'tele', 
      key: 'tele' 
    },
    {
      title: 'État', dataIndex: 'etat', key: 'etat',
      render: (text, record) => (
        <span style={{
          backgroundColor: record.etat ? 'green' : '#4096ff',
          color: 'white',
          padding: '5px',
          borderRadius: '3px',
          display: 'inline-block',
          whiteSpace: 'pre-wrap',
          textAlign: 'center'
        }}>
          {record.etat ? 'Payée' : 'Non\nPayée'}
        </span>
      ),
    },
    {
      title: 'Statut', dataIndex: 'statut', key: 'statut',
      render: (text, record) => (
        <span style={{
          backgroundColor: record.statut.trim() === 'Livrée' ? 'green' :
            record.statut.trim() === 'Annulée' || record.statut.trim() === 'Refusée' ? 'red' :
              record.statut.trim() === 'En attente de ramassage' || record.statut.trim() === 'Ramassé' ? 'yellow' : '#4096ff',
          color: 'white',
          padding: '5px',
          borderRadius: '3px',
          display: 'inline-block',
          whiteSpace: 'pre-wrap',
          textAlign: 'center'
        }}>
          {record.statut}
        </span>
      ),
    },
    { 
      title: 'Date de Livraison', 
      dataIndex: 'date_livraison', 
      key: 'date_livraison' 
    },
    { 
      title: 'Ville', 
      dataIndex: 'ville', 
      key: 'ville' ,
      ...search('ville'),
    },
    { 
      title: 'Prix', 
      dataIndex: 'prix', 
      key: 'prix' ,
      ...search('prix'),
    },
    { 
      title: 'Nature de Produit', 
      dataIndex: 'nature_produit', 
      key: 'nature_produit' 
    },
    {
      title: 'Reclamations', key: 'reclamations',
      render: (text, record) => (
        <div className='table-reclamation'>
          <button className='btn-dashboard' onClick={showModalReclamation}>Reclamation</button>
          <div className='table-option'>
            <button className='btn-dashboard' onClick={() => handleInfo(record.id)}><FaWhatsapp /></button>
            <button className='btn-dashboard' onClick={() => handleSuivi(record.id)}><TbPhoneCall /></button>
          </div>
        </div>
      ),
    },
    {
      title: 'ACTIONS', key: 'action',
      render: (text, record) => (
        <div className='table-option'>
          <button className='btn-dashboard' onClick={() => handleInfo(record.id)}><IoMdInformationCircleOutline /></button>
          <button className='btn-dashboard' onClick={showDrawer}><Si1001Tracklists /></button>
          <button className='btn-dashboard' onClick={() => handleTicket(record.id)}><FaPrint /></button>
          <button className='btn-dashboard' onClick={()=>showUpdateColis(record.id)}><FaPenFancy /></button>
        </div>
      ),
    },
  ];
  const showUpdateColis = (id) => {
    const colis = data.find(item => item.id === id);
    setSelectedColis(colis);
    setDrawerColisupdate(true);
  };
  
  const CloseUpdateColis = () => {
    setDrawerColisupdate(false);
    setTimeout(() => {
      setSelectedColis(null);
    }, 200); // Reset selectedColis after closing drawer
  };
  


  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleDownloadPdf = () => {
    const input = componentRef.current; // Assuming componentRef is a ref to the single ticket component
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [450, 460] // Set the page size to 460px x 460px
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, 450, 460); // Add the image with the specified width and height
      pdf.save('ticket.pdf');
    });
  };

  return (
    <>
      <TableDashboard
        column={columnsColis}
        data={data}
        id="id"
      />
      <Modal
        title="Reclamation"
        open={isModalReclamationOpen}
        onOk={handleReclamationOk}
        onCancel={handleReclamationCancel}
      >
        <p>Nature de Reclamation ...</p>
        <Select
          className='select-reclamation'
          options={options.map(option => ({
            value: option.id,
            label: option.name
          }))}
          value={reclamation}
          onChange={handleChangeReclamation}
          placeholder="Reclamation"
          styles={theme === 'dark' ? darkStyle : {}}
        />
      </Modal>
      <Modal
        title="Info Colis"
        open={isInfoModalOpen}
        onCancel={() => setIsInfoModalOpen(false)}
        footer={null}
      >
        {selectedColis && (
          <>
            <Divider />
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
          </>
        )}
      </Modal>
      <Modal
        title="Ticket Colis"
        open={isTicketModalOpen}
        onCancel={() => setIsTicketModalOpen(false)}
        footer={null}
      >
        {selectedColis && (
          <>
            <Divider />
            <div
              ref={componentRef}
            >
              <TicketColis colis={selectedColis} />
            </div>
            <Button onClick={handlePrint}>Imprimer</Button>
            <Button onClick={handleDownloadPdf}>Télécharger Ticket PDF</Button>
          </>
        )}
      </Modal>
      <Drawer title="Les données de colis suivre" onClose={onClose} open={openDrawer}>
        <h4>Code de votre colis :<span></span></h4>
        <Steps
          progressDot
          current={1}
          direction="vertical"
          items={[
            { title: 'Finished', description: 'This is a description. This is a description.' },
            { title: 'Finished', description: 'This is a description. This is a description.' },
            { title: 'In Progress', description: 'This is a description. This is a description.' },
            { title: 'Waiting', description: 'This is a description.' },
            { title: 'Waiting', description: 'This is a description.' },
          ]}
        />
      </Drawer>

      <Drawer 
        title="Modifier données de Colis" 
        onClose={()=>CloseUpdateColis()} 
        open={drawerColisupdate}
        width={720}
      >
        <h4>Code de votre colis :<span></span></h4>
        <UpdateColis colis={selectedColis} />
      </Drawer>
    </>
  );
};

export default ColisTable;
