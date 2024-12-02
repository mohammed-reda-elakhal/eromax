import React, { useEffect, useState } from 'react';
import { UserOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip, Input, Button, Radio, Space } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { registerUser } from '../redux/apiCalls/authApiCalls';

function Register() {
  const [nom, setNom] = useState('');
  const [storeName, setStoreName] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [tele, setTele] = useState('');
  const [ville, setVille] = useState('');
  const [password, setPassword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [numberColis, setNumberColis] = useState('');
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0);
}, [dispatch]);

  const clearData = () => {
    setNom('');
    setPrenom('');
    setEmail('');
    setTele('');
    setVille('');
    setPassword('');
    setStartDate('');
    setNumberColis('');
    setStoreName('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      nom,
      prenom,
      email,
      tele,
      ville,
      password,
      start_date: startDate,
      number_colis: numberColis,
      storeName
    };
    dispatch(registerUser('client' , formData))
    clearData();
    navigate('/login')
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
        <form onSubmit={handleSubmit} className='form_inputs'>
          <Input
            size="large"
            placeholder="Nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            suffix={
              <Tooltip title="Entrer votre nom">
                <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
              </Tooltip>
            }
          />
          <Input
            size="large"
            placeholder="Prénom"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            suffix={
              <Tooltip title="Entrer votre prénom">
                <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
              </Tooltip>
            }
          />
          <Input
            size="large"
            placeholder="Nom de Store"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            suffix={
              <Tooltip title="Entrer le nom de votre store">
                <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
              </Tooltip>
            }
          />
          <Input
            size="large"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            suffix={
              <Tooltip title="Entrer votre email">
                <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
              </Tooltip>
            }
          />
          <Input
            size="large"
            placeholder="Téléphone"
            value={tele}
            onChange={(e) => setTele(e.target.value)}
            suffix={
              <Tooltip title="Entrer votre numéro de téléphone">
                <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
              </Tooltip>
            }
          />
          <Input
            size="large"
            placeholder="Ville"
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            suffix={
              <Tooltip title="Entrer votre ville">
                <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
              </Tooltip>
            }
          />
          <Input.Password
            size="large"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div>
            <p>Date de début :</p>
            <Radio.Group onChange={(e) => setStartDate(e.target.value)} value={startDate}>
              <Space direction="vertical">
                <Radio value="Maintenant">Maintenant</Radio>
                <Radio value="Après Semaine">Après Semaine</Radio>
                <Radio value="Après Mois">Après Mois</Radio>
                <Radio value="More">
                  More...
                  {startDate === 'More' ? (
                    <Input style={{ width: 100, marginLeft: 10 }} onChange={(e) => setStartDate(e.target.value)} />
                  ) : null}
                </Radio>
              </Space>
            </Radio.Group>
          </div>
          <div>
            <p>Nombre de colis par jour :</p>
            <Radio.Group onChange={(e) => setNumberColis(e.target.value)} value={numberColis}>
              <Space direction="vertical">
                <Radio value="1-5">1-5</Radio>
                <Radio value="5-10">5-10</Radio>
                <Radio value="10-50">10-50</Radio>
                <Radio value="More">
                  More...
                  {numberColis === 'More' ? (
                    <Input style={{ width: 100, marginLeft: 10 }} onChange={(e) => setNumberColis(e.target.value)} />
                  ) : null}
                </Radio>
              </Space>
            </Radio.Group>
          </div>
          <Button type="primary" htmlType="submit">
            Créer compte
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Register;
