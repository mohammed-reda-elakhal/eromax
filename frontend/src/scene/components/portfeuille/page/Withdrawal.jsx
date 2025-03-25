import React, { useContext, useEffect, useState, useCallback } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import { Table, Tag, Typography, Button, Space, Spin, message, Input, Select, DatePicker, Popconfirm, Tooltip, Modal, Form, InputNumber, Timeline, Drawer, Card, Avatar, Divider, Row, Col, Box, Upload, Image } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getAllWithdrawals, getWithdrawalsByWalletKey, updateWithdrawalStatus, uploadVermentPreuve } from '../../../../redux/apiCalls/withdrawalApiCalls';
import { ReloadOutlined, SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, HistoryOutlined, UserOutlined, BankOutlined, WalletOutlined, UploadOutlined } from '@ant-design/icons';
import moment from 'moment';
import { debounce } from 'lodash';
import { toast } from 'react-hot-toast';

const { RangePicker } = DatePicker;

function Withdrawal() {
    const { theme } = useContext(ThemeContext);
    const dispatch = useDispatch();
    
    const { withdrawals, loading } = useSelector((state) => ({
        withdrawals: state.withdrawal.withdrawals || [],
        loading: state.withdrawal.loading
    }));

    const { user } = useSelector((state) => state.auth);
    const isAdmin = user?.role === 'admin';

    // Add search states
    const [searchParams, setSearchParams] = useState({
        storeName: '',
        walletKey: '',
        status: '',
        startDate: '',
        endDate: '',
        page: 1,
        limit: 10
    });

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    const [statusModal, setStatusModal] = useState({
        visible: false,
        withdrawal: null
    });
    const [form] = Form.useForm();

    const [historyDrawer, setHistoryDrawer] = useState({
        visible: false,
        withdrawal: null
    });

    const [uploadModal, setUploadModal] = useState({
        visible: false,
        withdrawal: null
    });

    // Simplified fetchWithdrawals function
    const fetchWithdrawals = async (page = pagination.current, pageSize = pagination.pageSize) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Session expired. Please login again.');
                return;
            }

            // Clean up search parameters
            const params = {
                ...searchParams,
                page,
                limit: pageSize
            };

            // Remove empty values
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null || params[key] === undefined) {
                    delete params[key];
                }
            });

            await dispatch(getAllWithdrawals(params));
        } catch (error) {
            if (error.message === 'Session expired. Please login again.') {
                toast.error(error.message);
            } else {
                toast.error('Failed to fetch withdrawals');
            }
        }
    };

    // Simplified handleTableChange function
    const handleTableChange = (pagination) => {
        fetchWithdrawals(pagination.current, pagination.pageSize);
    };

    // Update useEffect for initial data fetch
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        fetchWithdrawals();
    }, [dispatch]);

    // Update useEffect to use searchParams
    useEffect(() => {
        fetchWithdrawals();
    }, [searchParams]);

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

    // Add token check
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            message.error('Please login to access this page');
            // Redirect to login page or handle unauthorized access
            return;
        }
    }, []);

    const handleStatusUpdate = async (values) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Please login to update withdrawal status');
                return;
            }

            if (!statusModal.withdrawal) {
                message.error('No withdrawal selected');
                return;
            }

            const file = values.verment_preuve?.file?.originFileObj || null;

            console.log('Selected file:', file);

            await dispatch(updateWithdrawalStatus(statusModal.withdrawal._id, {
                status: values.status,
                note: values.note
            }, file));

            setStatusModal({ visible: false, withdrawal: null });
            form.resetFields();

            // Refresh the withdrawals list
            fetchWithdrawals(pagination.current, pagination.pageSize);
        } catch (error) {
            console.error('Error in handleStatusUpdate:', error);
            if (error.message?.includes('401')) {
                message.error('Your session has expired. Please login again.');
            } else {
                message.error('Failed to update withdrawal status');
            }
        }
    };

    const handleUpload = async (values) => {
        try {
            const file = values.verment_preuve?.file?.originFileObj || null;
            if (!file) {
                message.error('Please select a file to upload');
                return;
            }

            console.log('Selected file:', file);

            await dispatch(uploadVermentPreuve(uploadModal.withdrawal._id, file));

            setUploadModal({ visible: false, withdrawal: null });
            form.resetFields();

            // Refresh the withdrawals list
            fetchWithdrawals(pagination.current, pagination.pageSize);
        } catch (error) {
            console.error('Error in handleUpload:', error);
            message.error('Failed to upload proof of payment');
        }
    };

    const showStatusModal = (withdrawal) => {
        const token = localStorage.getItem('token');
        if (!token) {
            message.error('Please login to update withdrawal status');
            return;
        }

        if (!isAdmin) {
            message.error('Only administrators can update withdrawal status');
            return;
        }
        
        setStatusModal({
            visible: true,
            withdrawal: withdrawal
        });
    };

    // Add SearchForm component
    const SearchForm = () => (
        <Card sx={{ mb: 3 }}>
            <Form
                layout="inline"
                onFinish={handleSearch}
                initialValues={{
                    ...searchParams,
                    dateRange: searchParams.startDate && searchParams.endDate ? [
                        moment(searchParams.startDate),
                        moment(searchParams.endDate)
                    ] : null
                }}
            >
                {isAdmin && (
                    <Form.Item name="storeName">
                        <Input
                            placeholder="Search by store name"
                            allowClear
                            style={{ width: 200 }}
                        />
                    </Form.Item>
                )}
                <Form.Item name="walletKey">
                    <Input
                        placeholder="Search by wallet key"
                        allowClear
                        style={{ width: 200 }}
                    />
                </Form.Item>
                <Form.Item name="status">
                    <Select
                        placeholder="Status"
                        allowClear
                        style={{ width: 150 }}
                    >
                        <Select.Option value="waiting">⏳ Waiting</Select.Option>
                        <Select.Option value="seen">👁️ Seen</Select.Option>
                        <Select.Option value="checking">🔍 Checking</Select.Option>
                        <Select.Option value="accepted">✅ Accepted</Select.Option>
                        <Select.Option value="rejected">❌ Rejected</Select.Option>
                        <Select.Option value="processing">⚙️ Processing</Select.Option>
                        <Select.Option value="done">✨ Done</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item name="dateRange">
                    <DatePicker.RangePicker
                        style={{ width: 300 }}
                        format="YYYY-MM-DD"
                    />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Search
                    </Button>
                    <Button onClick={handleReset} style={{ marginLeft: 8 }}>
                        Reset
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );

    // Update handleSearch to handle all search parameters
    const handleSearch = (values) => {
        const { dateRange, ...restValues } = values;
        const searchParams = {
            ...restValues,
            page: 1,
            limit: pagination.pageSize
        };

        if (dateRange) {
            searchParams.startDate = dateRange[0].format('YYYY-MM-DD');
            searchParams.endDate = dateRange[1].format('YYYY-MM-DD');
        }

        // Clean up empty values
        Object.keys(searchParams).forEach(key => {
            if (searchParams[key] === '' || searchParams[key] === null || searchParams[key] === undefined) {
                delete searchParams[key];
            }
        });

        setSearchParams(searchParams);
    };

    // Update handleReset to reset all search parameters
    const handleReset = () => {
        setSearchParams({
            storeName: '',
            walletKey: '',
            status: '',
            startDate: '',
            endDate: '',
            page: 1,
            limit: pagination.pageSize
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
            title: 'Payment Details',
            dataIndex: 'payment',
            key: 'payment',
            render: (payment) => (
                <Space direction="vertical" size={4}>
                    <Tag color="blue">
                        {payment?.nom || 'N/A'}
                    </Tag>
                    <Typography.Text copyable={{ text: payment?.rib }}>
                        <small style={{ color: 'gray' }}>
                            {payment?.rib || 'N/A'}
                        </small>
                    </Typography.Text>
                    <Tag color="purple">
                        {payment?.idBank?.Bank || 'N/A'}
                    </Tag>
                </Space>
            ),
        },
        {
            title: 'Amount',
            dataIndex: 'montant',
            key: 'montant',
            render: (montant, record) => (
                <Space direction="vertical" size={4}>
                    <Tag color="green">
                        {montant} DH
                    </Tag>
                    <small style={{ color: 'gray' }}>
                        Fee: <Tag color="orange">{record.frais} DH</Tag>
                    </small>
                </Space>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusInfo = getWithdrawalStatusInfo(status);
                return (
                    <Tag color={statusInfo.color}>
                        {statusInfo.icon} {status?.toUpperCase() || 'N/A'}
                    </Tag>
                );
            },
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => (
                <span>
                    {new Date(date).toLocaleString()}
                </span>
            ),
        },
        {
            title: 'Proof of Payment',
            dataIndex: 'verment_preuve',
            key: 'verment_preuve',
            render: (vermentPreuve) => {
                if (vermentPreuve?.url) {
                    return (
                        <Image
                            src={vermentPreuve.url}
                            alt="Proof of Payment"
                            style={{ width: 40, height: 40, objectFit: 'cover', cursor: 'pointer', borderRadius: '4px' }}
                            preview={{
                                mask: <EyeOutlined />,
                                maskClassName: 'custom-mask',
                                title: 'Proof of Payment',
                            }}
                        />
                    );
                }
                return <Typography.Text type="secondary">N/A</Typography.Text>;
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => {
                const isFinalStatus = ['rejected', 'done'].includes(record.status);
                
                return isAdmin && (
                    <Space size="small">
                        <Tooltip title="View History">
                            <Button
                                type="primary"
                                icon={<HistoryOutlined />}
                                size="small"
                                onClick={() => setHistoryDrawer({ visible: true, withdrawal: record })}
                                style={{ backgroundColor: '#1890ff' }}
                            />
                        </Tooltip>
                        {!isFinalStatus && (
                            <Tooltip title="Update Status">
                                <Button
                                    type="primary"
                                    icon={<EyeOutlined />}
                                    size="small"
                                    onClick={() => showStatusModal(record)}
                                    style={{ backgroundColor: '#52c41a' }}
                                >
                                    Update
                                </Button>
                            </Tooltip>
                        )}
                        {record.status === 'done' && (
                            <Tooltip title="Upload Proof of Payment">
                                <Button
                                    type="primary"
                                    icon={<UploadOutlined />}
                                    size="small"
                                    onClick={() => setUploadModal({ visible: true, withdrawal: record })}
                                >
                                    Upload
                                </Button>
                            </Tooltip>
                        )}
                    </Space>
                );
            },
            width: isAdmin ? 200 : 0,
            className: !isAdmin ? 'hidden-column' : ''
        }
    ];

    // Helper function to get withdrawal status info
    const getWithdrawalStatusInfo = (status) => {
        switch (status) {
            case 'waiting':
                return { color: 'warning', icon: '⏳' };
            case 'seen':
                return { color: 'processing', icon: '👁️' };
            case 'checking':
                return { color: 'processing', icon: '🔍' };
            case 'accepted':
                return { color: 'success', icon: '✅' };
            case 'rejected':
                return { color: 'error', icon: '❌' };
            case 'processing':
                return { color: 'processing', icon: '⚙️' };
            case 'done':
                return { color: 'success', icon: '✨' };
            default:
                return { color: 'default', icon: '❔' };
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
                                Withdrawal Requests {!isAdmin && '(Your Store Only)'}
                            </Typography.Title>
                            <Button
                                type="primary"
                                icon={<ReloadOutlined />}
                                onClick={() => fetchWithdrawals()}
                            >
                                Refresh
                            </Button>
                        </div>

                        {/* Search Form */}
                        <SearchForm />

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '50px' }}>
                                <Spin size="large" />
                            </div>
                        ) : (
                            <Table
                                columns={columns}
                                dataSource={Array.isArray(withdrawals) ? withdrawals : []}
                                rowKey="_id"
                                pagination={pagination}
                                onChange={handleTableChange}
                                scroll={{ x: true }}
                            />
                        )}
                    </div>
                </div>
            </main>

            {/* History Drawer */}
            <Drawer
                title="Withdrawal History"
                placement="right"
                onClose={() => setHistoryDrawer({ visible: false, withdrawal: null })}
                open={historyDrawer.visible}
                width={600}
                extra={
                    <Space>
                        <Button onClick={() => setHistoryDrawer({ visible: false, withdrawal: null })}>
                            Close
                        </Button>
                    </Space>
                }
            >
                {historyDrawer.withdrawal && (
                    <div>
                        <Card 
                            title="Withdrawal Details"
                            bordered={false}
                            className="withdrawal-details-card"
                        >
                            <Space direction="vertical" size={16}>
                                {/* Store Info */}
                                <div>
                                    <Space align="center">
                                        <Avatar icon={<UserOutlined />} />
                                        <div>
                                            <Typography.Title level={5} style={{ margin: 0 }}>
                                                Store Details
                                            </Typography.Title>
                                            <Typography.Text>
                                                {historyDrawer.withdrawal.wallet?.store?.storeName || 'N/A'}
                                            </Typography.Text>
                                            <br />
                                            <Typography.Text copyable={{ text: historyDrawer.withdrawal.wallet?.key }}>
                                                {historyDrawer.withdrawal.wallet?.key}
                                            </Typography.Text>
                                        </div>
                                    </Space>
                                </div>

                                <Divider />

                                {/* Payment Info */}
                                <div>
                                    <Space align="center">
                                        <Avatar icon={<BankOutlined />} />
                                        <div>
                                            <Typography.Title level={5} style={{ margin: 0 }}>
                                                Payment Details
                                            </Typography.Title>
                                            <Typography.Text>
                                                {historyDrawer.withdrawal.payment?.nom || 'N/A'}
                                            </Typography.Text>
                                            <br />
                                            <Typography.Text copyable={{ text: historyDrawer.withdrawal.payment?.rib }}>
                                                {historyDrawer.withdrawal.payment?.rib}
                                            </Typography.Text>
                                        </div>
                                    </Space>
                                </div>

                                <Divider />

                                {/* Amount Info */}
                                <div>
                                    <Space align="center">
                                        <Avatar icon={<WalletOutlined />} />
                                        <div>
                                            <Typography.Title level={5} style={{ margin: 0 }}>
                                                Amount Details
                                            </Typography.Title>
                                            <Space>
                                                <Tag color="green">
                                                    {historyDrawer.withdrawal.montant} DH
                                                </Tag>
                                                <Tag color="orange">
                                                    Fee: {historyDrawer.withdrawal.frais} DH
                                                </Tag>
                                            </Space>
                                        </div>
                                    </Space>
                                </div>
                            </Space>
                        </Card>

                        {/* Status Timeline */}
                        <Card 
                            title="Status History"
                            bordered={false}
                            className="status-timeline-card"
                        >
                            <Timeline
                                mode="left"
                                items={historyDrawer.withdrawal.statusHistory.map((history, index) => ({
                                    color: getWithdrawalStatusInfo(history.status).color,
                                    children: (
                                        <div style={{ padding: '8px 0' }}>
                                            <Space direction="vertical" size={4}>
                                                <Space>
                                                    <Tag color={getWithdrawalStatusInfo(history.status).color}>
                                                        {getWithdrawalStatusInfo(history.status).icon} {history.status.toUpperCase()}
                                                    </Tag>
                                                    <Typography.Text type="secondary">
                                                        {formatDate(history.date)}
                                                    </Typography.Text>
                                                </Space>
                                                <Typography.Text>
                                                    {history.note}
                                                </Typography.Text>
                                            </Space>
                                        </div>
                                    )
                                }))}
                            />
                        </Card>
                    </div>
                )}
            </Drawer>

            {/* Status Update Modal */}
            <Modal
                title="Update Withdrawal Status"
                open={statusModal.visible}
                onCancel={() => {
                    setStatusModal({ visible: false, withdrawal: null });
                    form.resetFields();
                }}
                maskClosable={false}
                footer={null}
                width={800}
            >
                <Form
                    form={form}
                    onFinish={handleStatusUpdate}
                    layout="vertical"
                >
                    <Form.Item
                        label="Current Status"
                        name="currentStatus"
                        initialValue={statusModal.withdrawal?.status}
                    >
                        <Input disabled />
                    </Form.Item>
                    <Form.Item
                        label="New Status"
                        name="status"
                        rules={[{ required: true, message: 'Please select a new status' }]}
                    >
                        <Select>
                            <Select.OptGroup label="Available Statuses">
                                <Select.Option value="waiting">⏳ Waiting</Select.Option>
                                <Select.Option value="seen">👁️ Seen</Select.Option>
                                <Select.Option value="checking">🔍 Checking</Select.Option>
                                <Select.Option value="accepted">✅ Accepted</Select.Option>
                                <Select.Option value="rejected">❌ Rejected</Select.Option>
                                <Select.Option value="processing">⚙️ Processing</Select.Option>
                                <Select.Option value="done">✨ Done</Select.Option>
                            </Select.OptGroup>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Note"
                        name="note"
                        rules={[
                            { min: 10, message: 'Note must be at least 10 characters if provided' }
                        ]}
                    >
                        <Input.TextArea 
                            rows={4} 
                            placeholder="Optional: Add a custom note (minimum 10 characters if provided)"
                        />
                    </Form.Item>
                   
                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <Button onClick={() => {
                                setStatusModal({ visible: false, withdrawal: null });
                                form.resetFields();
                            }}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Update Status
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Upload Modal */}
            <Modal
                title="Upload Proof of Payment"
                open={uploadModal.visible}
                onCancel={() => {
                    setUploadModal({ visible: false, withdrawal: null });
                    form.resetFields();
                }}
                maskClosable={false}
                footer={null}
            >
                <Form
                    form={form}
                    onFinish={handleUpload}
                    layout="vertical"
                >
                    <Form.Item
                        label="Upload Image"
                        name="verment_preuve"
                        valuePropName="fileList"
                        getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
                        rules={[{ required: true, message: 'Please upload an image' }]}
                    >
                        <Upload
                            listType="picture"
                            maxCount={1}
                            beforeUpload={() => false}
                            accept="image/*"
                        >
                            <Button icon={<UploadOutlined />}>Select Image</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <Button onClick={() => {
                                setUploadModal({ visible: false, withdrawal: null });
                                form.resetFields();
                            }}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Upload
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default Withdrawal;