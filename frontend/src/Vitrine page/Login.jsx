import React, { useState } from 'react';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Input, Button } from 'antd';
import { Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('client');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prepare form data
    const formData = {
      email,
      password,
      rememberMe
    };

    // Include username if role is 'staf' and username is not empty
    if (role === 'staf' && username.trim() !== '') {
      formData.username = username;
    }

    // Dispatch login action
    // dispatch(loginUser(formData, role, navigate)); // Uncomment this when ready to use
    console.log('Form Data:', formData);
    clearData();
  };

  const clearData = () => {
    setEmail('');
    setPassword('');
    setUsername('');
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
            style={role === 'staf' ? {color:"var(--limon)"} : {color:"black"}}
            onClick={() => setRole('staf')}
          >
            Staf
          </p>
        </div>
        <div className="login-section-main-header">
          <h3>Bienvenue sur EROMAX</h3>
          <p>Ne partagez pas vos données de connexion pour votre sécurité</p>
        </div>
        <form onSubmit={handleSubmit}>
          {role === "staf" && (
            <Input
              size="large"
              placeholder="Username"
              className='login-input'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}
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
