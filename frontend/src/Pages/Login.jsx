import React, { useState } from 'react'
import {  EyeInvisibleOutlined, EyeTwoTone , MailFilled  } from '@ant-design/icons';
import { Input , Checkbox , Button  } from 'antd';
import type { CheckboxProps } from 'antd';
import { Link } from 'react-router-dom';

function Login() {

    const [passwordVisible, setPasswordVisible] = useState(false);

    const onChange: CheckboxProps['onChange'] = (e) => {
        console.log(`checked = ${e.target.checked}`);
      };

  return (
    <div className='login-section'>
        <div className="login-section-cover">
            <img src="/image/auth-login-illustration-light.png" alt="" />
        </div>
        <div className="login-section-main">
            <div className="login-section-main-header">
                <img src="/image/logo.png" alt="" style={{width:"80px"}} />
                <h3>Bienvenue sur EROMAX</h3>
                <p>Ne partage pas votre données de connexion pour votre sécuréter</p>
            </div>
            <form action="">
                <Input 
                    size="large" 
                    placeholder="Email" 
                    className='login-input' 
                />
                <Input.Password
                    size="large" 
                    className='login-input' 
                    placeholder="mots de passe"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
                <div className="remember-me">
                    <Checkbox onChange={onChange}>Remember me</Checkbox>
                    <Link style={{textDecoration:"none"}}>
                        Oublié mots de passe
                    </Link>
                </div>
                <Button type="primary" block>
                    Log in
                </Button>
                <p className='footer-link-form'>
                    <span>Nouveau sur EROMAX ?</span>
                    <Link className='footer-link-form-link'>Créer votre compte</Link>
                </p>
            </form>
        </div>
    </div>
  )
}

export default Login