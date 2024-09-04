import React from 'react';
import { Form, Input, Button } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { createProfile } from '../../../../redux/apiCalls/profileApiCalls';
import { registerUser } from '../../../../redux/apiCalls/authApiCalls';

function ClientFormAdd({close}) {
    const [form] = Form.useForm();
    const dispatch = useDispatch();

    // Function to handle form submission
    const handleFormSubmit = (values) => {
        // Ensure 'role' is set to 'livreur' before submitting
        dispatch(registerUser('client', values))
            .then(() => {
                form.resetFields()
                close()
            }) // Clear the form after successful submission
            .catch(err => console.error(err)); // Log error if submission fails
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
                rules={[{ required: true, message: "S'il vous plaît entrez le nom du client!" }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Prénom"
                name="prenom"
                rules={[{ required: true, message: "S'il vous plaît entrez le prénom du client!" }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Nom de Store"
                name="storeName"
                rules={[{ required: true, message: "S'il vous plaît entrez le nom du Store!" }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, message: "S'il vous plaît entrez l'email du client!" }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: "S'il vous plaît entrez le mot de passe du client!" }]}
            >
                <Input.Password
                    placeholder="input password"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
            </Form.Item>
            <Form.Item
                label="Téléphone"
                name="tele"
                rules={[{ required: false, message: 'Veuillez entrer le numéro de téléphone!' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Ville"
                name="ville"
                rules={[{ required: false, message: 'Veuillez entrer la ville!' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Adresse"
                name="adresse"
                rules={[{ required: false, message: 'Veuillez entrer l’adresse!' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="CIN"
                name="cin"
                rules={[{ required: false, message: 'Veuillez entrer la CIN!' }]}
            >
                <Input />
            </Form.Item>

            {/* Hidden form item for role */}
            <Form.Item name="role" initialValue="client" style={{ display: 'none' }}>
                <Input type="hidden" />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Nouveau Client
                </Button>
                <Button type="default" onClick={handleClearForm} style={{ marginLeft: '10px' }}>
                    Effacer
                </Button>
            </Form.Item>
        </Form>
    );
}

export default ClientFormAdd;
