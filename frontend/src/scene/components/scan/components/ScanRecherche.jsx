// src/scene/components/scan/components/ScanRecherche.jsx

import React, { useContext, useState, useRef } from 'react';
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
  Space,
  notification,
  Modal,
  Form,
  Tag,
  message,
  Drawer,
  Row,
  Col,
  Typography,
  DatePicker,
  Segmented,
  Switch,
  Divider,
} from 'antd';
import { CiBarcode } from "react-icons/ci";
import { useDispatch, useSelector } from 'react-redux';
import { getColisByCodeSuivi, updateStatut } from '../../../../redux/apiCalls/colisApiCalls';
import TrackingColis from '../../../global/TrackingColis '; // Corrected import path
import { Si1001Tracklists } from 'react-icons/si';
import moment from 'moment';
import { useZxing } from 'react-zxing';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

const { Meta } = Card;
const { Text } = Typography;

function ScanRecherche() {
  const { theme } = useContext(ThemeContext);
  const dispatch = useDispatch();

  // State
  const { selectedColis, loading, error } = useSelector(state => state.colis);
  const { user } = useSelector(state => state.auth);
  const userRole = user?.role;

  const [codeSuivi, setCodeSuivi] = useState('');
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [statusType, setStatusType] = useState(null);
  const [form] = Form.useForm();
  const [isTrackingDrawerVisible, setIsTrackingDrawerVisible] = useState(false);

  // Camera scanning state
  const [scanMode, setScanMode] = useState('barcode'); // 'barcode' | 'qr'
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const lastScanRef = useRef({ text: '', time: 0 });
  const isProcessingScan = useRef(false);

  // Sound effects
  const successAudioRef = useRef(null);
  const errorAudioRef = useRef(null);

  useEffect(() => {
    // Initialize audio elements
    successAudioRef.current = new Audio('/static/sounds/success.mp3');
    errorAudioRef.current = new Audio('/static/sounds/error.mp3');
    if (successAudioRef.current) {
      successAudioRef.current.preload = 'auto';
      successAudioRef.current.volume = 0.5;
    }
    if (errorAudioRef.current) {
      errorAudioRef.current.preload = 'auto';
      errorAudioRef.current.volume = 0.5;
    }
  }, []);

  const beep = (type = 'success') => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      if (type === 'success') {
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } else {
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      }
    } catch (e) {
      console.log('Audio not available');
    }
  };

  const playSuccessSound = async () => {
    try {
      if (successAudioRef.current) {
        successAudioRef.current.currentTime = 0;
        await successAudioRef.current.play();
        return;
      }
    } catch (e) {
      // fall back to beep
    }
    beep('success');
  };

  const playErrorSound = async () => {
    try {
      if (errorAudioRef.current) {
        errorAudioRef.current.currentTime = 0;
        await errorAudioRef.current.play();
        return;
      }
    } catch (e) {
      // fall back to beep
    }
    beep('error');
  };
  const { ref: videoRef } = useZxing({
    onDecodeResult(result) {
      try {
        const text = result?.getText?.() || result?.text || '';
        const format = result?.getBarcodeFormat?.() || result?.barcodeFormat;
        
        console.log('📷 Scan detected:', { text, format });
        
        if (!text) {
          console.log('❌ Empty scan text');
          return;
        }
        
        // Debounce duplicates within 1.2s
        const now = Date.now();
        if (lastScanRef.current.text === text && now - lastScanRef.current.time < 1200) {
          console.log('⏭️ Duplicate scan ignored (debounced)');
          return;
        }
        
        // Filter by mode, but allow when format is undefined
        if (scanMode === 'qr') {
          if (format != null && format !== BarcodeFormat.QR_CODE) {
            console.log('❌ Not a QR code, skipping');
            return;
          }
        } else {
          if (format === BarcodeFormat.QR_CODE) {
            console.log('❌ QR code detected in barcode mode, skipping');
            return;
          }
        }
        
        lastScanRef.current = { text, time: now };
        console.log('✅ Valid scan, processing:', text.trim());
        handleScan(text.trim());
      } catch (e) {
        console.error('❌ Scan error:', e);
        playErrorSound();
      }
    },
    paused: !cameraEnabled,
    timeBetweenDecodingAttempts: 100,
    constraints: {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
      audio: false,
    },
    hints: new Map([
      [
        DecodeHintType.POSSIBLE_FORMATS,
        scanMode === 'qr'
          ? [BarcodeFormat.QR_CODE]
          : [
              BarcodeFormat.CODE_128,
              BarcodeFormat.CODE_39,
              BarcodeFormat.EAN_13,
              BarcodeFormat.EAN_8,
              BarcodeFormat.UPC_A,
              BarcodeFormat.UPC_E,
              BarcodeFormat.ITF,
            ],
      ],
      [DecodeHintType.TRY_HARDER, true],
    ]),
  });

  const allowedStatuses = [
    "Livrée", "Annulée", "Programmée", "Refusée", "Boite vocale",
    "Pas de reponse jour 1", "Pas de reponse jour 2", "Pas de reponse jour 3",
    "Pas reponse + sms / + whatsap", "En voyage", "Injoignable", "Hors-zone",
    "Intéressé", "Numéro Incorrect", "Reporté", "Confirmé Par Livreur",
    "Endomagé", "Prét Pour Expédition", "Manque de stock",
  ];

  const handleSearch = () => {
    if (!codeSuivi) {
        notification.warning({ message: "Veuillez entrer un code de suivi." });
        playErrorSound();
        return;
    }
    console.log('🔍 Manual search for code:', codeSuivi);
    dispatch(getColisByCodeSuivi(codeSuivi))
      .then((result) => {
        if (result) {
          console.log('✅ Colis found:', result);
          playSuccessSound();
          notification.success({ 
            message: 'Colis trouvé!',
            description: `Code: ${codeSuivi}` 
          });
        }
      })
      .catch((error) => {
        console.error('❌ Error fetching colis:', error);
        playErrorSound();
        notification.error({ 
          message: 'Colis non trouvé',
          description: error?.response?.data?.message || 'Vérifiez le code de suivi' 
        });
      });
  };

  // Function to handle scan from the reader
  const handleScan = (scannedCode) => {
    if (!scannedCode || isProcessingScan.current) {
      console.log('⏭️ Scan ignored - processing or empty');
      return;
    }
    
    isProcessingScan.current = true;
    console.log('📷 Processing scanned code:', scannedCode);
    
    setCodeSuivi(scannedCode);
    dispatch(getColisByCodeSuivi(scannedCode))
      .then((result) => {
        if (result) {
          console.log('✅ Colis found via scan:', result);
          playSuccessSound();
          notification.success({ 
            message: 'Colis scanné avec succès!',
            description: `Code: ${scannedCode}`,
            duration: 2
          });
        }
      })
      .catch((error) => {
        console.error('❌ Error scanning colis:', error);
        playErrorSound();
        notification.error({ 
          message: 'Colis non trouvé',
          description: 'Vérifiez le code scanné' 
        });
      })
      .finally(() => {
        setTimeout(() => {
          isProcessingScan.current = false;
        }, 500);
      });
  };

  // Function to handle scan errors
  const handleError = (error) => {
    console.error("Scan Error:", error);
    notification.error({
      message: 'Erreur lors du scan',
      description: error?.message || 'Une erreur est survenue lors du scan.'
    });
  };

  // Function to submit status change
  const handleStatusOk = () => {
    form.validateFields().then(values => {
      const { status, comment, selectedDate } = values;

      if ((status === "Programmée" || status === "Reporté") && !selectedDate) {
        message.error("Veuillez sélectionner une date pour ce statut.");
        return;
      }

      const formattedDate = selectedDate ? selectedDate.format('YYYY-MM-DD') : undefined;
      dispatch(updateStatut(selectedColis._id, status, comment, formattedDate));

      form.resetFields();
      setStatusType(null);
      setIsStatusModalVisible(false);
      dispatch(getColisByCodeSuivi(selectedColis.code_suivi));
    }).catch(info => {
      console.log('Validation Failed:', info);
    });
  };

  // Function to cancel status change
  const handleStatusCancel = () => {
    form.resetFields();
    setStatusType(null);
    setIsStatusModalVisible(false);
  };

  // Functions to manage tracking drawer visibility
  const showTrackingDrawer = () => setIsTrackingDrawerVisible(true);
  const closeTrackingDrawer = () => setIsTrackingDrawerVisible(false);

  return (
    <div className='page-dashboard'>
      <Menubar />
      <main className="page-main">
        <Topbar />
        <div
          className={`page-content ${theme === 'dark' ? 'dark-theme' : ''}`}
          style={{
            backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray1)',
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
            }}
          >
            <h4 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
              Recherche Colis :
            </h4>

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {/* Scan mode and camera controls */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <Segmented
                  options={[
                    { label: 'Barcode', value: 'barcode' },
                    { label: 'QR Code', value: 'qr' },
                  ]}
                  value={scanMode}
                  onChange={setScanMode}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Switch
                    checked={cameraEnabled}
                    onChange={setCameraEnabled}
                  />
                  <span style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
                    {cameraEnabled ? 'Camera activée' : 'Camera désactivée'}
                  </span>
                </div>
              </div>
              {cameraEnabled && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', width: '100%', maxWidth: 480 }}>
                    <video
                      ref={videoRef}
                      style={{ width: '100%', borderRadius: 8, border: '1px solid #e5e7eb' }}
                      muted
                      playsInline
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        border: '2px dashed #1677ff',
                        borderRadius: 8,
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                  <div style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
                    Pointez la caméra vers le {scanMode === 'qr' ? 'QR code' : 'code-barres'}.
                  </div>
                </div>
              )}

              <Input
                value={codeSuivi}
                onChange={(e) => setCodeSuivi(e.target.value)}
                onPressEnter={handleSearch}
                placeholder="Entrez ou scannez le code suivi"
                size="large"
                addonBefore={<CiBarcode />}
                className={theme === 'dark' ? 'dark-input' : ''}
              />
              <Button
                type="primary"
                onClick={handleSearch}
                loading={loading}
              >
                Rechercher Colis
              </Button>

              {error && (
                <Alert
                  message="Erreur"
                  description={error}
                  type="error"
                  showIcon
                  style={{ marginTop: '20px' }}
                />
              )}

              {selectedColis && (
                <Card
                  style={{ marginTop: '20px' }}
                  className={theme === 'dark' ? 'dark-card' : ''}
                >
                  <Meta title={`Colis: ${selectedColis.code_suivi || ''}`} />

                  {/* Résumé */}
                  <Divider orientation="left">Résumé</Divider>
                  <Row gutter={[16, 8]}>
                    <Col xs={24} sm={12} md={8}><Text strong>Code suivi:</Text><br /><Text>{selectedColis.code_suivi}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Statut actuel:</Text><br /><Text>{selectedColis.statut || '—'}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Statut final:</Text><br /><Text>{selectedColis.statu_final || '—'}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Expédition:</Text><br /><Text>{selectedColis.expedation_type || '—'}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Nature produit:</Text><br /><Text>{selectedColis.nature_produit || '—'}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Créé le:</Text><br /><Text>{selectedColis.createdAt ? moment(selectedColis.createdAt).format('YYYY-MM-DD HH:mm') : '—'}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>MàJ le:</Text><br /><Text>{selectedColis.updatedAt ? moment(selectedColis.updatedAt).format('YYYY-MM-DD HH:mm') : '—'}</Text></Col>
                  </Row>

                  {/* Destinataire */}
                  <Divider orientation="left">Destinataire</Divider>
                  <Row gutter={[16, 8]}>
                    <Col xs={24} sm={12} md={8}><Text strong>Nom:</Text><br /><Text>{selectedColis.nom || '—'}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Téléphone:</Text><br /><Text>{selectedColis.tele || '—'}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Ville:</Text><br /><Text>{selectedColis.ville?.nom || '—'}</Text></Col>
                    <Col xs={24} sm={12} md={24}><Text strong>Adresse:</Text><br /><Text>{selectedColis.adresse || '—'}</Text></Col>
                    <Col xs={24} sm={12} md={12}><Text strong>Commentaire:</Text><br /><Text>{selectedColis.commentaire || '—'}</Text></Col>
                    {selectedColis.note && (
                      <Col xs={24} sm={12} md={12}><Text strong>Note:</Text><br /><Text>{selectedColis.note}</Text></Col>
                    )}
                  </Row>

                  {/* Tarification */}
                  <Divider orientation="left">Tarification</Divider>
                  <Row gutter={[16, 8]}>
                    <Col xs={24} sm={12} md={8}><Text strong>Prix (colis):</Text><br /><Text>{selectedColis.prix != null ? `${selectedColis.prix} DH` : '—'}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Prix payé:</Text><br /><Text>{selectedColis.prix_payer != null ? `${selectedColis.prix_payer} DH` : '—'}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Tarif ajouté:</Text><br /><Text>{selectedColis.tarif_ajouter?.value != null ? `${selectedColis.tarif_ajouter?.value} DH` : '—'}</Text></Col>
                    <Col xs={24}><Text type="secondary">{selectedColis.tarif_ajouter?.description || ''}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>CRBT - Prix colis:</Text><br /><Text>{selectedColis.crbt?.prix_colis != null ? `${selectedColis.crbt.prix_colis} DH` : '—'}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>CRBT - Tarif livraison:</Text><br /><Text>{selectedColis.crbt?.tarif_livraison != null ? `${selectedColis.crbt.tarif_livraison} DH` : '—'}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>CRBT - Tarif refus:</Text><br /><Text>{selectedColis.crbt?.tarif_refuse != null ? `${selectedColis.crbt.tarif_refuse} DH` : '—'}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>CRBT - Tarif fragile:</Text><br /><Text>{selectedColis.crbt?.tarif_fragile != null ? `${selectedColis.crbt.tarif_fragile} DH` : '—'}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>CRBT - Supplémentaire:</Text><br /><Text>{selectedColis.crbt?.tarif_supplementaire != null ? `${selectedColis.crbt.tarif_supplementaire} DH` : '—'}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>CRBT - À payer:</Text><br /><Text>{selectedColis.crbt?.prix_a_payant != null ? `${selectedColis.crbt.prix_a_payant} DH` : '—'}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>CRBT - Total tarifs:</Text><br /><Text>{selectedColis.crbt?.total_tarif != null ? `${selectedColis.crbt.total_tarif} DH` : '—'}</Text></Col>
                  </Row>

                  {/* Drapeaux */}
                  <Divider orientation="left">Drapeaux</Divider>
                  <Row gutter={[16, 8]}>
                    <Col xs={24} sm={12} md={6}><Text strong>Payée:</Text><br /><Text>{selectedColis.etat ? 'Oui' : 'Non'}</Text></Col>
                    <Col xs={24} sm={12} md={6}><Text strong>Ouvrir:</Text><br /><Text>{selectedColis.ouvrir ? 'Oui' : 'Non'}</Text></Col>
                    <Col xs={24} sm={12} md={6}><Text strong>Fragile:</Text><br /><Text>{selectedColis.is_fragile ? 'Oui' : 'Non'}</Text></Col>
                    <Col xs={24} sm={12} md={6}><Text strong>Remplacée:</Text><br /><Text>{selectedColis.is_remplace ? 'Oui' : 'Non'}</Text></Col>
                    <Col xs={24} sm={12} md={6}><Text strong>Prêt payant:</Text><br /><Text>{selectedColis.pret_payant ? 'Oui' : 'Non'}</Text></Col>
                  </Row>

                  {/* Logistique */}
                  <Divider orientation="left">Logistique</Divider>
                  <Row gutter={[16, 8]}>
                    <Col xs={24} sm={12} md={8}><Text strong>Livreur:</Text><br /><Text>{selectedColis.livreur?.nom || '—'}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Télé Livreur:</Text><br /><Text>{selectedColis.livreur?.tele || '—'}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Équipe:</Text><br /><Text>{selectedColis.team?.nom || '—'}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Store:</Text><br /><Text>{selectedColis.store?.storeName || '—'}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Client:</Text><br /><Text>{selectedColis.store?.id_client?.nom || '—'}</Text></Col>
                  </Row>

                  {/* Dates */}
                  <Divider orientation="left">Dates</Divider>
                  <Row gutter={[16, 8]}>
                    <Col xs={24} sm={12} md={8}><Text strong>Date programmée:</Text><br /><Text>{selectedColis.date_programme ? moment(selectedColis.date_programme).format('YYYY-MM-DD') : '—'}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Date reportée:</Text><br /><Text>{selectedColis.date_reporte ? moment(selectedColis.date_reporte).format('YYYY-MM-DD') : '—'}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Date livraisant:</Text><br /><Text>{selectedColis.date_livraisant ? moment(selectedColis.date_livraisant).format('YYYY-MM-DD') : '—'}</Text></Col>
                  </Row>

                  {/* Références */}
                  <Divider orientation="left">Références</Divider>
                  <Row gutter={[16, 8]}>
                    <Col xs={24} sm={12} md={8}><Text strong>Code Ameex:</Text><br /><Text>{selectedColis.code_suivi_ameex || '—'}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Code Gdil:</Text><br /><Text>{selectedColis.code_suivi_gdil || '—'}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>ID Colis:</Text><br /><Text>{selectedColis._id}</Text></Col>
                  </Row>

                  <Space direction="horizontal" size="middle" style={{ marginTop: 20 }}>
                    {(userRole === 'admin' || userRole === 'livreur') && (
                      <Button
                        icon={<HiOutlineStatusOnline />}
                        type="primary"
                        onClick={() => setIsStatusModalVisible(true)}
                      >
                        Changer le Statut
                      </Button>
                    )}
                    <Button
                      icon={<Si1001Tracklists />}
                      type="default"
                      onClick={showTrackingDrawer}
                    >
                      Voir le Suivi
                    </Button>
                  </Space>
                </Card>
              )}
            </Space>
          </div>
        </div>
      </main>

      <Modal
        title={`Changer le Statut de ${selectedColis?.code_suivi || ''}`}
        open={isStatusModalVisible}
        onOk={handleStatusOk}
        onCancel={handleStatusCancel}
        okText="Confirmer"
        cancelText="Annuler"
        className={theme === 'dark' ? 'dark-modal' : ''}
      >
        <Form form={form} layout="vertical" name="form_status">
          <Form.Item
            name="status"
            label="Nouveau Statut"
            rules={[{ required: true, message: 'Veuillez sélectionner un statut!' }]}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {allowedStatuses.map((status) => (
                <Tag.CheckableTag
                  key={status}
                  checked={statusType === status}
                  onChange={() => {
                    form.setFieldsValue({ status });
                    setStatusType(status);
                  }}
                >
                  {status}
                </Tag.CheckableTag>
              ))}
            </div>
          </Form.Item>

          <Form.Item
            name="comment"
            label="Commentaire (facultatif)"
          >
            <Input.TextArea
              placeholder="Ajouter un commentaire"
              rows={3}
              className={theme === 'dark' ? 'dark-input' : ''}
            />
          </Form.Item>

          {(statusType === "Programmée" || statusType === "Reporté") && (
            <Form.Item
              name="selectedDate"
              label="Date"
              rules={[{ required: true, message: 'Veuillez sélectionner une date!' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                disabledDate={(current) => current && current < moment().startOf('day')}
                format="YYYY-MM-DD"
                className={theme === 'dark' ? 'dark-datepicker' : ''}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Drawer
        title={`Suivi du Colis: ${selectedColis?.code_suivi || ''}`}
        placement="right"
        onClose={closeTrackingDrawer}
        open={isTrackingDrawerVisible}
        width={500}
        className={theme === 'dark' ? 'dark-drawer' : ''}
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