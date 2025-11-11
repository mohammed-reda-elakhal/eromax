import React, { useState } from 'react';
import { Modal, Switch, Form, InputNumber, Button, Space, Divider, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { updateClientStockAccess } from '../../../../redux/apiCalls/stockApiCalls';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import StockAccessEnabledNotice from './StockAccessEnabledNotice';

const ClientStockAccessModal = ({ visible, client, onClose, onSuccess }) => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [showNotice, setShowNotice] = useState(false);
    const [wasStockEnabled, setWasStockEnabled] = useState(false);

    // Initialize form with client's current settings
    React.useEffect(() => {
        if (client && visible) {
            form.setFieldsValue({
                stock_management: client.features_access?.stock_management || false
            });
        }
    }, [client, visible]);

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            
            console.log('[Stock Access Update] Starting update for client:', client._id);
            console.log('[Stock Access Update] Stock management value:', values.stock_management);
            
            // SIMPLIFIED - Just send stock_management boolean
            const accessData = {
                stock_management: values.stock_management
            };

            console.log('[Stock Access Update] Sending data:', accessData);

            // Check if stock was just enabled
            const stockJustEnabled = values.stock_management && !client?.features_access?.stock_management;

            const result = await dispatch(updateClientStockAccess(client._id, accessData));
            console.log('[Stock Access Update] API Response:', result);
            
            setLoading(false);
            onSuccess && onSuccess();
            onClose();
            
            // Show notice if stock was just enabled
            if (stockJustEnabled) {
                setShowNotice(true);
                setWasStockEnabled(true);
            }
        } catch (error) {
            setLoading(false);
            console.error('[Stock Access Update] Error:', error);
            console.error('[Stock Access Update] Error response:', error?.response?.data);
        }
    };

    return (
        <>
            <Modal
                title={`Gestion des Accès Stock - ${client?.nom} ${client?.prenom}`}
                open={visible}
                onCancel={onClose}
                footer={null}
                width={600}
                centered
            >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Alert
                    message="Accès à la Gestion de Stock"
                    description="Activer ou désactiver la gestion de stock pour ce client"
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                />

                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 16,
                    padding: '16px',
                    background: '#f5f5f5',
                    borderRadius: '8px',
                    marginBottom: 16
                }}>
                    <Form.Item 
                        name="stock_management" 
                        valuePropName="checked"
                        style={{ marginBottom: 0 }}
                    >
                        <Switch
                            checkedChildren="Activé"
                            unCheckedChildren="Désactivé"
                            size="large"
                        />
                    </Form.Item>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                            Gestion de Stock
                        </div>
                        <div style={{ fontSize: 13, color: '#666' }}>
                            Permet au client de gérer son stock au siège avec approbation admin
                        </div>
                    </div>
                </div>

                <Alert
                    message="Note"
                    description="Le client devra rafraîchir sa page (F5) ou se reconnecter pour voir le menu 'Mon Stock' apparaître."
                    type="warning"
                    showIcon
                    style={{ marginTop: 16 }}
                />

                <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button onClick={onClose} size="large">
                            Annuler
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading} size="large">
                            Enregistrer
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>

            <StockAccessEnabledNotice
                visible={showNotice}
                clientEmail={client?.email}
                onClose={() => setShowNotice(false)}
            />
        </>
    );
};

export default ClientStockAccessModal;

