import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DeleteMethPayement, getMeth_payement, updateMethPayement } from '../../../../redux/apiCalls/methPayementApiCalls';
import { Card, Button, Row, Col, Drawer, message, Modal, Avatar, Spin, Empty } from 'antd';
import Meta from 'antd/es/card/Meta';
import '../payement.css'; // Add a custom CSS file for additional styling
import { MdDelete } from 'react-icons/md';
import { FaPenFancy } from 'react-icons/fa';
import MethodePayementForm from './MethodePayementForm'; // Ensure correct path
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { ThemeContext } from '../../../ThemeContext';

const { confirm } = Modal;

const ListMethodePayement = () => {
    const { theme } = useContext(ThemeContext);
    const dispatch = useDispatch();
    const { meth_payement, isFetching, error } = useSelector((state) => state.meth_payement);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState(null);

    useEffect(() => {
        dispatch(getMeth_payement());
    }, [dispatch]);

    const handleDelete = (id) => {
        confirm({
            title: 'Are you sure you want to delete this payment method?',
            icon: <ExclamationCircleOutlined />,
            content: 'This action cannot be undone. All associated payments will be affected.',
            onOk() {
                dispatch(DeleteMethPayement(id))
                    .then(() => {
                        message.success('Payment method deleted successfully');
                        dispatch(getMeth_payement());
                    })
                    .catch(() => {
                        message.error('Failed to delete payment method');
                    });
            },
        });
    };

    const handleEdit = (method) => {
        setSelectedMethod(method);
        setDrawerVisible(true);
    };

    const handleUpdate = async () => {
        setDrawerVisible(false);
        setSelectedMethod(null);
        dispatch(getMeth_payement());
    };

    if (isFetching) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '50px',
                backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
                color: theme === 'dark' ? '#fff' : '#262626'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '50px',
                backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
                color: theme === 'dark' ? '#fff' : '#262626'
            }}>
                <Empty
                    description={
                        <span style={{ color: theme === 'dark' ? '#8c8c8c' : '#666' }}>
                            Error loading payment methods
                        </span>
                    }
                />
            </div>
        );
    }

    return (
        <div style={{
            padding: '24px',
            backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
            minHeight: '100vh'
        }}>
            <Row gutter={[16, 16]}>
                {meth_payement.map((method) => (
                    <Col key={method._id} xs={24} sm={12} md={8} lg={6}>
                        <Card
                            hoverable
                            style={{
                                height: '100%',
                                borderRadius: '12px',
                                backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                                border: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`,
                                boxShadow: theme === 'dark'
                                    ? '0 2px 8px rgba(0,0,0,0.3)'
                                    : '0 2px 8px rgba(0,0,0,0.1)',
                                transition: 'all 0.3s ease'
                            }}
                            styles={{
                                body: {
                                    backgroundColor: theme === 'dark' ? '#262626' : '#fff'
                                }
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '16px'
                                }}>
                                    <Avatar
                                        src={method.image?.url}
                                        size={48}
                                        style={{
                                            marginRight: '12px',
                                            border: `2px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
                                        }}
                                    />
                                    <div>
                                        <div style={{
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: theme === 'dark' ? '#fff' : '#262626',
                                            marginBottom: '4px'
                                        }}>
                                            {method.Bank}
                                        </div>
                                        <div style={{
                                            fontSize: '12px',
                                            color: theme === 'dark' ? '#8c8c8c' : '#666'
                                        }}>
                                            Payment Method
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    marginTop: 'auto',
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: '8px'
                                }}>
                                    <Button
                                        type="primary"
                                        icon={<FaPenFancy />}
                                        onClick={() => handleEdit(method)}
                                        style={{
                                            borderRadius: '6px',
                                            backgroundColor: '#1890ff',
                                            borderColor: '#1890ff',
                                            fontSize: '12px'
                                        }}
                                        size="small"
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        danger
                                        icon={<MdDelete />}
                                        onClick={() => handleDelete(method._id)}
                                        style={{
                                            borderRadius: '6px',
                                            fontSize: '12px'
                                        }}
                                        size="small"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Drawer
                title={
                    <div style={{
                        color: theme === 'dark' ? '#fff' : '#262626',
                        fontSize: '16px',
                        fontWeight: '600'
                    }}>
                        Update Payment Method
                    </div>
                }
                placement="right"
                onClose={() => {
                    setDrawerVisible(false);
                    setSelectedMethod(null);
                }}
                open={drawerVisible}
                width={400}
                style={{
                    backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff'
                }}
                styles={{
                    content: {
                        backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
                        color: theme === 'dark' ? '#fff' : '#262626'
                    },
                    header: {
                        backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
                        borderBottom: `1px solid ${theme === 'dark' ? '#303030' : '#f0f0f0'}`
                    },
                    body: {
                        backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
                        padding: '24px'
                    }
                }}
            >
                {selectedMethod && (
                    <MethodePayementForm
                        initialValues={selectedMethod}
                        onSubmit={handleUpdate}
                        isUpdate={true}
                        theme={theme}
                    />
                )}
            </Drawer>

            {/* Theme-aware styling */}
            <style jsx>{`
                .ant-card:hover {
                    transform: translateY(-2px) !important;
                    box-shadow: ${theme === 'dark'
                        ? '0 4px 16px rgba(0,0,0,0.4)'
                        : '0 4px 16px rgba(0,0,0,0.15)'} !important;
                }

                .ant-empty-description {
                    color: ${theme === 'dark' ? '#8c8c8c' : '#666'} !important;
                }

                .ant-spin {
                    color: ${theme === 'dark' ? '#1890ff' : '#1890ff'} !important;
                }
            `}</style>
        </div>
    );
};

export default ListMethodePayement;
