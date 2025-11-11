/**
 * ============================================================
 * EXAMPLE: How to Integrate StockSelector into Colis Creation
 * ============================================================
 * 
 * This file shows how to integrate the StockSelector component
 * into your existing colis creation form.
 */

import React, { useState } from 'react';
import { Form, Input, Select, Radio, Button } from 'antd';
import StockSelector from './StockSelector';

const { Option } = Select;

const ExampleColisCreationForm = () => {
    const [form] = Form.useForm();
    const [isSimple, setIsSimple] = useState(true); // true = simple colis, false = stock-based
    const [selectedStock, setSelectedStock] = useState(null);

    const handleSubmit = async (values) => {
        const colisData = {
            nom: values.nom,
            tele: values.tele,
            ville: values.ville,
            prix: values.prix,
            is_simple: isSimple, // IMPORTANT!
            produits: []
        };

        if (isSimple) {
            // Traditional simple colis (no stock)
            colisData.produits = [{
                produit: values.produit,
                variants: values.variants || []
            }];
        } else {
            // Stock-based colis
            if (selectedStock) {
                colisData.produits = [{
                    produit: selectedStock.stockId, // Use stockId as produit
                    usesStock: true,
                    stockId: selectedStock.stockId,
                    stockSku: selectedStock.stockSku,
                    quantityUsed: selectedStock.quantityUsed
                }];
            }
        }

        console.log('Colis Data:', colisData);
        // Send to API: await dispatch(createColis(colisData));
    };

    return (
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
            {/* Basic Fields */}
            <Form.Item label="Nom" name="nom" rules={[{ required: true }]}>
                <Input />
            </Form.Item>

            <Form.Item label="Téléphone" name="tele" rules={[{ required: true }]}>
                <Input />
            </Form.Item>

            <Form.Item label="Ville" name="ville" rules={[{ required: true }]}>
                <Select>
                    <Option value="ville1">Casablanca</Option>
                    <Option value="ville2">Rabat</Option>
                </Select>
            </Form.Item>

            <Form.Item label="Prix" name="prix" rules={[{ required: true }]}>
                <Input type="number" />
            </Form.Item>

            {/* STOCK INTEGRATION - Toggle between Simple and Stock */}
            <Form.Item label="Type de Colis">
                <Radio.Group value={isSimple} onChange={(e) => setIsSimple(e.target.value)}>
                    <Radio value={true}>Colis Simple</Radio>
                    <Radio value={false}>Utiliser le Stock</Radio>
                </Radio.Group>
            </Form.Item>

            {/* Show different forms based on type */}
            {isSimple ? (
                // Simple colis - traditional product selection
                <Form.Item label="Produit" name="produit">
                    <Select placeholder="Sélectionner un produit">
                        <Option value="prod1">Product 1</Option>
                        <Option value="prod2">Product 2</Option>
                    </Select>
                </Form.Item>
            ) : (
                // Stock-based colis - use StockSelector
                <StockSelector
                    storeId="YOUR_STORE_ID" // Pass actual storeId
                    value={selectedStock}
                    onChange={setSelectedStock}
                />
            )}

            <Form.Item>
                <Button type="primary" htmlType="submit" block size="large">
                    Créer le Colis
                </Button>
            </Form.Item>
        </Form>
    );
};

export default ExampleColisCreationForm;


/**
 * ============================================================
 * INTEGRATION STEPS FOR YOUR EXISTING COLIS FORM:
 * ============================================================
 * 
 * 1. Import StockSelector:
 *    import StockSelector from '../stock/components/StockSelector';
 * 
 * 2. Add state for stock selection:
 *    const [useStock, setUseStock] = useState(false);
 *    const [selectedStock, setSelectedStock] = useState(null);
 * 
 * 3. Add toggle in your form (before product selection):
 *    <Form.Item label="Type de Colis">
 *      <Radio.Group value={!useStock} onChange={(e) => setUseStock(!e.target.value)}>
 *        <Radio value={true}>Simple</Radio>
 *        <Radio value={false}>Avec Stock</Radio>
 *      </Radio.Group>
 *    </Form.Item>
 * 
 * 4. Conditionally show StockSelector:
 *    {useStock ? (
 *      <StockSelector
 *        storeId={yourStoreId}
 *        onChange={setSelectedStock}
 *      />
 *    ) : (
 *      // Your existing product selector
 *      <ProductSelector ... />
 *    )}
 * 
 * 5. When submitting, set is_simple based on useStock:
 *    const colisData = {
 *      ...formValues,
 *      is_simple: !useStock,
 *      produits: useStock ? [{
 *        usesStock: true,
 *        stockId: selectedStock.stockId,
 *        quantityUsed: selectedStock.quantityUsed,
 *        produit: selectedStock.stockId
 *      }] : [
 *        // Your existing produits structure
 *      ]
 *    };
 * 
 * That's it! The backend will automatically handle stock reservation.
 */

