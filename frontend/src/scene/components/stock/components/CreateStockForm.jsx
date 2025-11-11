import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Upload, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { createStock } from '../../../../redux/apiCalls/stockApiCalls';

const { TextArea } = Input;
const { Option } = Select;

const CreateStockForm = ({ storeId, onSuccess }) => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const { loading } = useSelector(state => state.stock);
    const { user } = useSelector(state => state.auth);
    const [hasVariants, setHasVariants] = useState(false);

    const handleSubmit = async (values) => {
        try {
            console.log('[Create Stock] User:', user);
            console.log('[Create Stock] StoreId prop:', storeId);
            console.log('[Create Stock] Form values:', values);
            
            if (!storeId) {
                toast.error("Store ID manquant. Veuillez vous reconnecter.");
                return;
            }
            
            // Auto-generate SKU from product name
            const generateSKU = (name) => {
                const cleaned = name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10);
                const random = Math.random().toString(36).substring(2, 6).toUpperCase();
                return `${cleaned}-${random}`;
            };
            
            const stockData = {
                clientId: user._id,
                storeId: storeId,
                productName: values.productName,
                sku: generateSKU(values.productName), // Auto-generate SKU
                quantite_initial: values.quantite_initial,
                hasVariants: false,
                variantName: null,
                quantite_minimum: 10,
                unitCost: 0,
                unitPrice: values.unitPrice,
                category: '',
                location: 'siege',
                productDescription: '',
                clientNotes: values.clientNotes || ''
            };

            console.log('[Create Stock] Final stock data:', stockData);

            await dispatch(createStock(stockData));
            form.resetFields();
            setHasVariants(false);
            onSuccess && onSuccess();
        } catch (error) {
            console.error('Error creating stock:', error);
            console.error('Error details:', error?.response?.data);
        }
    };

    return (
        <div className="create-stock-form">
            <Spin spinning={loading}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        quantite_minimum: 10,
                        location: 'siege'
                    }}
                >
                    <Form.Item
                        label="Nom du Produit"
                        name="productName"
                        rules={[{ required: true, message: 'Nom du produit requis' }]}
                    >
                        <Input placeholder="Ex: iPhone 13 Pro" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Quantité"
                        name="quantite_initial"
                        rules={[{ required: true, message: 'Quantité requise' }]}
                    >
                        <InputNumber
                            min={1}
                            style={{ width: '100%' }}
                            size="large"
                            placeholder="100"
                            addonAfter="unités"
                        />
                    </Form.Item>

                    <Form.Item 
                        label="Prix (MAD)" 
                        name="unitPrice"
                        rules={[{ required: true, message: 'Prix requis' }]}
                    >
                        <InputNumber
                            min={0}
                            style={{ width: '100%' }}
                            size="large"
                            placeholder="500"
                            addonAfter="MAD"
                        />
                    </Form.Item>

                    <Form.Item label="Notes" name="clientNotes">
                        <TextArea 
                            rows={3} 
                            placeholder="Notes pour l'administrateur (optionnel)..." 
                            size="large"
                        />
                    </Form.Item>

                    <div className="form-actions" style={{ marginTop: '24px' }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={loading}
                            block
                        >
                            Créer le Stock
                        </Button>
                    </div>

                    <div style={{ marginTop: '16px', padding: '12px', background: '#e6f7ff', borderRadius: '8px', border: '1px solid #91d5ff' }}>
                        <small style={{ fontSize: 13, color: '#096dd9' }}>
                            💡 <strong>Info:</strong> Le stock sera créé avec le statut "En attente". 
                            L'administrateur doit l'approuver avant utilisation dans les colis.
                        </small>
                    </div>
                </Form>
            </Spin>
        </div>
    );
};

export default CreateStockForm;

