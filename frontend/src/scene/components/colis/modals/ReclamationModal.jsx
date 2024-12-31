// components/ColisTable/modals/ReclamationModal.jsx

import React from 'react';
import { Modal, Input } from 'antd';

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
  return (
    <Modal 
      title="Reclamation" 
      visible={visible} 
      onOk={onCreate} 
      onCancel={onCancel} 
      className={theme === 'dark' ? 'dark-mode' : ''}
    >
      <Input 
        placeholder="Sujet" 
        value={subject} 
        onChange={(e) => setSubject(e.target.value)} 
        style={{ marginBottom: '10px' }} 
      />
      <Input.TextArea 
        placeholder="Message/Description" 
        value={message} 
        onChange={(e) => setMessage(e.target.value)} 
        rows={4} 
      />
    </Modal>
  );
});

export default ReclamationModal;
