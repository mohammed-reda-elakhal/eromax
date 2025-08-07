import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../../../ThemeContext';
import { FaEye, FaKey, FaStore } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { GoVerified } from "react-icons/go";
import {
    Modal,
    Button,
    Avatar,
    Typography,
    Tooltip,
    Tag,
    message,
    Input,
    Table
} from 'antd';
import {
    EnvironmentOutlined,
    PhoneOutlined,
    ReloadOutlined,
    ExclamationCircleOutlined,
    UserOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
    deleteProfile,
    getProfileList,
    toggleActiveClient,
    verifyClient
} from '../../../../redux/apiCalls/profileApiCalls';
import { resetUserPassword } from '../../../../redux/apiCalls/authApiCalls';
import Topbar from '../../../global/Topbar';
import Menubar from '../../../global/Menubar';
import styled from 'styled-components';

const StyledTable = styled(Table)`
  .ant-table {
    background: ${props => props.theme === 'dark' ? '#001529' : '#fff'};
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .ant-table-thead > tr > th {
    background: ${props => props.theme === 'dark' ? '#002242' : '#f0f2f5'};
    color: ${props => props.theme === 'dark' ? '#fff' : '#001529'};
    font-weight: 600;
    padding: 16px;
    border-bottom: 2px solid ${props => props.theme === 'dark' ? '#1f1f1f' : '#e8e8e8'};
  }

  .ant-table-tbody > tr > td {
    padding: 16px;
    transition: background 0.3s;
  }

  .ant-table-tbody > tr:hover > td {
    background: ${props => props.theme === 'dark' ? '#003366' : '#f5f5f5'};
  }

  .ant-table-pagination {
    margin: 16px 0;
    display: flex;
    justify-content: flex-end;
  }

  .ant-avatar {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
  }

  .ant-tag {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &.clickable-tag:hover {
      transform: scale(1.05);
      box-shadow: 0 2px 8px rgba(114, 46, 209, 0.3);
    }
  }

  .clickable-name {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      background-color: ${props => props.theme === 'dark' ? '#1f1f1f' : '#f0f8ff'} !important;
      transform: translateX(2px);
    }
  }

  @media (max-width: 768px) {
    .ant-table {
      overflow-x: auto;
    }

    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      padding: 12px 8px;
      white-space: nowrap;
    }
  }
`;

const ActionButton = styled(Button)`
  margin: 0 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  }
`;

const StatusTag = styled(Tag)`
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  text-transform: capitalize;
`;



