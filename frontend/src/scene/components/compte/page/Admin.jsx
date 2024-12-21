// Admin.jsx

import React, { useContext, useEffect, useState, useMemo } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import TableDashboard from '../../../global/TableDashboard';
import { FaPenFancy, FaInfoCircle, FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Avatar, Button, Modal, Drawer, Input } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { deleteProfile, getProfileList } from '../../../../redux/apiCalls/profileApiCalls';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../../global/Topbar';
import Menubar from '../../../global/Menubar';
import AdminFormAdd from '../components/AdminFormAdd';
import { ReloadOutlined } from '@ant-design/icons'; // Import the refresh icon

function Admin() {
    const { theme } = useContext(ThemeContext);
    const [drawerVisible, setDrawerVisible] = useState(false); // For Drawer visibility
    const [searchQuery, setSearchQuery] = useState(''); // State for search query

    const navigate = useNavigate();

    const dispatch = useDispatch();
    const { profileList, user } = useSelector((state) => ({
        profileList: state.profile.profileList,
        user: state.auth.user
    }));

    useEffect(() => {
        if (user) {
            dispatch(getProfileList("admin"));
        }
        window.scrollTo(0, 0);
    }, [dispatch, user]);

    const openDrawer = () => {
        setDrawerVisible(true);
    };

    const closeDrawer = () => {
        setDrawerVisible(false);
    };

    const handleDeleteProfile = (id) => {
        dispatch(deleteProfile("admin", id));
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
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: 'Permission',
            dataIndex: 'permission',
            key: 'permission',
        },
        {
            title: 'Action',
            dataIndex: 'action',
            render: (text, record) => (
                <div className='action_user'>
                    <Button 
                        style={{ color: 'var(--limon)', borderColor: "var(--limon)" , background:"transparent" }} 
                        icon={<FaPenFancy size={20} />}
                        onClick={() => navigate(`/dashboard/compte/admin/${record._id}`, { state: { from: '/dashboard/compte/admin' } })}
                    />
                    <Button 
                        style={{ color: 'red', borderColor: "red" , background:"transparent"  }} 
                        icon={<MdDelete size={20} />}
                        onClick={() => handleDeleteProfile(record._id)}
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
            const permission = profile.permission.toLowerCase();

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
                        <h4>Gestion des utilisateurs ( admin )</h4>
                        <Button 
                            type="primary" 
                            icon={<FaPlus />} 
                            style={{ marginBottom: 16 }} 
                            onClick={() => openDrawer(null)}
                        >
                            Ajouter Team
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
                            <AdminFormAdd close={closeDrawer}/>
                        </Drawer>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Admin;
