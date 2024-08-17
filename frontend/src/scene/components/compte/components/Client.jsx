import React, { useEffect, useState } from 'react';
import TableDashboard from '../../../global/TableDashboard';
import clientData from '../../../../data/client.json';
import { FaPenFancy, FaInfoCircle , FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Avatar, Button, Modal, Drawer } from 'antd';
import ClientForm from './ClientForm'; // Import the ClientForm component

function Client({ theme }) {
    const [data, setData] = useState([]);
    const [isModalStoreOpen, setIsModalStoreOpen] = useState(false);
    const [selectedStores, setSelectedStores] = useState([]);
    const [drawerVisible, setDrawerVisible] = useState(false); // For Drawer visibility
    const [currentClient, setCurrentClient] = useState(null); // Current client being edited or added

    const showModal = () => {
        setIsModalStoreOpen(true);
    };
    
    const selectStores = (store) => {
        setSelectedStores(store);
        showModal();
    }

    const handleOk = () => {
        setIsModalStoreOpen(false);
    };

    const openDrawer = (client) => {
        setCurrentClient(client || {}); // If no client is passed, assume it's an 'Add' operation
        console.log(client);
        
        setDrawerVisible(true);
    };

    const closeDrawer = () => {
        setDrawerVisible(false);
        setCurrentClient(null);
    };

    const handleFormSubmit = (client) => {
        if (currentClient && currentClient.id) {
            // Update existing client
            const updatedData = data.map(item => item.id === client.id ? client : item);
            setData(updatedData);
        } else {
            // Add new client
            setData([...data, { ...client, id: data.length + 1 }]); // Assuming id is auto-incremented
        }
        closeDrawer();
    };

    useEffect(() => {
        setData(clientData);
    }, []);
    const columns = [
        {
            title: 'Profile',
            dataIndex: 'profile',
            render: (text, record) => (
                <img src="/image/user.png" className='profile_image_user' alt="" />
            ),
        },
        {
            title: 'Nom et Prenom',
            dataIndex: 'nom',
            render: (text, record) => (
                <span>
                    <p>{record.nom} {record.prenom}</p>
                </span>
            ),
        },
        {
            title: 'Store',
            dataIndex: 'store',
            key: 'store',
            render: (store) => (
                <Button type='primary' onClick={() => selectStores(store)}>
                    {store.length} Stores
                </Button>
            ),
        },
        {
            title: 'Username',
            dataIndex: 'username',                                                  
            key: 'username',
        },
        {
            title: 'email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Téléphone',
            dataIndex: 'tele',
            key: 'tele',
        },
        {
            title: 'ville',
            dataIndex: 'ville',
            key: 'ville',
        },
        {
            title: 'adress',
            dataIndex: 'adress',
            key: 'adress',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
        },
        {
            title: 'Activation de compte',
            dataIndex: 'active_acount',
            key: 'active_acount',
            render: (text, record) => (
                <span style={{
                    backgroundColor: record.active_acount ? 'green' : 'red',
                    color: 'white',
                    padding: '5px',
                    borderRadius: '3px',
                    display: 'inline-block',
                    whiteSpace: 'pre-wrap',
                    textAlign: 'center'
                }}>
                    {record.active_acount ? 'Activée' : 'Non Activée'}
                </span>
            ),
        },
        {
            title: 'Action',
            dataIndex: 'action',
            render: (text, record) => (
                <div className='action_user'>
                    <Button 
                        style={{color: 'var(--limon)' , borderColor:"var(--limon)" }} 
                        icon={<FaPenFancy size={20} />}
                        onClick={() => openDrawer(record)}
                    ></Button>
                    <Button 
                        style={{color: 'red' , borderColor:"red" }} 
                        icon={<MdDelete size={20} />}
                        // Add delete logic here
                    ></Button>
                    <Button 
                        style={{color: 'blue' , borderColor:"blue   "}} 
                        icon={<FaInfoCircle size={20} />}
                        // Add more info logic here
                    ></Button>
                </div>
            )
        },
    ];

    return (
        <div>
            <Button 
                type="primary" 
                icon={FaPlus}
                style={{ marginBottom: 16 }} 
                onClick={() => openDrawer(null)}>
                Add Client
            </Button>
            <TableDashboard theme={theme} column={columns} id="id" data={data} />
            <Modal title="Stores" open={isModalStoreOpen} onOk={handleOk} onCancel={handleOk}>
                <div className="store_card">
                    {selectedStores.map((store) => (
                        <ul key={store.id}>                 
                            <Avatar size={50}>Store</Avatar>   
                            <h4>{store.nom}</h4>
                            <p>Solde <span>{store.wallet.solde} DH</span></p>
                        </ul>
                    ))}
                </div>
            </Modal>
            <Drawer
                title={currentClient && currentClient.id ? "Update Client" : "Add Client"}
                placement="right"
                onClose={closeDrawer}
                open={drawerVisible}
                width={400}
            >
                <ClientForm 
                    initialValues={currentClient} 
                    onSubmit={handleFormSubmit} 
                    onClose={closeDrawer} 
                />
            </Drawer>
        </div>
    );
}

export default Client;
