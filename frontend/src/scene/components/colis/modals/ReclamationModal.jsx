// components/ColisTable/modals/ReclamationModal.jsx

import React, { useState } from 'react';
import { Modal, Input, Select } from 'antd';
import { 
  DollarOutlined, 
  UserSwitchOutlined, 
  EditOutlined, 
  PhoneOutlined,
  CustomerServiceOutlined,
  StopOutlined,
  RollbackOutlined,
  WarningOutlined,
  FormOutlined
} from '@ant-design/icons';

const { Option } = Select;

/**
 * ReclamationModal component handles filing a reclamation.
 *
 * Props:
 * - visible: boolean to control modal visibility
 * - onCreate: function to handle creation of reclamation
 * - onCancel: function to handle modal cancel
 * - subject: string for subject input
 * - setSubject: function to update subject
 * - message: string for message input
 * - setMessage: function to update message
 * - theme: 'dark' or 'light'
 */
const ReclamationModal = React.memo(({
  visible,
  onCreate,
  onCancel,
  subject,
  setSubject,
  message,
  setMessage,
  theme,
}) => {
  const [isCustomSubject, setIsCustomSubject] = useState(false);

  // Predefined subjects with icons and default messages
  const subjectOptions = [
    { 
      value: 'changement_prix', 
      label: 'Changement de prix',
      icon: <DollarOutlined />,
      defaultMessage: "Je souhaite modifier le prix du colis.\n\nNouveau prix: ___ DH\nRaison du changement: ___"
    },
    { 
      value: 'changement_destinataire', 
      label: 'Changement de destinataire',
      icon: <UserSwitchOutlined />,
      defaultMessage: "Je souhaite modifier le destinataire du colis.\n\nNouveau nom: ___\nNouveau téléphone: ___"
    },
    { 
      value: 'changement_infos', 
      label: 'Changement des informations',
      icon: <EditOutlined />,
      defaultMessage: "Je souhaite modifier les informations suivantes:\n\nAdresse: ___ .\nTéléphone: ___ .\nAutres modifications: ___"
    },
    { 
      value: 'ajouter_numero', 
      label: 'Ajouter un autre numéro',
      icon: <PhoneOutlined />,
      defaultMessage: "Je souhaite ajouter un numéro de téléphone supplémentaire:\n\nNuméro additionnel: ___ .\nNom du contact: ___"
    },
    { 
      value: 'rappeler_client', 
      label: 'Rappeler le client',
      icon: <CustomerServiceOutlined />,
      defaultMessage: "Merci de rappeler le client.\n\nMeilleur moment pour appeler: ___ .\nRaison de l'appel: ___"
    },
    { 
      value: 'annuler_colis', 
      label: 'Annuler le colis',
      icon: <StopOutlined />,
      defaultMessage: "Je souhaite annuler ce colis.\n\nRaison de l'annulation: ___\nInstructions particulières: ___"
    },
    { 
      value: 'demande_retour', 
      label: 'Demande le retour',
      icon: <RollbackOutlined />,
      defaultMessage: "Je demande le retour du colis.\n\nRaison du retour: ___\nAdresse de retour: ___"
    },
    { 
      value: 'plainte_livreur', 
      label: 'Plainte concernant le livreur',
      icon: <WarningOutlined />,
      defaultMessage: "Je souhaite signaler un problème concernant le livreur:\n\nDate de l'incident: ___\nDescription du problème: ___"
    },
    { 
      value: 'custom', 
      label: 'Autre...',
      icon: <FormOutlined />,
      defaultMessage: ""
    }
  ];

  const handleSubjectChange = (value) => {
    if (value === 'custom') {
      setIsCustomSubject(true);
      setSubject('');
      setMessage('');
    } else {
      setIsCustomSubject(false);
      const selectedOption = subjectOptions.find(option => option.value === value);
      setSubject(selectedOption?.label || '');
      setMessage(selectedOption?.defaultMessage || '');
    }
  };

  return (
    <Modal 
      title="Reclamation" 
      visible={visible} 
      onOk={onCreate} 
      onCancel={onCancel} 
      className={theme === 'dark' ? 'dark-mode' : ''}
    >
      <div style={{ marginBottom: '10px' }}>
        <Select
          style={{ width: '100%', marginBottom: isCustomSubject ? '10px' : '0' }}
          placeholder="Sélectionnez le sujet"
          onChange={handleSubjectChange}
          value={isCustomSubject ? 'custom' : subject}
        >
          {subjectOptions.map(option => (
            <Option key={option.value} value={option.value}>
              {option.icon} {option.label}
            </Option>
          ))}
        </Select>
        
        {isCustomSubject && (
          <Input 
            placeholder="Entrez votre sujet" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)} 
            style={{ width: '100%' }} 
          />
        )}
      </div>

      <Input.TextArea 
        placeholder="Message/Description" 
        value={message} 
        onChange={(e) => setMessage(e.target.value)} 
        rows={6}
        style={{ 
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          lineHeight: '1.5'
        }}
      />
    </Modal>
  );
});

export default ReclamationModal;
