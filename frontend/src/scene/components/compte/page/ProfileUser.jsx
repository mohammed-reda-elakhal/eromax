import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Avatar, Typography, Spin, Tag, Button, Statistic, List, message, Modal, Progress } from 'antd';
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
    ArrowLeftOutlined,
    CopyOutlined,
    SettingOutlined,
    PlusOutlined,
    MinusOutlined,
    UndoOutlined,
    ExclamationCircleOutlined,
    SafetyOutlined,
    TrophyOutlined
} from '@ant-design/icons';
import { ThemeContext } from '../../../ThemeContext';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import { getStoreById } from '../../../../redux/apiCalls/storeApiCalls';
import { toggleActiveClient, verifyClient, toggleApiKey } from '../../../../redux/apiCalls/profileApiCalls';
import { toggleWalletActivation, depositMoney, withdrawMoney, resetWallet } from '../../../../redux/apiCalls/walletApiCalls';
import { getWithdrawalsByWalletId, createAdminWithdrawal } from '../../../../redux/apiCalls/withdrawalApiCalls';
import { getTransfersByWallet } from '../../../../redux/apiCalls/transferApiCalls';
import styled from 'styled-components';

const { Title, Text } = Typography;

const ProfileContainer = styled.div`
  background: ${props => props.theme === 'dark' ? '#001529' : '#f8fafc'};
  min-height: 100vh;
  padding: 24px;
`;

const ProfileHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  color: white;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 200px;
    height: 200px;
    background: rgba(255,255,255,0.1);
    border-radius: 50%;
    transform: translate(50%, -50%);
  }
`;

const StatsCard = styled(Card)`
  background: ${props => props.theme === 'dark' ? '#001529' : '#fff'};
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: none;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  }
  
  .ant-card-body {
    padding: 24px;
  }
`;

const ActionButton = styled(Button)`
  border-radius: 8px;
  height: 40px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
`;

const InfoSection = styled.div`
  background: ${props => props.theme === 'dark' ? '#1a1a1a' : '#f8fafc'};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid ${props => props.theme === 'dark' ? '#333' : '#e2e8f0'};
