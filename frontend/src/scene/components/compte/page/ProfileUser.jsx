import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Avatar, Typography, Spin, Tag, Divider, Button, Statistic, List, message } from 'antd';
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
    CopyOutlined
} from '@ant-design/icons';
import { ThemeContext } from '../../../ThemeContext';
import '../compte.css'
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import { getStoreById } from '../../../../redux/apiCalls/storeApiCalls';

const { Title, Text } = Typography;

function ProfileUser() {
    const { theme } = useContext(ThemeContext);
    const dispatch = useDispatch();
    const { storeId } = useParams(); // Get store ID from URL parameters
    const { stores, loading, error } = useSelector(state => state.store);
    const navigate = useNavigate();

    useEffect(() => {
        if (storeId) {
            dispatch(getStoreById(storeId));
        }
    }, [dispatch, storeId]);

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

    // Get the store and client data from the API response
    const storeDetails = useSelector(state => state.store.storeDetails);
    const store = storeDetails?.store;
    const client = store?.id_client;
    const wallet = storeDetails?.wallet;
    const payments = storeDetails?.payments || [];
    const colisStats = storeDetails?.colisStats;

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
                        <div style={{ padding: '24px' }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                marginBottom: '24px' 
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <Button 
                                        type="default" 
                                        icon={<ArrowLeftOutlined />} 
                                        onClick={handleGoBack}
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '8px' 
                                        }}
                                    >
                                        List Colis
                                    </Button>
                                </div>
                                <Button 
                                    type="primary" 
                                    icon={<ReloadOutlined />} 
                                    onClick={handleRefresh}
                                    loading={loading}
                                >
                                    Actualiser
                                </Button>
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
                                <Row gutter={[24, 24]}>
                                    {/* Enhanced User and Store Information Card */}
                                    <Col xs={24} lg={24}>
                                        <Card 
                                            
                                            style={{
                                                ...getCardStyle(),
                                                borderRadius: '16px',
                                                boxShadow: theme === 'dark' 
                                                    ? '0 8px 32px rgba(0,0,0,0.4)' 
                                                    : '0 8px 32px rgba(0,0,0,0.1)',
                                                overflow: 'hidden'
                                            }}
                                            bodyStyle={{ padding: '32px' }}
                                        >
                                            {/* User Profile Header */}
                                            <div style={{ 
                                                background: theme === 'dark' ? '#1f1f1f' : '#f8f9fa',
                                                margin: '-32px -32px 32px -32px',
                                                padding: '32px',
                                                position: 'relative',
                                                borderBottom: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                                    <Avatar 
                                                        size={120} 
                                                        src={client?.profile?.url}
                                                        icon={<UserOutlined />}
                                                        style={{ 
                                                            border: `4px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`,
                                                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                                        }}
                                                    />
                                                    <div style={{ flex: 1 }}>
                                                        <Title level={2} style={{ color: getTextColor(), margin: 0, marginBottom: '8px' }}>
                                                            {client?.nom} {client?.prenom}
                                                        </Title>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                                            <Tag 
                                                                color={theme === 'dark' ? '#434343' : '#f0f0f0'} 
                                                                style={{ 
                                                                    color: getTextColor(),
                                                                    fontWeight: 'bold',
                                                                    fontSize: '14px',
                                                                    padding: '4px 12px',
                                                                    borderRadius: '20px'
                                                                }}
                                                            >
                                                                {client?.role === 'client' ? 'Client' : client?.role}
                                                            </Tag>
                                                            <Tag 
                                                                color={client?.active ? '#52c41a' : '#ff4d4f'} 
                                                                style={{ 
                                                                    color: '#fff',
                                                                    fontWeight: 'bold',
                                                                    fontSize: '14px',
                                                                    padding: '4px 12px',
                                                                    borderRadius: '20px'
                                                                }}
                                                            >
                                                                {client?.active ? 'Actif' : 'Inactif'}
                                                            </Tag>
                                                            <Tag 
                                                                color={client?.verify ? '#52c41a' : '#fa8c16'} 
                                                                style={{ 
                                                                    color: '#fff',
                                                                    fontWeight: 'bold',
                                                                    fontSize: '14px',
                                                                    padding: '4px 12px',
                                                                    borderRadius: '20px'
                                                                }}
                                                            >
                                                                {client?.verify ? 'Vérifié' : 'Non vérifié'}
                                                            </Tag>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* User Information Grid */}
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

                                                        {store.image && store.image.url && (
                                                            <Col xs={24}>
                                                                <div style={{ 
                                                                    background: theme === 'dark' ? '#1a1a1a' : '#fff', 
                                                                    padding: '20px', 
                                                                    borderRadius: '12px',
                                                                    border: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`,
                                                                    textAlign: 'center'
                                                                }}>
                                                                    <Text strong style={{ color: getTextColor(), fontSize: '16px', display: 'block', marginBottom: '12px' }}>
                                                                        Image Boutique
                                                                    </Text>
                                                                    <img 
                                                                        src={store.image.url} 
                                                                        alt="Store" 
                                                                        style={{ 
                                                                            width: '150px', 
                                                                            height: '150px', 
                                                                            objectFit: 'cover',
                                                                            borderRadius: '12px',
                                                                            border: `3px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`,
                                                                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                                                                        }} 
                                                                    />
                                                                </div>
                                                            </Col>
                                                        )}
                                                    </Row>
                                                </div>
                                            </div>
                                        </Card>
                                    </Col>

                                    {/* Enhanced Wallet Information Card */}
                                    <Col xs={24} lg={8}>
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
                                                        <WalletOutlined style={{ color: getTextColor(), fontSize: '16px' }} />
                                                    </div>
                                                    <Title level={4} style={{ color: getTextColor(), margin: 0 }}>
                                                        Portefeuille
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
                                            {wallet ? (
                                                <div>
                                                    <div style={{ 
                                                        background: theme === 'dark' ? '#1f1f1f' : '#f8f9fa',
                                                        padding: '20px',
                                                        borderRadius: '12px',
                                                        marginBottom: '20px',
                                                        border: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`
                                                    }}>
                                                        <Statistic
                                                            title="Solde"
                                                            value={wallet.solde}
                                                            suffix="DH"
                                                            valueStyle={{ color: getTextColor(), fontSize: '28px', fontWeight: 'bold' }}
                                                        />
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

                                    {/* Enhanced Colis Statistics Card */}
                                    <Col xs={24} lg={8}>
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
                                                        <GiftOutlined style={{ color: getTextColor(), fontSize: '16px' }} />
                                                    </div>
                                                    <Title level={4} style={{ color: getTextColor(), margin: 0 }}>
                                                        Statistiques Colis
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
                                            {colisStats ? (
                                                <div>
                                                    <Row gutter={[16, 16]}>
                                                        <Col span={12}>
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
                                                                    valueStyle={{ color: getTextColor(), fontSize: '24px', fontWeight: 'bold' }}
                                                                />
                                                            </div>
                                                        </Col>
                                                        <Col span={12}>
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
                                                                    valueStyle={{ color: getTextColor(), fontSize: '24px', fontWeight: 'bold' }}
                                                                    prefix={<CheckCircleOutlined />}
                                                                />
                                                            </div>
                                                        </Col>
                                                        <Col span={12}>
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
                                                                    valueStyle={{ color: getTextColor(), fontSize: '24px', fontWeight: 'bold' }}
                                                                    prefix={<CloseCircleOutlined />}
                                                                />
                                                            </div>
                                                        </Col>
                                                        <Col span={12}>
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
                                                                    valueStyle={{ color: getTextColor(), fontSize: '24px', fontWeight: 'bold' }}
                                                                    prefix={<StopOutlined />}
                                                                />
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

                                    {/* Enhanced Payment Methods Card */}
                                    <Col xs={24} lg={8}>
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
                                </Row>
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
                </div>
            </main>
        </div>
    );
}

export default ProfileUser;
