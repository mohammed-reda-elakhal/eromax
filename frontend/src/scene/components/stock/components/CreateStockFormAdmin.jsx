import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button, Spin, Alert } from 'antd';
import { ShopOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { createStockAdmin } from '../../../../redux/apiCalls/stockApiCalls';
import { getStoreList } from '../../../../redux/apiCalls/storeApiCalls';

const { TextArea } = Input;
const { Option } = Select;

const CreateStockFormAdmin = ({ onSuccess }) => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const { loading } = useSelector(state => state.stock);
    const { stores } = useSelector(state => state.store);
    const [selectedStore, setSelectedStore] = useState(null);

    useEffect(() => {
        dispatch(getStoreList());
    }, [dispatch]);

    const handleSubmit = async (values) => {
        try {
            console.log('[Create Stock Admin] Form values:', values);
            console.log('[Create Stock Admin] Selected store:', selectedStore);
            
            if (!selectedStore) {
                toast.error("Store ID manquant. Veuillez sélectionner un magasin.");
                return;
            }
            
            // Auto-generate SKU from product name
            const generateSKU = (name) => {
                const cleaned = name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10);
                const random = Math.random().toString(36).substring(2, 6).toUpperCase();
                return `${cleaned}-${random}`;
            };
            
            const stockData = {
                clientId: selectedStore.clientId, // Get from selected store
                storeId: selectedStore.storeId,
                productName: values.productName,
                sku: generateSKU(values.productName),
                quantite_initial: values.quantite_initial,
                hasVariants: false,
                variantName: null,
                quantite_minimum: 10,
                unitCost: 0,
                unitPrice: values.unitPrice,
                category: '',
                location: 'siege',
                productDescription: '',
                clientNotes: values.adminNotes || ''
            };

            console.log('[Create Stock Admin] Final stock data:', stockData);

            await dispatch(createStockAdmin(stockData));
            form.resetFields();
            setSelectedStore(null);
            onSuccess && onSuccess();
        } catch (error) {
            console.error('Error creating stock:', error);
            console.error('Error details:', error?.response?.data);
        }
    };

    const handleStoreChange = (storeId) => {
        const store = stores.find(s => s._id === storeId);
        if (store) {
            setSelectedStore({
                storeId: store._id,
                clientId: store.id_client?._id || store.id_client,
                storeName: store.storeName
            });
            console.log('[Create Stock Admin] Store selected:', {
                storeId: store._id,
                clientId: store.id_client?._id || store.id_client,
                storeName: store.storeName
            });
        }
    };

    return (
        <div className="create-stock-form-admin" style={{ maxWidth: 800, margin: '0 auto' }}>
            <Alert
                message="Création de Stock (Admin)"
                description="En tant qu'admin, vous créez le stock directement avec le statut 'pending'. Vous devrez ensuite l'approuver dans l'onglet 'En Attente d'Approbation'."
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
            />

            <Spin spinning={loading}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        quantite_minimum: 10
                    }}
                >
                    {/* Store Selection */}
                    <Form.Item
                        label={
                            <span>
                                <ShopOutlined style={{ marginRight: 8 }} />
                                Sélectionner le Magasin
                            </span>
                        }
                        name="storeId"
                        rules={[{ required: true, message: 'Magasin requis' }]}
                    >
                        <Select
                            placeholder="Choisir un magasin"
                            size="large"
                            showSearch
                            optionFilterProp="children"
                            onChange={handleStoreChange}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {stores?.map(store => (
                                <Option key={store._id} value={store._id}>
                                    {store.storeName} 
                                    {store.id_client?.nom && ` - ${store.id_client.nom}`}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* Selected Store Info */}
                    {selectedStore && (
                        <div style={{
                            padding: '12px',
                            background: '#e6f7ff',
                            borderRadius: '8px',
                            border: '1px solid #91d5ff',
                            marginBottom: '16px'
                        }}>
                            <div style={{ fontSize: '13px', color: '#096dd9' }}>
                                ✓ Magasin sélectionné: <strong>{selectedStore.storeName}</strong>
                            </div>
                        </div>
                    )}

                    {/* Product Name */}
                    <Form.Item
                        label="Nom du Produit"
                        name="productName"
                        rules={[{ required: true, message: 'Nom du produit requis' }]}
                    >
                        <Input placeholder="Ex: iPhone 13 Pro" size="large" />
                    </Form.Item>

                    {/* Quantity */}
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

                    {/* Price */}
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

                    {/* Admin Notes */}
                    <Form.Item label="Notes Admin" name="adminNotes">
                        <TextArea 
                            rows={3} 
                            placeholder="Notes ou instructions (optionnel)..." 
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
                            disabled={!selectedStore}
                        >
                            Créer le Stock
                        </Button>
                    </div>

                    <div style={{ marginTop: '16px', padding: '12px', background: '#fff7e6', borderRadius: '8px', border: '1px solid #ffd591' }}>
                        <small style={{ fontSize: 13, color: '#d46b08' }}>
                            ⚠️ <strong>Note Admin:</strong> Le stock sera créé avec le statut "pending". 
                            Vous devrez l'approuver dans l'onglet "En Attente d'Approbation" pour le rendre actif.
                        </small>
                    </div>
                </Form>
            </Spin>
        </div>
    );
};

export default CreateStockFormAdmin;

