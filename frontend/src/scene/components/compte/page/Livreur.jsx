// Livreur.jsx

import React, { useContext, useEffect, useState, useMemo } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import TableDashboard from '../../../global/TableDashboard';
import { FaPenFancy, FaInfoCircle, FaPlus } from "react-icons/fa";
import { MdAttachMoney, MdDelete } from "react-icons/md";
import { Avatar, Button, Modal, Drawer, Input } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { deleteProfile, getProfileList } from '../../../../redux/apiCalls/profileApiCalls';
import { useNavigate } from 'react-router-dom';
import LivreurFormAdd from '../components/LivreurFormAdd';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import Menubar from '../../../global/Menubar';
import { ReloadOutlined } from '@ant-design/icons'; // Import the refresh icon

function Livreur() {
    const { theme } = useContext(ThemeContext);

    const [isModalStoreOpen, setIsModalStoreOpen] = useState(false);
    const [selectedStores, setSelectedStores] = useState([]);
    const [drawerVisible, setDrawerVisible] = useState(false); // For Drawer visibility
    const [currentClient, setCurrentClient] = useState(null); // Current client being edited or added
    const [searchQuery, setSearchQuery] = useState(''); // State for search query

    const navigate = useNavigate();

    const dispatch = useDispatch();
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

    const showModal = () => {
        setIsModalStoreOpen(true);
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
            title: 'Region', // Adding the list of cities
            dataIndex: 'villes',
            key: 'villes',
            render: (villes) => {
                if (!villes || villes.length === 0) return <span>Aucune ville</span>;
                
                const displayedVilles = villes.slice(0, 6); // Show only the first 6 cities
                const remainingCount = villes.length - displayedVilles.length;
        
                return (
                    <>
                        <p>
                            {displayedVilles.join(', ')}
                        </p>
                        <p style={{color:"red"}}>
                            {remainingCount > 0 ? `${remainingCount} Autres Villes` : ''}
                        </p>
                    </>
                );
            },
        },        
        {
            title: 'Tarif',
            dataIndex: 'tarif',
            key: 'tarif',
        },
        {
            title: 'Adresse',
            dataIndex: 'adresse',
            key: 'adresse',
        },
        {
            title: 'Type de Livreur', // Adding the type of livreur
            dataIndex: 'type',
            key: 'type',
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
                        icon={<MdAttachMoney size={20} />}
                        onClick={() => navigate(`/dashboard/tarif-livreur/${record._id}`)}
                    />
                    <Button 
                        style={{ color: 'var(--limon)', borderColor: "var(--limon)" , background:"transparent" }} 
                        icon={<FaPenFancy size={20} />}
                        onClick={() => navigate(`/dashboard/compte/livreur/${record._id}`, { state: { from: '/dashboard/compte/livreur' } })}
                    />
                    <Button 
                        style={{ color: 'red', borderColor: "red" , background:"transparent"  }} 
                        icon={<MdDelete size={20} />}
                        onClick={() => handleDeleteProfile(record._id)}
                    />
                </div>
            )
        }
    ];

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
            const permission = profile.permission ? profile.permission.toLowerCase() : ''; // Handle if permission exists

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
                        <h4>Gestion des utilisateurs ( livreur )</h4>
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

                        <TableDashboard 
                            theme={theme} 
                            column={columns} 
                            id="_id" 
                            data={filteredProfiles} 
                        />
                        <Drawer
                            title={"Ajouter Livreur"}
                            placement="right"
                            onClose={closeDrawer}
                            open={drawerVisible}
                            width={400}
                        >
                            <LivreurFormAdd close={closeDrawer}/>
                        </Drawer>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Livreur;
