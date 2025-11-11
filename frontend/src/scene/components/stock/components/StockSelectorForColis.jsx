import React, { useEffect, useState } from 'react';
import { Select, Tag, Alert, Spin, Button } from 'antd';
import { WarningOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import request from '../../../../utils/request';

const { Option } = Select;

const StockSelectorForColis = ({ value, onChange, storeId, onStockSelect }) => {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        console.log('[Stock Selector] Store ID changed:', storeId);
        if (storeId) {
            loadStocks();
        }
    }, [storeId]);

    // Load stocks on mount if no storeId (for client)
    useEffect(() => {
        if (!storeId) {
            loadStocks();
        }
    }, []);

    const loadStocks = async () => {
        try {
            setLoading(true);
            const params = {};
            if (storeId) params.storeId = storeId;
            if (search) params.search = search;
            
            const queryString = new URLSearchParams(params).toString();
            const url = `/api/stock/available-for-colis?${queryString}`;
            
            console.log('[Stock Selector] Loading stocks from:', url);
            console.log('[Stock Selector] Params:', { storeId, search });
            
            const { data } = await request.get(url);
            
            console.log('[Stock Selector] Response:', data);
            console.log('[Stock Selector] Loaded stocks count:', data.stocks?.length || 0);
            setStocks(data.stocks || []);
        } catch (error) {
            console.error('[Stock Selector] Error loading stocks:', error);
            console.error('[Stock Selector] Error response:', error?.response?.data);
            setStocks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value) => {
        setSearch(value);
        setTimeout(() => loadStocks(), 300);
    };

    const handleStockChange = (stockId) => {
        const selectedStock = stocks.find(s => s.value === stockId);
        onChange(stockId);
        
        // Pass the full stock details to parent component
        if (onStockSelect && selectedStock) {
            onStockSelect(selectedStock);
        }
    };

    const selectedStock = stocks.find(s => s.value === value);

    return (
        <div>
            <Select
                showSearch
                value={value}
                onChange={handleStockChange}
                onSearch={handleSearch}
                loading={loading}
                placeholder="Rechercher un produit en stock..."
                style={{ width: '100%' }}
                size="large"
                optionFilterProp="children"
                filterOption={false}
                notFoundContent={loading ? <Spin size="small" /> : "Aucun stock disponible"}
                dropdownStyle={{ 
                    padding: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
            >
                {stocks.map(stock => (
                    <Option key={stock.value} value={stock.value}>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            padding: '8px 0',
                            minHeight: '60px'
                        }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ 
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    marginBottom: '4px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {stock.productName}
                                    {stock.variantName && (
                                        <span style={{ 
                                            color: '#6b7280', 
                                            fontWeight: '400',
                                            marginLeft: '6px' 
                                        }}>
                                            - {stock.variantName}
                                        </span>
                                    )}
                                </div>
                                <div style={{ 
                                    fontSize: '12px', 
                                    color: '#9ca3af',
                                    fontFamily: 'monospace'
                                }}>
                                    SKU: {stock.sku}
                                </div>
                            </div>
                            <div style={{ 
                                display: 'flex', 
                                gap: '8px', 
                                alignItems: 'center',
                                marginLeft: '12px',
                                flexShrink: 0
                            }}>
                                <Tag 
                                    color={stock.available > 10 ? 'green' : stock.available > 5 ? 'orange' : 'red'}
                                    style={{ 
                                        margin: 0,
                                        padding: '4px 12px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        borderRadius: '6px'
                                    }}
                                >
                                    {stock.available} unités
                                </Tag>
                                {stock.isLow && (
                                    <WarningOutlined style={{ 
                                        color: '#faad14', 
                                        fontSize: '16px'
                                    }} />
                                )}
                            </div>
                        </div>
                    </Option>
                ))}
            </Select>

            {/* Selected Stock Info - Enhanced Styling with Remove Button */}
            {selectedStock && (
                <div style={{
                    marginTop: '12px',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
                    borderRadius: '12px',
                    border: '2px solid #0ea5e9',
                    boxShadow: '0 2px 8px rgba(14, 165, 233, 0.15)',
                    position: 'relative'
                }}>
                    {/* Remove Button */}
                    <Button
                        type="text"
                        danger
                        size="small"
                        icon={<CloseCircleOutlined />}
                        onClick={() => {
                            onChange(null);
                            if (onStockSelect) {
                                onStockSelect(null);
                            }
                        }}
                        style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            padding: 0,
                            background: 'rgba(239, 68, 68, 0.1)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#ef4444';
                            e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    />
                    
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                        paddingRight: '32px' // Space for remove button
                    }}>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            flex: '1 1 auto',
                            minWidth: '200px'
                        }}>
                            <CheckCircleOutlined style={{ 
                                color: '#0ea5e9', 
                                fontSize: '20px',
                                marginRight: '10px' 
                            }} />
                            <div>
                                <div style={{
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    color: '#0c4a6e',
                                    marginBottom: '2px'
                                }}>
                                    {selectedStock.productName}
                                    {selectedStock.variantName && (
                                        <span style={{ 
                                            fontWeight: '400',
                                            color: '#075985',
                                            marginLeft: '4px'
                                        }}>
                                            - {selectedStock.variantName}
                                        </span>
                                    )}
                                </div>
                                <div style={{
                                    fontSize: '11px',
                                    color: '#0369a1',
                                    fontFamily: 'monospace'
                                }}>
                                    {selectedStock.sku}
                                </div>
                            </div>
                        </div>
                        <div style={{ 
                            display: 'flex', 
                            gap: '8px',
                            flexShrink: 0,
                            flexWrap: 'wrap'
                        }}>
                            <Tag 
                                color="blue"
                                style={{
                                    margin: 0,
                                    padding: '6px 14px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    borderRadius: '8px',
                                    background: '#0ea5e9',
                                    border: 'none',
                                    color: 'white'
                                }}
                            >
                                {selectedStock.unitPrice} MAD/unité
                            </Tag>
                            <Tag 
                                color={selectedStock.available > 10 ? 'green' : 'orange'}
                                style={{
                                    margin: 0,
                                    padding: '6px 14px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    borderRadius: '8px',
                                    background: selectedStock.available > 10 ? '#22c55e' : '#f59e0b',
                                    border: 'none',
                                    color: 'white'
                                }}
                            >
                                {selectedStock.available} disponibles
                            </Tag>
                        </div>
                    </div>
                </div>
            )}

            {stocks.length === 0 && !loading && (
                <div style={{
                    marginTop: '12px',
                    padding: '16px',
                    background: '#fef3c7',
                    borderRadius: '12px',
                    border: '2px solid #fbbf24',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                }}>
                    <WarningOutlined style={{ 
                        color: '#f59e0b',
                        fontSize: '20px',
                        marginTop: '2px'
                    }} />
                    <div>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#92400e',
                            marginBottom: '4px'
                        }}>
                            Aucun stock disponible
                        </div>
                        <div style={{
                            fontSize: '13px',
                            color: '#b45309',
                            lineHeight: '1.5'
                        }}>
                            Vous n'avez aucun stock actif.
                            {user?.role === 'client' && " Veuillez créer un stock et attendez l'approbation de l'admin."}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockSelectorForColis;

