import React, { useState } from 'react';
import { EyeInvisibleOutlined, EyeTwoTone, MailFilled } from '@ant-design/icons';
import { Input, Checkbox, Button } from 'antd';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../redux/apiCalls/authApiCall';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [role, setRole] = useState('client');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      email, password 
    };
    dispatch(loginUser(formData, role, navigate)); // admin => username
    clearData();
  };

  const clearData = () => {
    setEmail('');
    setPassword('');
    setRememberMe(false);
  };

  return (
    <div className='login-section'>
      <div className="login-section-main">
        <div className="login-section-toplogo">
          <img src="/image/logo_2.png" alt="" style={{ width: "80px" }} />
        </div>
        <div className="login-section-role">
          <p
           style={role === 'client' ? {color:"var(--limon)"} : {color:"black"}}
            onClick={() => setRole('client')}
          >
            Client
          </p>
          <p
           style={role === 'livreur' ? {color:"var(--limon)"} : {color:"black"}}
            onClick={() => setRole('livreur')}
          >
            Livreur
          </p>
          <p
            style={role === 'staff' ? {color:"var(--limon)"} : {color:"black"}}
            onClick={() => setRole('staff')}
          >
            Staff
          </p>
        </div>
        <div className="login-section-main-header">
          <h3>Bienvenue sur EROMAX</h3>
          <p>Ne partagez pas vos données de connexion pour votre sécurité</p>
        </div>
        <form onSubmit={handleSubmit}>
          <Input
            size="large"
            placeholder="Email"
            className='login-input'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input.Password
            size="large"
            className='login-input'
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
          <Button type="primary" block htmlType="submit">
            Log in
          </Button>
          <p className='footer-link-form'>
            <span>Nouveau sur EROMAX ?</span>
            <Link to='register' className='footer-link-form-link'>Créer votre compte</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;