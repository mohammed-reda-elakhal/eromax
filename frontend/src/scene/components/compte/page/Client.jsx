// Client.js

import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import TableDashboard from '../../../global/TableDashboard';
import { FaPenFancy, FaInfoCircle, FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import {  Drawer } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { deleteProfile, getProfileList, toggleActiveClient } from '../../../../redux/apiCalls/profileApiCalls';
import { getStoreByUser } from '../../../../redux/apiCalls/storeApiCalls'; // Import the store API call
import { useNavigate } from 'react-router-dom';
import ClientFormAdd from '../components/ClientFormAdd';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import Menubar from '../../../global/Menubar';
import { Modal, Button, Spin, List, Card, Avatar, Row, Col, Typography } from 'antd';
import { EnvironmentOutlined, PhoneOutlined, DollarCircleOutlined } from '@ant-design/icons';
import StoreForm from '../../profile/components/StoreForm';


function Client({ search }) {
    const { theme } = useContext(ThemeContext);

    const [isModalStoreOpen, setIsModalStoreOpen] = useState(false);
    const [selectedStores, setSelectedStores] = useState([]);
    const [drawerVisible, setDrawerVisible] = useState(false); // For Drawer visibility
    const [currentClient, setCurrentClient] = useState(null); // Current client being edited or added
    const [loadingStores, setLoadingStores] = useState(false); // Loading state for stores
    const [isStoreFormVisible, setIsStoreFormVisible] = useState(false);
    const [storeToEdit, setStoreToEdit] = useState(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Select necessary state from Redux
    const { profileList, user } = useSelector((state) => ({
        profileList: state.profile.profileList,
        user: state.auth.user
    }));

    const { stores, loading, error } = useSelector((state) => ({
        stores: state.store.stores,
        loading: state.store.loading,
        error: state.store.error
    }));

    useEffect(() => {
        dispatch(getProfileList("client"));
        window.scrollTo(0, 0);
    }, [dispatch, user]);

    // Handle opening the modal and fetching stores
    const openStoresModal = async (client) => {
        setLoadingStores(true); // Start loading
        try {
            // Assuming client.userId holds the user ID associated with the client
            await dispatch(getStoreByUser(client.userId || client._id)); // Fetch stores
            // After fetching, set the stores in state
            setSelectedStores(stores); // Note: This may need to be adjusted based on asynchronous behavior
            setIsModalStoreOpen(true);
        } catch (err) {
            console.error("Failed to fetch stores:", err);
        } finally {
            setLoadingStores(false); // End loading
        }
    };

    // Alternatively, use useEffect to set selectedStores when stores change
    useEffect(() => {
        if (isModalStoreOpen) {
            setSelectedStores(stores);
        }
    }, [stores, isModalStoreOpen]);

    const toggleActiveCompte = (id)=>{
        dispatch(toggleActiveClient(id))
        dispatch(getProfileList("client"));
    }

    const handleOk = () => {
        setIsModalStoreOpen(false);
        setSelectedStores([]);
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
        dispatch(deleteProfile("client", id));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      };
    // Define table columns
    const columns = [
        {
            title: 'Profile',
            dataIndex: 'profile',
            render: (text, record) => (
                <Avatar src={record.profile?.url || '/image/user.png'} className='profile_image_user' />
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
            dataIndex: 'stores', // Adjusted to match the data structure
            render: (text, record) => (
                <Button onClick={()=>openStoresModal(record)}>{(record.stores && record.stores.length) || 0} Store{(record.stores && record.stores.length > 1) ? 's' : ''}</Button>
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
                    <Button 
                        style={{ color: 'var(--limon)', borderColor: "var(--limon)", background: "transparent" }} 
                        icon={<FaPenFancy size={20} />}
                        onClick={() => navigate(`/dashboard/compte/client/${record._id}`, { state: { from: '/dashboard/compte/client' } })}
                    />
                    <Button 
                        style={{ color: 'red', borderColor: "red", background: "transparent" }} 
                        icon={<MdDelete size={20} />}
                        onClick={() => handleDeleteProfile(record._id)}
                    />
                    <Button 
                        style={{ color: 'blue', borderColor: "blue", background: "transparent" }} 
                        icon={<FaInfoCircle size={20} />}
                        onClick={() => openStoresModal(record)}
                    />
                </div>
            )
        }
    ];

    // Client.js

const openStoreForm = (store) => {
    setStoreToEdit(store); // Set the store to edit, or null for adding
    setIsStoreFormVisible(true); // Open the StoreForm drawer
};

const closeStoreForm = () => {
    setIsStoreFormVisible(false); // Close the StoreForm drawer
    setStoreToEdit(null); // Reset the store to edit
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
                    <div className="page-content-header">
                        <Title nom='Gestion des utilisateurs' />
                    </div>
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                        }} 
                    >
                        <h4>Gestion des utilisateurs</h4>
                        <Button 
                            type="primary" 
                            icon={<FaPlus />} 
                            style={{ marginBottom: 16 }} 
                            onClick={() => openDrawer(null)}>
                            Add Client
                        </Button>
                        <TableDashboard theme={theme} column={columns} id="_id" data={profileList} />
                        
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
                            width={800}
                            centered
                        >
                            {loadingStores ? (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <Spin size="large" />
                                </div>
                            ) : (
                                <>
                                    <Button 
                                        type="primary" 
                                        icon={<FaPlus />} 
                                        style={{ marginBottom: 16 }} 
                                        onClick={() => openStoreForm(null)} // Open form for adding new store
                                    >
                                        Add Store
                                    </Button>
                                    <List
                                        grid={{
                                            gutter: 16,
                                            xs: 1,
                                            sm: 1,
                                            md: 2,
                                            lg: 2,
                                            xl: 3,
                                            xxl: 4,
                                        }}
                                        dataSource={selectedStores}
                                        locale={{ emptyText: "No stores found for this client." }}
                                        renderItem={store => (
                                            <List.Item>
                                                <Card
                                                    hoverable
                                                    style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
                                                    actions={[
                                                        <Button 
                                                            type="link" 
                                                            icon={<FaPenFancy />} 
                                                            onClick={() => openStoreForm(store)} // Open form for editing store
                                                        >
                                                            Edit
                                                        </Button>
                                                    ]}
                                                >
                                                    <Card.Meta
                                                        avatar={<Avatar src={store.image?.url || '/image/store.png'} size="large" />}
                                                        title={<Typography.Title level={4}>{store.storeName}</Typography.Title>}
                                                    />
                                                    <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                                                        <Col span={24}>
                                                            <Typography.Text strong>
                                                                <EnvironmentOutlined /> Adresse:
                                                            </Typography.Text>
                                                            <Typography.Text style={{ marginLeft: '8px' }}>
                                                                {store.adress}
                                                            </Typography.Text>
                                                        </Col>
                                                        <Col span={24}>
                                                            <Typography.Text strong>
                                                                <PhoneOutlined /> Téléphone:
                                                            </Typography.Text>
                                                            <Typography.Text style={{ marginLeft: '8px' }}>
                                                                {store.tele}
                                                            </Typography.Text>
                                                        </Col>
                                                        <Col span={24}>
                                                            <Typography.Text strong>
                                                                <DollarCircleOutlined /> Solde:
                                                            </Typography.Text>
                                                            <Typography.Text style={{ marginLeft: '8px' }}>
                                                                {store?.solde} DH
                                                            </Typography.Text>
                                                        </Col>
                                                        <Col span={24}>
                                                            <Typography.Text strong>
                                                                Adresse :
                                                            </Typography.Text>
                                                            <Typography.Text style={{ marginLeft: '8px' }}>
                                                                {store.adress}
                                                            </Typography.Text>
                                                        </Col>
                                                    </Row>
                                                </Card>
                                            </List.Item>
                                        )}
                                    />
                                </>
                            )}
                        </Modal>

                        <Drawer
                            title={storeToEdit ? "Edit Store" : "Add Store"}
                            placement="right"
                            onClose={closeStoreForm}
                            visible={isStoreFormVisible}
                            width={400}
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
                            width={400}
                        >
                            <ClientFormAdd client={currentClient} close={closeDrawer} />
                        </Drawer>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Client;
