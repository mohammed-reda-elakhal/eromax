import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DeleteMethPayement, getMeth_payement, updateMethPayement } from '../../../../redux/apiCalls/methPayementApiCalls';
import { Card, Button, Row, Col, Drawer, message, Modal, Avatar, Spin, Empty } from 'antd';
import Meta from 'antd/es/card/Meta';
import '../payement.css'; // Add a custom CSS file for additional styling
import { MdDelete } from 'react-icons/md';
import { FaPenFancy } from 'react-icons/fa';
import MethodePayementForm from './MethodePayementForm'; // Ensure correct path
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { confirm } = Modal;

const ListMethodePayement = () => {
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
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Empty description="Error loading payment methods" />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <Row gutter={[16, 16]}>
                {meth_payement.map((method) => (
                    <Col key={method._id} xs={24} sm={12} md={8} lg={6}>
                        <Card
                            hoverable
                            style={{
                                height: '100%',
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                transition: 'all 0.3s ease'
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
                                        style={{ marginRight: '12px' }}
                                    />
                                    <Meta 
                                        title={method.Bank}
                                        description="Payment Method"
                                    />
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
                                        style={{ borderRadius: '6px' }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        danger
                                        icon={<MdDelete />}
                                        onClick={() => handleDelete(method._id)}
                                        style={{ borderRadius: '6px' }}
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
                title="Update Payment Method"
                placement="right"
                onClose={() => {
                    setDrawerVisible(false);
                    setSelectedMethod(null);
                }}
                open={drawerVisible}
                width={400}
            >
                {selectedMethod && (
                    <MethodePayementForm
                        initialValues={selectedMethod}
                        onSubmit={handleUpdate}
                        isUpdate={true}
                    />
                )}
            </Drawer>
        </div>
    );
};

export default ListMethodePayement;
