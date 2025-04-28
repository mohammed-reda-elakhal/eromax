// components/ColisTable/modals/ReclamationModal.jsx

import React, { useState } from 'react';
import { Modal, Input, Select, Alert, Typography } from 'antd';
import {
  DollarOutlined,
  UserSwitchOutlined,
  EditOutlined,
  PhoneOutlined,
  CustomerServiceOutlined,
  StopOutlined,
  RollbackOutlined,
  WarningOutlined,
  FormOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

/**
 * ReclamationModal component handles filing a reclamation.
 *
 * Props:
 * - visible: boolean to control modal visibility
 * - onCreate: function to handle creation of reclamation
 * - onCancel: function to handle modal cancel
 * - initialMessage: string for initial message input
 * - setInitialMessage: function to update initial message
 * - selectedColis: the colis object for which the reclamation is being created
 * - theme: 'dark' or 'light'
 */
const ReclamationModal = React.memo(({
  visible,
  onCreate,
  onCancel,
  initialMessage,
  setInitialMessage,
  selectedColis,
  theme,
}) => {
  const [messageType, setMessageType] = useState('changement_prix');

  // Predefined message templates with icons
  const messageTemplates = [
    {
      value: 'changement_prix',
      label: 'Changement de prix',
      icon: <DollarOutlined />,
      template: `Je souhaite modifier le prix du colis ${selectedColis?.code_suivi || ''}.\n\nNouveau prix: ___ DH\nRaison du changement: ___`
    },
    {
      value: 'changement_destinataire',
      label: 'Changement de destinataire',
      icon: <UserSwitchOutlined />,
      template: `Je souhaite modifier le destinataire du colis ${selectedColis?.code_suivi || ''}.\n\nNouveau nom: ___\nNouveau téléphone: ___`
    },
    {
      value: 'changement_infos',
      label: 'Changement des informations',
      icon: <EditOutlined />,
      template: `Je souhaite modifier les informations du colis ${selectedColis?.code_suivi || ''}.\n\nAdresse: ___ \nTéléphone: ___ \nAutres modifications: ___`
    },
    {
      value: 'ajouter_numero',
      label: 'Ajouter un autre numéro',
      icon: <PhoneOutlined />,
      template: `Je souhaite ajouter un numéro de téléphone supplémentaire pour le colis ${selectedColis?.code_suivi || ''}.\n\nNuméro additionnel: ___ \nNom du contact: ___`
    },
    {
      value: 'rappeler_client',
      label: 'Rappeler le client',
      icon: <CustomerServiceOutlined />,
      template: `Merci de rappeler le client pour le colis ${selectedColis?.code_suivi || ''}.\n\nMeilleur moment pour appeler: ___ \nRaison de l'appel: ___`
    },
    {
      value: 'annuler_colis',
      label: 'Annuler le colis',
      icon: <StopOutlined />,
      template: `Je souhaite annuler le colis ${selectedColis?.code_suivi || ''}.\n\nRaison de l'annulation: ___\nInstructions particulières: ___`
    },
    {
      value: 'demande_retour',
      label: 'Demande le retour',
      icon: <RollbackOutlined />,
      template: `Je demande le retour du colis ${selectedColis?.code_suivi || ''}.\n\nRaison du retour: ___\nAdresse de retour: ___`
    },
    {
      value: 'plainte_livreur',
      label: 'Plainte concernant le livreur',
      icon: <WarningOutlined />,
      template: `Je souhaite signaler un problème concernant le livreur pour le colis ${selectedColis?.code_suivi || ''}.\n\nDate de l'incident: ___\nDescription du problème: ___`
    },
    {
      value: 'custom',
      label: 'Autre...',
      icon: <FormOutlined />,
      template: `Concernant le colis ${selectedColis?.code_suivi || ''}:\n\n`
    }
  ];

  const handleMessageTypeChange = (value) => {
    setMessageType(value);
    const selectedTemplate = messageTemplates.find(template => template.value === value);
    setInitialMessage(selectedTemplate?.template || '');
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <InfoCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          <span>Créer une réclamation</span>
        </div>
      }
      open={visible}
      onOk={onCreate}
      onCancel={onCancel}
      okText="Créer la réclamation"
      cancelText="Annuler"
      className={theme === 'dark' ? 'dark-mode' : ''}
    >
      <Alert
        message="Nouvelle approche de réclamation"
        description="Les réclamations sont maintenant créées directement avec un message initial. Choisissez un type de message ci-dessous et personnalisez-le selon vos besoins."
        type="info"
        showIcon
        style={{ marginBottom: '16px' }}
      />

      {selectedColis && (
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: theme === 'dark' ? '#1f1f1f' : '#f5f5f5', borderRadius: '4px' }}>
          <Text strong>Colis:</Text> {selectedColis.code_suivi}<br />
          <Text strong>Destinataire:</Text> {selectedColis.nom}<br />
          <Text strong>Téléphone:</Text> {selectedColis.tele}<br />
          <Text strong>Ville:</Text> {selectedColis.ville?.nom || 'N/A'}
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <Text strong>Type de message:</Text>
        <Select
          style={{ width: '100%', marginTop: '8px' }}
          placeholder="Sélectionnez le type de message"
          onChange={handleMessageTypeChange}
          value={messageType}
        >
          {messageTemplates.map(option => (
            <Option key={option.value} value={option.value}>
              {option.icon} {option.label}
            </Option>
          ))}
        </Select>
      </div>

      <div>
        <Text strong>Votre message:</Text>
        <Input.TextArea
          placeholder="Écrivez votre message ici"
          value={initialMessage}
          onChange={(e) => setInitialMessage(e.target.value)}
          rows={8}
          style={{
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            lineHeight: '1.5',
            marginTop: '8px'
          }}
        />
      </div>
    </Modal>
  );
});

export default ReclamationModal;
