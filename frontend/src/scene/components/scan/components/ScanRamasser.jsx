// src/scene/components/scan/components/ScanRamasser.jsx

import React, { useContext, useState, useEffect, useRef } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import './ScanRamasser.css';
import { Input, Button, Table, Space, notification, Modal, Card, message } from 'antd';
import { CiBarcode } from "react-icons/ci";
import { CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import request from '../../../../utils/request';
import { toast } from 'react-toastify';
import { getLivreurList } from '../../../../redux/apiCalls/livreurApiCall';

function ScanRamasser() {
  const { theme } = useContext(ThemeContext);
  const { statu } = useParams();

  // State local
  const [scannedItems, setScannedItems] = useState([]);
  const [currentBarcode, setCurrentBarcode] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLivreur, setSelectedLivreur] = useState(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Sélecteurs Redux
  const { livreurList } = useSelector(state => ({
    livreurList: state.livreur.livreurList,
  }));

  // Référence pour empêcher le traitement multiple des scans
  const isProcessingScan = useRef(false);

  // Récupérer la liste des livreurs au montage
  useEffect(() => {
    dispatch(getLivreurList());
  }, [dispatch]);

  // Handler pour supprimer un colis scanné par code-barres
  const handleRemoveScannedColis = (barcode) => {
    setScannedItems(prev => prev.filter(item => item.barcode !== barcode));
  };

  // Définition des colonnes pour la table
  const columns = [
    { title: 'Code Suivi', dataIndex: 'barcode', key: 'barcode' },
    { title: 'Statut', dataIndex: 'status', key: 'status' },
    { title: 'Ville', dataIndex: 'ville', key: 'ville' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveScannedColis(record.barcode)}
        >
          Supprimer
        </Button>
      ),
    },
  ];

  // Fonction pour gérer le scan (depuis le champ Input)
  const handleScan = (scannedCode) => {
    if (!scannedCode || isProcessingScan.current) {
        return;
    }
    isProcessingScan.current = true;

    fetchColisByCodeSuivi(scannedCode);

    setTimeout(() => {
      isProcessingScan.current = false;
    }, 500);
  };

  // Fonction pour récupérer les détails du colis
  const fetchColisByCodeSuivi = async (barcode) => {
    if (scannedItems.some(item => item.barcode === barcode)) {
      notification.warning({
        message: 'Code Suivi déjà scanné',
        description: 'Ce code a déjà été scanné.',
      });
      return;
    }

    try {
      const response = await request.get(`/api/colis/code_suivi/${barcode}`);
      const colisData = response.data;

      const requiredStatusMap = {
        'Ramassée': ['attente de ramassage'],
        'Expediée': ['Ramassée'],
        'Reçu': ['Expediée'],
        'Mise en Distribution': ['Reçu'],
        'Livrée': ['Mise en Distribution'],
        'Fermée': ['En Retour'],
        'En Retour': ['Reçu', 'Annulée', 'Refusée', 'Remplacée'],
      };

      const requiredStatuses = requiredStatusMap[statu];

      if (!requiredStatuses) {
        notification.error({
          message: 'Statut inconnu',
          description: `Le statut "${statu}" n'est pas reconnu.`,
        });
        return;
      }

      if (!requiredStatuses.includes(colisData.statut)) {
        notification.warning({
          message: 'Statut de colis invalide',
          description: `Seuls les colis avec le statut "${requiredStatuses.join(' ou ')}" peuvent être scannés pour "${statu}".`,
        });
        return;
      }

      setScannedItems((prevItems) => [
        {
          key: colisData._id,
          barcode: colisData.code_suivi,
          status: colisData.statut,
          ville: colisData.ville.nom,
        },
        ...prevItems,
      ]);

      notification.success({ message: 'Colis trouvé et ajouté à la liste' });
    } catch (error) {
      console.error('Erreur lors de la récupération du colis:', error);
      notification.error({
        message: 'Erreur lors de la récupération du colis',
        description: error.response?.data?.message || error.message,
      });
    }
  };

  // Fonction pour changer le statut des colis
  const handleChangeStatu = async (codesuiviList) => {
    try {
      await request.put('/api/colis/statu/update', {
        colisCodes: codesuiviList,
        new_status: statu,
      });
      toast.success('Statut des colis mis à jour avec succès!');
      navigate('/dashboard/list-colis');
    } catch (err) {
      console.error("Erreur lors de la mise à jour des colis:", err);
      toast.error("Erreur lors de la mise à jour des colis.");
    }
  };

  // Gérer le clic sur le bouton d'action principal
  const handleAction = () => {
    if (scannedItems.length > 0) {
      const codesuiviList = scannedItems.map(item => item.barcode);
      if (statu === "Expediée") {
        setIsModalVisible(true);
      } else {
        handleChangeStatu(codesuiviList);
      }
    } else {
      toast.warn("Veuillez scanner au moins un colis !");
    }
  };

  // Confirmer la sélection du livreur
  const handleOk = async () => {
    if (!selectedLivreur) {
      message.warning('Veuillez sélectionner un livreur');
      return;
    }

    setLoading(true);
    const codesSuivi = scannedItems.map(item => item.barcode);

    try {
      if (selectedLivreur.nom === 'ameex') {
        const response = await request.post('/api/livreur/ameex', { codes_suivi: codesSuivi });
        const { success, errors } = response.data;
        if (success.length > 0) toast.success(`${success.length} colis assignés à Ameex.`);
        if (errors.length > 0) toast.error(`${errors.length} colis n'ont pas pu être assignés.`);
      } else {
        const response = await request.put('/api/colis/statu/affecter', {
          codesSuivi: codesSuivi,
          livreurId: selectedLivreur._id
        });
        toast.success(response.data.message);
      }
      navigate('/dashboard/list-colis');
    } catch (err) {
      toast.error("Une erreur est survenue lors de l'affectation.");
      console.error(err);
    } finally {
      setLoading(false);
      setIsModalVisible(false);
      setSelectedLivreur(null);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedLivreur(null);
  };

  return (
    <div className={theme === 'dark' ? 'dark-theme' : ''} style={{
      padding: '20px',
      backgroundColor: theme === 'dark' ? '#001529' : '#fff',
      color: theme === 'dark' ? '#fff' : '#000',
      minHeight: '100vh'
    }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Input
          placeholder="Entrez ou scannez le code barre..."
          value={currentBarcode}
          onChange={(e) => setCurrentBarcode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && currentBarcode) {
              handleScan(currentBarcode);
              setCurrentBarcode('');
            }
          }}
          size="large"
          addonBefore={<CiBarcode />}
          className={theme === 'dark' ? 'dark-input' : ''}
          autoFocus // Met le focus sur le champ au chargement
        />

        <Button
          danger
          type="primary"
          onClick={() => setScannedItems([])}
          style={{ marginBottom: 12 }}
        >
          Vider la table
        </Button>

        <Table
          columns={columns}
          dataSource={scannedItems}
          rowKey="barcode"
          pagination={{ pageSize: 5 }}
          bordered
          title={() => <span style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Colis Scannés</span>}
          className={theme === 'dark' ? 'dark-table' : ''}
        />

        <Button
          type="primary"
          onClick={handleAction}
          style={{ marginTop: '20px' }}
          disabled={scannedItems.length === 0}
        >
          {statu} ({scannedItems.length})
        </Button>
      </Space>

      <Modal
        title={<span style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Sélectionner Livreur</span>}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={"90vw"}
        className={theme === 'dark' ? 'dark-modal' : ''}
      >
        <div className='livreur_list_modal'>
          <h3 style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Liste des Livreurs</h3>
          <div className="livreur_list_modal_card">
            {livreurList && livreurList.length > 0 ? (
              livreurList.map(livreur => (
                <Card
                  key={livreur._id}
                  hoverable
                  style={{
                    width: 240,
                    margin: '10px',
                    border: selectedLivreur?._id === livreur._id ? '2px solid #1890ff' : '1px solid #f0f0f0',
                  }}
                  className={theme === 'dark' ? 'dark-card' : ''}
                  onClick={() => setSelectedLivreur(livreur)}
                >
                  <Card.Meta
                    title={livreur.username}
                    description={
                      <>
                        <span>{livreur.tele}</span>
                        <Button
                          icon={<CheckCircleOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info(`Villes: ${livreur.villes.join(', ')}`);
                          }}
                          type='primary'
                          style={{ float: 'right' }}
                        />
                      </>
                    }
                  />
                </Card>
              ))
            ) : (
              <p>Aucun livreur disponible</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ScanRamasser;