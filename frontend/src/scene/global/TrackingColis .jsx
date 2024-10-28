import React, { useState, useEffect } from 'react';
import { Timeline, Spin, Card, Alert, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons';
import request from '../../utils/request';

const { Text } = Typography;

const TrackingColis = ({ codeSuivi }) => {
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
    return <Spin size="large" />;
  }

  if (error) {
    return <Alert message={error} type="error" />;
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Livrée':
        return <CheckCircleOutlined style={{ color: 'green' }} />;
      case 'Annulée':
      case 'Refusée':
        return <CloseCircleOutlined style={{ color: 'red' }} />;
      default:
        return <SyncOutlined style={{ color: 'blue' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Livrée':
        return 'green';
      case 'Annulée':
      case 'Refusée':
        return 'red';
      default:
        return 'blue';
    }
  };

  return (
    <Card 
      title={<Text strong>Suivi du Colis</Text>} 
      style={{ margin: '20px', width: '100%', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
      bodyStyle={{ padding: '20px' }}
    >
      <Text strong style={{ marginBottom: '10px', display: 'block' }}>
        Code de Suivi: {trackingData?.code_suivi}
      </Text>
      <Timeline 
        mode="left" 
        style={{ padding: '10px 0', background: '#f9f9f9', borderRadius: '8px' }}
        pending={false}
      >
        {trackingData?.status_updates.map((update, index) => (
          <Timeline.Item
            key={update._id}
            label={
              <Text type="secondary">
                {new Date(update.date).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            }
            color={getStatusColor(update.status)}
            dot={getStatusIcon(update.status)}
          >
            <Text strong>{update.status}</Text>
            {update.status === 'Expediée' && update.livreur && (
              <div style={{ marginTop: '8px' }}>
                <Text>🛵 Livreur: <strong>{update.livreur.nom}</strong></Text>
                <br />
                <Text>📞 Téléphone: <strong>{update.livreur.tele}</strong></Text>
              </div>
            )}
          </Timeline.Item>
        ))}
      </Timeline>
    </Card>
  );
};

export default TrackingColis;
