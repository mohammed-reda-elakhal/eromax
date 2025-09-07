import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../../../ThemeContext';
import { FaEye, FaKey, FaStore, FaPlus, FaBox, FaEdit } from "react-icons/fa";
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
    Drawer
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
import ClientFormAdd from '../components/ClientFormAdd';
import ClientFormUpdate from '../components/ClientFormUpdate';
import styled from 'styled-components';

const CustomTable = styled.div`
  background: ${props => props.theme === 'dark' ? '#001529' : '#fff'};
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  overflow: hidden;
  margin-top: 20px;

  .table-container {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  thead {
    background: ${props => props.theme === 'dark' ? '#002242' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
    
    th {
      color: #fff;
      font-weight: 600;
      padding: 16px 12px;
      text-align: left;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 3px solid ${props => props.theme === 'dark' ? '#1f1f1f' : '#5a67d8'};
    }
  }

  tbody {
    tr {
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      border-bottom: 1px solid ${props => props.theme === 'dark' ? '#1f1f1f' : '#e2e8f0'};
      
      &:hover {
        background: ${props => props.theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(99, 102, 241, 0.02)'};
        border-left: 3px solid ${props => props.theme === 'dark' ? '#4299e1' : '#6366f1'};
      }
      
      &:last-child {
        border-bottom: none;
      }
    }

    td {
      padding: 16px 12px;
      vertical-align: middle;
      color: ${props => props.theme === 'dark' ? '#fff' : '#2d3748'};
    }
  }

  .store-cell {
    background: ${props => props.theme === 'dark' ? '#1a202c' : '#edf2f7'};
    border-left: 4px solid #9f7aea;
  }

  .wallet-cell {
    background: ${props => props.theme === 'dark' ? '#1a202c' : '#f0fff4'};
    border-left: 4px solid #48bb78;
  }

  .colis-cell {
    background: ${props => props.theme === 'dark' ? '#1a202c' : '#fff5f5'};
    border-left: 4px solid #f56565;
    text-align: center;
    font-weight: bold;
  }

  .profile-cell {
    text-align: center;
  }

  .actions-cell {
    text-align: center;
  }

  @media (max-width: 768px) {
    font-size: 12px;
    
    th, td {
      padding: 8px 6px;
    }
  }
`;

const ActionButton = styled(Button)`
  margin: 0 2px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const StatusTag = styled(Tag)`
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: none;
`;

const StoreTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #9f7aea, #805ad5);
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  margin: 2px 0;
  box-shadow: 0 1px 3px rgba(159, 122, 234, 0.2);
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    box-shadow: 0 2px 6px rgba(159, 122, 234, 0.3);
    transform: translateY(-1px);
    background: linear-gradient(135deg, #b794f6, #9f7aea);
  }
`;

const ClickableClientName = styled.div`
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 2px 4px;
  border-radius: 4px;
  
  &:hover {
    background: ${props => props.theme === 'dark' ? 'rgba(66, 153, 225, 0.1)' : 'rgba(66, 153, 225, 0.1)'};
    color: #4299e1;
  }
`;

const WalletInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .wallet-status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 10px;
    transition: all 0.2s ease;
    
    &.active {
      background: #c6f6d5;
      color: #22543d;
    }
    
    &.inactive {
      background: #fed7d7;
      color: #742a2a;
    }

    &:hover {
      transform: scale(1.02);
    }
  }
  
  .wallet-balance {
    font-size: 12px;
    color: #4a5568;
    font-weight: 500;
  }
