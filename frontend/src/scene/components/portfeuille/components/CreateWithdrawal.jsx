import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { Form, InputNumber, Select, Button, Card, Typography, message, Space, Avatar, Alert } from 'antd';
import { getPaymentsByClientId } from '../../../../redux/apiCalls/payementApiCalls';
import { getWalletByStore } from '../../../../redux/apiCalls/walletApiCalls';
import { createWithdrawal } from '../../../../redux/apiCalls/withdrawalApiCalls';
import { toast } from 'react-hot-toast';
import { InfoCircleOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

const { Title } = Typography;

const formStyle = (theme) => ({
  '.ant-card': {
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  '.form-content': {
    maxWidth: '600px',
    margin: '0 auto'
  },
  '.balance-info': {
    textAlign: 'center',
    marginBottom: '24px',
    padding: '16px',
    borderRadius: '12px',
    background: theme === 'dark' ? '#001529' : '#f0f7ff'
  }
});

function CreateWithdrawal({ visible, onSuccess, theme }) {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    
    // Get user and store info from auth state
    const { user, store } = useSelector((state) => state.auth);
    const isAdmin = user?.role === 'admin';
    const storeId = store?._id;

    // Get wallet from Redux state
    const { selectedWallet: wallet, loading: walletLoading } = useSelector((state) => state.wallet);

    // Get payments from Redux state
    const { payements: payments, isFetching: paymentsLoading } = useSelector((state) => state.payement);
    const [loading, setLoading] = useState(false);

    // Fetch payments for the user
    useEffect(() => {
        if (user?._id) {
            dispatch(getPaymentsByClientId(user._id))
                .catch((error) => {
                    toast.error('Failed to fetch payment methods');
                });
        }
    }, [dispatch, user?._id]);

    // Fetch wallet for the store
    useEffect(() => {
        if (storeId) {
            dispatch(getWalletByStore(storeId))
                .catch((error) => {
                    toast.error('Failed to fetch wallet information');
                });
        }
    }, [dispatch, storeId]);

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            await dispatch(createWithdrawal({
                wallet: wallet._id,
                payment: values.payment,
                montant: values.montant
            }));
            
            // Refresh wallet data
            await dispatch(getWalletByStore(storeId));
            
            form.resetFields();
            toast.success('Withdrawal request created successfully');
            
            // Call the onSuccess callback to hide the form
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            toast.error(error.message || 'Failed to create withdrawal request');
        } finally {
            setLoading(false);
        }
    };

    if (walletLoading || !wallet || paymentsLoading) {
        return (
            <Card>
                <Title level={4}>Loading information...</Title>
            </Card>
        );
    }

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    style={formStyle(theme)}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                >
                    <div style={{ padding: '20px 0' }}>
                        <Alert
                            message="معلومات السحب"
                            description={
                                <ul style={{ margin: 0, paddingLeft: '20px', textAlign: 'right' }}>
                                    <li>الحد الأدنى للسحب: 100 درهم</li>
                                    <li>رسوم السحب: 5 دراهم</li>
                                    <li>مدة المعالجة: 24-48 ساعة</li>
                                    <li>يمكنك تتبع حالة السحب في قسم السحوبات</li>
                                </ul>
                            }
                            type="info"
                            showIcon
                            icon={<InfoCircleOutlined />}
                            style={{ 
                                marginBottom: '24px',
                                direction: 'rtl'  // Add RTL direction for Arabic text
                            }}
                        />

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            initialValues={{
                                payment: undefined,
                                montant: undefined
                            }}
                        >
                            <Form.Item
                                label="Available Balance"
                                required
                            >
                                <Typography.Text strong style={{ fontSize: '18px' }}>
                                    {wallet.solde.toLocaleString()} DH
                                </Typography.Text>
                            </Form.Item>

                            <Form.Item
                                label="Payment Method"
                                name="payment"
                                rules={[{ required: true, message: 'Please select a payment method' }]}
                            >
                                <Select
                                    placeholder="Select payment method"
                                    style={{ width: '100%' }}
                                >
                                    {payments.map((payment) => (
                                        <Select.Option 
                                            key={payment._id} 
                                            value={payment._id}
                                        >   
                                            <Space>
                                                <Avatar src={payment?.idBank?.image?.url} />
                                                <div>
                                                    <div>{payment.nom}</div>
                                                    <div style={{ fontSize: '12px', color: '#999' }}>{payment.rib}</div>
                                                </div>
                                            </Space>
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label="Amount (DH)"
                                name="montant"
                                rules={[
                                    { required: true, message: 'Please enter the amount' },
                                    { type: 'number', min: 100, message: 'Minimum withdrawal amount is 100 DH' },
                                    {
                                        validator: (_, value) => {
                                            if (value > wallet.solde) {
                                                return Promise.reject('Amount cannot exceed available balance');
                                            }
                                            return Promise.resolve();
                                        }
                                    }
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={100}
                                    max={wallet.solde}
                                    placeholder="Enter amount (minimum 100 DH)"
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>

                            <Form.Item>
                                <Space>
                                    <Button 
                                        type="primary" 
                                        htmlType="submit" 
                                        loading={loading}
                                        size="large"
                                    >
                                        Créer la demande de retrait
                                    </Button>
                                    <Button onClick={() => form.resetFields()} size="large">
                                        Reset
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default CreateWithdrawal;