import React, { useEffect } from 'react';
import { Form, Input, Button, List, Avatar } from 'antd';

function ClientForm({ initialValues, onSubmit, onClose }) {
    const [form] = Form.useForm();

    useEffect(() => {
        // check id 
        if (initialValues) {
          form.setFieldsValue(initialValues);
        }else{
          form.setFieldsValue('')
        }
      }, []);

    const handleFinish = (values) => {
        onSubmit(values);
        onClose();
    };

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={initialValues}
            onFinish={handleFinish}
        >
            <Form.Item label="Nom" name="nom" rules={[{ required: true, message: 'Please input the name!' }]}>
                <Input />
            </Form.Item>
            <Form.Item label="Prénom" name="prenom" rules={[{ required: true, message: 'Please input the first name!' }]}>
                <Input />
            </Form.Item>
            {
                initialValues ?
                ""
                : 
                <Form.Item label="Nom de Store" name="storeName" rules={[{ required: true, message: 'Please input the first name!' }]}>
                    <Input />
                </Form.Item>
            }
            <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please input the email!' }]}>
                <Input />
            </Form.Item>
            <Form.Item label="Téléphone" name="tele" rules={[{ required:true, message: 'Please input the phone number!' }]}>
                <Input />
            </Form.Item>
            <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please input the password!' }]}>
                <Input />
            </Form.Item>
            <Form.Item label="Username" name="username" rules={[{ required: false, message: 'Please input the username!' }]}>
                <Input />
            </Form.Item>
           
            <Form.Item label="Ville" name="ville" rules={[{ required: false, message: 'Please input the city!' }]}>
                <Input />
            </Form.Item>
            <Form.Item label="Adresse" name="adress" rules={[{ required: false, message: 'Please input the address!' }]}>
                <Input />
            </Form.Item>
            <Form.Item label="Rôle" name="role" rules={[{ required: false, message: 'Please input the role!' }]}>
                <Input />
            </Form.Item>
            {
                initialValues && (
                    <List
                        itemLayout="horizontal"
                        dataSource={initialValues.store}
                        renderItem={(item, index) => (
                        <List.Item>
                            <List.Item.Meta
                            avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`} />}
                            title={item.nom}
                            description= {item.wallet.solde + "MAD"} 
                            />
                        </List.Item>
                        )}
                    />
                )
            }
            <Form.Item>
                <Button type="primary" htmlType="submit">
                    {initialValues ? 'Update Client' : 'Add Client'}
                </Button>
                <Button onClick={onClose} style={{ marginLeft: '10px' }}>
                    Cancel
                </Button>
            </Form.Item>
        </Form>
    );
}

export default ClientForm;
