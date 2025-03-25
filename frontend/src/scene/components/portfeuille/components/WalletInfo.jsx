import React, { useEffect, useState } from 'react';
import { Card, Typography, Space, Tag, Button, Spin, Table, Avatar, Divider, Tooltip, Result } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getWalletByStore } from '../../../../redux/apiCalls/walletApiCalls';
import { getTransfersByWallet } from '../../../../redux/apiCalls/transferApiCalls';
import { 
    CopyOutlined, 
    DownOutlined, 
    UpOutlined,
    WalletOutlined,
    ShopOutlined,
    PhoneOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    KeyOutlined,
    CalendarOutlined,
    WarningOutlined,
    MailOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';

const { Title, Text } = Typography;

const minimizedWalletStyle = (theme) => ({
  background: theme === 'dark' ? 
    'linear-gradient(135deg, #001529 0%, #002242 100%)' : 
    'linear-gradient(135deg, #ffffff 0%, #f0f2f5 100%)',
  borderRadius: '16px',
  padding: '20px',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  border: `1px solid ${theme === 'dark' ? '#1890ff33' : '#e8e8e8'}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.15)'
  }
});

function WalletInfo({ showTransactions = false, theme }) {
    const dispatch = useDispatch();
    const [showTransfers, setShowTransfers] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const { selectedWallet, loading } = useSelector((state) => state.wallet);
    const { transfers } = useSelector((state) => state.transfer);
    const { store } = useSelector((state) => state.auth);

    useEffect(() => {
        if (store?._id) {
            dispatch(getWalletByStore(store._id));
        }
    }, [dispatch, store?._id]);

    useEffect(() => {
        if (showTransfers && selectedWallet?._id) {
            dispatch(getTransfersByWallet(selectedWallet._id));
        }
    }, [showTransfers, selectedWallet, dispatch]);

    const transferColumns = [
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleString()
        },
        {
            title: 'Amount',
            dataIndex: 'montant',
            key: 'montant',
            render: (amount) => (
                <Tag color={amount >= 0 ? 'success' : 'error'}>
                    {amount.toLocaleString()} DH
                </Tag>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={
                    status === 'validé' ? 'success' :
                    status === 'pending' ? 'warning' :
                    status === 'annuler' ? 'error' :
                    'default'
                }>
                    {status.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
                <Tag color={type === 'Correction' ? 'purple' : 'blue'}>
                    {type}
                </Tag>
            )
        }
    ];

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin />
            </div>
        );
    }

    if (!selectedWallet) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <Text type="secondary">No wallet information available</Text>
            </div>
        );
    }

    if (!selectedWallet.active) {
        return (
            <div style={{ 
                backgroundColor: theme === 'dark' ? '#002242' : '#fff',
                padding: '32px',
                borderRadius: '12px',
                textAlign: 'center'
            }}>
                <WarningOutlined style={{ 
                    fontSize: 64, 
                    color: '#faad14',
                    marginBottom: '24px'
                }} />
                <Title level={3} style={{ 
                    color: '#faad14',
                    marginBottom: '16px'
                }}>
                    Wallet Inactive
                </Title>
                <Text style={{ 
                    fontSize: '16px',
                    color: theme === 'dark' ? '#fff' : '#000',
                    marginBottom: '24px',
                    display: 'block'
                }}>
                    Your wallet is currently inactive. This means you cannot:
                </Text>
                <ul style={{ 
                    textAlign: 'left',
                    marginBottom: '32px',
                    color: theme === 'dark' ? '#fff' : '#000'
                }}>
                    <li>View your wallet balance</li>
                    <li>Make any transactions</li>
                    <li>Access wallet features</li>
                </ul>
                <div style={{ 
                    backgroundColor: theme === 'dark' ? '#001529' : '#f5f5f5',
                    padding: '16px',
                    borderRadius: '8px',
                    marginTop: '24px'
                }}>
                    <Text strong style={{ 
                        color: theme === 'dark' ? '#fff' : '#000',
                        display: 'block',
                        marginBottom: '8px'
                    }}>
                        Need Help?
                    </Text>
                    <Text style={{ 
                        color: theme === 'dark' ? '#fff' : '#000',
                        display: 'block',
                        marginBottom: '12px'
                    }}>
                        Please contact our support team:
                    </Text>
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            justifyContent: 'center'
                        }}>
                            <MailOutlined style={{ color: '#1890ff' }} />
                            <Text style={{ 
                                color: '#1890ff',
                                fontSize: '16px'
                            }}>
                                support@eromax.com
                            </Text>
                        </div>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            justifyContent: 'center'
                        }}>
                            <PhoneOutlined style={{ color: '#1890ff' }} />
                            <Text style={{ 
                                color: '#1890ff',
                                fontSize: '16px'
                            }}>
                                +212 5 06 63 32 25
                            </Text>
                        </div>
                    </Space>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card
                style={{
                    backgroundColor: theme === 'dark' ? '#002242' : '#fff',
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    marginBottom: '20px'
                }}
            >
                {/* Quick Info Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                    padding: '16px',
                    background: theme === 'dark' 
                        ? 'linear-gradient(135deg, #001529 0%, #002242 100%)'
                        : 'linear-gradient(135deg, #f0f2f5 0%, #ffffff 100%)',
                    borderRadius: '12px',
                    marginBottom: '20px'
                }}>
                    {/* Balance Info */}
                    <div style={{
                        textAlign: 'center',
                        padding: '20px',
                        background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)',
                        borderRadius: '12px',
                        border: `1px solid ${theme === 'dark' ? '#1890ff33' : '#e8e8e8'}`
                    }}>
                        <WalletOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
                        <Typography.Title level={3} style={{ margin: '8px 0', color: theme === 'dark' ? '#fff' : '#000' }}>
                            {selectedWallet?.solde.toLocaleString()} DH
                        </Typography.Title>
                        <Tag color={selectedWallet?.active ? 'success' : 'error'}>
                            {selectedWallet?.active ? 'Active' : 'Inactive'}
                        </Tag>
                    </div>

                    {/* Store Info */}
                    <div style={{
                        padding: '20px',
                        background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)',
                        borderRadius: '12px',
                        border: `1px solid ${theme === 'dark' ? '#1890ff33' : '#e8e8e8'}`
                    }}>
                        <Space align="start">
                            <Avatar 
                                size={48} 
                                src={selectedWallet?.store?.image?.url}
                                icon={<ShopOutlined />}
                            />
                            <div>
                                <Typography.Text strong style={{ 
                                    fontSize: '16px', 
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    display: 'block'
                                }}>
                                    {selectedWallet?.store?.storeName}
                                </Typography.Text>
                                <Typography.Text copyable style={{ fontSize: '12px' }}>
                                    {selectedWallet?.key}
                                </Typography.Text>
                            </div>
                        </Space>
                    </div>

                    {/* Quick Stats */}
                    <div style={{
                        padding: '20px',
                        background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.8)',
                        borderRadius: '12px',
                        border: `1px solid ${theme === 'dark' ? '#1890ff33' : '#e8e8e8'}`
                    }}>
                        <Space direction="vertical" size="small">
                            <Typography.Text type="secondary">
                                <CalendarOutlined /> Created: {moment(selectedWallet?.createdAt).format('MMM DD, YYYY')}
                            </Typography.Text>
                            <Typography.Text type="secondary">
                                <ClockCircleOutlined /> Last Updated: {moment(selectedWallet?.updatedAt).format('MMM DD, HH:mm')}
                            </Typography.Text>
                        </Space>
                    </div>
                </div>

                {/* Transactions Section */}
                {showTransactions && (
                    <div style={{ marginTop: '20px' }}>
                        <Typography.Title level={5} style={{ marginBottom: '16px' }}>
                            <Space>
                                <WalletOutlined />
                                Recent Transactions
                                <Button
                                    type="primary"
                                    icon={showTransfers ? <UpOutlined /> : <DownOutlined />}
                                    onClick={() => setShowTransfers(!showTransfers)}
                                >
                                    {showTransfers ? 'Hide' : 'Show'}
                                </Button>
                            </Space>
                        </Typography.Title>

                        <AnimatePresence>
                            {showTransfers && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Table
                                        columns={transferColumns}
                                        dataSource={transfers}
                                        rowKey="_id"
                                        size="small"
                                        pagination={{ pageSize: 5, simple: true }}
                                        style={{
                                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                                            borderRadius: '8px',
                                            overflow: 'hidden'
                                        }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </Card>
        </motion.div>
    );
}

export default WalletInfo;