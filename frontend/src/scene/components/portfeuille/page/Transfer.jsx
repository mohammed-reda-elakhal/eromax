import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import { Table, Typography, Button, Space, Spin, message, Input, Select, DatePicker, Popconfirm, Tooltip, Modal, Form, InputNumber } from 'antd';
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
        endDate: '',
        transferType: '',
        manualOnly: ''
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
            endDate: '',
            transferType: '',
            manualOnly: ''
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
        <div
            style={{
                backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fafafa',
                border: `1px solid ${theme === 'dark' ? '#303030' : '#d9d9d9'}`,
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
            }}
        >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Space wrap size="middle">
                    {isAdmin && (
                        <>
                            <Input
                                placeholder="Enter store name..."
                                value={searchParams.storeName}
                                onChange={(e) => setSearchParams({ ...searchParams, storeName: e.target.value })}
                                style={{
                                    width: 200,
                                    backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                                    borderColor: theme === 'dark' ? '#434343' : '#d9d9d9',
                                    color: theme === 'dark' ? '#fff' : '#000'
                                }}
                                prefix={<SearchOutlined style={{ color: theme === 'dark' ? '#8c8c8c' : '#bfbfbf' }} />}
                                allowClear
                            />
                            <Input
                                placeholder="Enter wallet key..."
                                value={searchParams.walletKey}
                                onChange={(e) => setSearchParams({ ...searchParams, walletKey: e.target.value })}
                                style={{
                                    width: 200,
                                    backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                                    borderColor: theme === 'dark' ? '#434343' : '#d9d9d9',
                                    color: theme === 'dark' ? '#fff' : '#000'
                                }}
                                prefix={<SearchOutlined style={{ color: theme === 'dark' ? '#8c8c8c' : '#bfbfbf' }} />}
                                allowClear
                            />
                        </>
                    )}
                    <Input
                        placeholder="Enter tracking code..."
                        value={searchParams.codeSuivi}
                        onChange={(e) => setSearchParams({ ...searchParams, codeSuivi: e.target.value })}
                        style={{
                            width: 200,
                            backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                            borderColor: theme === 'dark' ? '#434343' : '#d9d9d9',
                            color: theme === 'dark' ? '#fff' : '#000'
                        }}
                        prefix={<SearchOutlined style={{ color: theme === 'dark' ? '#8c8c8c' : '#bfbfbf' }} />}
                        allowClear
                    />
                    <Select
                        placeholder="Select transfer status..."
                        value={searchParams.transferStatus}
                        onChange={(value) => setSearchParams({ ...searchParams, transferStatus: value })}
                        style={{
                            width: 200
                        }}
                        dropdownStyle={{
                            backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                            border: `1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'}`
                        }}
                        allowClear
                    >
                        <Select.OptGroup label="Transfer Status">
                            <Select.Option value="validé">Validé</Select.Option>
                            <Select.Option value="corrigé">Corrigé</Select.Option>
                            <Select.Option value="annuler">Annulé</Select.Option>
                            <Select.Option value="pending">En attente</Select.Option>
                        </Select.OptGroup>
                    </Select>
                    <Select
                        placeholder="Select delivery status..."
                        value={searchParams.colisStatus}
                        onChange={(value) => setSearchParams({ ...searchParams, colisStatus: value })}
                        style={{
                            width: 200
                        }}
                        dropdownStyle={{
                            backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                            border: `1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'}`
                        }}
                        allowClear
                    >
                        <Select.OptGroup label="Delivery Status">
                            <Select.Option value="Livrée">Livrée</Select.Option>
                            <Select.Option value="Refusée">Refusée</Select.Option>
                        </Select.OptGroup>
                    </Select>
                    <Select
                        placeholder="Select transfer type..."
                        value={searchParams.transferType}
                        onChange={(value) => setSearchParams({ ...searchParams, transferType: value })}
                        style={{
                            width: 200
                        }}
                        dropdownStyle={{
                            backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                            border: `1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'}`
                        }}
                        allowClear
                    >
                        <Select.OptGroup label="Transfer Type">
                            <Select.Option value="Deposit">Deposit</Select.Option>
                            <Select.Option value="Correction">Correction</Select.Option>
                            <Select.Option value="Manuel Depot">Manuel Depot</Select.Option>
                            <Select.Option value="Manuel Withdrawal">Manuel Withdrawal</Select.Option>
                            <Select.Option value="withdrawal">Withdrawal</Select.Option>
                        </Select.OptGroup>
                    </Select>
                    <Select
                        placeholder="Manual transfers only..."
                        value={searchParams.manualOnly}
                        onChange={(value) => setSearchParams({ ...searchParams, manualOnly: value })}
                        style={{
                            width: 200
                        }}
                        dropdownStyle={{
                            backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                            border: `1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'}`
                        }}
                        allowClear
                    >
                        <Select.Option value="true">Show manual transfers only</Select.Option>
                    </Select>
                    <RangePicker
                        placeholder={['Start date', 'End date']}
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
                        style={{
                            width: 300,
                            backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                            borderColor: theme === 'dark' ? '#434343' : '#d9d9d9'
                        }}
                    />
                    <Button
                        type="primary"
                        onClick={handleSearch}
                        icon={<SearchOutlined />}
                        style={{
                            backgroundColor: theme === 'dark' ? '#1890ff' : '#1890ff',
                            borderColor: theme === 'dark' ? '#1890ff' : '#1890ff'
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={handleReset}
                        style={{
                            backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                            borderColor: theme === 'dark' ? '#434343' : '#d9d9d9',
                            color: theme === 'dark' ? '#fff' : '#000'
                        }}
                    >
                        Reset
                    </Button>
                </Space>
                {(searchParams.startDate || searchParams.endDate) && (
                    <div style={{
                        fontSize: '12px',
                        color: theme === 'dark' ? '#8c8c8c' : '#666',
                        padding: '8px 0',
                        borderTop: `1px solid ${theme === 'dark' ? '#303030' : '#f0f0f0'}`,
                        marginTop: '8px',
                        paddingTop: '8px'
                    }}>
                        Selected period: {formatDate(searchParams.startDate)} - {formatDate(searchParams.endDate)}
                    </div>
                )}
            </Space>
        </div>
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
            width: 180,
            render: (wallet) => (
                <div style={{ padding: '4px 0' }}>
                    <div style={{
                        fontWeight: '500',
                        fontSize: '13px',
                        color: theme === 'dark' ? '#fff' : '#262626',
                        marginBottom: '4px'
                    }}>
                        {wallet?.store?.storeName || 'N/A'}
                    </div>
                    {isAdmin && (
                        <Typography.Text
                            copyable={{ text: wallet?.key }}
                            style={{
                                fontSize: '11px',
                                color: theme === 'dark' ? '#8c8c8c' : '#666',
                                fontFamily: 'monospace',
                                display: 'block',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '150px'
                            }}
                            title={wallet?.key}
                        >
                            {wallet?.key}
                        </Typography.Text>
                    )}
                </div>
            ),
        },
        {
            title: 'Code / Info',
            dataIndex: 'colis',
            key: 'colis',
            width: 200,
            render: (colis, record) => {
                // Check if it's a manual transfer or withdrawal
                const isManualTransfer = record.type === 'Manuel Depot' || record.type === 'Manuel Withdrawal';
                const isWithdrawal = record.type === 'withdrawal';

                if (isManualTransfer) {
                    return (
                        <div style={{ padding: '4px 0' }}>
                            <div style={{
                                fontSize: '12px',
                                fontWeight: '500',
                                color: theme === 'dark' ? '#d4b106' : '#722ed1',
                                marginBottom: '4px'
                            }}>
                                Admin: {record.admin?.nom || 'Admin'}
                            </div>
                            <div style={{
                                fontSize: '11px',
                                color: theme === 'dark' ? '#8c8c8c' : '#666',
                                lineHeight: '1.4',
                                maxWidth: '180px',
                                whiteSpace: 'normal'
                            }}>
                                {record.commentaire || 'No comment'}
                            </div>
                        </div>
                    );
                }

                if (isWithdrawal) {
                    return (
                        <div style={{ padding: '4px 0' }}>
                            <div style={{
                                fontSize: '12px',
                                fontWeight: '500',
                                color: theme === 'dark' ? '#fa8c16' : '#fa8c16',
                                marginBottom: '4px'
                            }}>
                                Store: {record.wallet?.store?.storeName || 'Store'}
                            </div>
                            <div style={{
                                fontSize: '11px',
                                color: theme === 'dark' ? '#8c8c8c' : '#666',
                                lineHeight: '1.4',
                                maxWidth: '180px',
                                whiteSpace: 'normal'
                            }}>
                                {record.commentaire || 'No comment'}
                            </div>
                        </div>
                    );
                }

                // Regular colis display for non-manual transfers
                return (
                    <div style={{ padding: '4px 0' }}>
                        <Typography.Text
                            copyable={{ text: colis?.code_suivi }}
                            style={{
                                fontSize: '12px',
                                fontFamily: 'monospace',
                                fontWeight: '500',
                                color: theme === 'dark' ? '#1890ff' : '#1890ff',
                                display: 'block',
                                marginBottom: '4px'
                            }}
                        >
                            {colis?.code_suivi || 'N/A'}
                        </Typography.Text>
                        <div style={{
                            fontSize: '11px',
                            color: theme === 'dark' ? '#8c8c8c' : '#666'
                        }}>
                            Status: <span style={{
                                color: getColisStatusColor(colis?.statu_final) === 'success' ? '#52c41a' :
                                       getColisStatusColor(colis?.statu_final) === 'error' ? '#ff4d4f' :
                                       getColisStatusColor(colis?.statu_final) === 'warning' ? '#faad14' :
                                       theme === 'dark' ? '#8c8c8c' : '#666',
                                fontWeight: '500'
                            }}>
                                {colis?.statu_final || 'N/A'}
                            </span>
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Amount',
            dataIndex: 'montant',
            key: 'montant',
            width: 120,
            render: (montant, record) => {
                // Determine color based on transfer type
                let amountColor = montant >= 0 ? '#52c41a' : '#ff4d4f';

                // For withdrawal types, always use red
                if (record.type === 'withdrawal' || record.type === 'Manuel Withdrawal') {
                    amountColor = '#ff4d4f';
                }

                return (
                    <div style={{ padding: '4px 0' }}>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: amountColor,
                            marginBottom: record.type === 'Correction' && record.originalMontant !== null ? '4px' : '0'
                        }}>
                            {montant} DH
                        </div>
                        {record.type === 'Correction' && record.originalMontant !== null && (
                            <div style={{
                                fontSize: '11px',
                                color: theme === 'dark' ? '#8c8c8c' : '#666'
                            }}>
                                Original: <span style={{ color: '#fa8c16', fontWeight: '500' }}>{record.originalMontant} DH</span>
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status) => {
                const statusInfo = getTransferStatusInfo(status);
                const statusColors = {
                    'success': '#52c41a',
                    'processing': '#1890ff',
                    'error': '#ff4d4f',
                    'warning': '#faad14',
                    'default': theme === 'dark' ? '#8c8c8c' : '#666'
                };

                return (
                    <div style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: statusColors[statusInfo.color] || statusColors.default,
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                        border: `1px solid ${statusColors[statusInfo.color] || statusColors.default}20`,
                        textAlign: 'center'
                    }}>
                        {status?.toUpperCase() || 'N/A'}
                    </div>
                );
            },
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: 120,
            render: (type) => {
                let color = '#1890ff';

                if (type === 'Correction') {
                    color = '#722ed1';
                } else if (type === 'Manuel Depot') {
                    color = '#52c41a';
                } else if (type === 'Manuel Withdrawal') {
                    color = '#fa8c16';
                } else if (type === 'withdrawal') {
                    color = '#ff4d4f';
                }

                return (
                    <div style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: color,
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                        border: `1px solid ${color}20`,
                        textAlign: 'center'
                    }}>
                        {type?.toUpperCase() || 'N/A'}
                    </div>
                );
            },
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 140,
            render: (date) => (
                <div style={{
                    fontSize: '11px',
                    color: theme === 'dark' ? '#8c8c8c' : '#666',
                    lineHeight: '1.4'
                }}>
                    {new Date(date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    })}
                    <br />
                    {new Date(date).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            width: 200,
            render: (description, record) => {
                // For manual transfers, we already show the commentaire in the Colis column
                if (record.type === 'Manuel Depot' || record.type === 'Manuel Withdrawal') {
                    return (
                        <div style={{ padding: '4px 0' }}>
                            <div style={{
                                fontSize: '12px',
                                fontWeight: '500',
                                color: record.type === 'Manuel Depot' ? '#52c41a' : '#fa8c16',
                                marginBottom: '4px'
                            }}>
                                {record.type === 'Manuel Depot' ? 'Dépôt Manuel' : 'Retrait Manuel'}
                            </div>
                            <div style={{
                                fontSize: '11px',
                                color: theme === 'dark' ? '#8c8c8c' : '#666'
                            }}>
                                Par: {record.admin?.nom || 'Admin'}
                            </div>
                        </div>
                    );
                }

                // For withdrawal transfers
                if (record.type === 'withdrawal') {
                    return (
                        <div style={{ padding: '4px 0' }}>
                            <div style={{
                                fontSize: '12px',
                                fontWeight: '500',
                                color: '#ff4d4f',
                                marginBottom: '4px'
                            }}>
                                Retrait Client
                            </div>
                            <div style={{
                                fontSize: '11px',
                                color: theme === 'dark' ? '#8c8c8c' : '#666'
                            }}>
                                Store: {record.wallet?.store?.storeName || 'N/A'}
                            </div>
                        </div>
                    );
                }

                // For correction transfers
                if (record.type === 'Correction') {
                    return (
                        <div style={{ padding: '4px 0', maxWidth: '180px' }}>
                            <div style={{
                                fontSize: '12px',
                                color: theme === 'dark' ? '#fff' : '#262626',
                                lineHeight: '1.4',
                                marginBottom: '4px',
                                whiteSpace: 'normal'
                            }}>
                                {description || 'No description provided'}
                            </div>
                            {record.correctionDate && (
                                <div style={{
                                    fontSize: '11px',
                                    color: theme === 'dark' ? '#8c8c8c' : '#666'
                                }}>
                                    Corrected: {new Date(record.correctionDate).toLocaleDateString('fr-FR')}
                                </div>
                            )}
                        </div>
                    );
                }

                // For regular transfers
                return description ? (
                    <div style={{
                        padding: '4px 0',
                        maxWidth: '180px',
                        fontSize: '12px',
                        color: theme === 'dark' ? '#fff' : '#262626',
                        lineHeight: '1.4',
                        whiteSpace: 'normal'
                    }}>
                        {description}
                    </div>
                ) : (
                    <div style={{
                        fontSize: '12px',
                        color: theme === 'dark' ? '#8c8c8c' : '#666'
                    }}>
                        -
                    </div>
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            width: isAdmin ? 280 : 0,
            render: (_, record) => {
                // Check transfer conditions
                const isCorrected = record.type === 'Correction';
                const isValidated = record.status === 'validé';
                const isCancelled = record.status === 'annuler';

                return isAdmin && (
                    <Space size="small" wrap>
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
                                        style={{
                                            backgroundColor: '#52c41a',
                                            borderColor: '#52c41a',
                                            fontSize: '11px'
                                        }}
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
                                        style={{ fontSize: '11px' }}
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
                                    style={{
                                        backgroundColor: '#1890ff',
                                        borderColor: '#1890ff',
                                        fontSize: '11px'
                                    }}
                                >
                                    Correct
                                </Button>
                            </Tooltip>
                        )}
                    </Space>
                );
            },
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
                            <div>
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
                                    style={{
                                        backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
                                        borderRadius: '8px',
                                        overflow: 'hidden'
                                    }}
                                />

                                <style jsx>{`
                                    .ant-table {
                                        background-color: ${theme === 'dark' ? '#1f1f1f' : '#fff'} !important;
                                    }

                                    .ant-table-thead > tr > th {
                                        background-color: ${theme === 'dark' ? '#262626' : '#fafafa'} !important;
                                        color: ${theme === 'dark' ? '#fff' : '#262626'} !important;
                                        border-bottom: 1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'} !important;
                                        font-weight: 600 !important;
                                        font-size: 13px !important;
                                        padding: 12px 16px !important;
                                    }

                                    .ant-table-tbody > tr > td {
                                        background-color: ${theme === 'dark' ? '#1f1f1f' : '#fff'} !important;
                                        color: ${theme === 'dark' ? '#fff' : '#262626'} !important;
                                        border-bottom: 1px solid ${theme === 'dark' ? '#303030' : '#f0f0f0'} !important;
                                        padding: 12px 16px !important;
                                        font-size: 12px !important;
                                    }

                                    .ant-table-tbody > tr:hover > td {
                                        background-color: ${theme === 'dark' ? '#262626' : '#f5f5f5'} !important;
                                    }

                                    .ant-table-tbody > tr:nth-child(even) > td {
                                        background-color: ${theme === 'dark' ? '#1a1a1a' : '#fafafa'} !important;
                                    }

                                    .ant-table-tbody > tr:nth-child(odd) > td {
                                        background-color: ${theme === 'dark' ? '#1f1f1f' : '#fff'} !important;
                                    }

                                    .ant-pagination {
                                        background-color: ${theme === 'dark' ? '#1f1f1f' : '#fff'} !important;
                                        margin-top: 16px !important;
                                    }

                                    .ant-pagination .ant-pagination-item {
                                        background-color: ${theme === 'dark' ? '#262626' : '#fff'} !important;
                                        border-color: ${theme === 'dark' ? '#434343' : '#d9d9d9'} !important;
                                    }

                                    .ant-pagination .ant-pagination-item a {
                                        color: ${theme === 'dark' ? '#fff' : '#262626'} !important;
                                    }

                                    .ant-pagination .ant-pagination-item-active {
                                        background-color: #1890ff !important;
                                        border-color: #1890ff !important;
                                    }

                                    .ant-pagination .ant-pagination-item-active a {
                                        color: #fff !important;
                                    }
                                `}</style>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Correction Modal */}
            <Modal
                title={
                    <div style={{
                        color: theme === 'dark' ? '#fff' : '#262626',
                        fontSize: '16px',
                        fontWeight: '600'
                    }}>
                        Correct Transfer
                    </div>
                }
                open={correctionModal.visible}
                onCancel={() => {
                    setCorrectionModal({ visible: false, transfer: null });
                    form.resetFields();
                }}
                maskClosable={false}
                footer={null}
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
                    }
                }}
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
                        label={
                            <span style={{ color: theme === 'dark' ? '#fff' : '#262626', fontWeight: '500' }}>
                                Current Amount
                            </span>
                        }
                        name="currentAmount"
                    >
                        <InputNumber
                            disabled
                            style={{
                                width: '100%',
                                backgroundColor: theme === 'dark' ? '#262626' : '#f5f5f5',
                                borderColor: theme === 'dark' ? '#434343' : '#d9d9d9',
                                color: theme === 'dark' ? '#8c8c8c' : '#666'
                            }}
                            formatter={value => `${value} DH`}
                            parser={value => value.replace(' DH', '')}
                        />
                    </Form.Item>
                    <Form.Item
                        label={
                            <span style={{ color: theme === 'dark' ? '#fff' : '#262626', fontWeight: '500' }}>
                                New Amount
                            </span>
                        }
                        name="newAmount"
                        rules={[
                            { required: true, message: 'Please enter the new amount' },
                        ]}
                    >
                        <InputNumber
                            style={{
                                width: '100%',
                                backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                                borderColor: theme === 'dark' ? '#434343' : '#d9d9d9',
                                color: theme === 'dark' ? '#fff' : '#262626'
                            }}
                            formatter={value => `${value} DH`}
                            parser={value => value.replace(' DH', '')}
                        />
                    </Form.Item>
                    <Form.Item
                        label={
                            <span style={{ color: theme === 'dark' ? '#fff' : '#262626', fontWeight: '500' }}>
                                Correction Reason
                            </span>
                        }
                        name="description"
                        rules={[
                            { required: true, message: 'Please provide a reason for the correction' },
                            { min: 10, message: 'Description must be at least 10 characters' }
                        ]}
                    >
                        <Input.TextArea
                            rows={4}
                            style={{
                                backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                                borderColor: theme === 'dark' ? '#434343' : '#d9d9d9',
                                color: theme === 'dark' ? '#fff' : '#262626'
                            }}
                            placeholder="Enter the reason for this correction..."
                        />
                    </Form.Item>
                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <Button
                                onClick={() => {
                                    setCorrectionModal({ visible: false, transfer: null });
                                    form.resetFields();
                                }}
                                style={{
                                    backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                                    borderColor: theme === 'dark' ? '#434343' : '#d9d9d9',
                                    color: theme === 'dark' ? '#fff' : '#262626'
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{
                                    backgroundColor: '#1890ff',
                                    borderColor: '#1890ff'
                                }}
                            >
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