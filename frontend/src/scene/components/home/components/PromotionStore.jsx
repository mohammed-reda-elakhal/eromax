import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getValidPromotionsForUser } from '../../../../redux/apiCalls/promotionApiCalls';
import { Card, Statistic, Typography, message } from 'antd';
import { PercentageOutlined, MoneyCollectOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Countdown } = Statistic;

function PromotionStore() {
  const { validPromotions, loading, error } = useSelector((state) => state.promotion);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getValidPromotionsForUser());
    window.scrollTo(0, 0);
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  if (loading) {
    return <div>Chargement des promotions...</div>;
  }

  if (!validPromotions || validPromotions.length === 0) {
    return <div></div>;
  }

  return (
    <div>
      {validPromotions.map((promotion) => {
        const isPercentage = promotion.type === 'percentage_discount';
        const promotionIcon = isPercentage ? <PercentageOutlined style={{ color: 'var(--limon)' }} /> : <MoneyCollectOutlined style={{ color: 'var(--limon)' }} />;
        const promotionValue = isPercentage
          ? `${promotion.value}% de réduction`
          : `${promotion.value} DH tarif fixe`;

        // Calculer le temps restant jusqu'à la fin de la promotion
        const endDate = dayjs(promotion.endDate);
        const now = dayjs();

        // S'assurer que la date de fin est dans le futur
        if (endDate.isBefore(now)) {
          return null; // Ignorer les promotions expirées
        }

        return (
          <Card
            key={promotion._id}
            title={promotionIcon}
            style={{ marginBottom: '16px', background: 'var(--gradien2)' }}
            bordered={false}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <Text style={{ color: 'var(--white)' }} strong>{promotionValue}</Text>
                <br />
                <Text style={{ color: 'var(--gray)' }} type="secondary">
                  {promotion.appliesTo === 'all'
                    ? 'S’applique à tous les clients'
                    : 'Promotion exclusive'}
                </Text>
                <br />
                <Text style={{ color: 'var(--gray)' }} type="secondary">
                  Valable jusqu’au {endDate.format('YYYY-MM-DD HH:mm')}
                </Text>
              </div>
              <Countdown
                title={<span style={{ color: 'var(--gray)' }}>Temps restant</span>}
                value={endDate.toDate()}
                format="D [Jours] HH:mm:ss"
                valueStyle={{ color: 'var(--limon)' }}
                onFinish={() => {
                  // Actualiser les promotions une fois le compte à rebours terminé
                  dispatch(getValidPromotionsForUser());
                }}
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default PromotionStore;
