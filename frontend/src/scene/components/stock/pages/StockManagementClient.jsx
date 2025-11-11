import React, { useState, useContext } from 'react';
import { Card, Tabs, Button, Statistic, Row, Col, Badge } from 'antd';
import { PlusOutlined, InboxOutlined, HistoryOutlined, WarningOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import CreateStockForm from '../components/CreateStockForm';
import MyStocksList from '../components/MyStocksList';
import '../stock.css';

const StockManagementClient = () => {
    const { theme } = useContext(ThemeContext);
    const { myStocks } = useSelector(state => state.stock);
    const { user, store } = useSelector(state => state.auth);
    const [activeTab, setActiveTab] = useState('list');
    
    // Get storeId - either from user.store or from store object
    const storeId = user?.store || store?._id;
    
    console.log('[Stock Management Client] User:', user);
    console.log('[Stock Management Client] Store:', store);
    console.log('[Stock Management Client] StoreId:', storeId);

    // Calculate statistics
    const stats = {
        total: myStocks.data?.length || 0,
        pending: myStocks.data?.filter(s => s.status === 'pending').length || 0,
        active: myStocks.data?.filter(s => s.status === 'active').length || 0,
        lowStock: myStocks.data?.filter(s => s.isLowStock).length || 0,
        outOfStock: myStocks.data?.filter(s => s.isOutOfStock).length || 0
    };

    const totalAvailable = myStocks.data?.reduce((sum, s) => sum + (s.quantite_disponible || 0), 0) || 0;
    const totalReserved = myStocks.data?.reduce((sum, s) => sum + (s.quantite_reservee || 0), 0) || 0;

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
                        <h4 style={{ marginBottom: 16 }}>Gestion de Mon Stock</h4>
                        
                        {/* Header Stats */}
                        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Produits"
                            value={stats.total}
                            prefix={<InboxOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Unités Disponibles"
                            value={totalAvailable}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Unités Réservées"
                            value={totalReserved}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="En Attente"
                            value={stats.pending}
                            valueStyle={{ color: '#faad14' }}
                            suffix={
                                stats.pending > 0 && (
                                    <Badge count={stats.pending} style={{ backgroundColor: '#faad14' }} />
                                )
                            }
                        />
                    </Card>
                </Col>
            </Row>

            {/* Alerts Row */}
            {(stats.lowStock > 0 || stats.outOfStock > 0) && (
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    {stats.lowStock > 0 && (
                        <Col xs={24} md={12}>
                            <Card style={{ borderLeft: '4px solid #faad14' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <WarningOutlined style={{ fontSize: 24, color: '#faad14', marginRight: 12 }} />
                                    <div>
                                        <div><strong>Stock Faible</strong></div>
                                        <div>{stats.lowStock} produit(s) en dessous du seuil minimum</div>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    )}
                    {stats.outOfStock > 0 && (
                        <Col xs={24} md={12}>
                            <Card style={{ borderLeft: '4px solid #ff4d4f' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <WarningOutlined style={{ fontSize: 24, color: '#ff4d4f', marginRight: 12 }} />
                                    <div>
                                        <div><strong>Rupture de Stock</strong></div>
                                        <div>{stats.outOfStock} produit(s) épuisé(s)</div>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    )}
                </Row>
            )}

            {/* Main Content */}
            <Card>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    tabBarExtraContent={
                        activeTab === 'list' && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setActiveTab('create')}
                            >
                                Ajouter un Stock
                            </Button>
                        )
                    }
                    items={[
                        {
                            key: 'list',
                            label: 'Mes Stocks',
                            children: <MyStocksList />
                        },
                        {
                            key: 'create',
                            label: 'Créer un Stock',
                            children: (
                                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                                    {!storeId ? (
                                        <div style={{ padding: 40, textAlign: 'center' }}>
                                            <p style={{ color: '#ff4d4f', fontSize: 16 }}>
                                                ❌ Erreur: Store ID introuvable
                                            </p>
                                            <p style={{ color: '#666', fontSize: 14 }}>
                                                Veuillez vous reconnecter ou contacter l'administrateur.
                                            </p>
                                        </div>
                                    ) : (
                                        <CreateStockForm
                                            storeId={storeId}
                                            onSuccess={() => {
                                                setActiveTab('list');
                                            }}
                                        />
                                    )}
                                </div>
                            )
                        }
                    ]}
                />
            </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StockManagementClient;

