// components/ColisTable/modals/InfoModal.jsx

import React, { useState } from 'react';
import { Modal, Descriptions, Badge, Typography, Col, Card, Divider, Tag, Row, Space } from 'antd';
import {
  InfoCircleOutlined,
  DollarOutlined,
  WalletOutlined,
  ShoppingOutlined,
  CaretRightOutlined,
  CaretDownOutlined
} from '@ant-design/icons';
import { FaMoneyBillWave, FaWallet, FaBoxOpen, FaShippingFast, FaUser, FaMapMarkerAlt, FaPhone, FaCalendarAlt } from 'react-icons/fa';
import { MdOutlinePayment, MdDescription } from 'react-icons/md';

const { Text, Title } = Typography;

/**
 * InfoModal component displays the details of a selected colis.
 *
 * Props:
 * - visible: boolean to control modal visibility
 * - onClose: function to handle modal close
 * - selectedColis: object containing colis data
 * - statusBadgeConfig: object mapping statut to color and icon
 * - theme: 'dark' or 'light'
 * - formatDate: function to format date strings
 */
const InfoModal = React.memo(({
  visible,
  onClose,
  selectedColis,
  statusBadgeConfig,
  theme,
  formatDate,
}) => {
  // State to track which cards are expanded
  const [expandedCards, setExpandedCards] = useState({
    basicInfo: true,
    productInfo: true,
    paymentStatus: true,
    financialDetails: true
  });

  if (!selectedColis) return null;

  // Toggle card expansion
  const toggleCard = (cardName) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardName]: !prev[cardName]
    }));
  };

  const cardStyle = {
    marginBottom: '16px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
  };

  const cardHeadStyle = {
    backgroundColor: theme === 'dark' ? '#141414' : '#f9f9f9',
    borderBottom: '1px solid #e8e8e8',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    cursor: 'pointer',
  };

  const tagStyle = {
    marginRight: '8px',
    marginBottom: '8px',
  };

  // Custom card title with collapse/expand functionality
  const CardTitle = ({ icon, title, cardName }) => (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}
      onClick={() => toggleCard(cardName)}
    >
      {icon}
      <span>{title}</span>
      <div style={{ marginLeft: 'auto' }}>
        {expandedCards[cardName] ? <CaretDownOutlined /> : <CaretRightOutlined />}
      </div>
    </div>
  );

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaBoxOpen size={20} />
          <span>Détails du Colis</span>
          <Tag color={statusBadgeConfig[selectedColis.statut]?.color || 'default'} style={{ marginLeft: 'auto' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {statusBadgeConfig[selectedColis.statut]?.icon || <InfoCircleOutlined />}
              {selectedColis.statut}
            </span>
          </Tag>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      className={theme === 'dark' ? 'dark-mode' : ''}
      width={'90%'}
      style={{ top: 20 }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Basic Information Card */}
        <Card
          title={<CardTitle
            icon={<FaUser />}
            title="Informations de Base"
            cardName="basicInfo"
          />}
          style={cardStyle}
          headStyle={cardHeadStyle}
        >
          {expandedCards.basicInfo && (
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Text type="secondary">Code Suivi</Text>
                  <Text strong copyable>{selectedColis.code_suivi}</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Text type="secondary">Destinataire</Text>
                  <Text strong>{selectedColis.nom}</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Text type="secondary">Téléphone</Text>
                  <Text strong>{selectedColis.tele}</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Text type="secondary">Business</Text>
                  <Text strong>{selectedColis.store?.storeName || 'N/A'}</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Text type="secondary">Ville</Text>
                  <Tag color="blue" icon={<FaMapMarkerAlt />}>{selectedColis.ville?.nom || 'N/A'}</Tag>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Text type="secondary">Adresse</Text>
                  <Text>{selectedColis.adresse}</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Text type="secondary">Date de Création</Text>
                  <Text><FaCalendarAlt style={{ marginRight: '5px' }} /> {formatDate(selectedColis.createdAt)}</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Text type="secondary">Dernière mise à jour</Text>
                  <Text><FaCalendarAlt style={{ marginRight: '5px' }} /> {formatDate(selectedColis.updatedAt)}</Text>
                </div>
              </Col>
            </Row>
          )}
        </Card>

        {/* Product Information Card */}
        <Card
          title={<CardTitle
            icon={<ShoppingOutlined />}
            title="Informations du Produit"
            cardName="productInfo"
          />}
          style={cardStyle}
          headStyle={cardHeadStyle}
        >
          {expandedCards.productInfo && (
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Text type="secondary">Nature de Produit</Text>
                  <div style={{ maxHeight: '80px', overflowY: 'auto', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <Text>{selectedColis.nature_produit || 'N/A'}</Text>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Text type="secondary">Prix (DH)</Text>
                  <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                    <DollarOutlined style={{ marginRight: '5px' }} />
                    {selectedColis.prix} DH
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Text type="secondary">Commentaire</Text>
                  <div style={{ maxHeight: '80px', overflowY: 'auto', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <Text>{selectedColis.commentaire || 'N/A'}</Text>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Text type="secondary">Options</Text>
                  <Space wrap>
                    <Tag color={selectedColis.ouvrir ? 'green' : 'red'} style={tagStyle}>
                      Ouvrir: {selectedColis.ouvrir ? 'Oui' : 'Non'}
                    </Tag>
                    <Tag color={selectedColis.is_simple ? 'green' : 'red'} style={tagStyle}>
                      Simple: {selectedColis.is_simple ? 'Oui' : 'Non'}
                    </Tag>
                    <Tag color={selectedColis.is_remplace ? 'green' : 'red'} style={tagStyle}>
                      Remplace: {selectedColis.is_remplace ? 'Oui' : 'Non'}
                    </Tag>
                    <Tag color={selectedColis.is_fragile ? 'green' : 'red'} style={tagStyle}>
                      Fragile: {selectedColis.is_fragile ? 'Oui' : 'Non'}
                    </Tag>
                  </Space>
                </div>
              </Col>
            </Row>
          )}
        </Card>

        {/* Payment Status Card */}
        <Card
          title={<CardTitle
            icon={<FaMoneyBillWave />}
            title="Statut de Paiement"
            cardName="paymentStatus"
          />}
          style={cardStyle}
          headStyle={cardHeadStyle}
        >
          {expandedCards.paymentStatus && (
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card bordered={false} style={{ backgroundColor: selectedColis.etat ? '#f6ffed' : '#fff2f0', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <Text type="secondary">État</Text>
                      <div>
                        <Text strong style={{ color: selectedColis.etat ? '#52c41a' : '#f5222d' }}>
                          {selectedColis.etat ? "Payée" : "Non Payée"}
                        </Text>
                      </div>
                    </div>
                    <Badge status={selectedColis.etat ? "success" : "error"} />
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card bordered={false} style={{ backgroundColor: selectedColis.pret_payant ? '#f6ffed' : '#fff2f0', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <Text type="secondary">Prés payant</Text>
                      <div>
                        <Text strong style={{ color: selectedColis.pret_payant ? '#52c41a' : '#f5222d' }}>
                          {selectedColis.pret_payant ? "Payée" : "Non Payée"}
                        </Text>
                      </div>
                    </div>
                    <Badge status={selectedColis.pret_payant ? "success" : "error"} />
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card bordered={false} style={{ backgroundColor: selectedColis.wallet_prosseced ? '#f6ffed' : '#fff2f0', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <Text type="secondary">Wallet Status</Text>
                      <div>
                        <Text strong style={{ color: selectedColis.wallet_prosseced ? '#52c41a' : '#f5222d' }}>
                          {selectedColis.wallet_prosseced ? "Processed" : "Pending"}
                        </Text>
                      </div>
                    </div>
                    <FaWallet style={{ color: selectedColis.wallet_prosseced ? '#52c41a' : '#f5222d', fontSize: '20px' }} />
                  </div>
                </Card>
              </Col>
            </Row>
          )}
        </Card>

        {/* Financial Details Card */}
        <Card
          title={<CardTitle
            icon={<MdOutlinePayment size={20} />}
            title="Détails Financiers"
            cardName="financialDetails"
          />}
          style={cardStyle}
          headStyle={cardHeadStyle}
        >
          {expandedCards.financialDetails && (
            <Row gutter={[16, 16]}>
              {/* Tarif Ajouter Section */}
              <Col xs={24} sm={12}>
                <Card
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <DollarOutlined />
                      <span>Tarif Ajouter</span>
                    </div>
                  }
                  bordered={false}
                  style={{ backgroundColor: '#f9f9f9', borderRadius: '4px' }}
                >
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text type="secondary">Valeur</Text>
                        <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                          {selectedColis?.tarif_ajouter?.value || 0} DH
                        </Text>
                      </div>
                    </Col>
                    <Col span={24}>
                      <Divider style={{ margin: '8px 0' }} />
                      <Text type="secondary">Description</Text>
                      <div style={{
                        padding: '8px',
                        backgroundColor: '#fff',
                        borderRadius: '4px',
                        marginTop: '4px',
                        minHeight: '40px'
                      }}>
                        <Text>{selectedColis?.tarif_ajouter?.description || 'N/A'}</Text>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>

              {/* CRBT Section */}
              <Col xs={24} sm={12}>
                <Card
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FaMoneyBillWave />
                      <span>CRBT</span>
                    </div>
                  }
                  bordered={false}
                  style={{ backgroundColor: '#f9f9f9', borderRadius: '4px' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">Prix Colis</Text>
                      <Text>{selectedColis?.crbt?.prix_colis || 0} DH</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">Tarif Livraison</Text>
                      <Text>{selectedColis?.crbt?.tarif_livraison || 0} DH</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">Tarif Refus</Text>
                      <Text>{selectedColis?.crbt?.tarif_refuse || 0} DH</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">Tarif Fragile</Text>
                      <Text>{selectedColis?.crbt?.tarif_fragile || 0} DH</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">Tarif Supplémentaire</Text>
                      <Text>{selectedColis?.crbt?.tarif_supplementaire || 0} DH</Text>
                    </div>
                    <Divider style={{ margin: '8px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong>Total Tarif</Text>
                      <Text strong style={{ color: '#f5222d' }}>{selectedColis?.crbt?.total_tarif || 0} DH</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong>Montant à Payer</Text>
                      <Text strong style={{ color: '#52c41a' }}>{selectedColis?.crbt?.prix_a_payant || 0} DH</Text>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          )}
        </Card>
      </div>
    </Modal>
  );
});

export default InfoModal;
