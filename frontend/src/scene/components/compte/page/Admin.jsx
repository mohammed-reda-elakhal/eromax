import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import TableDashboard from '../../../global/TableDashboard';
import { FaPenFancy, FaInfoCircle, FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Avatar, Button, Modal, Drawer } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { deleteProfile, getProfileList } from '../../../../redux/apiCalls/profileApiCalls';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import Menubar from '../../../global/Menubar';
import TeamFormAdd from '../components/TeamFormAdd';
import AdminFormAdd from '../components/AdminFormAdd';

function Admin() {
    const { theme } = useContext(ThemeContext);
    const [drawerVisible, setDrawerVisible] = useState(false); // For Drawer visibility
    const navigate = useNavigate()

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


    const openDrawer = (client) => {
        setDrawerVisible(true);
    };

    const closeDrawer = () => {
        setDrawerVisible(false);
    };

    const handleDeleteProfile = (id) =>{
        dispatch(deleteProfile("admin" , id))
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
            title: 'Action',
            dataIndex: 'action',
            render: (text, record) => (
                <div className='action_user'>
                    <Button 
                        style={{ color: 'var(--limon)', borderColor: "var(--limon)" , background:"transparent" }} 
                        icon={<FaPenFancy size={20} />}
                        onClick={() => navigate(`/dashboard/compte/admin/${record._id}` ,  { state: { from: '/dashboard/compte/admin' } })}
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
                            onClick={() => openDrawer(null)}
                        >
                            Ajouter Team
                        </Button>
                        <TableDashboard theme={theme} column={columns} id="_id" data={profileList} />
                        <Drawer
                            title={"Ajouter Livreur"}
                            placement="right"
                            onClose={closeDrawer}
                            open={drawerVisible}
                            width={400}
                        >
                            <AdminFormAdd  close={closeDrawer}/>
                        </Drawer>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Admin;
