import React, { useContext, useEffect, useState, useMemo } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import { FaPenFancy, FaInfoCircle, FaPlus, FaEye, FaKey, FaUser, FaPhone, FaEnvelope, FaCalendarAlt, FaShieldAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Avatar, Button, Modal, Drawer, Input, Switch, Form, message, Tooltip, Tag } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { deleteProfile, getProfileList, toggleActiveClient } from '../../../../redux/apiCalls/profileApiCalls';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../../global/Topbar';
import Menubar from '../../../global/Menubar';
import AdminFormAdd from '../components/AdminFormAdd';
import { resetUserPassword } from '../../../../redux/apiCalls/authApiCalls';
import { ReloadOutlined } from '@ant-design/icons';
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

const ClickableAdminName = styled.div`
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 2px 4px;
  border-radius: 4px;
  
  &:hover {
    background: ${props => props.theme === 'dark' ? 'rgba(66, 153, 225, 0.1)' : 'rgba(66, 153, 225, 0.1)'};
    color: #4299e1;
  }
`;

function Admin() {
    const { theme } = useContext(ThemeContext);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [drawerVisible, setDrawerVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const { profileList, user, loading } = useSelector((state) => ({
        profileList: state.profile.profileList,
        user: state.auth.user,
        loading: state.profile.loading,
    }));

    useEffect(() => {
        if (user) {
            dispatch(getProfileList("admin"));
        }
        window.scrollTo(0, 0);
    }, [dispatch, user]);

    const showPasswordModal = (user) => {
        setSelectedUser(user);
        setIsPasswordModalVisible(true);
    };

    const handlePasswordSubmit = async (values) => {
        const { newPassword } = values;
        if (!selectedUser) return;

        try {
            await dispatch(resetUserPassword(selectedUser._id, newPassword, selectedUser.role));
            message.success('Mot de passe mis à jour avec succès');
            setIsPasswordModalVisible(false);
        } catch (error) {
            message.error('Erreur lors de la mise à jour du mot de passe');
        }
    };

    const handlePasswordModalCancel = () => {
        setIsPasswordModalVisible(false);
    };

    const openDrawer = () => {
        setDrawerVisible(true);
    };

    const closeDrawer = () => {
        setDrawerVisible(false);
    };

    const handleDeleteProfile = (id) => {
        dispatch(deleteProfile("admin", id));
    };

    const toggleActiveCompte = (id, role) => {
        dispatch(toggleActiveClient(id, role));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    };

    const handleViewProfile = (admin) => {
        navigate(`/dashboard/compte/admin/${admin._id}`, { state: { from: '/dashboard/compte/admin' } });
    };



    // Memoized filtered profiles based on search query
    const filteredProfiles = useMemo(() => {
        if (!searchQuery) return profileList;

        return profileList.filter(profile => {
            const fullName = `${profile.nom} ${profile.prenom}`.toLowerCase();
            const username = profile.username?.toLowerCase() || '';
            const email = profile.email.toLowerCase();
            const tele = profile.tele?.toLowerCase() || '';
            const role = profile.role.toLowerCase();
            const type = profile.type?.toLowerCase() || '';
            const permission = profile.permission?.toLowerCase() || '';

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
                            <h4 style={{ margin: 0 }}>Gestion des Administrateurs</h4>
                            <div style={{ 
                                background: theme === 'dark' ? '#1a202c' : '#f7fafc',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: theme === 'dark' ? '#e2e8f0' : '#4a5568'
                            }}>
                                Total: {totalItems} administrateurs
                            </div>
                        </div>
                        <Button 
                            type="primary" 
                            icon={<FaPlus />} 
                            style={{ marginBottom: 16 }} 
                            onClick={() => openDrawer(null)}
                        >
                            Ajouter Admin
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
                                onClick={() => dispatch(getProfileList("admin"))}
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
                                            <th>Administrateur</th>
                                            <th>Contact</th>
                                            <th>Permissions</th>
                                            <th>Type</th>
                                            <th>Statut</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                                                    Chargement...
                                                </td>
                                            </tr>
                                        ) : currentData.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                                                    Aucun administrateur trouvé
                                                </td>
                                            </tr>
                                        ) : (
                                            currentData.map((admin) => (
                                                <tr key={admin._id}>
                                                    <td className="profile-cell">
                                                        <Tooltip title="Cliquer pour voir le profil">
                                                            <Avatar
                                                                src={admin.profile?.url || '/image/user.png'}
                                                                size="large"
                                                                onClick={() => handleViewProfile(admin)}
                                                                style={{
                                                                    border: `2px solid ${admin.active ? '#48bb78' : '#f56565'}`,
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
                                                                <ClickableAdminName 
                                                                    theme={theme}
                                                                    onClick={() => handleViewProfile(admin)}
                                                                >
                                                                    <strong style={{ color: theme === 'dark' ? '#fff' : '#2d3748' }}>
                                                                        {admin.nom} {admin.prenom}
                                                                    </strong>
                                                                </ClickableAdminName>
                                                            </Tooltip>
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#718096' }}>
                                                            @{admin.username || 'Non défini'}
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: '#a0aec0', marginTop: '4px' }}>
                                                            <FaCalendarAlt style={{ marginRight: '4px' }} />
                                                            {formatDate(admin.createdAt)}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ marginBottom: '4px', fontSize: '13px' }}>
                                                            <FaPhone style={{ color: '#48bb78', marginRight: '6px' }} />
                                                            {admin.tele || 'Non renseigné'}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>
                                                            <FaEnvelope style={{ marginRight: '6px' }} />
                                                            {admin.email}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <StatusTag color="gold">
                                                            <FaShieldAlt style={{ marginRight: '4px' }} />
                                                            {admin.permission || 'Standard'}
                                                        </StatusTag>
                                                    </td>
                                                    <td>
                                                        <div style={{ marginBottom: '6px' }}>
                                                            <StatusTag color="purple">
                                                                <FaUser style={{ marginRight: '4px' }} />
                                                                {admin.type || 'Standard'}
                                                            </StatusTag>
                                                        </div>
                                                        <div>
                                                            <StatusTag color="blue">
                                                                {admin.role}
                                                            </StatusTag>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ marginBottom: '8px' }}>
                                                            <Switch
                                                                checked={admin.active}
                                                                onChange={() => toggleActiveCompte(admin._id, admin.role)}
                                                                checkedChildren="Actif"
                                                                unCheckedChildren="Inactif"
                                                                style={{
                                                                    backgroundColor: admin.active ? '#48bb78' : '#f56565',
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
                                                                    onClick={() => handleViewProfile(admin)}
                                                                />
                                                            </Tooltip>

                                                            <Tooltip title="Réinitialiser le mot de passe">
                                                                <ActionButton
                                                                    style={{ backgroundColor: '#9f7aea', borderColor: '#9f7aea' }}
                                                                    icon={<FaKey />}
                                                                    size="small"
                                                                    onClick={() => showPasswordModal(admin)}
                                                                />
                                                            </Tooltip>

                                                            <Tooltip title="Modifier">
                                                                <ActionButton
                                                                    style={{ backgroundColor: '#48bb78', borderColor: '#48bb78' }}
                                                                    icon={<FaPenFancy />}
                                                                    size="small"
                                                                    onClick={() => navigate(`/dashboard/compte/admin/${admin._id}`, { state: { from: '/dashboard/compte/admin' } })}
                                                                />
                                                            </Tooltip>

                                                            <Tooltip title="Supprimer">
                                                                <ActionButton
                                                                    danger
                                                                    icon={<MdDelete />}
                                                                    size="small"
                                                                    onClick={() => handleDeleteProfile(admin._id)}
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
                                        Affichage {startIndex + 1}-{Math.min(endIndex, totalItems)} sur {totalItems} administrateurs
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
                            title={"Ajouter Administrateur"}
                            placement="right"
                            onClose={closeDrawer}
                            open={drawerVisible}
                            width={400}
                        >
                            <AdminFormAdd close={closeDrawer}/>
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
                                    <strong>Administrateur: {selectedUser.nom} {selectedUser.prenom}</strong>
                                    <br />
                                    <span style={{ color: '#718096' }}>Email: {selectedUser.email}</span>
                                </div>
                            )}
                            <Form
                                onFinish={handlePasswordSubmit}
                                layout="vertical"
                            >
                                <Form.Item
                                    label="Nouveau mot de passe"
                                    name="newPassword"
                                    rules={[
                                        { required: true, message: 'Veuillez saisir le nouveau mot de passe!' },
                                        { min: 6, message: 'Le mot de passe doit contenir au moins 6 caractères' },
                                    ]}
                                >
                                    <Input.Password placeholder="Entrez le nouveau mot de passe" />
                                </Form.Item>

                                <Form.Item
                                    label="Confirmer le nouveau mot de passe"
                                    name="confirmPassword"
                                    dependencies={['newPassword']}
                                    rules={[
                                        { required: true, message: 'Veuillez confirmer le nouveau mot de passe!' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('newPassword') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('Les mots de passe ne correspondent pas!'));
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password placeholder="Confirmez le nouveau mot de passe" />
                                </Form.Item>

                                <Form.Item>
                                    <Button type="primary" htmlType="submit" block>
                                        Réinitialiser le mot de passe
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

export default Admin;
