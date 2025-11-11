import React, { useState, useEffect } from 'react';
import { Button, InputNumber, Table, Tag, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import StockSelectorForColis from './StockSelectorForColis';

const MultiStockSelector = ({ value = [], onChange, storeId }) => {
    const [showSelector, setShowSelector] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState(value);

    // Update selectedProducts when value prop changes
    useEffect(() => {
        setSelectedProducts(value);
    }, [value]);

    // Reset selected products when store changes (for admin)
    useEffect(() => {
        if (storeId) {
            console.log('[Multi Stock Selector] Store changed, clearing selection:', storeId);
            setSelectedProducts([]);
            onChange([]);
            setShowSelector(false);
        }
    }, [storeId]);

    // Add a new product
    const handleAddProduct = (stock) => {
        if (!stock) return;
        
        // Check if product already exists
        const exists = selectedProducts.find(p => p.stockId === stock.value);
        if (exists) {
            alert('Ce produit est déjà ajouté à la liste');
            return;
        }

        const newProduct = {
            stockId: stock.value,
            productName: stock.productName,
            variantName: stock.variantName,
            sku: stock.sku,
            unitPrice: stock.unitPrice,
            availableQty: stock.available,
            quantity: 1,
            totalPrice: stock.unitPrice * 1
        };

        const updated = [...selectedProducts, newProduct];
        setSelectedProducts(updated);
        onChange(updated);
        setShowSelector(false);
    };

    // Update quantity
    const handleQuantityChange = (stockId, newQuantity) => {
        const updated = selectedProducts.map(p => {
            if (p.stockId === stockId) {
                return {
                    ...p,
                    quantity: newQuantity,
                    totalPrice: p.unitPrice * newQuantity
                };
            }
            return p;
        });
        setSelectedProducts(updated);
        onChange(updated);
    };

    // Remove product
    const handleRemoveProduct = (stockId) => {
        const updated = selectedProducts.filter(p => p.stockId !== stockId);
        setSelectedProducts(updated);
        onChange(updated);
    };

    // Calculate total price
    const calculateTotalPrice = () => {
        return selectedProducts.reduce((sum, p) => sum + p.totalPrice, 0);
    };

    const columns = [
        {
            title: 'Produit',
            key: 'product',
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>
                        {record.productName}
                        {record.variantName && (
                            <span style={{ fontWeight: '400', color: '#6b7280', marginLeft: '4px' }}>
                                - {record.variantName}
                            </span>
                        )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace' }}>
                        {record.sku}
                    </div>
                </div>
            )
        },
        {
            title: 'Prix Unitaire',
            dataIndex: 'unitPrice',
            key: 'unitPrice',
            width: 120,
            render: (price) => (
                <Tag color="blue" style={{ fontSize: '13px', fontWeight: '600' }}>
                    {price} MAD
                </Tag>
            )
        },
        {
            title: 'Quantité',
            key: 'quantity',
            width: 150,
            render: (_, record) => (
                <InputNumber
                    min={1}
                    max={record.availableQty}
                    value={record.quantity}
                    onChange={(val) => handleQuantityChange(record.stockId, val || 1)}
                    style={{ width: '100%' }}
                    addonAfter={`/${record.availableQty}`}
                />
            )
        },
        {
            title: 'Total',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            width: 120,
            render: (price) => (
                <strong style={{ color: '#0ea5e9', fontSize: '14px' }}>
                    {price} MAD
                </strong>
            )
        },
        {
            title: 'Action',
            key: 'action',
            width: 80,
            align: 'center',
            render: (_, record) => (
                <Popconfirm
                    title="Supprimer ce produit?"
                    onConfirm={() => handleRemoveProduct(record.stockId)}
                    okText="Oui"
                    cancelText="Non"
                >
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                    />
                </Popconfirm>
            )
        }
    ];

    return (
        <div>
            {/* Add Product Button */}
            {!showSelector && (
                <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => setShowSelector(true)}
                    block
                    size="large"
                    style={{
                        marginBottom: '16px',
                        height: '48px',
                        borderColor: '#0ea5e9',
                        color: '#0ea5e9',
                        fontWeight: '600'
                    }}
                >
                    Ajouter un Produit du Stock
                </Button>
            )}

            {/* Stock Selector */}
            {showSelector && (
                <div style={{
                    marginBottom: '16px',
                    padding: '16px',
                    background: '#f9fafb',
                    borderRadius: '12px',
                    border: '2px dashed #d1d5db'
                }}>
                    <div style={{ marginBottom: '12px', fontWeight: '600', color: '#374151' }}>
                        <ShoppingCartOutlined style={{ marginRight: '8px' }} />
                        Sélectionner un produit
                    </div>
                    <StockSelectorForColis
                        value={null}
                        onChange={() => {}}
                        onStockSelect={handleAddProduct}
                        storeId={storeId}
                    />
                    <Button
                        onClick={() => setShowSelector(false)}
                        style={{ marginTop: '12px' }}
                        size="small"
                    >
                        Annuler
                    </Button>
                </div>
            )}

            {/* Selected Products Table */}
            {selectedProducts.length > 0 && (
                <>
                    <Table
                        columns={columns}
                        dataSource={selectedProducts}
                        rowKey="stockId"
                        pagination={false}
                        size="middle"
                        style={{ marginBottom: '16px' }}
                        bordered
                    />

                    {/* Total Price Summary */}
                    <div style={{
                        padding: '16px',
                        background: 'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)',
                        borderRadius: '12px',
                        border: '2px solid #0ea5e9',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontSize: '14px', color: '#075985', fontWeight: '600' }}>
                                Total du Colis
                            </div>
                            <div style={{ fontSize: '12px', color: '#0369a1' }}>
                                {selectedProducts.length} produit(s) sélectionné(s)
                            </div>
                        </div>
                        <div style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#0c4a6e'
                        }}>
                            {calculateTotalPrice()} MAD
                        </div>
                    </div>
                </>
            )}

            {/* Empty State */}
            {selectedProducts.length === 0 && !showSelector && (
                <div style={{
                    padding: '32px',
                    textAlign: 'center',
                    background: '#f9fafb',
                    borderRadius: '12px',
                    border: '2px dashed #d1d5db'
                }}>
                    <ShoppingCartOutlined style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '12px' }} />
                    <div style={{ color: '#6b7280', fontSize: '14px' }}>
                        Aucun produit ajouté
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>
                        Cliquez sur "Ajouter un Produit" pour commencer
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiStockSelector;

