import React, { useEffect } from 'react';
import { UserOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Input, Tooltip, Button, Form, Select, Typography, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../redux/apiCalls/authApiCalls';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { MdOutlineDeliveryDining } from "react-icons/md";
import { getAllVilles } from '../redux/apiCalls/villeApiCalls';

const { Option } = Select;
const { Title } = Typography;

const NumericInput = (props) => {
    const { value, onChange } = props;
    const handleChange = (e) => {
        const { value: inputValue } = e.target;
        const reg = /^-?\d*(\.\d*)?$/;
        if (reg.test(inputValue) || inputValue === '' || inputValue === '-') {
            onChange(inputValue);
        }
    };
    const title = value ? (
        <span className="numeric-input-title">{value !== '-' ? value : '-'}</span>
    ) : (
        'Tél Exemple : 0655124822'
    );
    return (
        <Tooltip trigger={['focus']} title={title} placement="topLeft" overlayClassName="numeric-input">
            <Input
                {...props}
                size="large"
                onChange={handleChange}
                placeholder="Numéro"
                maxLength={10}
                suffix={<InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
            />
        </Tooltip>
    );
};

function RegisterLivreur() {
    const [form] = Form.useForm(); // Create a Form instance
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { villes } = useSelector((state) => state.ville);

    // Fetch villes data
    useEffect(() => {
        if (villes.length === 0) {
            dispatch(getAllVilles());
        }
    }, [dispatch, villes.length]);

    const onFinish = (values) => {
        const livreurData = {
            ...values,
            tele: values.telephone,
            villes: values.villes, // Multi-selected villes for delivery
        };

        dispatch(registerUser("livreur", livreurData))
            .then((response) => {
                if (response && response.success) {
                    toast.success(response.message);
                    form.resetFields(); // Reset form fields after successful submission
                    navigate('/login');
                }
            })
            .catch((error) => {
                toast.error(error.message || "Erreur lors de l'inscription");
            });
    };

    return (
        <div className="register-section">
            <Link to="/" className="register-section-logo">
                <img src="/image/logo-light.png" alt="Logo" />
            </Link>
            <div className="register-section-main">
                <div className="register-main-title">
                  <div className="register-main-title-icon">
                    <MdOutlineDeliveryDining />
                  </div>
                  <p>Devenir Livreur avec EROMAX</p>
                </div>
                <Form
                    form={form} // Attach the form instance
                    name="register-livreur"
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        name="nom"
                        label="Nom"
                        rules={[{ required: true, message: 'Veuillez entrer votre nom!' }]}
                    >
                        <Input placeholder="Nom" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="prenom"
                        label="Prénom"
                        rules={[{ required: true, message: 'Veuillez entrer votre prénom!' }]}
                    >
                        <Input placeholder="Prénom" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Veuillez entrer votre email!' },
                            { type: 'email', message: "L'email n'est pas valide!" }
                        ]}
                    >
                        <Input placeholder="Email" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="telephone"
                        label="Téléphone"
                        rules={[{ required: true, message: 'Veuillez entrer votre numéro de téléphone!' }]}
                    >
                        <NumericInput />
                    </Form.Item>

                    <Form.Item
                        name="ville"
                        label="Ville"
                        rules={[{ required: true, message: 'Veuillez choisir votre ville!' }]}
                    >
                        <Select
                            placeholder="Choisir une ville"
                            size="large"
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {villes.map((ville) => (
                                <Option key={ville._id} value={ville.nom}>
                                    {ville.nom}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="villes"
                        label="Régions desservies"
                        rules={[{ required: true, message: 'Veuillez sélectionner au moins une région!' }]}
                    >
                        <Select mode="multiple" placeholder="Choisir des régions" size="large">
                            {villes.map((ville) => (
                                <Option key={ville._id} value={ville.nom}>
                                    {ville.nom}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="adresse"
                        label="Adresse"
                        rules={[{ required: true, message: 'Veuillez entrer votre adresse!' }]}
                    >
                        <Input placeholder="Adresse" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Mot de passe"
                        rules={[
                            { required: true, message: 'Veuillez entrer votre mot de passe!' },
                            { min: 5, message: 'Mot de passe doit être au moins 5 caractères' }
                        ]}
                        hasFeedback
                    >
                        <Input.Password placeholder="Mot de passe" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Confirmer le mot de passe"
                        dependencies={['password']}
                        hasFeedback
                        rules={[
                            { required: true, message: 'Veuillez confirmer votre mot de passe!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Les mots de passe ne correspondent pas!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Confirmer le mot de passe" size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large">
                            S'inscrire
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
}

export default RegisterLivreur;
