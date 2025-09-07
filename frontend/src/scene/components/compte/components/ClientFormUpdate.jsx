import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useDispatch } from 'react-redux';
import { updateProfile } from '../../../../redux/apiCalls/profileApiCalls';

function ClientFormUpdate({ client, onSuccess, onCancel }) {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    // Set form initial values when client prop changes
    useEffect(() => {
        if (client) {
            form.setFieldsValue({
                nom: client.nom || '',
                prenom: client.prenom || '',
                email: client.email || '',
                tele: client.tele || '',
                ville: client.ville || '',
                adresse: client.adresse || '',
                cin: client.cin || '',
                storeName: client.stores?.[0]?.storeName || ''
            });
        }
    }, [client, form]);

    // Handle form submission
    const onFinish = async (values) => {
        try {
            setLoading(true);
            await dispatch(updateProfile(client._id, 'client', values));
            message.success('Client mis à jour avec succès');
            onSuccess?.();
        } catch (error) {
            message.error("Erreur lors de la mise à jour du client");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
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
                label="Nom du magasin" 
                name="storeName" 
                rules={[{ required: true, message: "S'il vous plaît entrez le nom du magasin!" }]}
            >
                <Input />
            </Form.Item>
            <Form.Item 
                label="Email" 
                name="email" 
                rules={[
                    { required: true, message: "S'il vous plaît entrez l'email du client!" },
                    { type: 'email', message: 'Veuillez entrer un email valide!' }
                ]}
            >
                <Input type="email" />
            </Form.Item>
            <Form.Item 
                label="Téléphone" 
                name="tele" 
                rules={[{ 
                    required: false, 
                    pattern: new RegExp(/^[0-9+\s-]*$/),
                    message: 'Veuillez entrer un numéro de téléphone valide!' 
                }]}
            >
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
            <Form.Item style={{ marginTop: '24px' }}>
                <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: '8px' }}>
                    Enregistrer
                </Button>
                <Button onClick={onCancel}>
                    Annuler
                </Button>
            </Form.Item>
        </Form>
    );
}

export default ClientFormUpdate;
