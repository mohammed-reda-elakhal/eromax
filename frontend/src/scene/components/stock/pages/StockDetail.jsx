import React, { useEffect, useContext } from 'react';
import { Card, Descriptions, Tag, Timeline, Table, Row, Col, Statistic, Button, Space, Spin } from 'antd';
import { ArrowLeftOutlined, HistoryOutlined, WarningOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeContext } from '../../../ThemeContext';
import Menubar from '../../../global/Menubar';
import Topbar from '../../../global/Topbar';
import { getStockDetail } from '../../../../redux/apiCalls/stockApiCalls';
import moment from 'moment';

const StockDetail = () => {
    const { theme } = useContext(ThemeContext);
    const { stockId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentStock, loading } = useSelector(state => state.stock);

    useEffect(() => {
        if (stockId) {
            console.log('[Stock Detail] Loading stock:', stockId);
            dispatch(getStockDetail(stockId));
        }
    }, [stockId, dispatch]);

    console.log('[Stock Detail] Current Stock:', currentStock);
    console.log('[Stock Detail] Loading:', loading);

    if (loading) {
        return (
            <div className='page-dashboard'>
                <Menubar />
                <main className="page-main">
                    <Topbar />
                    <div className="page-content" style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                        <p style={{ marginTop: 16 }}>Chargement du stock...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!currentStock || !currentStock.stock) {
        return (
            <div className='page-dashboard'>
                <Menubar />
                <main className="page-main">
                    <Topbar />
                    <div className="page-content" style={{ textAlign: 'center', padding: '50px' }}>
                        <p style={{ color: '#ff4d4f', fontSize: 16 }}>
                            ❌ Stock introuvable ou erreur de chargement
                        </p>
                        <Button onClick={() => navigate(-1)} style={{ marginTop: 16 }}>
                            Retour
                        </Button>
                    </div>
                </main>
            </div>
        );
    }

    const stock = currentStock.stock;
    const movements = currentStock.recentMovements || [];
    const alerts = currentStock.unresolvedAlerts || [];

    const getStatusColor = (status) => {
        const colors = {
            pending: 'orange',
            active: 'green',
            rejected: 'red',
            depleted: 'volcano'
        };
        return colors[status] || 'default';
    };

    const getMovementIcon = (type) => {
        const icons = {
            INITIAL: '🆕',
            CONFIRMED: '✅',
            IN: '➕',
            OUT: '➖',
            RESERVED: '🔒',
            RELEASED: '🔓',
            RETURN: '↩️',
            ADJUSTMENT: '⚙️',
            STATUS_CHANGE: '🔁'
        };
        return icons[type] || '•';
    };

    const movementsColumns = [
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
                <span>
                    {getMovementIcon(type)} {type}
                </span>
            )
        },
        {
            title: 'Quantité',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (qty) => (
                <Tag color={qty > 0 ? 'green' : 'red'}>
                    {qty > 0 ? '+' : ''}{qty}
                </Tag>
            )
        },
        {
            title: 'Avant',
            dataIndex: 'quantityBefore',
            key: 'before'
        },
        {
            title: 'Après',
            dataIndex: 'quantityAfter',
            key: 'after'
        },
        {
            title: 'Raison',
            dataIndex: 'reason',
            key: 'reason',
            ellipsis: true
        },
        {
            title: 'Colis',
            key: 'colis',
            render: (_, record) => record.colisId?.code_suivi || '-'
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date) => moment(date).format('DD/MM/YYYY HH:mm')
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
                        <Button 
                            icon={<ArrowLeftOutlined />} 
                            onClick={() => navigate(-1)}
                            style={{ marginBottom: 16 }}
                        >
                            Retour
                        </Button>

                        <Row gutter={[16, 16]}>
                {/* Stats Cards */}
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Disponible"
                            value={stock.quantite_disponible}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Réservé"
                            value={stock.quantite_reservee}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Utilisé"
                            value={stock.quantite_utilisee}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Initial"
                            value={stock.quantite_initial}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Alerts */}
            {alerts.length > 0 && (
                <Card
                    title={<span><WarningOutlined /> Alertes Non Résolues</span>}
                    style={{ marginTop: 16 }}
                >
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {alerts.map(alert => (
                            <div key={alert._id} style={{
                                padding: 12,
                                background: alert.severity === 'critical' ? '#fff1f0' : '#fffbe6',
                                border: `1px solid ${alert.severity === 'critical' ? '#ffa39e' : '#ffe58f'}`,
                                borderRadius: 4
                            }}>
                                <strong>{alert.title}</strong>: {alert.message}
                            </div>
                        ))}
                    </Space>
                </Card>
            )}

            {/* Stock Information */}
            <Card title="Informations du Stock" style={{ marginTop: 16 }}>
                <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
                    <Descriptions.Item label="SKU">{stock.sku}</Descriptions.Item>
                    <Descriptions.Item label="Produit">{stock.productName}</Descriptions.Item>
                    <Descriptions.Item label="Variante">{stock.variantName || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Statut">
                        <Tag color={getStatusColor(stock.status)}>{stock.status}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Catégorie">{stock.category || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Emplacement">{stock.location}</Descriptions.Item>
                    <Descriptions.Item label="Coût Unitaire">{stock.unitCost} MAD</Descriptions.Item>
                    <Descriptions.Item label="Prix de Vente">{stock.unitPrice} MAD</Descriptions.Item>
                    <Descriptions.Item label="Seuil Minimum">{stock.quantite_minimum}</Descriptions.Item>
                    <Descriptions.Item label="Soumis le">
                        {moment(stock.submittedAt).format('DD/MM/YYYY')}
                    </Descriptions.Item>
                    {stock.reviewedAt && (
                        <Descriptions.Item label="Révisé le">
                            {moment(stock.reviewedAt).format('DD/MM/YYYY')}
                        </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Magasin">
                        {stock.storeId?.storeName}
                    </Descriptions.Item>
                </Descriptions>

                {stock.productDescription && (
                    <div style={{ marginTop: 16 }}>
                        <strong>Description:</strong>
                        <p>{stock.productDescription}</p>
                    </div>
                )}

                {stock.clientNotes && (
                    <div style={{ marginTop: 16 }}>
                        <strong>Notes du Client:</strong>
                        <p style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                            {stock.clientNotes}
                        </p>
                    </div>
                )}

                {stock.confirmationNotes && (
                    <div style={{ marginTop: 16 }}>
                        <strong>Notes de Confirmation (Admin):</strong>
                        <p style={{ background: '#e6f7ff', padding: 12, borderRadius: 4, border: '1px solid #91d5ff' }}>
                            {stock.confirmationNotes}
                        </p>
                    </div>
                )}

                {stock.rejectionReason && (
                    <div style={{ marginTop: 16 }}>
                        <strong>Raison du Rejet:</strong>
                        <p style={{ background: '#fff1f0', padding: 12, borderRadius: 4, border: '1px solid #ffa39e' }}>
                            {stock.rejectionReason}
                        </p>
                    </div>
                )}
            </Card>

            {/* Movement History */}
            <Card 
                title={<span><HistoryOutlined /> Historique des Mouvements</span>}
                style={{ marginTop: 16 }}
            >
                <Table
                    columns={movementsColumns}
                    dataSource={movements}
                    rowKey="_id"
                    pagination={false}
                    size="small"
                />
            </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StockDetail;

