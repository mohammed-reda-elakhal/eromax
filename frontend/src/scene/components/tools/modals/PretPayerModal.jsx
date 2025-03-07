import React, { useState } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setColisPayant } from '../../../../redux/apiCalls/colisApiCalls';

const PretPayerModal = ({ visible, onCancel }) => {
  const [codeSuivi, setCodeSuivi] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    if (!codeSuivi) {
      toast.error('Please enter a colis code');
      return;
    }

    setLoading(true);
    try {
      await dispatch(setColisPayant(codeSuivi));
      setCodeSuivi('');
      onCancel(); // Close the modal after successful toggle
    } catch (error) {
      console.error('Error toggling payment status:', error);
      toast.error('Failed to toggle payment status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Toggle Prêt à Payer Status"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSubmit} 
          loading={loading}
        >
          Toggle Status
        </Button>,
      ]}
    >
      <Form layout="vertical">
        <Form.Item
          label="Colis Code"
          required
          rules={[{ required: true, message: 'Please input the colis code' }]}
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

export default PretPayerModal;
