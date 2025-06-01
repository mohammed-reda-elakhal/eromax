import React, { useState, useEffect } from 'react';
import { Timeline, Spin, Card, Alert, Typography, Tag } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  CarOutlined,
  HomeOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import { FaClock } from 'react-icons/fa';
import request from '../../utils/request';

const { Text } = Typography;

const TrackingColis = ({ codeSuivi , theme }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        const response = await request.get(`/api/colis/truck/${codeSuivi}`);
        setTrackingData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Erreur lors du chargement des données.");
        setLoading(false);
      }
    };

    fetchTrackingData();
  }, [codeSuivi]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fafafa'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Erreur de chargement"
        description={error}
        type="error"
        showIcon
        style={{
          margin: '20px',
          backgroundColor: theme === 'dark' ? '#2d1b1b' : '#fff2f0',
          borderColor: theme === 'dark' ? '#a8071a' : '#ffccc7',
          color: theme === 'dark' ? '#fff' : '#000'
        }}
      />
    );
  }

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'livrée':
      case 'livree':
        return <CheckCircleOutlined style={{ fontSize: '16px' }} />;
      case 'annulée':
      case 'annulee':
      case 'refusée':
      case 'refusee':
        return <CloseCircleOutlined style={{ fontSize: '16px' }} />;
      case 'ramassé':
      case 'ramasse':
        return <CarOutlined style={{ fontSize: '16px' }} />;
      case 'expédié':
      case 'expedie':
      case 'expédiée':
      case 'expediee':
        return <CarOutlined style={{ fontSize: '16px' }} />;
      case 'programmée':
      case 'programmee':
      case 'reporté':
      case 'reporte':
        return <ClockCircleOutlined style={{ fontSize: '16px' }} />;
      default:
        return <SyncOutlined style={{ fontSize: '16px' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'livrée':
      case 'livree':
        return '#52c41a';
      case 'annulée':
      case 'annulee':
      case 'refusée':
      case 'refusee':
        return '#ff4d4f';
      case 'ramassé':
      case 'ramasse':
        return '#1890ff';
      case 'expédié':
      case 'expedie':
      case 'expédiée':
      case 'expediee':
        return '#722ed1';
      case 'programmée':
      case 'programmee':
      case 'reporté':
      case 'reporte':
        return '#faad14';
      default:
        return '#1890ff';
    }
  };

  const getStatusTag = (status) => {
    const color = getStatusColor(status);
    return (
      <Tag
        color={color}
        style={{
          margin: 0,
          fontWeight: '600',
          fontSize: '12px',
          padding: '4px 8px',
          borderRadius: '6px'
        }}
      >
        {status}
      </Tag>
    );
  };

  const getStatusDescription = (status) => {
    const descriptions = {
      'Attente de Ramassage': 'Le colis est en attente de collecte par notre équipe',
      'Ramassé': 'Le colis a été collecté et est en transit vers notre centre',
      'Expédié': 'Le colis est en cours de livraison vers sa destination',
      'Expédiée': 'Le colis est en cours de livraison vers sa destination',
      'Livrée': 'Le colis a été livré avec succès au destinataire',
      'Refusée': 'La livraison a été refusée par le destinataire',
      'Reporté': 'La livraison a été reportée à une date ultérieure',
      'Programmée': 'La livraison est programmée pour une date spécifique',
      'Annulée': 'La commande a été annulée',
      'Mise en distribution': 'Le colis est en cours de distribution dans votre zone',
      'Retour': 'Le colis est en retour vers l\'expéditeur',
      'Retouré': 'Le colis a été retourné à l\'expéditeur'
    };
    return descriptions[status] || 'Mise à jour du statut du colis';
  };

  return (
    <>
      {/* Custom CSS for Vertical Timeline styling */}
      <style>
        {`
          .vertical-timeline {
            position: relative;
            padding-left: 30px;
          }

          .vertical-timeline::before {
            content: '';
            position: absolute;
            left: 20px;
            top: 0;
            bottom: 0;
            width: 3px;
            background: ${theme === 'dark' ? '#434343' : '#e8e8e8'};
            z-index: 1;
          }

          .timeline-item {
            position: relative;
            margin-bottom: 30px;
            padding-left: 40px;
          }

          .timeline-item:last-child {
            margin-bottom: 0;
          }

          .timeline-dot {
            position: absolute;
            left: -30px;
            top: 8px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 4px solid ${theme === 'dark' ? '#262626' : '#fff'};
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            z-index: 2;
          }

          .timeline-content {
            background: ${theme === 'dark' ? '#1f1f1f' : '#f8fafc'};
            border: 1px solid ${theme === 'dark' ? '#434343' : '#e2e8f0'};
            border-radius: 12px;
            padding: 16px;
            position: relative;
          }

          .timeline-content::before {
            content: '';
            position: absolute;
            left: -8px;
            top: 20px;
            width: 0;
            height: 0;
            border-top: 8px solid transparent;
            border-bottom: 8px solid transparent;
            border-right: 8px solid ${theme === 'dark' ? '#434343' : '#e2e8f0'};
          }

          .timeline-content::after {
            content: '';
            position: absolute;
            left: -7px;
            top: 21px;
            width: 0;
            height: 0;
            border-top: 7px solid transparent;
            border-bottom: 7px solid transparent;
            border-right: 7px solid ${theme === 'dark' ? '#1f1f1f' : '#f8fafc'};
          }
        `}
      </style>

      <div style={{
        backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fafafa',
        minHeight: '100%',
        padding: '0'
      }}>
      {/* Header Section */}
      <div style={{
        padding: '20px',
        backgroundColor: theme === 'dark' ? '#262626' : '#fff',
        borderBottom: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`,
        marginBottom: '0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px'
        }}>
          <CarOutlined style={{
            color: '#1890ff',
            fontSize: '20px'
          }} />
          <Text strong style={{
            color: theme === 'dark' ? '#fff' : '#262626',
            fontSize: '18px',
            margin: 0
          }}>
            Suivi du Colis
          </Text>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Text style={{
            color: theme === 'dark' ? '#8c8c8c' : '#8c8c8c',
            fontSize: '14px'
          }}>
            Code de Suivi:
          </Text>
          <Tag
            color="blue"
            style={{
              margin: 0,
              fontWeight: '600',
              fontSize: '14px',
              padding: '4px 12px'
            }}
          >
            {trackingData?.code_suivi}
          </Tag>
        </div>
      </div>

      {/* Timeline Section */}
      <div style={{
        padding: '20px',
        backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fafafa'
      }}>
        {trackingData?.status_updates && trackingData.status_updates.length > 0 ? (
          <div style={{
            backgroundColor: theme === 'dark' ? '#262626' : '#fff',
            borderRadius: '12px',
            border: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`,
            boxShadow: theme === 'dark'
              ? '0 4px 12px rgba(0, 0, 0, 0.3)'
              : '0 4px 12px rgba(0, 0, 0, 0.1)',
            padding: '24px'
          }}>
            <div style={{
              marginBottom: '30px',
              paddingBottom: '16px',
              borderBottom: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
            }}>
              <Text strong style={{
                color: theme === 'dark' ? '#fff' : '#262626',
                fontSize: '16px'
              }}>
                Historique des mises à jour
              </Text>
            </div>

            {/* Vertical Timeline */}
            <div className="vertical-timeline">
              {trackingData.status_updates.map((update, index) => {
                const statusColor = getStatusColor(update.status);

                return (
                  <div key={update._id} className="timeline-item">
                    {/* Timeline Dot */}
                    <div
                      className="timeline-dot"
                      style={{
                        backgroundColor: statusColor
                      }}
                    >
                      <div style={{
                        color: '#fff',
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}>
                        {getStatusIcon(update.status)}
                      </div>
                    </div>

                    {/* Timeline Content */}
                    <div className="timeline-content">
                      {/* Header with Status and Date */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '12px',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}>
                        <div>
                          {getStatusTag(update.status)}
                        </div>
                        <div style={{
                          backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: `1px solid ${theme === 'dark' ? '#434343' : '#e2e8f0'}`,
                          textAlign: 'right'
                        }}>
                          <Text style={{
                            color: theme === 'dark' ? '#fff' : '#262626',
                            fontSize: '12px',
                            fontWeight: '600',
                            display: 'block',
                            lineHeight: '1.2'
                          }}>
                            {new Date(update.date).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </Text>
                          <Text style={{
                            color: theme === 'dark' ? '#8c8c8c' : '#8c8c8c',
                            fontSize: '11px'
                          }}>
                            {new Date(update.date).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Text>
                        </div>
                      </div>

                      {/* Description */}
                      <Text style={{
                        color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                        fontSize: '13px',
                        lineHeight: '1.5',
                        display: 'block',
                        marginBottom: '8px'
                      }}>
                        {getStatusDescription(update.status)}
                      </Text>

                      {/* Livreur Information */}
                      {update.status === 'Expédiée' && update.livreur && (
                        <div style={{
                          marginTop: '12px',
                          padding: '10px',
                          backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                          borderRadius: '8px',
                          border: `1px solid ${theme === 'dark' ? '#434343' : '#e2e8f0'}`
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <PhoneOutlined style={{
                              color: '#1890ff',
                              fontSize: '14px'
                            }} />
                            <Text style={{
                              color: theme === 'dark' ? '#8c8c8c' : '#8c8c8c',
                              fontSize: '12px'
                            }}>
                              Livreur:
                            </Text>
                            <Text strong style={{
                              color: theme === 'dark' ? '#fff' : '#262626',
                              fontSize: '13px'
                            }}>
                              {update.livreur.tele}
                            </Text>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: theme === 'dark' ? '#262626' : '#fff',
            borderRadius: '12px',
            border: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
          }}>
            <FaClock style={{
              fontSize: '48px',
              color: theme === 'dark' ? '#8c8c8c' : '#d9d9d9',
              marginBottom: '16px'
            }} />
            <Text style={{
              color: theme === 'dark' ? '#8c8c8c' : '#8c8c8c',
              fontSize: '16px',
              display: 'block'
            }}>
              Aucune mise à jour de statut disponible
            </Text>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default TrackingColis;
