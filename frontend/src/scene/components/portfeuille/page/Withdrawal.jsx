import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import { Table, Tag, Typography, Button, Space, Spin, message, Input, Select, DatePicker, Tooltip, Modal, Form, Timeline, Drawer, Card, Avatar, Divider, Upload, Image } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getAllWithdrawals, updateWithdrawalStatus, uploadVermentPreuve } from '../../../../redux/apiCalls/withdrawalApiCalls';
import { ReloadOutlined, EyeOutlined, HistoryOutlined, UserOutlined, BankOutlined, WalletOutlined, UploadOutlined } from '@ant-design/icons';
import moment from 'moment';
import { toast } from 'react-hot-toast';

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

    const [pagination] = useState({
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
        <Card
            style={{
                marginBottom: '16px',
                backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                borderColor: theme === 'dark' ? '#334155' : '#d9d9d9'
            }}
        >
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
                        style={{ width: 180 }}
                    >
                        <Select.Option value="waiting">
                            <Tag className="tag-status-waiting" style={{ marginRight: '4px' }}>⏳</Tag> Waiting
                        </Select.Option>
                        <Select.Option value="seen">
                            <Tag className="tag-status-seen" style={{ marginRight: '4px' }}>👁️</Tag> Seen
                        </Select.Option>
                        <Select.Option value="checking">
                            <Tag className="tag-status-checking" style={{ marginRight: '4px' }}>🔍</Tag> Checking
                        </Select.Option>
                        <Select.Option value="accepted">
                            <Tag className="tag-status-accepted" style={{ marginRight: '4px' }}>✅</Tag> Accepted
                        </Select.Option>
                        <Select.Option value="rejected">
                            <Tag className="tag-status-rejected" style={{ marginRight: '4px' }}>❌</Tag> Rejected
                        </Select.Option>
                        <Select.Option value="processing">
                            <Tag className="tag-status-processing" style={{ marginRight: '4px' }}>⚙️</Tag> Processing
                        </Select.Option>
                        <Select.Option value="done">
                            <Tag className="tag-status-done" style={{ marginRight: '4px' }}>✨</Tag> Done
                        </Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item name="dateRange">
                    <DatePicker.RangePicker
                        style={{ width: 300 }}
                        format="YYYY-MM-DD"
                    />
                </Form.Item>
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        style={{
                            backgroundColor: theme === 'dark' ? '#1677ff' : '#1890ff',
                            borderColor: theme === 'dark' ? '#1677ff' : '#1890ff'
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={handleReset}
                        style={{
                            marginLeft: 8,
                            backgroundColor: theme === 'dark' ? '#374151' : '#fff',
                            borderColor: theme === 'dark' ? '#4b5563' : '#d9d9d9',
                            color: theme === 'dark' ? '#e2e8f0' : '#000'
                        }}
                    >
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
                    <Tag className="tag-store">
                        {wallet?.store?.storeName || 'N/A'}
                    </Tag>
                    {isAdmin && (
                        <Typography.Text
                            copyable={{ text: wallet?.key }}
                            className="secondary-text"
                            style={{
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
                    <Tag className="tag-payment">
                        {payment?.nom || 'N/A'}
                    </Tag>
                    <Typography.Text copyable={{ text: payment?.rib }}>
                        <small className="secondary-text">
                            {payment?.rib || 'N/A'}
                        </small>
                    </Typography.Text>
                    <Tag className="tag-bank">
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
                    <Tag className="tag-amount">
                        {montant} DH
                    </Tag>
                    <div>
                        <span className="secondary-text">Fee: </span>
                        <Tag className="tag-fee">{record.frais} DH</Tag>
                    </div>
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
                    <Tag className={`tag-status-${status}`}>
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
                    <style>
                        {`
                          /* Global Input Styling Fix */
                          .ant-input,
                          .ant-input-affix-wrapper,
                          .ant-textarea {
                            background-color: ${theme === 'dark' ? '#1e293b' : '#fff'} !important;
                            border-color: ${theme === 'dark' ? '#334155' : '#d9d9d9'} !important;
                            color: ${theme === 'dark' ? '#e2e8f0' : '#000'} !important;
                          }

                          .ant-input::placeholder,
                          .ant-input-affix-wrapper::placeholder,
                          .ant-textarea::placeholder {
                            color: ${theme === 'dark' ? '#94a3b8' : '#8c8c8c'} !important;
                          }

                          .ant-input:focus,
                          .ant-input-affix-wrapper:focus,
                          .ant-input-affix-wrapper-focused {
                            border-color: ${theme === 'dark' ? '#60a5fa' : '#1890ff'} !important;
                            box-shadow: 0 0 0 2px ${theme === 'dark' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(24, 144, 255, 0.2)'} !important;
                          }

                          .ant-input-clear-icon {
                            color: ${theme === 'dark' ? '#94a3b8' : '#8c8c8c'} !important;
                          }

                          /* Select dropdown styling */
                          .ant-select-dropdown {
                            background-color: ${theme === 'dark' ? '#1e293b' : '#fff'} !important;
                            border: 1px solid ${theme === 'dark' ? '#334155' : '#d9d9d9'} !important;
                          }

                          .ant-select-item {
                            background-color: ${theme === 'dark' ? '#1e293b' : '#fff'} !important;
                            color: ${theme === 'dark' ? '#e2e8f0' : '#000'} !important;
                          }

                          .ant-select-item:hover {
                            background-color: ${theme === 'dark' ? '#334155' : '#f5f5f5'} !important;
                          }

                          .ant-select-item-option-selected {
                            background-color: ${theme === 'dark' ? '#60a5fa' : '#1890ff'} !important;
                            color: #fff !important;
                          }

                          .ant-select-item-option-active {
                            background-color: ${theme === 'dark' ? '#334155' : '#f5f5f5'} !important;
                          }

                          /* Select input styling */
                          .ant-select:not(.ant-select-customize-input) .ant-select-selector {
                            background-color: ${theme === 'dark' ? '#1e293b' : '#fff'} !important;
                            border-color: ${theme === 'dark' ? '#334155' : '#d9d9d9'} !important;
                            color: ${theme === 'dark' ? '#e2e8f0' : '#000'} !important;
                          }

                          .ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector {
                            border-color: ${theme === 'dark' ? '#60a5fa' : '#1890ff'} !important;
                            box-shadow: 0 0 0 2px ${theme === 'dark' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(24, 144, 255, 0.2)'} !important;
                          }

                          .ant-select-selection-placeholder {
                            color: ${theme === 'dark' ? '#94a3b8' : '#8c8c8c'} !important;
                          }

                          .ant-select-selection-item {
                            color: ${theme === 'dark' ? '#e2e8f0' : '#000'} !important;
                          }

                          .ant-select-arrow {
                            color: ${theme === 'dark' ? '#94a3b8' : '#8c8c8c'} !important;
                          }

                          .ant-select-clear {
                            background-color: ${theme === 'dark' ? '#1e293b' : '#fff'} !important;
                            color: ${theme === 'dark' ? '#94a3b8' : '#8c8c8c'} !important;
                          }

                          /* Select multiple styling */
                          .ant-select-multiple .ant-select-selection-item {
                            background-color: ${theme === 'dark' ? '#374151' : '#f0f0f0'} !important;
                            border-color: ${theme === 'dark' ? '#4b5563' : '#d9d9d9'} !important;
                            color: ${theme === 'dark' ? '#e2e8f0' : '#000'} !important;
                          }

                          .ant-select-multiple .ant-select-selection-item-remove {
                            color: ${theme === 'dark' ? '#94a3b8' : '#8c8c8c'} !important;
                          }

                          /* Select group styling */
                          .ant-select-item-group {
                            color: ${theme === 'dark' ? '#94a3b8' : '#8c8c8c'} !important;
                          }

                          /* Date Picker styling */
                          .ant-picker,
                          .ant-picker-input > input {
                            background-color: ${theme === 'dark' ? '#1e293b' : '#fff'} !important;
                            border-color: ${theme === 'dark' ? '#334155' : '#d9d9d9'} !important;
                            color: ${theme === 'dark' ? '#e2e8f0' : '#000'} !important;
                          }

                          .ant-picker:hover,
                          .ant-picker-focused {
                            border-color: ${theme === 'dark' ? '#60a5fa' : '#1890ff'} !important;
                          }

                          .ant-picker-focused {
                            box-shadow: 0 0 0 2px ${theme === 'dark' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(24, 144, 255, 0.2)'} !important;
                          }

                          .ant-picker-dropdown {
                            background-color: ${theme === 'dark' ? '#1e293b' : '#fff'} !important;
                          }

                          .ant-picker-panel {
                            background-color: ${theme === 'dark' ? '#1e293b' : '#fff'} !important;
                            border-color: ${theme === 'dark' ? '#334155' : '#d9d9d9'} !important;
                          }

                          .ant-picker-header {
                            border-bottom-color: ${theme === 'dark' ? '#334155' : '#f0f0f0'} !important;
                          }

                          .ant-picker-header button {
                            color: ${theme === 'dark' ? '#e2e8f0' : '#000'} !important;
                          }

                          .ant-picker-content th,
                          .ant-picker-content td {
                            color: ${theme === 'dark' ? '#e2e8f0' : '#000'} !important;
                          }

                          .ant-picker-cell:hover .ant-picker-cell-inner {
                            background-color: ${theme === 'dark' ? '#334155' : '#f5f5f5'} !important;
                          }

                          .ant-picker-cell-selected .ant-picker-cell-inner {
                            background-color: ${theme === 'dark' ? '#60a5fa' : '#1890ff'} !important;
                          }

                          .ant-picker-today .ant-picker-cell-inner {
                            border-color: ${theme === 'dark' ? '#60a5fa' : '#1890ff'} !important;
                          }

                          /* Card styling */
                          .page-content .ant-card {
                            background-color: ${theme === 'dark' ? '#1e293b' : '#fff'} !important;
                            border-color: ${theme === 'dark' ? '#334155' : '#d9d9d9'} !important;
                            color: ${theme === 'dark' ? '#e2e8f0' : '#000'} !important;
                          }

                          .page-content .ant-card-head {
                            background-color: ${theme === 'dark' ? '#0f172a' : '#fafafa'} !important;
                            border-bottom-color: ${theme === 'dark' ? '#334155' : '#f0f0f0'} !important;
                          }

                          .page-content .ant-card-head-title {
                            color: ${theme === 'dark' ? '#e2e8f0' : '#000'} !important;
                          }

                          /* Table styling */
                          .page-content .ant-table {
                            background-color: ${theme === 'dark' ? '#1e293b' : '#fff'} !important;
                            color: ${theme === 'dark' ? '#e2e8f0' : '#000'} !important;
                          }

                          .page-content .ant-table-thead > tr > th {
                            background-color: ${theme === 'dark' ? '#0f172a' : '#fafafa'} !important;
                            color: ${theme === 'dark' ? '#e2e8f0' : '#000'} !important;
                            border-bottom-color: ${theme === 'dark' ? '#334155' : '#f0f0f0'} !important;
                          }

                          .page-content .ant-table-tbody > tr > td {
                            background-color: ${theme === 'dark' ? '#1e293b' : '#fff'} !important;
                            color: ${theme === 'dark' ? '#e2e8f0' : '#000'} !important;
                            border-bottom-color: ${theme === 'dark' ? '#334155' : '#f0f0f0'} !important;
                          }

                          .page-content .ant-table-tbody > tr:hover > td {
                            background-color: ${theme === 'dark' ? '#334155' : '#f5f5f5'} !important;
                          }

                          /* Modal styling */
                          .ant-modal-content {
                            background-color: ${theme === 'dark' ? '#1e293b' : '#fff'} !important;
                            color: ${theme === 'dark' ? '#e2e8f0' : '#000'} !important;
                          }

                          .ant-modal-header {
                            background-color: ${theme === 'dark' ? '#0f172a' : '#fff'} !important;
                            border-bottom-color: ${theme === 'dark' ? '#334155' : '#f0f0f0'} !important;
                          }

                          .ant-modal-title {
                            color: ${theme === 'dark' ? '#e2e8f0' : '#000'} !important;
                          }

                          .ant-modal-close-x {
                            color: ${theme === 'dark' ? '#e2e8f0' : '#000'} !important;
                          }

                          /* Drawer styling */
                          .ant-drawer-content {
                            background-color: ${theme === 'dark' ? '#1e293b' : '#fff'} !important;
                            color: ${theme === 'dark' ? '#e2e8f0' : '#000'} !important;
                          }

                          .ant-drawer-header {
                            background-color: ${theme === 'dark' ? '#0f172a' : '#fff'} !important;
                            border-bottom-color: ${theme === 'dark' ? '#334155' : '#f0f0f0'} !important;
                          }

                          .ant-drawer-title {
                            color: ${theme === 'dark' ? '#e2e8f0' : '#000'} !important;
                          }

                          .ant-drawer-close {
                            color: ${theme === 'dark' ? '#e2e8f0' : '#000'} !important;
                          }

                          /* Form labels */
                          .ant-form-item-label > label {
                            color: ${theme === 'dark' ? '#e2e8f0' : '#000'} !important;
                          }

                          .ant-form-item-required::before {
                            color: ${theme === 'dark' ? '#ef4444' : '#ff4d4f'} !important;
                          }

                          /* Typography */
                          .page-content .ant-typography {
                            color: ${theme === 'dark' ? '#e2e8f0' : '#000'} !important;
                          }

                          .page-content .ant-typography-caption {
                            color: ${theme === 'dark' ? '#94a3b8' : '#8c8c8c'} !important;
                          }

                          /* Timeline styling */
                          .page-content .ant-timeline-item-head {
                            background-color: ${theme === 'dark' ? '#1e293b' : '#fff'} !important;
                          }

                          .page-content .ant-timeline-item-content {
                            color: ${theme === 'dark' ? '#e2e8f0' : '#000'} !important;
                          }

                          /* Upload styling */
                          .page-content .ant-upload {
                            background-color: ${theme === 'dark' ? '#1e293b' : '#fff'} !important;
                            border-color: ${theme === 'dark' ? '#334155' : '#d9d9d9'} !important;
                          }

                          .page-content .ant-upload-list {
                            background-color: ${theme === 'dark' ? '#1e293b' : '#fff'} !important;
                          }

                          /* Divider styling */
                          .page-content .ant-divider {
                            border-color: ${theme === 'dark' ? '#334155' : '#f0f0f0'} !important;
                          }

                          /* Professional Tag Styling */
                          .page-content .ant-tag {
                            border: none !important;
                            border-radius: 4px !important;
                            font-weight: 500 !important;
                            font-size: 12px !important;
                            padding: 4px 8px !important;
                            margin: 2px !important;
                          }

                          /* Store Tags */
                          .page-content .tag-store {
                            background-color: ${theme === 'dark' ? '#1e40af' : '#3b82f6'} !important;
                            color: #ffffff !important;
                          }

                          /* Payment Tags */
                          .page-content .tag-payment {
                            background-color: ${theme === 'dark' ? '#0f766e' : '#14b8a6'} !important;
                            color: #ffffff !important;
                          }

                          /* Bank Tags */
                          .page-content .tag-bank {
                            background-color: ${theme === 'dark' ? '#7c3aed' : '#8b5cf6'} !important;
                            color: #ffffff !important;
                          }

                          /* Amount Tags */
                          .page-content .tag-amount {
                            background-color: ${theme === 'dark' ? '#059669' : '#10b981'} !important;
                            color: #ffffff !important;
                          }

                          /* Fee Tags */
                          .page-content .tag-fee {
                            background-color: ${theme === 'dark' ? '#d97706' : '#f59e0b'} !important;
                            color: #ffffff !important;
                          }

                          /* Status Tags */
                          .page-content .tag-status-waiting {
                            background-color: ${theme === 'dark' ? '#d97706' : '#f59e0b'} !important;
                            color: #ffffff !important;
                          }

                          .page-content .tag-status-seen {
                            background-color: ${theme === 'dark' ? '#0ea5e9' : '#06b6d4'} !important;
                            color: #ffffff !important;
                          }

                          .page-content .tag-status-checking {
                            background-color: ${theme === 'dark' ? '#6366f1' : '#8b5cf6'} !important;
                            color: #ffffff !important;
                          }

                          .page-content .tag-status-accepted {
                            background-color: ${theme === 'dark' ? '#059669' : '#10b981'} !important;
                            color: #ffffff !important;
                          }

                          .page-content .tag-status-rejected {
                            background-color: ${theme === 'dark' ? '#dc2626' : '#ef4444'} !important;
                            color: #ffffff !important;
                          }

                          .page-content .tag-status-processing {
                            background-color: ${theme === 'dark' ? '#7c3aed' : '#8b5cf6'} !important;
                            color: #ffffff !important;
                          }

                          .page-content .tag-status-done {
                            background-color: ${theme === 'dark' ? '#059669' : '#10b981'} !important;
                            color: #ffffff !important;
                          }

                          /* Secondary text styling */
                          .page-content .secondary-text {
                            color: ${theme === 'dark' ? '#94a3b8' : '#64748b'} !important;
                            font-size: 12px !important;
                          }
                        `}
                    </style>
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <Typography.Title
                                level={4}
                                style={{
                                    color: theme === 'dark' ? '#e2e8f0' : '#000',
                                    margin: 0
                                }}
                            >
                                Withdrawal Requests {!isAdmin && '(Your Store Only)'}
                            </Typography.Title>
                            <Button
                                type="primary"
                                icon={<ReloadOutlined />}
                                onClick={() => fetchWithdrawals()}
                                style={{
                                    backgroundColor: theme === 'dark' ? '#1677ff' : '#1890ff',
                                    borderColor: theme === 'dark' ? '#1677ff' : '#1890ff'
                                }}
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
                                style={{
                                    backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                                    borderRadius: '8px',
                                    overflow: 'hidden'
                                }}
                            />
                        )}
                    </div>
                </div>
            </main>

            {/* History Drawer */}
            <Drawer
                title={
                    <span style={{ color: theme === 'dark' ? '#e2e8f0' : '#000' }}>
                        Withdrawal History
                    </span>
                }
                placement="right"
                onClose={() => setHistoryDrawer({ visible: false, withdrawal: null })}
                open={historyDrawer.visible}
                width={600}
                style={{
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#fff'
                }}
                headerStyle={{
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#fff',
                    borderBottom: `1px solid ${theme === 'dark' ? '#334155' : '#f0f0f0'}`
                }}
                bodyStyle={{
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                    padding: '24px'
                }}
                extra={
                    <Space>
                        <Button
                            onClick={() => setHistoryDrawer({ visible: false, withdrawal: null })}
                            style={{
                                backgroundColor: theme === 'dark' ? '#374151' : '#fff',
                                borderColor: theme === 'dark' ? '#4b5563' : '#d9d9d9',
                                color: theme === 'dark' ? '#e2e8f0' : '#000'
                            }}
                        >
                            Close
                        </Button>
                    </Space>
                }
            >
                {historyDrawer.withdrawal && (
                    <div>
                        <Card
                            title={
                                <span style={{ color: theme === 'dark' ? '#e2e8f0' : '#000' }}>
                                    Withdrawal Details
                                </span>
                            }
                            bordered={true}
                            className="withdrawal-details-card"
                            style={{
                                backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                                borderColor: theme === 'dark' ? '#334155' : '#d9d9d9',
                                marginBottom: '16px'
                            }}
                            headStyle={{
                                backgroundColor: theme === 'dark' ? '#0f172a' : '#fafafa',
                                borderBottom: `1px solid ${theme === 'dark' ? '#334155' : '#f0f0f0'}`
                            }}
                        >
                            <Space direction="vertical" size={16}>
                                {/* Store Info */}
                                <div>
                                    <Space align="center">
                                        <Avatar
                                            icon={<UserOutlined />}
                                            style={{
                                                backgroundColor: theme === 'dark' ? '#1e40af' : '#3b82f6'
                                            }}
                                        />
                                        <div>
                                            <Typography.Title
                                                level={5}
                                                style={{
                                                    margin: 0,
                                                    color: theme === 'dark' ? '#e2e8f0' : '#000'
                                                }}
                                            >
                                                Store Details
                                            </Typography.Title>
                                            <Typography.Text style={{ color: theme === 'dark' ? '#e2e8f0' : '#000' }}>
                                                {historyDrawer.withdrawal.wallet?.store?.storeName || 'N/A'}
                                            </Typography.Text>
                                            <br />
                                            <Typography.Text
                                                copyable={{ text: historyDrawer.withdrawal.wallet?.key }}
                                                className="secondary-text"
                                            >
                                                {historyDrawer.withdrawal.wallet?.key}
                                            </Typography.Text>
                                        </div>
                                    </Space>
                                </div>

                                <Divider style={{ borderColor: theme === 'dark' ? '#334155' : '#f0f0f0' }} />

                                {/* Payment Info */}
                                <div>
                                    <Space align="center">
                                        <Avatar
                                            icon={<BankOutlined />}
                                            style={{
                                                backgroundColor: theme === 'dark' ? '#0f766e' : '#14b8a6'
                                            }}
                                        />
                                        <div>
                                            <Typography.Title
                                                level={5}
                                                style={{
                                                    margin: 0,
                                                    color: theme === 'dark' ? '#e2e8f0' : '#000'
                                                }}
                                            >
                                                Payment Details
                                            </Typography.Title>
                                            <Typography.Text style={{ color: theme === 'dark' ? '#e2e8f0' : '#000' }}>
                                                {historyDrawer.withdrawal.payment?.nom || 'N/A'}
                                            </Typography.Text>
                                            <br />
                                            <Typography.Text
                                                copyable={{ text: historyDrawer.withdrawal.payment?.rib }}
                                                className="secondary-text"
                                            >
                                                {historyDrawer.withdrawal.payment?.rib}
                                            </Typography.Text>
                                        </div>
                                    </Space>
                                </div>

                                <Divider style={{ borderColor: theme === 'dark' ? '#334155' : '#f0f0f0' }} />

                                {/* Amount Info */}
                                <div>
                                    <Space align="center">
                                        <Avatar
                                            icon={<WalletOutlined />}
                                            style={{
                                                backgroundColor: theme === 'dark' ? '#059669' : '#10b981'
                                            }}
                                        />
                                        <div>
                                            <Typography.Title
                                                level={5}
                                                style={{
                                                    margin: 0,
                                                    color: theme === 'dark' ? '#e2e8f0' : '#000'
                                                }}
                                            >
                                                Amount Details
                                            </Typography.Title>
                                            <Space>
                                                <Tag className="tag-amount">
                                                    {historyDrawer.withdrawal.montant} DH
                                                </Tag>
                                                <Tag className="tag-fee">
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
                            title={
                                <span style={{ color: theme === 'dark' ? '#e2e8f0' : '#000' }}>
                                    Status History
                                </span>
                            }
                            bordered={true}
                            className="status-timeline-card"
                            style={{
                                backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                                borderColor: theme === 'dark' ? '#334155' : '#d9d9d9'
                            }}
                            headStyle={{
                                backgroundColor: theme === 'dark' ? '#0f172a' : '#fafafa',
                                borderBottom: `1px solid ${theme === 'dark' ? '#334155' : '#f0f0f0'}`
                            }}
                        >
                            <Timeline
                                mode="left"
                                items={historyDrawer.withdrawal.statusHistory.map((history) => ({
                                    color: getWithdrawalStatusInfo(history.status).color,
                                    children: (
                                        <div style={{ padding: '8px 0' }}>
                                            <Space direction="vertical" size={4}>
                                                <Space>
                                                    <Tag className={`tag-status-${history.status}`}>
                                                        {getWithdrawalStatusInfo(history.status).icon} {history.status.toUpperCase()}
                                                    </Tag>
                                                    <Typography.Text className="secondary-text">
                                                        {formatDate(history.date)}
                                                    </Typography.Text>
                                                </Space>
                                                <Typography.Text style={{ color: theme === 'dark' ? '#e2e8f0' : '#000' }}>
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
                title={
                    <span style={{ color: theme === 'dark' ? '#e2e8f0' : '#000' }}>
                        Update Withdrawal Status
                    </span>
                }
                open={statusModal.visible}
                onCancel={() => {
                    setStatusModal({ visible: false, withdrawal: null });
                    form.resetFields();
                }}
                maskClosable={false}
                footer={null}
                width={800}
                style={{
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#fff'
                }}
                styles={{
                    header: {
                        backgroundColor: theme === 'dark' ? '#0f172a' : '#fff',
                        borderBottom: `1px solid ${theme === 'dark' ? '#334155' : '#f0f0f0'}`
                    },
                    body: {
                        backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                        padding: '24px'
                    }
                }}
            >
                <Form
                    form={form}
                    onFinish={handleStatusUpdate}
                    layout="vertical"
                    style={{
                        backgroundColor: theme === 'dark' ? '#1e293b' : '#fff'
                    }}
                >
                    <Form.Item
                        label={
                            <span style={{ color: theme === 'dark' ? '#e2e8f0' : '#000' }}>
                                Current Status
                            </span>
                        }
                        name="currentStatus"
                        initialValue={statusModal.withdrawal?.status}
                    >
                        <div style={{ marginBottom: '8px' }}>
                            {statusModal.withdrawal?.status && (
                                <Tag className={`tag-status-${statusModal.withdrawal.status}`}>
                                    {getWithdrawalStatusInfo(statusModal.withdrawal.status).icon} {statusModal.withdrawal.status.toUpperCase()}
                                </Tag>
                            )}
                        </div>
                    </Form.Item>
                    <Form.Item
                        label={
                            <span style={{ color: theme === 'dark' ? '#e2e8f0' : '#000' }}>
                                New Status
                            </span>
                        }
                        name="status"
                        rules={[{ required: true, message: 'Please select a new status' }]}
                    >
                        <Select placeholder="Select new status">
                            <Select.OptGroup label="Available Statuses">
                                <Select.Option value="waiting">
                                    <Tag className="tag-status-waiting" style={{ marginRight: '8px' }}>⏳ Waiting</Tag>
                                </Select.Option>
                                <Select.Option value="seen">
                                    <Tag className="tag-status-seen" style={{ marginRight: '8px' }}>👁️ Seen</Tag>
                                </Select.Option>
                                <Select.Option value="checking">
                                    <Tag className="tag-status-checking" style={{ marginRight: '8px' }}>🔍 Checking</Tag>
                                </Select.Option>
                                <Select.Option value="accepted">
                                    <Tag className="tag-status-accepted" style={{ marginRight: '8px' }}>✅ Accepted</Tag>
                                </Select.Option>
                                <Select.Option value="rejected">
                                    <Tag className="tag-status-rejected" style={{ marginRight: '8px' }}>❌ Rejected</Tag>
                                </Select.Option>
                                <Select.Option value="processing">
                                    <Tag className="tag-status-processing" style={{ marginRight: '8px' }}>⚙️ Processing</Tag>
                                </Select.Option>
                                <Select.Option value="done">
                                    <Tag className="tag-status-done" style={{ marginRight: '8px' }}>✨ Done</Tag>
                                </Select.Option>
                            </Select.OptGroup>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label={
                            <span style={{ color: theme === 'dark' ? '#e2e8f0' : '#000' }}>
                                Note
                            </span>
                        }
                        name="note"
                        rules={[
                            { min: 10, message: 'Note must be at least 10 characters if provided' }
                        ]}
                    >
                        <Input.TextArea
                            rows={4}
                            placeholder="Optional: Add a custom note (minimum 10 characters if provided)"
                            style={{
                                backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                                borderColor: theme === 'dark' ? '#334155' : '#d9d9d9',
                                color: theme === 'dark' ? '#e2e8f0' : '#000'
                            }}
                        />
                    </Form.Item>

                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <Button
                                onClick={() => {
                                    setStatusModal({ visible: false, withdrawal: null });
                                    form.resetFields();
                                }}
                                style={{
                                    backgroundColor: theme === 'dark' ? '#374151' : '#fff',
                                    borderColor: theme === 'dark' ? '#4b5563' : '#d9d9d9',
                                    color: theme === 'dark' ? '#e2e8f0' : '#000'
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{
                                    backgroundColor: theme === 'dark' ? '#1677ff' : '#1890ff',
                                    borderColor: theme === 'dark' ? '#1677ff' : '#1890ff'
                                }}
                            >
                                Update Status
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Upload Modal */}
            <Modal
                title={
                    <span style={{ color: theme === 'dark' ? '#e2e8f0' : '#000' }}>
                        Upload Proof of Payment
                    </span>
                }
                open={uploadModal.visible}
                onCancel={() => {
                    setUploadModal({ visible: false, withdrawal: null });
                    form.resetFields();
                }}
                maskClosable={false}
                footer={null}
                style={{
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#fff'
                }}
                styles={{
                    header: {
                        backgroundColor: theme === 'dark' ? '#0f172a' : '#fff',
                        borderBottom: `1px solid ${theme === 'dark' ? '#334155' : '#f0f0f0'}`
                    },
                    body: {
                        backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                        padding: '24px'
                    }
                }}
            >
                <Form
                    form={form}
                    onFinish={handleUpload}
                    layout="vertical"
                    style={{
                        backgroundColor: theme === 'dark' ? '#1e293b' : '#fff'
                    }}
                >
                    <Form.Item
                        label={
                            <span style={{ color: theme === 'dark' ? '#e2e8f0' : '#000' }}>
                                Upload Image
                            </span>
                        }
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
                            style={{
                                backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                                borderColor: theme === 'dark' ? '#334155' : '#d9d9d9'
                            }}
                        >
                            <Button
                                icon={<UploadOutlined />}
                                style={{
                                    backgroundColor: theme === 'dark' ? '#374151' : '#fff',
                                    borderColor: theme === 'dark' ? '#4b5563' : '#d9d9d9',
                                    color: theme === 'dark' ? '#e2e8f0' : '#000'
                                }}
                            >
                                Select Image
                            </Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <Button
                                onClick={() => {
                                    setUploadModal({ visible: false, withdrawal: null });
                                    form.resetFields();
                                }}
                                style={{
                                    backgroundColor: theme === 'dark' ? '#374151' : '#fff',
                                    borderColor: theme === 'dark' ? '#4b5563' : '#d9d9d9',
                                    color: theme === 'dark' ? '#e2e8f0' : '#000'
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{
                                    backgroundColor: theme === 'dark' ? '#1677ff' : '#1890ff',
                                    borderColor: theme === 'dark' ? '#1677ff' : '#1890ff'
                                }}
                            >
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