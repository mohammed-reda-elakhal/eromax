import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, DatePicker } from 'antd';
import { PDFDownloadLink } from '@react-pdf/renderer';
import TicketTemplate from './TicketTemplate';

const { TextArea } = Input;

const TicketGeneratorModal = ({ visible, onCancel }) => {
  const [form] = Form.useForm();
  const [ticketData, setTicketData] = useState(null);

  const handleCancel = () => {
    form.resetFields();
    setTicketData(null);
    onCancel();
  };

  const handleSubmit = (values) => {
    setTicketData({
      ...values,
      date: values.date.format('DD/MM/YYYY')
    });
  };

  return (
    <Modal
      title="Générateur de Tickets"
      visible={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="livreur"
          label="Nom de Livreur"
          rules={[{ required: true, message: 'Veuillez entrer le nom du livreur' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="type"
          label="Type"
          rules={[{ required: true, message: 'Veuillez sélectionner le type' }]}
        >
          <Select>
            <Select.Option value="Envoi">Envoi</Select.Option>
            <Select.Option value="Retour">Retour</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="date"
          label="Date"
          rules={[{ required: true, message: 'Veuillez sélectionner la date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="commentaire"
          label="Commentaire"
        >
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Générer le Ticket
          </Button>
        </Form.Item>
      </Form>

      {ticketData && (
        <PDFDownloadLink
          document={<TicketTemplate data={ticketData} />}
          fileName="ticket.pdf"
          style={{
            display: 'block',
            marginTop: 16,
            padding: '8px 16px',
            backgroundColor: '#1890ff',
            color: 'white',
            textAlign: 'center',
            borderRadius: '4px',
            textDecoration: 'none'
          }}
        >
          Télécharger PDF
        </PDFDownloadLink>
      )}
    </Modal>
  );
};

export default TicketGeneratorModal;
