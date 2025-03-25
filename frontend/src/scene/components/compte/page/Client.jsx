import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import TableDashboard from '../../../global/TableDashboard';
import { FaBox, FaPenFancy, FaPlus, FaWallet } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { GoVerified } from "react-icons/go";
import { 
    Drawer, 
    Modal, 
    Button, 
    Spin, 
    Card, 
    Avatar, 
    Row, 
    Col, 
    Typography, 
    Space, 
    Tooltip, 
    Tag, 
    Descriptions,
    Switch ,
    Image,
    Form,
    message ,
    Input,
    Empty
} from 'antd';
import { 
    EnvironmentOutlined, 
    PhoneOutlined, 
    DollarCircleOutlined, 
    ReloadOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { 
    deleteProfile, 
    getProfileList, 
    toggleActiveClient,
    verifyClient 
} from '../../../../redux/apiCalls/profileApiCalls';
import { 
    getStoreByUser, 
    deleteStore,
    toggleAutoDR
} from '../../../../redux/apiCalls/storeApiCalls'; 
import { 
    fetchUserDocuments,  
} from '../../../../redux/apiCalls/docApiCalls'; 
import { docActions } from '../../../../redux/slices/docSlices';
import { useNavigate } from 'react-router-dom';
import ClientFormAdd from '../components/ClientFormAdd';
import Topbar from '../../../global/Topbar';
import Menubar from '../../../global/Menubar';
import StoreForm from '../../profile/components/StoreForm';
import { IoDocumentAttach } from 'react-icons/io5';
import { FaB } from 'react-icons/fa6';
import { resetUserPassword } from '../../../../redux/apiCalls/authApiCalls';
import { TbLockPassword } from 'react-icons/tb';
import { getWalletByStore, toggleWalletActivation } from '../../../../redux/apiCalls/walletApiCalls';
import { Table } from 'antd';
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

function Client({ search }) {
    const { theme } = useContext(ThemeContext);

    const [isModalStoreOpen, setIsModalStoreOpen] = useState(false);
    const [selectedStores, setSelectedStores] = useState([]);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [currentClient, setCurrentClient] = useState(null);
    const [loadingStores, setLoadingStores] = useState(false);
    const [isStoreFormVisible, setIsStoreFormVisible] = useState(false);
    const [storeToEdit, setStoreToEdit] = useState(null);

    const [isDocumentsModalVisible, setIsDocumentsModalVisible] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    const [searchTerm, setSearchTerm] = useState(""); // New state for search input

    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null); // Store selected user for password reset
    const [form] = Form.useForm(); // Ant Design Form instance

    const [isWalletModalVisible, setIsWalletModalVisible] = useState(false);
    const [loadingWallet, setLoadingWallet] = useState(false);

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
            form.resetFields(); // Reset the form fields
        } catch (error) {
            message.error('Failed to update password');
        }
    };

    const handleCancel = () => {
        setIsPasswordModalVisible(false);
        form.resetFields(); // Reset the form when the modal is closed
    };


    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { profileList, user, loading, error } = useSelector((state) => ({
        profileList: state.profile.profileList,
        user: state.auth.user,
        loading: state.profile.loading,
        error: state.profile.error
    }));

    const { stores } = useSelector((state) => ({
        stores: state.store.stores,
    }));

    const { files, loading: loadingDocs, error: errorDocs } = useSelector((state) => state.file);

    const { wallets, selectedWallet, loading: walletLoading } = useSelector((state) => ({
        wallets: state.wallet.wallets,
        selectedWallet: state.wallet.selectedWallet,
        loading: state.wallet.loading
    }));

    useEffect(() => {
        dispatch(getProfileList("client"));
        window.scrollTo(0, 0);
    }, [dispatch, user]);

    const openStoresModal = async (id) => {
        setLoadingStores(true);
        try {
            await dispatch(getStoreByUser(id));
            setIsModalStoreOpen(true);
        } catch (err) {
            console.error("Failed to fetch stores:", err);
            Modal.error({
                title: 'Erreur',
                content: 'Impossible de récupérer les magasins associés au client.',
            });
        } finally {
            setLoadingStores(false);
        }
    };

    useEffect(() => {
        if (isModalStoreOpen) {
            setSelectedStores(stores);
        }
    }, [stores, isModalStoreOpen]);

    const toggleActiveCompte = (id , role) => {
        dispatch(toggleActiveClient(id , role));
    };

    const handleOk = () => {
        setIsModalStoreOpen(false);
        setSelectedStores([]);
    };

    const openDrawer = (client) => {
        setCurrentClient(client || {});
        setDrawerVisible(true);
    };

    const closeDrawer = () => {
        setDrawerVisible(false);
        setCurrentClient(null);
    };

    const handleDeleteProfile = (id) => {
        Modal.confirm({
            title: 'Supprimer le client',
            content: 'Êtes-vous sûr de vouloir supprimer ce client?',
            okText: 'Oui',
            okType: 'danger',
            cancelText: 'Non',
            onOk: () => {
                dispatch(deleteProfile("client", id));
            },
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    const openDocumentsModal = (client) => {
        setSelectedClient(client);
        setIsDocumentsModalVisible(true);
        dispatch(fetchUserDocuments(client.role, client._id))
            .catch(() => {
                // Handle error if needed
            });
    };

    const closeDocumentsModal = () => {
        setIsDocumentsModalVisible(false);
        setSelectedClient(null);
    };

    const handleVerifyClient = (clientId) => {
        Modal.confirm({
            title: 'Vérifier le client',
            content: 'Êtes-vous sûr de vouloir vérifier ce compte client?',
            okText: 'Oui',
            cancelText: 'Non',
            onOk: () => {
                dispatch(verifyClient(clientId));
            },
        });
    };

    const showWalletModal = async (storeId) => {
        setLoadingWallet(true);
        try {
            // Ensure storeId is a string
            const id = typeof storeId === 'object' ? storeId._id : String(storeId);
            await dispatch(getWalletByStore(id));
            setIsWalletModalVisible(true);
        } catch (error) {
            console.error("Failed to fetch wallet:", error);
            message.error("Failed to fetch wallet information");
        } finally {
            setLoadingWallet(false);
        }
    };

    const handleToggleWallet = async (walletId, currentStatus) => {
        try {
            setLoadingWallet(true);
            
            // Call the API to toggle the wallet status
            const success = await dispatch(toggleWalletActivation(walletId));
            
            // Only refresh if the toggle was successful
            if (success && selectedWallet?.store) {
                await dispatch(getWalletByStore(selectedWallet.store));
            }
        } finally {
            setLoadingWallet(false);
        }
    };

    const columns = [
        {
            title: 'Profile',
            dataIndex: 'profile',
            render: (text, record) => (
                <Tooltip title={record.verify ? "Compte vérifié" : "Compte non vérifié"}>
                    <Avatar 
                        src={record.profile?.url || '/image/user.png'} 
                        size="large"
                        style={{
                            border: `2px solid ${record.verify ? '#52c41a' : '#ff4d4f'}`,
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    />
                </Tooltip>
            ),
            width: 80,
        },
        {
            title: 'Register Date',
            dataIndex: 'createdAt',
            render: (text, record) => (
                <>{formatDate(record.createdAt)}</>
            ),
            width: 150,
        },
        {
            title: 'Nom Complet',
            dataIndex: 'nom',
            ...search('nom'),
            render: (text, record) => (
                <span>{record.nom} {record.prenom}</span>
            ),
            width: 200,
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            ...search('username'),
            width: 150,
        },
        {
            title: 'N° Store',
            dataIndex: 'stores',
            render: (text, record) => (
              <Tag 
                color='green' 
                style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }} 
                onClick={() => openStoresModal(record._id)}
              >
                {(record.stores && record.stores.length) || 0} Store{(record.stores && record.stores.length > 1) ? 's' : ''}
              </Tag>
            ),
            width: 100,
          },
          {
            title: 'Store Info',
            render: (text, record) => (
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                {record.stores && record.stores.length > 0 ? (
                  record.stores.map((store, index) => (
                    <div key={index} style={{ marginBottom: '8px' }}>
                      <div style={{ fontWeight: 'bold', color: '#28a745' }}>
                        {store.storeName}
                      </div>
                    </div>
                  ))
                ) : (
                  <span>No stores found</span>
                )}
              </div>
            ),
            width: 200,
          },       
        {
            title: 'N° Colis',
            width: 150,
            render: (text, record) => (
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    {record.stores && record.stores.length > 0 ? (
                        record.stores.map((store, index) => (
                            <div key={index} style={{ marginBottom: '8px' }}>
                                <div style={{ fontWeight: 'bold', color: '#ff5722' }}>
                                    <FaBox /> {store.colisCount}
                                </div>
                            </div>
                        ))
                    ) : (
                        <span>No stores found</span>
                    )}
                </div>
            )
        }, 
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            ...search('email'),
            width: 200,
        },
        {
            title: 'Téléphone',
            dataIndex: 'tele',
            key: 'tele',
            ...search('tele'),
            width: 150,
        },
        {
            title: 'Ville',
            dataIndex: 'ville',
            key: 'ville',
            ...search('ville'),
            width: 150,
        },
        {
            title: 'Adresse',
            dataIndex: 'adresse',
            key: 'adresse',
            width: 200,
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            width: 100,
        },
        {
            title: 'Autre',
            render: (text, record) => (
                <>
                    <span>Debut en : <strong>{record.start_date}</strong> </span> <br />
                    <span>Envoyer : <strong>{record.number_colis} colis</strong> </span> 
                </>
            ),
            width: 200,
        },
        {
            title: 'Activation de compte',
            dataIndex: 'active',
            key: 'active',
            render: (active, record) => (
                <Switch
                    checked={active}
                    onChange={() => toggleActiveCompte(record._id , record?.role)}
                    checkedChildren="Activer"
                    unCheckedChildren="Désactiver"
                    style={{
                        backgroundColor: active ? '#28a745' : '#dc3545',
                        borderColor: active ? '#28a745' : '#dc3545',
                    }}
                />
            ),
            width: 150,
        },
        {
            title: 'Wallet Info',
            dataIndex: 'wallet',
            render: (text, record) => (
                <div>
                    {record.stores && record.stores.map((store, index) => (
                        <Tag
                            key={index}
                            color="blue"
                            style={{ cursor: 'pointer', marginBottom: '4px', display: 'block' }}
                            onClick={() => showWalletModal(store._id)}
                        >
                            <FaWallet /> Wallet
                        </Tag>
                    ))}
                </div>
            ),
            width: 150,
        },
        {
            title: 'Action',
            dataIndex: 'action',
            render: (text, record) => (
                <div className='action_user'>
                    <Tooltip title="Voir Documents" key="view-docs">
                        <Button 
                            type="link" 
                            style={{ color: '#0080ff', borderColor: "#0080ff", background: "transparent", marginRight: '8px' }} 
                            icon={<IoDocumentAttach size={20} />}
                            onClick={() => openDocumentsModal(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Change mots de passe" key="change-password">
                        <Button 
                            type="link" 
                            style={{ color: 'blue', borderColor: "blue" , background: "transparent", marginRight: '8px' }} 
                            icon={<TbLockPassword size={20} />}
                            onClick={() => showPasswordModal(record)}
                        />
                    </Tooltip>
                    {!record.verify && (
                        <Tooltip title="Vérifier le client" key="verify-client">
                            <Button 
                                type="link" 
                                style={{ color: 'green', borderColor: "green", background: "transparent", marginRight: '8px' }} 
                                icon={<GoVerified size={20} />}
                                onClick={() => handleVerifyClient(record._id)}
                            />
                        </Tooltip>
                    )}
                    
                    <Tooltip title="Edit Client" key="edit-client">
                        <Button 
                            type="link" 
                            style={{ color: 'var(--limon)', borderColor: "var(--limon)", background: "transparent", marginRight: '8px' }} 
                            icon={<FaPenFancy size={20} />}
                            onClick={() => navigate(`/dashboard/compte/client/${record._id}`, { state: { from: '/dashboard/compte/client' } })}
                        />
                    </Tooltip>
                    <Tooltip title="Delete Client" key="delete-client">
                        <Button 
                            type="link" 
                            style={{ color: 'red', borderColor: "red", background: "transparent" }} 
                            icon={<MdDelete size={20} />}
                            onClick={() => handleDeleteProfile(record._id)}
                        />
                    </Tooltip>
                </div>
            ),
            width: 200,
        }
    ];

    const filteredData = profileList.filter(client => {
        const fullText = [
            client.nom,
            client.prenom,
            client.username,
            client.email,
            client.tele,
            client.ville,
            client.adresse
        ].join(' ').toLowerCase();

        return fullText.includes(searchTerm.toLowerCase());
    });

    const openStoreForm = (store) => {
        setStoreToEdit(store);
        setIsStoreFormVisible(true);
    };

    const closeStoreForm = () => {
        setIsStoreFormVisible(false);
        setStoreToEdit(null);
    };

    const handleToggleAutoDR = (storeId) => {
        dispatch(toggleAutoDR(storeId));
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
                        <Typography.Title level={4} style={{ marginBottom: '16px' }}>Gestion des utilisateurs ( client )</Typography.Title>
                        
                            <Button 
                                type="primary" 
                                icon={<FaPlus />} 
                                onClick={() => openDrawer(null)}
                                style={{ marginBottom: 16 }} 
                            >
                                Add Client
                            </Button>
                        <SearchWrapper>
                            <Input.Search
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 300 }}
                                allowClear
                            />
                            <Button
                                type="primary"
                                icon={<ReloadOutlined />}
                                onClick={() => dispatch(getProfileList("client"))}
                            >
                                Rafraîchir
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
                                    `${range[0]}-${range[1]} sur ${total} éléments`,
                            }}
                            size="middle"
                            
                            bordered
                            rowClassName={(record) => 
                                record.active ? 'table-row-active' : 'table-row-inactive'
                            }
                        />
                        
                        <Modal
                            title="Stores"
                            open={isModalStoreOpen}
                            onOk={handleOk}
                            onCancel={handleOk}
                            footer={[
                                <Button key="close" onClick={handleOk}>
                                    Close
                                </Button>,
                            ]}
                            width={900}
                            centered
                            destroyOnClose
                        >
                            {loadingStores ? (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <Spin size="large" />
                                </div>
                            ) : (
                                <>
                                    <Space style={{ marginBottom: 16 }}>
                                        <Button 
                                            type="primary" 
                                            icon={<FaPlus />} 
                                            onClick={() => openStoreForm(null)}
                                        >
                                            Add Store
                                        </Button>
                                    </Space>
                                    <Row gutter={[16, 16]}>
                                        {selectedStores && selectedStores.length > 0 ? (
                                            selectedStores.map(store => (
                                                <Col xs={24} sm={12} md={8} key={store._id}>
                                                    <Card
                                                        hoverable
                                                        actions={[
                                                            <Tooltip title="Edit Store" key="edit">
                                                                <Button 
                                                                    type="link" 
                                                                    icon={<FaPenFancy />} 
                                                                    onClick={() => openStoreForm(store)}
                                                                >
                                                                    Edit
                                                                </Button>
                                                            </Tooltip>,
                                                            <Tooltip title="Delete Store" key="delete">
                                                                <Button 
                                                                    type="link" 
                                                                    icon={<MdDelete />} 
                                                                    danger 
                                                                    onClick={() => dispatch(deleteStore(store._id))}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </Tooltip>,
                                                        ]}
                                                    >
                                                        <Card.Meta 
                                                            title={store.storeName}
                                                            description={
                                                                <Descriptions size="small" column={1} bordered>
                                                                    <Descriptions.Item label="Image">
                                                                        <Avatar
                                                                            src={store.image.url}
                                                                            size='large'
                                                                        />
                                                                    </Descriptions.Item>
                                                                    <Descriptions.Item label="Téléphone">
                                                                        <Space>
                                                                            <PhoneOutlined />
                                                                            {store.tele || 'N/A'}
                                                                        </Space>
                                                                    </Descriptions.Item>
                                                                    <Descriptions.Item label="Solde">
                                                                        <Space>
                                                                            <DollarCircleOutlined />
                                                                            {store.solde} DH
                                                                        </Space>
                                                                    </Descriptions.Item>
                                                                    <Descriptions.Item label="Adresse">
                                                                        <Space>
                                                                            <EnvironmentOutlined />
                                                                            {store.adress || 'N/A'}
                                                                        </Space>
                                                                    </Descriptions.Item>
                                                                    <Descriptions.Item label="Auto D-R">
                                                                        <Switch 
                                                                            checked={store.auto_DR}
                                                                            onChange={() => handleToggleAutoDR(store._id)}
                                                                            checkedChildren="Oui" 
                                                                            unCheckedChildren="Non"
                                                                        />
                                                                    </Descriptions.Item>
                                                                </Descriptions>
                                                            }
                                                        />
                                                    </Card>
                                                </Col>
                                            ))
                                        ) : (
                                            <Col span={24}>
                                                <Typography.Text type="secondary">Aucun magasin trouvé pour ce client.</Typography.Text>
                                            </Col>
                                        )}
                                    </Row>
                                </>
                            )}
                        </Modal>

                        <Drawer
                            title={storeToEdit ? "Edit Store" : "Add Store"}
                            placement="right"
                            onClose={closeStoreForm}
                            visible={isStoreFormVisible}
                            width={500}
                            destroyOnClose
                        >
                            <StoreForm 
                                onClose={closeStoreForm} 
                                initialValues={storeToEdit} 
                                isEdit={Boolean(storeToEdit)} 
                            />
                        </Drawer>

                        <Drawer
                            title={currentClient ? "Edit Client" : "Add Client"}
                            placement="right"
                            onClose={closeDrawer}
                            open={drawerVisible}
                            width={500}
                            destroyOnClose
                        >
                            <ClientFormAdd client={currentClient} close={closeDrawer} />
                        </Drawer>

                        <Modal
                            title={selectedClient ? `Documents de ${selectedClient.nom} ${selectedClient.prenom}` : "Documents"}
                            visible={isDocumentsModalVisible}
                            onCancel={closeDocumentsModal}
                            footer={[
                                <Button key="close" onClick={closeDocumentsModal}>
                                    Fermer
                                </Button>,
                            ]}
                            width={800}
                        >
                            {loadingDocs ? (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <Spin size="large" />
                                </div>
                            ) : errorDocs ? (
                                <Typography.Text type="danger">{errorDocs}</Typography.Text>
                            ) : files.length > 0 ? (
                                <Row gutter={[16, 16]}>
                                    {files.map((doc) => (
                                        <Col xs={24} sm={12} md={8} key={doc.id}>
                                            <Card
                                                hoverable
                                                cover={<Image alt={`CIN Recto ${doc.id}`} src={doc.cinRecto.url} />}
                                            >
                                                <Card.Meta
                                                    title={`${doc.type}`}
                                                    description={
                                                        <div>
                                                            <p>Recto: <a href={doc.cinRecto.url} target="_blank" rel="noopener noreferrer">Voir</a></p>
                                                            <p>Verso: <a href={doc.cinVerso.url} target="_blank" rel="noopener noreferrer">Voir</a></p>
                                                        </div>
                                                    }
                                                />
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            ) : (
                                <Typography.Text type="secondary">Aucun document trouvé pour ce client.</Typography.Text>
                            )}
                        </Modal>

                         <Modal
                title="Reset User Password"
                visible={isPasswordModalVisible}
                onCancel={handleCancel}
                footer={null}
                centered
                destroyOnClose
            >
                <Form
                    form={form}
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

            <Modal
                title="Wallet Information"
                open={isWalletModalVisible}
                onCancel={() => setIsWalletModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsWalletModalVisible(false)}>
                        Close
                    </Button>
                ]}
            >
                {loadingWallet ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <div>
                        {selectedWallet ? (
                            <Descriptions bordered column={1}>
                                <Descriptions.Item label="Wallet Key">
                                    <Tag color="green">
                                        <Typography.Text copyable style={{ color: 'inherit' }}>
                                            {selectedWallet.key}
                                        </Typography.Text>
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Balance">
                                    <Tag color="blue" style={{ fontSize: '16px' }}>
                                        {selectedWallet.solde} DH
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Status">
                                    <Space>
                                        <Tag color={selectedWallet.active ? "green" : "red"}>
                                            {selectedWallet.active ? "Active" : "Inactive"}
                                        </Tag>
                                        <Switch
                                            checked={selectedWallet.active}
                                            onChange={() => handleToggleWallet(selectedWallet._id, selectedWallet.active)}
                                            loading={walletLoading}
                                            checkedChildren="Active"
                                            unCheckedChildren="Inactive"
                                            style={{
                                                backgroundColor: selectedWallet.active ? '#52c41a' : '#ff4d4f',
                                            }}
                                        />
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="Created At">
                                    {new Date(selectedWallet.createdAt).toLocaleString()}
                                </Descriptions.Item>
                            </Descriptions>
                        ) : (
                            <Empty description="No wallet information available" />
                        )}
                    </div>
                )}
            </Modal>
                    </div>
                </div>
            </main>
        </div>
    );
}

const styles = `
  .table-row-active {
    background-color: rgba(82, 196, 26, 0.1);
  }

  .table-row-inactive {
    background-color: rgba(255, 77, 79, 0.1);
  }

  .ant-avatar:hover {
    transform: scale(1.1);
  }

  .ant-tag {
    cursor: default;
    transition: all 0.3s;
  }

  .ant-tag:hover {
    transform: scale(1.05);
  }

  @media (max-width: 576px) {
    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      font-size: 12px;
    }
  }
`;

const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default Client;
