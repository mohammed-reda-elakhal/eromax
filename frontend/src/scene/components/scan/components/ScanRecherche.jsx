// src/scene/components/scan/components/ScanRecherche.jsx

import React, { useContext, useState, useEffect, useRef } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { HiOutlineStatusOnline } from "react-icons/hi";
import { 
  Button, 
  Input, 
  Card, 
  Spin, 
  Alert, 
  Select, 
  Space, 
  Table, 
  notification, 
  Modal, 
  Form, 
  Tag, 
  message, 
  Drawer,
  Row,
  Col,
  Typography,
  DatePicker
} from 'antd';
import { CiBarcode } from "react-icons/ci";
import { useDispatch, useSelector } from 'react-redux';
import BarcodeReader from 'react-barcode-reader';
import Webcam from 'react-webcam'; // Import de react-webcam
import jsQR from 'jsqr'; // Import de jsQR
import { getColisByCodeSuivi, updateStatut } from '../../../../redux/apiCalls/colisApiCalls';
import TrackingColis from '../../../global/TrackingColis '; // Correction de l'import
import { Si1001Tracklists } from 'react-icons/si';
import moment from 'moment';

const { Meta } = Card;
const { Option } = Select;
const { Text, Title: AntTitle } = Typography;

function ScanRecherche() {
  const { theme } = useContext(ThemeContext);
  const dispatch = useDispatch();

  // Accès à l'état des colis
  const colisState = useSelector(state => state.colis);
  const { selectedColis, loading, error } = colisState;

  // Accès aux informations de l'utilisateur
  const userState = useSelector(state => state.auth);
  const { user } = userState;
  const userRole = user && user.role;

  const [codeSuivi, setCodeSuivi] = useState('');  // Code scanné
  const [scanMethod, setScanMethod] = useState('barcode');  // Méthode de scan
  const [scannerEnabled, setScannerEnabled] = useState(true);  // Activation du scanner
  const [scannedItems, setScannedItems] = useState([]);  // Historique des scans
  const [facingMode, setFacingMode] = useState('environment'); // Caméra utilisée ('environment' ou 'user')

  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [statusType, setStatusType] = useState(null);
  const [form] = Form.useForm();

  const [isTrackingDrawerVisible, setIsTrackingDrawerVisible] = useState(false); // État de visibilité du Drawer

  const allowedStatuses = [
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

  // Référence pour empêcher le traitement multiple des scans
  const isProcessingScan = useRef(false);

  // Références pour react-webcam et canvas
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // Définition des colonnes pour le tableau
  const columns = [
    { title: 'Barcode', dataIndex: 'barcode', key: 'barcode' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Ville', dataIndex: 'ville', key: 'ville' },
  ];

  // Fonction de gestion du scan
  const handleScan = (scannedCode) => {
    if (!scannedCode) return; // Ignorer les résultats vides

    // Empêcher les scans multiples en succession rapide
    if (isProcessingScan.current) return;
    isProcessingScan.current = true;

    setCodeSuivi(scannedCode);  // Mettre à jour le code scanné
    dispatch(getColisByCodeSuivi(scannedCode));  // Récupérer les informations du colis
    setScannerEnabled(false);  // Désactiver le scanner après un scan réussi
    setScannedItems(prev => [
      ...prev, 
      { 
        barcode: scannedCode, 
        status: selectedColis?.statut, 
        ville: selectedColis?.ville?.nom 
      }
    ]);

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
    setCodeSuivi('');      // Effacer l'entrée lors du changement
    setScannerEnabled(true);  // Activer le scanner lors du changement
    setScannedItems([]);   // Effacer l'historique des scans
  };

  // Fonction de rescan
  const handleRescan = () => {
    setCodeSuivi('');
    setScannerEnabled(true);  // Réactiver le scanner
    setScannedItems([]);     // Effacer l'historique des scans
  };

  // Fonction pour changer le statut du colis
  const handleStatusOk = () => {
    form.validateFields().then(values => {
      const { status, comment, selectedDate } = values;
  
      // Check if status is "Programmée" or "Reporté" and ensure a date is provided
      if ((status === "Programmée" || status === "Reporté") && !selectedDate) {
        message.error("Veuillez sélectionner une date pour ce statut.");
        return;
      }
  
      // Dispatch updateStatut with the selected date if applicable
      const formattedDate = selectedDate ? selectedDate.format('YYYY-MM-DD') : undefined;
  
      dispatch(updateStatut(selectedColis._id, status, comment, formattedDate));
  
      // Reset form and close modal
      form.resetFields();
      setStatusType(null);
      setIsStatusModalVisible(false);
  
      // Refresh the colis data
      dispatch(getColisByCodeSuivi(selectedColis.code_suivi));
    }).catch(info => {
      console.log('Validation Failed:', info);
    });
  };
  

  // Fonction pour annuler le changement de statut
  const handleStatusCancel = () => {
    form.resetFields();
    setStatusType(null);
    setIsStatusModalVisible(false);
  };

  // Fonction pour ouvrir le Drawer de suivi
  const showTrackingDrawer = () => {
    setIsTrackingDrawerVisible(true);
  };

  // Fonction pour fermer le Drawer de suivi
  const closeTrackingDrawer = () => {
    setIsTrackingDrawerVisible(false);
  };

  // Fonction pour basculer entre les caméras
  const toggleCamera = () => {
    setFacingMode(prevMode => (prevMode === 'environment' ? 'user' : 'environment'));
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

  return (
    <div className='page-dashboard'>
      <Menubar />
      <main className="page-main">
        <Topbar />
        <div
          className="page-content"
          style={{
            backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray1)',
            color: theme === 'dark' ? '#fff' : '#002242',
          }}
        >
          <div className="page-content-header">
            <Title nom='Scan Colis' />
          </div>
          <div
            className="content"
            style={{
              backgroundColor: theme === 'dark' ? '#001529' : '#fff',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Ombre pour la profondeur
            }} 
          >
            <h4>Recherche Colis :</h4>

            {/* Sélection de la méthode de scan */}
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <label>Méthode de Scan: </label>
                <Select 
                  defaultValue="barcode" 
                  style={{ width: 200 }} 
                  onChange={handleScanMethodChange}
                >
                  <Option value="barcode">Scanner Code-barres</Option>
                  <Option value="qrcode">Scanner QR Code</Option>
                </Select>
              </div>

              {/* Scanner Code-barres */}
              {scanMethod === 'barcode' && (
                <>
                  <BarcodeReader
                    onError={handleError}
                    onScan={handleScan}
                  />
                  <Input
                    value={codeSuivi}
                    onChange={(e) => setCodeSuivi(e.target.value)}
                    placeholder="Entrez ou scannez le code suivi"
                    style={{ marginBottom: '20px' }}
                    size="large"
                    addonBefore={<CiBarcode />}
                  />
                  <Button 
                    type="primary" 
                    onClick={() => handleScan(codeSuivi)} 
                    loading={loading}
                  >
                    Rechercher Colis
                  </Button>
                </>
              )}

              {/* Scanner QR Code avec react-webcam et jsQR */}
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

              {/* Bouton de Rescan */}
              {scanMethod === 'qrcode' && !scannerEnabled && (
                <Button 
                  type="primary" 
                  onClick={handleRescan}
                >
                  Rescanner le QR Code
                </Button>
              )}

              {/* Champ de saisie pour le code scanné */}
              {scanMethod === 'qrcode' && (
                <Input
                  value={codeSuivi}
                  onChange={(e) => setCodeSuivi(e.target.value)}
                  placeholder="Le QR Code scanné apparaîtra ici..."
                  style={{ width: '100%' }}
                  disabled={scannerEnabled}  // Désactiver l'entrée lorsque le scanner est actif
                />
              )}

              {/* Afficher le spinner de chargement */}
              {loading && <Spin style={{ marginTop: '20px' }} />}

              {/* Afficher une alerte en cas d'erreur */}
              {error && (
                <Alert 
                  message="Erreur" 
                  description={error} 
                  type="error" 
                  showIcon 
                  style={{ marginTop: '20px' }} 
                />
              )}

              {/* Afficher les informations du colis scanné */}
              {selectedColis && (
                <Card style={{ marginTop: '20px' }}>
                  <Meta title={`Colis: ${selectedColis.code_suivi}`} />
                  
                  {/* Nouvelle Mise en Page pour la Description */}
                  <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong>Nom:</Text>
                      <br />
                      <Text>{selectedColis.nom}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong>Téléphone:</Text>
                      <br />
                      <Text>{selectedColis.tele}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong>Ville:</Text>
                      <br />
                      <Text>{selectedColis.ville.nom}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong>Adresse:</Text>
                      <br />
                      <Text>{selectedColis.adresse}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong>Prix:</Text>
                      <br />
                      <Text>{selectedColis.prix} DH</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong>Nature Produit:</Text>
                      <br />
                      <Text>{selectedColis.nature_produit}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong>Statut:</Text>
                      <br />
                      <Text>{selectedColis.statut}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong>Commentaire:</Text>
                      <br />
                      <Text>{selectedColis.commentaire || 'Aucun commentaire'}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong>État:</Text>
                      <br />
                      <Text>{selectedColis.etat ? "Payée" : "Non Payée"}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong>Ouvrir:</Text>
                      <br />
                      <Text>{selectedColis.ouvrir ? "Oui" : "Non"}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong>Fragile:</Text>
                      <br />
                      <Text>{selectedColis.is_fragile ? "Oui" : "Non"}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong>Remplacer:</Text>
                      <br />
                      <Text>{selectedColis.is_remplace ? "Oui" : "Non"}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong>Store:</Text>
                      <br />
                      <Text>{selectedColis.store?.storeName || 'N/A'}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong>Créé le:</Text>
                      <br />
                      <Text>{new Date(selectedColis.createdAt).toLocaleString()}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong>Mis à jour le:</Text>
                      <br />
                      <Text>{new Date(selectedColis.updatedAt).toLocaleString()}</Text>
                    </Col>
                  </Row>

                  {/* Section des boutons */}
                  <Space direction="horizontal" size="middle" style={{ marginTop: '20px' }}>
                    {/* Bouton pour changer le statut - uniquement pour les rôles 'admin' et 'livreur' */}
                    {(userRole === 'admin' || userRole === 'livreur') && (
                      <Button
                        icon={<HiOutlineStatusOnline />}
                        type="primary"
                        onClick={() => setIsStatusModalVisible(true)}
                      >
                        Changer le Statut
                      </Button>
                    )}
                    
                    {/* Bouton pour ouvrir le Drawer de suivi */}
                    <Button
                        icon={<Si1001Tracklists />}
                        type="primary"
                        onClick={showTrackingDrawer}
                    >
                      Voir le Suivi
                    </Button>
                  </Space>
                </Card>
              )}

              {/* Tableau des éléments scannés QR Code */}
              {scanMethod === 'qrcode' && (
                <Table
                  columns={columns}
                  dataSource={scannedItems}
                  rowKey="barcode"
                  pagination={false}
                  bordered
                  title={() => 'Scanned Items'}
                  style={{ marginTop: '20px' }}
                />
              )}
            </Space>
          </div>
        </div>
      </main>

      {/* Modal pour changer le statut */}
      <Modal
        title={`Changer le Statut de ${selectedColis ? selectedColis.code_suivi : ''}`}
        visible={isStatusModalVisible}
        onOk={handleStatusOk}
        onCancel={handleStatusCancel}
        okText="Confirmer"
        cancelText="Annuler"
      >
        <Form form={form} layout="vertical" name="form_status">
          <Form.Item
            name="status"
            label="Nouveau Statut"
            rules={[{ required: true, message: 'Veuillez sélectionner un statut!' }]}
          >
            {/* Afficher les statuts sous forme de Tags cliquables */}
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
                >
                  {status}
                </Tag.CheckableTag>
              ))}
            </div>
          </Form.Item>

          {/* Champ conditionnel pour les commentaires */}
          <Form.Item
            name="comment"
            label="Commentaire"
            rules={[{ required: false, message: 'Ajouter un commentaire (facultatif)' }]}
          >
            <Input.TextArea placeholder="Ajouter un commentaire" rows={3} />
          </Form.Item>

          {/* Champ conditionnel pour le temps de livraison si le statut est 'Programmée' */}
          {statusType === "Programmée" || statusType === "Reporté" ? (
            <Form.Item
              name="selectedDate"
              label="Date"
              rules={[{ required: true, message: 'Veuillez sélectionner une date!' }]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                disabledDate={(current) => current && current < moment().startOf('day')} // Disable past dates
                format="YYYY-MM-DD"
              />
            </Form.Item>
          ) : null}

        </Form>
      </Modal>

      {/* Drawer pour le suivi du colis */}
      <Drawer
        title={`Suivi du Colis: ${selectedColis ? selectedColis.code_suivi : ''}`}
        placement="right"
        onClose={closeTrackingDrawer}
        visible={isTrackingDrawerVisible}
        width={500}
      >
        {selectedColis ? (
          <TrackingColis codeSuivi={selectedColis.code_suivi} />
        ) : (
          <Spin size="large" />
        )}
      </Drawer>
    </div>
  );
}

export default ScanRecherche;
