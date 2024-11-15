import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import '../ville.css';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { Button, Drawer, Table, message, Modal , Tag } from 'antd';
import { FaInfoCircle, FaPenFancy, FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import VilleForm from '../components/VilleForm';
import { getAllVilles, ajoutVille, updateVille, deleteVille } from '../../../../redux/apiCalls/villeApiCalls'; // Import API functions
import { useDispatch , useSelector } from 'react-redux';

function Ville() {
    const { theme } = useContext(ThemeContext);
    const [villeDrawer, setVilleDrawer] = useState(false);
    const [selectedVille, setSelectedVille] = useState(null);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch()
    const { villes } = useSelector(state => ({
        villes: state.ville.villes
      }));

    // Fetch villes data
    useEffect(() => {
        loadVilles();
    }, []);

    const loadVilles = async () => {
        setLoading(true);
        try {
            dispatch(getAllVilles())
        } catch (error) {
            message.error("Failed to load villes");
        } finally {
            setLoading(false);
        }
    };

    // Handle form submit for add/update
    const handleFormSubmit = async (villeData) => {
        if (selectedVille) {
            // Update ville
            dispatch(updateVille(selectedVille._id, villeData))
        } else {
            // Add new ville
            dispatch(ajoutVille(villeData))
        }
        setVilleDrawer(false);
        setSelectedVille(null);
        loadVilles();
    };

    // Open drawer for editing a ville
    const handleEditVille = (ville) => {
        setSelectedVille(ville);
        setVilleDrawer(true);
    };

    // Delete a ville
    const handleDeleteVille = async (id) => {
        Modal.confirm({
            title: "Are you sure you want to delete this ville?",
            onOk: async () => {
                dispatch(deleteVille(id))
                message.success("Ville deleted successfully");
                loadVilles();
            },
        });
    };

    // Updated columns definition
const columns = [
    {
        title: 'Ref',
        dataIndex: 'ref',
        key: 'ref',
    },
    {
        title: 'Nom',
        dataIndex: 'nom',
        key: 'nom',
    },
    {
        title: 'Tarif',
        dataIndex: 'tarif',
        key: 'tarif',
    },
    {
        title: 'Tarif Refus',
        dataIndex: 'tarif_refus',
        key: 'tarif_refus',
    },
    {
        title: 'Disponibility',
        dataIndex: 'disponibility',
        key: 'disponibility',
        render: (days) => (
            <div>
                {days.map((day) => (
                    <Tag color="blue" key={day}>
                        {day}
                    </Tag>
                ))}
            </div>
        ),
    },
    {
        title: 'Action',
        dataIndex: 'action',
        key: 'action',
        render: (text, record) => (
            <div className="action_user">
                <Button
                    style={{ color: 'var(--limon)', borderColor: "var(--limon)" }}
                    icon={<FaPenFancy size={20} />}
                    onClick={() => handleEditVille(record)}
                />
                <Button
                    style={{ color: 'red', borderColor: "red" }}
                    icon={<MdDelete size={20} />}
                    onClick={() => handleDeleteVille(record._id)}
                />
            </div>
        )
    },
];

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
                        <Title nom="Ville et Tarif" />
                    </div>
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                        }}
                    >
                        <h4>Tarif</h4>
                        <Button
                            icon={<FaPlus />}
                            type="primary"
                            onClick={() => {
                                setVilleDrawer(true);
                                setSelectedVille(null);
                            }}
                        >
                            Ajouter Tarif
                        </Button>
                        <Table
                            dataSource={villes}
                            columns={columns}
                            rowKey="_id"
                            loading={loading}
                        />
                        <Drawer
                            title="Ville et Tarif"
                            open={villeDrawer}
                            onClose={() => setVilleDrawer(false)}
                        >
                            <VilleForm
                                theme={theme}
                                onSubmit={handleFormSubmit}
                                initialValues={selectedVille} // Pass initial values for editing
                            />
                        </Drawer>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Ville;
