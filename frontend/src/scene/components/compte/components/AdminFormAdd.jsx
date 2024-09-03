import React from 'react';
import { Form, Input, Button, Switch, Select, Space } from 'antd';
import tarifData from '../../../../data/tarif.json';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { registerUser } from '../../../../redux/apiCalls/authApiCalls';

const { Option } = Select;

function AdminFormAdd({ close }) {
    const [form] = Form.useForm();
    const dispatch = useDispatch();

    // Function to handle form submission
    const handleFormSubmit = (values) => {
        dispatch(registerUser('admin', values))
        .then(() => {
            form.resetFields();
            close();
        })
        .catch((error) => {
            console.error('Error details:', error.response.data); // Logs the error response from the server
        });
    
    };

    // Function to clear form manually
    const handleClearForm = () => {
        form.resetFields(); // Reset all form fields
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleFormSubmit} // Handle form submission
        >
            <Form.Item
                label="Nom"
                name="nom"
                rules={[{ required: true, message: "S'il vous plaît entrez le nom du livreur!", min: 2 }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Prénom"
                name="prenom"
                rules={[{ required: true, message: "S'il vous plaît entrez le prénom du livreur!", min: 2 }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: "S'il vous plaît entrez le userName du Team!", min: 2 }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Email"
                name="email"
                rules={[
                    { required: true, message: "S'il vous plaît entrez l'email du livreur!" },
                    { type: 'email', message: "S'il vous plaît entrez un email valide!" },
                ]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: "S'il vous plaît entrez le mot de passe du livreur!", min: 5 }]}
            >
                <Input.Password
                    placeholder="input password"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
            </Form.Item>
            <Form.Item
                label="Téléphone"
                name="tele"
                rules={[{ required: true, message: 'Veuillez entrer le numéro de téléphone!' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item>
                <Space>
                    <Button type="primary" htmlType="submit">
                        Nouveau Admin
                    </Button>
                    <Button type="default" onClick={handleClearForm}>
                        Effacer
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
}

export default AdminFormAdd;
