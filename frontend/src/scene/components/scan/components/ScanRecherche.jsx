import React, { useContext, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { Button, Input, Card, Descriptions, Spin, Alert, Select, Space, Table, notification } from 'antd';
import { CiBarcode } from "react-icons/ci";
import { useDispatch, useSelector } from 'react-redux';
import BarcodeReader from 'react-barcode-reader';
import QrScanner from 'react-qr-scanner';
import { getColisByCodeSuivi } from '../../../../redux/apiCalls/colisApiCalls';

const { Meta } = Card;
const { Option } = Select;

function ScanRecherche() {
    const { theme } = useContext(ThemeContext);
    const dispatch = useDispatch();
    const { selectedColis, loading, error } = useSelector(state => state.colis);

    const [codeSuivi, setCodeSuivi] = useState('');  // State to store the barcode/QR code
    const [scanMethod, setScanMethod] = useState('barcode');  // Toggle between barcode and QR code scanner
    const [scannerEnabled, setScannerEnabled] = useState(true);  // Control scanner visibility
    const [scannedItems, setScannedItems] = useState([]);  // Store scanned items for QR code

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
                                <label>Scan Method: </label>
                                <Select defaultValue="barcode" style={{ width: 200 }} onChange={handleScanMethodChange}>
                                    <Option value="barcode">Barcode Scanner</Option>
                                    <Option value="qrcode">QR Code Scanner</Option>
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
                                        placeholder="Enter or scan the code suivi"
                                        style={{ marginBottom: '20px' }}
                                        size="large"
                                        addonBefore={<CiBarcode />}
                                    />
                                    <Button type="primary" onClick={() => handleScan(codeSuivi)} loading={loading}>
                                        Search Colis
                                    </Button>
                                </>
                            )}

                            {/* QR Code Reader */}
                            {scanMethod === 'qrcode' && scannerEnabled && (
                                <>
                                    <QrScanner
                                        delay={300}
                                        onError={handleError}
                                        onScan={handleQrScan}
                                        style={{ width: '400px', height: '400px' }}  // Set scanner size
                                    />
                                </>
                            )}

                            {/* Rescan Button */}
                            {scanMethod === 'qrcode' && !scannerEnabled && (
                                <Button type="primary" onClick={handleRescan}>
                                    Rescan QR Code
                                </Button>
                            )}

                            {scanMethod === 'qrcode' && (
                                <Input
                                    value={codeSuivi}
                                    onChange={(e) => setCodeSuivi(e.target.value)}
                                    placeholder="Scanned QR Code will appear here..."
                                    style={{ width: '100%' }}
                                    disabled={scannerEnabled}  // Disable input when scanner is enabled
                                />
                            )}

                            {/* Display loading spinner */}
                            {loading && <Spin style={{ marginTop: '20px' }} />}

                            {/* Display error if any */}
                            {error && <Alert message="Error" description={error} type="error" showIcon style={{ marginTop: '20px' }} />}

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
        </div>
    );
}

export default ScanRecherche;
