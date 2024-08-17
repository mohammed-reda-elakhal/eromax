import React, { useEffect, useState } from 'react';
import TableDashboard from '../../../global/TableDashboard';
import livreurData from '../../../../data/livreur.json';
import { FaPenFancy , FaInfoCircle , FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Button, Drawer, Modal } from 'antd';
import LivreurForm from './LivreurForm';

function Livreur({theme}) {
    const [data, setData] = useState([]);
    const [formLivreur , setFormLivreur] = useState(false);
    const [selectedLivreur, setSelectedLivreur] = useState(null);
    const [infoLivreur, setInfoLivreur] = useState(null);

    useEffect(() => {
        setData(livreurData);
    }, []);

    const handleCreate = () => {
        setSelectedLivreur(null);
        setFormLivreur(true);
    };

    const handleEdit = (record) => {
        setSelectedLivreur(record);
        setFormLivreur(true);
    };

    const handleInfo = (record) => {
        setInfoLivreur(record);
    };

    const handleSubmit = (values) => {
        if (selectedLivreur) {
            // Update logic here
            setData(prevData => prevData.map(item => item.id === selectedLivreur.id ? {...item, ...values} : item));
        } else {
            // Create logic here
            const newLivreur = { ...values, id: data.length + 1 };
            setData([...data, newLivreur]);
        }
        setFormLivreur(false);
    };


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
            title: 'Region',
            dataIndex: 'region',
            key: 'region',
            render: (region) => (
                <ul>
                    {region.map((city, index) => (
                        <li key={index}>{city}</li>
                    ))}
                </ul>
            ),
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
            render : (text , record)=>(
                <div className='action_user'>
                    <Button onClick={() => handleEdit(record)} style={{color: 'var(--limon)' , borderColor:"var(--limon)" }} icon={<FaPenFancy size={20} />}></Button>
                    <Button style={{color: 'red' , borderColor:"red" }} icon={<MdDelete size={20} />}></Button>
                    <Button onClick={() => handleInfo(record)} style={{color: 'blue' , borderColor:"blue"}} icon={<FaInfoCircle size={20} />}></Button>
                </div>
            )
        },
    ];


  return (
    <div>
        <Button icon={<FaPlus/>} onClick={handleCreate} type='primary'>Create Livreur</Button>
        <TableDashboard theme={theme} column={columns} id="id" data={data} />
        <Drawer
            title={selectedLivreur ? 'Update Livreur' : 'Create Livreur'}
            open={formLivreur}
            onClose={()=>setFormLivreur(false)}
        >
            <LivreurForm 
                initialValues={selectedLivreur} 
                onClose={() => setFormLivreur(false)} 
                onSubmit={handleSubmit}
                formLivreur = {formLivreur}
            />
        </Drawer>
        <Modal
                title="Informations sur le Livreur"
                open={infoLivreur !== null}
                onCancel={() => setInfoLivreur(null)}
                footer={null}
            >
                {infoLivreur && (
                    <div>
                        <p><strong>Nom:</strong> {infoLivreur.nom}</p>
                        <p><strong>Prénom:</strong> {infoLivreur.prenom}</p>
                        <p><strong>Username:</strong> {infoLivreur.username}</p>
                        <p><strong>Email:</strong> {infoLivreur.email}</p>
                        <p><strong>Téléphone:</strong> {infoLivreur.tele}</p>
                        <p><strong>Ville:</strong> {infoLivreur.ville}</p>
                        <p><strong>Adresse:</strong> {infoLivreur.adress}</p>
                        <p><strong>Régions:</strong> {infoLivreur.region.join(', ')}</p>
                        <p><strong>Rôle:</strong> {infoLivreur.role}</p>
                        <p><strong>Activation de compte:</strong> {infoLivreur.active_acount ? 'Activée' : 'Non Activée'}</p>
                    </div>
                )}
            </Modal>
    </div>
  )
}

export default Livreur