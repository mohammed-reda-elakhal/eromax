// src/scene/components/scan/components/ScanRamasser.jsx

import React, { useContext, useState, useEffect, useRef } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import './ScanRamasser.css';
import { Input, Button, Table, Space, notification, Modal, Card, message, Segmented, Switch } from 'antd';
import { CiBarcode } from "react-icons/ci";
import { CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import request from '../../../../utils/request';
import { toast } from 'react-toastify';
import { getLivreurList } from '../../../../redux/apiCalls/livreurApiCall';
import { useZxing } from 'react-zxing';
import { BarcodeFormat } from '@zxing/library';

function ScanRamasser() {
  const { theme } = useContext(ThemeContext);
  const { statu } = useParams();

  // State local
  const [scannedItems, setScannedItems] = useState([]);
  const [currentBarcode, setCurrentBarcode] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedLivreur, setSelectedLivreur] = useState(null);
  const [loading, setLoading] = useState(false);
  // Toggle scan mode and camera
  const [scanMode, setScanMode] = useState('barcode'); // 'barcode' | 'qr'
  const [cameraEnabled, setCameraEnabled] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Sélecteurs Redux
  const { livreurList } = useSelector(state => ({
    livreurList: state.livreur.livreurList,
  }));

  // Référence pour empêcher le traitement multiple des scans
  const isProcessingScan = useRef(false);

  // Sound effects
  const successAudioRef = useRef(null);
  const errorAudioRef = useRef(null);

  useEffect(() => {
    // Initialize audio elements (place files under public/static/sounds)
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

  // Récupérer la liste des livreurs au montage
  useEffect(() => {
    dispatch(getLivreurList());
  }, [dispatch]);

  // Handler pour supprimer un colis scanné par code-barres
  const handleRemoveScannedColis = (barcode) => {
    setScannedItems(prev => prev.filter(item => item.barcode !== barcode));
  };

  // Définition des colonnes pour la table
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

  // Fonction pour gérer le scan (depuis le champ Input)
  const handleScan = (scannedCode) => {
    if (!scannedCode || isProcessingScan.current) {
        return;
    }
    isProcessingScan.current = true;

    fetchColisByCodeSuivi(scannedCode);

    setTimeout(() => {
      isProcessingScan.current = false;
    }, 500);
  };

  // Camera scanner using react-zxing
  const { ref: videoRef } = useZxing({
    onResult(result) {
      try {
        const text = result?.getText?.() || result?.text || '';
        const format = result?.getBarcodeFormat?.() || result?.barcodeFormat;
        // Filter by mode: accept QR only in qr mode; in barcode mode, ignore QR
        if (scanMode === 'qr') {
          if (format !== BarcodeFormat.QR_CODE) return;
        } else {
          if (format === BarcodeFormat.QR_CODE) return;
        }
        if (text) {
          handleScan(text.trim());
          setCurrentBarcode('');
        }
      } catch (e) {
        // noop
      }
    },
    paused: !cameraEnabled,
    timeBetweenDecodingAttempts: 150,
    constraints: {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
      audio: false,
    },
  });

  // Fonction pour récupérer les détails du colis
  const fetchColisByCodeSuivi = async (barcode) => {
    if (scannedItems.some(item => item.barcode === barcode)) {
      notification.warning({
        message: 'Code Suivi déjà scanné',
        description: 'Ce code a déjà été scanné.',
      });
      playErrorSound();
      return;
    }

    try {
      const response = await request.get(`/api/colis/code_suivi/${barcode}`);
      const colisData = response.data;

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
        notification.error({
          message: 'Statut inconnu',
          description: `Le statut "${statu}" n'est pas reconnu.`,
        });
        playErrorSound();
        return;
      }

      if (!requiredStatuses.includes(colisData.statut)) {
        notification.warning({
          message: 'Statut de colis invalide',
          description: `Seuls les colis avec le statut "${requiredStatuses.join(' ou ')}" peuvent être scannés pour "${statu}".`,
        });
        playErrorSound();
        return;
      }

      setScannedItems((prevItems) => [
        {
          key: colisData._id,
          barcode: colisData.code_suivi,
          status: colisData.statut,
          ville: colisData.ville.nom,
        },
        ...prevItems,
      ]);

      notification.success({ message: 'Colis trouvé et ajouté à la liste' });
      playSuccessSound();
    } catch (error) {
      console.error('Erreur lors de la récupération du colis:', error);
      notification.error({
        message: 'Erreur lors de la récupération du colis',
        description: error.response?.data?.message || error.message,
      });
      playErrorSound();
    }
  };

  // Fonction pour changer le statut des colis
  const handleChangeStatu = async (codesuiviList) => {
    try {
      await request.put('/api/colis/statu/update', {
        colisCodes: codesuiviList,
        new_status: statu,
      });
      toast.success('Statut des colis mis à jour avec succès!');
      navigate('/dashboard/list-colis');
    } catch (err) {
      console.error("Erreur lors de la mise à jour des colis:", err);
      toast.error("Erreur lors de la mise à jour des colis.");
    }
  };

  // Gérer le clic sur le bouton d'action principal
  const handleAction = () => {
    if (scannedItems.length > 0) {
      const codesuiviList = scannedItems.map(item => item.barcode);
      if (statu === "Expediée") {
        setIsModalVisible(true);
      } else {
        handleChangeStatu(codesuiviList);
      }
    } else {
      toast.warn("Veuillez scanner au moins un colis !");
    }
  };

  // Confirmer la sélection du livreur
  const handleOk = async () => {
    if (!selectedLivreur) {
      message.warning('Veuillez sélectionner un livreur');
      return;
    }

    setLoading(true);
    const codesSuivi = scannedItems.map(item => item.barcode);

    try {
      if (selectedLivreur.nom === 'ameex') {
        const response = await request.post('/api/livreur/ameex', { codes_suivi: codesSuivi });
        const { success, errors } = response.data;
        if (success.length > 0) toast.success(`${success.length} colis assignés à Ameex.`);
        if (errors.length > 0) toast.error(`${errors.length} colis n'ont pas pu être assignés.`);
      } else {
        const response = await request.put('/api/colis/statu/affecter', {
          codesSuivi: codesSuivi,
          livreurId: selectedLivreur._id
        });
        toast.success(response.data.message);
      }
      navigate('/dashboard/list-colis');
    } catch (err) {
      toast.error("Une erreur est survenue lors de l'affectation.");
      console.error(err);
    } finally {
      setLoading(false);
      setIsModalVisible(false);
      setSelectedLivreur(null);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedLivreur(null);
  };

  return (
    <div className={theme === 'dark' ? 'dark-theme' : ''} style={{
      padding: '20px',
      backgroundColor: theme === 'dark' ? '#001529' : '#fff',
      color: theme === 'dark' ? '#fff' : '#000',
      minHeight: '100vh'
    }}>
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
          placeholder="Entrez ou scannez le code barre..."
          value={currentBarcode}
          onChange={(e) => setCurrentBarcode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && currentBarcode) {
              handleScan(currentBarcode);
              setCurrentBarcode('');
            }
          }}
          size="large"
          addonBefore={<CiBarcode />}
          className={theme === 'dark' ? 'dark-input' : ''}
          autoFocus // Met le focus sur le champ au chargement
        />

        <Button
          danger
          type="primary"
          onClick={() => setScannedItems([])}
          style={{ marginBottom: 12 }}
        >
          Vider la table
        </Button>

        <Table
          columns={columns}
          dataSource={scannedItems}
          rowKey="barcode"
          pagination={{ pageSize: 5 }}
          bordered
          title={() => <span style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Colis Scannés</span>}
          className={theme === 'dark' ? 'dark-table' : ''}
        />

        <Button
          type="primary"
          onClick={handleAction}
          style={{ marginTop: '20px' }}
          disabled={scannedItems.length === 0}
        >
          {statu} ({scannedItems.length})
        </Button>
      </Space>

      <Modal
        title={<span style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Sélectionner Livreur</span>}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={"90vw"}
        className={theme === 'dark' ? 'dark-modal' : ''}
      >
        <div className='livreur_list_modal'>
          <h3 style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Liste des Livreurs</h3>
          <div className="livreur_list_modal_card">
            {livreurList && livreurList.length > 0 ? (
              livreurList.map(livreur => (
                <Card
                  key={livreur._id}
                  hoverable
                  style={{
                    width: 240,
                    margin: '10px',
                    border: selectedLivreur?._id === livreur._id ? '2px solid #1890ff' : '1px solid #f0f0f0',
                  }}
                  className={theme === 'dark' ? 'dark-card' : ''}
                  onClick={() => setSelectedLivreur(livreur)}
                >
                  <Card.Meta
                    title={livreur.username}
                    description={
                      <>
                        <span>{livreur.tele}</span>
                        <Button
                          icon={<CheckCircleOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info(`Villes: ${livreur.villes.join(', ')}`);
                          }}
                          type='primary'
                          style={{ float: 'right' }}
                        />
                      </>
                    }
                  />
                </Card>
              ))
            ) : (
              <p>Aucun livreur disponible</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ScanRamasser;