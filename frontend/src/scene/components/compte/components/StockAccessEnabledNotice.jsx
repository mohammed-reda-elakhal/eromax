import React from 'react';
import { Modal } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

/**
 * Show this modal after enabling stock access for a client
 * Instructs them to logout/login to see the feature
 */
const StockAccessEnabledNotice = ({ visible, clientEmail, onClose }) => {
    return (
        <Modal
            title={<span><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />Accès Stock Activé</span>}
            open={visible}
            onOk={onClose}
            onCancel={onClose}
            okText="Compris"
            cancelButtonProps={{ style: { display: 'none' } }}
        >
            <div style={{ padding: '16px 0' }}>
                <p style={{ fontSize: 15, marginBottom: 16 }}>
                    <strong>La gestion de stock a été activée avec succès!</strong>
                </p>
                
                <div style={{ 
                    background: '#e6f7ff', 
                    padding: 16, 
                    borderRadius: 8,
                    border: '1px solid #91d5ff',
                    marginBottom: 16
                }}>
                    <p style={{ margin: 0, fontSize: 14 }}>
                        📧 <strong>Client:</strong> {clientEmail}
                    </p>
                </div>

                <div style={{ 
                    background: '#f6ffed', 
                    padding: 16, 
                    borderRadius: 8,
                    border: '1px solid #b7eb8f'
                }}>
                    <p style={{ margin: 0, marginBottom: 8, fontWeight: 600, color: '#52c41a' }}>
                        ✅ Mise à Jour Automatique Activée
                    </p>
                    <p style={{ margin: 0, fontSize: 14 }}>
                        Le client verra le menu "Mon Stock" apparaître automatiquement dans <strong>30 secondes maximum</strong> 
                        sans avoir besoin de se déconnecter!
                    </p>
                </div>

                <div style={{ 
                    background: '#e6f7ff', 
                    padding: 16, 
                    borderRadius: 8,
                    border: '1px solid #91d5ff',
                    marginTop: 12
                }}>
                    <p style={{ margin: 0, fontSize: 13, color: '#096dd9' }}>
                        💡 <strong>Si le client est connecté:</strong> L'accès sera actualisé automatiquement. 
                        Si besoin immédiat, il peut rafraîchir la page (F5).
                    </p>
                </div>
            </div>
        </Modal>
    );
};

export default StockAccessEnabledNotice;

