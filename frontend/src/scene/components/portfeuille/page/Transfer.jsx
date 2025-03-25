import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import { Table, Tag, Typography, Button, Space, Spin, message, Input, Select, DatePicker, Popconfirm, Tooltip, Modal, Form, InputNumber } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getAllTransfers, validateTransfer, cancelTransfer, correctTransfer } from '../../../../redux/apiCalls/transferApiCalls';
import { ReloadOutlined, SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, EditOutlined } from '@ant-design/icons';
import moment from 'moment';

const { RangePicker } = DatePicker;

function Transfer() {
    const { theme } = useContext(ThemeContext);
    const dispatch = useDispatch();
    
    const { transfers, loading } = useSelector((state) => ({
        transfers: state.transfer.transfers,
        loading: state.transfer.loading
    }));

    const { user } = useSelector((state) => state.auth);
    const isAdmin = user?.role === 'admin';

    // Search states
    const [searchParams, setSearchParams] = useState({
        storeName: '',
        transferStatus: '',
        colisStatus: '',
        walletKey: '',
        codeSuivi: '',
        startDate: '',
        endDate: ''
    });

    const [correctionModal, setCorrectionModal] = useState({
        visible: false,
        transfer: null
    });
    const [form] = Form.useForm();

    // Handle search parameter changes
    const handleSearch = () => {
        // Filter out empty values
        const filteredParams = Object.fromEntries(
            Object.entries(searchParams).filter(([_, value]) => value !== '')
        );
        dispatch(getAllTransfers(filteredParams));
    };

    const handleReset = () => {
        setSearchParams({
            storeName: '',
            transferStatus: '',
            colisStatus: '',
            walletKey: '',
            codeSuivi: '',
            startDate: '',
            endDate: ''
        });
        dispatch(getAllTransfers());
    };

    // Format date for display
    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    useEffect(() => {
        dispatch(getAllTransfers());
    }, [dispatch]);

    // Search form component
    const SearchForm = () => (
        <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 16 }}>
            <Space wrap>
                {isAdmin && (
                    <>
                        <Input
                            placeholder="🏪 Enter store name..."
                            value={searchParams.storeName}
                            onChange={(e) => setSearchParams({ ...searchParams, storeName: e.target.value })}
                            style={{ width: 200 }}
                            prefix={<SearchOutlined />}
                            allowClear
                        />
                        <Input
                            placeholder="🔑 Enter wallet key..."
                            value={searchParams.walletKey}
                            onChange={(e) => setSearchParams({ ...searchParams, walletKey: e.target.value })}
                            style={{ width: 200 }}
                            prefix={<SearchOutlined />}
                            allowClear
                        />
                    </>
                )}
                <Input
                    placeholder="📦 Enter tracking code..."
                    value={searchParams.codeSuivi}
                    onChange={(e) => setSearchParams({ ...searchParams, codeSuivi: e.target.value })}
                    style={{ width: 200 }}
                    prefix={<SearchOutlined />}
                    allowClear
                />
                <Select
                    placeholder="📊 Select transfer status..."
                    value={searchParams.transferStatus}
                    onChange={(value) => setSearchParams({ ...searchParams, transferStatus: value })}
                    style={{ width: 200 }}
                    allowClear
                >
                    <Select.OptGroup label="Transfer Status">
                        <Select.Option value="validé">✅ Validé - Confirmed transfers</Select.Option>
                        <Select.Option value="corrigé">🔄 Corrigé - Corrected transfers</Select.Option>
                        <Select.Option value="annuler">❌ Annulé - Cancelled transfers</Select.Option>
                        <Select.Option value="pending">⏳ En attente - Pending transfers</Select.Option>
                    </Select.OptGroup>
                </Select>
                <Select
                    placeholder="📦 Select delivery status..."
                    value={searchParams.colisStatus}
                    onChange={(value) => setSearchParams({ ...searchParams, colisStatus: value })}
                    style={{ width: 200 }}
                    allowClear
                >
                    <Select.OptGroup label="Delivery Status">
                        <Select.Option value="Livrée">✅ Livrée - Delivered packages</Select.Option>
                        <Select.Option value="Refusée">❌ Refusée - Refused packages</Select.Option>
                    </Select.OptGroup>
                </Select>
                <RangePicker
                    placeholder={['📅 Start date', '📅 End date']}
                    value={[
                        searchParams.startDate ? moment(searchParams.startDate) : null,
                        searchParams.endDate ? moment(searchParams.endDate) : null
                    ]}
                    onChange={(dates) => {
                        if (dates) {
                            setSearchParams({
                                ...searchParams,
                                startDate: dates[0].toISOString(),
                                endDate: dates[1].toISOString()
                            });
                        } else {
                            setSearchParams({
                                ...searchParams,
                                startDate: '',
                                endDate: ''
                            });
                        }
                    }}
                    format="DD/MM/YYYY HH:mm"
                    showTime={{ format: 'HH:mm' }}
                    style={{ width: 300 }}
                />
                <Button 
                    type="primary" 
                    onClick={handleSearch}
                    icon={<SearchOutlined />}
                >
                    Search
                </Button>
                <Button onClick={handleReset}>
                    Reset
                </Button>
            </Space>
            {(searchParams.startDate || searchParams.endDate) && (
                <div style={{ fontSize: '12px', color: 'gray' }}>
                    📅 Selected period: {formatDate(searchParams.startDate)} - {formatDate(searchParams.endDate)}
                </div>
            )}
        </Space>
    );

    const handleValidateTransfer = async (transferId) => {
        try {
            await dispatch(validateTransfer(transferId));
            dispatch(getAllTransfers(searchParams));
        } catch (error) {
            message.error('Failed to validate transfer');
        }
    };

    const handleCancelTransfer = async (transferId) => {
        try {
            await dispatch(cancelTransfer(transferId));
            dispatch(getAllTransfers(searchParams));
        } catch (error) {
            message.error('Failed to cancel transfer');
        }
    };

    const handleCorrection = async (values) => {
        try {
            if (!correctionModal.transfer) {
                message.error('No transfer selected for correction');
                return;
            }
            
            await dispatch(correctTransfer(correctionModal.transfer._id, {
                newMontant: values.newAmount,
                description: values.description
            }));
            
            setCorrectionModal({ visible: false, transfer: null });
            form.resetFields();
            dispatch(getAllTransfers(searchParams));
        } catch (error) {
            message.error('Failed to correct transfer');
        }
    };

    const showCorrectionModal = (transfer) => {
        if (!transfer) {
            message.error('No transfer selected');
            return;
        }

        setCorrectionModal({
            visible: true,
            transfer: transfer
        });

        form.setFieldsValue({
            currentAmount: transfer.montant,
            newAmount: transfer.montant
        });
    };

    const columns = [
        {
            title: 'Store',
            dataIndex: 'wallet',
            key: 'store',
            render: (wallet) => (
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <Tag color="cyan">
                        {wallet?.store?.storeName || 'N/A'}
                    </Tag>
                    {isAdmin && (
                        <Typography.Text
                            copyable={{ text: wallet?.key }}
                            style={{
                                fontSize: '12px',
                                color: 'gray',
                                width: '100%',
                                display: 'inline-block',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}
                            title={wallet?.key}
                        >
                            {wallet?.key}
                        </Typography.Text>
                    )}
                </Space>
            ),
        },
        {
            title: 'Code Colis',
            dataIndex: 'colis',
            key: 'colis',
            render: (colis) => (
                <Space direction="vertical" size={4} style={{ marginBottom: 4 }}>
                    <Typography.Text copyable={{ text: colis?.code_suivi }}>
                        <Tag color="blue">
                            {colis?.code_suivi || 'N/A'}
                        </Tag>
                    </Typography.Text>
                    <small style={{ color: 'gray' }}>
                        Status: <Tag color={getColisStatusColor(colis?.statu_final)}>
                            {colis?.statu_final || 'N/A'}
                        </Tag>
                    </small>
                </Space>
            ),
        },
        {
            title: 'Amount',
            dataIndex: 'montant',
            key: 'montant',
            render: (montant, record) => (
                <Space direction="vertical" size={4} style={{ marginBottom: 4 }}>
                    <Tag color={montant >= 0 ? "green" : "red"}>
                        {montant} DH
                    </Tag>
                    {record.type === 'Correction' && record.originalMontant !== null && (
                        <small style={{ color: 'gray' }}>
                            Original: <Tag color="orange">{record.originalMontant} DH</Tag>
                        </small>
                    )}
                </Space>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusInfo = getTransferStatusInfo(status);
                return (
                    <Tag color={statusInfo.color} style={{ marginBottom: 4 }}>
                        {statusInfo.icon} {status?.toUpperCase() || 'N/A'}
                    </Tag>
                );
            },
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
                <Tag color={type === 'Correction' ? "purple" : "blue"} style={{ marginBottom: 4 }}>
                    {type === 'Correction' ? '🔄' : '💰'} {type?.toUpperCase() || 'N/A'}
                </Tag>
            ),
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => (
                <span style={{ marginBottom: 4, display: 'inline-block' }}>
                    {new Date(date).toLocaleString()}
                </span>
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (description, record) => {
                if (!description && record.type !== 'Correction') return '-';
                return (
                    <div style={{ maxWidth: 200, whiteSpace: 'normal' }}>
                        <div style={{ marginBottom: 4 }}>
                            {description || 'No description provided'}
                        </div>
                        {record.correctionDate && (
                            <div>
                                <small style={{ color: 'gray' }}>
                                    Corrected on: {new Date(record.correctionDate).toLocaleString()}
                                </small>
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => {
                // Check transfer conditions
                const isCorrected = record.type === 'Correction';
                const isValidated = record.status === 'validé';
                const isCancelled = record.status === 'annuler';
                
                return isAdmin && (
                    <Space size="small">
                        {!isCorrected && !isValidated && (
                            <Tooltip title="Validate Transfer">
                                <Popconfirm
                                    title="Validate this transfer?"
                                    description="Are you sure you want to validate this transfer?"
                                    onConfirm={() => handleValidateTransfer(record._id)}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button
                                        type="primary"
                                        icon={<CheckCircleOutlined />}
                                        size="small"
                                        style={{ backgroundColor: '#52c41a' }}
                                    >
                                        Validate
                                    </Button>
                                </Popconfirm>
                            </Tooltip>
                        )}
                        {!isCorrected && !isCancelled && (
                            <Tooltip title="Cancel Transfer">
                                <Popconfirm
                                    title="Cancel this transfer?"
                                    description="Are you sure you want to cancel this transfer?"
                                    onConfirm={() => handleCancelTransfer(record._id)}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button
                                        danger
                                        icon={<CloseCircleOutlined />}
                                        size="small"
                                    >
                                        Cancel
                                    </Button>
                                </Popconfirm>
                            </Tooltip>
                        )}
                        {!isCorrected && !isCancelled && (
                            <Tooltip title="Correct Transfer">
                                <Button
                                    type="primary"
                                    icon={<EditOutlined />}
                                    size="small"
                                    onClick={() => showCorrectionModal(record)}
                                >
                                    Correct
                                </Button>
                            </Tooltip>
                        )}
                    </Space>
                );
            },
            width: isAdmin ? 300 : 0,
            className: !isAdmin ? 'hidden-column' : ''
        }
    ];

    // Helper function to get transfer status info
    const getTransferStatusInfo = (status) => {
        switch (status) {
            case 'validé':
                return { color: 'success', icon: '✅' };
            case 'corrigé':
                return { color: 'processing', icon: '🔄' };
            case 'annuler':
                return { color: 'error', icon: '❌' };
            case 'pending':
                return { color: 'warning', icon: '⏳' };
            default:
                return { color: 'default', icon: '❔' };
        }
    };

    // Helper function to get colis status color
    const getColisStatusColor = (status) => {
        switch (status) {
            case 'Livrée':
                return 'success';
            case 'En cours':
                return 'processing';
            case 'Retournée':
                return 'warning';
            case 'Refusée':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <div className='page-dashboard'>
            <Menubar />
            <main className="page-main">
                <Topbar />
                <div
                    className="page-content"
                    style={{
                        backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray1)',
                        color: theme === 'dark' ? '#fff' : '#002242',
                    }}
                >
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <Typography.Title level={4}>
                                Transfer History {!isAdmin && '(Your Stores Only)'}
                            </Typography.Title>
                            <Button
                                type="primary"
                                icon={<ReloadOutlined />}
                                onClick={handleReset}
                            >
                                Refresh
                            </Button>
                        </div>

                        <SearchForm />

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '50px' }}>
                                <Spin size="large" />
                            </div>
                        ) : (
                            <Table
                                columns={columns}
                                dataSource={transfers}
                                rowKey="_id"
                                pagination={{
                                    defaultPageSize: 10,
                                    showSizeChanger: true,
                                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} transfers`
                                }}
                                scroll={{ x: true }}
                            />
                        )}
                    </div>
                </div>
            </main>

            {/* Correction Modal */}
            <Modal
                title="Correct Transfer"
                open={correctionModal.visible}
                onCancel={() => {
                    setCorrectionModal({ visible: false, transfer: null });
                    form.resetFields();
                }}
                maskClosable={false}
                footer={null}
            >
                <Form
                    form={form}
                    onFinish={handleCorrection}
                    layout="vertical"
                    initialValues={{
                        currentAmount: correctionModal.transfer?.montant || 0,
                        newAmount: correctionModal.transfer?.montant || 0
                    }}
                >
                    <Form.Item
                        label="Current Amount"
                        name="currentAmount"
                    >
                        <InputNumber
                            disabled
                            style={{ width: '100%' }}
                            formatter={value => `${value} DH`}
                            parser={value => value.replace(' DH', '')}
                        />
                    </Form.Item>
                    <Form.Item
                        label="New Amount"
                        name="newAmount"
                        rules={[
                            { required: true, message: 'Please enter the new amount' },
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={value => `${value} DH`}
                            parser={value => value.replace(' DH', '')}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Correction Reason"
                        name="description"
                        rules={[
                            { required: true, message: 'Please provide a reason for the correction' },
                            { min: 10, message: 'Description must be at least 10 characters' }
                        ]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <Button onClick={() => {
                                setCorrectionModal({ visible: false, transfer: null });
                                form.resetFields();
                            }}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Submit Correction
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default Transfer; 