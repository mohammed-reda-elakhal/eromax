import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button, Radio } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import './login.css';
import { loginUser, logoutUser } from '../redux/apiCalls/authApiCalls';
import { FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import SEO from '../components/SEO/SEO';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Clear data and possibly logout user on component mount
  useEffect(() => {
    dispatch(logoutUser());
    setEmail('');
    setPassword('');
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = { email, password };
    dispatch(loginUser(formData, role, navigate));
    clearData();
  };

  const handleRegisterNavigation = () => {
    if (role === 'client') {
      navigate('/register');
    } else if (role === 'livreur') {
      navigate('/register/livreur');
    } else if (role === 'staf') {
      navigate('/');
    }
  };

  const clearData = () => {
    setEmail('');
    setPassword('');
  };

  return (
    <div className="login-container">
      <SEO
        title="Login"
        description="Log in to your Eromax account to track your packages, manage your shipments, and more."
        keywords="login, sign in, account, eromax account, delivery account"
      />
      <div className="login-card">
        <div className="login-header">
          <img
            src="/image/logo-light.png"
            onClick={() => navigate('/')}
            style={{ cursor: "pointer" }}
            alt="Eromax"
            className="login-logo"
          />
          <h2>Bienvenue</h2>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-role-container">
            <Radio.Group
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="login-role-group"
            >
              <Radio.Button value="client" className="login-role-button">
                Client
              </Radio.Button>
              <Radio.Button value="livreur" className="login-role-button">
                Livreur
              </Radio.Button>
              <Radio.Button value="staf" className="login-role-button">
                Staff
              </Radio.Button>
            </Radio.Group>
          </div>
          <Input
            size="large"
            placeholder="Email"
            prefix={<MailOutlined className="login-input-icon" />}
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Input.Password
            size="large"
            placeholder="Mot de passe"
            prefix={<LockOutlined className="login-input-icon" />}
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Button
            type="primary"
            htmlType="submit"
            className="login-button"
            loading={useSelector(state => state.auth.loading)}
          >
            Connexion
          </Button>
        </form>
        <div className="login-footer">
          <span>Pas encore de compte?</span>
          <Button
            onClick={handleRegisterNavigation}
            className="login-footer-link"
            style={{ border: 'none', padding: 0, background: 'transparent' }}
          >
            S'inscrire
          </Button>
        </div>
        <div className="social_media_link">
          <Link to={"#"} aria-label="WhatsApp">
            <FaWhatsapp size={22} color='green'/>
          </Link>
          <Link to={"#"} aria-label="Instagram">
            <FaInstagram size={22} color='#e1306c'/>
          </Link>
          <Link to={"#"} aria-label="Facebook">
            <FaFacebook size={22} color='#1877f2'/>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
