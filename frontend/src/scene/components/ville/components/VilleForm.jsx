import React from 'react';
import { Form, Input, InputNumber, Button } from 'antd';

function VilleForm({theme}) {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    console.log('Form values:', values);
    // Here you would typically handle form submission, e.g., sending data to an API.
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>Ville Form</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >

        <Form.Item
          label="Ref"
          name="ref"
          rules={[{ required: true, message: 'Please input the reference!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Nom"
          name="nom"
          rules={[{ required: true, message: 'Please input the name!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Tarif"
          name="tarif"
          rules={[{ required: true, message: 'Please input the tariff!' }]}
        >
          <InputNumber min={0} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default VilleForm;
