import React, { useEffect, useState } from 'react';
import TableDashboard from '../../../global/TableDashboard';
import clientData from '../../../../data/client.json';
import { FaPenFancy, FaInfoCircle } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Avatar, Button, Modal } from 'antd';

function Client({ theme }) {
    const [data, setData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStores, setSelectedStores] = useState([]);

    const showModal = () => {
        setIsModalOpen(true);
    };
    const selectStores = (store)=>{
        setSelectedStores(store)
        showModal()
    }

    const handleOk = () => {
        setIsModalOpen(false);
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
                    <Button style={{color: 'var(--limon)' , borderColor:"var(--limon)" }} icon={<FaPenFancy size={20} />}></Button>
                    <Button style={{color: 'red' , borderColor:"red" }} icon={<MdDelete size={20} />}></Button>
                    <Button style={{color: 'blue' , borderColor:"blue   "}} icon={<FaInfoCircle size={20} />}></Button>
                </div>
            )
        },
    ];

    return (
        <div>
            <TableDashboard theme={theme} column={columns} id="id" data={data} />
            <Modal title="Stores" open={isModalOpen} onOk={handleOk} onCancel={handleOk}>
                <div className="store_card">
                {
                    selectedStores.map((store)=>(
                        <ul key={store.id}>                 
                            <Avatar size={50}>Store</Avatar>   
                            <h4>{store.nom}</h4>
                            <p>Solde <span>{store.wallet.solde} DH</span></p>
                        </ul>
                    ))
                }
                </div>
            </Modal>
        </div>
    );
}

export default Client;
