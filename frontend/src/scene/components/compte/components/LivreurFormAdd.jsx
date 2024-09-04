import React from 'react';
import { Form, Input, Button, Switch, Select, Space } from 'antd';
import tarifData from '../../../../data/tarif.json';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { createProfile } from '../../../../redux/apiCalls/profileApiCalls';
import { registerUser } from '../../../../redux/apiCalls/authApiCalls';

const { Option } = Select;

function LivreurFormAdd({ close }) {
    const [form] = Form.useForm();
    const dispatch = useDispatch();

    // Function to handle form submission
    const handleFormSubmit = (values) => {
        // Modify values to match the desired structure
        const formattedValues = {
            ...values,
            role: 'livreur', // Ensure the role is always 'livreur'
            active: values.active || false, // Handle 'active' status (default false if undefined)
        };

        // Dispatch the createProfile action with the formatted values
        console.log(formattedValues);
        
        dispatch(registerUser('livreur', formattedValues))
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

    // Map tarifData to the format expected by Select component
    const options = tarifData.map((city) => ({
        value: city.nom, // Use city name as value for multiple selection
        label: city.nom, // Use city name as label for display
    }));

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
                rules={[{ required: true, message: "S'il vous plaît entrez le userName du livreur!", min: 2 }]}
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
            <Form.Item
                label="Ville"
                name="ville"
                rules={[{ required: true, message: 'Veuillez entrer la ville!' }]}
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

            {/* Multiple cities (villes) selection */}
            <Form.Item
                label="Villes"
                name="villes"
                rules={[{ required: true, message: 'Veuillez sélectionner les villes!' }]}
            >
                <Select
                    mode="multiple" // Enable multiple selection
                    style={{ width: '100%' }}
                    placeholder="Sélectionnez les villes"
                    options={options} // Use mapped options for cities
                />
            </Form.Item>

            {/* Type selection */}
            <Form.Item
                label="Type de livreur"
                name="type"
                rules={[{ required: true, message: "S'il vous plaît sélectionnez le type de livreur!" }]}
            >
                <Select placeholder="Sélectionnez un type">
                    <Option value="simple">Simple</Option>
                    <Option value="company">Company</Option>
                </Select>
            </Form.Item>

            {/* Profile URL input */}
            <Form.Item
                label="Domaine Name"
                name={'domaine'}
                rules={[{ required: false, message: "S'il vous plaît entrez l'URL de site web " }]}
            >
                <Input />
            </Form.Item>

            {/* Active status (Switch) */}
            <Form.Item
                label="Actif"
                name="active"
                valuePropName="checked"
            >
                <Switch defaultChecked />
            </Form.Item>

            <Form.Item>
                <Space>
                    <Button type="primary" htmlType="submit">
                        Nouveau Livreur
                    </Button>
                    <Button type="default" onClick={handleClearForm}>
                        Effacer
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
}

export default LivreurFormAdd;
