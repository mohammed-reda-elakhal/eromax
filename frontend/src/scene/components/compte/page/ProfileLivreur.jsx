import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Avatar, Typography, Spin, Tag, Button, Statistic, message, Modal } from 'antd';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    TruckOutlined,
    ArrowLeftOutlined,
    ReloadOutlined,
    SettingOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    SafetyOutlined,
    DollarOutlined,
    GlobalOutlined,
    IdcardOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import { getProfile, toggleActiveClient, toggleApiKey } from '../../../../redux/apiCalls/profileApiCalls';
import styled from 'styled-components';

const { Title, Text } = Typography;

const ProfileContainer = styled.div`
  background: ${props => props.theme === 'dark' ? '#001529' : '#f8fafc'};
  min-height: 100vh;
  padding: 24px;
`;

const ProfileHeader = styled.div`
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
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

function ProfileLivreur() {
    const { theme } = useContext(ThemeContext);
    const dispatch = useDispatch();
    const { livreurId } = useParams();
    const { profile, loading, error } = useSelector(state => state.profile);
    const { user } = useSelector(state => state.auth);
    const navigate = useNavigate();

    const isAdmin = user?.role === 'admin';
    const livreur = profile;

    useEffect(() => {
        if (livreurId) {
            dispatch(getProfile(livreurId, 'livreur'));
        }
    }, [dispatch, livreurId]);

    const handleRefresh = () => {
        if (livreurId) {
            dispatch(getProfile(livreurId, 'livreur'));
        }
    };

    const handleGoBack = () => {
        navigate('/dashboard/list-colis');
    };

    const getTextColor = () => theme === 'dark' ? '#fff' : '#002242';

    const handleToggleUserActive = async () => {
        if (!isAdmin || !livreur) return;

        Modal.confirm({
            title: 'Confirmer l\'action',
            content: `Êtes-vous sûr de vouloir ${livreur.active ? 'désactiver' : 'activer'} ce compte livreur?`,
            icon: <ExclamationCircleOutlined />,
            onOk: async () => {
                try {
                    await dispatch(toggleActiveClient(livreur._id, 'livreur'));
                    dispatch(getProfile(livreurId, 'livreur'));
                    message.success(`Compte ${livreur.active ? 'désactivé' : 'activé'} avec succès`);
                } catch (error) {
                    message.error('Erreur lors de la modification du statut');
                }
            }
        });
    };

    // Admin: Toggle API key status (active/inactive)
    const handleToggleApiKey = async () => {
        if (!isAdmin || !livreur?._id) return;
        const isActive = livreur?.status === 'active';
        Modal.confirm({
            title: `Confirmer ${isActive ? 'la désactivation' : 'l\'activation'} de l'API`,
            content: `Voulez-vous ${isActive ? 'désactiver' : 'activer'} la clé API de ce livreur ?`,
            icon: <ExclamationCircleOutlined />,
            onOk: async () => {
                try {
                    await dispatch(toggleApiKey('livreur', livreur._id));
                    dispatch(getProfile(livreurId, 'livreur'));
                    message.success(`Clé API ${isActive ? 'désactivée' : 'activée'} avec succès`);
                } catch (_) {
                    message.error('Erreur lors de la mise à jour du statut API');
                }
            }
        });
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
                                        Chargement du profil livreur...
                                    </Text>
                                </div>
                            ) : error ? (
                                <StatsCard>
                                    <div style={{ textAlign: 'center', color: '#ff4d4f', padding: '40px' }}>
                                        <Text strong>Erreur: {error}</Text>
                                    </div>
                                </StatsCard>
                            ) : livreur ? (
                                <>
                                {/* Modern Profile Header */}
                                <ProfileHeader theme={theme}>
                                    <Row align="middle" gutter={[24, 24]}>
                                        <Col xs={24} sm={6}>
                                            <Avatar
                                                size={100}
                                                src={livreur?.profile?.url}
                                                icon={<UserOutlined />}
                                                style={{
                                                    border: '4px solid rgba(255,255,255,0.2)',
                                                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                                                }}
                                            />
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Title level={2} style={{ color: 'white', margin: 0, marginBottom: '8px' }}>
                                                {livreur?.nom} {livreur?.prenom}
                                            </Title>
                                            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', display: 'block', marginBottom: '8px' }}>
                                                @{livreur?.username}
                                            </Text>
                                            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', display: 'block', marginBottom: '16px' }}>
                                                <TruckOutlined style={{ marginRight: '8px' }} />
                                                Livreur {livreur?.type === 'company' ? 'Entreprise' : 'Simple'}
                                            </Text>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                <Tag color={livreur?.active ? 'success' : 'error'}>
                                                    {livreur?.active ? 'Actif' : 'Inactif'}
                                                </Tag>
                                                <Tag color={livreur?.type === 'company' ? 'blue' : 'default'}>
                                                    {livreur?.type === 'company' ? 'Entreprise' : 'Simple'}
                                                </Tag>
                                                <Tag color={livreur?.status === 'active' ? 'green' : 'red'}>
                                                    API: {livreur?.status || 'inactive'}
                                                </Tag>
                                            </div>
                                        </Col>
                                        <Col xs={24} sm={6} style={{ textAlign: 'right' }}>
                                            {isAdmin && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <ActionButton
                                                        type={livreur?.active ? 'default' : 'primary'}
                                                        icon={livreur?.active ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                                                        onClick={handleToggleUserActive}
                                                        style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}
                                                    >
                                                        {livreur?.active ? 'Désactiver' : 'Activer'}
                                                    </ActionButton>
                                                    <ActionButton
                                                        type={livreur?.status === 'active' ? 'default' : 'primary'}
                                                        icon={livreur?.status === 'active' ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                                                        onClick={handleToggleApiKey}
                                                        style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}
                                                    >
                                                        {livreur?.status === 'active' ? 'Désactiver API' : 'Activer API'}
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
                                                    <div>
                                                        <Text strong style={{ color: getTextColor() }}>Email</Text>
                                                        <Text style={{ color: getTextColor(), display: 'block' }}>{livreur?.email}</Text>
                                                    </div>
                                                </div>
                                                
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                                    <PhoneOutlined style={{ color: '#52c41a' }} />
                                                    <div>
                                                        <Text strong style={{ color: getTextColor() }}>Téléphone</Text>
                                                        <Text style={{ color: getTextColor(), display: 'block' }}>{livreur?.tele}</Text>
                                                    </div>
                                                </div>
                                                
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                                    <EnvironmentOutlined style={{ color: '#fa8c16' }} />
                                                    <div>
                                                        <Text strong style={{ color: getTextColor() }}>Adresse</Text>
                                                        <Text style={{ color: getTextColor(), display: 'block' }}>{livreur?.adresse}</Text>
                                                        <Text style={{ color: getTextColor(), fontSize: '12px', opacity: 0.7 }}>{livreur?.ville}</Text>
                                                    </div>
                                                </div>

                                                {livreur?.cin && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <IdcardOutlined style={{ color: '#722ed1' }} />
                                                        <div>
                                                            <Text strong style={{ color: getTextColor() }}>CIN</Text>
                                                            <Text style={{ color: getTextColor(), display: 'block' }}>{livreur?.cin}</Text>
                                                        </div>
                                                    </div>
                                                )}
                                            </InfoSection>
                                        </StatsCard>
                                    </Col>

                                    {/* Professional Information */}
                                    <Col xs={24} md={12}>
                                        <StatsCard theme={theme}>
                                            <Title level={4} style={{ color: getTextColor(), marginBottom: '20px' }}>
                                                <TruckOutlined style={{ marginRight: '8px' }} />
                                                Informations Professionnelles
                                            </Title>
                                            
                                            <InfoSection theme={theme}>
                                                {livreur?.tarif && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                                        <DollarOutlined style={{ color: '#52c41a' }} />
                                                        <div>
                                                            <Text strong style={{ color: getTextColor() }}>Tarif</Text>
                                                            <Text style={{ color: getTextColor(), display: 'block' }}>{livreur?.tarif} DH</Text>
                                                        </div>
                                                    </div>
                                                )}

                                                {livreur?.domaine && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                                        <GlobalOutlined style={{ color: '#1890ff' }} />
                                                        <div>
                                                            <Text strong style={{ color: getTextColor() }}>Domaine</Text>
                                                            <Text style={{ color: getTextColor(), display: 'block' }}>{livreur?.domaine}</Text>
                                                        </div>
                                                    </div>
                                                )}

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <CalendarOutlined style={{ color: '#fa8c16' }} />
                                                    <div>
                                                        <Text strong style={{ color: getTextColor() }}>Membre depuis</Text>
                                                        <Text style={{ color: getTextColor(), display: 'block' }}>
                                                            {new Date(livreur?.createdAt).toLocaleDateString('fr-FR')}
                                                        </Text>
                                                    </div>
                                                </div>
                                            </InfoSection>
                                        </StatsCard>
                                    </Col>

                                    {/* Coverage Areas */}
                                    {livreur?.villes && livreur.villes.length > 0 && (
                                        <Col xs={24}>
                                            <StatsCard theme={theme}>
                                                <Title level={4} style={{ color: getTextColor(), marginBottom: '20px' }}>
                                                    <EnvironmentOutlined style={{ marginRight: '8px' }} />
                                                    Zones de Couverture
                                                </Title>
                                                
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    {livreur.villes.map((ville, index) => (
                                                        <Tag key={index} color="blue" style={{ margin: '2px' }}>
                                                            {ville}
                                                        </Tag>
                                                    ))}
                                                </div>
                                            </StatsCard>
                                        </Col>
                                    )}
                                </Row>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '100px' }}>
                                    <TruckOutlined style={{ fontSize: '64px', color: getTextColor(), opacity: 0.3, marginBottom: '16px' }} />
                                    <Text style={{ color: getTextColor(), fontSize: '16px' }}>
                                        Aucun livreur trouvé
                                    </Text>
                                </div>
                            )}
                        </ProfileContainer>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ProfileLivreur;