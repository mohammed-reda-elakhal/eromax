// src/scene/components/scan/components/ScanRecherche.jsx

import React, { useContext, useState, useEffect, useRef } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import './ScanRecherche.css';
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
const { Text } = Typography;

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
    "Prét Pour Expédition",
    "Manque de stock",
    "Intéressé"
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
          className={`page-content ${theme === 'dark' ? 'dark-theme' : ''}`}
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
            <h4 style={{
              color: theme === 'dark' ? '#fff' : '#002242',
              marginBottom: '20px',
              fontSize: '18px',
              fontWeight: '600'
            }}>Recherche Colis :</h4>

            {/* Sélection de la méthode de scan */}
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <label style={{
                  color: theme === 'dark' ? '#fff' : '#000',
                  marginRight: '10px',
                  fontWeight: '500'
                }}>Méthode de Scan: </label>
                <Select
                  defaultValue="barcode"
                  style={{
                    width: 200,
                    backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
                    borderColor: theme === 'dark' ? '#434343' : '#d9d9d9',
                    color: theme === 'dark' ? '#fff' : '#000',
                  }}
                  onChange={handleScanMethodChange}
                  dropdownStyle={{
                    backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#000',
                  }}
                  popupClassName={theme === 'dark' ? 'dark-select-dropdown' : ''}
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
                    style={{
                      marginBottom: '20px',
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
                  <Button
                    type="primary"
                    onClick={() => handleScan(codeSuivi)}
                    loading={loading}
                    style={{
                      backgroundColor: '#1890ff',
                      borderColor: '#1890ff',
                      color: '#fff',
                    }}
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
                    style={{
                      backgroundColor: '#1890ff',
                      borderColor: '#1890ff',
                      color: '#fff',
                    }}
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
                  style={{
                    backgroundColor: '#1890ff',
                    borderColor: '#1890ff',
                    color: '#fff',
                  }}
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
                  style={{
                    width: '100%',
                    backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#000',
                    borderColor: theme === 'dark' ? '#434343' : '#d9d9d9',
                  }}
                  className={theme === 'dark' ? 'dark-input' : ''}
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
                <Card style={{
                  marginTop: '20px',
                  backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
                  borderColor: theme === 'dark' ? '#434343' : '#f0f0f0',
                  color: theme === 'dark' ? '#fff' : '#000',
                }}>
                  <Meta title={
                    <span style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
                      {`Colis: ${selectedColis.code_suivi}`}
                    </span>
                  } />

                  {/* Nouvelle Mise en Page pour la Description */}
                  <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Nom:</Text>
                      <br />
                      <Text style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>{selectedColis.nom}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Téléphone:</Text>
                      <br />
                      <Text style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>{selectedColis.tele}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Ville:</Text>
                      <br />
                      <Text style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>{selectedColis.ville.nom}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Adresse:</Text>
                      <br />
                      <Text style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>{selectedColis.adresse}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Prix:</Text>
                      <br />
                      <Text style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>{selectedColis.prix} DH</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Nature Produit:</Text>
                      <br />
                      <Text style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>{selectedColis.nature_produit}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Statut:</Text>
                      <br />
                      <Text style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>{selectedColis.statut}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Commentaire:</Text>
                      <br />
                      <Text style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>{selectedColis.commentaire || 'Aucun commentaire'}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong style={{ color: theme === 'dark' ? '#fff' : '#000' }}>État:</Text>
                      <br />
                      <Text style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>{selectedColis.etat ? "Payée" : "Non Payée"}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Ouvrir:</Text>
                      <br />
                      <Text style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>{selectedColis.ouvrir ? "Oui" : "Non"}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Fragile:</Text>
                      <br />
                      <Text style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>{selectedColis.is_fragile ? "Oui" : "Non"}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Remplacer:</Text>
                      <br />
                      <Text style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>{selectedColis.is_remplace ? "Oui" : "Non"}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Store:</Text>
                      <br />
                      <Text style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>{selectedColis.store?.storeName || 'N/A'}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Créé le:</Text>
                      <br />
                      <Text style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>{new Date(selectedColis.createdAt).toLocaleString()}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Mis à jour le:</Text>
                      <br />
                      <Text style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>{new Date(selectedColis.updatedAt).toLocaleString()}</Text>
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
                        style={{
                          backgroundColor: '#1890ff',
                          borderColor: '#1890ff',
                          color: '#fff',
                        }}
                      >
                        Changer le Statut
                      </Button>
                    )}

                    {/* Bouton pour ouvrir le Drawer de suivi */}
                    <Button
                        icon={<Si1001Tracklists />}
                        type="primary"
                        onClick={showTrackingDrawer}
                        style={{
                          backgroundColor: '#1890ff',
                          borderColor: '#1890ff',
                          color: '#fff',
                        }}
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
                  title={() => <span style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Scanned Items</span>}
                  style={{
                    marginTop: '20px',
                    backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
                  }}
                  className={theme === 'dark' ? 'dark-table' : ''}
                />
              )}
            </Space>
          </div>
        </div>
      </main>

      {/* Modal pour changer le statut */}
      <Modal
        title={
          <span style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
            {`Changer le Statut de ${selectedColis ? selectedColis.code_suivi : ''}`}
          </span>
        }
        open={isStatusModalVisible}
        onOk={handleStatusOk}
        onCancel={handleStatusCancel}
        okText="Confirmer"
        cancelText="Annuler"
        styles={{
          header: {
            backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
            borderBottom: theme === 'dark' ? '1px solid #434343' : '1px solid #f0f0f0',
          },
          body: {
            backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
            color: theme === 'dark' ? '#fff' : '#000',
          },
          footer: {
            backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
            borderTop: theme === 'dark' ? '1px solid #434343' : '1px solid #f0f0f0',
          },
          content: {
            backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
          },
          mask: {
            backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.45)',
          }
        }}
      >
        <Form form={form} layout="vertical" name="form_status">
          <Form.Item
            name="status"
            label={<span style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Nouveau Statut</span>}
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
            label={<span style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Commentaire</span>}
            rules={[{ required: false, message: 'Ajouter un commentaire (facultatif)' }]}
          >
            <Input.TextArea
              placeholder="Ajouter un commentaire"
              rows={3}
              style={{
                backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
                color: theme === 'dark' ? '#fff' : '#000',
                borderColor: theme === 'dark' ? '#434343' : '#d9d9d9',
              }}
            />
          </Form.Item>

          {/* Champ conditionnel pour le temps de livraison si le statut est 'Programmée' */}
          {statusType === "Programmée" || statusType === "Reporté" ? (
            <Form.Item
              name="selectedDate"
              label={<span style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Date</span>}
              rules={[{ required: true, message: 'Veuillez sélectionner une date!' }]}
            >
              <DatePicker
                style={{
                  width: '100%',
                  backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
                  borderColor: theme === 'dark' ? '#434343' : '#d9d9d9',
                }}
                disabledDate={(current) => current && current < moment().startOf('day')} // Disable past dates
                format="YYYY-MM-DD"
              />
            </Form.Item>
          ) : null}

        </Form>
      </Modal>

      {/* Drawer pour le suivi du colis */}
      <Drawer
        title={
          <span style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
            {`Suivi du Colis: ${selectedColis ? selectedColis.code_suivi : ''}`}
          </span>
        }
        placement="right"
        onClose={closeTrackingDrawer}
        open={isTrackingDrawerVisible}
        width={500}
        styles={{
          header: {
            backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
            borderBottom: theme === 'dark' ? '1px solid #434343' : '1px solid #f0f0f0',
          },
          body: {
            backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
            color: theme === 'dark' ? '#fff' : '#000',
          },
          mask: {
            backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.45)',
          }
        }}
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