`;

const ColisCount = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(255, 107, 107, 0.2);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 3px 8px rgba(255, 107, 107, 0.3);
    transform: translateY(-1px);
  }
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
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [updateDrawerVisible, setUpdateDrawerVisible] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

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

    const openDrawer = () => {
        setDrawerVisible(true);
    };

    const closeDrawer = () => {
        setDrawerVisible(false);
        setUpdateDrawerVisible(false);
        setSelectedClient(null);
        dispatch(getProfileList("client"));
    };

    const handleUpdateClient = (client) => {
        setSelectedClient(client);
        setUpdateDrawerVisible(true);
    };

    const handleUpdateSuccess = () => {
        setUpdateDrawerVisible(false);
        setSelectedClient(null);
        dispatch(getProfileList("client"));
        message.success('Client mis à jour avec succès');
    };



    const filteredData = profileList?.filter(client => {
        const searchLower = searchTerm.toLowerCase();
        const storeNames = client.stores?.map(store => store.storeName || '').join(' ').toLowerCase() || '';
        
        return (
            client.nom?.toLowerCase().includes(searchLower) ||
            client.prenom?.toLowerCase().includes(searchLower) ||
            client.email?.toLowerCase().includes(searchLower) ||
            client.tele?.includes(searchTerm) ||
            storeNames.includes(searchLower)
        );
    }) || [];

    // Pagination logic
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentData = filteredData.slice(startIndex, endIndex);

    // Reset to first page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size) => {
        setPageSize(size);
        setCurrentPage(1);
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
                            <h4 style={{ margin: 0 }}>Gestion des Clients</h4>
                            <div style={{ 
                                background: theme === 'dark' ? '#1a202c' : '#f7fafc',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: theme === 'dark' ? '#e2e8f0' : '#4a5568'
                            }}>
                                Total: {totalItems} clients
                            </div>
                        </div>
                        
                        <Button 
                            type="primary" 
                            icon={<FaPlus />} 
                            style={{ marginBottom: 16 }} 
                            onClick={openDrawer}
                        >
                            Ajouter Client
                        </Button>
                        
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

                        <CustomTable theme={theme}>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Stores</th>
                                            <th>Colis</th>
                                            <th>Wallet</th>
                                            <th>Profile</th>
                                            <th>Client</th>
                                            <th>Contact</th>
                                            <th>Statut</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                                                    Chargement...
                                                </td>
                                            </tr>
                                        ) : filteredData.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                                                    Aucun client trouvé
                                                </td>
                                            </tr>
                                        ) : (
                                            currentData.map((client) => (
                                                <tr key={client._id}>
                                                    <td className="store-cell">
                                                        {client.stores && client.stores.length > 0 ? (
                                                            client.stores.map((store, index) => (
                                                                <Tooltip key={index} title="Cliquer pour voir le profil du store">
                                                                    <StoreTag onClick={() => navigate(`/dashboard/profile-user/${store._id}`)}>
                                                                        <FaStore />
                                                                        {store.storeName || 'Store sans nom'}
                                                                    </StoreTag>
                                                                </Tooltip>
                                                            ))
                                                        ) : (
                                                            <StatusTag color="default">Aucune boutique</StatusTag>
                                                        )}
                                                    </td>
                                                    <td className="colis-cell">
                                                        <ColisCount>
                                                            <FaBox />
                                                            {client.totalColisCount || 0}
                                                        </ColisCount>
                                                    </td>
                                                    <td className="wallet-cell">
                                                        {client.stores && client.stores.length > 0 ? (
                                                            client.stores.map((store, index) => (
                                                                <WalletInfo key={index}>
                                                                    <div className={`wallet-status ${store.wallet?.active ? 'active' : 'inactive'}`}>
                                                                        {store.wallet?.active ? '✓ Actif' : '✗ Inactif'}
                                                                    </div>
                                                                    <div className="wallet-balance">
                                                                        {store.wallet?.solde || 0} DH
                                                                    </div>
                                                                </WalletInfo>
                                                            ))
                                                        ) : (
                                                            <StatusTag color="default">Pas de wallet</StatusTag>
                                                        )}
                                                    </td>
                                                    <td className="profile-cell">
                                                        <Tooltip title={`${client.verify ? "Compte vérifié" : "Compte non vérifié"}`}>
                                                            <Avatar
                                                                src={client.profile?.url || '/image/user.png'}
                                                                size="large"
                                                                onClick={() => handleViewProfile(client)}
                                                                style={{
                                                                    border: `2px solid ${client.verify ? '#48bb78' : '#f56565'}`,
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.target.style.transform = 'scale(1.05)';
                                                                    e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.target.style.transform = 'scale(1)';
                                                                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                                                }}
                                                            />
                                                        </Tooltip>
                                                    </td>
                                                    <td>
                                                        <div style={{ marginBottom: '8px' }}>
                                                            <Tooltip title="Cliquer pour voir le profil client">
                                                                <ClickableClientName 
                                                                    theme={theme}
                                                                    onClick={() => handleViewProfile(client)}
                                                                >
                                                                    <strong style={{ color: theme === 'dark' ? '#fff' : '#2d3748' }}>
                                                                        {client.nom} {client.prenom}
                                                                    </strong>
                                                                </ClickableClientName>
                                                            </Tooltip>
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#718096' }}>
                                                            {client.email}
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: '#a0aec0', marginTop: '4px' }}>
                                                            <CalendarOutlined /> {formatDate(client.createdAt)}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ marginBottom: '4px', fontSize: '13px' }}>
                                                            <PhoneOutlined style={{ color: '#48bb78', marginRight: '6px' }} />
                                                            {client.tele || 'Non renseigné'}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#718096' }}>
                                                            <EnvironmentOutlined style={{ marginRight: '6px' }} />
                                                            {client.adresse || 'Non renseigné'}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ marginBottom: '6px' }}>
                                                            <StatusTag color={client.active ? 'green' : 'red'}>
                                                                {client.active ? 'Actif' : 'Inactif'}
                                                            </StatusTag>
                                                        </div>
                                                        <div>
                                                            <StatusTag color={client.verify ? 'blue' : 'orange'}>
                                                                {client.verify ? 'Vérifié' : 'Non vérifié'}
                                                            </StatusTag>
                                                        </div>
                                                    </td>
                                                    <td className="actions-cell">
                                                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                            <Tooltip title="Modifier le client">
                                                                <ActionButton
                                                                    style={{ backgroundColor: '#4a6bdf', borderColor: '#4a6bdf' }}
                                                                    icon={<FaEdit />}
                                                                    size="small"
                                                                    onClick={() => handleUpdateClient(client)}
                                                                />
                                                            </Tooltip>

                                                            <Tooltip title="Voir le profil">
                                                                <ActionButton
                                                                    type="primary"
                                                                    icon={<FaEye />}
                                                                    size="small"
                                                                    onClick={() => handleViewProfile(client)}
                                                                />
                                                            </Tooltip>
                                                            
                                                            <Tooltip title="Réinitialiser le mot de passe">
                                                                <ActionButton
                                                                    style={{ backgroundColor: '#9f7aea', borderColor: '#9f7aea' }}
                                                                    icon={<FaKey />}
                                                                    size="small"
                                                                    onClick={() => handleResetPassword(client)}
                                                                />
                                                            </Tooltip>

                                                            <Tooltip title={client.verify ? "Déverifier" : "Vérifier"}>
                                                                <ActionButton
                                                                    style={{ 
                                                                        backgroundColor: client.verify ? '#718096' : '#48bb78',
                                                                        borderColor: client.verify ? '#718096' : '#48bb78'
                                                                    }}
                                                                    icon={<GoVerified />}
                                                                    size="small"
                                                                    onClick={() => handleVerifyClient(client._id)}
                                                                />
                                                            </Tooltip>

                                                            <Tooltip title={client.active ? "Désactiver" : "Activer"}>
                                                                <ActionButton
                                                                    style={{
                                                                        backgroundColor: client.active ? '#f56565' : '#48bb78',
                                                                        borderColor: client.active ? '#f56565' : '#48bb78'
                                                                    }}
                                                                    icon={<ReloadOutlined />}
                                                                    size="small"
                                                                    onClick={() => toggleActiveCompte(client._id, client.role)}
                                                                />
                                                            </Tooltip>

                                                            <Tooltip title="Supprimer">
                                                                <ActionButton
                                                                    danger
                                                                    icon={<MdDelete />}
                                                                    size="small"
                                                                    onClick={() => handleDeleteClient(client._id)}
                                                                />
                                                            </Tooltip>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CustomTable>

                        {/* Professional Pagination */}
                        {totalItems > 0 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: '24px',
                                padding: '16px 0',
                                borderTop: `1px solid ${theme === 'dark' ? '#1f1f1f' : '#e2e8f0'}`
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    fontSize: '14px',
                                    color: theme === 'dark' ? '#a0aec0' : '#718096'
                                }}>
                                    <span>
                                        Affichage {startIndex + 1}-{Math.min(endIndex, totalItems)} sur {totalItems} clients
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>Afficher:</span>
                                        <select
                                            value={pageSize}
                                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                            style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                border: `1px solid ${theme === 'dark' ? '#4a5568' : '#cbd5e0'}`,
                                                background: theme === 'dark' ? '#2d3748' : '#fff',
                                                color: theme === 'dark' ? '#fff' : '#2d3748',
                                                fontSize: '13px'
                                            }}
                                        >
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Button
                                        size="small"
                                        disabled={currentPage === 1}
                                        onClick={() => handlePageChange(1)}
                                        style={{
                                            borderRadius: '6px',
                                            minWidth: '32px'
                                        }}
                                    >
                                        ≪
                                    </Button>
                                    <Button
                                        size="small"
                                        disabled={currentPage === 1}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        style={{
                                            borderRadius: '6px',
                                            minWidth: '32px'
                                        }}
                                    >
                                        ‹
                                    </Button>
                                    
                                    {/* Page Numbers */}
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        
                                        return (
                                            <Button
                                                key={pageNum}
                                                size="small"
                                                type={currentPage === pageNum ? 'primary' : 'default'}
                                                onClick={() => handlePageChange(pageNum)}
                                                style={{
                                                    borderRadius: '6px',
                                                    minWidth: '32px',
                                                    fontWeight: currentPage === pageNum ? '600' : '400'
                                                }}
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                    
                                    <Button
                                        size="small"
                                        disabled={currentPage === totalPages}
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        style={{
                                            borderRadius: '6px',
                                            minWidth: '32px'
                                        }}
                                    >
                                        ›
                                    </Button>
                                    <Button
                                        size="small"
                                        disabled={currentPage === totalPages}
                                        onClick={() => handlePageChange(totalPages)}
                                        style={{
                                            borderRadius: '6px',
                                            minWidth: '32px'
                                        }}
                                    >
                                        ≫
                                    </Button>
                                </div>
                            </div>
                        )}

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
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <Button type="primary" icon={<FaPlus />} onClick={openDrawer}>
                                                Ajouter un client
                                            </Button>
                                            <Button 
                                                type="primary" 
                                                icon={<EditOutlined />} 
                                                onClick={() => handleUpdateClient(record)}
                                                disabled={!record}
                                            >
                                                Modifier
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </Modal>

                        <Drawer
                            title="Ajouter Client"
                            placement="right"
                            onClose={closeDrawer}
                            open={drawerVisible}
                            width={400}
                        >
                            <ClientFormAdd close={closeDrawer} />
            <Drawer
                title="Modifier le client"
                width={500}
                onClose={closeDrawer}
                visible={updateDrawerVisible}
                bodyStyle={{ paddingBottom: 80 }}
            >
                {selectedClient && (
                    <ClientFormUpdate 
                        client={selectedClient} 
                        onSuccess={handleUpdateSuccess} 
                        onCancel={closeDrawer}
                    />
                )}
            </Drawer>
                        </Drawer>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Client;