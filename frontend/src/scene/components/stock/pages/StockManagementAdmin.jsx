import React, { useEffect, useState, useContext } from 'react';
import { Card, Tabs, Row, Col, Statistic, Table, Tag, Button, Space, Modal, Form, Input, InputNumber, Badge } from 'antd';
import CreateStockFormAdmin from '../components/CreateStockFormAdmin';
import { 
    InboxOutlined, 
    CheckCircleOutlined, 
    ClockCircleOutlined,
    WarningOutlined,
    PlusOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import { getAllStocksAdmin, adjustStockQuantity, getLowStockAlerts } from '../../../../redux/apiCalls/stockApiCalls';
import PendingStocksTable from '../components/PendingStocksTable';
import moment from 'moment';
import '../stock.css';

const { TextArea } = Input;

const StockManagementAdmin = () => {
    const { theme } = useContext(ThemeContext);
    const dispatch = useDispatch();
    const { allStocks, lowStockAlerts, loading } = useSelector(state => state.stock);
    const [adjustModal, setAdjustModal] = useState({ visible: false, stock: null });
    const [adjustForm] = Form.useForm();
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({ status: 'active' });

    useEffect(() => {
        loadAllStocks();
        loadAlerts();
    }, [page, filters]);

    const loadAllStocks = () => {
        dispatch(getAllStocksAdmin({ ...filters, page, limit: 20 }));
    };

    const loadAlerts = () => {
        dispatch(getLowStockAlerts());
    };

    const handleAdjustStock = (stock) => {
        setAdjustModal({ visible: true, stock });
        adjustForm.setFieldsValue({
            quantityChange: 0,
            reason: ''
        });
    };

    const submitAdjustment = async (values) => {
        try {
            await dispatch(adjustStockQuantity(adjustModal.stock._id, values));
            setAdjustModal({ visible: false, stock: null });
            adjustForm.resetFields();
            loadAllStocks();
        } catch (error) {
            console.error('Error adjusting stock:', error);
        }
    };

    // Calculate stats from allStocks.stats
    const stats = {
        total: allStocks.stats?.reduce((sum, s) => sum + s.count, 0) || 0,
        pending: allStocks.stats?.find(s => s._id === 'pending')?.count || 0,
        active: allStocks.stats?.find(s => s._id === 'active')?.count || 0,
        depleted: allStocks.stats?.find(s => s._id === 'depleted')?.count || 0
    };

    const allStocksColumns = [
        {
            title: 'Client',
            key: 'client',
            render: (_, record) => record.clientId?.nom + ' ' + record.clientId?.prenom
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            width: 150
        },
        {
            title: 'Produit',
            dataIndex: 'productName',
            key: 'productName'
        },
        {
            title: 'Dispo',
            dataIndex: 'quantite_disponible',
            key: 'disponible',
            width: 80,
            align: 'center'
        },
        {
            title: 'Réservé',
            dataIndex: 'quantite_reservee',
            key: 'reserve',
            width: 80,
            align: 'center'
        },
        {
            title: 'Utilisé',
            dataIndex: 'quantite_utilisee',
            key: 'utilise',
            width: 80,
            align: 'center'
        },
        {
            title: 'Statut',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status) => {
                const colors = {
                    pending: 'orange',
                    active: 'green',
                    depleted: 'red'
                };
                return <Tag color={colors[status]}>{status}</Tag>;
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button
                        size="small"
                        icon={<SettingOutlined />}
                        onClick={() => handleAdjustStock(record)}
                    >
                        Ajuster
                    </Button>
                </Space>
            )
        }
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
                    <div
                        className="content"
                        style={{
                            backgroundColor: theme === 'dark' ? '#001529' : '#fff',
                        }}
                    >
                        <h4 style={{ marginBottom: 16 }}>Gestion de Stock - Administration</h4>
                        
                        {/* Header Stats */}
                        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Stocks"
                            value={stats.total}
                            prefix={<InboxOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="En Attente"
                            value={stats.pending}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Actifs"
                            value={stats.active}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Alertes Stock Faible"
                            value={lowStockAlerts.summary?.lowStock || 0}
                            prefix={<WarningOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Main Content */}
            <Card>
                <Tabs 
                    defaultActiveKey="pending"
                    items={[
                        {
                            key: 'create',
                            label: (
                                <span>
                                    <PlusOutlined />
                                    Créer un Stock
                                </span>
                            ),
                            children: <CreateStockFormAdmin onSuccess={loadAllStocks} />
                        },
                        {
                            key: 'pending',
                            label: (
                                <span>
                                    <ClockCircleOutlined />
                                    En Attente d'Approbation
                                    {stats.pending > 0 && (
                                        <Badge count={stats.pending} style={{ marginLeft: 8 }} />
                                    )}
                                </span>
                            ),
                            children: <PendingStocksTable />
                        },
                        {
                            key: 'all',
                            label: (
                                <span>
                                    <InboxOutlined />
                                    Tous les Stocks
                                </span>
                            ),
                            children: (
                                <Table
                                    columns={allStocksColumns}
                                    dataSource={allStocks.data}
                                    rowKey="_id"
                                    loading={loading}
                                    scroll={{ x: 1200 }}
                                    pagination={{
                                        current: allStocks.pagination?.page || 1,
                                        total: allStocks.pagination?.total || 0,
                                        onChange: (page) => setPage(page),
                                        showTotal: (total) => `Total ${total} stocks`
                                    }}
                                />
                            )
                        },
                        {
                            key: 'alerts',
                            label: (
                                <span>
                                    <WarningOutlined />
                                    Alertes Stock Faible
                                    {(lowStockAlerts.summary?.total || 0) > 0 && (
                                        <Badge 
                                            count={lowStockAlerts.summary?.total} 
                                            style={{ marginLeft: 8, backgroundColor: '#ff4d4f' }} 
                                        />
                                    )}
                                </span>
                            ),
                            children: (
                                <Row gutter={16}>
                                    <Col span={24}>
                                        <h3>Rupture de Stock ({lowStockAlerts.summary?.outOfStock || 0})</h3>
                                        <Table
                                            dataSource={lowStockAlerts.outOfStock}
                                            rowKey="_id"
                                            size="small"
                                            columns={[
                                                { title: 'SKU', dataIndex: 'sku', key: 'sku' },
                                                { title: 'Produit', dataIndex: 'productName', key: 'productName' },
                                                { 
                                                    title: 'Client', 
                                                    key: 'client',
                                                    render: (_, record) => record.clientId?.nom + ' ' + record.clientId?.prenom
                                                },
                                                {
                                                    title: 'Actions',
                                                    key: 'actions',
                                                    render: (_, record) => (
                                                        <Button size="small" onClick={() => handleAdjustStock(record)}>
                                                            Réapprovisionner
                                                        </Button>
                                                    )
                                                }
                                            ]}
                                        />
                                    </Col>
                                    
                                    <Col span={24} style={{ marginTop: 24 }}>
                                        <h3>Stock Faible ({lowStockAlerts.summary?.lowStock || 0})</h3>
                                        <Table
                                            dataSource={lowStockAlerts.lowStock}
                                            rowKey="_id"
                                            size="small"
                                            columns={[
                                                { title: 'SKU', dataIndex: 'sku', key: 'sku' },
                                                { title: 'Produit', dataIndex: 'productName', key: 'productName' },
                                                { 
                                                    title: 'Disponible', 
                                                    dataIndex: 'quantite_disponible',
                                                    key: 'disponible',
                                                    render: (qty) => <Tag color="orange">{qty}</Tag>
                                                },
                                                { 
                                                    title: 'Minimum', 
                                                    dataIndex: 'quantite_minimum',
                                                    key: 'minimum'
                                                },
                                                {
                                                    title: 'Actions',
                                                    key: 'actions',
                                                    render: (_, record) => (
                                                        <Button size="small" onClick={() => handleAdjustStock(record)}>
                                                            Réapprovisionner
                                                        </Button>
                                                    )
                                                }
                                            ]}
                                        />
                                    </Col>
                                </Row>
                            )
                        }
                    ]}
                />
            </Card>

            {/* Adjust Stock Modal */}
            <Modal
                title={`Ajuster le Stock: ${adjustModal.stock?.sku}`}
                open={adjustModal.visible}
                onCancel={() => {
                    setAdjustModal({ visible: false, stock: null });
                    adjustForm.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={adjustForm}
                    layout="vertical"
                    onFinish={submitAdjustment}
                >
                    <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 8, marginBottom: 16 }}>
                        <strong>Stock Actuel:</strong> {adjustModal.stock?.quantite_disponible} unités disponibles
                    </div>

                    <Form.Item
                        label="Ajustement de Quantité"
                        name="quantityChange"
                        rules={[{ required: true, message: 'Quantité requise' }]}
                        help="Positif pour ajouter, négatif pour retirer"
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            size="large"
                            placeholder="Ex: 50 ou -10"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Raison"
                        name="reason"
                        rules={[{ required: true, message: 'Raison requise' }]}
                    >
                        <Input placeholder="Ex: Réapprovisionnement fournisseur" size="large" />
                    </Form.Item>

                    <Form.Item label="Notes" name="notes">
                        <TextArea rows={2} placeholder="Notes additionnelles..." />
                    </Form.Item>

                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setAdjustModal({ visible: false, stock: null })}>
                                Annuler
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Ajuster le Stock
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StockManagementAdmin;

