import React, { useState } from 'react';
import { Input, Button, Select, Table, Typography, Space, notification } from 'antd';

const { Option } = Select;
const { Title } = Typography;

function ScanBarcode() {
  const [scannedItems, setScannedItems] = useState([]);
  const [currentBarcode, setCurrentBarcode] = useState('');
  const [status, setStatus] = useState('Ramassée'); // Default status

  // Function to fetch the colis by code_suivi
  const fetchColisByCodeSuivi = async (barcode) => {
    try {
      const response = await fetch(`http://localhost:8084/api/colis/code_suivi/${barcode}`);
      if (!response.ok) {
        throw new Error('Colis not found');
      }
      const colisData = await response.json();
      
      // Add the fetched colis to the scanned items table
      setScannedItems([
        ...scannedItems,
        { key: colisData._id, barcode: colisData.code_suivi, status: colisData.statut, ville: colisData.ville.nom }
      ]);
      notification.success({ message: 'Colis found and added to the list' });
    } catch (error) {
      console.error('Error fetching colis:', error);
      notification.error({ message: 'Error fetching colis', description: error.message });
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

  // Handle changing status
  const handleStatusChange = (value) => {
    setStatus(value);
  };

  // Handle barcode input change
  const handleBarcodeChange = (event) => {
    setCurrentBarcode(event.target.value);
  };

  // Define columns for the table
  const columns = [
    { title: 'Barcode', dataIndex: 'barcode', key: 'barcode' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Ville', dataIndex: 'ville', key: 'ville' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Title level={3}>Scan Barcode</Title>

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <label>Status: </label>
          <Select defaultValue="Ramassée" style={{ width: 120 }} onChange={handleStatusChange}>
            <Option value="Ramassée">Ramassée</Option>
            <Option value="Annulée">Annulée</Option>
          </Select>
        </div>

        <div>
          <Input
            placeholder="Scan barcode here..."
            value={currentBarcode}
            onChange={handleBarcodeChange}
            onKeyDown={handleBarcodeScan}
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

export default ScanBarcode;
