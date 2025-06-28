import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import '../region.css';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import Title from '../../../global/Title';
import { Button, Drawer, Table, message, Modal, Input } from 'antd';
import { FaPenFancy, FaPlus } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { getAllRegions, ajoutRegion, updateRegion, deleteRegion } from '../../../../redux/apiCalls/regionApiCalls';
import { useDispatch, useSelector } from 'react-redux';

function Region() {
    const { theme } = useContext(ThemeContext);
    const [regionDrawer, setRegionDrawer] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredRegions, setFilteredRegions] = useState([]);
    const regionFormRef = React.useRef();
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        pageSizeOptions: [10, 20, 50, 100],
        showSizeChanger: true,
    });

    const { regions } = useSelector(state => ({
        regions: state.region.regions
    }));

    useEffect(() => {
        loadRegions();
    }, []);

    const loadRegions = async () => {
        setLoading(true);
        try {
            await dispatch(getAllRegions());
        } catch (error) {
            message.error('Failed to load regions');
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (regionData) => {
        if (selectedRegion) {
            await dispatch(updateRegion(selectedRegion._id, regionData));
            message.success('Region updated successfully');
        } else {
            await dispatch(ajoutRegion(regionData));
            message.success('Region added successfully');
        }
        setRegionDrawer(false);
        setSelectedRegion(null);
        if (regionFormRef.current) regionFormRef.current.resetForm();
        loadRegions();
    };

    const handleEditRegion = (region) => {
        setSelectedRegion(region);
        setRegionDrawer(true);
    };

    const handleDeleteRegion = async (id) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this region?',
            onOk: async () => {
                try {
                    await dispatch(deleteRegion(id));
                    message.success('Region deleted successfully');
                    loadRegions();
                } catch (error) {
                    message.error('Failed to delete region');
                }
            },
        });
    };

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredRegions(regions);
        } else {
            const lowerCaseQuery = searchQuery.toLowerCase();
            const filtered = regions.filter(region => {
                return (
                    (region.nom && region.nom.toLowerCase().includes(lowerCaseQuery)) ||
                    (region.key && region.key.toLowerCase().includes(lowerCaseQuery))
                );
            });
            setFilteredRegions(filtered);
        }
    }, [searchQuery, regions]);

    // Pagination change handler
    const handleTableChange = (pag) => {
        setPagination({
            ...pagination,
            current: pag.current,
            pageSize: pag.pageSize,
        });
    };

    // Calculate paginated data
    const paginatedData = filteredRegions.slice(
        (pagination.current - 1) * pagination.pageSize,
        pagination.current * pagination.pageSize
    );

    const columns = [
        {
            title: 'Nom',
            dataIndex: 'nom',
            key: 'nom',
        },
        {
            title: 'Key',
            dataIndex: 'key',
            key: 'key',
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (text, record) => (
                <div className="action_user">
                    <Button
                        style={{ color: 'var(--limon)', borderColor: 'var(--limon)' }}
                        icon={<FaPenFancy size={20} />}
                        onClick={() => handleEditRegion(record)}
                    />
                    <Button
                        style={{ color: 'red', borderColor: 'red' }}
                        icon={<MdDelete size={20} />}
                        onClick={() => handleDeleteRegion(record._id)}
                    />
                </div>
            ),
        },
    ];

    return (
        <div className={`page-dashboard ${theme === 'dark' ? 'dark' : 'light'}`}>
            <Menubar />
            <main className='page-main'>
                <Topbar />
                <div
                    className='page-content'
                    style={{
                        backgroundColor: theme === 'dark' ? '#002242' : 'var(--gray1)',
                        color: theme === 'dark' ? '#fff' : '#002242',
                    }}
                >
                    <div className='page-content-header'>
                        <Title nom='Régions' />
                    </div>
                    <div
                        className='content'
                        style={{ backgroundColor: theme === 'dark' ? '#001529' : '#fff' }}
                    >
                        <h4>Gestion des Régions</h4>
                        <div className='region_header' style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <Button
                                icon={<FaPlus />}
                                type='primary'
                                onClick={() => {
                                    setRegionDrawer(true);
                                    setSelectedRegion(null);
                                }}
                            >
                                Ajouter Région
                            </Button>
                            <Input
                                placeholder='Rechercher des régions...'
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                allowClear
                                style={{ width: '300px' }}
                            />
                        </div>
                        {/* Item count display */}
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>
                            Affichage {filteredRegions.length === 0 ? 0 : ((pagination.current - 1) * pagination.pageSize + 1)}
                            -{Math.min(pagination.current * pagination.pageSize, filteredRegions.length)}
                            &nbsp;sur&nbsp;{filteredRegions.length} régions
                        </div>
                        <Table
                            className="region-table"
                            dataSource={paginatedData}
                            columns={columns}
                            rowKey='_id'
                            loading={loading}
                            pagination={{
                                current: pagination.current,
                                pageSize: pagination.pageSize,
                                total: filteredRegions.length,
                                showSizeChanger: true,
                                pageSizeOptions: ['10', '20', '50', '100'],
                                showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} régions`,
                            }}
                            onChange={handleTableChange}
                        />
                        <Drawer
                            title={selectedRegion ? 'Modifier Région' : 'Ajouter Région'}
                            open={regionDrawer}
                            onClose={() => setRegionDrawer(false)}
                            width={400}
                        >
                            <RegionForm
                                ref={regionFormRef}
                                theme={theme}
                                onSubmit={handleFormSubmit}
                                initialValues={selectedRegion}
                            />
                        </Drawer>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Simple RegionForm component for Drawer
const RegionForm = React.forwardRef(function RegionForm({ theme, onSubmit, initialValues }, ref) {
    const [form, setForm] = useState({
        nom: initialValues?.nom || '',
        key: initialValues?.key || '',
    });

    useEffect(() => {
        setForm({
            nom: initialValues?.nom || '',
            key: initialValues?.key || '',
        });
    }, [initialValues]);

    React.useImperativeHandle(ref, () => ({
        resetForm: () => setForm({ nom: '', key: '' })
    }));

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
                <label>Nom</label>
                <Input
                    name='nom'
                    value={form.nom}
                    onChange={handleChange}
                    required
                />
            </div>
            <div style={{ marginBottom: 16 }}>
                <label>Key</label>
                <Input
                    name='key'
                    value={form.key}
                    onChange={handleChange}
                    required
                />
            </div>
            <Button type='primary' htmlType='submit' style={{ width: '100%' }}>
                {initialValues ? 'Modifier' : 'Ajouter'}
            </Button>
        </form>
    );
});

export default Region; 