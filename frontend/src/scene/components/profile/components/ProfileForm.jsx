import { Button, Form, Input, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { updateProfile } from '../../../../redux/apiCalls/profileApiCalls';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

function ProfileForm({ data  , drawer}) {
    const dispatch = useDispatch()
    const {id} = useParams()
    const [formData, setFormData] = useState({
        nom: data.nom,
        prenom: data.prenom,
        username: data.username,
        ville: data.ville,
        adresse: data.adresse,
        tele: data.tele,
        role : data.role
    });

   

    // Update form data on input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSelectChange = (value) => {
        setFormData((prevData) => ({
            ...prevData,
            role: value,
        }));
    };

    const handleUpdateProfile = async () => {
        try {
            console.log(formData); // You can now send this data to your update profile function
            await dispatch(updateProfile(id , formData.role, formData)); // Example: dispatch your update profile action
            drawer(false)
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    return (
        <Form
            layout="vertical"
            onFinish={handleUpdateProfile}
        >
            <Form.Item
                label="Nom"
                rules={[{ required: true, message: 'Please enter your name' }]}
            >
                <Input
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    placeholder="Nom"
                />
            </Form.Item>

            <Form.Item
                label="Prénom"
                rules={[{ required: true, message: 'Please enter your prénom' }]}
            >
                <Input
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    placeholder="Prénom"
                />
            </Form.Item>

            <Form.Item
                label="Username"
            >
                <Input
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Username"
                />
            </Form.Item>

            <Form.Item
                label="Ville"
                rules={[{ required: true, message: 'Please enter your city' }]}
            >
                <Input
                    name="ville"
                    value={formData.ville}
                    onChange={handleInputChange}
                    placeholder="Ville"
                />
            </Form.Item>

            <Form.Item
                label="Adresse"
                rules={[{ required: true, message: 'Please enter your address' }]}
            >
                <Input
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleInputChange}
                    placeholder="Adresse"
                />
            </Form.Item>

            <Form.Item
                label="Téléphone"
                rules={[{ required: true, message: 'Please enter your telephone' }]}
            >
                <Input
                    name="tele"
                    value={formData.tele}
                    onChange={handleInputChange}
                    placeholder="Téléphone"
                />
            </Form.Item>

            <Form.Item
                label="Rôle"
            >
                <Select value={formData.role} onChange={handleSelectChange} disabled>
                    <Select.Option value="client">Client</Select.Option>
                    <Select.Option value="livreur">Livreur</Select.Option>
                    <Select.Option value="team">Team</Select.Option>
                    <Select.Option value="admin">Admin</Select.Option>
                </Select>
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Enregistrer
                </Button>
            </Form.Item>
        </Form>
    );
}

export default ProfileForm;
