import React, { useContext, useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../../../ThemeContext';
import '../reclamation.css';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { Button, Table, Tabs, Tag, Space, Tooltip, Modal, Input, Form, Card, Typography, Alert, Select, DatePicker } from 'antd';
import { FaInfoCircle, FaEnvelope, FaCheck, FaUser, FaSearch } from "react-icons/fa";
import { MdOutlineDomainVerification, MdOutlineMessage, MdOutlineClear } from "react-icons/md";
import { MdOutlineDangerous } from "react-icons/md";
import { LuBox } from "react-icons/lu";
import { IoIosAdd } from "react-icons/io";
import { IoMdRefresh } from "react-icons/io";
import { getAllReclamations, getReclamationById, getReclamationsByStore, updateReclamationStatus, reopenReclamation, addMessage, createReclamation } from '../../../../redux/apiCalls/reclamationApiCalls';
import { toast } from 'react-toastify';





// Messages container component with auto-scroll
const MessagesContainer = ({ messages, formatDate }) => {
    const messagesEndRef = React.useRef(null);

    // Scroll to bottom whenever messages change
    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="messages-container">
            <div style={{ padding: '10px 0' }}>
                {messages.map((message, index) => {
                    const isSenderAdmin = message.sender.senderType === 'Admin' || message.sender.senderType === 'Team';
                    const isTemp = message._id.toString().includes('temp');
                    const isFirstMessageOfDay = index === 0 ||
                        new Date(message.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString();

                    return (
                        <React.Fragment key={message._id}>
                            {/* Date separator - more compact */}
                            {isFirstMessageOfDay && (
                                <div style={{
                                    textAlign: 'center',
                                    margin: '8px 0',
                                    position: 'relative',
                                    zIndex: 1
                                }}>
                                    <span style={{
                                        backgroundColor: '#f5f5f5',
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        fontSize: '11px',
                                        color: '#888',
                                        border: '1px solid #e8e8e8'
                                    }}>
                                        {new Date(message.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            )}

                            {/* Message bubble with more compact styling */}
                            <div
                                className={`message-bubble ${isSenderAdmin ? 'admin' : 'store'} ${isTemp ? 'temp' : ''}`}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    maxWidth: '85%',
                                    marginLeft: isSenderAdmin ? 'auto' : '5px',
                                    marginRight: isSenderAdmin ? '5px' : 'auto',
                                    marginBottom: '8px',
                                    position: 'relative',
                                    backgroundColor: isSenderAdmin ? '#e6f7ff' : '#f6ffed',
                                    borderRadius: '8px',
                                    border: `1px solid ${isSenderAdmin ? '#91d5ff' : '#b7eb8f'}`,
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '4px 8px 2px 8px',
                                    borderBottom: '1px solid rgba(0,0,0,0.03)'
                                }}>
                                    <span style={{
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        color: isSenderAdmin ? '#1890ff' : '#52c41a'
                                    }}>
                                        {message.sender.senderType === 'Store'
                                            ? message.sender.storeName
                                            : `${message.sender.nom}`}
                                    </span>
                                    <span style={{ fontSize: '10px', color: '#999' }}>
                                        {formatDate(message.createdAt).split(' ')[1]} {/* Show only time */}
                                    </span>
                                </div>

                                <div style={{
                                    padding: '6px 8px',
                                    fontSize: '13px',
                                    lineHeight: '1.4',
                                    wordBreak: 'break-word'
                                }}>
                                    {message.content}
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
            <div ref={messagesEndRef} />
        </div>
    );
};

function Reclamation() {
    const { theme } = useContext(ThemeContext);
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const { reclamations, loading, error } = useSelector(state => state.reclamation);
    const { user } = useSelector(state => state.auth); // Get user from auth slice
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedReclamation, setSelectedReclamation] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [form] = Form.useForm();

    // State for create reclamation modal
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [initialMessage, setInitialMessage] = useState('');
    const [selectedColis, setSelectedColis] = useState(null);
    const [manualCodeSuivi, setManualCodeSuivi] = useState('');
    const [modalError, setModalError] = useState(null);

    // State for search functionality
    const [searchExpanded, setSearchExpanded] = useState(false);
    const [searchParams, setSearchParams] = useState({
        codeSuivi: '',
        store: '',
        status: undefined,
        startDate: '',
        endDate: ''
    });
    const [filteredData, setFilteredData] = useState([]);

    // Check if we have colis data or reclamation ID from navigation
    useEffect(() => {
        if (location.state?.createReclamation && location.state?.colis) {
            // Set the colis data
            setSelectedColis(location.state.colis);

            // Create a default initial message with the colis code
            const defaultMessage = `Je souhaite signaler un problème concernant le colis ${location.state.colis.code_suivi}.\n\nDétails du problème: ___`;
            setInitialMessage(defaultMessage);

            // Open the create modal
            setCreateModalVisible(true);

            // Clear the location state to prevent reopening on refresh
            navigate(location.pathname, { replace: true });
        } else if (location.state?.viewReclamation) {
            // If we have a reclamation ID to view
            const reclamationId = location.state.viewReclamation;
            console.log('Opening reclamation details from navigation:', reclamationId);

            // Fetch and display the reclamation details
            handleViewDetails(reclamationId);

            // Clear the location state to prevent reopening on refresh
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    // Check if user is admin
    const isAdmin = user?.role === 'admin' || user?.role === 'team';
    // Check if user is super admin
    const isSuperAdmin = user?.role === 'admin' && user?.type === 'super';
    // Check if user is client
    const isClient = user?.role === 'client';
    // Get store ID for client users
    const userStoreId = user?.store;

    // Fetch reclamations based on user role
    useEffect(() => {
        console.log('User role check:', { isAdmin, isClient, userStoreId, user });

        // Wait for user data to be fully loaded
        if (!user) {
            console.log('User data not yet loaded, waiting...');
            return;
        }

        if (isAdmin) {
            // Admin can see all reclamations
            console.log('Fetching all reclamations for admin');
            dispatch(getAllReclamations());
        } else if (isClient) {
            if (userStoreId) {
                // Client can only see their own reclamations
                console.log('Fetching reclamations for store:', userStoreId);
                dispatch(getReclamationsByStore(userStoreId));
            } else {
                console.log('Client user detected but no store ID found in user object');
                // Try to get store ID from localStorage directly
                const storeData = localStorage.getItem('store');
                if (storeData) {
                    try {
                        const parsedStore = JSON.parse(storeData);
                        if (parsedStore && parsedStore._id) {
                            console.log('Found store ID in localStorage:', parsedStore._id);
                            dispatch(getReclamationsByStore(parsedStore._id));
                        } else {
                            console.log('Store data exists but no _id found:', parsedStore);
                            dispatch(getAllReclamations());
                        }
                    } catch (e) {
                        console.error('Error parsing store data from localStorage:', e);
                        dispatch(getAllReclamations());
                    }
                } else {
                    console.log('No store data found in localStorage, falling back to getAllReclamations');
                    dispatch(getAllReclamations());
                }
            }
        } else {
            console.log('No valid user role detected for fetching reclamations');
        }
    }, [dispatch, isAdmin, isClient, userStoreId, user]);

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    // Handle status change
    const handleStatusChange = async (id, newStatus) => {
        try {
            // Optimistic UI update for detail view
            if (selectedReclamation && selectedReclamation._id === id) {
                setSelectedReclamation(prev => ({
                    ...prev,
                    status: newStatus,
                    closed: newStatus === 'closed'
                }));
            }

            // Send the actual request
            const result = await dispatch(updateReclamationStatus(id, newStatus));

            if (result) {
                toast.success(`Reclamation status updated to ${newStatus}`);

                // If we're in detail view, update with the server response
                if (selectedReclamation && selectedReclamation._id === id) {
                    setSelectedReclamation(result.reclamation);
                }
            }
        } catch (error) {
            toast.error("Failed to update reclamation status");

            // Revert optimistic update if there was an error
            if (selectedReclamation && selectedReclamation._id === id) {
                const refreshedData = await dispatch(getReclamationById(id));
                setSelectedReclamation(refreshedData);
            }
        }
    };



    // Handle refresh messages
    const handleRefreshMessages = async (id) => {
        try {
            // Show loading indicator
            const loadingToast = toast.loading("Refreshing messages...");

            // Fetch the latest data
            const refreshedData = await dispatch(getReclamationById(id));

            // Update the UI
            if (refreshedData) {
                setSelectedReclamation(refreshedData);
                toast.update(loadingToast, {
                    render: "Messages refreshed",
                    type: "success",
                    isLoading: false,
                    autoClose: 2000
                });
            } else {
                toast.update(loadingToast, {
                    render: "Failed to refresh messages",
                    type: "error",
                    isLoading: false,
                    autoClose: 2000
                });
            }
        } catch (error) {
            toast.error("Failed to refresh messages");
        }
    };

    // Handle reopen reclamation
    const handleReopenReclamation = async (id) => {
        try {
            // Optimistic UI update for table view
            if (selectedReclamation && selectedReclamation._id === id) {
                // For detail view - update status immediately for smoother UI
                setSelectedReclamation(prev => ({
                    ...prev,
                    status: 'in_progress',
                    closed: false
                }));
            }

            // Send the actual request
            const result = await dispatch(reopenReclamation(id));

            if (result) {
                toast.success("Reclamation reopened successfully");

                // If we're in detail view, update with the server response
                if (selectedReclamation && selectedReclamation._id === id) {
                    setSelectedReclamation(result.reclamation);
                }
            }
        } catch (error) {
            toast.error("Failed to reopen reclamation");

            // Revert optimistic update if there was an error
            if (selectedReclamation && selectedReclamation._id === id) {
                const refreshedData = await dispatch(getReclamationById(id));
                setSelectedReclamation(refreshedData);
            }
        }
    };

    // View reclamation details
    const handleViewDetails = async (id) => {
        try {
            const reclamation = await dispatch(getReclamationById(id));
            setSelectedReclamation(reclamation);
            setDetailModalVisible(true);
        } catch (error) {
            toast.error("Failed to fetch reclamation details");
        }
    };

    // Send a message
    const handleSendMessage = async () => {
        if (!selectedReclamation || !messageText.trim()) return;

        const originalMessage = messageText; // Store original message text

        try {
            // Show optimistic UI update
            const tempMessage = {
                _id: 'temp-' + Date.now(),
                sender: {
                    senderType: isAdmin ? 'Admin' : 'Store',
                    senderId: 'temp',
                    nom: 'You', // Placeholder
                    role: isAdmin ? 'admin' : 'client',
                    tele: ''
                },
                content: messageText,
                read: true,
                createdAt: new Date().toISOString()
            };

            // Update local state immediately for smooth UI
            setSelectedReclamation(prev => ({
                ...prev,
                messages: [...(prev.messages || []), tempMessage]
            }));

            // Clear input field immediately
            setMessageText('');
            form.resetFields(['message']);

            // Send the actual request
            const result = await dispatch(addMessage(selectedReclamation._id, originalMessage));

            // Update with the real data from server
            if (result && result.reclamation) {
                // Replace the temporary message with the real one
                setSelectedReclamation(result.reclamation);
                toast.success("Message sent successfully");
            }
        } catch (error) {
            toast.error("Failed to send message");

            // Remove the temporary message and restore the original state
            const refreshedData = await dispatch(getReclamationById(selectedReclamation._id));
            if (refreshedData) {
                setSelectedReclamation(refreshedData);
                // Restore the message text so the user doesn't lose their input
                setMessageText(originalMessage);
                form.setFieldsValue({ message: originalMessage });
            }
        }
    };

    // Get status tag color
    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'blue';
            case 'in_progress': return 'orange';
            case 'resolved': return 'green';
            case 'closed': return 'red';
            default: return 'default';
        }
    };

    // Search functions
    const handleSearch = () => {
        let filtered = [...reclamations];

        // Filter by code_suivi
        if (searchParams.codeSuivi) {
            filtered = filtered.filter(r =>
                r.colis?.code_suivi?.toLowerCase().includes(searchParams.codeSuivi.toLowerCase())
            );
        }

        // Filter by store name (admin only)
        if (isAdmin && searchParams.store) {
            filtered = filtered.filter(r =>
                r.store?.storeName?.toLowerCase().includes(searchParams.store.toLowerCase())
            );
        }

        // Filter by status
        if (searchParams.status) {
            filtered = filtered.filter(r => r.status === searchParams.status);
        }

        // Filter by date range using simple date inputs
        if (searchParams.startDate || searchParams.endDate) {
            filtered = filtered.filter(r => {
                const createdAt = new Date(r.createdAt);

                // If we have a start date, check if createdAt is after or equal to it
                if (searchParams.startDate) {
                    const startDate = new Date(searchParams.startDate);
                    startDate.setHours(0, 0, 0, 0); // Start of day
                    if (createdAt < startDate) return false;
                }

                // If we have an end date, check if createdAt is before or equal to it
                if (searchParams.endDate) {
                    const endDate = new Date(searchParams.endDate);
                    endDate.setHours(23, 59, 59, 999); // End of day
                    if (createdAt > endDate) return false;
                }

                return true;
            });
        }

        // Update the filtered data
        setFilteredData(filtered);
    };

    const handleResetSearch = () => {
        setSearchParams({
            codeSuivi: '',
            store: '',
            status: undefined,
            startDate: '',
            endDate: ''
        });
        setFilteredData([]);
    };

    // Apply filters based on tab and search
    const getFilteredReclamations = () => {
        // If we have search results, use them
        if (filteredData.length > 0) {
            return selectedStatus === 'all'
                ? filteredData
                : filteredData.filter(r => r.status === selectedStatus);
        }

        // Otherwise, just filter by tab
        return selectedStatus === 'all'
            ? reclamations
            : reclamations.filter(r => r.status === selectedStatus);
    };

    const filteredReclamations = getFilteredReclamations();

    // Table columns based on user role
    const getColumns = () => {
        const baseColumns = [
            {
                title: 'Date',
                dataIndex: 'createdAt',
                key: 'createdAt',
                render: (text) => formatDate(text),
                sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            },
            {
                title: 'Code Suivi',
                dataIndex: 'colis',
                key: 'colis',
                render: (colis) => {
                    const codeSuivi = colis?.code_suivi || 'N/A';
                    return (
                        <Typography.Paragraph
                            copyable={codeSuivi !== 'N/A' ? { text: codeSuivi, tooltips: ['Copier', 'Copié!'] } : false}
                            style={{ marginBottom: 0 }}
                        >
                            {codeSuivi}
                        </Typography.Paragraph>
                    );
                },
            },
            {
                title: 'Ville',
                dataIndex: 'colis',
                key: 'ville',
                render: (colis) => colis?.ville?.nom || 'N/A',
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status) => (
                    <Tag color={getStatusColor(status)}>
                        {status?.toUpperCase() || 'N/A'}
                    </Tag>
                ),
                filters: [
                    { text: 'Open', value: 'open' },
                    { text: 'In Progress', value: 'in_progress' },
                    { text: 'Resolved', value: 'resolved' },
                    { text: 'Closed', value: 'closed' },
                ],
                onFilter: (value, record) => record.status === value,
            },
            {
                title: 'Last Updated',
                dataIndex: 'updatedAt',
                key: 'updatedAt',
                render: (text) => formatDate(text),
                sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
            },
            {
                title: 'Messages',
                dataIndex: 'messages',
                key: 'messages',
                render: (messages) => messages?.length || 0,
            },
            {
                title: 'Actions',
                key: 'actions',
                render: (_, record) => (
                    <Space size="middle">
                        <Tooltip title="View Details">
                            <Button
                                type="primary"
                                icon={<FaInfoCircle />}
                                onClick={() => handleViewDetails(record._id)}
                            />
                        </Tooltip>
                        {isAdmin && (
                            record.status === 'closed' ? (
                                <Tooltip title="Reopen Reclamation">
                                    <Button
                                        type="primary"
                                        icon={<MdOutlineDomainVerification />}
                                        style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
                                        onClick={() => handleReopenReclamation(record._id)}
                                    />
                                </Tooltip>
                            ) : (
                                <Tooltip title="Mark as Closed">
                                    <Button
                                        type="primary"
                                        danger
                                        icon={<FaCheck />}
                                        onClick={() => handleStatusChange(record._id, 'closed')}
                                    />
                                </Tooltip>
                            )
                        )}
                    </Space>
                ),
            },
        ];

        // Add store column for admin users only
        if (isAdmin) {
            return [
                baseColumns[0], // Date
                {
                    title: 'Store',
                    dataIndex: 'store',
                    key: 'store',
                    render: (store) => store?.storeName || 'N/A',
                },
                ...baseColumns.slice(1) // Rest of columns
            ];
        }

        return baseColumns;
    };

    const columns = getColumns();

    // Tabs for different status views
    const getTabItems = () => {
        const baseTabItems = [
            {
                key: 'all',
                label: 'All Reclamations',
                children: (
                    <Table
                        dataSource={filteredReclamations}
                        columns={columns}
                        rowKey="_id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                    />
                ),
            },
            {
                key: 'open',
                label: (
                    <span>
                        <MdOutlineDangerous size={16} style={{ marginRight: 8 }} />
                        Open
                    </span>
                ),
                children: (
                    <Table
                        dataSource={reclamations.filter(r => r.status === 'open')}
                        columns={columns}
                        rowKey="_id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                    />
                ),
            },
            {
                key: 'in_progress',
                label: (
                    <span>
                        <MdOutlineDomainVerification size={16} style={{ marginRight: 8 }} />
                        In Progress
                    </span>
                ),
                children: (
                    <Table
                        dataSource={reclamations.filter(r => r.status === 'in_progress')}
                        columns={columns}
                        rowKey="_id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                    />
                ),
            },
        ];

        // Add resolved and closed tabs for admin users
        if (isAdmin) {
            baseTabItems.push(
                {
                    key: 'resolved',
                    label: (
                        <span>
                            <FaCheck size={16} style={{ marginRight: 8 }} />
                            Resolved
                        </span>
                    ),
                    children: (
                        <Table
                            dataSource={reclamations.filter(r => r.status === 'resolved')}
                            columns={columns}
                            rowKey="_id"
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                        />
                    ),
                },
                {
                    key: 'closed',
                    label: 'Closed',
                    children: (
                        <Table
                            dataSource={reclamations.filter(r => r.status === 'closed')}
                            columns={columns}
                            rowKey="_id"
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                        />
                    ),
                }
            );
        }

        return baseTabItems;
    };

    const items = getTabItems();

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
                            padding: '20px'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <Title title="Reclamations" />
                                <Button
                                    icon={<IoMdRefresh />}
                                    onClick={() => {
                                        // Show loading toast
                                        const loadingToast = toast.loading("Actualisation des données...");

                                        // Refresh data based on user role
                                        if (isClient && userStoreId) {
                                            dispatch(getReclamationsByStore(userStoreId))
                                                .then(() => {
                                                    toast.update(loadingToast, {
                                                        render: "Données actualisées avec succès",
                                                        type: "success",
                                                        isLoading: false,
                                                        autoClose: 2000
                                                    });
                                                })
                                                .catch(() => {
                                                    toast.update(loadingToast, {
                                                        render: "Erreur lors de l'actualisation des données",
                                                        type: "error",
                                                        isLoading: false,
                                                        autoClose: 2000
                                                    });
                                                });
                                        } else {
                                            dispatch(getAllReclamations())
                                                .then(() => {
                                                    toast.update(loadingToast, {
                                                        render: "Données actualisées avec succès",
                                                        type: "success",
                                                        isLoading: false,
                                                        autoClose: 2000
                                                    });
                                                })
                                                .catch(() => {
                                                    toast.update(loadingToast, {
                                                        render: "Erreur lors de l'actualisation des données",
                                                        type: "error",
                                                        isLoading: false,
                                                        autoClose: 2000
                                                    });
                                                });
                                        }
                                    }}
                                >
                                    Actualiser
                                </Button>
                            </div>

                            {/* Only clients can create new reclamations */}
                            {isClient && (
                                <Button
                                    type="primary"
                                    icon={<IoIosAdd />}
                                    onClick={() => setCreateModalVisible(true)}
                                >
                                    Créer une réclamation
                                </Button>
                            )}
                        </div>

                        {error && (
                            <div style={{ color: 'red', marginBottom: '15px' }}>
                                Error: {error}
                            </div>
                        )}

                        {/* Advanced Search Panel */}
                        <Card
                            title={
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <FaSearch style={{ marginRight: '8px' }} />
                                    Recherche avancée
                                </div>
                            }
                            style={{ marginBottom: '20px' }}
                            extra={<Button type="link" onClick={() => setSearchExpanded(!searchExpanded)}>{searchExpanded ? 'Masquer' : 'Afficher'}</Button>}
                        >
                            {searchExpanded && (
                                <Form layout="vertical">
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                                        {/* Code Suivi Search */}
                                        <Form.Item label="Code Suivi" style={{ marginBottom: '12px' }}>
                                            <Input
                                                placeholder="Rechercher par code suivi"
                                                value={searchParams.codeSuivi}
                                                onChange={(e) => setSearchParams({ ...searchParams, codeSuivi: e.target.value })}
                                                allowClear
                                                prefix={<LuBox style={{ color: '#bfbfbf' }} />}
                                            />
                                        </Form.Item>

                                        {/* Store Search - Admin only */}
                                        {isAdmin && (
                                            <Form.Item label="Magasin" style={{ marginBottom: '12px' }}>
                                                <Input
                                                    placeholder="Rechercher par magasin"
                                                    value={searchParams.store}
                                                    onChange={(e) => setSearchParams({ ...searchParams, store: e.target.value })}
                                                    allowClear
                                                    prefix={<FaUser style={{ color: '#bfbfbf' }} />}
                                                />
                                            </Form.Item>
                                        )}

                                        {/* Status Filter */}
                                        <Form.Item label="Statut" style={{ marginBottom: '12px' }}>
                                            <Select
                                                placeholder="Filtrer par statut"
                                                value={searchParams.status || undefined}
                                                onChange={(value) => setSearchParams({ ...searchParams, status: value })}
                                                allowClear
                                                style={{ width: '100%' }}
                                                optionLabelProp="label"
                                            >
                                                <Select.Option
                                                    value="open"
                                                    label={
                                                        <span style={{ display: 'flex', alignItems: 'center' }}>
                                                            <MdOutlineDangerous size={14} style={{ marginRight: 8, color: '#1890ff' }} />
                                                            <span>OPEN</span>
                                                        </span>
                                                    }
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <Tag color="blue">OPEN</Tag>
                                                        <span style={{ marginLeft: 8 }}>Ouvert</span>
                                                    </div>
                                                </Select.Option>
                                                <Select.Option
                                                    value="in_progress"
                                                    label={
                                                        <span style={{ display: 'flex', alignItems: 'center' }}>
                                                            <MdOutlineDomainVerification size={14} style={{ marginRight: 8, color: '#fa8c16' }} />
                                                            <span>IN PROGRESS</span>
                                                        </span>
                                                    }
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <Tag color="orange">IN PROGRESS</Tag>
                                                        <span style={{ marginLeft: 8 }}>En cours</span>
                                                    </div>
                                                </Select.Option>
                                                <Select.Option
                                                    value="resolved"
                                                    label={
                                                        <span style={{ display: 'flex', alignItems: 'center' }}>
                                                            <FaCheck size={14} style={{ marginRight: 8, color: '#52c41a' }} />
                                                            <span>RESOLVED</span>
                                                        </span>
                                                    }
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <Tag color="green">RESOLVED</Tag>
                                                        <span style={{ marginLeft: 8 }}>Résolu</span>
                                                    </div>
                                                </Select.Option>
                                                <Select.Option
                                                    value="closed"
                                                    label={
                                                        <span style={{ display: 'flex', alignItems: 'center' }}>
                                                            <MdOutlineDangerous size={14} style={{ marginRight: 8, color: '#f5222d' }} />
                                                            <span>CLOSED</span>
                                                        </span>
                                                    }
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <Tag color="red">CLOSED</Tag>
                                                        <span style={{ marginLeft: 8 }}>Fermé</span>
                                                    </div>
                                                </Select.Option>
                                            </Select>
                                        </Form.Item>

                                        {/* Start Date */}
                                        <Form.Item label="Date début" style={{ marginBottom: '12px' }}>
                                            <Input
                                                type="date"
                                                value={searchParams.startDate || ''}
                                                onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
                                                style={{ width: '100%' }}
                                            />
                                        </Form.Item>

                                        {/* End Date */}
                                        <Form.Item label="Date fin" style={{ marginBottom: '12px' }}>
                                            <Input
                                                type="date"
                                                value={searchParams.endDate || ''}
                                                onChange={(e) => setSearchParams({ ...searchParams, endDate: e.target.value })}
                                                style={{ width: '100%' }}
                                            />
                                        </Form.Item>
                                    </div>

                                    {/* Search Buttons */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                                        <Button
                                            onClick={handleResetSearch}
                                            icon={<MdOutlineClear />}
                                        >
                                            Réinitialiser
                                        </Button>
                                        <Button
                                            type="primary"
                                            icon={<FaSearch />}
                                            onClick={handleSearch}
                                        >
                                            Rechercher
                                        </Button>
                                    </div>
                                </Form>
                            )}
                        </Card>

                        <Tabs
                            defaultActiveKey="all"
                            items={items}
                            onChange={(key) => setSelectedStatus(key)}
                        />

                        {/* Reclamation Detail Modal */}
                        <Modal
                            title={<div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                <MdOutlineMessage size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                                Reclamation Details
                            </div>}
                            open={detailModalVisible}
                            onCancel={() => setDetailModalVisible(false)}
                            footer={null}
                            width={900}
                            bodyStyle={{ maxHeight: '80vh', overflowY: 'auto', padding: '20px' }}
                            style={{ top: 20 }}
                        >
                            {selectedReclamation && (
                                <div>
                                    {/* Information cards in a flex container */}
                                    <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', flexWrap: 'wrap' }}>
                                        {/* Colis Information Card */}
                                        <div style={{
                                            flex: '1',
                                            minWidth: '250px',
                                            padding: '20px',
                                            borderRadius: '10px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                            backgroundColor: theme === 'dark' ? '#001f3d' : '#f0f7ff',
                                            border: '1px solid #d9e8ff'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                                                <LuBox size={24} style={{ marginRight: '10px', color: '#1890ff' }} />
                                                <h3 style={{ margin: 0, fontSize: '18px' }}>Colis Information</h3>
                                            </div>
                                            <div style={{ display: 'flex', marginBottom: '8px' }}>
                                                <div style={{ width: '120px', fontWeight: 'bold' }}>Code Suivi:</div>
                                                <div style={{ flex: 1 }}>
                                                    <Typography.Text
                                                        copyable={{ text: selectedReclamation.colis?.code_suivi, tooltips: ['Copier', 'Copié!'] }}
                                                    >
                                                        {selectedReclamation.colis?.code_suivi}
                                                    </Typography.Text>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', marginBottom: '8px' }}>
                                                <div style={{ width: '120px', fontWeight: 'bold' }}>Ville:</div>
                                                <div style={{ flex: 1 }}>{selectedReclamation.colis?.ville?.nom || 'N/A'}</div>
                                            </div>
                                            <div style={{ display: 'flex', marginBottom: '8px' }}>
                                                <div style={{ width: '120px', fontWeight: 'bold' }}>Prix:</div>
                                                <div style={{ flex: 1 }}>{selectedReclamation.colis?.prix} DH</div>
                                            </div>
                                            {selectedReclamation.colis?.statut && (
                                                <div style={{ display: 'flex', marginBottom: '8px' }}>
                                                    <div style={{ width: '120px', fontWeight: 'bold' }}>Statut:</div>
                                                    <div style={{ flex: 1 }}>
                                                        <Tag color={selectedReclamation.colis.statut === 'livrée' ? 'green' : 'orange'}>
                                                            {selectedReclamation.colis.statut.toUpperCase()}
                                                        </Tag>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Store Information Card */}
                                        <div style={{
                                            flex: '1',
                                            minWidth: '250px',
                                            padding: '20px',
                                            borderRadius: '10px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                            backgroundColor: theme === 'dark' ? '#002b17' : '#f6ffed',
                                            border: '1px solid #d9f7be'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                                                <FaUser size={22} style={{ marginRight: '10px', color: '#52c41a' }} />
                                                <h3 style={{ margin: 0, fontSize: '18px' }}>Store Information</h3>
                                            </div>
                                            <div style={{ display: 'flex', marginBottom: '8px' }}>
                                                <div style={{ width: '120px', fontWeight: 'bold' }}>Store Name:</div>
                                                <div style={{ flex: 1 }}>{selectedReclamation.store?.storeName}</div>
                                            </div>
                                            <div style={{ display: 'flex', marginBottom: '8px' }}>
                                                <div style={{ width: '120px', fontWeight: 'bold' }}>Phone:</div>
                                                <div style={{ flex: 1 }}>{selectedReclamation.store?.tele}</div>
                                            </div>
                                            {selectedReclamation.store?.id_client?.nom && (
                                                <div style={{ display: 'flex', marginBottom: '8px' }}>
                                                    <div style={{ width: '120px', fontWeight: 'bold' }}>Client:</div>
                                                    <div style={{ flex: 1 }}>{selectedReclamation.store.id_client.nom}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{
                                        marginBottom: '20px',
                                        padding: '15px',
                                        borderRadius: '10px',
                                        backgroundColor: theme === 'dark' ? '#141d2b' : '#fafafa',
                                        border: '1px solid #d9d9d9'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                                            <MdOutlineDomainVerification size={20} style={{ marginRight: '10px', color: '#722ed1' }} />
                                            <h3 style={{ margin: 0, fontSize: '18px' }}>Status</h3>
                                            <Tag
                                                color={getStatusColor(selectedReclamation.status)}
                                                style={{ marginLeft: '10px', fontSize: '14px', padding: '0 10px' }}
                                            >
                                                {selectedReclamation.status?.toUpperCase()}
                                            </Tag>
                                        </div>

                                        {/* Show status message based on current status */}
                                        <div style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
                                            {selectedReclamation.status === 'open' && (
                                                <p>This reclamation is waiting for review.</p>
                                            )}
                                            {selectedReclamation.status === 'in_progress' && (
                                                <p>This reclamation is currently being processed.</p>
                                            )}
                                            {selectedReclamation.status === 'resolved' && (
                                                <p>This reclamation has been resolved. It can be closed if no further action is needed.</p>
                                            )}
                                            {selectedReclamation.status === 'closed' && (
                                                <p>This reclamation has been closed. {isAdmin && "You can reopen it if needed."}</p>
                                            )}
                                        </div>

                                        {/* Admin can change status */}
                                        {isAdmin && (
                                            selectedReclamation.status === 'closed' ? (
                                                <div style={{ marginTop: '10px' }}>
                                                    <Button
                                                        type="primary"
                                                        onClick={() => handleReopenReclamation(selectedReclamation._id)}
                                                        icon={<MdOutlineDomainVerification />}
                                                        style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
                                                    >
                                                        Reopen Reclamation
                                                    </Button>
                                                </div>
                                            ) : (
                                            <div>
                                                <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>Change Status:</div>
                                                <Space>
                                                    {selectedReclamation.status !== 'in_progress' && (
                                                        <Button
                                                            type="primary"
                                                            onClick={() => handleStatusChange(selectedReclamation._id, 'in_progress')}
                                                            icon={<MdOutlineDomainVerification />}
                                                        >
                                                            In Progress
                                                        </Button>
                                                    )}

                                                    {selectedReclamation.status !== 'resolved' && (
                                                        <Button
                                                            type="primary"
                                                            style={{ backgroundColor: 'green', borderColor: 'green' }}
                                                            onClick={() => handleStatusChange(selectedReclamation._id, 'resolved')}
                                                            icon={<FaCheck />}
                                                        >
                                                            Resolved
                                                        </Button>
                                                    )}

                                                    <Button
                                                        type="primary"
                                                        danger
                                                        onClick={() => handleStatusChange(selectedReclamation._id, 'closed')}
                                                        icon={<MdOutlineDangerous />}
                                                    >
                                                        Close
                                                    </Button>
                                                </Space>
                                            </div>
                                            )
                                        )}
                                        {/* Show status history only for super admin users */}
                                        {isSuperAdmin && selectedReclamation.statusHistory && selectedReclamation.statusHistory.length > 0 && (
                                            <div style={{ marginTop: '15px' }}>
                                                <h4>Status History</h4>
                                                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', borderRadius: '8px' }}>
                                                    {selectedReclamation.statusHistory.map((update, index) => (
                                                        <div key={index} style={{ marginBottom: '8px', padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span>
                                                                    <Tag color={getStatusColor(update.previousStatus)}>{update.previousStatus?.toUpperCase() || 'N/A'}</Tag>
                                                                    {' → '}
                                                                    <Tag color={getStatusColor(update.newStatus)}>{update.newStatus?.toUpperCase()}</Tag>
                                                                </span>
                                                                <span style={{ fontSize: '12px', color: '#888' }}>{formatDate(update.updatedAt)}</span>
                                                            </div>
                                                            <div style={{ fontSize: '12px', marginTop: '4px' }}>
                                                                Updated by: <strong>{update.updatedBy?.nom || 'Unknown'}</strong> ({update.updatedBy?.role})
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ marginBottom: '25px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                                            <MdOutlineMessage size={24} style={{ marginRight: '10px', color: '#722ed1' }} />
                                            <h3 style={{ margin: 0, fontSize: '18px' }}>Messages</h3>
                                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                                                <Tooltip title="Refresh Messages">
                                                    <Button
                                                        type="text"
                                                        icon={<IoMdRefresh size={18} />}
                                                        style={{ marginRight: '10px' }}
                                                        onClick={() => handleRefreshMessages(selectedReclamation._id)}
                                                    />
                                                </Tooltip>
                                                <div style={{ backgroundColor: '#722ed1', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px' }}>
                                                    {selectedReclamation.messages?.length || 0}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{
                                            padding: '5px',
                                            borderRadius: '10px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
                                            border: '1px solid #d9d9d9'
                                        }}>
                                            {selectedReclamation.messages?.length > 0 ? (
                                                <div style={{ height: '350px' }}>
                                                    <MessagesContainer
                                                        messages={selectedReclamation.messages}
                                                        formatDate={formatDate}
                                                    />
                                                </div>
                                            ) : (
                                                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#999' }}>
                                                    <MdOutlineMessage size={40} style={{ marginBottom: '10px', opacity: 0.5 }} />
                                                    <p>No messages yet. Start the conversation!</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {selectedReclamation.status !== 'closed' ? (
                                        <div style={{
                                            padding: '20px',
                                            borderRadius: '10px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                            backgroundColor: theme === 'dark' ? '#141d2b' : '#fafafa',
                                            border: '1px solid #d9d9d9'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                                                <FaEnvelope size={20} style={{ marginRight: '10px', color: '#1890ff' }} />
                                                <h3 style={{ margin: 0, fontSize: '18px' }}>Add Message</h3>
                                            </div>

                                            <Form
                                                form={form}
                                                onFinish={handleSendMessage}
                                            >
                                                <Form.Item
                                                    name="message"
                                                    rules={[{ required: true, message: 'Please enter a message' }]}
                                                >
                                                    <Input.TextArea
                                                        rows={4}
                                                        placeholder="Type your message here..."
                                                        value={messageText}
                                                        onChange={(e) => setMessageText(e.target.value)}
                                                        style={{
                                                            borderRadius: '8px',
                                                            resize: 'none',
                                                            padding: '12px',
                                                            fontSize: '14px',
                                                            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                                                        }}
                                                        autoSize={{ minRows: 3, maxRows: 6 }}
                                                        onPressEnter={(e) => {
                                                            if (e.shiftKey) {
                                                                return; // Allow Shift+Enter for new line
                                                            }
                                                            e.preventDefault();
                                                            if (messageText.trim()) {
                                                                handleSendMessage();
                                                            }
                                                        }}
                                                    />
                                                </Form.Item>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ fontSize: '12px', color: '#888' }}>
                                                        Press Enter to send, Shift+Enter for new line
                                                    </div>
                                                    <Button
                                                        type="primary"
                                                        htmlType="submit"
                                                        icon={<FaEnvelope />}
                                                        disabled={!messageText.trim()}
                                                        style={{
                                                            borderRadius: '6px',
                                                            padding: '0 20px',
                                                            height: '36px',
                                                            boxShadow: '0 2px 4px rgba(24, 144, 255, 0.3)'
                                                        }}
                                                    >
                                                        Send Message
                                                    </Button>
                                                </div>
                                            </Form>
                                        </div>
                                    ) : (
                                        <div style={{
                                            padding: '15px',
                                            borderRadius: '10px',
                                            backgroundColor: '#fff7e6',
                                            border: '1px solid #ffe7ba',
                                            textAlign: 'center',
                                            color: '#d46b08'
                                        }}>
                                            <MdOutlineDangerous size={24} style={{ marginBottom: '10px' }} />
                                            <p style={{ margin: 0, fontSize: '14px' }}>
                                                This reclamation is closed. No new messages can be added.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Modal>

                        {/* Create Reclamation Modal */}
                        <Modal
                            title={
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <MdOutlineMessage style={{ marginRight: '8px', color: '#1890ff' }} />
                                    <span>Créer une réclamation</span>
                                </div>
                            }
                            open={createModalVisible}
                            onCancel={() => {
                                setCreateModalVisible(false);
                                setInitialMessage('');
                                setSelectedColis(null);
                                setManualCodeSuivi('');
                                setModalError(null);
                            }}
                            footer={[
                                <Button
                                    key="cancel"
                                    onClick={() => {
                                        setCreateModalVisible(false);
                                        setInitialMessage('');
                                        setSelectedColis(null);
                                        setManualCodeSuivi('');
                                        setModalError(null);
                                    }}
                                >
                                    Annuler
                                </Button>,
                                <Button
                                    key="submit"
                                    type="primary"
                                    onClick={handleCreateReclamation}
                                    disabled={!initialMessage.trim() || (!selectedColis && !manualCodeSuivi.trim())}
                                >
                                    Créer
                                </Button>
                            ]}
                            width={700}
                        >
                            <div>
                                {modalError ? (
                                    modalError
                                ) : (
                                    <Alert
                                        message="Nouvelle réclamation"
                                        description="Veuillez décrire votre problème concernant ce colis. Notre équipe traitera votre réclamation dans les plus brefs délais."
                                        type="info"
                                        showIcon
                                        style={{ marginBottom: '16px' }}
                                    />
                                )}

                                {selectedColis ? (
                                    <Card title="Détails du colis" style={{ marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div><strong>Code Suivi:</strong> {selectedColis.code_suivi}</div>
                                            <div><strong>Destinataire:</strong> {selectedColis.nom}</div>
                                            <div><strong>Téléphone:</strong> {selectedColis.tele}</div>
                                            <div><strong>Ville:</strong> {selectedColis.ville?.nom || 'N/A'}</div>
                                            <div><strong>Prix:</strong> {selectedColis.prix} DH</div>
                                            <div><strong>Statut:</strong> {selectedColis.statut}</div>
                                        </div>
                                    </Card>
                                ) : (
                                    <Form layout="vertical">
                                        <Form.Item
                                            label="Code Suivi du Colis"
                                            required
                                            rules={[{ required: true, message: 'Veuillez entrer le code suivi du colis' }]}
                                        >
                                            <Input
                                                placeholder="Entrez le code suivi du colis"
                                                value={manualCodeSuivi}
                                                onChange={(e) => setManualCodeSuivi(e.target.value)}
                                                style={{ width: '100%' }}
                                            />
                                        </Form.Item>
                                    </Form>
                                )}

                                <Form layout="vertical">
                                    <Form.Item
                                        label="Votre message"
                                        required
                                        rules={[{ required: true, message: 'Veuillez entrer un message' }]}
                                    >
                                        <Input.TextArea
                                            value={initialMessage}
                                            onChange={(e) => setInitialMessage(e.target.value)}
                                            placeholder="Décrivez votre problème ici..."
                                            rows={6}
                                            style={{ resize: 'none' }}
                                        />
                                    </Form.Item>
                                </Form>
                            </div>
                        </Modal>
                    </div>
                </div>
            </main>
        </div>
    );

    // Handle create reclamation
    function handleCreateReclamation() {
        // Validate required fields
        if (!initialMessage) {
            toast.error("Veuillez entrer un message.");
            return;
        }

        if (!selectedColis && !manualCodeSuivi) {
            toast.error("Veuillez sélectionner un colis ou entrer un code suivi.");
            return;
        }

        // Prepare reclamation data based on what we have
        const reclamationData = {
            initialMessage: initialMessage
        };

        // Add either colisId or code_suivi
        if (selectedColis) {
            reclamationData.colisId = selectedColis._id;
        } else if (manualCodeSuivi) {
            reclamationData.code_suivi = manualCodeSuivi;
        }

        // Show loading toast
        const loadingToast = toast.loading("Création de la réclamation en cours...");

        dispatch(createReclamation(reclamationData))
            .then((response) => {
                toast.dismiss(loadingToast);
                if (response && response.reclamation) {
                    toast.success("Réclamation créée avec succès!");

                    // Close the modal and reset form
                    setCreateModalVisible(false);
                    setInitialMessage('');
                    setSelectedColis(null);
                    setManualCodeSuivi('');
                    setModalError(null);

                    // Refresh reclamations list
                    if (isClient && userStoreId) {
                        dispatch(getReclamationsByStore(userStoreId));
                    } else {
                        dispatch(getAllReclamations());
                    }
                } else {
                    toast.error("Erreur lors de la création de la réclamation.");
                }
            })
            .catch((error) => {
                toast.dismiss(loadingToast);
                console.error('Error creating reclamation:', error);

                // Close the modal only for successful creation
                // For errors, keep it open so the user can see the error and fix their input

                // Handle the case where an open reclamation already exists
                if (error?.response?.status === 400 && error?.response?.data?.reclamationId) {
                    const reclamationId = error.response.data.reclamationId;
                    const colisCode = error.response.data.colisCode;

                    // Show a more informative error with a button to view the existing reclamation
                    // Use Alert component inside the modal instead of toast for better visibility
                    setModalError(
                        <Alert
                            message="Réclamation existante"
                            description={
                                <div>
                                    {error.response.data.message || `Une réclamation ouverte existe déjà pour ce colis ${colisCode ? `(${colisCode})` : ''}.`}
                                    <div style={{ marginTop: '10px' }}>
                                        <Button
                                            type="primary"
                                            onClick={() => {
                                                setCreateModalVisible(false);
                                                handleViewDetails(reclamationId);
                                            }}
                                        >
                                            Voir la réclamation existante
                                        </Button>
                                    </div>
                                </div>
                            }
                            type="error"
                            showIcon
                            style={{ marginBottom: '16px' }}
                        />
                    );
                } else {
                    // Show a generic error message
                    setModalError(
                        <Alert
                            message="Erreur"
                            description={error?.response?.data?.message || "Erreur lors de la création de la réclamation."}
                            type="error"
                            showIcon
                            style={{ marginBottom: '16px' }}
                        />
                    );
                }
            });
    }
}

export default Reclamation;
