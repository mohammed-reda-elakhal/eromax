import React, { useEffect } from 'react';
import { Form, Input, Button, Select } from 'antd';

const { Option } = Select;

function LivreurForm({ onClose, initialValues, onSubmit , formLivreur }) {
  const [form] = Form.useForm();

  useEffect(() => {
    // check id 
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }else{
      form.setFieldsValue('')
    }
  }, [formLivreur]);

  const onFinish = (values) => {
    onSubmit(values);
    form.resetFields();
    onClose();
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <Form.Item
        name="nom"
        label="Nom"
        rules={[{ required: true, message: 'Veuillez entrer le nom' }]}
      >
        <Input placeholder="Nom" />
      </Form.Item>

      <Form.Item
        name="prenom"
        label="Prénom"
        rules={[{ required: true, message: 'Veuillez entrer le prénom' }]}
      >
        <Input placeholder="Prénom" />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, type: 'email', message: 'Veuillez entrer un email valide' }]}
      >
        <Input placeholder="Email" />
      </Form.Item>

      <Form.Item
        name="tele"
        label="Téléphone"
        rules={[{ required: true, message: 'Veuillez entrer le numéro de téléphone' }]}
      >
        <Input placeholder="Téléphone" />
      </Form.Item>
      
      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, message: 'Veuillez entrer password' }]}
      >
        <Input placeholder="Adresse" />
      </Form.Item>

      <Form.Item
        name="username"
        label="Username"
        rules={[{ required: false, message: 'Veuillez entrer le username' }]}
      >
        <Input placeholder="Username" />
      </Form.Item>

      <Form.Item
        name="ville"
        label="Ville"
        rules={[{ required: false, message: 'Veuillez entrer la ville' }]}
      >
        <Input placeholder="Ville" />
      </Form.Item>

      <Form.Item
        name="adress"
        label="Adresse"
        rules={[{ required: false, message: 'Veuillez entrer l\'adresse' }]}
      >
        <Input placeholder="Adresse" />
      </Form.Item>
      
     

      <Form.Item
        name="region"
        label="Région"
        rules={[{ required: false, message: 'Veuillez sélectionner une région' }]}
      >
        <Select mode="multiple" placeholder="Sélectionnez une région">
          <Option value="Nantes">Nantes</Option>
          <Option value="Saint-Herblain">Saint-Herblain</Option>
          <Option value="Rezé">Rezé</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="active_acount"
        label="Activation de compte"
        valuePropName="checked"
      >
        <Select>
          <Option value={true}>Activée</Option>
          <Option value={false}>Non Activée</Option>
        </Select>
      </Form.Item>

      <Button type="primary" htmlType="submit">Enregistrer</Button>
    </Form>
  );
}

export default LivreurForm;
