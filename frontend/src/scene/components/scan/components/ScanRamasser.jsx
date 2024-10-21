import React, { useState } from 'react';
import { Input, Button, Select, Table, Typography, Space, notification } from 'antd';
import BarcodeReader from 'react-barcode-reader';
import QrScanner from 'react-qr-scanner';
import request from '../../../../utils/request';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { ramasserColis } from '../../../../redux/apiCalls/colisApiCalls';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { Title } = Typography;

function ScanRamasser() {
  const [scannedItems, setScannedItems] = useState([]);
  const [currentBarcode, setCurrentBarcode] = useState('');
  const [status, setStatus] = useState('Ramassée'); // Default status
  const [scanMethod, setScanMethod] = useState('barcode'); // Toggle between barcode and QR code scanner
  const [scannerEnabled, setScannerEnabled] = useState(true); // Control scanner visibility
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Function to fetch the colis by code_suivi
  const fetchColisByCodeSuivi = async (barcode) => {
    // Check if the barcode is already scanned
    if (scannedItems.some(item => item.barcode === barcode)) {
      notification.warning({ message: 'Code Suivi already scanned', description: 'This code has already been scanned.' });
      return; // If the code is already scanned, exit the function
    }

    try {
      const response = await request.get(`/api/colis/code_suivi/${barcode}`);
      const colisData = response.data;  // Get the data from the Axios response

      // Check if the colis has the status "attente de ramassage"
      if (colisData.statut !== 'attente de ramassage') {
        notification.warning({ message: 'Invalid Colis Status', description: 'Only colis with status "attente de ramassage" can be scanned.' });
        return; // If the status is not "attente de ramassage", exit the function
      }

      // Add the fetched colis to the scanned items table
      setScannedItems((prevItems) => [
        ...prevItems,
        { key: colisData._id, barcode: colisData.code_suivi, status: colisData.statut, ville: colisData.ville.nom }
      ]);

      notification.success({ message: 'Colis found and added to the list' });
    } catch (error) {
      console.error('Error fetching colis:', error);
      notification.error({ message: 'Error fetching colis', description: error.response?.data?.message || error.message });
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
      fetchColisByCodeSuivi(data.text);  // Use the same handleScan method for QR code
      setScannerEnabled(false); // Disable scanner after scan
    }
  };

  // Handle scan errors
  const handleError = (err) => {
    console.error("Scan Error:", err);
    notification.error({ message: 'Error scanning code', description: err.message });
  };

  // Rescan function to enable the scanner again
  const handleRescan = () => {
    setCurrentBarcode('');
    setScannerEnabled(true); // Re-enable the scanner
  };

  // Handle changing status
  const handleStatusChange = (value) => {
    setStatus(value);
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

  // Function to log and send all code_suivi from the table for ramassage
const handleRamasser = async () => {
    const codeSuiviList = scannedItems.map(item => ({ code_suivi: item.barcode }));  // Adjusted to send as objects
    console.log('Code Suivi List:', codeSuiviList);
    try {
      const response = await request.post(`/api/colis/St/multiple/`, { colisList: codeSuiviList });
      notification.success({ message: response.data.message });
      navigate('/dashboard/list-colis')
    } catch (error) {
      console.error('Error updating colis:', error);
      notification.error({ message: 'Error updating colis', description: error.response?.data?.message || error.message });
    }
  };
  

  // Define columns for the table
  const columns = [
    { title: 'Barcode', dataIndex: 'barcode', key: 'barcode' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Ville', dataIndex: 'ville', key: 'ville' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Title level={3}>Scan Colis</Title>

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Select scan method */}
        <div>
          <label>Scan Method: </label>
          <Select defaultValue="barcode" style={{ width: 200 }} onChange={handleScanMethodChange}>
            <Option value="barcode">Barcode Scanner</Option>
            <Option value="qrcode">QR Code Scanner</Option>
          </Select>
        </div>

        {/* Select status */}
        <div>
          <label>Status: </label>
          <Select defaultValue="Ramassée" style={{ width: 120 }} onChange={handleStatusChange}>
            <Option value="Ramassée">Ramassée</Option>
            <Option value="Annulée">Annulée</Option>
          </Select>
        </div>

        {/* Barcode Reader */}
        {scanMethod === 'barcode' && scannerEnabled && (
          <>
            <BarcodeReader onError={handleError} onScan={handleBarcodeScan} />
            <Input
              placeholder="Enter or scan the barcode..."
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
            Scan Another Colis
          </Button>
        )}

        {/* Table to display scanned items */}
        <Table
          columns={columns}
          dataSource={scannedItems}
          pagination={false}
          bordered
          title={() => 'Scanned Items'}
        />

        {/* Button to log all code_suivi */}
        <Button type="primary" onClick={handleRamasser} style={{ marginTop: '20px' }}>
          Ramasser Touts
        </Button>
      </Space>
    </div>
  );
}

export default ScanRamasser;
