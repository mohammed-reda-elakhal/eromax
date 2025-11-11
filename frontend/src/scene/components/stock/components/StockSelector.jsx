import React, { useEffect, useState } from 'react';
import { Select, InputNumber, Alert, Space, Tag, Spin } from 'antd';
import { WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getAvailableStocks } from '../../../../redux/apiCalls/stockApiCalls';

const { Option } = Select;

/**
 * Stock Selector Component for Colis Creation
 * Used when is_simple = false
 */
const StockSelector = ({ storeId, value, onChange }) => {
    const dispatch = useDispatch();
    const { availableStocks } = useSelector(state => state.stock);
    
    const [selectedStock, setSelectedStock] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (storeId) {
            loadAvailableStocks();
        }
    }, [storeId]);

    const loadAvailableStocks = async () => {
        try {
            setLoading(true);
            await dispatch(getAvailableStocks(storeId, search));
            setLoading(false);
        } catch (error) {
            setLoading(false);
        }
    };

    const handleStockSelect = (stockId) => {
        const stock = availableStocks.find(s => s.value === stockId);
        setSelectedStock(stock);
        setQuantity(1);
        
        // Notify parent component
        if (onChange) {
            onChange({
                usesStock: true,
                stockId: stock.value,
                quantityUsed: 1,
                stockSku: stock.sku,
                produit: stock.value // For compatibility
            });
        }
    };

    const handleQuantityChange = (qty) => {
        setQuantity(qty);
        
        if (onChange && selectedStock) {
            onChange({
                usesStock: true,
                stockId: selectedStock.value,
                quantityUsed: qty,
                stockSku: selectedStock.sku,
                produit: selectedStock.value
            });
        }
    };

    const isQuantityValid = () => {
        if (!selectedStock) return true;
        return quantity <= selectedStock.available;
    };

    return (
        <div className="stock-selector">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                        Sélectionner le Stock
                    </label>
                    <Select
                        showSearch
                        placeholder="Rechercher un produit en stock..."
                        value={selectedStock?.value}
                        onChange={handleStockSelect}
                        onSearch={(value) => setSearch(value)}
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        style={{ width: '100%' }}
                        size="large"
                        loading={loading}
                        options={availableStocks}
                        notFoundContent={
                            loading ? <Spin size="small" /> : "Aucun stock disponible"
                        }
                    />
                </div>

                {selectedStock && (
                    <>
                        <div className="stock-info" style={{
                            padding: '16px',
                            background: '#f5f5f5',
                            borderRadius: '8px'
                        }}>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <div>
                                    <strong>Produit:</strong> {selectedStock.productName}
                                    {selectedStock.variantName && ` - ${selectedStock.variantName}`}
                                </div>
                                <div>
                                    <strong>SKU:</strong> {selectedStock.sku}
                                </div>
                                <div>
                                    <strong>Disponible:</strong>{' '}
                                    <Tag color={selectedStock.isLow ? 'orange' : 'green'}>
                                        {selectedStock.available} unités
                                    </Tag>
                                    {selectedStock.isLow && (
                                        <Tag color="orange" icon={<WarningOutlined />}>
                                            Stock faible
                                        </Tag>
                                    )}
                                </div>
                                {selectedStock.unitPrice > 0 && (
                                    <div>
                                        <strong>Prix unitaire:</strong> {selectedStock.unitPrice} MAD
                                    </div>
                                )}
                            </Space>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                Quantité à utiliser
                            </label>
                            <InputNumber
                                min={1}
                                max={selectedStock.available}
                                value={quantity}
                                onChange={handleQuantityChange}
                                size="large"
                                style={{ width: '100%' }}
                                addonAfter="unités"
                            />
                        </div>

                        {!isQuantityValid() && (
                            <Alert
                                message="Quantité invalide"
                                description={`Vous ne pouvez pas utiliser plus de ${selectedStock.available} unités.`}
                                type="error"
                                showIcon
                            />
                        )}

                        {isQuantityValid() && quantity > 0 && (
                            <Alert
                                message="Réservation de stock"
                                description={
                                    <div>
                                        <div>✓ {quantity} unité(s) seront réservées</div>
                                        <div>✓ {selectedStock.available - quantity} unité(s) resteront disponibles</div>
                                        {selectedStock.available - quantity < selectedStock.available * 0.2 && (
                                            <div style={{ color: '#fa8c16', marginTop: 8 }}>
                                                ⚠️ Attention: Stock sera très bas après cette opération
                                            </div>
                                        )}
                                    </div>
                                }
                                type="info"
                                showIcon
                                icon={<CheckCircleOutlined />}
                            />
                        )}
                    </>
                )}
            </Space>
        </div>
    );
};

export default StockSelector;

