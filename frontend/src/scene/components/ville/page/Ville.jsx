import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import '../ville.css';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { Button, Drawer, Table, message, Modal, Tag, Input } from 'antd';
import { FaInfoCircle, FaPenFancy, FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import VilleForm from '../components/VilleForm';
import { getAllVilles, ajoutVille, updateVille, deleteVille } from '../../../../redux/apiCalls/villeApiCalls'; // Import API functions
import { useDispatch, useSelector } from 'react-redux';
import { getAllRegions } from '../../../../redux/apiCalls/regionApiCalls';

// **Import debounce from lodash (optional for debouncing)**
import { debounce } from 'lodash';

function Ville() {
    const { theme } = useContext(ThemeContext);
    const [villeDrawer, setVilleDrawer] = useState(false);
    const [selectedVille, setSelectedVille] = useState(null);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    
    // **Add search state**
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredVilles, setFilteredVilles] = useState([]);

    const { villes } = useSelector(state => ({
        villes: state.ville.villes
    }));
    const { regions } = useSelector(state => ({
        regions: state.region?.regions || []
    }));

    // Fetch villes data
    useEffect(() => {
        loadVilles();
        dispatch(getAllRegions());
    }, []);

    const loadVilles = async () => {
        setLoading(true);
        try {
            await dispatch(getAllVilles());
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
            await dispatch(updateVille(selectedVille._id, villeData));
            message.success("Ville updated successfully");
        } else {
            // Add new ville
            await dispatch(ajoutVille(villeData));
            message.success("Ville added successfully");
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
                try {
                    await dispatch(deleteVille(id));
                    message.success("Ville deleted successfully");
                    loadVilles();
                } catch (error) {
                    message.error("Failed to delete ville");
                }
            },
        });
    };

    // **Implement search functionality**
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredVilles(villes);
        } else {
            const lowerCaseQuery = searchQuery.toLowerCase();
            const filtered = villes.filter(ville => {
                // Customize the fields you want to search through
                return (
                    (ville.ref && ville.ref.toLowerCase().includes(lowerCaseQuery)) ||
                    (ville.nom && ville.nom.toLowerCase().includes(lowerCaseQuery)) ||
                    (ville.tarif && ville.tarif.toString().includes(lowerCaseQuery)) ||
                    (ville.tarif_refus && ville.tarif_refus.toString().includes(lowerCaseQuery)) ||
                    (ville.disponibility && ville.disponibility.some(day => day.toLowerCase().includes(lowerCaseQuery)))
                );
            });
            setFilteredVilles(filtered);
        }
    }, [searchQuery, villes]);

    // **Optional: Debounce the search input to improve performance**
    // const handleSearch = debounce((value) => {
    //     setSearchQuery(value);
    // }, 300); // 300ms delay

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
            render: (text) => `${text} DH`, // Format tarif with currency
        },
        {
            title: 'Tarif Refus',
            dataIndex: 'tarif_refus',
            key: 'tarif_refus',
            render: (text) => `${text} DH`, // Format tarif_refus with currency
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
            title: 'Région',
            dataIndex: 'region',
            key: 'region',
            render: (region) => region ? (region.nom || '-') : '-',
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
                        <div className='ville_header' style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
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
                            
                            {/* **Add Search Input Here** */}
                            <Input
                                placeholder="Rechercher des villes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                allowClear
                                style={{ width: '300px' }}
                            />
                            {/* If using debounce, replace onChange with handleSearch */}
                            {/* 
                            <Input
                                placeholder="Rechercher des villes..."
                                onChange={(e) => handleSearch(e.target.value)}
                                allowClear
                                style={{ width: '300px' }}
                            />
                            */}
                        </div>
                        
                        <Table
                            dataSource={filteredVilles}
                            columns={columns}
                            rowKey="_id"
                            loading={loading}
                            pagination={{ pageSize: 10 }} // Optional: Add pagination
                        />
                        <Drawer
                            title={selectedVille ? "Modifier Ville et Tarif" : "Ajouter Ville et Tarif"}
                            open={villeDrawer}
                            onClose={() => setVilleDrawer(false)}
                            width={400} // Optional: Adjust drawer width
                        >
                            <VilleForm
                                theme={theme}
                                onSubmit={handleFormSubmit}
                                initialValues={selectedVille} // Pass initial values for editing
                                regions={regions}
                            />
                        </Drawer>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Ville;
