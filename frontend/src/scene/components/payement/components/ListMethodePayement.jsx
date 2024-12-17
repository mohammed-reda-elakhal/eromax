import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DeleteMethPayement, getMeth_payement, updateMethPayement } from '../../../../redux/apiCalls/methPayementApiCalls';
import { Card, Button, Row, Col, Drawer, message, Modal, Avatar } from 'antd';
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
            onCancel() {
                // Do nothing on cancel
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

    if (isFetching) return <p>Loading...</p>;
    if (error) return <p>Error loading payment methods</p>;

    return (
        <div className="payment-method-container">
            <h2 className="title">Payment Methods</h2>
            <Row gutter={[16, 16]}>
                {meth_payement.map((method) => (
                    <Col key={method._id} xs={24} sm={12} md={8} lg={6}>
                        <Card
                            hoverable
                            
                        >
                          <div className="payment-card">
                            <div className="card_content_pay">
                              <Avatar src={method.image?.url} />
                              <Meta title={method.Bank} />
                            </div>
                            <div className="action_card_content">
                              <Button
                                  icon={<FaPenFancy />}
                                  onClick={() => handleEdit(method)}
                                  style={{ marginRight: '8px' }}
                              >
                              </Button>
                              <Button
                                  icon={<MdDelete />}
                                  onClick={() => handleDelete(method._id)}
                                  danger
                              >
                              </Button>
                            </div>
                          </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* **Edit Drawer** */}
            <Drawer
                title="Update Payment Method"
                placement="right"
                onClose={() => setDrawerVisible(false)}
                visible={drawerVisible}
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
