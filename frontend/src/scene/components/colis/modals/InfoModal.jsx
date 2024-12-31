// components/ColisTable/modals/InfoModal.jsx

import React from 'react';
import { Modal, Descriptions, Badge, Typography, Col } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

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
  if (!selectedColis) return null;

  return (
    <Modal
      title="Détails du Colis"
      visible={visible}
      onCancel={onClose}
      footer={null}
      className={theme === 'dark' ? 'dark-mode' : ''}
      width={'90%'}
    >
      <Descriptions
        bordered
        layout="vertical"
        className="responsive-descriptions"
      >
        <Descriptions.Item label="Code Suivi">
          <Col xs={24} sm={12} md={8}>
            {selectedColis.code_suivi}
          </Col>
        </Descriptions.Item>
        <Descriptions.Item label="Destinataire">
          <Col xs={24} sm={12} md={8}>
            {selectedColis.nom}
          </Col>
        </Descriptions.Item>
        <Descriptions.Item label="Téléphone">
          <Col xs={24} sm={12} md={8}>
            {selectedColis.tele}
          </Col>
        </Descriptions.Item>
        <Descriptions.Item label="Adresse">
          <Col xs={24} sm={12} md={8}>
            {selectedColis.adresse}
          </Col>
        </Descriptions.Item>
        <Descriptions.Item label="Ville">
          <Col xs={24} sm={12} md={8}>
            {selectedColis.ville?.nom || 'N/A'}
          </Col>
        </Descriptions.Item>
        <Descriptions.Item label="Business">
          <Col xs={24} sm={12} md={8}>
            {selectedColis.store?.storeName || 'N/A'}
          </Col>
        </Descriptions.Item>
        <Descriptions.Item label="Nature de Produit">
          <Col xs={24} sm={12} md={8}>
            {selectedColis.nature_produit || 'N/A'}
          </Col>
        </Descriptions.Item>
        <Descriptions.Item label="Prix (DH)">
          <Col xs={24} sm={12} md={8}>
            {selectedColis.prix}
          </Col>
        </Descriptions.Item>
        <Descriptions.Item label="Statut">
          <Col xs={24} sm={12} md={8}>
            <Badge dot color={statusBadgeConfig[selectedColis.statut]?.color || 'default'}>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                {statusBadgeConfig[selectedColis.statut]?.icon || <InfoCircleOutlined />}
                <span style={{ marginLeft: 8 }}>{selectedColis.statut}</span>
              </span>
            </Badge>
          </Col>
        </Descriptions.Item>

        <Descriptions.Item label="Commentaire">
          <Col xs={24} sm={12} md={8}>
            {selectedColis.commentaire || 'N/A'}
          </Col>
        </Descriptions.Item>

        <Descriptions.Item label="Date de Création">
          <Col xs={24} sm={12} md={8}>
            {formatDate(selectedColis.createdAt)}
          </Col>
        </Descriptions.Item>
        <Descriptions.Item label="Dernière mise à jour">
          <Col xs={24} sm={12} md={8}>
            {formatDate(selectedColis.updatedAt)}
          </Col>
        </Descriptions.Item>
        {/* Additional fields */}
        <Descriptions.Item label="État">
          <Col xs={24} sm={12} md={8}>
            {selectedColis.etat ? 
              <Badge 
                dot 
                color="green" 
                style={{ marginRight: '8px' }}
              />
              : 
              <Badge 
                dot 
                color="red" 
                style={{ marginRight: '8px' }}
              />
            }
            <Text>{selectedColis.etat ? "Payée" : "Non Payée"}</Text>
          </Col>
        </Descriptions.Item>

        <Descriptions.Item label="Prés payant">
          <Col xs={24} sm={12} md={8}>
            {selectedColis.pret_payant ? 
              <Badge 
                dot 
                color="green" 
                style={{ marginRight: '8px' }}
              />
              : 
              <Badge 
                dot 
                color="red" 
                style={{ marginRight: '8px' }}
              />
            }
            <Text>{selectedColis.pret_payant ? "Payée" : "Non Payée"}</Text>
          </Col>
        </Descriptions.Item>

        <Descriptions.Item label="Autres Options">
          <Col xs={24} sm={12} md={8}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              <Badge dot color={selectedColis.ouvrir ? 'green' : 'red'} />
              <Text>Ouvrir: {selectedColis.ouvrir ? 'Oui' : 'Non'}</Text>
              <Badge dot color={selectedColis.is_simple ? 'green' : 'red'} />
              <Text>Is Simple: {selectedColis.is_simple ? 'Oui' : 'Non'}</Text>
              <Badge dot color={selectedColis.is_remplace ? 'green' : 'red'} />
              <Text>Is Remplace: {selectedColis.is_remplace ? 'Oui' : 'Non'}</Text>
              <Badge dot color={selectedColis.is_fragile ? 'green' : 'red'} />
              <Text>Is Fragile: {selectedColis.is_fragile ? 'Oui' : 'Non'}</Text>
            </div>
          </Col>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
});

export default InfoModal;
