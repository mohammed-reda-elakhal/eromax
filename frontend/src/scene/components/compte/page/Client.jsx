import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import TableDashboard from '../../../global/TableDashboard';
import { FaPenFancy, FaInfoCircle, FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Avatar, Button, Modal, Drawer } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { deleteProfile, getProfileList } from '../../../../redux/apiCalls/profileApiCalls';
import { useNavigate } from 'react-router-dom';
import ClientFormAdd from '../components/ClientFormAdd';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import Menubar from '../../../global/Menubar';

function Client() {
    const { theme } = useContext(ThemeContext);

    const [isModalStoreOpen, setIsModalStoreOpen] = useState(false);
    const [selectedStores, setSelectedStores] = useState([]);
    const [data, setData ] = useState([]);
    const [drawerVisible, setDrawerVisible] = useState(false); // For Drawer visibility
    const [currentClient, setCurrentClient] = useState(null); // Current client being edited or added
    const navigate = useNavigate()

    const dispatch = useDispatch();
    const user = JSON.parse(localStorage.getItem('user'));
    const { profileList } = useSelector((state) => state.profile); // Get the profile list from Redux

    useEffect(() => {
        if (user) {
            dispatch(getProfileList("client"));
        }
        window.scrollTo(0, 0);
    }, [dispatch, user]);

    const showModal = () => {
        setIsModalStoreOpen(true);
    };

    const selectStores = (store) => {
        setSelectedStores(store);
        showModal();
    };

    const handleOk = () => {
        setIsModalStoreOpen(false);
    };

    const openDrawer = (client) => {
        setCurrentClient(client || {}); // If no client is passed, assume it's an 'Add' operation
        setDrawerVisible(true);
    };

    const closeDrawer = () => {
        setDrawerVisible(false);
        setCurrentClient(null);
    };

    const handleDeleteProfile = (id) =>{
        dispatch(deleteProfile("client" , id))
    }

    // Define table columns
    const columns = [
        {
            title: 'Profile',
            dataIndex: 'profile',
            render: (text, record) => (
                <Avatar src={record.profile.url || '/image/user.png'} className='profile_image_user' />
            ),
        },
        {
            title: 'Nom Complet',
            dataIndex: 'nom',
            render: (text, record) => (
                <span>{record.nom} {record.prenom}</span>
            ),
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
        },{
            title: 'Store',
            dataIndex: 'store',
            render: (text, record) => (
                <p>{(record.stores && record.stores.length) || 0} Store{(record.stores && record.stores.length > 1) ? 's' : ''}</p>
            )
        },        
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Téléphone',
            dataIndex: 'tele',
            key: 'tele',
        },
        {
            title: 'Ville',
            dataIndex: 'ville',
            key: 'ville',
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
            render: (active) => (
                <span style={{
                    backgroundColor: active ? 'green' : 'red',
                    color: 'white',
                    padding: '5px',
                    borderRadius: '3px',
                    display: 'inline-block',
                    whiteSpace: 'pre-wrap',
                    textAlign: 'center'
                }}>
                    {active ? 'Activée' : 'Non Activée'}
                </span>
            ),
        },
        {
            title: 'Action',
            dataIndex: 'action',
            render: (text, record) => (
                <div className='action_user'>
                    <Button 
                        style={{ color: 'var(--limon)', borderColor: "var(--limon)" , background:"transparent" }} 
                        icon={<FaPenFancy size={20} />}
                        onClick={() => navigate(`/dashboard/compte/client/${record._id}` ,  { state: { from: '/dashboard/compte/client' } })}
                    />
                    <Button 
                        style={{ color: 'red', borderColor: "red", background:"transparent"  }} 
                        icon={<MdDelete size={20} />}
                        onClick={()=>handleDeleteProfile(record._id)}
                    />
                    <Button 
                        style={{ color: 'blue', borderColor: "blue" , background:"transparent"  }} 
                        icon={<FaInfoCircle size={20} />}
                        // Add more info logic here
                    />
                </div>
            )
        }
        
    ];

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
                        <Modal title="Stores" open={isModalStoreOpen} onOk={handleOk} onCancel={handleOk}>
                            <div className="store_card">
                                {selectedStores.map((store) => (
                                    <ul key={store.id}>
                                        <Avatar size={50}>Store</Avatar>
                                        <h4>{store.nom}</h4>
                                        <p>Solde <span>{store.wallet?.solde} DH</span></p>
                                    </ul>
                                ))}
                            </div>
                        </Modal>
                        <Drawer
                            title={"Add Client"}
                            placement="right"
                            onClose={closeDrawer}
                            open={drawerVisible}
                            width={400}
                        >
                            <ClientFormAdd close={closeDrawer} />
                        </Drawer>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Client;
