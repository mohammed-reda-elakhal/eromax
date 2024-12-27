import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import TableDashboard from '../../../global/TableDashboard';
import { FaPenFancy, FaPlus } from "react-icons/fa";
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
    Input // Import Input from antd if you prefer
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

    const toggleActiveCompte = (id) => {
        dispatch(toggleActiveClient(id));
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

    const columns = [
        {
            title: 'Profile',
            dataIndex: 'profile',
            render: (text, record) => (
                <Tooltip title={record.verify ? "Compte vérifié" : "Compte non vérifié"}>
                    <Avatar 
                        src={record.profile?.url || '/image/user.png'} 
                        className='profile_image_user' 
                        style={{
                            border: `2px solid ${record.verify ? 'green' : 'red'}`,
                            boxSizing: 'border-box',
                        }}
                    />
                </Tooltip>
            ),
        },
        {
            title: 'Register Date',
            dataIndex: 'createdAt',
            render: (text, record) => (
                <>{formatDate(record.createdAt)}</>
            ),
        },
        {
            title: 'Nom Complet',
            dataIndex: 'nom',
            ...search('nom'),
            render: (text, record) => (
                <span>{record.nom} {record.prenom}</span>
            ),
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            ...search('username'),
        },
        {
            title: 'N° Store',
            dataIndex: 'stores',
            render: (text, record) => (
                <Tag 
                    color='green' 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => openStoresModal(record._id)}
                >
                    {(record.stores && record.stores.length) || 0} Store{(record.stores && record.stores.length > 1) ? 's' : ''}
                </Tag>
            )
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            ...search('email'),
        },
        {
            title: 'Téléphone',
            dataIndex: 'tele',
            key: 'tele',
            ...search('tele'),
        },
        {
            title: 'Ville',
            dataIndex: 'ville',
            key: 'ville',
            ...search('ville'),
        },
        {
            title: 'Adresse',
            dataIndex: 'adresse',
            key: 'adresse',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
        },
        {
            title: 'Autre',
            render: (text, record) => (
                <>
                    <span>Debut en : <strong>{record.start_date}</strong> </span> <br />
                    <span>Envoyer : <strong>{record.number_colis} colis</strong> </span> 
                </>
            ),
        },
        {
            title: 'Activation de compte',
            dataIndex: 'active',
            key: 'active',
            render: (active, record) => (
                <Button
                    type={active ? 'primary' : 'danger'}
                    onClick={() => toggleActiveCompte(record._id)}
                    style={{
                        backgroundColor: active ? '#28a745' : '#dc3545',
                        borderColor: active ? '#28a745' : '#dc3545',
                        color: '#fff',
                        borderRadius: '20px',
                        padding: '6px 12px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {active ? (
                            <i className="fas fa-lock-open mr-2"></i>
                        ) : (
                            <i className="fas fa-lock mr-2"></i>
                        )}
                        {active ? 'Désactiver' : 'Activer'}
                    </div>
                </Button>
            )
        },
        {
            title: 'Action',
            dataIndex: 'action',
            render: (text, record) => (
                <div className='action_user'>
                    <Tooltip title="Voir Documents" key="docs">
                        <Button 
                            type="link" 
                            style={{ color: '#0080ff', borderColor: "#0080ff", background: "transparent", marginRight: '8px' }} 
                            icon={<IoDocumentAttach size={20} />}
                            onClick={() => openDocumentsModal(record)}
                        />
                    </Tooltip>
                    {!record.verify && (
                        <Tooltip title="Vérifier le client" key="verify">
                            <Button 
                                type="link" 
                                style={{ color: 'green', borderColor: "green", background: "transparent", marginRight: '8px' }} 
                                icon={<GoVerified size={20} />}
                                onClick={() => handleVerifyClient(record._id)}
                            />
                        </Tooltip>
                    )}
                    
                    <Tooltip title="Edit Client" key="editClient">
                        <Button 
                            type="link" 
                            style={{ color: 'var(--limon)', borderColor: "var(--limon)", background: "transparent", marginRight: '8px' }} 
                            icon={<FaPenFancy size={20} />}
                            onClick={() => navigate(`/dashboard/compte/client/${record._id}`, { state: { from: '/dashboard/compte/client' } })}
                        />
                    </Tooltip>
                    <Tooltip title="Delete Client" key="deleteClient">
                        <Button 
                            type="link" 
                            style={{ color: 'red', borderColor: "red", background: "transparent" }} 
                            icon={<MdDelete size={20} />}
                            onClick={() => handleDeleteProfile(record._id)}
                        />
                    </Tooltip>
                </div>
            )
        }
    ];

    // Filter the profileList based on the searchTerm
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
                            >
                                Add Client
                            </Button>
                        {/* Add your search input here */}
                        <div className='ville_header'  style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <Input
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 200 }}
                            />
                            <Button
                                type="primary"
                                icon={<ReloadOutlined />}
                                onClick={() => dispatch(getProfileList("client"))}
                            >
                                Rafraîchir
                            </Button>
                            
                        </div>
                        
                        <TableDashboard theme={theme} column={columns} id="_id" data={filteredData} />
                        
                        {/* Stores Modal */}
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

                        {/* Store Form Drawer */}
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

                        {/* Client Form Drawer */}
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

                        {/* Documents Modal */}
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
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Client;
