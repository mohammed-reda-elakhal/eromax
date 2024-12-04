// src/scene/components/scan/components/ScanRamasser.jsx

import React, { useEffect, useState, useRef, useContext } from 'react';
import { Input, Button, Select, Table, Typography, Space, notification, Modal, Card, Form, Tag, message } from 'antd';
import { CiBarcode } from "react-icons/ci";
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import BarcodeReader from 'react-barcode-reader';
import Webcam from 'react-webcam'; // Utilisation de react-webcam
import jsQR from 'jsqr'; // Utilisation de jsQR
import { useNavigate, useParams } from 'react-router-dom';
import request from '../../../../utils/request';
import { toast } from 'react-toastify';
import { getLivreurList } from '../../../../redux/apiCalls/livreurApiCall';
const { Option } = Select;
const { Title } = Typography;

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

  // Références pour react-webcam et canvas
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // Référence pour empêcher le traitement multiple des scans
  const isProcessingScan = useRef(false);

  // Définition des colonnes pour la table des colis scannés
  const columns = [
    { title: 'Code Suivi', dataIndex: 'barcode', key: 'barcode' },
    { title: 'Statut', dataIndex: 'status', key: 'status' },
    { title: 'Ville', dataIndex: 'ville', key: 'ville' },
  ];

  // État pour gérer la direction de la caméra
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' pour arrière, 'user' pour avant

  // Fonction pour basculer entre les caméras
  const toggleCamera = () => {
    setFacingMode(prevMode => (prevMode === 'environment' ? 'user' : 'environment'));
  };

  // Fonction de gestion du scan
  const handleScan = (scannedCode) => {
    if (!scannedCode) return; // Ignorer les résultats vides

    // Empêcher les scans multiples en succession rapide
    if (isProcessingScan.current) return;
    isProcessingScan.current = true;

    fetchColisByCodeSuivi(scannedCode);

    // Réinitialiser le flag de traitement après un court délai
    setTimeout(() => {
      isProcessingScan.current = false;
    }, 1000); // Ajuster le délai si nécessaire
  };

  // Fonction de gestion des erreurs de scan
  const handleError = (error) => {
    console.error("Scan Error:", error);
    notification.error({ message: 'Erreur lors du scan', description: error?.message || 'Une erreur est survenue lors du scan.' });
  };

  // Fonction de changement de méthode de scan
  const handleScanMethodChange = (value) => {
    setScanMethod(value);  // Définir la méthode de scan
    setCurrentBarcode('');      // Effacer l'entrée lors du changement
    setScannerEnabled(true);  // Activer le scanner lors du changement
    // Ne pas effacer l'historique des scans pour permettre un historique complet
  };

  // Fonction de rescan
  const handleRescan = () => {
    setCurrentBarcode('');
    setScannerEnabled(true);  // Réactiver le scanner
    // Ne pas effacer l'historique des scans pour permettre de voir tous les scans précédents
  };

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
      handleScan(currentBarcode);
      setCurrentBarcode('');
    }
  };

  // Fonction pour capturer et scanner une image
  const captureAndScan = () => {
    const webcam = webcamRef.current;
    const canvas = canvasRef.current;

    if (webcam && canvas) {
      const video = webcam.video;

      // Vérifier si la vidéo est prête et si les dimensions sont valides
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const width = video.videoWidth;
        const height = video.videoHeight;

        // Vérifier que les dimensions sont positives
        if (width > 0 && height > 0) {
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, width, height);

          try {
            const imageData = ctx.getImageData(0, 0, width, height);
            const code = jsQR(imageData.data, width, height);

            if (code) {
              handleScan(code.data);
              setScannerEnabled(false); // Désactiver le scanner après un scan réussi
            }
          } catch (err) {
            console.error("Error processing image data:", err);
          }
        } else {
          console.warn("Invalid video dimensions:", width, height);
        }
      }
    }
  };

  // Utilisation de useEffect pour scanner régulièrement
  useEffect(() => {
    let intervalId;

    if (scanMethod === 'qrcode' && scannerEnabled) {
      intervalId = setInterval(captureAndScan, 1000); // Scanner toutes les 1 seconde
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanMethod, scannerEnabled, facingMode]);

  // Fonction pour changer le statut du colis
  const handleChangeStatu = async (codesuiviList) => {
    try {
      // Envoyer une requête PUT pour mettre à jour le statut des colis sélectionnés
      const response = await request.put('/api/colis/statu/update', {
        colisCodes: codesuiviList, // Liste des codes scannés
        new_status: statu, // Nouvelle valeur de statut
      });
      // Gérer le succès - Vous pouvez afficher une notification toast ou traiter la réponse
      toast.success('Statut des colis mis à jour avec succès!');
      navigate('/dashboard/list-colis');
    } catch (err) {
      // Gérer l'erreur
      console.error("Erreur lors de la mise à jour des colis:", err);
      toast.error("Erreur lors de la mise à jour des colis.");
    }
  };

  // Fonction pour gérer le clic sur le bouton d'action
  const handleAction = () => {
    if (scannedItems.length > 0) {
      // Extraire la liste des codes scannés (code_suivi)
      const codesuiviList = scannedItems.map(item => item.barcode);

      if (statu === "Expediée") {
        setIsModalVisible(true); // Afficher la modal si le statut est "Expediée"
      } else {
        // Passer la liste des codes scannés à la fonction de changement de statut
        handleChangeStatu(codesuiviList);
      }
    } else {
      toast.warn("Veuillez scanner au moins un colis !");
    }
  };

  // Fonction pour confirmer l'affectation du livreur
  const handleOk = async () => {
    if (selectedLivreur) {
      // Extraire les codes_suivi des colis scannés
      const codesSuivi = scannedItems.map(item => item.barcode);  // Utiliser barcode comme code_suivi

      if (selectedLivreur.nom === 'ameex') {
        // Appeler l'API avec la liste des codes_suivi
        try {
          const response = await request.post('/api/livreur/ameex', { codes_suivi: codesSuivi });

          if (response.status === 200) {
            const { success, errors } = response.data;

            // Gérer les succès et les erreurs
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
          // Optionnel : Réinitialiser les sélections et fermer la modal
        } catch (err) {
          toast.error("Erreur lors de l'affectation à Ameex.");
        }
      } else {
        try {
          // Envoyer une requête PUT pour mettre à jour le statut des colis sélectionnés
          const response = await request.put('/api/colis/statu/affecter', {
            codesSuivi: codesSuivi,
            livreurId: selectedLivreur._id
          });
          toast.success(response.data.message);
          navigate('/dashboard/list-colis');
          setIsModalVisible(false); // Fermer la modal
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
              onScan={(barcode) => handleScan(barcode)}
            />
            <Input
              placeholder="Entrez ou scannez le code barre..."
              value={currentBarcode}
              onChange={(e) => setCurrentBarcode(e.target.value)}
              onKeyDown={handleBarcodeScan}
              style={{ width: '100%' }}
              addonBefore={<CiBarcode />}
            />
          </>
        )}

        {/* Lecteur de QR Code avec react-webcam et jsQR */}
        {scanMethod === 'qrcode' && scannerEnabled && (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/png"
              videoConstraints={{
                facingMode: facingMode,
              }}
              style={{ width: '100%', maxWidth: '500px', margin: '20px auto', borderRadius: '8px', border: '2px solid #1890ff' }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <Button 
              onClick={toggleCamera} 
              className="switch-camera-button" 
              disabled={false} // Vous pouvez ajouter une logique pour vérifier le nombre de caméras disponibles
            >
              Switch to {facingMode === 'environment' ? 'Front' : 'Rear'} Camera
            </Button>
          </>
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
          rowKey="barcode"
          pagination={{ pageSize: 5 }}
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
