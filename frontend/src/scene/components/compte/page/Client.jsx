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

  /* Clickable elements styling */
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

const SearchWrapper = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;

  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

function Client() {
    // Simple search function for table columns
    const search = (dataIndex) => ({
        filterDropdown: false,
        onFilter: (value, record) =>
            record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : false,
    });
    const { theme } = useContext(ThemeContext);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { profileList, loading } = useSelector(state => state.profile);

    const [searchTerm, setSearchTerm] = useState("");
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);



    // Get current user for admin check
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        dispatch(getProfileList("client"));
        window.scrollTo(0, 0);
    }, [dispatch, user]);

    // Essential admin functions
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

    // Navigate to ProfileUser page
    const handleViewProfile = (client) => {
        if (client?.stores && client.stores.length > 0) {
            navigate(`/dashboard/profile-user/${client.stores[0]._id}`);
        } else {
            message.warning('Aucune boutique associée à ce client');
        }
    };

    // Format date helper
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    };




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
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.1)';
                            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
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
                    <span>{record.adresse || 'Non renseignée'}</span>
                </div>
            ),
            width: 200,
        },
        {
            title: 'Ville',
            dataIndex: 'ville',
            render: (_, record) => (
                <Tag color="blue">{record.ville || 'Non renseignée'}</Tag>
            ),
            width: 120,
        },
        {
            title: 'Nom Store',
            dataIndex: 'stores',
            render: (_, record) => (
                <div>
                    {record?.stores && record.stores.length > 0 ? (
                        record.stores.map((store, index) => (
                            <div key={index} style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaStore style={{ color: '#722ed1' }} />
                                <Tag
                                    color="purple"
                                    className="clickable-tag"
                                    style={{
                                        margin: 0,
                                        cursor: 'pointer',
                                        border: '1px solid #722ed1'
                                    }}
                                    onClick={() => handleViewProfile(record)}
                                >
                                    <Tooltip title="Cliquer pour voir le profil détaillé">
                                        {store?.storeName || 'Store sans nom'}
                                    </Tooltip>
                                </Tag>
                            </div>
                        ))
                    ) : (
                        <Tag color="default">Aucune boutique</Tag>
                    )}
                </div>
            ),
            width: 180,
        },
        {
            title: 'Status',
            dataIndex: 'active',
            render: (_, record) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <Tag color={record.active ? 'success' : 'error'}>
                        {record.active ? 'Actif' : 'Inactif'}
                    </Tag>
                    <Tag color={record.verify ? 'success' : 'warning'}>
                        {record.verify ? 'Vérifié' : 'Non vérifié'}
                    </Tag>
                </div>
            ),
            width: 120,
        },
        {
            title: 'Actions',
            dataIndex: 'action',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Tooltip title="Voir Profil Détaillé">
                        <Button
                            type="primary"
                            icon={<FaEye />}
                            onClick={() => handleViewProfile(record)}
                            style={{
                                backgroundColor: '#1890ff',
                                borderColor: '#1890ff'
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Réinitialiser le mot de passe">
                        <Button
                            type="primary"
                            icon={<FaKey />}
                            onClick={() => {
                                setSelectedUser(record);
                                setIsPasswordModalVisible(true);
                            }}
                            style={{
                                backgroundColor: '#722ed1',
                                borderColor: '#722ed1'
                            }}
                        />
                    </Tooltip>
                    <Tooltip title={record.verify ? "Compte vérifié" : "Vérifier le compte"}>
                        <Button
                            type="primary"
                            icon={<GoVerified />}
                            onClick={() => handleVerifyClient(record._id)}
                            disabled={record.verify}
                            style={{
                                backgroundColor: record.verify ? '#52c41a' : '#fa8c16',
                                borderColor: record.verify ? '#52c41a' : '#fa8c16'
                            }}
                        />
                    </Tooltip>
                    <Tooltip title={record.active ? "Désactiver le compte" : "Activer le compte"}>
                        <Button
                            type="primary"
                            icon={<ExclamationCircleOutlined />}
                            onClick={() => toggleActiveCompte(record._id, record.role)}
                            style={{
                                backgroundColor: record.active ? '#ff4d4f' : '#52c41a',
                                borderColor: record.active ? '#ff4d4f' : '#52c41a'
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Supprimer le compte">
                        <Button
                            type="primary"
                            danger
                            icon={<MdDelete />}
                            onClick={() => handleDeleteClient(record._id)}
                        />
                    </Tooltip>
                </div>
            ),
            width: 300,
        }
    ];

    const filteredData = (profileList || []).filter(client => {
        // Get store names if available
        const storeNames = client?.stores && client.stores.length > 0
            ? client.stores.map(store => store?.storeName || '').join(' ')
            : '';

        const fullText = [
            client?.nom || '',
            client?.prenom || '',
            client?.username || '',
            client?.email || '',
            client?.tele || '',
            client?.ville || '',
            client?.adresse || '',
            storeNames // Add store names to the search text
        ].join(' ').toLowerCase();

        return fullText.includes(searchTerm.toLowerCase());
    });

    // Handle password reset
    const handlePasswordReset = async (values) => {
        try {
            await dispatch(resetUserPassword(selectedUser._id, values.newPassword));
            message.success('Mot de passe réinitialisé avec succès');
            setIsPasswordModalVisible(false);
            setSelectedUser(null);
        } catch (error) {
            message.error('Erreur lors de la réinitialisation du mot de passe');
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
                        <Typography.Title level={4} style={{ marginBottom: '16px' }}>
                            Gestion des Clients
                        </Typography.Title>

                        <SearchWrapper>
                            <Input.Search
                                placeholder="Rechercher par nom, téléphone, ville, store..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 400 }}
                                allowClear
                            />
                            <Button
                                type="primary"
                                icon={<ReloadOutlined />}
                                onClick={() => dispatch(getProfileList("client"))}
                                loading={loading}
                            >
                                Actualiser
                            </Button>
                        </SearchWrapper>

                        <StyledTable
                            columns={columns}
                            dataSource={filteredData}
                            rowKey="_id"
                            theme={theme}
                            scroll={{ x: 'max-content' }}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} sur ${total} clients`,
                            }}
                            size="middle"
                            bordered
                            loading={loading}
                            locale={{
                                emptyText: loading ? 'Chargement...' : 'Aucun client trouvé'
                            }}
                        />

                        {/* Password Reset Modal */}
                        <Modal
                            title="Réinitialiser le mot de passe"
                            open={isPasswordModalVisible}
                            onCancel={() => {
                                setIsPasswordModalVisible(false);
                                setSelectedUser(null);
                            }}
                            footer={null}
                            centered
                        >
                            {selectedUser && (
                                <div style={{ padding: '20px' }}>
                                    <Typography.Text strong>
                                        Réinitialiser le mot de passe pour: {selectedUser.nom} {selectedUser.prenom}
                                    </Typography.Text>
                                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                        <Button
                                            type="primary"
                                            onClick={async () => {
                                                try {
                                                    await dispatch(resetUserPassword(selectedUser._id, 'newPassword123'));
                                                    message.success('Mot de passe réinitialisé avec succès');
                                                    setIsPasswordModalVisible(false);
                                                    setSelectedUser(null);
                                                } catch (error) {
                                                    message.error('Erreur lors de la réinitialisation');
                                                }
                                            }}
                                        >
                                            Réinitialiser le mot de passe
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Modal>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Client;
