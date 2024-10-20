import React, { useState } from 'react';
import { Input, Select, Table, Typography, Space, notification } from 'antd';
import QrScanner from 'react-qr-scanner';

const { Option } = Select;
const { Title } = Typography;

function ScanQrcode() {
  const [scannedItems, setScannedItems] = useState([]);
  const [currentBarcode, setCurrentBarcode] = useState('');
  const [status, setStatus] = useState('Ramassée'); // Default status
  const [qrCodeValue, setQrCodeValue] = useState('');

  // Function to fetch the colis by code_suivi
  const fetchColisByCodeSuivi = async (barcode) => {
    try {
      const response = await fetch(`http://localhost:8084/api/colis/code_suivi/${barcode}`);
      if (!response.ok) {
        throw new Error('Colis not found');
      }
      const colisData = await response.json();

      // Add the fetched colis to the scanned items table
      setScannedItems(prevItems => [
        ...prevItems,
        { key: colisData._id, barcode: colisData.code_suivi, status: colisData.statut, ville: colisData.ville.nom }
      ]);
      notification.success({ message: 'Colis found and added to the list' });

      // Clear the current QR code value and reset the input for the next scan
      setQrCodeValue('');
      setCurrentBarcode('');
    } catch (error) {
      console.error('Error fetching colis:', error);
      notification.error({ message: 'Error fetching colis', description: error.message });
    }
  };

  // Handle QR code scan success
  const handleScan = (data) => {
    if (data && data.text && !scannedItems.some(item => item.barcode === data.text)) {
      setQrCodeValue(data.text); // Set the QR code value as the current barcode
      setCurrentBarcode(data.text); // Extract the text from the QR code
      fetchColisByCodeSuivi(data.text); // Fetch colis automatically after QR code scan
    }
  };

  // Handle QR code scan error
  const handleError = (error) => {
    console.error('Error scanning QR code:', error);
    notification.error({ message: 'Error scanning QR code', description: error.message });
  };

  // Handle changing status
  const handleStatusChange = (value) => {
    setStatus(value);
  };

  // Define columns for the table
  const columns = [
    { title: 'Barcode', dataIndex: 'barcode', key: 'barcode' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Ville', dataIndex: 'ville', key: 'ville' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Title level={3}>Scan QR Code</Title>

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <label>Status: </label>
          <Select defaultValue="Ramassée" style={{ width: 120 }} onChange={handleStatusChange}>
            <Option value="Ramassée">Ramassée</Option>
            <Option value="Annulée">Annulée</Option>
          </Select>
        </div>

        <div>
          {/* QR Code Scanner */}
          <QrScanner
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: '400px', height: '400px' }} // Set scanner size to 400px by 400px
          />
        </div>

        <div>
          <Input
            placeholder="Scanned QR Code will appear here..."
            value={currentBarcode}
            onChange={(e) => setCurrentBarcode(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={scannedItems}
          pagination={false}
          bordered
          title={() => 'Scanned Items'}
        />
      </Space>
    </div>
  );
}

export default ScanQrcode;
