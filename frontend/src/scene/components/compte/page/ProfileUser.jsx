import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Avatar, Typography, Spin, Tag, Divider, Button, Statistic, List, message, Modal, InputNumber, Switch, Select, Input, Progress } from 'antd';
import {
    ShopOutlined,
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    DollarOutlined,
    ReloadOutlined,
    WalletOutlined,
    CreditCardOutlined,
    GiftOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    StopOutlined,
    ArrowLeftOutlined,
    CopyOutlined,
    SettingOutlined,
    PlusOutlined,
    MinusOutlined,
    UndoOutlined,
    ExclamationCircleOutlined,
    SafetyOutlined,
    ExportOutlined,
    TrophyOutlined
} from '@ant-design/icons';
import { ThemeContext } from '../../../ThemeContext';
import '../compte.css'
import './profileUser.css'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import { getStoreById } from '../../../../redux/apiCalls/storeApiCalls';
import { toggleActiveClient, verifyClient } from '../../../../redux/apiCalls/profileApiCalls';
import { toggleWalletActivation, depositMoney, withdrawMoney, resetWallet } from '../../../../redux/apiCalls/walletApiCalls';
import { getWithdrawalsByWalletId, createAdminWithdrawal } from '../../../../redux/apiCalls/withdrawalApiCalls';
import { getTransfersByWallet } from '../../../../redux/apiCalls/transferApiCalls';

const { Title, Text } = Typography;

