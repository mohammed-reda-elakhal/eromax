import React, { useState } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { copieColis } from '../../../../redux/apiCalls/colisApiCalls';

const CopieColisModal = ({ visible, onCancel }) => {
  const [colisId, setColisId] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    if (!colisId) {
      toast.error('Please enter a colis ID');
      return;
    }

    setLoading(true);
    try {
      await dispatch(copieColis(colisId));
      setColisId('');
      onCancel();
    } catch (error) {
      console.error('Error copying colis:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Copy Colis"
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
          Copy
        </Button>,
      ]}
    >
      <Form layout="vertical">
        <Form.Item
          label="Colis Code"
          required
          rules={[{ required: true, message: 'Please input the colis ID' }]}
        >
          <Input 
            placeholder="Enter colis code"
            value={colisId}
            onChange={(e) => setColisId(e.target.value)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CopieColisModal;
