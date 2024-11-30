import React, { useEffect, useState } from 'react';
import { Input, Button, Select, Table, Typography, Space, notification, Modal, Card, Divider , Form, Tag, message } from 'antd';
import BarcodeReader from 'react-barcode-reader';
import QrScanner from 'react-qr-scanner';
import request from '../../../../utils/request';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getLivreurList } from '../../../../redux/apiCalls/livreurApiCall';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title, Text } = Typography;

function ScanRamasser() {
  const { statu } = useParams(); // Récupère le paramètre 'statu' depuis l'URL

  // États locaux
  const [scannedItems, setScannedItems] = useState([]); // Liste des colis scannés
  const [currentBarcode, setCurrentBarcode] = useState(''); // Code barre actuel
  const [scanMethod, setScanMethod] = useState('barcode'); // Méthode de scan : 'barcode' ou 'qrcode'
  const [scannerEnabled, setScannerEnabled] = useState(true); // Contrôle la visibilité du scanner
  const [isModalVisible, setIsModalVisible] = useState(false); // Contrôle la visibilité de la modal
  const [selectedLivreur, setSelectedLivreur] = useState(null); // Livreur sélectionné
  const [loading, setLoading] = useState(false); // État de chargement pour les opérations
  const [form] = Form.useForm(); // Formulaire Ant Design

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Sélecteurs Redux
  const { livreurList } = useSelector(state => ({
    livreurList: state.livreur.livreurList, // Liste des livreurs depuis le store Redux
  }));

  // Effet pour récupérer la liste des livreurs au montage du composant
  useEffect(() => {
    dispatch(getLivreurList());
  }, [dispatch]);

  // Fonction pour récupérer les détails d'un colis via son code_suivi
  const fetchColisByCodeSuivi = async (barcode) => {
    // Vérifie si le colis a déjà été scanné
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

      // Mappage des statuts requis en fonction du nouveau statut
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
        console.log(statu);
        
        notification.error({
          message: 'Statut inconnu',
          description: `Le statut "${statu}" n'est pas reconnu.`,
        });
        return;
      }

      if (!requiredStatuses.includes(colisData.statut)) {
        notification.warning({
          message: 'Statut de colis invalide',
          description: `Seuls les colis avec le statut "${requiredStatuses.join(', ')}" peuvent être scannés pour "${statu}".`,
        });
        return;
      }

      // Ajoute le colis scanné à la liste des colis scannés
      setScannedItems((prevItems) => [
        ...prevItems,
        {
          key: colisData._id,
          barcode: colisData.code_suivi,
          status: colisData.statut,
          ville: colisData.ville.nom,
        },
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

  // Gestionnaire pour le scan du code barre via l'input
  const handleBarcodeScan = (event) => {
    if (event.key === 'Enter' && currentBarcode) {
      fetchColisByCodeSuivi(currentBarcode);
      setCurrentBarcode('');
    }
  };

  // Gestionnaire pour le scan réussi d'un QR code
  const handleQrScan = (data) => {
    if (data && data.text) {
      fetchColisByCodeSuivi(data.text);
      setScannerEnabled(false); // Désactive le scanner après un scan réussi
    }
  };

  // Gestionnaire d'erreur lors du scan
  const handleError = (err) => {
    console.error('Erreur de scan:', err);
    notification.error({ message: 'Erreur lors du scan', description: err.message });
  };

  // Fonction pour réactiver le scanner
  const handleRescan = () => {
    setCurrentBarcode('');
    setScannerEnabled(true);
  };

  // Gestionnaire pour la modification de l'input du code barre
  const handleBarcodeChange = (event) => {
    setCurrentBarcode(event.target.value);
  };

  // Gestionnaire pour changer la méthode de scan
  const handleScanMethodChange = (value) => {
    setScanMethod(value);
    setCurrentBarcode('');
    setScannerEnabled(true);
  };

  // Function to update the status of scanned parcels
const handleChangeStatu = async (codesuiviList) => {
  try {
    // Send a PUT request to update the status of selected colis
    const response = await request.put('/api/colis/statu/update', {
      colisCodes: codesuiviList, // List of scanned codes
      new_status: statu, // New status value
    });
    // Handle success - You can show a toast notification or process the response
    toast.success('Statut des colis mis à jour avec succès!');
    navigate('/dashboard/list-colis');
  } catch (err) {
    // Handle error
    console.error("Erreur lors de la mise à jour des colis:", err);
    toast.error("Erreur lors de la mise à jour des colis.");
  }
};

// Function to handle the action button click
const handleAction = () => {
  if (scannedItems.length > 0) {
    // Extract the list of scanned codes (code_suivi)
    const codesuiviList = scannedItems.map(item => item.barcode);
    
    if (statu === "Expediée") {
      setIsModalVisible(true); // Show the modal if the status is "Expediée"
    } else {
      // Pass the list of scanned codes to the status change function
      handleChangeStatu(codesuiviList);
    }
  } else {
    toast.warn("Veuillez scanner au moins un colis !");
  }
};



  // Fonction pour confirmer l'affectation du livreur
  const handleOk = async () => {
    if (selectedLivreur) {
      // Map over scannedItems and rename "barcode" to "code_suivi"
      const codesSuivi = scannedItems.map(item => item.barcode);  // Using barcode as code_suivi
  
      if (selectedLivreur.nom === 'ameex') {
        // Call the API with the list of code_suivi
        const response = await request.post('/api/livreur/ameex', { codes_suivi: codesSuivi });
  
        if (response.status === 200) {
          const { success, errors } = response.data;
  
          // Handle successes and errors
          if (success.length > 0) {
            toast.success(`${success.length} colis assigned to Ameex successfully`);
          }
          if (errors.length > 0) {
            toast.error(`${errors.length} colis failed to assign to Ameex`);
          }
        } else {
          toast.error(response.data.message || 'Erreur lors de l\'affectation à Ameex');
        }
        
        navigate('/dashboard/list-colis');
        // Optionally reset selections and close modal
      } else {
        try {
          // Send a PUT request to update the status of selected colis
          const response = await request.put('/api/colis/statu/affecter', {
            codesSuivi: codesSuivi,
            livreurId: selectedLivreur._id
          });
          toast.success(response.data.message);
          navigate('/dashboard/list-colis');
          setIsModalVisible(false); // Show the modal if the status is "Expediée"
        } catch (err) {
          toast.error("Erreur lors de la mise à jour des colis.");
        }
      }
    } else {
      message.warning('Veuillez sélectionner un livreur');
    }
  };
  

  // Fonction pour annuler l'affectation du livreur
  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedLivreur(null);
  };

  // Fonction pour sélectionner un livreur
  const selectLivreur = (livreur) => {
    setSelectedLivreur(livreur);
  };

  // Définition des colonnes pour la table des colis scannés
  const columns = [
    { title: 'Code Barre', dataIndex: 'barcode', key: 'barcode' },
    { title: 'Statut', dataIndex: 'status', key: 'status' },
    { title: 'Ville', dataIndex: 'ville', key: 'ville' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Title level={3}>Scanner Colis</Title>

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Sélection de la méthode de scan */}
        <div>
          <label>Méthode de scan: </label>
          <Select defaultValue="barcode" style={{ width: 200 }} onChange={handleScanMethodChange}>
            <Option value="barcode">Scanner Code Barre</Option>
            <Option value="qrcode">Scanner QR Code</Option>
          </Select>
        </div>

        {/* Lecteur de Code Barre */}
        {scanMethod === 'barcode' && scannerEnabled && (
          <>
            <BarcodeReader
              onError={handleError}
              onScan={(barcode) => fetchColisByCodeSuivi(barcode)}
            />
            <Input
              placeholder="Entrez ou scannez le code barre..."
              value={currentBarcode}
              onChange={handleBarcodeChange}
              onKeyDown={handleBarcodeScan}
              style={{ width: '100%' }}
            />
          </>
        )}

        {/* Lecteur de QR Code */}
        {scanMethod === 'qrcode' && scannerEnabled && (
          <QrScanner
            delay={300}
            onError={handleError}
            onScan={handleQrScan}
            style={{ width: '100%' }} // Ajustez la taille selon vos besoins
          />
        )}

        {/* Bouton pour rescanner */}
        {!scannerEnabled && (
          <Button type="primary" onClick={handleRescan}>
            Scanner un autre colis
          </Button>
        )}

        {/* Table des colis scannés */}
        <Table
          columns={columns}
          dataSource={scannedItems}
          pagination={false}
          bordered
          title={() => 'Colis Scannés'}
        />

        {/* Bouton pour effectuer l'action d'affectation */}
        <Button type="primary" onClick={handleAction} style={{ marginTop: '20px' }}>
          {statu} Tous
        </Button>
      </Space>

      {/* Modal pour sélectionner un livreur */}
      <Modal
        title="Sélectionner Livreur"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={"90vw"}
      >
        <div className='livreur_list_modal'>
          <h3>Liste des Livreurs</h3>
          <div className="livreur_list_modal_card" style={{ display: 'flex', flexWrap: 'wrap' }}>
            {livreurList && livreurList.length > 0 ? (
              livreurList.map(livreur => (
                <Card
                  key={livreur._id}
                  hoverable
                  style={{
                    width: 240,
                    margin: '10px',
                    border:
                      selectedLivreur && selectedLivreur._id === livreur._id
                        ? '2px solid #1890ff'
                        : '1px solid #f0f0f0',
                  }}
                  onClick={() => selectLivreur(livreur)}
                >
                  <Card.Meta
                    title={<div>{livreur.username}</div>}
                    description={
                      <>
                        {livreur.tele}
                        <Button
                          icon={<CheckCircleOutlined />}
                          onClick={(e) => {
                            e.stopPropagation(); // Empêche la propagation de l'événement de clic
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
