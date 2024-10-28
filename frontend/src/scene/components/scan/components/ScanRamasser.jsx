import React, { useState } from 'react';
import { Input, Button, Select, Table, Typography, Space, notification } from 'antd';
import BarcodeReader from 'react-barcode-reader';
import QrScanner from 'react-qr-scanner';
import request from '../../../../utils/request';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { ramasserColis } from '../../../../redux/apiCalls/colisApiCalls';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const { Option } = Select;
const { Title } = Typography;

function ScanRamasser({ statu }) {
  const [scannedItems, setScannedItems] = useState([]);
  const [currentBarcode, setCurrentBarcode] = useState('');
  const [status, setStatus] = useState(statu); // Use the passed 'statu' prop
  const [scanMethod, setScanMethod] = useState('barcode'); // Toggle between barcode and QR code scanner
  const [scannerEnabled, setScannerEnabled] = useState(true); // Control scanner visibility
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Function to fetch the colis by code_suivi
  const fetchColisByCodeSuivi = async (barcode) => {
    // Check if the barcode is already scanned
    if (scannedItems.some(item => item.barcode === barcode)) {
      notification.warning({
        message: 'Code Suivi déjà scanné',
        description: 'Ce code a déjà été scanné.',
      });
      return; // If the code is already scanned, exit the function
    }

    try {
      const response = await request.get(`/api/colis/code_suivi/${barcode}`);
      const colisData = response.data; // Get the data from the Axios response

      // Map of required previous status for each 'statu' prop value
      const requiredStatusMap = {
        'Ramassée': 'attente de ramassage',
        'Reçu': 'Expediée',
        'Mise en Distribution': 'Reçu',
        'Livrée': 'Mise en Distribution',
      };

      // Get the required previous status based on 'statu' prop
      const requiredStatus = requiredStatusMap[statu];

      // Check if the colis has the required previous status
      if (colisData.statut !== requiredStatus) {
        notification.warning({
          message: 'Statut de colis invalide',
          description: `Seuls les colis avec le statut "${requiredStatus}" peuvent être scannés pour "${statu}".`,
        });
        return; // Exit the function if the status does not match
      }

      // Add the fetched colis to the scanned items table
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
      console.error('Error fetching colis:', error);
      notification.error({
        message: 'Erreur lors de la récupération du colis',
        description: error.response?.data?.message || error.message,
      });
    }
  };

  // Handle barcode input (this will be used when a barcode is scanned)
  const handleBarcodeScan = (event) => {
    if (event.key === 'Enter' && currentBarcode) {
      // Fetch the colis information using the scanned barcode (code_suivi)
      fetchColisByCodeSuivi(currentBarcode);
      // Clear the input field
      setCurrentBarcode('');
    }
  };

  // Handle QR code scan success
  const handleQrScan = (data) => {
    if (data && data.text) {
      fetchColisByCodeSuivi(data.text); // Use the same handleScan method for QR code
      setScannerEnabled(false); // Disable scanner after scan
    }
  };

  // Handle scan errors
  const handleError = (err) => {
    console.error('Scan Error:', err);
    notification.error({ message: 'Erreur lors du scan', description: err.message });
  };

  // Rescan function to enable the scanner again
  const handleRescan = () => {
    setCurrentBarcode('');
    setScannerEnabled(true); // Re-enable the scanner
  };

  // Handle barcode input change
  const handleBarcodeChange = (event) => {
    setCurrentBarcode(event.target.value);
  };

  // Handle switching between barcode and QR code
  const handleScanMethodChange = (value) => {
    setScanMethod(value); // Set the scan method to either barcode or QR code
    setCurrentBarcode(''); // Clear the input on switching
    setScannerEnabled(true); // Enable scanner when switching
  };

 // Function to handle the action (e.g., ramasser)
const handleAction = async () => {
  // Map scannedItems to an array of barcode strings
  const codeSuiviList = scannedItems.map(item => item.barcode);
  console.log('Code Suivi List:', codeSuiviList);
  try {
    // Send a PUT request to update the status of selected colis
    const response = await request.put('/api/colis/statu/update', {
      colisCodes: codeSuiviList,
      new_status: statu
    });
    toast.success(response.data.message);
    // Update the local data to remove the updated colis
    navigate('/dashboard/list-colis');
  } catch (err) {
    toast.error("Erreur lors de la mise à jour des colis.");
  }
};


  // Define columns for the table
  const columns = [
    { title: 'Code Barre', dataIndex: 'barcode', key: 'barcode' },
    { title: 'Statut', dataIndex: 'status', key: 'status' },
    { title: 'Ville', dataIndex: 'ville', key: 'ville' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Title level={3}>Scan Colis</Title>

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Select scan method */}
        <div>
          <label>Méthode de scan: </label>
          <Select defaultValue="barcode" style={{ width: 200 }} onChange={handleScanMethodChange}>
            <Option value="barcode">Scanner Code Barre</Option>
            <Option value="qrcode">Scanner QR Code</Option>
          </Select>
        </div>

        {/* Barcode Reader */}
        {scanMethod === 'barcode' && scannerEnabled && (
          <>
            <BarcodeReader onError={handleError} onScan={handleBarcodeScan} />
            <Input
              placeholder="Entrez ou scannez le code barre..."
              value={currentBarcode}
              onChange={handleBarcodeChange}
              onKeyDown={handleBarcodeScan}
              style={{ width: '100%' }}
            />
          </>
        )}

        {/* QR Code Reader */}
        {scanMethod === 'qrcode' && scannerEnabled && (
          <QrScanner
            delay={300}
            onError={handleError}
            onScan={handleQrScan}
            style={{ width: '400px', height: '400px' }} // Set scanner size to 400px by 400px
          />
        )}

        {/* Rescan Button */}
        {!scannerEnabled && (
          <Button type="primary" onClick={handleRescan}>
            Scanner un autre colis
          </Button>
        )}

        {/* Table to display scanned items */}
        <Table
          columns={columns}
          dataSource={scannedItems}
          pagination={false}
          bordered
          title={() => 'Articles scannés'}
        />

        {/* Button to perform action */}
        <Button type="primary" onClick={handleAction} style={{ marginTop: '20px' }}>
          {statu} Tous
        </Button>
      </Space>
    </div>
  );
}

export default ScanRamasser;