function Client() {
    const search = (dataIndex) => ({
        filterDropdown: false,
        onFilter: (value, record) =>
            record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : false,
    });
    
    const { theme } = useContext(ThemeContext);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { profileList, loading } = useSelector(state => state.profile);
    const { user } = useSelector(state => state.auth);

    const [searchTerm, setSearchTerm] = useState("");
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newPassword, setNewPassword] = useState("");

    useEffect(() => {
        dispatch(getProfileList("client"));
        window.scrollTo(0, 0);
    }, [dispatch, user]);

    const toggleActiveCompte = (id, role) => {
        dispatch(toggleActiveClient(id, role));
    };

    const handleVerifyClient = (id) => {
        dispatch(verifyClient(id));
    };

    const handleDeleteClient = (id) => {
        Modal.confirm({
            title: 'Êtes-vous sûr de vouloir supprimer ce client?',
            content: 'Cette action est irréversible.',
            okText: 'Oui',
            cancelText: 'Non',
            onOk: () => {
                dispatch(deleteProfile(id));
            }
        });
    };

    const handleViewProfile = (client) => {
        if (client?.stores && client.stores.length > 0) {
            navigate(`/dashboard/profile-user/${client.stores[0]._id}`);
        } else {
            message.warning('Aucune boutique associée à ce client');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    };

    const handleResetPassword = (client) => {
        setSelectedUser(client);
        setIsPasswordModalVisible(true);
    };

    const handlePasswordReset = () => {
        if (!newPassword.trim()) {
            message.error('Veuillez saisir un nouveau mot de passe');
            return;
        }
        if (newPassword.length < 6) {
            message.error('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }
        
        dispatch(resetUserPassword(selectedUser._id, newPassword, 'client'));
        setIsPasswordModalVisible(false);
        setNewPassword('');
        setSelectedUser(null);
    };

    const handleCancelPasswordReset = () => {
        setIsPasswordModalVisible(false);
        setNewPassword('');
        setSelectedUser(null);
    };

    // Prevent modal from affecting search input
    useEffect(() => {
        if (!isPasswordModalVisible) {
            setNewPassword('');
        }
    }, [isPasswordModalVisible]);

    const columns = [
        {
            title: 'Profile',
            dataIndex: 'profile',
            render: (_, record) => (
                <Tooltip title={`${record.verify ? "Compte vérifié" : "Compte non vérifié"} - Cliquer pour voir le profil détaillé`}>
                    <Avatar
                        src={record.profile?.url || '/image/user.png'}
                        size="large"
                        onClick={() => handleViewProfile(record)}
                        style={{
                            border: `2px solid ${record.verify ? '#52c41a' : '#ff4d4f'}`,
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                    />
                </Tooltip>
            ),
            width: 80,
        },
        {
            title: 'Date Création',
            dataIndex: 'createdAt',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CalendarOutlined style={{ color: '#1890ff' }} />
                    {formatDate(record.createdAt)}
                </div>
            ),
            width: 150,
        },
        {
            title: 'Nom Complet',
            dataIndex: 'nom',
            ...search('nom'),
            render: (_, record) => (
                <div
                    className="clickable-name"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '6px'
                    }}
                    onClick={() => handleViewProfile(record)}
                >
                    <UserOutlined style={{ color: '#1890ff' }} />
                    <Tooltip title="Cliquer pour voir le profil détaillé">
                        <span style={{ fontWeight: '500', color: '#1890ff' }}>
                            {record.nom} {record.prenom}
                        </span>
                    </Tooltip>
                </div>
            ),
            width: 200,
        },
        {
            title: 'Téléphone',
            dataIndex: 'tele',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PhoneOutlined style={{ color: '#52c41a' }} />
                    {record.tele || 'Non renseigné'}
                </div>
            ),
            width: 150,
        },
        {
            title: 'Adresse',
            dataIndex: 'adresse',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <EnvironmentOutlined style={{ color: '#fa8c16' }} />
                    <span>{record.adresse || 'Non renseigné'}</span>
                </div>
            ),
            width: 200,
        },
        {
            title: 'Statut',
            dataIndex: 'active',
            render: (_, record) => (
                <StatusTag color={record.active ? 'green' : 'red'}>
                    {record.active ? 'Actif' : 'Inactif'}
                </StatusTag>
            ),
            width: 100,
        },
        {
            title: 'Vérification',
            dataIndex: 'verify',
            render: (_, record) => (
                <StatusTag color={record.verify ? 'blue' : 'orange'}>
                    {record.verify ? 'Vérifié' : 'Non vérifié'}
                </StatusTag>
            ),
            width: 120,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Tooltip title="Voir le profil">
                        <ActionButton
                            type="primary"
                            icon={<FaEye />}
                            size="small"
                            onClick={() => handleViewProfile(record)}
                        />
                    </Tooltip>
                    
                    <Tooltip title="Réinitialiser le mot de passe">
                        <ActionButton
                            type="default"
                            icon={<FaKey />}
                            size="small"
                            onClick={() => handleResetPassword(record)}
                        />
                    </Tooltip>

                    <Tooltip title={record.verify ? "Déverifier" : "Vérifier"}>
                        <ActionButton
                            type={record.verify ? "default" : "primary"}
                            icon={<GoVerified />}
                            size="small"
                            onClick={() => handleVerifyClient(record._id)}
                        />
                    </Tooltip>

                    <Tooltip title={record.active ? "Désactiver" : "Activer"}>
                        <ActionButton
                            type={record.active ? "default" : "primary"}
                            icon={<ReloadOutlined />}
                            size="small"
                            onClick={() => toggleActiveCompte(record._id, record.role)}
                        />
                    </Tooltip>

                    <Tooltip title="Supprimer">
                        <ActionButton
                            type="primary"
                            danger
                            icon={<MdDelete />}
                            size="small"
                            onClick={() => handleDeleteClient(record._id)}
                        />
                    </Tooltip>
                </div>
            ),
            width: 200,
        },
    ];

    const filteredData = profileList?.filter(client =>
        client.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.tele?.includes(searchTerm)
    ) || [];

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
                        <h4>Gestion des Clients</h4>
                        
                        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <Input
                                placeholder="Rechercher par nom, prénom, email ou téléphone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '300px' }}
                                allowClear
                            />
                            <Button
                                type="primary"
                                icon={<ReloadOutlined />}
                                onClick={() => dispatch(getProfileList("client"))}
                            >
                                Rafraîchir
                            </Button>
                        </div>

                        <StyledTable
                            theme={theme}
                            columns={columns}
                            dataSource={filteredData}
                            rowKey="_id"
                            loading={loading}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} clients`,
                            }}
                            scroll={{ x: 1200 }}
                        />

                        <Modal
                            title="Réinitialiser le mot de passe"
                            open={isPasswordModalVisible}
                            onCancel={handleCancelPasswordReset}
                            footer={null}
                            centered
                            destroyOnClose
                            maskClosable={false}
                        >
                            {selectedUser && (
                                <>
                                    <div style={{ marginBottom: '16px' }}>
                                        <Typography.Text strong>
                                            Client: {selectedUser.nom} {selectedUser.prenom}
                                        </Typography.Text>
                                        <br />
                                        <Typography.Text type="secondary">
                                            Email: {selectedUser.email}
                                        </Typography.Text>
                                    </div>
                                    <Input.Password
                                        placeholder="Nouveau mot de passe"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        minLength={6}
                                        style={{ marginBottom: '16px' }}
                                        autoComplete="new-password"
                                    />
                                    <Typography.Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '16px' }}>
                                        Le mot de passe doit contenir au moins 6 caractères
                                    </Typography.Text>
                                    <div style={{ textAlign: 'right' }}>
                                        <Button onClick={handleCancelPasswordReset} style={{ marginRight: '8px' }}>
                                            Annuler
                                        </Button>
                                        <Button type="primary" onClick={handlePasswordReset} loading={loading}>
                                            Réinitialiser
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Modal>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Client;