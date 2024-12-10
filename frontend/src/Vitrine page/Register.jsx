import React, { useEffect, useState } from 'react';
import { UserOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip, Input, Button, Radio, Space, Select, Form } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch , useSelector } from 'react-redux';
import { registerUser } from '../redux/apiCalls/authApiCalls';
import { getAllVilles } from '../redux/apiCalls/villeApiCalls';

const { Option } = Select;

function Register() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { villes } = useSelector((state) => state.ville);

  const [showCustomStartDate, setShowCustomStartDate] = useState(false);
  const [showCustomNumberColis, setShowCustomNumberColis] = useState(false);

  useEffect(() => {
    if (villes.length === 0) {
      dispatch(getAllVilles());
    }
    window.scrollTo(0, 0);
  }, [dispatch, villes.length]);

  const onValuesChange = (changedValues, allValues) => {
    if (changedValues.start_date === 'More') {
      setShowCustomStartDate(true);
    } else if (changedValues.start_date && changedValues.start_date !== 'More') {
      setShowCustomStartDate(false);
    }

    if (changedValues.number_colis === 'More') {
      setShowCustomNumberColis(true);
    } else if (changedValues.number_colis && changedValues.number_colis !== 'More') {
      setShowCustomNumberColis(false);
    }
  };

  const handleFinish = (values) => {
    const formData = {
      nom: values.nom,
      prenom: values.prenom,
      email: values.email,
      tele: values.tele,
      ville: values.ville,
      password: values.password,
      start_date: values.start_date === 'More' ? values.start_date_custom : values.start_date,
      number_colis: values.number_colis === 'More' ? values.number_colis_custom : values.number_colis,
      storeName: values.storeName
    };

    dispatch(registerUser('client', formData));
    form.resetFields();
    navigate('/login');
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
          <p>Créer votre compte sur EROMAX</p>
        </div>
        
        <Form
          form={form}
          onFinish={handleFinish}
          onValuesChange={onValuesChange}
          className="form_inputs"
          layout="vertical"
        >
          <Form.Item
            name="nom"
            label="Nom"
            rules={[{ required: true, message: 'Veuillez entrer votre nom!' }]}
          >
            <Input
              size="large"
              placeholder="Nom"
              suffix={
                <Tooltip title="Entrer votre nom">
                  <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                </Tooltip>
              }
            />
          </Form.Item>

          <Form.Item
            name="prenom"
            label="Prénom"
            rules={[{ required: true, message: 'Veuillez entrer votre prénom!' }]}
          >
            <Input
              size="large"
              placeholder="Prénom"
              suffix={
                <Tooltip title="Entrer votre prénom">
                  <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                </Tooltip>
              }
            />
          </Form.Item>

          <Form.Item
            name="storeName"
            label="Nom de Store"
            rules={[{ required: true, message: 'Veuillez entrer le nom de votre store!' }]}
          >
            <Input
              size="large"
              placeholder="Nom de Store"
              suffix={
                <Tooltip title="Entrer le nom de votre store">
                  <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                </Tooltip>
              }
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { type: 'email', message: 'Adresse e-mail invalide!' },
              { required: true, message: 'Veuillez entrer votre email!' }
            ]}
          >
            <Input
              size="large"
              placeholder="Email"
              suffix={
                <Tooltip title="Entrer votre email">
                  <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                </Tooltip>
              }
            />
          </Form.Item>

          <Form.Item
            name="tele"
            label="Téléphone"
            rules={[
              { required: true, message: 'Veuillez entrer votre numéro de téléphone!' },
              {
                pattern: /^0\d{9}$/,
                message: 'Le numéro de téléphone doit commencer par 0 et contenir exactement 10 chiffres.'
              }
            ]}
            normalize={(value) => {
              if (!value) return value;
              let val = value.replace(/\D/g, '');   // Remove non-digits
              if (val && !val.startsWith('0')) {
                val = '0' + val;                    // Ensure starts with '0'
              }
              if (val.length > 10) {
                val = val.slice(0, 10);             // Limit to 10 digits
              }
              return val;
            }}
          >
            <Input
              size="large"
              placeholder="Téléphone"
              suffix={
                <Tooltip title="Entrer votre numéro de téléphone">
                  <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                </Tooltip>
              }
            />
          </Form.Item>

          <Form.Item
            name="ville"
            label="Ville"
            rules={[{ required: true, message: 'Veuillez sélectionner votre ville!' }]}
          >
            <Select
              size="large"
              placeholder="Sélectionnez votre ville"
              showSearch
              filterOption={(input, option) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {villes.map((v) => (
                <Option key={v._id} value={v.nom}>
                  {v.nom}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="password"
            label="Mot de passe"
            rules={[{ required: true, message: 'Veuillez entrer votre mot de passe!' }]}
          >
            <Input.Password
              size="large"
              placeholder="Mot de passe"
            />
          </Form.Item>

          <Form.Item
            name="start_date"
            label="Date de début"
            rules={[{ required: true, message: 'Veuillez sélectionner une date de début!' }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value="Maintenant">Maintenant</Radio>
                <Radio value="Après Semaine">Après Semaine</Radio>
                <Radio value="Après Mois">Après Mois</Radio>
                <Radio value="More">More...</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          {showCustomStartDate && (
            <Form.Item
              name="start_date_custom"
              rules={[{ required: true, message: 'Veuillez préciser votre date de début!' }]}
            >
              <Input size="large" placeholder="Préciser la date de début" />
            </Form.Item>
          )}

          <Form.Item
            name="number_colis"
            label="Nombre de colis par jour"
            rules={[{ required: true, message: 'Veuillez sélectionner un nombre de colis!' }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value="1-5">1-5</Radio>
                <Radio value="5-10">5-10</Radio>
                <Radio value="10-50">10-50</Radio>
                <Radio value="More">More...</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          {showCustomNumberColis && (
            <Form.Item
              name="number_colis_custom"
              rules={[{ required: true, message: 'Veuillez préciser votre nombre de colis!' }]}
            >
              <Input size="large" placeholder="Préciser le nombre de colis" />
            </Form.Item>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Créer compte
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default Register;
