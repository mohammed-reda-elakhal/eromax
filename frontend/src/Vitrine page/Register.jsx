import React, { useState } from 'react';
import { UserOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Flex, Input, Tooltip, Button, Radio, Space } from 'antd';
import type { RadioChangeEvent } from 'antd';
import { Link } from 'react-router-dom';

const formatNumber = (value) => new Intl.NumberFormat().format(value);
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
    <span className="numeric-input-title">{value !== '-' ? formatNumber(Number(value)) : '-'}</span>
  ) : (
    'Tél Exemple : 0655124822 '
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
          <Tooltip title="Entrer votre Numéro de telephone">
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

function Register() {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [storeName, setStoreName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [numberColis, setNumberColis] = useState('');

  const clearData = () => {
    setName('');
    setEmail('');
    setCity('');
    setNumber('');
    setStartDate('');
    setStoreName('');
    setNumberColis('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      name,
      number,
      email,
      city,
      storeName,
      startDate,
      numberColis,
    };
    console.log('Form Data:', formData);
    clearData();
  };

  const onChangeStartDate = (e: RadioChangeEvent) => {
    setStartDate(e.target.value);
  };

  const onChangeParcelsPerDay = (e: RadioChangeEvent) => {
    setNumberColis(e.target.value);
  };

  return (
    <div className="register-section">
      <Link to="/" className="register-section-logo">
        <img src="/image/logo-light.png" alt="" />
      </Link>
      <div className="register-section-main">
        <div className="register-main-title">
          <div className="register-main-title-icon">
            <UserOutlined />
          </div>
          <p>Creér votre compte sur EROMAX</p>
        </div>
        <form onSubmit={handleSubmit}>
          <Flex vertical gap={12}>
            <Input
              size="large"
              placeholder="Nom et Prénom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              suffix={
                <Tooltip title="Entrer votre nom complet">
                  <InfoCircleOutlined
                    style={{
                      color: 'rgba(0,0,0,.45)',
                    }}
                  />
                </Tooltip>
              }
            />
            <NumericInput size="large" value={number} onChange={setNumber} />
            <Input
              size="large"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              suffix={
                <Tooltip title="Entrer votre adresse Email">
                  <InfoCircleOutlined
                    style={{
                      color: 'rgba(0,0,0,.45)',
                    }}
                  />
                </Tooltip>
              }
            />
            <Input
              size="large"
              placeholder="Ville"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              suffix={
                <Tooltip title="Entrer votre Ville">
                  <InfoCircleOutlined
                    style={{
                      color: 'rgba(0,0,0,.45)',
                    }}
                  />
                </Tooltip>
              }
            />
            <Input
              size="large"
              placeholder="Nom de Store"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              suffix={
                <Tooltip title="Entrer votre nom de store">
                  <InfoCircleOutlined
                    style={{
                      color: 'rgba(0,0,0,.45)',
                    }}
                  />
                </Tooltip>
              }
            />
            <div>
              <p>Date de Debut :</p>
              <Radio.Group onChange={onChangeStartDate} value={startDate}>
                <Space direction="vertical">
                  <Radio value="Maintenant">Maintenant</Radio>
                  <Radio value="Aprés Semaine">Aprés Semaine</Radio>
                  <Radio value="Aprés Mois">Aprés Mois</Radio>
                  <Radio value="More">
                    More...
                    {startDate === 'More' ? <Input style={{ width: 100, marginLeft: 10 }} /> : null}
                  </Radio>
                </Space>
              </Radio.Group>
            </div>
            <div>
              <p>Nombre de colis par jours :</p>
              <Radio.Group onChange={onChangeParcelsPerDay} value={numberColis}>
                <Space direction="vertical">
                  <Radio value="1 - 5">1 - 5</Radio>
                  <Radio value="5 - 10">5 - 10</Radio>
                  <Radio value="10 - 50">10 - 50</Radio>
                  <Radio value="More">
                    More...
                    {numberColis === 'More' ? <Input style={{ width: 100, marginLeft: 10 }} /> : null}
                  </Radio>
                </Space>
              </Radio.Group>
            </div>
            <Button type="primary" htmlType="submit">
              Créer compte
            </Button>
          </Flex>
        </form>
      </div>
    </div>
  );
}

export default Register;
