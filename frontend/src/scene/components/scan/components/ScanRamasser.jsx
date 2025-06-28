// src/scene/components/scan/components/ScanRamasser.jsx

import React, { useEffect, useState, useRef, useContext } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import './ScanRamasser.css';
import { Input, Button, Select, Table, Typography, Space, notification, Modal, Card, message } from 'antd';
import { CiBarcode } from "react-icons/ci";
import { CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons';
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
  const { theme } = useContext(ThemeContext); // Get theme context
  const { statu } = useParams(); // Récupère le paramètre 'statu' depuis l'URL

  // États locaux
  const [scannedItems, setScannedItems] = useState([]); // Liste des colis scannés
  const [currentBarcode, setCurrentBarcode] = useState(''); // Code barre actuel
  const [scanMethod, setScanMethod] = useState('barcode'); // Méthode de scan : 'barcode' ou 'qrcode'
  const [scannerEnabled, setScannerEnabled] = useState(true); // Contrôle la visibilité du scanner
  const [isModalVisible, setIsModalVisible] = useState(false); // Contrôle la visibilité de la modal
  const [selectedLivreur, setSelectedLivreur] = useState(null); // Livreur sélectionné
  const [loading] = useState(false); // État de chargement pour les opérations

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

  // Handler to remove a scanned colis by barcode
  const handleRemoveScannedColis = (barcode) => {
    setScannedItems(prev => prev.filter(item => item.barcode !== barcode));
  };

  // Définition des colonnes pour la table des colis scannés
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
      await request.put('/api/colis/statu/update', {
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
    <div className={theme === 'dark' ? 'dark-theme' : ''} style={{
      padding: '20px',
      backgroundColor: theme === 'dark' ? '#001529' : '#fff',
      color: theme === 'dark' ? '#fff' : '#000',
      minHeight: '100vh'
    }}>

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Sélection de la méthode de scan - version cartes */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, margin: '0 auto 12px auto' }}>
          <Card
            hoverable
            onClick={() => handleScanMethodChange('barcode')}
            style={{
              width: 110,
              textAlign: 'center',
              border: scanMethod === 'barcode' ? '2px solid #1890ff' : '1px solid #d9d9d9',
              background: scanMethod === 'barcode' ? (theme === 'dark' ? '#1e293b' : '#e0f2fe') : (theme === 'dark' ? '#1f1f1f' : '#fff'),
              color: scanMethod === 'barcode' ? '#1890ff' : (theme === 'dark' ? '#fff' : '#000'),
              cursor: 'pointer',
              transition: 'all 0.2s',
              padding: 0,
            }}
            bodyStyle={{ padding: 10 }}
          >
            <CiBarcode style={{ fontSize: 22, marginBottom: 4 }} />
            <div style={{ fontWeight: 600, fontSize: 13 }}>Code Barre</div>
          </Card>
          <Card
            hoverable
            onClick={() => handleScanMethodChange('qrcode')}
            style={{
              width: 110,
              textAlign: 'center',
              border: scanMethod === 'qrcode' ? '2px solid #1890ff' : '1px solid #d9d9d9',
              background: scanMethod === 'qrcode' ? (theme === 'dark' ? '#1e293b' : '#e0f2fe') : (theme === 'dark' ? '#1f1f1f' : '#fff'),
              color: scanMethod === 'qrcode' ? '#1890ff' : (theme === 'dark' ? '#fff' : '#000'),
              cursor: 'pointer',
              transition: 'all 0.2s',
              padding: 0,
            }}
            bodyStyle={{ padding: 10 }}
          >
            <span style={{ fontSize: 22, marginBottom: 4, display: 'block' }}>
              &#128273;
            </span>
            <div style={{ fontWeight: 600, fontSize: 13 }}>QR Code</div>
          </Card>
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
              style={{
                width: '100%',
                backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
                color: theme === 'dark' ? '#fff' : '#000',
                borderColor: theme === 'dark' ? '#434343' : '#d9d9d9',
              }}
              className={theme === 'dark' ? 'dark-input' : ''}
              size="large"
              addonBefore={
                <div style={{
                  backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fafafa',
                  color: theme === 'dark' ? '#fff' : '#000',
                  border: 'none'
                }}>
                  <CiBarcode style={{ color: theme === 'dark' ? '#fff' : '#000' }} />
                </div>
              }
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
              style={{
                backgroundColor: theme === 'dark' ? '#1890ff' : '#1890ff',
                borderColor: theme === 'dark' ? '#1890ff' : '#1890ff',
                color: '#fff',
              }}
            >
              Switch to {facingMode === 'environment' ? 'Front' : 'Rear'} Camera
            </Button>
          </>
        )}

        {/* Bouton pour rescanner */}
        {!scannerEnabled && (
          <Button
            type="primary"
            onClick={handleRescan}
            style={{
              backgroundColor: theme === 'dark' ? '#1890ff' : '#1890ff',
              borderColor: theme === 'dark' ? '#1890ff' : '#1890ff',
              color: '#fff',
            }}
          >
            Scanner un autre colis
          </Button>
        )}

        {/* Bouton pour vider la table des colis scannés */}
        <Button
          danger
          type="primary"
          onClick={() => setScannedItems([])}
          style={{ marginBottom: 12 }}
        >
          Vider la table
        </Button>

        {/* Table des colis scannés */}
        <Table
          columns={columns}
          dataSource={scannedItems}
          rowKey="barcode"
          pagination={{ pageSize: 5 }}
          bordered
          title={() => <span style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Colis Scannés</span>}
          style={{
            backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
          }}
          className={theme === 'dark' ? 'dark-table' : ''}
        />

        {/* Bouton pour effectuer l'action d'affectation */}
        <Button
          type="primary"
          onClick={handleAction}
          style={{
            marginTop: '20px',
            backgroundColor: theme === 'dark' ? '#1890ff' : '#1890ff',
            borderColor: theme === 'dark' ? '#1890ff' : '#1890ff',
            color: '#fff',
          }}
        >
          {statu} Tous
        </Button>
      </Space>

      {/* Modal pour sélectionner un livreur */}
      <Modal
        title={<span style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Sélectionner Livreur</span>}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={"90vw"}
        style={{
          backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
        }}
        styles={{
          body: {
            backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
            color: theme === 'dark' ? '#fff' : '#000',
          }
        }}
      >
        <div className='livreur_list_modal'>
          <h3 style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Liste des Livreurs</h3>
          <div className="livreur_list_modal_card" style={{ display: 'flex', flexWrap: 'wrap' }}>
            {livreurList && livreurList.length > 0 ? (
              livreurList.map(livreur => (
                <Card
                  key={livreur._id}
                  hoverable
                  style={{
                    width: 240,
                    margin: '10px',
                    backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#000',
                    border:
                      selectedLivreur && selectedLivreur._id === livreur._id
                        ? '2px solid #1890ff'
                        : theme === 'dark' ? '1px solid #434343' : '1px solid #f0f0f0',
                    transition: 'all 0.3s ease',
                  }}
                  onClick={() => selectLivreur(livreur)}
                >
                  <Card.Meta
                    title={<div style={{ color: theme === 'dark' ? '#fff' : '#000' }}>{livreur.username}</div>}
                    description={
                      <>
                        <span style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>{livreur.tele}</span>
                        <Button
                          icon={<CheckCircleOutlined />}
                          onClick={(e) => {
                            e.stopPropagation(); // Empêche la propagation de l'événement de clic
                            toast.info(`Villes: ${livreur.villes.join(', ')}`);
                          }}
                          type='primary'
                          style={{
                            float: 'right',
                            backgroundColor: theme === 'dark' ? '#1890ff' : '#1890ff',
                            borderColor: theme === 'dark' ? '#1890ff' : '#1890ff',
                          }}
                        />
                      </>
                    }
                  />
                </Card>
              ))
            ) : (
              <p style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Aucun livreur disponible</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ScanRamasser;