function ProfileUser() {
    const { theme } = useContext(ThemeContext);
    const dispatch = useDispatch();
    const { storeId } = useParams(); // Get store ID from URL parameters
    const { stores, loading, error } = useSelector(state => state.store);
    const { user } = useSelector(state => state.auth); // Get current user for admin check
    const { withdrawals } = useSelector(state => state.withdrawal);
    const { transfers } = useSelector(state => state.transfer);
    const navigate = useNavigate();

    // Admin management states
    const [walletModalVisible, setWalletModalVisible] = useState(false);
    const [walletAction, setWalletAction] = useState(''); // 'deposit', 'withdraw', 'reset'
    const [walletAmount, setWalletAmount] = useState(0);
    const [walletLoading, setWalletLoading] = useState(false);

    // Admin withdrawal states
    const [withdrawalModalVisible, setWithdrawalModalVisible] = useState(false);
    const [withdrawalAmount, setWithdrawalAmount] = useState(100);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [withdrawalNote, setWithdrawalNote] = useState('');
    const [withdrawalLoading, setWithdrawalLoading] = useState(false);

    // Admin panel visibility states
    const [adminPanelOpen, setAdminPanelOpen] = useState({
        user: false,
        wallet: false,
        withdrawals: false,
        transfers: false
    });

    // Check if current user is admin
    const isAdmin = user?.role === 'admin';

    // Toggle admin panel visibility
    const toggleAdminPanel = (panelType) => {
        setAdminPanelOpen(prev => ({
            ...prev,
            [panelType]: !prev[panelType]
        }));
    };

    // Get the store and client data from the API response
    const storeDetails = useSelector(state => state.store.storeDetails);
    const store = storeDetails?.store;
    const client = store?.id_client;
    const wallet = storeDetails?.wallet;
    const payments = storeDetails?.payments || [];
    const colisStats = storeDetails?.colisStats;

    useEffect(() => {
        if (storeId) {
            dispatch(getStoreById(storeId));
        }
    }, [dispatch, storeId]);

    // Fetch withdrawal and transfer data when wallet is available
    useEffect(() => {
        if (wallet && wallet._id && isAdmin) {
            dispatch(getWithdrawalsByWalletId(wallet._id));
            dispatch(getTransfersByWallet(wallet._id));
        }
    }, [dispatch, wallet, isAdmin]);

    const handleRefresh = () => {
        if (storeId) {
            dispatch(getStoreById(storeId));
        }
    };

    const handleGoBack = () => {
        navigate('/dashboard/list-colis'); // Navigate back to colis list
    };

    const getCardStyle = () => ({
        backgroundColor: theme === 'dark' ? '#001529' : '#fff',
        border: theme === 'dark' ? '1px solid #434343' : '1px solid #f0f0f0',
        borderRadius: '8px',
        boxShadow: theme === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
    });

    const getTextColor = () => theme === 'dark' ? '#fff' : '#002242';

    // Copy function
    const copyToClipboard = (text, fieldName) => {
        navigator.clipboard.writeText(text).then(() => {
            message.success(`${fieldName} copié dans le presse-papiers!`);
        }).catch(() => {
            message.error('Erreur lors de la copie');
        });
    };

    // Admin functions for user management
    const handleToggleUserActive = async () => {
        if (!isAdmin || !client) return;

        Modal.confirm({
            title: 'Confirmer l\'action',
            content: `Êtes-vous sûr de vouloir ${client.active ? 'désactiver' : 'activer'} ce compte utilisateur?`,
            icon: <ExclamationCircleOutlined />,
            onOk: async () => {
                try {
                    await dispatch(toggleActiveClient(client._id, 'client'));
                    // Refresh the store data to get updated client info
                    dispatch(getStoreById(storeId));
                    message.success(`Compte ${client.active ? 'désactivé' : 'activé'} avec succès`);
                } catch (error) {
                    message.error('Erreur lors de la modification du statut');
                }
            }
        });
    };

    const handleVerifyClient = async () => {
        if (!isAdmin || !client || client.verify) return;

        Modal.confirm({
            title: 'Vérifier le client',
            content: 'Êtes-vous sûr de vouloir vérifier ce client?',
            icon: <SafetyOutlined />,
            onOk: async () => {
                try {
                    await dispatch(verifyClient(client._id));
                    // Refresh the store data to get updated client info
                    dispatch(getStoreById(storeId));
                    message.success('Client vérifié avec succès');
                } catch (error) {
                    message.error('Erreur lors de la vérification');
                }
            }
        });
    };

    // Admin functions for wallet management
    const handleToggleWalletActive = async () => {
        if (!isAdmin || !wallet) return;

        Modal.confirm({
            title: 'Confirmer l\'action',
            content: `Êtes-vous sûr de vouloir ${wallet.active ? 'désactiver' : 'activer'} ce portefeuille?`,
            icon: <ExclamationCircleOutlined />,
            onOk: async () => {
                try {
                    await dispatch(toggleWalletActivation(wallet._id));
                    // Refresh the store data to get updated wallet info
                    dispatch(getStoreById(storeId));
                    message.success(`Portefeuille ${wallet.active ? 'désactivé' : 'activé'} avec succès`);
                } catch (error) {
                    message.error('Erreur lors de la modification du statut du portefeuille');
                }
            }
        });
    };

    const openWalletModal = (action) => {
        setWalletAction(action);
        setWalletAmount(0);
        setWalletModalVisible(true);
    };

    const handleWalletAction = async () => {
        if (!isAdmin || !wallet || walletAmount <= 0) return;

        setWalletLoading(true);
        try {
            switch (walletAction) {
                case 'deposit':
                    await dispatch(depositMoney(wallet._id, walletAmount));
                    break;
                case 'withdraw':
                    await dispatch(withdrawMoney(wallet._id, walletAmount));
                    break;
                default:
                    return;
            }
            // Refresh the store data to get updated wallet info
            dispatch(getStoreById(storeId));
            setWalletModalVisible(false);
            setWalletAmount(0);
        } catch (error) {
            message.error(`Erreur lors de l'opération sur le portefeuille`);
        } finally {
            setWalletLoading(false);
        }
    };

    const handleResetWallet = async () => {
        if (!isAdmin || !wallet) return;

        Modal.confirm({
            title: 'Réinitialiser le portefeuille',
            content: 'Êtes-vous sûr de vouloir réinitialiser ce portefeuille? Cette action remettra le solde à 0 et désactivera le portefeuille.',
            icon: <ExclamationCircleOutlined />,
            okType: 'danger',
            onOk: async () => {
                try {
                    await dispatch(resetWallet(wallet._id));
                    // Refresh the store data to get updated wallet info
                    dispatch(getStoreById(storeId));
                    message.success('Portefeuille réinitialisé avec succès');
                } catch (error) {
                    message.error('Erreur lors de la réinitialisation du portefeuille');
                }
            }
        });
    };

    // Admin withdrawal functions
    const openWithdrawalModal = () => {
        if (!payments || payments.length === 0) {
            message.error('Aucune méthode de paiement disponible pour ce client');
            return;
        }
        setSelectedPayment(payments[0]._id); // Select first payment method by default
        setWithdrawalAmount(100);
        setWithdrawalNote('');
        setWithdrawalModalVisible(true);
    };

    const handleAdminWithdrawal = async () => {
        if (!isAdmin || !wallet || !selectedPayment || withdrawalAmount < 100) {
            message.error('Données invalides pour la demande de retrait');
            return;
        }

        if (withdrawalAmount > wallet.solde) {
            message.error('Montant supérieur au solde disponible');
            return;
        }

        setWithdrawalLoading(true);
        try {
            await dispatch(createAdminWithdrawal({
                walletId: wallet._id,
                paymentId: selectedPayment,
                montant: withdrawalAmount,
                note: withdrawalNote || `Admin withdrawal: ${withdrawalAmount - 5} DH (+ 5 DH fees)`
            }));

            // Refresh data
            dispatch(getStoreById(storeId));
            if (wallet._id) {
                dispatch(getWithdrawalsByWalletId(wallet._id));
                dispatch(getTransfersByWallet(wallet._id));
            }

            // Reset and close modal
            setWithdrawalModalVisible(false);
            setWithdrawalAmount(100);
            setSelectedPayment(null);
            setWithdrawalNote('');

            message.success('Demande de retrait créée avec succès');
        } catch (error) {
            message.error('Erreur lors de la création de la demande de retrait');
        } finally {
            setWithdrawalLoading(false);
        }
    };

    return (
        <>
        <div className='page-dashboard'>
            <Menubar />
            <main className="page-main">
                <Topbar />
                <div
                    className={`page-content profile-user-container ${theme}`}
                    style={{
                        backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray1)',
                        color: theme === 'dark' ? '#fff' : '#002242',
                    }}
                >
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                            padding: '24px'
                        }}
                    >
                        <div className="profile-header">
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '24px'
                            }}>
                                <Button
                                    className="back-button fade-in-up"
                                    icon={<ArrowLeftOutlined />}
                                    onClick={handleGoBack}
                                >
                                    Retour à la liste des colis
                                </Button>
                                <Button
                                    className="admin-button admin-button-primary"
                                    icon={<ReloadOutlined />}
                                    onClick={handleRefresh}
                                    loading={loading}
                                >
                                    Actualiser
                                </Button>
                            </div>
                        </div>

                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '50px' }}>
                                    <Spin size="large" />
                                    <div style={{ marginTop: '16px', color: getTextColor() }}>
                                        Chargement des données...
                                    </div>
                                </div>
                            ) : error ? (
                                <Card style={getCardStyle()}>
                                    <div style={{ textAlign: 'center', color: '#ff4d4f' }}>
                                        <Text strong>Erreur: {error}</Text>
                                    </div>
                                </Card>
                            ) : store ? (
                                <>
                                <div style={{ padding: '0 8px' }}>
                                    <Row gutter={[16, 24]}>
                                            {/* Enhanced User and Store Information Card - Full Width Header */}
                                            <Col xs={24}>
                                                <Card
                                                    className="profile-card fade-in-up"
                                                    style={{ marginBottom: '16px' }}
                                                >
                                            {/* User Profile Header */}
                                            <div className="user-profile-section">
                                                <div className="user-avatar-container">
                                                    <Avatar
                                                        className="user-avatar"
                                                        size={120}
                                                        src={client?.profile?.url}
                                                        icon={<UserOutlined />}
                                                    />
                                                </div>
                                                <div className="user-info">
                                                    <Title className="user-name">
                                                        {client?.nom} {client?.prenom}
                                                    </Title>
                                                    <Text className="user-role">
                                                        {client?.role === 'client' ? 'Client' : client?.role}
                                                    </Text>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                                                        <div className="status-tags">
                                                            <Tag
                                                                className="status-tag"
                                                                color={theme === 'dark' ? '#434343' : '#f0f0f0'}
                                                            >
                                                                {client?.role === 'client' ? 'Client' : client?.role}
                                                            </Tag>
                                                            <Tag
                                                                className="status-tag"
                                                                color={client?.active ? '#52c41a' : '#ff4d4f'}
                                                            >
                                                                {client?.active ? 'Actif' : 'Inactif'}
                                                            </Tag>
                                                            <Tag
                                                                className="status-tag"
                                                                color={client?.verify ? '#52c41a' : '#fa8c16'}
                                                            >
                                                                {client?.verify ? 'Vérifié' : 'Non vérifié'}
                                                            </Tag>
                                                        </div>

                                                        {/* Admin Parameters Button */}
                                                        {isAdmin && (
                                                            <Button
                                                                className="admin-button admin-button-primary"
                                                                icon={<SettingOutlined />}
                                                                onClick={() => toggleAdminPanel('user')}
                                                                size="small"
                                                                style={{
                                                                    borderRadius: '20px',
                                                                    padding: '4px 12px',
                                                                    height: 'auto',
                                                                    fontSize: '12px'
                                                                }}
                                                            >
                                                                Paramètres
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {/* Collapsible Admin Controls */}
                                                    {isAdmin && adminPanelOpen.user && (
                                                        <div className="admin-controls" style={{ marginTop: '16px' }}>
                                                            <div className="admin-controls-buttons">
                                                                <Button
                                                                    className={`admin-button ${client?.active ? 'admin-button-danger' : 'admin-button-success'}`}
                                                                    icon={<SettingOutlined />}
                                                                    onClick={handleToggleUserActive}
                                                                    size="small"
                                                                    block
                                                                >
                                                                    {client?.active ? 'Désactiver' : 'Activer'} Compte
                                                                </Button>
                                                                {!client?.verify && (
                                                                    <Button
                                                                        className="admin-button admin-button-success"
                                                                        icon={<SafetyOutlined />}
                                                                        onClick={handleVerifyClient}
                                                                        size="small"
                                                                        block
                                                                    >
                                                                        Vérifier Client
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    </Col>

                                    {/* User Information Grid */}
                                    <Col xs={24}>
                                        <Card className="profile-card fade-in-up">
                                            <Title level={4} style={{ marginBottom: '24px' }}>
                                                Informations Détaillées
                                            </Title>
                                            <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
                                                <Col xs={24} md={12}>
                                                    <Card 
                                                        size="small"
                                                        style={{
                                                            background: theme === 'dark' ? '#1a1a1a' : '#f8f9fa',
                                                            border: 'none',
                                                            borderRadius: '12px'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                                            <div style={{
                                                                background: theme === 'dark' ? '#434343' : '#f0f0f0',
                                                                borderRadius: '50%',
                                                                width: '32px',
                                                                height: '32px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}>
                                                                <MailOutlined style={{ color: getTextColor(), fontSize: '16px' }} />
                                                            </div>
                                                            <Title level={5} style={{ color: getTextColor(), margin: 0 }}>
                                                                Contact Information
                                                            </Title>
                                                        </div>
                                                        
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                                            <MailOutlined style={{ color: getTextColor(), fontSize: '16px' }} />
                                                            <div style={{ flex: 1 }}>
                                                                <Text strong style={{ color: getTextColor(), display: 'block' }}>Email</Text>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <Text style={{ color: getTextColor() }}>{client?.email}</Text>
                                                                    <Button 
                                                                        type="text" 
                                                                        size="small" 
                                                                        icon={<CopyOutlined />} 
                                                                        onClick={() => copyToClipboard(client?.email, 'Email')}
                                                                        style={{ 
                                                                            padding: '4px 8px', 
                                                                            minWidth: 'auto',
                                                                            color: getTextColor()
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                                            <PhoneOutlined style={{ color: getTextColor(), fontSize: '16px' }} />
                                                            <div style={{ flex: 1 }}>
                                                                <Text strong style={{ color: getTextColor(), display: 'block' }}>Téléphone</Text>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <Text style={{ color: getTextColor() }}>{client?.tele}</Text>
                                                                    <Button 
                                                                        type="text" 
                                                                        size="small" 
                                                                        icon={<CopyOutlined />} 
                                                                        onClick={() => copyToClipboard(client?.tele, 'Téléphone')}
                                                                        style={{ 
                                                                            padding: '4px 8px', 
                                                                            minWidth: 'auto',
                                                                            color: getTextColor()
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <EnvironmentOutlined style={{ color: getTextColor(), fontSize: '16px' }} />
                                                            <div>
                                                                <Text strong style={{ color: getTextColor(), display: 'block' }}>Ville</Text>
                                                                <Text style={{ color: getTextColor() }}>{client?.ville}</Text>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                </Col>

                                                <Col xs={24} md={12}>
                                                    <Card 
                                                        size="small"
                                                        style={{
                                                            background: theme === 'dark' ? '#1a1a1a' : '#f8f9fa',
                                                            border: 'none',
                                                            borderRadius: '12px'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                                            <div style={{
                                                                background: theme === 'dark' ? '#434343' : '#f0f0f0',
                                                                borderRadius: '50%',
                                                                width: '32px',
                                                                height: '32px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}>
                                                                <EnvironmentOutlined style={{ color: getTextColor(), fontSize: '16px' }} />
                                                            </div>
                                                            <Title level={5} style={{ color: getTextColor(), margin: 0 }}>
                                                                Localisation
                                                            </Title>
                                                        </div>
                                                        
                                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                                                            <EnvironmentOutlined style={{ color: getTextColor(), fontSize: '16px', marginTop: '2px' }} />
                                                            <div>
                                                                <Text strong style={{ color: getTextColor(), display: 'block' }}>Adresse</Text>
                                                                <Text style={{ color: getTextColor() }}>{client?.adresse}</Text>
                                                            </div>
                                                        </div>
                                                        
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                                            <UserOutlined style={{ color: getTextColor(), fontSize: '16px' }} />
                                                            <div>
                                                                <Text strong style={{ color: getTextColor(), display: 'block' }}>Nom d'utilisateur</Text>
                                                                <Text style={{ color: getTextColor() }}>{client?.username}</Text>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                </Col>
                                            </Row>

                                            {/* Store Information Section */}
                                            <div style={{ 
                                                background: theme === 'dark' ? '#1f1f1f' : '#f8f9fa',
                                                margin: '0 -32px -32px -32px',
                                                padding: '32px',
                                                position: 'relative',
                                                borderTop: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
                                            }}>
                                                <div style={{ position: 'relative', zIndex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                                        <div style={{
                                                            background: theme === 'dark' ? '#434343' : '#f0f0f0',
                                                            borderRadius: '50%',
                                                            width: '48px',
                                                            height: '48px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <ShopOutlined style={{ color: getTextColor(), fontSize: '24px' }} />
                                                        </div>
                                                        <div>
                                                            <Title level={3} style={{ color: getTextColor(), margin: 0, marginBottom: '8px' }}>
                                                                Informations Boutique
                                                            </Title>
                                                            <Text style={{ color: getTextColor(), fontSize: '16px', opacity: 0.7 }}>
                                                                Détails de l'établissement commercial
                                                            </Text>
                                                        </div>
                                                    </div>

                                                    <Row gutter={[24, 24]}>
                                                        <Col xs={24} md={12}>
                                                            <div style={{
                                                                background: theme === 'dark' ? '#1a1a1a' : '#fff',
                                                                padding: '20px',
                                                                borderRadius: '12px',
                                                                border: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
                                                            }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                                                    <ShopOutlined style={{ color: getTextColor(), fontSize: '18px' }} />
                                                                    <Text strong style={{ color: getTextColor(), fontSize: '16px' }}>
                                                                        Nom de la boutique
                                                                    </Text>
                                                                </div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                                    <div style={{ flex: 1 }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                            <Text style={{ color: getTextColor(), fontSize: '18px', fontWeight: 'bold' }}>
                                                                                {store.storeName}
                                                                            </Text>
                                                                            <Button
                                                                                type="text"
                                                                                size="small"
                                                                                icon={<CopyOutlined />}
                                                                                onClick={() => copyToClipboard(store.storeName, 'Nom de la boutique')}
                                                                                style={{
                                                                                    padding: '4px 8px',
                                                                                    minWidth: 'auto',
                                                                                    color: getTextColor()
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    {store.image && store.image.url && (
                                                                        <div style={{ flexShrink: 0 }}>
                                                                            <img
                                                                                src={store.image.url}
                                                                                alt="Store"
                                                                                style={{
                                                                                    width: '60px',
                                                                                    height: '60px',
                                                                                    objectFit: 'cover',
                                                                                    borderRadius: '8px',
                                                                                    border: `2px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`,
                                                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </Col>

                                                        <Col xs={24} md={12}>
                                                            <div style={{ 
                                                                background: theme === 'dark' ? '#1a1a1a' : '#fff', 
                                                                padding: '20px', 
                                                                borderRadius: '12px',
                                                                border: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
                                                            }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                                                    <PhoneOutlined style={{ color: getTextColor(), fontSize: '18px' }} />
                                                                    <Text strong style={{ color: getTextColor(), fontSize: '16px' }}>
                                                                        Téléphone Boutique
                                                                    </Text>
                                                                </div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <Text style={{ color: getTextColor(), fontSize: '18px', fontWeight: 'bold' }}>
                                                                        {store.tele}
                                                                    </Text>
                                                                    <Button 
                                                                        type="text" 
                                                                        size="small" 
                                                                        icon={<CopyOutlined />} 
                                                                        onClick={() => copyToClipboard(store.tele, 'Téléphone Boutique')}
                                                                        style={{ 
                                                                            padding: '4px 8px', 
                                                                            minWidth: 'auto',
                                                                            color: getTextColor()
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </Col>


                                                    </Row>
                                                </div>
                                            </div>
                                        </Card>
                                    </Col>

                                    {/* Financial & Performance Overview Section */}
                                    <Col xs={24}>
                                        <div className="financial-section">
                                            <Row gutter={[16, 20]}>
                                            {/* Enhanced Wallet Information Card */}
                                            <Col xs={24} sm={12} md={8} lg={8}>
                                        <Card
                                            className="profile-card fade-in-up"
                                            title={
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                    <div className="card-header">
                                                        <div className="card-icon">
                                                            <WalletOutlined />
                                                        </div>
                                                        <Title className="card-title">
                                                            Portefeuille
                                                        </Title>
                                                    </div>
                                                    {isAdmin && (
                                                        <Button
                                                            className="admin-button admin-button-primary"
                                                            icon={<SettingOutlined />}
                                                            onClick={() => toggleAdminPanel('wallet')}
                                                            size="small"
                                                            style={{
                                                                borderRadius: '20px',
                                                                padding: '4px 12px',
                                                                height: 'auto',
                                                                fontSize: '12px'
                                                            }}
                                                        >
                                                            Paramètres
                                                        </Button>
                                                    )}
                                                </div>
                                            }
                                        >
                                            {wallet ? (
                                                <div>
                                                    <div style={{
                                                        background: theme === 'dark' ? '#1f1f1f' : '#f8f9fa',
                                                        padding: '20px',
                                                        borderRadius: '12px',
                                                        marginBottom: '20px',
                                                        border: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
                                                    }}>
                                                        <Row gutter={[16, 16]} align="middle">
                                                            <Col span={12}>
                                                                <Statistic
                                                                    title="Solde Actuel"
                                                                    value={wallet.solde}
                                                                    suffix="DH"
                                                                    valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 'bold' }}
                                                                />
                                                            </Col>
                                                        </Row>

                                                        {/* Wallet Status Indicator */}
                                                        <div style={{
                                                            marginTop: '16px',
                                                            padding: '12px',
                                                            background: wallet.active
                                                                ? 'linear-gradient(135deg, #52c41a20, #52c41a10)'
                                                                : 'linear-gradient(135deg, #ff4d4f20, #ff4d4f10)',
                                                            borderRadius: '8px',
                                                            border: `1px solid ${wallet.active ? '#52c41a' : '#ff4d4f'}`,
                                                            textAlign: 'center'
                                                        }}>
                                                            <Text style={{
                                                                color: wallet.active ? '#52c41a' : '#ff4d4f',
                                                                fontWeight: 'bold',
                                                                fontSize: '16px'
                                                            }}>
                                                                {wallet.active ? '✓ Portefeuille Actif' : '✗ Portefeuille Inactif'}
                                                            </Text>
                                                        </div>
                                                    </div>
                                                    
                                                    <div style={{ marginBottom: '16px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                            <Text strong style={{ color: getTextColor() }}>Clé:</Text>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <Text style={{ color: getTextColor(), fontSize: '14px' }}>{wallet.key}</Text>
                                                            <Button 
                                                                type="text" 
                                                                size="small" 
                                                                icon={<CopyOutlined />} 
                                                                onClick={() => copyToClipboard(wallet.key, 'Clé du portefeuille')}
                                                                style={{ 
                                                                    padding: '4px 8px', 
                                                                    minWidth: 'auto',
                                                                    color: getTextColor()
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    <div style={{ marginBottom: '16px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                            <Text strong style={{ color: getTextColor() }}>Statut:</Text>
                                                            <Tag 
                                                                color={wallet.active ? 'green' : 'red'} 
                                                                style={{ marginLeft: '8px' }}
                                                            >
                                                                {wallet.active ? 'Actif' : 'Inactif'}
                                                            </Tag>
                                                        </div>
                                                    </div>
                                                    
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                            <Text strong style={{ color: getTextColor() }}>Créé le:</Text>
                                                        </div>
                                                        <Text style={{ color: getTextColor(), fontSize: '14px' }}>
                                                            {new Date(wallet.createdAt).toLocaleDateString()}
                                                        </Text>
                                                    </div>

                                                    {/* Collapsible Admin Controls for Wallet Management */}
                                                    {isAdmin && adminPanelOpen.wallet && (
                                                        <div className="admin-controls">
                                                            <div className="wallet-buttons-container">
                                                                <button
                                                                    className={`wallet-button wallet-button-full ${wallet.active ? 'wallet-button-danger' : 'wallet-button-success'}`}
                                                                    onClick={handleToggleWalletActive}
                                                                >
                                                                    <SettingOutlined />
                                                                    {wallet.active ? 'Désactiver' : 'Activer'} Portefeuille
                                                                </button>
                                                                
                                                                <div className="wallet-button-row">
                                                                    <button
                                                                        className="wallet-button wallet-button-success"
                                                                        onClick={() => openWalletModal('deposit')}
                                                                    >
                                                                        <PlusOutlined />
                                                                        Dépôt
                                                                    </button>
                                                                    <button
                                                                        className="wallet-button wallet-button-warning"
                                                                        onClick={() => openWalletModal('withdraw')}
                                                                    >
                                                                        <MinusOutlined />
                                                                        Retrait
                                                                    </button>
                                                                </div>
                                                                
                                                                <button
                                                                    className="wallet-button wallet-button-full wallet-button-primary"
                                                                    onClick={openWithdrawalModal}
                                                                >
                                                                    <MinusOutlined />
                                                                    Créer Retrait
                                                                </button>
                                                                
                                                                <button
                                                                    className="wallet-button wallet-button-full wallet-button-danger"
                                                                    onClick={handleResetWallet}
                                                                >
                                                                    <UndoOutlined />
                                                                    Réinitialiser
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div style={{ 
                                                    textAlign: 'center', 
                                                    padding: '40px 20px',
                                                    background: theme === 'dark' ? '#1f1f1f' : '#f8f9fa',
                                                    borderRadius: '12px',
                                                    border: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
                                                }}>
                                                    <WalletOutlined style={{ fontSize: '48px', color: getTextColor(), marginBottom: '16px', opacity: 0.5 }} />
                                                    <Text type="secondary" style={{ color: getTextColor() }}>
                                                        Aucun portefeuille trouvé
                                                    </Text>
                                                </div>
                                            )}
                                                </Card>
                                            </Col>

                                            {/* Performance Summary Card */}
                                            <Col xs={24} sm={12} md={8} lg={8}>
                                        <Card
                                            className="profile-card fade-in-up"
                                            title={
                                                <div className="card-header">
                                                    <div className="card-icon">
                                                        <TrophyOutlined />
                                                    </div>
                                                    <Title className="card-title">
                                                        Performance
                                                    </Title>
                                                </div>
                                            }
                                        >
                                            {colisStats ? (
                                                <div>
                                                    {/* Success Rate */}
                                                    <div style={{
                                                        background: theme === 'dark' ? '#1f1f1f' : '#f8f9fa',
                                                        padding: '20px',
                                                        borderRadius: '12px',
                                                        marginBottom: '16px',
                                                        border: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
                                                    }}>
                                                        <Text style={{ color: getTextColor(), fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                                                            Taux de Livraison
                                                        </Text>
                                                        <Progress
                                                            percent={colisStats.total > 0 ? Math.round((colisStats.livree / colisStats.total) * 100) : 0}
                                                            strokeColor="#52c41a"
                                                            trailColor={theme === 'dark' ? '#434343' : '#f0f0f0'}
                                                            showInfo={true}
                                                            format={(percent) => `${percent}%`}
                                                        />
                                                        <Text style={{ color: '#52c41a', fontSize: '18px', fontWeight: 'bold' }}>
                                                            {colisStats.livree} / {colisStats.total}
                                                        </Text>
                                                    </div>

                                                    {/* Cancellation Rate */}
                                                    <div style={{
                                                        background: theme === 'dark' ? '#1f1f1f' : '#f8f9fa',
                                                        padding: '20px',
                                                        borderRadius: '12px',
                                                        marginBottom: '16px',
                                                        border: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
                                                    }}>
                                                        <Text style={{ color: getTextColor(), fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                                                            Taux d'Annulation
                                                        </Text>
                                                        <Progress
                                                            percent={colisStats.total > 0 ? Math.round((colisStats.annulee / colisStats.total) * 100) : 0}
                                                            strokeColor="#ff4d4f"
                                                            trailColor={theme === 'dark' ? '#434343' : '#f0f0f0'}
                                                            showInfo={true}
                                                            format={(percent) => `${percent}%`}
                                                        />
                                                        <Text style={{ color: '#ff4d4f', fontSize: '18px', fontWeight: 'bold' }}>
                                                            {colisStats.annulee} / {colisStats.total}
                                                        </Text>
                                                    </div>

                                                    {/* Overall Score */}
                                                    <div style={{
                                                        background: 'linear-gradient(135deg, #1890ff20, #1890ff10)',
                                                        padding: '20px',
                                                        borderRadius: '12px',
                                                        border: `1px solid #1890ff`,
                                                        textAlign: 'center'
                                                    }}>
                                                        <Text style={{ color: getTextColor(), fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                                                            Score Global
                                                        </Text>
                                                        <Progress
                                                            type="circle"
                                                            percent={colisStats.total > 0 ? Math.round(((colisStats.livree * 2 + (colisStats.total - colisStats.annulee - colisStats.refusee)) / (colisStats.total * 2)) * 100) : 0}
                                                            size={100}
                                                            strokeColor={{
                                                                '0%': '#ff4d4f',
                                                                '50%': '#fa8c16',
                                                                '80%': '#52c41a',
                                                                '100%': '#1890ff'
                                                            }}
                                                            format={(percent) => (
                                                                <span style={{ color: getTextColor(), fontSize: '16px', fontWeight: 'bold' }}>
                                                                    {percent}%
                                                                </span>
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{
                                                    textAlign: 'center',
                                                    padding: '40px 20px',
                                                    background: theme === 'dark' ? '#1f1f1f' : '#f8f9fa',
                                                    borderRadius: '12px',
                                                    border: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
                                                }}>
                                                    <TrophyOutlined style={{ fontSize: '48px', color: getTextColor(), marginBottom: '16px', opacity: 0.5 }} />
                                                    <Text type="secondary" style={{ color: getTextColor() }}>
                                                        Aucune donnée de performance
                                                    </Text>
                                                </div>
                                            )}
                                                </Card>
                                            </Col>

                                            {/* Enhanced Colis Statistics Card with Charts */}
                                            <Col xs={24} md={16} lg={16}>
                                        <Card
                                            className="profile-card fade-in-up"
                                            title={
                                                <div className="card-header">
                                                    <div className="card-icon">
                                                        <GiftOutlined />
                                                    </div>
                                                    <Title className="card-title">
                                                        Statistiques Colis
                                                    </Title>
                                                </div>
                                            }
                                        >
                                            {colisStats ? (
                                                <div>
                                                    {/* Statistics Summary */}
                                                    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                                                        <Col span={6}>
                                                            <div style={{
                                                                background: theme === 'dark' ? '#1f1f1f' : '#f8f9fa',
                                                                padding: '16px',
                                                                borderRadius: '12px',
                                                                textAlign: 'center',
                                                                border: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
                                                            }}>
                                                                <Statistic
                                                                    title="Total"
                                                                    value={colisStats.total}
                                                                    valueStyle={{ color: '#1890ff', fontSize: '20px', fontWeight: 'bold' }}
                                                                />
                                                            </div>
                                                        </Col>
                                                        <Col span={6}>
                                                            <div style={{
                                                                background: theme === 'dark' ? '#1f1f1f' : '#f8f9fa',
                                                                padding: '16px',
                                                                borderRadius: '12px',
                                                                textAlign: 'center',
                                                                border: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
                                                            }}>
                                                                <Statistic
                                                                    title="Livrée"
                                                                    value={colisStats.livree}
                                                                    valueStyle={{ color: '#52c41a', fontSize: '20px', fontWeight: 'bold' }}
                                                                    prefix={<CheckCircleOutlined />}
                                                                />
                                                            </div>
                                                        </Col>
                                                        <Col span={6}>
                                                            <div style={{
                                                                background: theme === 'dark' ? '#1f1f1f' : '#f8f9fa',
                                                                padding: '16px',
                                                                borderRadius: '12px',
                                                                textAlign: 'center',
                                                                border: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
                                                            }}>
                                                                <Statistic
                                                                    title="Annulée"
                                                                    value={colisStats.annulee}
                                                                    valueStyle={{ color: '#ff4d4f', fontSize: '20px', fontWeight: 'bold' }}
                                                                    prefix={<CloseCircleOutlined />}
                                                                />
                                                            </div>
                                                        </Col>
                                                        <Col span={6}>
                                                            <div style={{
                                                                background: theme === 'dark' ? '#1f1f1f' : '#f8f9fa',
                                                                padding: '16px',
                                                                borderRadius: '12px',
                                                                textAlign: 'center',
                                                                border: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
                                                            }}>
                                                                <Statistic
                                                                    title="Refusée"
                                                                    value={colisStats.refusee}
                                                                    valueStyle={{ color: '#fa8c16', fontSize: '20px', fontWeight: 'bold' }}
                                                                    prefix={<StopOutlined />}
                                                                />
                                                            </div>
                                                        </Col>
                                                    </Row>

                                                    {/* Charts Section */}
                                                    <Row gutter={[24, 24]}>
                                                        {/* Pie Chart */}
                                                        <Col xs={24} md={12}>
                                                            <div className="chart-container" style={{
                                                                background: theme === 'dark' ? '#1f1f1f' : '#f8f9fa',
                                                                padding: '20px',
                                                                borderRadius: '12px',
                                                                border: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
                                                            }}>
                                                                <Title level={5} style={{ color: getTextColor(), textAlign: 'center', marginBottom: '16px' }}>
                                                                    Répartition des Colis
                                                                </Title>
                                                                <ResponsiveContainer width="100%" height={250}>
                                                                    <PieChart>
                                                                        <Pie
                                                                            data={[
                                                                                { name: 'Livrée', value: colisStats.livree, color: '#52c41a' },
                                                                                { name: 'Annulée', value: colisStats.annulee, color: '#ff4d4f' },
                                                                                { name: 'Refusée', value: colisStats.refusee, color: '#fa8c16' },
                                                                                { name: 'En cours', value: colisStats.total - colisStats.livree - colisStats.annulee - colisStats.refusee, color: '#1890ff' }
                                                                            ].filter(item => item.value > 0)}
                                                                            cx="50%"
                                                                            cy="50%"
                                                                            labelLine={false}
                                                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                                            outerRadius={80}
                                                                            fill="#8884d8"
                                                                            dataKey="value"
                                                                        >
                                                                            {[
                                                                                { name: 'Livrée', value: colisStats.livree, color: '#52c41a' },
                                                                                { name: 'Annulée', value: colisStats.annulee, color: '#ff4d4f' },
                                                                                { name: 'Refusée', value: colisStats.refusee, color: '#fa8c16' },
                                                                                { name: 'En cours', value: colisStats.total - colisStats.livree - colisStats.annulee - colisStats.refusee, color: '#1890ff' }
                                                                            ].filter(item => item.value > 0).map((entry, index) => (
                                                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                                                            ))}
                                                                        </Pie>
                                                                        <RechartsTooltip
                                                                            contentStyle={{
                                                                                backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
                                                                                border: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`,
                                                                                borderRadius: '8px',
                                                                                color: getTextColor()
                                                                            }}
                                                                        />
                                                                    </PieChart>
                                                                </ResponsiveContainer>
                                                            </div>
                                                        </Col>

                                                        {/* Bar Chart */}
                                                        <Col xs={24} md={12}>
                                                            <div className="chart-container" style={{
                                                                background: theme === 'dark' ? '#1f1f1f' : '#f8f9fa',
                                                                padding: '20px',
                                                                borderRadius: '12px',
                                                                border: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
                                                            }}>
                                                                <Title level={5} style={{ color: getTextColor(), textAlign: 'center', marginBottom: '16px' }}>
                                                                    Comparaison des Statuts
                                                                </Title>
                                                                <ResponsiveContainer width="100%" height={250}>
                                                                    <BarChart
                                                                        data={[
                                                                            { name: 'Livrée', value: colisStats.livree, color: '#52c41a' },
                                                                            { name: 'Annulée', value: colisStats.annulee, color: '#ff4d4f' },
                                                                            { name: 'Refusée', value: colisStats.refusee, color: '#fa8c16' },
                                                                            { name: 'En cours', value: colisStats.total - colisStats.livree - colisStats.annulee - colisStats.refusee, color: '#1890ff' }
                                                                        ]}
                                                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                                    >
                                                                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#434343' : '#f0f0f0'} />
                                                                        <XAxis
                                                                            dataKey="name"
                                                                            tick={{ fill: getTextColor(), fontSize: 12 }}
                                                                            axisLine={{ stroke: theme === 'dark' ? '#434343' : '#f0f0f0' }}
                                                                        />
                                                                        <YAxis
                                                                            tick={{ fill: getTextColor(), fontSize: 12 }}
                                                                            axisLine={{ stroke: theme === 'dark' ? '#434343' : '#f0f0f0' }}
                                                                        />
                                                                        <RechartsTooltip
                                                                            contentStyle={{
                                                                                backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
                                                                                border: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`,
                                                                                borderRadius: '8px',
                                                                                color: getTextColor()
                                                                            }}
                                                                        />
                                                                        <Bar dataKey="value" fill="#1890ff">
                                                                            {[
                                                                                { name: 'Livrée', value: colisStats.livree, color: '#52c41a' },
                                                                                { name: 'Annulée', value: colisStats.annulee, color: '#ff4d4f' },
                                                                                { name: 'Refusée', value: colisStats.refusee, color: '#fa8c16' },
                                                                                { name: 'En cours', value: colisStats.total - colisStats.livree - colisStats.annulee - colisStats.refusee, color: '#1890ff' }
                                                                            ].map((entry, index) => (
                                                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                                                            ))}
                                                                        </Bar>
                                                                    </BarChart>
                                                                </ResponsiveContainer>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            ) : (
                                                <div style={{
                                                    textAlign: 'center',
                                                    padding: '40px 20px',
                                                    background: theme === 'dark' ? '#1f1f1f' : '#f8f9fa',
                                                    borderRadius: '12px',
                                                    border: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
                                                }}>
                                                    <GiftOutlined style={{ fontSize: '48px', color: getTextColor(), marginBottom: '16px', opacity: 0.5 }} />
                                                    <Text type="secondary" style={{ color: getTextColor() }}>
                                                        Aucune statistique disponible
                                                    </Text>
                                                </div>
                                                )}
                                            </Card>
                                        </Col>
                                            </Row>
                                        </div>
                                    </Col>

                                    {/* Payment & Transaction Management Section */}
                                    <Col xs={24}>
                                        <div className="payment-section">
                                            <Row gutter={[16, 20]}>
                                            {/* Enhanced Payment Methods Card */}
                                            <Col xs={24} sm={24} md={12} lg={8} xl={6}>
                                        <Card 
                                            title={
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ 
                                                        background: theme === 'dark' ? '#434343' : '#f0f0f0',
                                                        borderRadius: '50%',
                                                        width: '32px',
                                                        height: '32px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <CreditCardOutlined style={{ color: getTextColor(), fontSize: '16px' }} />
                                                    </div>
                                                    <Title level={4} style={{ color: getTextColor(), margin: 0 }}>
                                                        Méthodes de Paiement
                                                    </Title>
                                                </div>
                                            }
                                            style={{
                                                ...getCardStyle(),
                                                borderRadius: '16px',
                                                boxShadow: theme === 'dark' 
                                                    ? '0 8px 32px rgba(0,0,0,0.4)' 
                                                    : '0 8px 32px rgba(0,0,0,0.1)',
                                                overflow: 'hidden'
                                            }}
                                            bodyStyle={{ padding: '24px' }}
                                        >
                                            {payments.length > 0 ? (
                                                <List
                                                    dataSource={payments}
                                                    renderItem={(payment) => (
                                                        <List.Item style={{ 
                                                            padding: '16px 0',
                                                            borderBottom: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
                                                        }}>
                                                            <div style={{ 
                                                                width: '100%',
                                                                background: theme === 'dark' ? '#1f1f1f' : '#f8f9fa',
                                                                padding: '16px',
                                                                borderRadius: '12px',
                                                                border: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
                                                            }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                                    <Text strong style={{ color: getTextColor(), fontSize: '16px' }}>
                                                                        {payment.nom}
                                                                    </Text>
                                                                    {payment.default && (
                                                                        <Tag color="green" size="small">Par défaut</Tag>
                                                                    )}
                                                                </div>
                                                                <div style={{ marginBottom: '8px' }}>
                                                                    <Text type="secondary" style={{ color: getTextColor() }}>
                                                                        <strong>Banque:</strong> {payment.idBank?.Bank || 'Non spécifiée'}
                                                                    </Text>
                                                                </div>
                                                                <div style={{ marginBottom: '8px' }}>
                                                                    <Text type="secondary" style={{ color: getTextColor() }}>
                                                                        <strong>RIB:</strong>
                                                                    </Text>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                                        <Text type="secondary" style={{ color: getTextColor() }}>
                                                                            {payment.rib}
                                                                        </Text>
                                                                        <Button 
                                                                            type="text" 
                                                                            size="small" 
                                                                            icon={<CopyOutlined />} 
                                                                            onClick={() => copyToClipboard(payment.rib, 'RIB')}
                                                                            style={{ 
                                                                                padding: '4px 8px', 
                                                                                minWidth: 'auto',
                                                                                color: getTextColor()
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                {payment.idBank?.image?.url && (
                                                                    <div style={{ marginTop: '8px' }}>
                                                                        <img 
                                                                            src={payment.idBank.image.url} 
                                                                            alt="Bank Logo" 
                                                                            style={{ 
                                                                                width: '40px', 
                                                                                height: '25px', 
                                                                                objectFit: 'contain',
                                                                                borderRadius: '4px'
                                                                            }} 
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </List.Item>
                                                    )}
                                                />
                                            ) : (
                                                <div style={{ 
                                                    textAlign: 'center', 
                                                    padding: '40px 20px',
                                                    background: theme === 'dark' ? '#1f1f1f' : '#f8f9fa',
                                                    borderRadius: '12px',
                                                    border: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
                                                }}>
                                                    <CreditCardOutlined style={{ fontSize: '48px', color: getTextColor(), marginBottom: '16px', opacity: 0.5 }} />
                                                    <Text type="secondary" style={{ color: getTextColor() }}>
                                                        Aucune méthode de paiement
                                                    </Text>
                                                </div>
                                            )}
                                                </Card>
                                            </Col>

                                            {/* Withdrawals Table - Admin Only */}
                                            {isAdmin && (
                                                <Col xs={24} sm={24} md={12} lg={9} xl={9}>
                                            <Card
                                                className="profile-card fade-in-up"
                                                title={
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                        <div className="card-header">
                                                            <div className="card-icon">
                                                                <MinusOutlined />
                                                            </div>
                                                            <Title className="card-title">
                                                                Demandes de Retrait
                                                            </Title>
                                                        </div>
                                                        <Button
                                                            className="admin-button admin-button-primary"
                                                            icon={<SettingOutlined />}
                                                            onClick={() => toggleAdminPanel('withdrawals')}
                                                            size="small"
                                                            style={{
                                                                borderRadius: '20px',
                                                                padding: '4px 12px',
                                                                height: 'auto',
                                                                fontSize: '12px'
                                                            }}
                                                        >
                                                            Paramètres
                                                        </Button>
                                                    </div>
                                                }
                                                style={{
                                                    ...getCardStyle(),
                                                    borderRadius: '16px',
                                                    boxShadow: theme === 'dark'
                                                        ? '0 8px 32px rgba(0,0,0,0.4)'
                                                        : '0 8px 32px rgba(0,0,0,0.1)',
                                                    overflow: 'hidden'
                                                }}
                                                bodyStyle={{ padding: '24px', maxHeight: '400px', overflowY: 'auto' }}
                                            >
                                                {withdrawals && withdrawals.length > 0 ? (
                                                    <List
                                                        dataSource={withdrawals.slice(0, 5)} // Show only last 5
                                                        renderItem={(withdrawal) => (
                                                            <List.Item style={{
                                                                padding: '12px 0',
                                                                borderBottom: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
                                                            }}>
                                                                <div style={{ width: '100%' }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                                        <Text strong style={{ color: getTextColor() }}>
                                                                            {withdrawal.montant} DH
                                                                        </Text>
                                                                        <Tag
                                                                            color={
                                                                                withdrawal.status === 'done' ? 'green' :
                                                                                withdrawal.status === 'rejected' ? 'red' :
                                                                                withdrawal.status === 'processing' ? 'blue' :
                                                                                'orange'
                                                                            }
                                                                        >
                                                                            {withdrawal.status}
                                                                        </Tag>
                                                                    </div>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                        <Text type="secondary" style={{ color: getTextColor(), fontSize: '12px' }}>
                                                                            Frais: {withdrawal.frais} DH
                                                                        </Text>
                                                                        <Text type="secondary" style={{ color: getTextColor(), fontSize: '12px' }}>
                                                                            {new Date(withdrawal.createdAt).toLocaleDateString()}
                                                                        </Text>
                                                                    </div>
                                                                </div>
                                                            </List.Item>
                                                        )}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        textAlign: 'center',
                                                        padding: '40px 20px',
                                                        background: theme === 'dark' ? '#1f1f1f' : '#f8f9fa',
                                                        borderRadius: '12px',
                                                        border: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
                                                    }}>
                                                        <MinusOutlined style={{ fontSize: '48px', color: getTextColor(), marginBottom: '16px', opacity: 0.5 }} />
                                                        <Text type="secondary" style={{ color: getTextColor() }}>
                                                            Aucune demande de retrait
                                                        </Text>
                                                    </div>
                                                )}

                                                {/* Collapsible Admin Controls for Withdrawals */}
                                                {adminPanelOpen.withdrawals && (
                                                    <div className="admin-controls" style={{ marginTop: '16px' }}>
                                                        <div className="admin-controls-buttons">
                                                            <Button
                                                                className="admin-button admin-button-success"
                                                                icon={<PlusOutlined />}
                                                                onClick={openWithdrawalModal}
                                                                size="small"
                                                                block
                                                            >
                                                                Créer Nouvelle Demande
                                                            </Button>
                                                            <Button
                                                                className="admin-button admin-button-primary"
                                                                icon={<ReloadOutlined />}
                                                                onClick={handleRefresh}
                                                                size="small"
                                                                block
                                                            >
                                                                Actualiser Liste
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </Card>
                                                </Col>
                                            )}

                                            {/* Transfers Table - Admin Only */}
                                            {isAdmin && (
                                                <Col xs={24} sm={24} md={12} lg={9} xl={9}>
                                            <Card
                                                className="profile-card fade-in-up"
                                                title={
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                        <div className="card-header">
                                                            <div className="card-icon">
                                                                <DollarOutlined />
                                                            </div>
                                                            <Title className="card-title">
                                                                Historique des Transferts
                                                            </Title>
                                                        </div>
                                                        <Button
                                                            className="admin-button admin-button-primary"
                                                            icon={<SettingOutlined />}
                                                            onClick={() => toggleAdminPanel('transfers')}
                                                            size="small"
                                                            style={{
                                                                borderRadius: '20px',
                                                                padding: '4px 12px',
                                                                height: 'auto',
                                                                fontSize: '12px'
                                                            }}
                                                        >
                                                            Paramètres
                                                        </Button>
                                                    </div>
                                                }
                                                style={{
                                                    ...getCardStyle(),
                                                    borderRadius: '16px',
                                                    boxShadow: theme === 'dark'
                                                        ? '0 8px 32px rgba(0,0,0,0.4)'
                                                        : '0 8px 32px rgba(0,0,0,0.1)',
                                                    overflow: 'hidden'
                                                }}
                                                bodyStyle={{ padding: '24px', maxHeight: '400px', overflowY: 'auto' }}
                                            >
                                                {transfers && transfers.length > 0 ? (
                                                    <List
                                                        dataSource={transfers.slice(0, 5)} // Show only last 5
                                                        renderItem={(transfer) => (
                                                            <List.Item style={{
                                                                padding: '12px 0',
                                                                borderBottom: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
                                                            }}>
                                                                <div style={{ width: '100%' }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                                        <Text strong style={{ color: getTextColor() }}>
                                                                            {transfer.montant > 0 ? '+' : ''}{transfer.montant} DH
                                                                        </Text>
                                                                        <Tag
                                                                            color={
                                                                                transfer.status === 'validé' ? 'green' :
                                                                                transfer.status === 'annuler' ? 'red' :
                                                                                transfer.status === 'corrigé' ? 'blue' :
                                                                                'orange'
                                                                            }
                                                                        >
                                                                            {transfer.status}
                                                                        </Tag>
                                                                    </div>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                                        <Text type="secondary" style={{ color: getTextColor(), fontSize: '12px' }}>
                                                                            Type: {transfer.type}
                                                                        </Text>
                                                                        <Text type="secondary" style={{ color: getTextColor(), fontSize: '12px' }}>
                                                                            {new Date(transfer.createdAt).toLocaleDateString()}
                                                                        </Text>
                                                                    </div>
                                                                    {transfer.commentaire && (
                                                                        <Text type="secondary" style={{ color: getTextColor(), fontSize: '11px', fontStyle: 'italic' }}>
                                                                            {transfer.commentaire}
                                                                        </Text>
                                                                    )}
                                                                </div>
                                                            </List.Item>
                                                        )}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        textAlign: 'center',
                                                        padding: '40px 20px',
                                                        background: theme === 'dark' ? '#1f1f1f' : '#f8f9fa',
                                                        borderRadius: '12px',
                                                        border: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
                                                    }}>
                                                        <DollarOutlined style={{ fontSize: '48px', color: getTextColor(), marginBottom: '16px', opacity: 0.5 }} />
                                                        <Text type="secondary" style={{ color: getTextColor() }}>
                                                            Aucun transfert trouvé
                                                        </Text>
                                                    </div>
                                                )}

                                                {/* Collapsible Admin Controls for Transfers */}
                                                {adminPanelOpen.transfers && (
                                                    <div className="admin-controls" style={{ marginTop: '16px' }}>
                                                        <div className="admin-controls-buttons">
                                                            <Button
                                                                className="admin-button admin-button-primary"
                                                                icon={<ReloadOutlined />}
                                                                onClick={handleRefresh}
                                                                size="small"
                                                                block
                                                            >
                                                                Actualiser Historique
                                                            </Button>
                                                            <Button
                                                                className="admin-button admin-button-warning"
                                                                icon={<ExportOutlined />}
                                                                size="small"
                                                                block
                                                            >
                                                                Exporter Données
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </Card>
                                                </Col>
                                            )}
                                            </Row>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <ShopOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                            <Text type="secondary" style={{ color: getTextColor() }}>
                                Aucune boutique trouvée
                            </Text>
                        </div>
                    )}
                </div>
                </div>
                </main>
            </div>

            {/* Wallet Management Modal */}
            <Modal
                        className="professional-modal"
                        title={
                            <div className="card-header">
                                <div className="card-icon">
                                    <WalletOutlined />
                                </div>
                                <span>{walletAction === 'deposit' ? 'Dépôt d\'argent' : 'Retrait d\'argent'}</span>
                            </div>
                        }
                        open={walletModalVisible}
                        onOk={handleWalletAction}
                        onCancel={() => setWalletModalVisible(false)}
                        confirmLoading={walletLoading}
                        okText={walletAction === 'deposit' ? 'Déposer' : 'Retirer'}
                        cancelText="Annuler"
                    >
                <div style={{ padding: '16px 0' }}>
                    <label className="form-label">
                        {walletAction === 'deposit'
                            ? 'Montant à déposer dans le portefeuille:'
                            : 'Montant à retirer du portefeuille:'
                        }
                    </label>
                    <input
                        className="custom-input"
                        type="number"
                        placeholder="Entrez le montant"
                        value={walletAmount || ''}
                        onChange={(e) => setWalletAmount(Number(e.target.value))}
                        min={0}
                        step={10}
                    />
                    {wallet && (
                        <div className="info-text" style={{ marginTop: '8px' }}>
                            Solde actuel: {wallet.solde} DH
                        </div>
                    )}
                </div>
            </Modal>

            {/* Admin Withdrawal Modal */}
            <Modal
                className="professional-modal"
                title={
                    <div className="card-header">
                        <div className="card-icon">
                            <MinusOutlined />
                        </div>
                        <span>Créer une demande de retrait</span>
                    </div>
                }
                open={withdrawalModalVisible}
                onOk={handleAdminWithdrawal}
                onCancel={() => setWithdrawalModalVisible(false)}
                confirmLoading={withdrawalLoading}
                okText="Créer la demande"
                cancelText="Annuler"
                width={600}
            >
                <div style={{ padding: '16px 0' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <label className="form-label">
                            Montant à retirer (DH):
                        </label>
                        <input
                            className="custom-input"
                            type="number"
                            placeholder="Montant minimum: 100 DH"
                            value={withdrawalAmount || ''}
                            onChange={(e) => setWithdrawalAmount(Number(e.target.value))}
                            min={100}
                            max={wallet?.solde || 0}
                            step={10}
                        />
                        {wallet && (
                            <div className="info-text" style={{ marginTop: '4px' }}>
                                Solde disponible: {wallet.solde} DH | Frais: 5 DH | Net: {withdrawalAmount - 5} DH
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label className="form-label">
                            Méthode de paiement:
                        </label>
                        <select
                            className="custom-select"
                            value={selectedPayment || ''}
                            onChange={(e) => setSelectedPayment(e.target.value)}
                        >
                            <option value="">Sélectionner une méthode de paiement</option>
                            {payments.map(payment => (
                                <option key={payment._id} value={payment._id}>
                                    {payment.nom} - {payment.rib} {payment.default ? '(Défaut)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label className="form-label">
                            Note (optionnel):
                        </label>
                        <textarea
                            className="custom-textarea"
                            placeholder="Ajouter une note pour cette demande de retrait..."
                            value={withdrawalNote}
                            onChange={(e) => setWithdrawalNote(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div style={{
                        background: '#f6ffed',
                        border: '1px solid #b7eb8f',
                        borderRadius: '6px',
                        padding: '12px',
                        marginTop: '16px'
                    }}>
                        <div className="info-text" style={{ fontSize: '12px' }}>
                            <strong>Information:</strong> Cette demande sera créée avec le statut "Accepté" et sera traitée immédiatement.
                            Le montant sera déduit du portefeuille du client.
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default ProfileUser;