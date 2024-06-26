import React, { useState, useEffect } from 'react';
import { Table, Modal, Divider , Select ,  Drawer, Steps } from 'antd';
import ColisData from '../../../../data/colis.json';
import { IoMdInformationCircleOutline } from "react-icons/io";
import { Si1001Tracklists } from "react-icons/si";
import { FaWhatsapp } from "react-icons/fa";
import { TbPhoneCall } from "react-icons/tb";

const options = [
  {
      id: 1,
      name: 'Annulée'
  },
  {
      id: 2,
      name: 'Chnager Prix'
  }
];

const ColisTable = ({ theme , darkStyle }) => {
  const [data, setData] = useState([]);
  const [reclamation, setReclamation] = useState('Type de reclamation');
  const [isModalReclamationOpen, setIsModalReclamationOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedColis, setSelectedColis] = useState(null);
  const [openDrawer , setOpenDrawer] = useState(false)

  const showDrawer = () => {
    setOpenDrawer(true);
  };

  const onClose = () => {
    setOpenDrawer(false);
  };

  const showModalReclamation = () => {
    setIsModalReclamationOpen(true);
  };

  const handleReclamationOk = () => {
    setIsModalReclamationOpen(false);
  };

  const handleReclamationCancel = () => {
    setIsModalReclamationOpen(false);
  };

  useEffect(() => {
    setData(ColisData);
  }, []);

  const columns = [
    {
      title: 'Code Suivi',
      dataIndex: 'code_suivi',
      key: 'code_suivi',
    },
    {
      title: 'Dernière Mise à Jour',
      dataIndex: 'derniere_mise_a_jour',
      key: 'derniere_mise_a_jour',
    },
    {
      title: 'Destinataire',
      dataIndex: 'destinataire',
      key: 'destinataire',
    },
    {
      title: 'Téléphone',
      dataIndex: 'telephone',
      key: 'telephone',
    },
    {
      title: 'État',
      dataIndex: 'etat',
      key: 'etat',
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
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (text, record) => (
        <span style={{ 
          backgroundColor: record.statut.trim() === 'Livrée' ? 'green' : '#4096ff', 
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
      key: 'date_livraison',
    },
    {
      title: 'Ville',
      dataIndex: 'ville',
      key: 'ville',
    },
    {
      title: 'Prix',
      dataIndex: 'prix',
      key: 'prix',
    },
    {
      title: 'Nature de Produit',
      dataIndex: 'nature_de_produit',
      key: 'nature_de_produit',
    },
    {
      title: 'Reclamations',
      key: 'reclamations',
      render: (text, record) => (
        <div className='table-reclamation'>
          <button className='btn-dashboard' onClick={showModalReclamation}>
            Reclamation
          </button>
          <div className='table-option'>
            <button className='btn-dashboard' onClick={() => handleInfo(record.id)}>
              <FaWhatsapp />
            </button>
            <button className='btn-dashboard' onClick={() => handleSuivi(record.id)}>
              <TbPhoneCall />
            </button>
          </div>
        </div>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'action',
      render: (text, record) => (
        <div className='table-option'>
          <button className='btn-dashboard' onClick={() => handleInfo(record.id)}>
            <IoMdInformationCircleOutline />
          </button>
          <button className='btn-dashboard' onClick={showDrawer}>
            <Si1001Tracklists />
          </button>
        </div>
      ),
    },
  ];

  const handleInfo = (id) => {
    const colis = data.find(item => item.id === id);
    setSelectedColis(colis);
    setIsInfoModalOpen(true);
  };

  const handleSuivi = (id) => {
    console.log('More options for record with id:', id);
  };
  const handleChangeReclamation = (selectedOption) => {
    setReclamation(selectedOption);
};

  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        className={theme === 'dark' ? 'table-dark' : 'table-light'}
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
              <p><strong>Code Suivi:</strong> {selectedColis.code_suivi}</p>
              <p><strong>Dernière Mise à Jour:</strong> {selectedColis.derniere_mise_a_jour}</p>
              <p><strong>Destinataire:</strong> {selectedColis.destinataire}</p>
              <p><strong>Téléphone:</strong> {selectedColis.telephone}</p>
              <p><strong>État:</strong> {selectedColis.etat ? 'Payée' : 'Non Payée'}</p>
              <p><strong>Statut:</strong> {selectedColis.statut}</p>
              <p><strong>Date de Livraison:</strong> {selectedColis.date_livraison}</p>
              <p><strong>Ville:</strong> {selectedColis.ville}</p>
              <p><strong>Prix:</strong> {selectedColis.prix}</p>
              <p><strong>Nature de Produit:</strong> {selectedColis.nature_de_produit}</p>
            </div>
          </>
        )}
      </Modal>
      <Drawer title="Les données de colis suivre" onClose={onClose} open={openDrawer}>
            <h4>
                Code de votre colis :
                <span></span>
            </h4>
            <Steps
                progressDot
                current={1}
                direction="vertical"
                items={[
                    {
                        title: 'Finished',
                        description: 'This is a description. This is a description.',
                    },
                    {
                        title: 'Finished',
                        description: 'This is a description. This is a description.',
                    },
                    {
                        title: 'In Progress',
                        description: 'This is a description. This is a description.',
                    },
                    {
                        title: 'Waiting',
                        description: 'This is a description.',
                    },
                    {
                        title: 'Waiting',
                        description: 'This is a description.',
                    },
                ]}
            />
      </Drawer>
    </>
  );
};

export default ColisTable;
