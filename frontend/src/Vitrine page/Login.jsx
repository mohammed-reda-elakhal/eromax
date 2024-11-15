import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button, Radio } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';

import './login.css';
import { loginUser } from '../redux/apiCalls/authApiCalls';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = { email, password };
    dispatch(loginUser(formData, role, navigate));
    clearData();
  };

  const clearData = () => {
    setEmail('');
    setPassword('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img 
            src="/image/logo-light.png" 
            onClick={()=>navigate('/')} 
            style={{cursor:"pointer"}} 
            alt="Landino" 
            className="login-logo" 
          />
          <h2>Login</h2>
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
                Staf
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
          />
          <Input.Password
            size="large"
            placeholder="Password"
            prefix={<LockOutlined className="login-input-icon" />}
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="primary" htmlType="submit" className="login-button">
            Log in
          </Button>
        </form>
        <div className="login-footer">
          <span>No account yet?</span>
          <Link to="/register" className="login-footer-link">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;