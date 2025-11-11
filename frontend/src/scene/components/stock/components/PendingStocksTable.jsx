import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Modal, Form, Input, InputNumber, DatePicker, Alert } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getPendingStocks, approveStock, rejectStock } from '../../../../redux/apiCalls/stockApiCalls';
import moment from 'moment';

const { TextArea } = Input;

const PendingStocksTable = () => {
    const dispatch = useDispatch();
    const { pendingStocks, loading } = useSelector(state => state.stock);
    const [approveForm] = Form.useForm();
    const [rejectForm] = Form.useForm();
    
    const [approveModal, setApproveModal] = useState({ visible: false, stock: null });
    const [rejectModal, setRejectModal] = useState({ visible: false, stock: null });
    const [page, setPage] = useState(1);

    useEffect(() => {
        loadPendingStocks();
    }, [page]);

    const loadPendingStocks = () => {
        dispatch(getPendingStocks({ page, limit: 20 }));
    };

    const handleApprove = (stock) => {
        setApproveModal({ visible: true, stock });
        approveForm.setFieldsValue({
            dateReceived: moment(),
            actualQuantity: stock.quantite_initial,
            location: stock.location || 'siege'
        });
    };

    const handleReject = (stock) => {
        setRejectModal({ visible: true, stock });
    };

    const submitApproval = async (values) => {
        try {
            const approvalData = {
                confirmationNotes: values.confirmationNotes,
                dateReceived: values.dateReceived.format('YYYY-MM-DD'),
                actualQuantity: values.actualQuantity,
                location: values.location
            };
            
            await dispatch(approveStock(approveModal.stock._id, approvalData));
            setApproveModal({ visible: false, stock: null });
            approveForm.resetFields();
            loadPendingStocks();
        } catch (error) {
            console.error('Error approving stock:', error);
        }
    };

    const submitRejection = async (values) => {
        try {
            await dispatch(rejectStock(rejectModal.stock._id, values));
            setRejectModal({ visible: false, stock: null });
            rejectForm.resetFields();
            loadPendingStocks();
        } catch (error) {
            console.error('Error rejecting stock:', error);
        }
    };

    const columns = [
        {
            title: 'Client',
            key: 'client',
            render: (_, record) => (
                <div>
                    <div><strong>{record.clientId?.nom} {record.clientId?.prenom}</strong></div>
                    <small>{record.clientId?.email}</small>
                </div>
            )
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            width: 150
        },
        {
            title: 'Produit',
            dataIndex: 'productName',
            key: 'productName',
            render: (name, record) => (
                <div>
                    <div>{name}</div>
                    {record.variantName && <small style={{ color: '#666' }}>{record.variantName}</small>}
                </div>
            )
        },
        {
            title: 'Quantité',
            dataIndex: 'quantite_initial',
            key: 'quantite_initial',
            width: 100,
            align: 'center',
            render: (qty) => <strong>{qty}</strong>
        },
        {
            title: 'Soumis le',
            dataIndex: 'submittedAt',
            key: 'submittedAt',
            width: 120,
            render: (date) => moment(date).format('DD/MM/YYYY')
        },
        {
            title: 'Notes Client',
            dataIndex: 'clientNotes',
            key: 'clientNotes',
            ellipsis: true,
            render: (notes) => notes || <span style={{ color: '#ccc' }}>Aucune note</span>
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={() => handleApprove(record)}
                    >
                        Approuver
                    </Button>
                    <Button
                        danger
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={() => handleReject(record)}
                    >
                        Rejeter
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div className="pending-stocks-table">
            <Table
                columns={columns}
                dataSource={pendingStocks.data}
                rowKey="_id"
                loading={loading}
                scroll={{ x: 1400 }}
                pagination={{
                    current: pendingStocks.pagination?.page || 1,
                    pageSize: pendingStocks.pagination?.limit || 20,
                    total: pendingStocks.pagination?.total || 0,
                    onChange: (page) => setPage(page),
                    showTotal: (total) => `Total ${total} stocks en attente`
                }}
            />

            {/* Approve Modal */}
            <Modal
                title={`Approuver le Stock: ${approveModal.stock?.sku}`}
                open={approveModal.visible}
                onCancel={() => {
                    setApproveModal({ visible: false, stock: null });
                    approveForm.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={approveForm}
                    layout="vertical"
                    onFinish={submitApproval}
                >
                    <Alert
                        message="Approbation de Stock"
                        description={`Vous êtes sur le point d'approuver ${approveModal.stock?.quantite_initial} unités de ${approveModal.stock?.productName}.`}
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />

                    <Form.Item
                        label="Date de Réception"
                        name="dateReceived"
                        rules={[{ required: true, message: 'Date requise' }]}
                    >
                        <DatePicker style={{ width: '100%' }} size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Quantité Réelle Reçue"
                        name="actualQuantity"
                        rules={[{ required: true, message: 'Quantité requise' }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} size="large" />
                    </Form.Item>

                    <Form.Item label="Emplacement" name="location">
                        <Input placeholder="siege - rayon A3" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Notes de Confirmation"
                        name="confirmationNotes"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Stock reçu et vérifié. État: excellent..."
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setApproveModal({ visible: false, stock: null })}>
                                Annuler
                            </Button>
                            <Button type="primary" htmlType="submit" icon={<CheckOutlined />}>
                                Approuver le Stock
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Reject Modal */}
            <Modal
                title={`Rejeter le Stock: ${rejectModal.stock?.sku}`}
                open={rejectModal.visible}
                onCancel={() => {
                    setRejectModal({ visible: false, stock: null });
                    rejectForm.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={rejectForm}
                    layout="vertical"
                    onFinish={submitRejection}
                >
                    <Alert
                        message="Rejet de Stock"
                        description={`Vous êtes sur le point de rejeter le stock ${rejectModal.stock?.sku}.`}
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />

                    <Form.Item
                        label="Raison du Rejet"
                        name="rejectionReason"
                        rules={[{ required: true, message: 'Raison requise' }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Les quantités ne correspondent pas à la facture..."
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setRejectModal({ visible: false, stock: null })}>
                                Annuler
                            </Button>
                            <Button danger type="primary" htmlType="submit" icon={<CloseOutlined />}>
                                Rejeter le Stock
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PendingStocksTable;

