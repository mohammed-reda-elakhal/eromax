import React, { useState } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { fixCrbtForColis } from '../../../../redux/apiCalls/colisApiCalls';

const FixeCRBTModal = ({ visible, onCancel }) => {
  const [codeSuivi, setCodeSuivi] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    if (!codeSuivi) {
      toast.error('Please enter a code_suivi');
      return;
    }
    setLoading(true);
    try {
      // Dispatch the fixCrbtForColis API action with the provided code_suivi
      await dispatch(fixCrbtForColis(codeSuivi));
      setCodeSuivi('');
      onCancel(); // Close the modal after successful fix
    } catch (error) {
      toast.error('Error fixing CRBT');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Fixe CRBT"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
          Fix
        </Button>,
      ]}
    >
      <Form layout="vertical">
        <Form.Item
          label="Code Colis"
          required
          rules={[{ required: true, message: 'Please input the code suivi' }]}
        >
          <Input 
            placeholder="Enter colis code"
            value={codeSuivi}
            onChange={(e) => setCodeSuivi(e.target.value)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FixeCRBTModal;
