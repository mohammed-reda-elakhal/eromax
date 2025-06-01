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
    marginBottom: '20px',
    borderRadius: '16px',
    boxShadow: theme === 'dark'
      ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)'
      : '0 8px 32px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04)',
    backgroundColor: theme === 'dark' ? '#262626' : '#fff',
    border: `1px solid ${theme === 'dark' ? '#404040' : '#e8e8e8'}`,
    transition: 'all 0.3s ease',
    overflow: 'hidden',
  };

  const cardHeadStyle = {
    backgroundColor: theme === 'dark'
      ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
      : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    borderBottom: `2px solid ${theme === 'dark' ? '#404040' : '#e2e8f0'}`,
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
    cursor: 'pointer',
    color: theme === 'dark' ? '#fff' : '#1e293b',
    padding: '16px 24px',
    fontWeight: '600',
    fontSize: '15px',
  };

  const tagStyle = {
    marginRight: '8px',
    marginBottom: '8px',
    borderRadius: '8px',
    padding: '6px 12px',
    fontWeight: '500',
    fontSize: '12px',
    border: 'none',
    boxShadow: theme === 'dark'
      ? '0 2px 8px rgba(0, 0, 0, 0.3)'
      : '0 2px 8px rgba(0, 0, 0, 0.1)',
  };

  const infoCardStyle = {
    padding: '20px',
    borderRadius: '12px',
    backgroundColor: theme === 'dark' ? '#1f1f1f' : '#f8fafc',
    border: `1px solid ${theme === 'dark' ? '#404040' : '#e2e8f0'}`,
    boxShadow: theme === 'dark'
      ? '0 4px 16px rgba(0, 0, 0, 0.2)'
      : '0 4px 16px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.2s ease',
  };

  const labelStyle = {
    color: theme === 'dark' ? '#94a3b8' : '#64748b',
    fontSize: '13px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  };

  const valueStyle = {
    color: theme === 'dark' ? '#f1f5f9' : '#1e293b',
    fontSize: '15px',
    fontWeight: '600',
    lineHeight: '1.4',
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: theme === 'dark' ? '#fff' : '#262626'
        }}>
          <FaBoxOpen size={20} style={{ color: '#1890ff' }} />
          <span style={{ fontSize: '16px', fontWeight: '600' }}>Détails du Colis</span>
          <Tag
            color={statusBadgeConfig[selectedColis.statut]?.color || 'default'}
            style={{
              marginLeft: 'auto',
              borderRadius: '6px',
              padding: '4px 8px',
              fontWeight: '500'
            }}
          >
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
      style={{
        top: 20,
        backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff'
      }}
      styles={{
        header: {
          background: theme === 'dark'
            ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderBottom: `2px solid ${theme === 'dark' ? '#475569' : '#e2e8f0'}`,
          borderRadius: '12px 12px 0 0',
          padding: '20px 24px',
          boxShadow: theme === 'dark'
            ? '0 4px 16px rgba(0, 0, 0, 0.3)'
            : '0 4px 16px rgba(0, 0, 0, 0.06)'
        },
        body: {
          backgroundColor: theme === 'dark' ? '#0f172a' : '#f8fafc',
          padding: '32px',
          background: theme === 'dark'
            ? 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)'
            : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)'
        },
        content: {
          backgroundColor: 'transparent',
          borderRadius: '12px',
          border: 'none',
          boxShadow: theme === 'dark'
            ? '0 20px 60px rgba(0, 0, 0, 0.5)'
            : '0 20px 60px rgba(0, 0, 0, 0.1)'
        },
        mask: {
          backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)'
        }
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                <div style={infoCardStyle}>
                  <div style={labelStyle}>Code Suivi</div>
                  <Text strong copyable style={{
                    ...valueStyle,
                    color: '#3b82f6',
                    fontFamily: 'monospace',
                    fontSize: '14px'
                  }}>
                    {selectedColis.code_suivi}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={infoCardStyle}>
                  <div style={labelStyle}>Destinataire</div>
                  <Text strong style={valueStyle}>{selectedColis.nom}</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={infoCardStyle}>
                  <div style={labelStyle}>Téléphone</div>
                  <Text strong style={{
                    ...valueStyle,
                    color: '#10b981',
                    fontFamily: 'monospace'
                  }}>
                    <FaPhone style={{ marginRight: '8px', fontSize: '12px' }} />
                    {selectedColis.tele}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={infoCardStyle}>
                  <div style={labelStyle}>Business</div>
                  <Text strong style={valueStyle}>{selectedColis.store?.storeName || 'N/A'}</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={infoCardStyle}>
                  <div style={labelStyle}>Ville</div>
                  <Tag
                    color="blue"
                    icon={<FaMapMarkerAlt />}
                    style={{
                      ...tagStyle,
                      background: theme === 'dark'
                        ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)'
                        : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                      color: '#fff',
                      border: 'none'
                    }}
                  >
                    {selectedColis.ville?.nom || 'N/A'}
                  </Tag>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={infoCardStyle}>
                  <div style={labelStyle}>Adresse</div>
                  <Text style={{
                    ...valueStyle,
                    fontWeight: '500',
                    lineHeight: '1.5'
                  }}>
                    {selectedColis.adresse}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={infoCardStyle}>
                  <div style={labelStyle}>Date de Création</div>
                  <Text style={{
                    ...valueStyle,
                    color: '#8b5cf6',
                    fontWeight: '500'
                  }}>
                    <FaCalendarAlt style={{ marginRight: '8px', fontSize: '12px' }} />
                    {formatDate(selectedColis.createdAt)}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={infoCardStyle}>
                  <div style={labelStyle}>Dernière mise à jour</div>
                  <Text style={{
                    ...valueStyle,
                    color: '#f59e0b',
                    fontWeight: '500'
                  }}>
                    <FaCalendarAlt style={{ marginRight: '8px', fontSize: '12px' }} />
                    {formatDate(selectedColis.updatedAt)}
                  </Text>
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
                <div style={infoCardStyle}>
                  <div style={labelStyle}>Nature de Produit</div>
                  <div style={{
                    maxHeight: '80px',
                    overflowY: 'auto',
                    padding: '12px',
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#f1f5f9',
                    borderRadius: '8px',
                    border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`,
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}>
                    <Text style={{
                      ...valueStyle,
                      fontSize: '14px',
                      lineHeight: '1.5'
                    }}>
                      {selectedColis.nature_produit || 'N/A'}
                    </Text>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={{
                  ...infoCardStyle,
                  background: theme === 'dark'
                    ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)'
                    : 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                  border: `2px solid ${theme === 'dark' ? '#10b981' : '#34d399'}`
                }}>
                  <div style={labelStyle}>Prix (DH)</div>
                  <Text strong style={{
                    fontSize: '20px',
                    color: theme === 'dark' ? '#6ee7b7' : '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '700'
                  }}>
                    {selectedColis.prix} DH
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={infoCardStyle}>
                  <div style={labelStyle}>Commentaire</div>
                  <div style={{
                    maxHeight: '80px',
                    overflowY: 'auto',
                    padding: '12px',
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#f1f5f9',
                    borderRadius: '8px',
                    border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`,
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}>
                    <Text style={{
                      ...valueStyle,
                      fontSize: '14px',
                      lineHeight: '1.5',
                      fontStyle: selectedColis.commentaire ? 'normal' : 'italic'
                    }}>
                      {selectedColis.commentaire || 'Aucun commentaire'}
                    </Text>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={infoCardStyle}>
                  <div style={labelStyle}>Options</div>
                  <Space wrap size={[8, 8]}>
                    <Tag
                      style={{
                        ...tagStyle,
                        background: selectedColis.ouvrir
                          ? (theme === 'dark' ? 'linear-gradient(135deg, #065f46 0%, #10b981 100%)' : 'linear-gradient(135deg, #10b981 0%, #34d399 100%)')
                          : (theme === 'dark' ? 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)' : 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)'),
                        color: '#fff',
                        border: 'none'
                      }}
                    >
                      Ouvrir: {selectedColis.ouvrir ? 'Oui' : 'Non'}
                    </Tag>
                    <Tag
                      style={{
                        ...tagStyle,
                        background: selectedColis.is_simple
                          ? (theme === 'dark' ? 'linear-gradient(135deg, #065f46 0%, #10b981 100%)' : 'linear-gradient(135deg, #10b981 0%, #34d399 100%)')
                          : (theme === 'dark' ? 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)' : 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)'),
                        color: '#fff',
                        border: 'none'
                      }}
                    >
                      Simple: {selectedColis.is_simple ? 'Oui' : 'Non'}
                    </Tag>
                    <Tag
                      style={{
                        ...tagStyle,
                        background: selectedColis.is_remplace
                          ? (theme === 'dark' ? 'linear-gradient(135deg, #065f46 0%, #10b981 100%)' : 'linear-gradient(135deg, #10b981 0%, #34d399 100%)')
                          : (theme === 'dark' ? 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)' : 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)'),
                        color: '#fff',
                        border: 'none'
                      }}
                    >
                      Remplace: {selectedColis.is_remplace ? 'Oui' : 'Non'}
                    </Tag>
                    <Tag
                      style={{
                        ...tagStyle,
                        background: selectedColis.is_fragile
                          ? (theme === 'dark' ? 'linear-gradient(135deg, #065f46 0%, #10b981 100%)' : 'linear-gradient(135deg, #10b981 0%, #34d399 100%)')
                          : (theme === 'dark' ? 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)' : 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)'),
                        color: '#fff',
                        border: 'none'
                      }}
                    >
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
                <div style={{
                  ...infoCardStyle,
                  background: selectedColis.etat
                    ? (theme === 'dark'
                        ? 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)'
                        : 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)')
                    : (theme === 'dark'
                        ? 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)'
                        : 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)'),
                  border: `2px solid ${selectedColis.etat
                    ? (theme === 'dark' ? '#10b981' : '#34d399')
                    : (theme === 'dark' ? '#ef4444' : '#f87171')}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '40px',
                    height: '40px',
                    background: selectedColis.etat
                      ? 'linear-gradient(135deg, #10b981, #34d399)'
                      : 'linear-gradient(135deg, #ef4444, #f87171)',
                    borderRadius: '0 0 0 40px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                    padding: '8px'
                  }}>
                    <Badge status={selectedColis.etat ? "success" : "error"} />
                  </div>
                  <div style={labelStyle}>État</div>
                  <Text strong style={{
                    fontSize: '16px',
                    color: selectedColis.etat
                      ? (theme === 'dark' ? '#6ee7b7' : '#059669')
                      : (theme === 'dark' ? '#fca5a5' : '#dc2626'),
                    fontWeight: '700'
                  }}>
                    {selectedColis.etat ? "Payée" : "Non Payée"}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={{
                  ...infoCardStyle,
                  background: selectedColis.pret_payant
                    ? (theme === 'dark'
                        ? 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)'
                        : 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)')
                    : (theme === 'dark'
                        ? 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)'
                        : 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)'),
                  border: `2px solid ${selectedColis.pret_payant
                    ? (theme === 'dark' ? '#10b981' : '#34d399')
                    : (theme === 'dark' ? '#ef4444' : '#f87171')}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '40px',
                    height: '40px',
                    background: selectedColis.pret_payant
                      ? 'linear-gradient(135deg, #10b981, #34d399)'
                      : 'linear-gradient(135deg, #ef4444, #f87171)',
                    borderRadius: '0 0 0 40px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                    padding: '8px'
                  }}>
                    <Badge status={selectedColis.pret_payant ? "success" : "error"} />
                  </div>
                  <div style={labelStyle}>Prés payant</div>
                  <Text strong style={{
                    fontSize: '16px',
                    color: selectedColis.pret_payant
                      ? (theme === 'dark' ? '#6ee7b7' : '#059669')
                      : (theme === 'dark' ? '#fca5a5' : '#dc2626'),
                    fontWeight: '700'
                  }}>
                    {selectedColis.pret_payant ? "Payée" : "Non Payée"}
                  </Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={{
                  ...infoCardStyle,
                  background: selectedColis.wallet_prosseced
                    ? (theme === 'dark'
                        ? 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)'
                        : 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)')
                    : (theme === 'dark'
                        ? 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)'
                        : 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)'),
                  border: `2px solid ${selectedColis.wallet_prosseced
                    ? (theme === 'dark' ? '#10b981' : '#34d399')
                    : (theme === 'dark' ? '#ef4444' : '#f87171')}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '40px',
                    height: '40px',
                    background: selectedColis.wallet_prosseced
                      ? 'linear-gradient(135deg, #10b981, #34d399)'
                      : 'linear-gradient(135deg, #ef4444, #f87171)',
                    borderRadius: '0 0 0 40px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                    padding: '8px'
                  }}>
                    <FaWallet style={{
                      color: '#fff',
                      fontSize: '16px'
                    }} />
                  </div>
                  <div style={labelStyle}>Wallet Status</div>
                  <Text strong style={{
                    fontSize: '16px',
                    color: selectedColis.wallet_prosseced
                      ? (theme === 'dark' ? '#6ee7b7' : '#059669')
                      : (theme === 'dark' ? '#fca5a5' : '#dc2626'),
                    fontWeight: '700'
                  }}>
                    {selectedColis.wallet_prosseced ? "Processed" : "Pending"}
                  </Text>
                </div>
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
                <div style={{
                  ...infoCardStyle,
                  background: theme === 'dark'
                    ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  border: `2px solid ${theme === 'dark' ? '#475569' : '#cbd5e1'}`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px',
                    paddingBottom: '12px',
                    borderBottom: `1px solid ${theme === 'dark' ? '#475569' : '#cbd5e1'}`
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <DollarOutlined style={{ color: '#fff', fontSize: '16px' }} />
                    </div>
                    <Text strong style={{
                      fontSize: '16px',
                      color: theme === 'dark' ? '#f1f5f9' : '#1e293b',
                      fontWeight: '600'
                    }}>
                      Tarif Ajouter
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={labelStyle}>Valeur</div>
                    <Text strong style={{
                      fontSize: '20px',
                      color: '#3b82f6',
                      fontWeight: '700'
                    }}>
                      {selectedColis?.tarif_ajouter?.value || 0} DH
                    </Text>
                  </div>
                  <div>
                    <div style={labelStyle}>Description</div>
                    <div style={{
                      padding: '12px',
                      backgroundColor: theme === 'dark' ? '#0f172a' : '#f1f5f9',
                      borderRadius: '8px',
                      marginTop: '8px',
                      minHeight: '50px',
                      border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`,
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}>
                      <Text style={{
                        ...valueStyle,
                        fontSize: '14px',
                        lineHeight: '1.5',
                        fontStyle: selectedColis?.tarif_ajouter?.description ? 'normal' : 'italic'
                      }}>
                        {selectedColis?.tarif_ajouter?.description || 'Aucune description'}
                      </Text>
                    </div>
                  </div>
                </div>
              </Col>

              {/* CRBT Section */}
              <Col xs={24} sm={12}>
                <div style={{
                  ...infoCardStyle,
                  background: theme === 'dark'
                    ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  border: `2px solid ${theme === 'dark' ? '#475569' : '#cbd5e1'}`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px',
                    paddingBottom: '12px',
                    borderBottom: `1px solid ${theme === 'dark' ? '#475569' : '#cbd5e1'}`
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FaMoneyBillWave style={{ color: '#fff', fontSize: '16px' }} />
                    </div>
                    <Text strong style={{
                      fontSize: '16px',
                      color: theme === 'dark' ? '#f1f5f9' : '#1e293b',
                      fontWeight: '600'
                    }}>
                      CRBT
                    </Text>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                      <Text style={{
                        ...labelStyle,
                        textTransform: 'none',
                        fontSize: '14px'
                      }}>Prix Colis</Text>
                      <Text style={{
                        ...valueStyle,
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>{selectedColis?.crbt?.prix_colis || 0} DH</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                      <Text style={{
                        ...labelStyle,
                        textTransform: 'none',
                        fontSize: '14px'
                      }}>Tarif Livraison</Text>
                      <Text style={{
                        ...valueStyle,
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>{selectedColis?.crbt?.tarif_livraison || 0} DH</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                      <Text style={{
                        ...labelStyle,
                        textTransform: 'none',
                        fontSize: '14px'
                      }}>Tarif Refus</Text>
                      <Text style={{
                        ...valueStyle,
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>{selectedColis?.crbt?.tarif_refuse || 0} DH</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                      <Text style={{
                        ...labelStyle,
                        textTransform: 'none',
                        fontSize: '14px'
                      }}>Tarif Fragile</Text>
                      <Text style={{
                        ...valueStyle,
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>{selectedColis?.crbt?.tarif_fragile || 0} DH</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                      <Text style={{
                        ...labelStyle,
                        textTransform: 'none',
                        fontSize: '14px'
                      }}>Tarif Supplémentaire</Text>
                      <Text style={{
                        ...valueStyle,
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>{selectedColis?.crbt?.tarif_supplementaire || 0} DH</Text>
                    </div>
                    <Divider style={{
                      margin: '16px 0',
                      borderColor: theme === 'dark' ? '#475569' : '#cbd5e1',
                      borderWidth: '2px'
                    }} />
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      background: theme === 'dark'
                        ? 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)'
                        : 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
                      borderRadius: '8px',
                      border: `2px solid ${theme === 'dark' ? '#ef4444' : '#f87171'}`
                    }}>
                      <Text strong style={{
                        fontSize: '16px',
                        color: theme === 'dark' ? '#fca5a5' : '#dc2626',
                        fontWeight: '700'
                      }}>Total Tarif</Text>
                      <Text strong style={{
                        fontSize: '18px',
                        color: theme === 'dark' ? '#fca5a5' : '#dc2626',
                        fontWeight: '700'
                      }}>{selectedColis?.crbt?.total_tarif || 0} DH</Text>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      background: theme === 'dark'
                        ? 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)'
                        : 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                      borderRadius: '8px',
                      border: `2px solid ${theme === 'dark' ? '#10b981' : '#34d399'}`
                    }}>
                      <Text strong style={{
                        fontSize: '16px',
                        color: theme === 'dark' ? '#6ee7b7' : '#059669',
                        fontWeight: '700'
                      }}>Montant à Payer</Text>
                      <Text strong style={{
                        fontSize: '18px',
                        color: theme === 'dark' ? '#6ee7b7' : '#059669',
                        fontWeight: '700'
                      }}>{selectedColis?.crbt?.prix_a_payant || 0} DH</Text>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </Card>
      </div>
    </Modal>
  );
});

export default InfoModal;
