// src/scene/components/scan/components/ScanRecherche.jsx

import React, { useContext, useState } from 'react';
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
} from 'antd';
import { CiBarcode } from "react-icons/ci";
import { useDispatch, useSelector } from 'react-redux';
import { getColisByCodeSuivi, updateStatut } from '../../../../redux/apiCalls/colisApiCalls';
import TrackingColis from '../../../global/TrackingColis '; // Corrected import path
import { Si1001Tracklists } from 'react-icons/si';
import moment from 'moment';

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
        return;
    };
    dispatch(getColisByCodeSuivi(codeSuivi));
  };

  // Function to handle scan from the reader
  const handleScan = (scannedCode) => {
    if (!scannedCode) return;
    setCodeSuivi(scannedCode);
    dispatch(getColisByCodeSuivi(scannedCode));
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
              <BarcodeReader onError={handleError} onScan={handleScan} />
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
                  <Meta title={`Colis: ${selectedColis.code_suivi}`} />

                  <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
                    <Col xs={24} sm={12} md={8}><Text strong>Nom:</Text><br /><Text>{selectedColis.nom}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Téléphone:</Text><br /><Text>{selectedColis.tele}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Ville:</Text><br /><Text>{selectedColis.ville.nom}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Adresse:</Text><br /><Text>{selectedColis.adresse}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Prix:</Text><br /><Text>{selectedColis.prix} DH</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Nature Produit:</Text><br /><Text>{selectedColis.nature_produit}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Statut:</Text><br /><Text>{selectedColis.statut}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Commentaire:</Text><br /><Text>{selectedColis.commentaire || 'Aucun'}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>État:</Text><br /><Text>{selectedColis.etat ? "Payée" : "Non Payée"}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Ouvrir:</Text><br /><Text>{selectedColis.ouvrir ? "Oui" : "Non"}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Fragile:</Text><br /><Text>{selectedColis.is_fragile ? "Oui" : "Non"}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Remplacer:</Text><br /><Text>{selectedColis.is_remplace ? "Oui" : "Non"}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Store:</Text><br /><Text>{selectedColis.store?.storeName || 'N/A'}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Créé le:</Text><br /><Text>{new Date(selectedColis.createdAt).toLocaleString()}</Text></Col>
                    <Col xs={24} sm={12} md={8}><Text strong>Mis à jour le:</Text><br /><Text>{new Date(selectedColis.updatedAt).toLocaleString()}</Text></Col>
                  </Row>

                  <Space direction="horizontal" size="middle" style={{ marginTop: '20px' }}>
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