`;

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

    // Wallet analysis modal state
    const [analysisModalVisible, setAnalysisModalVisible] = useState(false);

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

    // Admin function: Toggle API key status (active/inactive)
    const handleToggleApiKey = async () => {
        if (!isAdmin || !client?._id) return;
        const isActive = client?.status === 'active';
        Modal.confirm({
            title: `Confirmer ${isActive ? 'la désactivation' : 'l\'activation'} de l'API`,
            content: `Voulez-vous ${isActive ? 'désactiver' : 'activer'} la clé API de ce client ?`,
            icon: <ExclamationCircleOutlined />,
            onOk: async () => {
                try {
                    await dispatch(toggleApiKey('client', client._id));
                    dispatch(getStoreById(storeId));
                    message.success(`Clé API ${isActive ? 'désactivée' : 'activée'} avec succès`);
                } catch (_) {
                    message.error('Erreur lors de la mise à jour du statut API');
                }
            }
        });
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

        const totalAmount = withdrawalAmount + 5; // Total amount including fees
        if (totalAmount > wallet.solde) {
            message.error('Montant supérieur au solde disponible (incluant les frais de 5 DH)');
            return;
        }

        setWithdrawalLoading(true);
        try {
            await dispatch(createAdminWithdrawal({
                walletId: wallet._id,
                paymentId: selectedPayment,
                montant: withdrawalAmount, // Net amount (what client receives)
                note: withdrawalNote || `Admin withdrawal: ${withdrawalAmount} DH net (Total avec frais: ${totalAmount} DH)`
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
                        <ProfileContainer theme={theme}>
                            {/* Header Actions */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '24px'
                            }}>
                                <ActionButton
                                    icon={<ArrowLeftOutlined />}
                                    onClick={handleGoBack}
                                >
                                    Retour
                                </ActionButton>
                                <ActionButton
                                    type="primary"
                                    icon={<ReloadOutlined />}
                                    onClick={handleRefresh}
                                    loading={loading}
                                >
                                    Actualiser
                                </ActionButton>
                            </div>

                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '100px' }}>
                                    <Spin size="large" />
                                    <Text style={{ display: 'block', marginTop: '16px', color: getTextColor() }}>
                                        Chargement du profil...
                                    </Text>
                                </div>
                            ) : error ? (
                                <StatsCard>
                                    <div style={{ textAlign: 'center', color: '#ff4d4f', padding: '40px' }}>
                                        <Text strong>Erreur: {error}</Text>
                                    </div>
                                </StatsCard>
                            ) : store ? (
                                <>
                                {/* Modern Profile Header */}
                                <ProfileHeader theme={theme}>
                                    <Row align="middle" gutter={[24, 24]}>
                                        <Col xs={24} sm={6}>
                                            <Avatar
                                                size={100}
                                                src={client?.profile?.url}
                                                icon={<UserOutlined />}
                                                style={{
                                                    border: '4px solid rgba(255,255,255,0.2)',
                                                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                                                }}
                                            />
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Title level={2} style={{ color: 'white', margin: 0, marginBottom: '8px' }}>
                                                {client?.nom} {client?.prenom}
                                            </Title>
                                            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', display: 'block', marginBottom: '16px' }}>
                                                {store?.storeName}
                                            </Text>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                <Tag color={client?.active ? 'success' : 'error'}>
                                                    {client?.active ? 'Actif' : 'Inactif'}
                                                </Tag>
                                                <Tag color={client?.verify ? 'success' : 'warning'}>
                                                    {client?.verify ? 'Vérifié' : 'Non vérifié'}
                                                </Tag>
                                                <Tag color={client?.status === 'active' ? 'green' : 'red'}>
                                                    API: {client?.status || 'inactive'}
                                                </Tag>
                                            </div>
                                        </Col>
                                        <Col xs={24} sm={6} style={{ textAlign: 'right' }}>
                                            {isAdmin && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <ActionButton
                                                        type={client?.active ? 'default' : 'primary'}
                                                        icon={<SettingOutlined />}
                                                        onClick={handleToggleUserActive}
                                                        style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}
                                                    >
                                                        {client?.active ? 'Désactiver' : 'Activer'}
                                                    </ActionButton>
                                                    {!client?.verify && (
                                                        <ActionButton
                                                            type="primary"
                                                            icon={<SafetyOutlined />}
                                                            onClick={handleVerifyClient}
                                                            style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}
                                                        >
                                                            Vérifier
                                                        </ActionButton>
                                                    )}
                                                    <ActionButton
                                                        type={client?.status === 'active' ? 'default' : 'primary'}
                                                        icon={client?.status === 'active' ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                                                        onClick={handleToggleApiKey}
                                                        style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}
                                                    >
                                                        {client?.status === 'active' ? 'Désactiver API' : 'Activer API'}
                                                    </ActionButton>
                                                </div>
                                            )}
                                        </Col>
                                    </Row>
                                </ProfileHeader>

                                <Row gutter={[24, 24]}>

                                    {/* Contact Information */}
                                    <Col xs={24} md={12}>
                                        <StatsCard theme={theme}>
                                            <Title level={4} style={{ color: getTextColor(), marginBottom: '20px' }}>
                                                <UserOutlined style={{ marginRight: '8px' }} />
                                                Informations Contact
                                            </Title>
                                            
                                            <InfoSection theme={theme}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                                    <MailOutlined style={{ color: '#1890ff' }} />
                                                    <div style={{ flex: 1 }}>
                                                        <Text strong style={{ color: getTextColor() }}>Email</Text>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <Text style={{ color: getTextColor() }}>{client?.email}</Text>
                                                            <Button 
                                                                type="text" 
                                                                size="small" 
                                                                icon={<CopyOutlined />} 
                                                                onClick={() => copyToClipboard(client?.email, 'Email')}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                                    <PhoneOutlined style={{ color: '#52c41a' }} />
                                                    <div style={{ flex: 1 }}>
                                                        <Text strong style={{ color: getTextColor() }}>Téléphone</Text>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <Text style={{ color: getTextColor() }}>{client?.tele}</Text>
                                                            <Button 
                                                                type="text" 
                                                                size="small" 
                                                                icon={<CopyOutlined />} 
                                                                onClick={() => copyToClipboard(client?.tele, 'Téléphone')}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <EnvironmentOutlined style={{ color: '#fa8c16' }} />
                                                    <div>
                                                        <Text strong style={{ color: getTextColor() }}>Adresse</Text>
                                                        <Text style={{ color: getTextColor(), display: 'block' }}>{client?.adresse}</Text>
                                                        <Text style={{ color: getTextColor(), fontSize: '12px', opacity: 0.7 }}>{client?.ville}</Text>
                                                    </div>
                                                </div>
                                            </InfoSection>
                                        </StatsCard>
                                    </Col>

                                    {/* Store Information */}
                                    <Col xs={24} md={12}>
                                        <StatsCard theme={theme}>
                                            <Title level={4} style={{ color: getTextColor(), marginBottom: '20px' }}>
                                                <ShopOutlined style={{ marginRight: '8px' }} />
                                                Informations Boutique
                                            </Title>
                                            
                                            <InfoSection theme={theme}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <Text strong style={{ color: getTextColor(), fontSize: '16px', display: 'block' }}>
                                                            {store.storeName}
                                                        </Text>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                            <Text style={{ color: getTextColor(), fontSize: '14px' }}>{store.tele}</Text>
                                                            <Button 
                                                                type="text" 
                                                                size="small" 
                                                                icon={<CopyOutlined />} 
                                                                onClick={() => copyToClipboard(store.storeName, 'Nom de la boutique')}
                                                            />
                                                        </div>
                                                    </div>
                                                    {store.image?.url && (
                                                        <Avatar
                                                            size={60}
                                                            src={store.image.url}
                                                            icon={<ShopOutlined />}
                                                            style={{
                                                                border: `2px solid ${theme === 'dark' ? '#333' : '#e2e8f0'}`,
                                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </InfoSection>

                                            {/* Payment Methods */}
                                            <div style={{ marginTop: '20px' }}>
                                                <Title level={5} style={{ color: getTextColor(), marginBottom: '16px' }}>
                                                    <CreditCardOutlined style={{ marginRight: '8px' }} />
                                                    Méthodes de Paiement
                                                </Title>
                                                
                                                {payments.length > 0 ? (
                                                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                        {payments.map((payment, index) => (
                                                            <InfoSection key={index} theme={theme} style={{ marginBottom: '12px' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                                    <Text strong style={{ color: getTextColor(), fontSize: '14px' }}>
                                                                        {payment.nom}
                                                                    </Text>
                                                                    {payment.default && (
                                                                        <Tag color="success" size="small">Défaut</Tag>
                                                                    )}
                                                                </div>
                                                                <div style={{ marginBottom: '8px' }}>
                                                                    <Text style={{ color: getTextColor(), fontSize: '12px' }}>
                                                                        {payment.idBank?.Bank || 'Banque non spécifiée'}
                                                                    </Text>
                                                                </div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <Text style={{ color: getTextColor(), fontSize: '12px' }}>
                                                                        {payment.rib}
                                                                    </Text>
                                                                    <Button 
                                                                        type="text" 
                                                                        size="small" 
                                                                        icon={<CopyOutlined />} 
                                                                        onClick={() => copyToClipboard(payment.rib, 'RIB')}
                                                                    />
                                                                </div>
                                                            </InfoSection>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div style={{ textAlign: 'center', padding: '20px' }}>
                                                        <CreditCardOutlined style={{ fontSize: '32px', color: getTextColor(), opacity: 0.5 }} />
                                                        <Text style={{ color: getTextColor(), display: 'block', marginTop: '8px', fontSize: '12px' }}>
                                                            Aucune méthode de paiement
                                                        </Text>
                                                    </div>
                                                )}
                                            </div>
                                        </StatsCard>
                                    </Col>

                                    {/* Wallet Section */}
                                    <Col xs={24} lg={8}>
                                        <div style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            borderRadius: '20px',
                                            padding: '0',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
                                            border: 'none',
                                            minHeight: '320px'
                                        }}>
                                            {wallet ? (
                                                <>
                                                    {/* Background Pattern */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '-50px',
                                                        right: '-50px',
                                                        width: '150px',
                                                        height: '150px',
                                                        background: 'rgba(255,255,255,0.1)',
                                                        borderRadius: '50%',
                                                        zIndex: 0
                                                    }} />
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: '-30px',
                                                        left: '-30px',
                                                        width: '100px',
                                                        height: '100px',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        borderRadius: '50%',
                                                        zIndex: 0
                                                    }} />
                                                    
                                                    <div style={{ position: 'relative', zIndex: 1, padding: '24px' }}>
                                                        {/* Header */}
                                                        <div style={{ 
                                                            display: 'flex', 
                                                            justifyContent: 'space-between', 
                                                            alignItems: 'flex-start',
                                                            marginBottom: '24px',
                                                            flexWrap: 'wrap',
                                                            gap: '12px'
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                <div style={{
                                                                    background: 'rgba(255,255,255,0.2)',
                                                                    borderRadius: '12px',
                                                                    padding: '8px',
                                                                    backdropFilter: 'blur(10px)'
                                                                }}>
                                                                    <WalletOutlined style={{ fontSize: '20px', color: 'white' }} />
                                                                </div>
                                                                <div>
                                                                    <Title level={5} style={{ color: 'white', margin: 0, fontSize: '16px' }}>
                                                                        Portefeuille
                                                                    </Title>
                                                                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                                                                        {store?.storeName}
                                                                    </Text>
                                                                </div>
                                                            </div>
                                                            
                                                            {isAdmin && (
                                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                                    <ActionButton
                                                                        size="small"
                                                                        icon={<SettingOutlined />}
                                                                        onClick={() => toggleAdminPanel('wallet')}
                                                                        style={{ 
                                                                            backgroundColor: 'rgba(255,255,255,0.15)', 
                                                                            borderColor: 'rgba(255,255,255,0.3)', 
                                                                            color: 'white',
                                                                            backdropFilter: 'blur(10px)',
                                                                            fontSize: '12px',
                                                                            height: '28px',
                                                                            padding: '0 8px'
                                                                        }}
                                                                    />
                                                                    <ActionButton
                                                                        size="small"
                                                                        icon={wallet.active ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                                                                        onClick={handleToggleWalletActive}
                                                                        style={{ 
                                                                            backgroundColor: wallet.active ? 'rgba(255,77,79,0.2)' : 'rgba(82,196,26,0.2)', 
                                                                            borderColor: wallet.active ? 'rgba(255,77,79,0.4)' : 'rgba(82,196,26,0.4)', 
                                                                            color: 'white',
                                                                            backdropFilter: 'blur(10px)',
                                                                            fontSize: '12px',
                                                                            height: '28px',
                                                                            padding: '0 8px'
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Balance Display */}
                                                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                                            <Text style={{ 
                                                                color: 'rgba(255,255,255,0.8)', 
                                                                fontSize: '13px', 
                                                                display: 'block',
                                                                marginBottom: '8px',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '1px'
                                                            }}>
                                                                Solde Disponible
                                                            </Text>
                                                            <Title level={1} style={{ 
                                                                color: 'white', 
                                                                margin: 0, 
                                                                fontSize: 'clamp(28px, 5vw, 42px)',
                                                                fontWeight: '700',
                                                                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                                                            }}>
                                                                {wallet.solde.toLocaleString()} DH
                                                            </Title>
                                                        </div>
                                                        
                                                        {/* Status and Date */}
                                                        <div style={{ 
                                                            display: 'flex', 
                                                            justifyContent: 'space-between', 
                                                            alignItems: 'center',
                                                            marginBottom: '20px',
                                                            flexWrap: 'wrap',
                                                            gap: '12px'
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <div style={{
                                                                    width: '8px',
                                                                    height: '8px',
                                                                    borderRadius: '50%',
                                                                    backgroundColor: wallet.active ? '#52c41a' : '#ff4d4f',
                                                                    boxShadow: `0 0 10px ${wallet.active ? '#52c41a' : '#ff4d4f'}`
                                                                }} />
                                                                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: '500' }}>
                                                                    {wallet.active ? 'Actif' : 'Inactif'}
                                                                </Text>
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                                                                    Créé le {new Date(wallet.createdAt).toLocaleDateString('fr-FR')}
                                                                </Text>
                                                                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                                                                    {wallet.activationDate
                                                                        ? `Activé le ${new Date(wallet.activationDate).toLocaleDateString('fr-FR')}`
                                                                        : 'Non activé'}
                                                                </Text>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Admin Controls */}
                                                        {isAdmin && adminPanelOpen.wallet && (
                                                            <div style={{ 
                                                                background: 'rgba(255,255,255,0.1)',
                                                                borderRadius: '12px',
                                                                padding: '16px',
                                                                backdropFilter: 'blur(10px)',
                                                                border: '1px solid rgba(255,255,255,0.2)'
                                                            }}>
                                                                <Text style={{ 
                                                                    color: 'rgba(255,255,255,0.9)', 
                                                                    fontSize: '12px', 
                                                                    display: 'block',
                                                                    marginBottom: '12px',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.5px'
                                                                }}>
                                                                    Actions Admin
                                                                </Text>
                                                                <div style={{ 
                                                                    display: 'grid', 
                                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                                                                    gap: '8px'
                                                                }}>
                                                                    <ActionButton
                                                                        icon={<PlusOutlined />}
                                                                        onClick={() => openWalletModal('deposit')}
                                                                        style={{ 
                                                                            backgroundColor: 'rgba(82,196,26,0.2)', 
                                                                            borderColor: 'rgba(82,196,26,0.4)', 
                                                                            color: 'white',
                                                                            fontSize: '11px',
                                                                            height: '32px'
                                                                        }}
                                                                    >
                                                                        Dépôt
                                                                    </ActionButton>
                                                                    <ActionButton
                                                                        icon={<MinusOutlined />}
                                                                        onClick={() => openWalletModal('withdraw')}
                                                                        style={{ 
                                                                            backgroundColor: 'rgba(250,140,22,0.2)', 
                                                                            borderColor: 'rgba(250,140,22,0.4)', 
                                                                            color: 'white',
                                                                            fontSize: '11px',
                                                                            height: '32px'
                                                                        }}
                                                                    >
                                                                        Retrait
                                                                    </ActionButton>
                                                                    <ActionButton
                                                                        icon={<UndoOutlined />}
                                                                        onClick={handleResetWallet}
                                                                        style={{ 
                                                                            backgroundColor: 'rgba(255,77,79,0.2)', 
                                                                            borderColor: 'rgba(255,77,79,0.4)', 
                                                                            color: 'white',
                                                                            fontSize: '11px',
                                                                            height: '32px'
                                                                        }}
                                                                    >
                                                                        Reset
                                                                    </ActionButton>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            ) : (
                                                <div style={{ 
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    height: '100%',
                                                    padding: '40px',
                                                    position: 'relative',
                                                    zIndex: 1
                                                }}>
                                                    <div style={{
                                                        background: 'rgba(255,255,255,0.1)',
                                                        borderRadius: '50%',
                                                        padding: '20px',
                                                        marginBottom: '16px'
                                                    }}>
                                                        <WalletOutlined style={{ fontSize: '32px', color: 'rgba(255,255,255,0.7)' }} />
                                                    </div>
                                                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', textAlign: 'center' }}>
                                                        Aucun portefeuille configuré
                                                    </Text>
                                                </div>
                                            )}
                                        </div>
                                    </Col>

                                    {/* Statistics Overview */}
                                    <Col xs={24} lg={16}>
                                        <Row gutter={[16, 16]}>
                                            <Col xs={12} sm={6}>
                                                <StatsCard theme={theme}>
                                                    <Statistic
                                                        title="Total Colis"
                                                        value={colisStats?.total || 0}
                                                        valueStyle={{ color: '#1890ff' }}
                                                        prefix={<GiftOutlined />}
                                                    />
                                                </StatsCard>
                                            </Col>
                                            <Col xs={12} sm={6}>
                                                <StatsCard theme={theme}>
                                                    <Statistic
                                                        title="Livrée"
                                                        value={colisStats?.livree || 0}
                                                        valueStyle={{ color: '#52c41a' }}
                                                        prefix={<CheckCircleOutlined />}
                                                    />
                                                </StatsCard>
                                            </Col>
                                            <Col xs={12} sm={6}>
                                                <StatsCard theme={theme}>
                                                    <Statistic
                                                        title="Annulée"
                                                        value={colisStats?.annulee || 0}
                                                        valueStyle={{ color: '#ff4d4f' }}
                                                        prefix={<CloseCircleOutlined />}
                                                    />
                                                </StatsCard>
                                            </Col>
                                            <Col xs={12} sm={6}>
                                                <StatsCard theme={theme}>
                                                    <Statistic
                                                        title="Taux Succès"
                                                        value={colisStats?.total > 0 ? Math.round((colisStats.livree / colisStats.total) * 100) : 0}
                                                        suffix="%"
                                                        valueStyle={{ color: '#52c41a' }}
                                                        prefix={<TrophyOutlined />}
                                                    />
                                                </StatsCard>
                                            </Col>
                                        </Row>
                                        
                                        {/* Chart Section */}
                                        {colisStats && colisStats.total > 0 && (
                                            <StatsCard theme={theme} style={{ marginTop: '16px' }}>
                                                <Title level={5} style={{ color: getTextColor(), textAlign: 'center', marginBottom: '20px' }}>
                                                    Répartition des Colis
                                                </Title>
                                                <ResponsiveContainer width="100%" height={200}>
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
                                                            outerRadius={60}
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
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </StatsCard>
                                        )}
                                    </Col>

                                </Row>
                                
                                {/* Payment Methods & Transactions */}
                                <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>

                                    {/* Withdrawals - Admin Only */}
                                    {isAdmin && (
                                        <Col xs={24}>
                                            <StatsCard theme={theme}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                                    <Title level={4} style={{ color: getTextColor(), margin: 0 }}>
                                                        <MinusOutlined style={{ marginRight: '8px' }} />
                                                        Demandes de Retrait
                                                    </Title>
                                                    <ActionButton
                                                        type="primary"
                                                        icon={<PlusOutlined />}
                                                        onClick={openWithdrawalModal}
                                                        size="small"
                                                    >
                                                        Nouveau Retrait
                                                    </ActionButton>
                                                </div>
                                                
                                                {/* Statistics */}
                                                {withdrawals && withdrawals.length > 0 && (
                                                    <Row gutter={[12, 12]} style={{ marginBottom: '20px' }}>
                                                        <Col span={6}>
                                                            <div style={{ textAlign: 'center', padding: '12px', background: theme === 'dark' ? '#1a1a1a' : '#f8fafc', borderRadius: '8px' }}>
                                                                <Text style={{ color: '#1890ff', fontSize: '20px', fontWeight: 'bold', display: 'block' }}>
                                                                    {withdrawals.length}
                                                                </Text>
                                                                <Text style={{ color: getTextColor(), fontSize: '12px' }}>Total</Text>
                                                            </div>
                                                        </Col>
                                                        <Col span={6}>
                                                            <div style={{ textAlign: 'center', padding: '12px', background: theme === 'dark' ? '#1a1a1a' : '#f8fafc', borderRadius: '8px' }}>
                                                                <Text style={{ color: '#52c41a', fontSize: '20px', fontWeight: 'bold', display: 'block' }}>
                                                                    {withdrawals.filter(w => w.status === 'done').length}
                                                                </Text>
                                                                <Text style={{ color: getTextColor(), fontSize: '12px' }}>Effectués</Text>
                                                            </div>
                                                        </Col>
                                                        <Col span={6}>
                                                            <div style={{ textAlign: 'center', padding: '12px', background: theme === 'dark' ? '#1a1a1a' : '#f8fafc', borderRadius: '8px' }}>
                                                                <Text style={{ color: '#fa8c16', fontSize: '20px', fontWeight: 'bold', display: 'block' }}>
                                                                    {withdrawals.filter(w => w.status === 'pending' || w.status === 'processing').length}
                                                                </Text>
                                                                <Text style={{ color: getTextColor(), fontSize: '12px' }}>En cours</Text>
                                                            </div>
                                                        </Col>
                                                        <Col span={6}>
                                                            <div style={{ textAlign: 'center', padding: '12px', background: theme === 'dark' ? '#1a1a1a' : '#f8fafc', borderRadius: '8px' }}>
                                                                <Text style={{ color: '#52c41a', fontSize: '18px', fontWeight: 'bold', display: 'block' }}>
                                                                    {withdrawals.filter(w => w.status === 'done').reduce((sum, w) => sum + (w.montant + 5), 0)} DH
                                                                </Text>
                                                                <Text style={{ color: getTextColor(), fontSize: '12px' }}>Total Montant</Text>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                )}
                                                
                                                {withdrawals && withdrawals.length > 0 ? (
                                                    <div style={{ 
                                                        width: '100%',
                                                        height: '400px',
                                                        overflowX: 'auto',
                                                        overflowY: 'auto',
                                                        border: `1px solid ${theme === 'dark' ? '#333' : '#e8e8e8'}`,
                                                        borderRadius: '8px'
                                                    }}>
                                                        <table style={{ 
                                                            width: '100%', 
                                                            borderCollapse: 'collapse',
                                                            fontSize: '13px'
                                                        }}>
                                                            <thead>
                                                                <tr style={{ background: theme === 'dark' ? '#1a1a1a' : '#fafafa' }}>
                                                                    <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e8e8e8'}`, color: getTextColor(), fontWeight: '600' }}>Montant</th>
                                                                    <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e8e8e8'}`, color: getTextColor(), fontWeight: '600' }}>Frais</th>
                                                                    <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e8e8e8'}`, color: getTextColor(), fontWeight: '600' }}>Net</th>
                                                                    <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e8e8e8'}`, color: getTextColor(), fontWeight: '600' }}>Statut</th>
                                                                    <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e8e8e8'}`, color: getTextColor(), fontWeight: '600' }}>Méthode</th>
                                                                    <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e8e8e8'}`, color: getTextColor(), fontWeight: '600' }}>Wallet Key</th>
                                                                    <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e8e8e8'}`, color: getTextColor(), fontWeight: '600' }}>Date</th>
                                                                    <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e8e8e8'}`, color: getTextColor(), fontWeight: '600' }}>Note</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {withdrawals.map((withdrawal, index) => (
                                                                    <tr key={index} style={{ borderBottom: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#f0f0f0'}` }}>
                                                                        <td style={{ padding: '12px 8px', color: getTextColor(), fontWeight: '600' }}>
                                                                            {withdrawal.montant + 5} DH
                                                                        </td>
                                                                        <td style={{ padding: '12px 8px', color: '#fa8c16', fontWeight: '500' }}>
                                                                            {withdrawal.frais} DH
                                                                        </td>
                                                                        <td style={{ padding: '12px 8px', color: '#52c41a', fontWeight: '600' }}>
                                                                            {withdrawal.montant} DH
                                                                        </td>
                                                                        <td style={{ padding: '12px 8px' }}>
                                                                            <Tag
                                                                                color={
                                                                                    withdrawal.status === 'done' ? 'success' :
                                                                                    withdrawal.status === 'rejected' ? 'error' :
                                                                                    withdrawal.status === 'processing' ? 'processing' :
                                                                                    'warning'
                                                                                }
                                                                                style={{ fontSize: '11px' }}
                                                                            >
                                                                                {withdrawal.status === 'done' ? 'Effectué' :
                                                                                 withdrawal.status === 'rejected' ? 'Rejeté' :
                                                                                 withdrawal.status === 'processing' ? 'En cours' :
                                                                                 'En attente'}
                                                                            </Tag>
                                                                        </td>
                                                                        <td style={{ padding: '12px 8px', color: getTextColor(), fontSize: '12px' }}>
                                                                            {withdrawal.payment?.nom || withdrawal.paymentMethod?.nom || 'N/A'}
                                                                            <br />
                                                                            <span style={{ color: '#999', fontSize: '11px' }}>
                                                                                {withdrawal.payment?.rib || withdrawal.paymentMethod?.rib ? `***${(withdrawal.payment?.rib || withdrawal.paymentMethod?.rib).slice(-4)}` : ''}
                                                                            </span>
                                                                        </td>
                                                                        <td style={{ padding: '12px 8px', color: getTextColor(), fontSize: '12px' }}>
                                                                            <span style={{ fontFamily: 'monospace', fontSize: '11px', backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                                                                                {withdrawal.wallet?.key || 'N/A'}
                                                                            </span>
                                                                        </td>
                                                                        <td style={{ padding: '12px 8px', color: getTextColor(), fontSize: '12px' }}>
                                                                            {new Date(withdrawal.createdAt).toLocaleDateString('fr-FR')}
                                                                            <br />
                                                                            <span style={{ color: '#999', fontSize: '11px' }}>
                                                                                {new Date(withdrawal.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                                            </span>
                                                                        </td>
                                                                        <td style={{ padding: '12px 8px', color: getTextColor(), fontSize: '11px', maxWidth: '150px' }}>
                                                                            {withdrawal.note ? (
                                                                                <span title={withdrawal.note} style={{ 
                                                                                    display: 'block',
                                                                                    overflow: 'hidden',
                                                                                    textOverflow: 'ellipsis',
                                                                                    whiteSpace: 'nowrap'
                                                                                }}>
                                                                                    {withdrawal.note}
                                                                                </span>
                                                                            ) : (
                                                                                <span style={{ color: '#999', fontStyle: 'italic' }}>—</span>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div style={{ textAlign: 'center', padding: '40px' }}>
                                                        <MinusOutlined style={{ fontSize: '48px', color: getTextColor(), opacity: 0.5 }} />
                                                        <Text style={{ color: getTextColor(), display: 'block', marginTop: '16px' }}>
                                                            Aucune demande de retrait
                                                        </Text>
                                                    </div>
                                                )}
                                            </StatsCard>
                                        </Col>
                                    )}

                                    {/* Transfers - Admin Only */}
                                    {isAdmin && (
                                        <Col xs={24}>
                                            <StatsCard theme={theme}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                                    <Title level={4} style={{ color: getTextColor(), margin: 0 }}>
                                                        <DollarOutlined style={{ marginRight: '8px' }} />
                                                        Transferts
                                                    </Title>
                                                </div>
                                                
                                                {/* Transfer Statistics */}
                                                {transfers && transfers.length > 0 && (
                                                    <Row gutter={[12, 12]} style={{ marginBottom: '20px' }}>
                                                        <Col span={6}>
                                                            <div style={{ textAlign: 'center', padding: '12px', background: theme === 'dark' ? '#1a1a1a' : '#f8fafc', borderRadius: '8px' }}>
                                                                <Text style={{ color: '#1890ff', fontSize: '20px', fontWeight: 'bold', display: 'block' }}>
                                                                    {transfers.length}
                                                                </Text>
                                                                <Text style={{ color: getTextColor(), fontSize: '12px' }}>Total</Text>
                                                            </div>
                                                        </Col>
                                                        <Col span={6}>
                                                            <div style={{ textAlign: 'center', padding: '12px', background: theme === 'dark' ? '#1a1a1a' : '#f8fafc', borderRadius: '8px' }}>
                                                                <Text style={{ color: '#52c41a', fontSize: '20px', fontWeight: 'bold', display: 'block' }}>
                                                                    {transfers.filter(t => t.type === 'Deposit' || t.type === 'Manuel Depot').length}
                                                                </Text>
                                                                <Text style={{ color: '#52c41a', fontSize: '14px', fontWeight: '600', display: 'block' }}>
                                                                    {transfers.filter(t => t.type === 'Deposit' || t.type === 'Manuel Depot').reduce((sum, t) => sum + Math.abs(t.montant), 0)} DH
                                                                </Text>
                                                                <Text style={{ color: getTextColor(), fontSize: '12px' }}>Entrées</Text>
                                                            </div>
                                                        </Col>
                                                        <Col span={6}>
                                                            <div style={{ textAlign: 'center', padding: '12px', background: theme === 'dark' ? '#1a1a1a' : '#f8fafc', borderRadius: '8px' }}>
                                                                <Text style={{ color: '#ff4d4f', fontSize: '20px', fontWeight: 'bold', display: 'block' }}>
                                                                    {transfers.filter(t => t.type === 'withdrawal' || t.type === 'Manuel Withdrawal').length}
                                                                </Text>
                                                                <Text style={{ color: '#ff4d4f', fontSize: '14px', fontWeight: '600', display: 'block' }}>
                                                                    {transfers.filter(t => t.type === 'withdrawal' || t.type === 'Manuel Withdrawal').reduce((sum, t) => sum + Math.abs(t.montant), 0)} DH
                                                                </Text>
                                                                <Text style={{ color: getTextColor(), fontSize: '12px' }}>Sorties</Text>
                                                            </div>
                                                        </Col>
                                                        <Col span={6}>
                                                            <div 
                                                                style={{ 
                                                                    textAlign: 'center', 
                                                                    padding: '12px', 
                                                                    background: theme === 'dark' ? '#1a1a1a' : '#f8fafc', 
                                                                    borderRadius: '8px',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.3s ease'
                                                                }}
                                                                onClick={() => setAnalysisModalVisible(true)}
                                                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                                                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                                            >
                                                                <Text style={{ color: '#52c41a', fontSize: '18px', fontWeight: 'bold', display: 'block' }}>
                                                                    {transfers.filter(t => t.type === 'Deposit' || t.type === 'Manuel Depot').reduce((sum, t) => sum + Math.abs(t.montant), 0) - transfers.filter(t => t.type === 'withdrawal' || t.type === 'Manuel Withdrawal').reduce((sum, t) => sum + Math.abs(t.montant), 0)} DH
                                                                </Text>
                                                                <Text style={{ color: getTextColor(), fontSize: '12px' }}>Solde Net</Text>
                                                                <Text style={{ color: '#1890ff', fontSize: '10px', display: 'block', marginTop: '4px' }}>Cliquer pour analyser</Text>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                )}
                                                
                                                {transfers && transfers.length > 0 ? (
                                                    <div style={{ 
                                                        width: '100%',
                                                        height: '400px',
                                                        overflowX: 'auto',
                                                        overflowY: 'auto',
                                                        border: `1px solid ${theme === 'dark' ? '#333' : '#e8e8e8'}`,
                                                        borderRadius: '8px'
                                                    }}>
                                                        <table style={{ 
                                                            width: '100%', 
                                                            borderCollapse: 'collapse',
                                                            fontSize: '13px'
                                                        }}>
                                                            <thead>
                                                                <tr style={{ background: theme === 'dark' ? '#1a1a1a' : '#fafafa' }}>
                                                                    <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e8e8e8'}`, color: getTextColor(), fontWeight: '600' }}>Montant</th>
                                                                    <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e8e8e8'}`, color: getTextColor(), fontWeight: '600' }}>Type</th>
                                                                    <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e8e8e8'}`, color: getTextColor(), fontWeight: '600' }}>Statut</th>
                                                                    <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e8e8e8'}`, color: getTextColor(), fontWeight: '600' }}>Colis</th>
                                                                    <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e8e8e8'}`, color: getTextColor(), fontWeight: '600' }}>Date</th>
                                                                    <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e8e8e8'}`, color: getTextColor(), fontWeight: '600' }}>Commentaire</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {transfers.map((transfer, index) => (
                                                                    <tr key={index} style={{ borderBottom: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#f0f0f0'}` }}>
                                                                        <td style={{ padding: '12px 8px', fontWeight: '600' }}>
                                                                            <span style={{
                                                                                color: transfer.type === 'Correction' ? '#1890ff' :
                                                                                       transfer.type === 'withdrawal' ? '#ff4d4f' :
                                                                                       transfer.type === 'Deposit' ? '#52c41a' :
                                                                                       transfer.type === 'Manuel Depot' ? '#52c41a' :
                                                                                       transfer.type === 'Manuel Withdrawal' ? '#ff4d4f' :
                                                                                       getTextColor()
                                                                            }}>
                                                                                {transfer.montant > 0 ? '+' : ''}{transfer.montant} DH
                                                                            </span>
                                                                        </td>
                                                                        <td style={{ padding: '12px 8px', fontSize: '12px' }}>
                                                                            <span style={{
                                                                                color: transfer.type === 'Correction' ? '#1890ff' :
                                                                                       transfer.type === 'withdrawal' ? '#ff4d4f' :
                                                                                       transfer.type === 'Deposit' ? '#52c41a' :
                                                                                       transfer.type === 'Manuel Depot' ? '#52c41a' :
                                                                                       transfer.type === 'Manuel Withdrawal' ? '#ff4d4f' :
                                                                                       getTextColor(),
                                                                                fontWeight: '500'
                                                                            }}>
                                                                                {transfer.type}
                                                                            </span>
                                                                        </td>
                                                                        <td style={{ padding: '12px 8px' }}>
                                                                            <Tag
                                                                                color={
                                                                                    transfer.status === 'validé' ? 'success' :
                                                                                    transfer.status === 'annuler' ? 'error' :
                                                                                    transfer.status === 'corrigé' ? 'processing' :
                                                                                    'warning'
                                                                                }
                                                                                style={{ fontSize: '11px' }}
                                                                            >
                                                                                {transfer.status}
                                                                            </Tag>
                                                                        </td>
                                                                        <td style={{ padding: '12px 8px', color: getTextColor(), fontSize: '12px' }}>
                                                                            {transfer.colis ? (
                                                                                <span style={{ fontFamily: 'monospace', fontSize: '11px', backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                                                                                    {typeof transfer.colis === 'object' ? transfer.colis.code_suivi || transfer.colis._id || 'N/A' : transfer.colis}
                                                                                </span>
                                                                            ) : (
                                                                                <span style={{ color: '#999', fontStyle: 'italic' }}>—</span>
                                                                            )}
                                                                        </td>
                                                                        <td style={{ padding: '12px 8px', color: getTextColor(), fontSize: '12px' }}>
                                                                            {new Date(transfer.createdAt).toLocaleDateString('fr-FR')}
                                                                            <br />
                                                                            <span style={{ color: '#999', fontSize: '11px' }}>
                                                                                {new Date(transfer.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                                            </span>
                                                                        </td>
                                                                        <td style={{ padding: '12px 8px', color: getTextColor(), fontSize: '11px', maxWidth: '200px' }}>
                                                                            {transfer.commentaire ? (
                                                                                <span title={transfer.commentaire} style={{ 
                                                                                    display: 'block',
                                                                                    overflow: 'hidden',
                                                                                    textOverflow: 'ellipsis',
                                                                                    whiteSpace: 'nowrap'
                                                                                }}>
                                                                                    {transfer.commentaire}
                                                                                </span>
                                                                            ) : (
                                                                                <span style={{ color: '#999', fontStyle: 'italic' }}>—</span>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div style={{ textAlign: 'center', padding: '40px' }}>
                                                        <DollarOutlined style={{ fontSize: '48px', color: getTextColor(), opacity: 0.5 }} />
                                                        <Text style={{ color: getTextColor(), display: 'block', marginTop: '16px' }}>
                                                            Aucun transfert
                                                        </Text>
                                                    </div>
                                                )}
                                            </StatsCard>
                                        </Col>
                                    )}
                                </Row>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '100px' }}>
                                    <ShopOutlined style={{ fontSize: '64px', color: getTextColor(), opacity: 0.3, marginBottom: '16px' }} />
                                    <Text style={{ color: getTextColor(), fontSize: '16px' }}>
                                        Aucune boutique trouvée
                                    </Text>
                                </div>
                            )}
                        </ProfileContainer>
                    </div>
                </div>
            </main>

            {/* Wallet Management Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#1890ff' }}>
                        <div style={{ 
                            background: 'linear-gradient(135deg, #1890ff, #722ed1)', 
                            borderRadius: '50%', 
                            width: '40px', 
                            height: '40px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <WalletOutlined style={{ fontSize: '18px' }} />
                        </div>
                        <span style={{ fontSize: '18px', fontWeight: '600' }}>
                            {walletAction === 'deposit' ? 'Dépôt d\'argent' : 'Retrait d\'argent'}
                        </span>
                    </div>
                }
                open={walletModalVisible}
                onOk={handleWalletAction}
                onCancel={() => setWalletModalVisible(false)}
                confirmLoading={walletLoading}
                okText={walletAction === 'deposit' ? 'Déposer' : 'Retirer'}
                cancelText="Annuler"
                width={500}
                styles={{
                    header: { borderBottom: '1px solid #f0f0f0', paddingBottom: '16px' },
                    body: { padding: '24px' },
                    footer: { borderTop: '1px solid #f0f0f0', paddingTop: '16px' }
                }}
            >
                <div style={{ padding: '8px 0' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: '500',
                            color: theme === 'dark' ? '#fff' : '#333'
                        }}>
                            {walletAction === 'deposit'
                                ? 'Montant à déposer dans le portefeuille:'
                                : 'Montant à retirer du portefeuille:'
                            }
                        </label>
                        <input
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '2px solid #d9d9d9',
                                borderRadius: '8px',
                                fontSize: '16px',
                                transition: 'all 0.3s ease',
                                outline: 'none'
                            }}
                            type="number"
                            placeholder="Entrez le montant"
                            value={walletAmount || ''}
                            onChange={(e) => setWalletAmount(Number(e.target.value))}
                            min={0}
                            step={10}
                            onFocus={(e) => e.target.style.borderColor = '#1890ff'}
                            onBlur={(e) => e.target.style.borderColor = '#d9d9d9'}
                        />
                    </div>
                    {wallet && (
                        <div style={{ 
                            background: walletAction === 'deposit' ? '#f6ffed' : '#fff2e8',
                            border: `1px solid ${walletAction === 'deposit' ? '#b7eb8f' : '#ffd591'}`,
                            borderRadius: '8px',
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <WalletOutlined style={{ color: walletAction === 'deposit' ? '#52c41a' : '#fa8c16' }} />
                            <span style={{ fontWeight: '500' }}>Solde actuel: {wallet.solde} DH</span>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Admin Withdrawal Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ff4d4f' }}>
                        <div style={{ 
                            background: 'linear-gradient(135deg, #ff4d4f, #ff7875)', 
                            borderRadius: '50%', 
                            width: '40px', 
                            height: '40px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <MinusOutlined style={{ fontSize: '18px' }} />
                        </div>
                        <span style={{ fontSize: '18px', fontWeight: '600' }}>
                            Créer une demande de retrait
                        </span>
                    </div>
                }
                open={withdrawalModalVisible}
                onOk={handleAdminWithdrawal}
                onCancel={() => setWithdrawalModalVisible(false)}
                confirmLoading={withdrawalLoading}
                okText="Créer la demande"
                cancelText="Annuler"
                width={650}
                styles={{
                    header: { borderBottom: '1px solid #f0f0f0', paddingBottom: '16px' },
                    body: { padding: '24px' },
                    footer: { borderTop: '1px solid #f0f0f0', paddingTop: '16px' }
                }}
            >
                <div style={{ padding: '8px 0' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: '500',
                            color: theme === 'dark' ? '#fff' : '#333'
                        }}>
                            Montant net à recevoir (DH):
                        </label>
                        <input
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '2px solid #d9d9d9',
                                borderRadius: '8px',
                                fontSize: '16px',
                                transition: 'all 0.3s ease',
                                outline: 'none'
                            }}
                            type="number"
                            placeholder="Montant net minimum: 100 DH"
                            value={withdrawalAmount || ''}
                            onChange={(e) => setWithdrawalAmount(Number(e.target.value))}
                            min={100}
                            max={wallet ? wallet.solde - 5 : 0}
                            step={10}
                            onFocus={(e) => e.target.style.borderColor = '#ff4d4f'}
                            onBlur={(e) => e.target.style.borderColor = '#d9d9d9'}
                        />
                        {wallet && (
                            <div style={{ 
                                background: '#fff2f0',
                                border: '1px solid #ffccc7',
                                borderRadius: '8px',
                                padding: '12px 16px',
                                marginTop: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <DollarOutlined style={{ color: '#ff4d4f' }} />
                                <span style={{ fontWeight: '500' }}>
                                    Solde disponible: {wallet.solde} DH | Montant net: {withdrawalAmount} DH | Frais: 5 DH | Total prélevé: {withdrawalAmount + 5} DH
                                </span>
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: '500',
                            color: theme === 'dark' ? '#fff' : '#333'
                        }}>
                            Méthode de paiement:
                        </label>
                        <select
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '2px solid #d9d9d9',
                                borderRadius: '8px',
                                fontSize: '16px',
                                backgroundColor: 'white',
                                outline: 'none'
                            }}
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

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: '500',
                            color: theme === 'dark' ? '#fff' : '#333'
                        }}>
                            Note (optionnel):
                        </label>
                        <textarea
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '2px solid #d9d9d9',
                                borderRadius: '8px',
                                fontSize: '14px',
                                resize: 'vertical',
                                minHeight: '80px',
                                outline: 'none'
                            }}
                            placeholder="Ajouter une note pour cette demande de retrait..."
                            value={withdrawalNote}
                            onChange={(e) => setWithdrawalNote(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div style={{
                        background: '#f6ffed',
                        border: '1px solid #b7eb8f',
                        borderRadius: '8px',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px'
                    }}>
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px', marginTop: '2px' }} />
                        <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                            <strong>Information:</strong> Cette demande sera créée avec le statut "Accepté" et sera traitée immédiatement.
                            Le montant sera déduit du portefeuille du client.
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Wallet Analysis Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#1890ff' }}>
                        <div style={{ 
                            background: 'linear-gradient(135deg, #1890ff, #722ed1)', 
                            borderRadius: '50%', 
                            width: '40px', 
                            height: '40px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <DollarOutlined style={{ fontSize: '18px' }} />
                        </div>
                        <span style={{ fontSize: '18px', fontWeight: '600' }}>
                            Analyse Détaillée du Portefeuille
                        </span>
                    </div>
                }
                open={analysisModalVisible}
                onCancel={() => setAnalysisModalVisible(false)}
                footer={null}
                width={900}
                styles={{
                    header: { borderBottom: '1px solid #f0f0f0', paddingBottom: '16px' },
                    body: { padding: '24px', maxHeight: '70vh', overflowY: 'auto' }
                }}
            >
                {transfers && wallet && (
                    <div>
                        {/* Summary Cards */}
                        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                            <Col span={8}>
                                <div style={{ 
                                    background: 'linear-gradient(135deg, #52c41a, #73d13d)', 
                                    borderRadius: '12px', 
                                    padding: '20px', 
                                    color: 'white', 
                                    textAlign: 'center' 
                                }}>
                                    <Title level={4} style={{ color: 'white', margin: 0 }}>Solde Disponible</Title>
                                    <Text style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>{wallet.solde} DH</Text>
                                </div>
                            </Col>
                            <Col span={8}>
                                <div style={{ 
                                    background: 'linear-gradient(135deg, #1890ff, #40a9ff)', 
                                    borderRadius: '12px', 
                                    padding: '20px', 
                                    color: 'white', 
                                    textAlign: 'center' 
                                }}>
                                    <Title level={4} style={{ color: 'white', margin: 0 }}>Solde Net Calculé</Title>
                                    <Text style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
                                        {transfers.filter(t => t.type === 'Deposit' || t.type === 'Manuel Depot').reduce((sum, t) => sum + Math.abs(t.montant), 0) - transfers.filter(t => t.type === 'withdrawal' || t.type === 'Manuel Withdrawal').reduce((sum, t) => sum + Math.abs(t.montant), 0)} DH
                                    </Text>
                                </div>
                            </Col>
                            <Col span={8}>
                                <div style={{ 
                                    background: wallet.solde === (transfers.filter(t => t.type === 'Deposit' || t.type === 'Manuel Depot').reduce((sum, t) => sum + Math.abs(t.montant), 0) - transfers.filter(t => t.type === 'withdrawal' || t.type === 'Manuel Withdrawal').reduce((sum, t) => sum + Math.abs(t.montant), 0)) ? 'linear-gradient(135deg, #52c41a, #73d13d)' : 'linear-gradient(135deg, #ff4d4f, #ff7875)', 
                                    borderRadius: '12px', 
                                    padding: '20px', 
                                    color: 'white', 
                                    textAlign: 'center' 
                                }}>
                                    <Title level={4} style={{ color: 'white', margin: 0 }}>Différence</Title>
                                    <Text style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
                                        {wallet.solde - (transfers.filter(t => t.type === 'Deposit' || t.type === 'Manuel Depot').reduce((sum, t) => sum + Math.abs(t.montant), 0) - transfers.filter(t => t.type === 'withdrawal' || t.type === 'Manuel Withdrawal').reduce((sum, t) => sum + Math.abs(t.montant), 0))} DH
                                    </Text>
                                </div>
                            </Col>
                        </Row>

                        {/* Detailed Calculations */}
                        <Row gutter={[24, 24]}>
                            {/* Entrées Detail */}
                            <Col span={12}>
                                <div style={{ 
                                    background: theme === 'dark' ? '#1a1a1a' : '#f8fafc', 
                                    borderRadius: '12px', 
                                    padding: '20px',
                                    border: '2px solid #52c41a'
                                }}>
                                    <Title level={4} style={{ color: '#52c41a', marginBottom: '16px' }}>
                                        📈 Entrées Détaillées
                                    </Title>
                                    
                                    {/* Deposit */}
                                    <div style={{ marginBottom: '12px', padding: '12px', background: theme === 'dark' ? '#2a2a2a' : '#fff', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={{ color: getTextColor(), fontWeight: '500' }}>Dépôts Automatiques</Text>
                                            <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>
                                                {transfers.filter(t => t.type === 'Deposit').length} transactions
                                            </Text>
                                        </div>
                                        <Text style={{ color: '#52c41a', fontSize: '18px', fontWeight: 'bold' }}>
                                            {transfers.filter(t => t.type === 'Deposit').reduce((sum, t) => sum + Math.abs(t.montant), 0)} DH
                                        </Text>
                                    </div>

                                    {/* Manuel Depot */}
                                    <div style={{ marginBottom: '12px', padding: '12px', background: theme === 'dark' ? '#2a2a2a' : '#fff', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={{ color: getTextColor(), fontWeight: '500' }}>Dépôts Manuels</Text>
                                            <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>
                                                {transfers.filter(t => t.type === 'Manuel Depot').length} transactions
                                            </Text>
                                        </div>
                                        <Text style={{ color: '#52c41a', fontSize: '18px', fontWeight: 'bold' }}>
                                            {transfers.filter(t => t.type === 'Manuel Depot').reduce((sum, t) => sum + Math.abs(t.montant), 0)} DH
                                        </Text>
                                    </div>

                                    {/* Total Entrées */}
                                    <div style={{ padding: '16px', background: '#f6ffed', borderRadius: '8px', border: '1px solid #b7eb8f' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={{ fontWeight: 'bold', fontSize: '16px' }}>Total Entrées</Text>
                                            <Text style={{ color: '#52c41a', fontSize: '20px', fontWeight: 'bold' }}>
                                                {transfers.filter(t => t.type === 'Deposit' || t.type === 'Manuel Depot').reduce((sum, t) => sum + Math.abs(t.montant), 0)} DH
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            </Col>

                            {/* Sorties Detail */}
                            <Col span={12}>
                                <div style={{ 
                                    background: theme === 'dark' ? '#1a1a1a' : '#f8fafc', 
                                    borderRadius: '12px', 
                                    padding: '20px',
                                    border: '2px solid #ff4d4f'
                                }}>
                                    <Title level={4} style={{ color: '#ff4d4f', marginBottom: '16px' }}>
                                        📉 Sorties Détaillées
                                    </Title>
                                    
                                    {/* Withdrawal */}
                                    <div style={{ marginBottom: '12px', padding: '12px', background: theme === 'dark' ? '#2a2a2a' : '#fff', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={{ color: getTextColor(), fontWeight: '500' }}>Retraits Clients</Text>
                                            <Text style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                                                {transfers.filter(t => t.type === 'withdrawal').length} transactions
                                            </Text>
                                        </div>
                                        <Text style={{ color: '#ff4d4f', fontSize: '18px', fontWeight: 'bold' }}>
                                            {transfers.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + Math.abs(t.montant), 0)} DH
                                        </Text>
                                    </div>

                                    {/* Manuel Withdrawal */}
                                    <div style={{ marginBottom: '12px', padding: '12px', background: theme === 'dark' ? '#2a2a2a' : '#fff', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={{ color: getTextColor(), fontWeight: '500' }}>Retraits Manuels</Text>
                                            <Text style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                                                {transfers.filter(t => t.type === 'Manuel Withdrawal').length} transactions
                                            </Text>
                                        </div>
                                        <Text style={{ color: '#ff4d4f', fontSize: '18px', fontWeight: 'bold' }}>
                                            {transfers.filter(t => t.type === 'Manuel Withdrawal').reduce((sum, t) => sum + Math.abs(t.montant), 0)} DH
                                        </Text>
                                    </div>

                                    {/* Total Sorties */}
                                    <div style={{ padding: '16px', background: '#fff2f0', borderRadius: '8px', border: '1px solid #ffccc7' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={{ fontWeight: 'bold', fontSize: '16px' }}>Total Sorties</Text>
                                            <Text style={{ color: '#ff4d4f', fontSize: '20px', fontWeight: 'bold' }}>
                                                {transfers.filter(t => t.type === 'withdrawal' || t.type === 'Manuel Withdrawal').reduce((sum, t) => sum + Math.abs(t.montant), 0)} DH
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        {/* Strategic Analysis */}
                        <div style={{ 
                            marginTop: '24px', 
                            padding: '20px', 
                            background: theme === 'dark' ? '#1a1a1a' : '#f8fafc', 
                            borderRadius: '12px',
                            border: '2px solid #1890ff'
                        }}>
                            <Title level={4} style={{ color: '#1890ff', marginBottom: '16px' }}>
                                🎯 Analyse Stratégique
                            </Title>
                            
                            {(() => {
                                const soldeDisponible = wallet.solde;
                                const soldeNet = transfers.filter(t => t.type === 'Deposit' || t.type === 'Manuel Depot').reduce((sum, t) => sum + Math.abs(t.montant), 0) - transfers.filter(t => t.type === 'withdrawal' || t.type === 'Manuel Withdrawal').reduce((sum, t) => sum + Math.abs(t.montant), 0);
                                const difference = soldeDisponible - soldeNet;
                                const totalEntrees = transfers.filter(t => t.type === 'Deposit' || t.type === 'Manuel Depot').reduce((sum, t) => sum + Math.abs(t.montant), 0);
                                const totalSorties = transfers.filter(t => t.type === 'withdrawal' || t.type === 'Manuel Withdrawal').reduce((sum, t) => sum + Math.abs(t.montant), 0);
                                
                                return (
                                    <div>
                                        {difference === 0 ? (
                                            <div style={{ padding: '16px', background: '#f6ffed', borderRadius: '8px', border: '1px solid #b7eb8f', marginBottom: '16px' }}>
                                                <Text style={{ color: '#52c41a', fontWeight: 'bold', fontSize: '16px' }}>✅ Portefeuille Équilibré</Text>
                                                <Text style={{ display: 'block', marginTop: '8px' }}>Le solde disponible correspond exactement au solde net calculé. Toutes les transactions sont cohérentes.</Text>
                                            </div>
                                        ) : difference > 0 ? (
                                            <div style={{ padding: '16px', background: '#fff7e6', borderRadius: '8px', border: '1px solid #ffd591', marginBottom: '16px' }}>
                                                <Text style={{ color: '#fa8c16', fontWeight: 'bold', fontSize: '16px' }}>⚠️ Solde Supérieur au Net (+{difference} DH)</Text>
                                                <Text style={{ display: 'block', marginTop: '8px' }}>Le solde disponible est supérieur au solde net calculé. Cela peut indiquer:</Text>
                                                <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                                                    <li>Des corrections non comptabilisées dans les transferts</li>
                                                    <li>Des transactions externes au système</li>
                                                    <li>Un solde initial non reflété dans les transferts</li>
                                                </ul>
                                            </div>
                                        ) : (
                                            <div style={{ padding: '16px', background: '#fff2f0', borderRadius: '8px', border: '1px solid #ffccc7', marginBottom: '16px' }}>
                                                <Text style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: '16px' }}>🚨 Solde Inférieur au Net ({difference} DH)</Text>
                                                <Text style={{ display: 'block', marginTop: '8px' }}>Le solde disponible est inférieur au solde net calculé. Attention:</Text>
                                                <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                                                    <li>Possible incohérence dans les données</li>
                                                    <li>Transactions non enregistrées</li>
                                                    <li>Vérification nécessaire des calculs</li>
                                                </ul>
                                            </div>
                                        )}
                                        
                                        {/* Performance Metrics */}
                                        <Row gutter={[16, 16]}>
                                            <Col span={8}>
                                                <div style={{ textAlign: 'center', padding: '12px', background: theme === 'dark' ? '#2a2a2a' : '#fff', borderRadius: '8px' }}>
                                                    <Text style={{ color: '#1890ff', fontSize: '18px', fontWeight: 'bold', display: 'block' }}>
                                                        {totalSorties > 0 ? Math.round((totalEntrees / totalSorties) * 100) : 0}%
                                                    </Text>
                                                    <Text style={{ color: getTextColor(), fontSize: '12px' }}>Ratio Entrées/Sorties</Text>
                                                </div>
                                            </Col>
                                            <Col span={8}>
                                                <div style={{ textAlign: 'center', padding: '12px', background: theme === 'dark' ? '#2a2a2a' : '#fff', borderRadius: '8px' }}>
                                                    <Text style={{ color: '#52c41a', fontSize: '18px', fontWeight: 'bold', display: 'block' }}>
                                                        {transfers.filter(t => t.type === 'Deposit').length + transfers.filter(t => t.type === 'Manuel Depot').length}
                                                    </Text>
                                                    <Text style={{ color: getTextColor(), fontSize: '12px' }}>Total Transactions Entrées</Text>
                                                </div>
                                            </Col>
                                            <Col span={8}>
                                                <div style={{ textAlign: 'center', padding: '12px', background: theme === 'dark' ? '#2a2a2a' : '#fff', borderRadius: '8px' }}>
                                                    <Text style={{ color: '#ff4d4f', fontSize: '18px', fontWeight: 'bold', display: 'block' }}>
                                                        {transfers.filter(t => t.type === 'withdrawal').length + transfers.filter(t => t.type === 'Manuel Withdrawal').length}
                                                    </Text>
                                                    <Text style={{ color: getTextColor(), fontSize: '12px' }}>Total Transactions Sorties</Text>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                );
                            })()
                            }
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default ProfileUser;