import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useParams , useNavigate , useLocation } from 'react-router-dom';
import { getProfile, updateProfile } from '../../../../redux/apiCalls/profileApiCalls';

function ClientFormUpdate() {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const { id } = useParams(); // Get the userId from the URL parameters
    const { profile, error } = useSelector((state) => state.profile); // Assuming profile is stored in the profile state
    const navigate = useNavigate();
    const location = useLocation();
    const [previousRoute, setPreviousRoute] = useState(null);

    useEffect(() => {
        // Store the previous route
        if (location.state?.from) {
            setPreviousRoute(location.state.from);
        }
    }, [location]);

    // Fetch client data when the component mounts
    useEffect(() => {
        if (id) {
            dispatch(getProfile(id, 'client')); // Fetch profile data based on userId and role 'client'
        }
    }, [dispatch, id]);

    // Update form values when profile data is loaded
    useEffect(() => {
        if (profile) {
            form.setFieldsValue({
                nom: profile.nom,
                prenom: profile.prenom,
                username: profile.username,
                email: profile.email,
                tele: profile.tele,
                ville: profile.ville,
                adresse: profile.adresse,
                cin: profile.cin
            });
        }
    }, [profile, form]);

    // Handle form submission
    const onFinish = (values) => {
        dispatch(updateProfile(id, 'client', values))
        if (previousRoute) {
            navigate(previousRoute);
        } else {
            navigate('/dashboard/home'); // Default fallback
        }
    };

    if (error) {
        return <p>Error loading profile: {error}</p>;
    }

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
        >
            <Form.Item label="Nom" name="nom" rules={[{ required: true, message: 'Please input the name!' }]}>
                <Input />
            </Form.Item>
            <Form.Item label="Prénom" name="prenom" rules={[{ required: true, message: 'Please input the first name!' }]}>
                <Input />
            </Form.Item>
            <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Please input the username!' }]}>
                <Input />
            </Form.Item>
            <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please input the email!' }]}>
                <Input />
            </Form.Item>
            <Form.Item label="Téléphone" name="tele" rules={[{ required: false, message: 'Please input the phone number!' }]}>
                <Input />
            </Form.Item>
            <Form.Item label="Ville" name="ville" rules={[{ required: false, message: 'Please input the city!' }]}>
                <Input />
            </Form.Item>
            <Form.Item label="Adresse" name="adresse" rules={[{ required: false, message: 'Please input the address!' }]}>
                <Input />
            </Form.Item>
            <Form.Item label="CIN" name="cin" rules={[{ required: false, message: 'Please input the CIN!' }]}>
                <Input />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Modifier Client
                </Button>
            </Form.Item>
        </Form>
    );
}

export default ClientFormUpdate;
