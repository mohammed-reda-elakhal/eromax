import React, { useEffect, useState } from 'react';
import { Table, Tag, Input, Select, Button, Space, Tooltip, Badge } from 'antd';
import { SearchOutlined, ReloadOutlined, EyeOutlined, WarningOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getMyStocks } from '../../../../redux/apiCalls/stockApiCalls';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const MyStocksList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { myStocks, loading } = useSelector(state => state.stock);
    
    const [filters, setFilters] = useState({
        status: '',
        search: '',
        page: 1,
        limit: 20
    });

    useEffect(() => {
        loadStocks();
    }, [filters]);

    const loadStocks = () => {
        const params = {};
        if (filters.status) params.status = filters.status;
        if (filters.search) params.search = filters.search;
        params.page = filters.page;
        params.limit = filters.limit;
        
        dispatch(getMyStocks(params));
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'orange',
            'active': 'green',
            'rejected': 'red',
            'inactive': 'gray',
            'depleted': 'volcano'
        };
        return colors[status] || 'default';
    };

    const getStatusText = (status) => {
        const texts = {
            'pending': 'En attente',
            'active': 'Actif',
            'rejected': 'Rejeté',
            'inactive': 'Inactif',
            'depleted': 'Épuisé'
        };
        return texts[status] || status;
    };

    const columns = [
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            width: 150,
            render: (sku, record) => (
                <div>
                    <strong>{sku}</strong>
                    {record.isLowStock && (
                        <Tooltip title="Stock faible">
                            <WarningOutlined style={{ color: '#faad14', marginLeft: 8 }} />
                        </Tooltip>
                    )}
                    {record.isOutOfStock && (
                        <Tooltip title="Rupture de stock">
                            <WarningOutlined style={{ color: '#ff4d4f', marginLeft: 8 }} />
                        </Tooltip>
                    )}
                </div>
            )
        },
        {
            title: 'Produit',
            dataIndex: 'productName',
            key: 'productName',
            render: (name, record) => (
                <div>
                    <div>{name}</div>
                    {record.variantName && (
                        <small style={{ color: '#666' }}>{record.variantName}</small>
                    )}
                </div>
            )
        },
        {
            title: 'Disponible',
            dataIndex: 'quantite_disponible',
            key: 'quantite_disponible',
            width: 100,
            align: 'center',
            render: (qty, record) => (
                <Badge 
                    count={qty} 
                    showZero
                    style={{ 
                        backgroundColor: qty === 0 ? '#ff4d4f' : qty < record.quantite_minimum ? '#faad14' : '#52c41a'
                    }}
                />
            )
        },
        {
            title: 'Réservé',
            dataIndex: 'quantite_reservee',
            key: 'quantite_reservee',
            width: 100,
            align: 'center',
            render: (qty) => <Badge count={qty} showZero style={{ backgroundColor: '#1890ff' }} />
        },
        {
            title: 'Utilisé',
            dataIndex: 'quantite_utilisee',
            key: 'quantite_utilisee',
            width: 100,
            align: 'center',
            render: (qty) => <Badge count={qty} showZero style={{ backgroundColor: '#722ed1' }} />
        },
        {
            title: 'Total',
            key: 'quantite_totale',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <strong>{record.quantite_totale || (record.quantite_disponible + record.quantite_reservee)}</strong>
            )
        },
        {
            title: 'Statut',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            )
        },
        {
            title: 'Magasin',
            dataIndex: ['storeId', 'storeName'],
            key: 'store',
            width: 150
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Voir détails">
                        <Button
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/dashboard/stock/${record._id}`)}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <div className="my-stocks-list">
            <div className="stocks-filters" style={{ marginBottom: 16 }}>
                <Space wrap>
                    <Input
                        placeholder="Rechercher par SKU, nom..."
                        prefix={<SearchOutlined />}
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                        style={{ width: 300 }}
                        allowClear
                    />
                    
                    <Select
                        placeholder="Filtrer par statut"
                        value={filters.status || undefined}
                        onChange={(value) => setFilters({ ...filters, status: value, page: 1 })}
                        style={{ width: 200 }}
                        allowClear
                    >
                        <Option value="">Tous</Option>
                        <Option value="pending">En attente</Option>
                        <Option value="active">Actif</Option>
                        <Option value="rejected">Rejeté</Option>
                        <Option value="depleted">Épuisé</Option>
                    </Select>
                    
                    <Button icon={<ReloadOutlined />} onClick={loadStocks}>
                        Actualiser
                    </Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={myStocks.data}
                rowKey="_id"
                loading={loading}
                scroll={{ x: 1200 }}
                pagination={{
                    current: myStocks.pagination?.page || 1,
                    pageSize: myStocks.pagination?.limit || 20,
                    total: myStocks.pagination?.total || 0,
                    onChange: (page, pageSize) => {
                        setFilters({ ...filters, page, limit: pageSize });
                    },
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} stocks`
                }}
            />
        </div>
    );
};

export default MyStocksList;

