import React , { useState } from 'react'
import {UserOutlined , InfoCircleOutlined , PhoneOutlined , MailOutlined} from '@ant-design/icons';
import { Flex, Input , Tooltip , Button , Radio, Space  } from 'antd';
import type { RadioChangeEvent } from 'antd';



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

  // '.' at the end or only '-' in the input box.
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
        size='large'
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
    const [number, setNumber] = useState('');
    const [value, setValue] = useState(1);

    const onChange = (e: RadioChangeEvent) => {
      console.log('radio checked', e.target.value);
      setValue(e.target.value);
    };
  return (
    <div className='register-section'>
        <div className="register-section-logo">
            <img src="/image/logo.png" alt="" />
        </div>
        <div className="register-section-main">
            <div className="register-main-title">
                <div className="register-main-title-icon">
                    <UserOutlined/>
                </div>
                <p>
                    Creér votre compte sur EROMAX
                </p>
            </div>
            <form action="">
                <Flex vertical gap={12}>
                    <Input 
                        size='large'
                        placeholder="Nom et Prénom" 
                        suffix={
                            <Tooltip title="Entrer votre nom complete">
                            <InfoCircleOutlined
                                style={{
                                color: 'rgba(0,0,0,.45)',
                                }}
                            />
                            </Tooltip>
                        }
                    />
                    <NumericInput
                        size='large'
                        value={number}
                        onChange={setNumber}
                    />
                    <Input 
                        size='large'
                        placeholder="email" 
                        suffix={
                            <Tooltip title="Entrer votre adress Email">
                            <InfoCircleOutlined
                                style={{
                                color: 'rgba(0,0,0,.45)',
                                }}
                            />
                            </Tooltip>
                        }
                    />
                    <Input 
                        size='large'
                        placeholder="CIN" 
                        suffix={
                            <Tooltip title="Entrer votre CIN">
                            <InfoCircleOutlined
                                style={{
                                color: 'rgba(0,0,0,.45)',
                                }}
                            />
                            </Tooltip>
                        }
                    />
                    <Input 
                        size='large'
                        placeholder="Ville" 
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
                        size='large'
                        placeholder="Nom de Store" 
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
                    <div className="">
                        <p> Date de Debut :</p>
                        <Radio.Group onChange={onChange} value={value}>
                            
                            <Space direction="vertical">
                                <Radio value={1}>Maintenant</Radio>
                                <Radio value={2}>Aprés Semaine</Radio>
                                <Radio value={3}>Aprés Mois</Radio>
                                <Radio value={4}>
                                    More...
                                    {value === 4 ? <Input style={{ width: 100, marginLeft: 10 }} /> : null}
                                </Radio>
                            </Space>
                        </Radio.Group>
                    </div>
                    <div className="">
                        <p>Nombre de colis par jours :</p>
                        <Radio.Group onChange={onChange} value={value}>
                            <Space direction="vertical">
                                <Radio value={1}>1 - 5</Radio>
                                <Radio value={2}>5 - 10</Radio>
                                <Radio value={3}>10 - 50</Radio>
                                <Radio value={4}>
                                    More...
                                    {value === 4 ? <Input style={{ width: 100, marginLeft: 10 }} /> : null}
                                </Radio>
                            </Space>
                        </Radio.Group>
                    </div>
                    <Button type='primary'>
                        Créer compte
                    </Button>
                </Flex>
            </form>
        </div>
    </div>
  )
}

export default Register