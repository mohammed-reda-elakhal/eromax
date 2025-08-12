import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import { Table, Typography, Button, Space, Spin, message, Popconfirm, Tooltip, Modal, Form, InputNumber } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getAllTransfers, validateTransfer, cancelTransfer, correctTransfer, deleteTransfer } from '../../../../redux/apiCalls/transferApiCalls';
import { ReloadOutlined, SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, EditOutlined } from '@ant-design/icons';

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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                    {isAdmin && (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    color: theme === 'dark' ? '#d9d9d9' : '#595959',
                                    marginBottom: '2px'
                                }}>
                                    Store Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter store name..."
                                    value={searchParams.storeName}
                                    onChange={(e) => setSearchParams({ ...searchParams, storeName: e.target.value })}
                                    style={{
                                        width: '200px',
                                        padding: '8px 12px',
                                        backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                                        border: `1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'}`,
                                        borderRadius: '6px',
                                        color: theme === 'dark' ? '#fff' : '#000',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1890ff';
                                        e.target.style.boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.2)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = theme === 'dark' ? '#434343' : '#d9d9d9';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    color: theme === 'dark' ? '#d9d9d9' : '#595959',
                                    marginBottom: '2px'
                                }}>
                                    Wallet Key
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter wallet key..."
                                    value={searchParams.walletKey}
                                    onChange={(e) => setSearchParams({ ...searchParams, walletKey: e.target.value })}
                                    style={{
                                        width: '200px',
                                        padding: '8px 12px',
                                        backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                                        border: `1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'}`,
                                        borderRadius: '6px',
                                        color: theme === 'dark' ? '#fff' : '#000',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1890ff';
                                        e.target.style.boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.2)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = theme === 'dark' ? '#434343' : '#d9d9d9';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        </>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{
                            fontSize: '12px',
                            fontWeight: '500',
                            color: theme === 'dark' ? '#d9d9d9' : '#595959',
                            marginBottom: '2px'
                        }}>
                            Tracking Code
                        </label>
                        <input
                            type="text"
                            placeholder="Enter tracking code..."
                            value={searchParams.codeSuivi}
                            onChange={(e) => setSearchParams({ ...searchParams, codeSuivi: e.target.value })}
                            style={{
                                width: '200px',
                                padding: '8px 12px',
                                backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                                border: `1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'}`,
                                borderRadius: '6px',
                                color: theme === 'dark' ? '#fff' : '#000',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#1890ff';
                                e.target.style.boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.2)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = theme === 'dark' ? '#434343' : '#d9d9d9';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{
                            fontSize: '12px',
                            fontWeight: '500',
                            color: theme === 'dark' ? '#d9d9d9' : '#595959',
                            marginBottom: '2px'
                        }}>
                            Transfer Status
                        </label>
                        <select
                            value={searchParams.transferStatus}
                            onChange={(e) => setSearchParams({ ...searchParams, transferStatus: e.target.value })}
                            style={{
                                width: '200px',
                                padding: '8px 12px',
                                backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                                border: `1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'}`,
                                borderRadius: '6px',
                                color: theme === 'dark' ? '#fff' : '#000',
                                fontSize: '14px',
                                outline: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#1890ff';
                                e.target.style.boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.2)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = theme === 'dark' ? '#434343' : '#d9d9d9';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            <option value="">Select transfer status...</option>
                            <optgroup label="Transfer Status">
                                <option value="validé">Validé</option>
                                <option value="corrigé">Corrigé</option>
                                <option value="annuler">Annulé</option>
                                <option value="pending">En attente</option>
                            </optgroup>
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{
                            fontSize: '12px',
                            fontWeight: '500',
                            color: theme === 'dark' ? '#d9d9d9' : '#595959',
                            marginBottom: '2px'
                        }}>
                            Delivery Status
                        </label>
                        <select
                            value={searchParams.colisStatus}
                            onChange={(e) => setSearchParams({ ...searchParams, colisStatus: e.target.value })}
                            style={{
                                width: '200px',
                                padding: '8px 12px',
                                backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                                border: `1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'}`,
                                borderRadius: '6px',
                                color: theme === 'dark' ? '#fff' : '#000',
                                fontSize: '14px',
                                outline: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#1890ff';
                                e.target.style.boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.2)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = theme === 'dark' ? '#434343' : '#d9d9d9';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            <option value="">Select delivery status...</option>
                            <optgroup label="Delivery Status">
                                <option value="Livrée">Livrée</option>
                                <option value="Refusée">Refusée</option>
                            </optgroup>
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{
                            fontSize: '12px',
                            fontWeight: '500',
                            color: theme === 'dark' ? '#d9d9d9' : '#595959',
                            marginBottom: '2px'
                        }}>
                            Transfer Type
                        </label>
                        <select
                            value={searchParams.transferType}
                            onChange={(e) => setSearchParams({ ...searchParams, transferType: e.target.value })}
                            style={{
                                width: '200px',
                                padding: '8px 12px',
                                backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                                border: `1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'}`,
                                borderRadius: '6px',
                                color: theme === 'dark' ? '#fff' : '#000',
                                fontSize: '14px',
                                outline: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#1890ff';
                                e.target.style.boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.2)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = theme === 'dark' ? '#434343' : '#d9d9d9';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            <option value="">Select transfer type...</option>
                            <optgroup label="Transfer Type">
                                <option value="Deposit">Deposit</option>
                                <option value="Correction">Correction</option>
                                <option value="Manuel Depot">Manuel Depot</option>
                                <option value="Manuel Withdrawal">Manuel Withdrawal</option>
                                <option value="withdrawal">Withdrawal</option>
                            </optgroup>
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{
                            fontSize: '12px',
                            fontWeight: '500',
                            color: theme === 'dark' ? '#d9d9d9' : '#595959',
                            marginBottom: '2px'
                        }}>
                            Manual Only
                        </label>
                        <select
                            value={searchParams.manualOnly}
                            onChange={(e) => setSearchParams({ ...searchParams, manualOnly: e.target.value })}
                            style={{
                                width: '200px',
                                padding: '8px 12px',
                                backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                                border: `1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'}`,
                                borderRadius: '6px',
                                color: theme === 'dark' ? '#fff' : '#000',
                                fontSize: '14px',
                                outline: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#1890ff';
                                e.target.style.boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.2)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = theme === 'dark' ? '#434343' : '#d9d9d9';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            <option value="">Manual transfers only...</option>
                            <option value="true">Show manual transfers only</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{
                            fontSize: '12px',
                            fontWeight: '500',
                            color: theme === 'dark' ? '#d9d9d9' : '#595959',
                            marginBottom: '2px'
                        }}>
                            Date Range
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="datetime-local"
                                value={searchParams.startDate}
                                onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
                                style={{
                                    width: '180px',
                                    padding: '8px 12px',
                                    backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                                    border: `1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'}`,
                                    borderRadius: '6px',
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#1890ff';
                                    e.target.style.boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.2)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = theme === 'dark' ? '#434343' : '#d9d9d9';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                            <input
                                type="datetime-local"
                                value={searchParams.endDate}
                                onChange={(e) => setSearchParams({ ...searchParams, endDate: e.target.value })}
                                style={{
                                    width: '180px',
                                    padding: '8px 12px',
                                    backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                                    border: `1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'}`,
                                    borderRadius: '6px',
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#1890ff';
                                    e.target.style.boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.2)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = theme === 'dark' ? '#434343' : '#d9d9d9';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                        type="button"
                        onClick={handleSearch}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#1890ff',
                            border: '1px solid #1890ff',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                            outline: 'none'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#40a9ff';
                            e.target.style.borderColor = '#40a9ff';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#1890ff';
                            e.target.style.borderColor = '#1890ff';
                        }}
                    >
                        <SearchOutlined style={{ fontSize: '14px' }} />
                        Search
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                            border: `1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'}`,
                            borderRadius: '6px',
                            color: theme === 'dark' ? '#fff' : '#000',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            outline: 'none'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = theme === 'dark' ? '#434343' : '#f5f5f5';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = theme === 'dark' ? '#262626' : '#fff';
                        }}
                    >
                        Reset
                    </button>
                </div>
                
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
            </div>
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

    const handleDeleteTransfer = async (transferId) => {
        try {
            await dispatch(deleteTransfer(transferId));
            dispatch(getAllTransfers(searchParams));
        } catch (error) {
            message.error('Failed to delete transfer');
        }
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
            width: isAdmin ? 360 : 0,
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
                        {isAdmin && (
                            <Tooltip title="Delete Transfer">
                                <Popconfirm
                                    title="Delete this transfer?"
                                    description="This action cannot be undone. Are you sure you want to delete this transfer?"
                                    onConfirm={() => handleDeleteTransfer(record._id)}
                                    okText="Yes, Delete"
                                    cancelText="Cancel"
                                    okType="danger"
                                >
                                                                         <Button
                                         danger
                                         icon={<CloseCircleOutlined />}
                                         size="small"
                                         style={{ 
                                             fontSize: '11px',
                                             backgroundColor: '#ff4d4f',
                                             borderColor: '#ff4d4f',
                                             color: '#fff'
                                         }}
                                     >
                                         Delete
                                     </Button>
                                </Popconfirm>
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
                         <textarea
                             rows={4}
                             style={{
                                 width: '100%',
                                 padding: '8px 12px',
                                 backgroundColor: theme === 'dark' ? '#262626' : '#fff',
                                 border: `1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'}`,
                                 borderRadius: '6px',
                                 color: theme === 'dark' ? '#fff' : '#262626',
                                 fontSize: '14px',
                                 outline: 'none',
                                 resize: 'vertical',
                                 transition: 'all 0.2s ease',
                                 fontFamily: 'inherit'
                             }}
                             placeholder="Enter the reason for this correction..."
                             onFocus={(e) => {
                                 e.target.style.borderColor = '#1890ff';
                                 e.target.style.boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.2)';
                             }}
                             onBlur={(e) => {
                                 e.target.style.borderColor = theme === 'dark' ? '#434343' : '#d9d9d9';
                                 e.target.style.boxShadow = 'none';
                             }}
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