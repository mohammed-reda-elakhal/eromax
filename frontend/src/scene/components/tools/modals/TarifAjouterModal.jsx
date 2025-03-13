import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Spin } from 'antd';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { getTarifAjouter, updateTarifAjouter } from '../../../../redux/apiCalls/colisApiCalls';

const TarifAjouterModal = ({ visible, onCancel }) => {
  const [codeSuivi, setCodeSuivi] = useState('');
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { selectedTarifAjouter, tarifAjouterLoading } = useSelector((state) => state.colis);

  // Reset form when modal becomes visible
  useEffect(() => {
    if (visible) {
      setCodeSuivi('');
      form.resetFields();
    }
  }, [visible, form]);

  // Update form values when selectedTarifAjouter changes
  useEffect(() => {
    if (selectedTarifAjouter) {
      form.setFieldsValue({
        value: selectedTarifAjouter.value,
        description: selectedTarifAjouter.description
      });
    }
  }, [selectedTarifAjouter, form]);

  const handleSearch = async () => {
    if (!codeSuivi) {
      toast.error('Please enter a code suivi');
      return;
    }
    try {
      const result = await dispatch(getTarifAjouter(codeSuivi));
      if (result?.tarif_ajouter) {
        form.setFieldsValue({
          value: result.tarif_ajouter.value,
          description: result.tarif_ajouter.description
        });
      }
    } catch (error) {
      toast.error('Error fetching tarif ajouter');
      form.resetFields();
    }
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      await dispatch(updateTarifAjouter(codeSuivi, {
        value: parseFloat(values.value),
        description: values.description
      }));
      toast.success('Tarif ajouter updated successfully');
      onCancel();
    } catch (error) {
      toast.error('Error updating tarif ajouter');
    }
  };

  return (
    <Modal
      title="Prix Ajouter"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleUpdate}
          disabled={!selectedTarifAjouter}
        >
          Update
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Input.Group compact>
          <Input
            style={{ width: 'calc(100% - 88px)' }}
            placeholder="Enter code suivi"
            value={codeSuivi}
            onChange={(e) => setCodeSuivi(e.target.value)}
          />
          <Button type="primary" onClick={handleSearch}>
            Search
          </Button>
        </Input.Group>
      </div>

      {tarifAjouterLoading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin />
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          initialValues={{ value: 0, description: '' }}
        >
          <Form.Item
            name="value"
            label="Value"
            rules={[
              { required: true, message: 'Please input the value' },
              { type: 'number', transform: (value) => parseFloat(value) }
            ]}
          >
            <Input type="number" placeholder="Enter value" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea placeholder="Enter description" />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default TarifAjouterModal; 