import React, { useState } from 'react';
import { EyeInvisibleOutlined, EyeTwoTone, MailFilled } from '@ant-design/icons';
import { Input, Checkbox, Button } from 'antd';
import type { CheckboxProps } from 'antd';
import { Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleCheckboxChange: CheckboxProps['onChange'] = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      email,
      password,
      rememberMe,
    };
    console.log('Form Data:', formData);
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
