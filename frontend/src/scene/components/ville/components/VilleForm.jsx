import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Button, Select } from 'antd';

const { Option } = Select;

function VilleForm({ theme, onSubmit, initialValues, regions }) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({
                ...initialValues,
                region: initialValues.region?._id || initialValues.region || undefined
            });
        } else {
            form.resetFields();
        }
    }, [initialValues, form]);

    const handleSubmit = (values) => {
        onSubmit(values);
        form.resetFields();
    };

    return (
        <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item
                name="ref"
                label="Ref"
                rules={[{ required: true, message: "Ref is required" }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="nom"
                label="Nom"
                rules={[{ required: true, message: "Nom is required" }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="tarif"
                label="Tarif"
                rules={[{ required: true, message: "Tarif is required" }]}
            >
                <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
                name="tarif_refus"
                label="Tarif Refus"
                initialValue={15}
            >
                <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
                name="disponibility"
                label="Disponibility"
                rules={[{ required: true, message: "Please select at least one day" }]}
            >
                <Select
                    mode="multiple"
                    placeholder="Choisir disponibility de la ville"
                    allowClear
                    style={{ width: '100%' }}
                >
                    <Option value="Lundi">Lundi</Option>
                    <Option value="Mardi">Mardi</Option>
                    <Option value="Mercredi">Mercredi</Option>
                    <Option value="Jeudi">Jeudi</Option>
                    <Option value="Vendredi">Vendredi</Option>
                    <Option value="Samedi">Samedi</Option>
                    <Option value="Dimanche">Dimanche</Option>
                </Select>
            </Form.Item>
            <Form.Item
                name="region"
                label="Région"
            >
                <Select
                    placeholder="Choisir une région"
                    allowClear
                    style={{ width: '100%' }}
                >
                    {regions && regions.map(region => (
                        <Option key={region._id} value={region._id}>{region.nom}</Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Submit
                </Button>
            </Form.Item>
        </Form>
    );
}

export default VilleForm;
