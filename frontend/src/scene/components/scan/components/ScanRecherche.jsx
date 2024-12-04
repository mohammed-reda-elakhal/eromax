// src/components/ScanRecherche.js
import React, { useContext, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { HiOutlineStatusOnline } from "react-icons/hi";
import {
  Button,
  Input,
  Card,
  Descriptions,
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
  Drawer, // Import Drawer from antd
} from 'antd';
import { CiBarcode } from "react-icons/ci";
import { useDispatch, useSelector } from 'react-redux';
import BarcodeReader from 'react-barcode-reader';
import QrScanner from 'react-qr-scanner';
import { getColisByCodeSuivi, updateStatut } from '../../../../redux/apiCalls/colisApiCalls';
import TrackingColis from '../../../global/TrackingColis '; // Corrected import path
import { Si1001Tracklists } from 'react-icons/si';


const { Meta } = Card;
const { Option } = Select;

function ScanRecherche() {
  const { theme } = useContext(ThemeContext);
  const dispatch = useDispatch();

  // Accessing colis state
  const colisState = useSelector(state => state.colis);
  const { selectedColis, loading, error } = colisState;

  // Accessing user info
  const userState = useSelector(state => state.auth);
  const { user } = userState;
  const userRole = user && user.role;

  const [codeSuivi, setCodeSuivi] = useState('');  // State to store the barcode/QR code
  const [scanMethod, setScanMethod] = useState('barcode');  // Toggle between barcode and QR code scanner
  const [scannerEnabled, setScannerEnabled] = useState(true);  // Control scanner visibility
  const [scannedItems, setScannedItems] = useState([]);  // Store scanned items for QR code

  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [statusType, setStatusType] = useState(null);
  const [form] = Form.useForm();

  const [isTrackingDrawerVisible, setIsTrackingDrawerVisible] = useState(false); // State for Drawer visibility

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

  // Handle the barcode scan
  const handleScan = (scannedCode) => {
    if (scannedCode) {
      setCodeSuivi(scannedCode);  // Set the scanned barcode or QR code
      dispatch(getColisByCodeSuivi(scannedCode));  // Dispatch action to fetch colis
      setScannerEnabled(false);  // Disable scanner after successful scan
    }
  };

  // Handle QR code scan success
  const handleQrScan = (data) => {
    if (data && data.text && !scannedItems.some(item => item.barcode === data.text)) {
      setCodeSuivi(data.text);
      handleScan(data.text);  // Use the same handleScan method
    }
  };

  // Handle any scan errors
  const handleError = (err) => {
    console.error("Scan Error:", err);
    notification.error({ message: 'Error scanning code', description: err.message });
  };

  // Handle switching between barcode and QR code
  const handleScanMethodChange = (value) => {
    setScanMethod(value);  // Set the scan method to either barcode or QR code
    setCodeSuivi('');  // Clear the input on switching
    setScannerEnabled(true);  // Enable scanner when switching
    setScannedItems([]);  // Clear scanned items
  };

  // Rescan function to enable the scanner again
  const handleRescan = () => {
    setCodeSuivi('');
    setScannerEnabled(true);  // Re-enable the scanner
  };

  // Define columns for the table (for QR code scan results)
  const columns = [
    { title: 'Barcode', dataIndex: 'barcode', key: 'barcode' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Ville', dataIndex: 'ville', key: 'ville' },
  ];

  // Function to handle confirming the status change
  const handleStatusOk = () => {
    form.validateFields().then(values => {
      const { status, comment, deliveryTime } = values;

      // If status is 'Programmée', ensure deliveryTime is provided
      if (status === "Programmée" && !deliveryTime) {
        message.error("Veuillez sélectionner un temps de livraison pour une livraison programmée.");
        return;
      }

      // Dispatch updateStatut with or without deliveryTime
      if (status === "Programmée") {
        dispatch(updateStatut(selectedColis._id, status, comment, deliveryTime));
      } else {
        dispatch(updateStatut(selectedColis._id, status, comment));
      }

      // Reset form and close modal
      form.resetFields();
      setStatusType(null);
      setIsStatusModalVisible(false);

      // Refresh colis data
      dispatch(getColisByCodeSuivi(selectedColis.code_suivi));
    }).catch(info => {
      console.log('Validation Failed:', info);
    });
  };

  // Function to handle cancelling the status change
  const handleStatusCancel = () => {
    form.resetFields();
    setStatusType(null);
    setIsStatusModalVisible(false);
  };

  // Function to open the Tracking Drawer
  const showTrackingDrawer = () => {
    setIsTrackingDrawerVisible(true);
  };

  // Function to close the Tracking Drawer
  const closeTrackingDrawer = () => {
    setIsTrackingDrawerVisible(false);
  };

  // Toggle between front and rear camera
  const [cameraType, setCameraType] = useState('user');  // 'user' for front, 'environment' for rear

  const toggleCamera = () => {
    setCameraType(prev => (prev === 'user' ? 'environment' : 'user'));
  };

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
            }} 
          >
            <h4>Recherche Colis :</h4>

            {/* Select scan method */}
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <label>Méthode de Scan: </label>
                <Select defaultValue="barcode" style={{ width: 200 }} onChange={handleScanMethodChange}>
                  <Option value="barcode">Scanner Code-barres</Option>
                  <Option value="qrcode">Scanner QR Code</Option>
                </Select>
              </div>

              {/* Barcode Reader */}
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
                  <Button type="primary" onClick={() => handleScan(codeSuivi)} loading={loading}>
                    Rechercher Colis
                  </Button>
                </>
              )}

              {/* QR Code Reader */}
              {scanMethod === 'qrcode' && scannerEnabled && (
                <>
                  <QrScanner
                    key={cameraType} // Force remount when cameraType changes
                    delay={300}
                    onError={handleError}
                    onScan={handleQrScan}
                    style={{ width: '100%', height: 'auto' }}
                    videoConstraints={{
                      facingMode: cameraType === 'user' ? 'user' : 'environment' // Use front or rear camera based on state
                    }}
                  />
                  <Button onClick={toggleCamera} style={{ marginTop: '10px' }}>
                    Switch to {cameraType === 'user' ? 'Rear' : 'Front'} Camera
                  </Button>
                </>
              )}

              {/* Rescan Button */}
              {scanMethod === 'qrcode' && !scannerEnabled && (
                <Button type="primary" onClick={handleRescan}>
                  Rescanner le QR Code
                </Button>
              )}

              {scanMethod === 'qrcode' && (
                <Input
                  value={codeSuivi}
                  onChange={(e) => setCodeSuivi(e.target.value)}
                  placeholder="Le QR Code scanné apparaîtra ici..."
                  style={{ width: '100%' }}
                  disabled={scannerEnabled}  // Disable input when scanner is enabled
                />
              )}

              {/* Display loading spinner */}
              {loading && <Spin style={{ marginTop: '20px' }} />}

              {/* Display error if any */}
              {error && <Alert message="Erreur" description={error} type="error" showIcon style={{ marginTop: '20px' }} />}

              {/* Display Colis Information */}
              {selectedColis && (
                <Card style={{ marginTop: '20px' }}>
                  <Meta title={`Colis: ${selectedColis.code_suivi}`} />
                  <Descriptions bordered style={{ marginTop: '20px' }}>
                    <Descriptions.Item label="Nom">{selectedColis.nom}</Descriptions.Item>
                    <Descriptions.Item label="Téléphone">{selectedColis.tele}</Descriptions.Item>
                    <Descriptions.Item label="Ville">{selectedColis.ville.nom}</Descriptions.Item>
                    <Descriptions.Item label="Adresse">{selectedColis.adresse}</Descriptions.Item>
                    <Descriptions.Item label="Prix">{selectedColis.prix} DH</Descriptions.Item>
                    <Descriptions.Item label="Nature Produit">{selectedColis.nature_produit}</Descriptions.Item>
                    <Descriptions.Item label="Statut">{selectedColis.statut}</Descriptions.Item>
                    <Descriptions.Item label="Commentaire">{selectedColis.commentaire}</Descriptions.Item>
                    <Descriptions.Item label="Etat">{selectedColis.etat ? "Payée" : "Non Payée"}</Descriptions.Item>
                    <Descriptions.Item label="Ouvrir">{selectedColis.ouvrir ? "Oui" : "Non"}</Descriptions.Item>
                    <Descriptions.Item label="Fragile">{selectedColis.is_fragile ? "Oui" : "Non"}</Descriptions.Item>
                    <Descriptions.Item label="Remplacer">{selectedColis.is_remplace ? "Oui" : "Non"}</Descriptions.Item>
                    <Descriptions.Item label="Store">{selectedColis.store?.storeName}</Descriptions.Item>
                    <Descriptions.Item label="Créé le">{new Date(selectedColis.createdAt).toLocaleString()}</Descriptions.Item>
                    <Descriptions.Item label="Mis à jour le">{new Date(selectedColis.updatedAt).toLocaleString()}</Descriptions.Item>
                  </Descriptions>

                  {/* Buttons Section */}
                  <Space direction="horizontal" size="middle" style={{ marginTop: '20px' }}>
                    {/* Button to Change Status - only for 'admin' and 'livreur' roles */}
                    {(userRole === 'admin' || userRole === 'livreur') && (
                      <Button
                        icon={<HiOutlineStatusOnline />}
                        type="primary"
                        onClick={() => setIsStatusModalVisible(true)}
                      >
                        Changer le Statut
                      </Button>
                    )}
                    
                    {/* Button to Open Tracking Drawer */}
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

              {/* Scanned QR Code Items Table (if using QR code) */}
              {scanMethod === 'qrcode' && (
                <Table
                  columns={columns}
                  dataSource={scannedItems}
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

      {/* Change Status Modal */}
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
            {/* Display statuses as a list of clickable Tags */}
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

          {/* Conditionally render comment field */}
          <Form.Item
            name="comment"
            label="Commentaire"
            rules={[{ required: false, message: 'Ajouter un commentaire (facultatif)' }]}
          >
            <Input.TextArea placeholder="Ajouter un commentaire" rows={3} />
          </Form.Item>

          {/* Conditionally render deliveryTime field if status is 'Programmée' */}
          {statusType === "Programmée" && (
            <Form.Item
              name="deliveryTime"
              label="Temps de Livraison"
              rules={[{ required: true, message: 'Veuillez sélectionner un temps de livraison!' }]}
            >
              <Select placeholder="Sélectionner un temps de livraison">
                <Option value="1 jours">Demain</Option>
                <Option value="2 jours">Dans 2 jours</Option>
                <Option value="3 jours">Dans 3 jours</Option>
                <Option value="4 jours">Dans 4 jours</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Tracking Drawer */}
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
