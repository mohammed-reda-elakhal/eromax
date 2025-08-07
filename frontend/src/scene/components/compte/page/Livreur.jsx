import React, { useContext, useEffect, useState, useMemo } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import { FaPenFancy, FaInfoCircle, FaPlus, FaBox, FaEye, FaKey, FaTruck, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUser, FaCalendarAlt } from "react-icons/fa";
import { MdAttachMoney, MdDelete } from "react-icons/md";
import { Avatar, Button, Modal, Drawer, Input, Switch, Form, message, Tooltip, Tag } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { deleteProfile, getProfileList } from '../../../../redux/apiCalls/profileApiCalls';
import { useNavigate } from 'react-router-dom';
import LivreurFormAdd from '../components/LivreurFormAdd';
import Topbar from '../../../global/Topbar';
import Menubar from '../../../global/Menubar';
import { toggleActiveClient } from '../../../../redux/apiCalls/profileApiCalls';
import { resetUserPassword } from '../../../../redux/apiCalls/authApiCalls';
import { ReloadOutlined } from '@ant-design/icons';
import { TbLockPassword, TbZoomMoneyFilled } from 'react-icons/tb';
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

  .profile-cell {
    text-align: center;
  }

  .actions-cell {
    text-align: center;
  }

  .colis-cell {
    background: ${props => props.theme === 'dark' ? '#1a202c' : '#fff5f5'};
    border-left: 4px solid #f56565;
    text-align: center;
    font-weight: bold;
  }

  .region-cell {
    background: ${props => props.theme === 'dark' ? '#1a202c' : '#f0fff4'};
    border-left: 4px solid #48bb78;
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

const RegionTag = styled.div`
  display: inline-block;
  background: linear-gradient(135deg, #48bb78, #38a169);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  margin: 2px;
  box-shadow: 0 1px 3px rgba(72, 187, 120, 0.2);
`;

const ClickableLivreurName = styled.div`
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 2px 4px;
  border-radius: 4px;
  
  &:hover {
    background: ${props => props.theme === 'dark' ? 'rgba(66, 153, 225, 0.1)' : 'rgba(66, 153, 225, 0.1)'};
    color: #4299e1;
  }
`;

function Livreur() {
    const { theme } = useContext(ThemeContext);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [drawerVisible, setDrawerVisible] = useState(false);
    const [currentClient, setCurrentClient] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const { profileList, user, loading } = useSelector((state) => ({
        profileList: state.profile.profileList,
        user: state.auth.user,
        loading: state.profile.loading, // Assuming you have a loading state
    }));

    useEffect(() => {
        if (user) {
            dispatch(getProfileList("livreur"));
        }
        window.scrollTo(0, 0);
    }, [dispatch, user]);

    const showPasswordModal = (user) => {
        setSelectedUser(user); // Set the selected user
        setIsPasswordModalVisible(true); // Show the password modal
    };

    const handlePasswordSubmit = async (values) => {
        const { newPassword } = values;

        if (!selectedUser) return;

        try {
            // Dispatch the action to reset the password
            await dispatch(resetUserPassword(selectedUser._id, newPassword, selectedUser.role));

            message.success('Password updated successfully');
            setIsPasswordModalVisible(false); // Close the modal after successful password reset
        } catch (error) {
            message.error('Failed to update password');
        }
    };

    const handlePasswordModalCancel = () => {
        setIsPasswordModalVisible(false);
    };

    const openDrawer = (client) => {
        setCurrentClient(client || {}); // If no client is passed, assume it's an 'Add' operation
        setDrawerVisible(true);
    };

    const closeDrawer = () => {
        setDrawerVisible(false);
        setCurrentClient(null);
    };

    const handleDeleteProfile = (id) => {
        dispatch(deleteProfile("livreur", id));
    };

    const toggleActiveCompte = (id, role) => {
        dispatch(toggleActiveClient(id, role));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    };

    const handleViewProfile = (livreur) => {
        navigate(`/dashboard/profile-livreur/${livreur._id}`);
    };

    // Memoized filtered profiles based on search query
    const filteredProfiles = useMemo(() => {
        if (!searchQuery) return profileList;

        return profileList.filter(profile => {
            const fullName = `${profile.nom} ${profile.prenom}`.toLowerCase();
            const username = profile.username.toLowerCase();
            const email = profile.email.toLowerCase();
            const tele = profile.tele.toLowerCase();
            const role = profile.role.toLowerCase();
            const type = profile.type.toLowerCase();
            const permission = profile.permission ? profile.permission.toLowerCase() : '';

            const query = searchQuery.toLowerCase();

            return (
                fullName.includes(query) ||
                username.includes(query) ||
                email.includes(query) ||
                tele.includes(query) ||
                role.includes(query) ||
                type.includes(query) ||
                permission.includes(query)
            );
        });
    }, [searchQuery, profileList]);

    // Pagination logic
    const totalItems = filteredProfiles.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentData = filteredProfiles.slice(startIndex, endIndex);

    // Reset to first page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    return (
        <div className='page-dashboard'>
            <Menubar/>
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
                            <h4 style={{ margin: 0 }}>Gestion des Livreurs</h4>
                            <div style={{ 
                                background: theme === 'dark' ? '#1a202c' : '#f7fafc',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: theme === 'dark' ? '#e2e8f0' : '#4a5568'
                            }}>
                                Total: {totalItems} livreurs
                            </div>
                        </div>
                        <Button 
                            type="primary" 
                            icon={<FaPlus />} 
                            style={{ marginBottom: 16 }} 
                            onClick={() => openDrawer(null)}
                        >
                            Ajouter Livreur
                        </Button>

                        {/* Search Input and Refresh Button */}
                        <div className='ville_header'  style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <Input
                                placeholder="Rechercher par nom, username, email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ width: '300px' }}
                                allowClear
                            />
                            <Button
                                type="primary"
                                icon={<ReloadOutlined />}
                                onClick={() => dispatch(getProfileList("livreur"))}
                            >
                                Rafraîchir
                            </Button>
                        </div>

                        <CustomTable theme={theme}>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Profile</th>
                                            <th>Livreur</th>
                                            <th>Contact</th>
                                            <th>Régions</th>
                                            <th>Colis</th>
                                            <th>Type</th>
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
                                        ) : currentData.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                                                    Aucun livreur trouvé
                                                </td>
                                            </tr>
                                        ) : (
                                            currentData.map((livreur) => (
                                                <tr key={livreur._id}>
                                                    <td className="profile-cell">
                                                        <Tooltip title="Cliquer pour voir le profil">
                                                            <Avatar
                                                                src={livreur.profile?.url || '/image/user.png'}
                                                                size="large"
                                                                onClick={() => handleViewProfile(livreur)}
                                                                style={{
                                                                    border: `2px solid ${livreur.active ? '#48bb78' : '#f56565'}`,
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
                                                            <Tooltip title="Cliquer pour voir le profil">
                                                                <ClickableLivreurName 
                                                                    theme={theme}
                                                                    onClick={() => handleViewProfile(livreur)}
                                                                >
                                                                    <strong style={{ color: theme === 'dark' ? '#fff' : '#2d3748' }}>
                                                                        {livreur.nom} {livreur.prenom}
                                                                    </strong>
                                                                </ClickableLivreurName>
                                                            </Tooltip>
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#718096' }}>
                                                            @{livreur.username}
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: '#a0aec0', marginTop: '4px' }}>
                                                            <FaCalendarAlt style={{ marginRight: '4px' }} />
                                                            {formatDate(livreur.createdAt)}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ marginBottom: '4px', fontSize: '13px' }}>
                                                            <FaPhone style={{ color: '#48bb78', marginRight: '6px' }} />
                                                            {livreur.tele || 'Non renseigné'}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>
                                                            <FaEnvelope style={{ marginRight: '6px' }} />
                                                            {livreur.email}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#718096' }}>
                                                            <FaMapMarkerAlt style={{ marginRight: '6px' }} />
                                                            {livreur.adresse || 'Non renseigné'}
                                                        </div>
                                                    </td>
                                                    <td className="region-cell">
                                                        {livreur.villes && livreur.villes.length > 0 ? (
                                                            <div>
                                                                {livreur.villes.slice(0, 3).map((ville, index) => (
                                                                    <RegionTag key={index}>
                                                                        {ville}
                                                                    </RegionTag>
                                                                ))}
                                                                {livreur.villes.length > 3 && (
                                                                    <div style={{ fontSize: '10px', color: '#f56565', marginTop: '4px', fontWeight: '600' }}>
                                                                        +{livreur.villes.length - 3} autres
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <StatusTag color="default">Aucune région</StatusTag>
                                                        )}
                                                    </td>
                                                    <td className="colis-cell">
                                                        <ColisCount>
                                                            <FaBox />
                                                            {livreur.colisCount || 0}
                                                        </ColisCount>
                                                    </td>
                                                    <td>
                                                        <div style={{ marginBottom: '6px' }}>
                                                            <StatusTag color="purple">
                                                                <FaTruck style={{ marginRight: '4px' }} />
                                                                {livreur.type || 'Standard'}
                                                            </StatusTag>
                                                        </div>
                                                        <div>
                                                            <StatusTag color="blue">
                                                                {livreur.role}
                                                            </StatusTag>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ marginBottom: '8px' }}>
                                                            <Switch
                                                                checked={livreur.active}
                                                                onChange={() => toggleActiveCompte(livreur._id, livreur.role)}
                                                                checkedChildren="Actif"
                                                                unCheckedChildren="Inactif"
                                                                style={{
                                                                    backgroundColor: livreur.active ? '#48bb78' : '#f56565',
                                                                }}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="actions-cell">
                                                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                            <Tooltip title="Voir le profil">
                                                                <ActionButton
                                                                    type="primary"
                                                                    icon={<FaEye />}
                                                                    size="small"
                                                                    onClick={() => handleViewProfile(livreur)}
                                                                />
                                                            </Tooltip>
                                                            
                                                            <Tooltip title="Tarifs">
                                                                <ActionButton
                                                                    style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
                                                                    icon={<TbZoomMoneyFilled />}
                                                                    size="small"
                                                                    onClick={() => navigate(`/dashboard/tarif-livreur/${livreur._id}`)}
                                                                />
                                                            </Tooltip>

                                                            <Tooltip title="Réinitialiser le mot de passe">
                                                                <ActionButton
                                                                    style={{ backgroundColor: '#9f7aea', borderColor: '#9f7aea' }}
                                                                    icon={<FaKey />}
                                                                    size="small"
                                                                    onClick={() => showPasswordModal(livreur)}
                                                                />
                                                            </Tooltip>

                                                            <Tooltip title="Modifier">
                                                                <ActionButton
                                                                    style={{ backgroundColor: '#48bb78', borderColor: '#48bb78' }}
                                                                    icon={<FaPenFancy />}
                                                                    size="small"
                                                                    onClick={() => navigate(`/dashboard/compte/livreur/${livreur._id}`, { state: { from: '/dashboard/compte/livreur' } })}
                                                                />
                                                            </Tooltip>

                                                            <Tooltip title="Supprimer">
                                                                <ActionButton
                                                                    danger
                                                                    icon={<MdDelete />}
                                                                    size="small"
                                                                    onClick={() => handleDeleteProfile(livreur._id)}
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
                                        Affichage {startIndex + 1}-{Math.min(endIndex, totalItems)} sur {totalItems} livreurs
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
                                        style={{ borderRadius: '6px', minWidth: '32px' }}
                                    >
                                        «
                                    </Button>
                                    <Button
                                        size="small"
                                        disabled={currentPage === 1}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        style={{ borderRadius: '6px', minWidth: '32px' }}
                                    >
                                        ‹
                                    </Button>
                                    
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
                                        style={{ borderRadius: '6px', minWidth: '32px' }}
                                    >
                                        ›
                                    </Button>
                                    <Button
                                        size="small"
                                        disabled={currentPage === totalPages}
                                        onClick={() => handlePageChange(totalPages)}
                                        style={{ borderRadius: '6px', minWidth: '32px' }}
                                    >
                                        »
                                    </Button>
                                </div>
                            </div>
                        )}
                        <Drawer
                            title={"Ajouter Livreur"}
                            placement="right"
                            onClose={closeDrawer}
                            open={drawerVisible}
                            width={400}
                        >
                            <LivreurFormAdd close={closeDrawer}/>
                        </Drawer>

                        {/* Password Reset Modal */}
                        <Modal
                            title="Réinitialiser le mot de passe"
                            open={isPasswordModalVisible}
                            onCancel={handlePasswordModalCancel}
                            footer={null}
                            centered
                            destroyOnClose
                        >
                            {selectedUser && (
                                <div style={{ marginBottom: '16px' }}>
                                    <strong>Livreur: {selectedUser.nom} {selectedUser.prenom}</strong>
                                    <br />
                                    <span style={{ color: '#718096' }}>Email: {selectedUser.email}</span>
                                </div>
                            )}
                            <Form
                                onFinish={handlePasswordSubmit}
                                layout="vertical"
                            >
                                <Form.Item
                                    label="New Password"
                                    name="newPassword"
                                    rules={[
                                        { required: true, message: 'Please input the new password!' },
                                        { min: 6, message: 'Password must be at least 6 characters' },
                                    ]}
                                >
                                    <Input.Password placeholder="Enter new password" />
                                </Form.Item>

                                <Form.Item
                                    label="Confirm New Password"
                                    name="confirmPassword"
                                    dependencies={['newPassword']}
                                    rules={[
                                        { required: true, message: 'Please confirm the new password!' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('newPassword') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('Passwords do not match!'));
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password placeholder="Confirm new password" />
                                </Form.Item>

                                <Form.Item>
                                    <Button type="primary" htmlType="submit" block>
                                        Reset Password
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Modal>

                    </div>
                </div>
            </main>
        </div>
    );
}

export default Livreur;
