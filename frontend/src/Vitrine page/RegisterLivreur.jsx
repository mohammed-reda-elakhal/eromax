import React, { useState } from 'react';
import { UserOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Input, Tooltip, Button, Form, Select } from 'antd';
import { Link } from 'react-router-dom';

const { Option } = Select;

const NumericInput = (props) => {
  const { value, onChange } = props;
  const handleChange = (e) => {
    const { value: inputValue } = e.target;
    const reg = /^-?\d*(\.\d*)?$/;
    if (reg.test(inputValue) || inputValue === '' || inputValue === '-') {
      onChange(inputValue);
    }
  };

  const handleBlur = () => {
    let valueTemp = value;
    if (value.charAt(value.length - 1) === '.' || value === '-') {
      valueTemp = value.slice(0, -1);
    }
    onChange(valueTemp.replace(/0*(\d+)/, '$1'));
  };
  const title = value ? (
    <span className="numeric-input-title">{value !== '-' ? value : '-'}</span>
  ) : (
    'Tél Exemple : 0655124822'
  );
  return (
    <Tooltip trigger={['focus']} title={title} placement="topLeft" overlayClassName="numeric-input">
      <Input
        {...props}
        size="large"
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Numéro"
        maxLength={10}
        suffix={
          <Tooltip title="Entrer votre Numéro de téléphone">
            <InfoCircleOutlined
              style={{
                color: 'rgba(0,0,0,.45)',
              }}
            />
          </Tooltip>
        }
      />
    </Tooltip>
  );
};

function RegisterLivreur() {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Form values:', values);
    // Handle form submission logic here
  };

  return (
    <div className="register-section">
      <Link to="/" className="register-section-logo">
        <img src="/image/logo-light.png" alt="Logo" />
      </Link>
      <div className="register-section-main">
        <div className="register-main-title">
          <div className="register-main-title-icon">
            <UserOutlined />
          </div>
          <p>Devenir livreur avec EROMAX</p>
        </div>
        <Form
          form={form}
          name="register-livreur"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="nom"
            label="Nom"
            rules={[{ required: true, message: 'Veuillez entrer votre nom!' }]}
          >
            <Input placeholder="Nom" size="large" />
          </Form.Item>

          <Form.Item
            name="prenom"
            label="Prénom"
            rules={[{ required: true, message: 'Veuillez entrer votre prénom!' }]}
          >
            <Input placeholder="Prénom" size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Veuillez entrer votre email!' },
              { type: 'email', message: 'L\'email n\'est pas valide!' }
            ]}
          >
            <Input placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item
            name="telephone"
            label="Téléphone"
            rules={[{ required: true, message: 'Veuillez entrer votre numéro de téléphone!' }]}
          >
            <NumericInput />
          </Form.Item>

          <Form.Item
            name="ville"
            label="Ville"
            rules={[{ required: true, message: 'Veuillez choisir votre ville!' }]}
          >
            <Select placeholder="Choisir une ville" size="large">
              <Option value="ville1">Ville 1</Option>
              <Option value="ville2">Ville 2</Option>
              <Option value="ville3">Ville 3</Option>
              {/* Add more options as needed */}
            </Select>
          </Form.Item>

          <Form.Item
            name="region"
            label="Région"
            rules={[{ required: true, message: 'Veuillez sélectionner au moins une région!' }]}
          >
            <Select
              mode="multiple"
              placeholder="Choisir des régions"
              size="large"
            >
              <Option value="region1">Région 1</Option>
              <Option value="region2">Région 2</Option>
              <Option value="region3">Région 3</Option>
              {/* Add more options as needed */}
            </Select>
          </Form.Item>

          <Form.Item
            name="cne"
            label="CNE"
            rules={[{ required: true, message: 'Veuillez entrer votre CNE!' }]}
          >
            <Input placeholder="CNE" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large">
              S'inscrire
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default RegisterLivreur;
