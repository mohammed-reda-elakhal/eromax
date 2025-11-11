const mongoose = require("mongoose");
const { Stock } = require("../Models/Stock");
const { StockMovement } = require("../Models/StockMovement");
const { StockAlert } = require("../Models/StockAlert");

/**
 * ============================================================
 * STOCK HELPER FUNCTIONS FOR COLIS CONTROLLER
 * Handles stock reservation, deduction, and release
 * ============================================================
 */

/**
 * @desc    Reserve stock when creating colis
 * @param   {Array} produits - Products array from colis
 * @param   {ObjectId} colisId - Colis ID
 * @param   {String} code_suivi - Colis tracking code
 * @param   {ObjectId} userId - User who created colis
 * @param   {String} userRole - User role
 * @param   {Session} session - MongoDB session for transaction
 * @returns {Array} Updated produits array with stock info
 */
async function reserveStockForColis(produits, colisId, code_suivi, userId, userRole, session) {
    const updatedProduits = [];
    
    for (const produit of produits) {
        // Skip if not using stock
        if (!produit.usesStock || !produit.stockId) {
            updatedProduits.push(produit);
            continue;
        }
        
        // Get stock with lock (for update)
        const stock = await Stock.findById(produit.stockId).session(session);
        
        if (!stock) {
            throw new Error(`Stock not found: ${produit.stockId}`);
        }
        
        // Validate stock status
        if (stock.status !== 'active') {
            throw new Error(
                `Stock ${stock.sku} is not active (current status: ${stock.status}). ` +
                `Only active stock can be used in colis.`
            );
        }
        
        // Validate quantity available
        const quantityNeeded = produit.quantityUsed || 1;
        
        if (stock.quantite_disponible < quantityNeeded) {
            throw new Error(
                `Insufficient stock for ${stock.productName} (${stock.sku}). ` +
                `Available: ${stock.quantite_disponible}, Requested: ${quantityNeeded}`
            );
        }
        
        // Reserve stock
        const qtyBefore = stock.quantite_disponible;
        const reservedBefore = stock.quantite_reservee;
        
        stock.quantite_disponible -= quantityNeeded;
        stock.quantite_reservee += quantityNeeded;
        stock.lastUsedDate = new Date();
        
        await stock.save({ session });
        
        // Create stock movement
        const movement = new StockMovement({
            stockId: stock._id,
            clientId: stock.clientId,
            storeId: stock.storeId,
            colisId: colisId,
            type: 'RESERVED',
            quantity: -quantityNeeded,
            quantityBefore: qtyBefore,
            quantityAfter: stock.quantite_disponible,
            reservedBefore: reservedBefore,
            reservedAfter: stock.quantite_reservee,
            reason: `Reserved for colis ${code_suivi}`,
            performedBy: userId,
            performedByModel: userRole === 'admin' ? 'Admin' : 'Team',
            performedByRole: userRole,
            referenceData: {
                colisCode: code_suivi,
                productName: stock.productName,
                variantName: stock.variantName,
                sku: stock.sku
            }
        });
        
        await movement.save({ session });
        
        // Check for low stock alerts
        await checkStockAlerts(stock, session);
        
        // Update produit info
        updatedProduits.push({
            ...produit,
            stockReserved: true,
            stockSku: stock.sku,
            stockDeducted: false
        });
    }
    
    return updatedProduits;
}

/**
 * @desc    Deduct stock when colis is delivered
 * @param   {Object} colis - Colis object
 * @param   {ObjectId} userId - User who performed action
 * @param   {String} userRole - User role
 * @param   {Session} session - MongoDB session
 */
async function deductStockForDeliveredColis(colis, userId, userRole, session) {
    for (const produit of colis.produits) {
        // Skip if not using stock or already deducted
        if (!produit.usesStock || !produit.stockId || produit.stockDeducted) {
            continue;
        }
        
        // Skip if not reserved (shouldn't happen, but safety check)
        if (!produit.stockReserved) {
            console.warn(`Stock not reserved for colis ${colis.code_suivi}, product ${produit.stockId}`);
            continue;
        }
        
        const stock = await Stock.findById(produit.stockId).session(session);
        
        if (!stock) {
            console.error(`Stock not found: ${produit.stockId} for colis ${colis.code_suivi}`);
            continue;
        }
        
        const quantityUsed = produit.quantityUsed || 1;
        const reservedBefore = stock.quantite_reservee;
        const usedBefore = stock.quantite_utilisee;
        
        // Move from reserved to used
        stock.quantite_reservee -= quantityUsed;
        stock.quantite_utilisee += quantityUsed;
        
        // Ensure no negative values
        if (stock.quantite_reservee < 0) stock.quantite_reservee = 0;
        
        await stock.save({ session });
        
        // Create movement
        const movement = new StockMovement({
            stockId: stock._id,
            clientId: stock.clientId,
            storeId: stock.storeId,
            colisId: colis._id,
            type: 'OUT',
            quantity: -quantityUsed,
            quantityBefore: stock.quantite_disponible, // Disponible doesn't change
            quantityAfter: stock.quantite_disponible,
            reservedBefore: reservedBefore,
            reservedAfter: stock.quantite_reservee,
            usedBefore: usedBefore,
            usedAfter: stock.quantite_utilisee,
            reason: `Used in delivered colis ${colis.code_suivi}`,
            performedBy: userId,
            performedByModel: userRole === 'admin' ? 'Admin' : 'System',
            performedByRole: userRole || 'system',
            referenceData: {
                colisCode: colis.code_suivi,
                productName: stock.productName,
                variantName: stock.variantName,
                sku: stock.sku
            }
        });
        
        await movement.save({ session });
        
        // Update colis produit
        produit.stockDeducted = true;
    }
}

/**
 * @desc    Release stock when colis is cancelled or refused
 * @param   {Object} colis - Colis object
 * @param   {ObjectId} userId - User who performed action
 * @param   {String} userRole - User role
 * @param   {Session} session - MongoDB session
 */
async function releaseStockForCancelledColis(colis, userId, userRole, session) {
    for (const produit of colis.produits) {
        // Skip if not using stock or not reserved
        if (!produit.usesStock || !produit.stockId || !produit.stockReserved) {
            continue;
        }
        
        // Skip if already deducted (delivered colis shouldn't be cancelled)
        if (produit.stockDeducted) {
            console.warn(`Attempting to release deducted stock for colis ${colis.code_suivi}`);
            continue;
        }
        
        const stock = await Stock.findById(produit.stockId).session(session);
        
        if (!stock) {
            console.error(`Stock not found: ${produit.stockId} for colis ${colis.code_suivi}`);
            continue;
        }
        
        const quantityUsed = produit.quantityUsed || 1;
        const qtyBefore = stock.quantite_disponible;
        const reservedBefore = stock.quantite_reservee;
        
        // Return to available
        stock.quantite_disponible += quantityUsed;
        stock.quantite_reservee -= quantityUsed;
        
        // Ensure no negative reserved
        if (stock.quantite_reservee < 0) stock.quantite_reservee = 0;
        
        await stock.save({ session });
        
        // Create movement
        const movement = new StockMovement({
            stockId: stock._id,
            clientId: stock.clientId,
            storeId: stock.storeId,
            colisId: colis._id,
            type: 'RELEASED',
            quantity: quantityUsed,
            quantityBefore: qtyBefore,
            quantityAfter: stock.quantite_disponible,
            reservedBefore: reservedBefore,
            reservedAfter: stock.quantite_reservee,
            reason: `Released from ${colis.statut.toLowerCase()} colis ${colis.code_suivi}`,
            performedBy: userId,
            performedByModel: userRole === 'admin' ? 'Admin' : 'System',
            performedByRole: userRole || 'system',
            referenceData: {
                colisCode: colis.code_suivi,
                productName: stock.productName,
                variantName: stock.variantName,
                sku: stock.sku
            }
        });
        
        await movement.save({ session });
        
        // Update colis produit
        produit.stockReserved = false;
        
        // Re-check alerts (stock might be back in acceptable range)
        await checkStockAlerts(stock, session);
    }
}

/**
 * @desc    Return stock when colis is returned
 * @param   {Object} colis - Colis object
 * @param   {ObjectId} userId - User who performed action
 * @param   {String} userRole - User role
 * @param   {Session} session - MongoDB session
 */
async function returnStockFromColis(colis, userId, userRole, session) {
    for (const produit of colis.produits) {
        // Skip if not using stock or not deducted
        if (!produit.usesStock || !produit.stockId || !produit.stockDeducted) {
            continue;
        }
        
        const stock = await Stock.findById(produit.stockId).session(session);
        
        if (!stock) {
            console.error(`Stock not found: ${produit.stockId} for colis ${colis.code_suivi}`);
            continue;
        }
        
        const quantityUsed = produit.quantityUsed || 1;
        const qtyBefore = stock.quantite_disponible;
        const usedBefore = stock.quantite_utilisee;
        
        // Return to available
        stock.quantite_disponible += quantityUsed;
        stock.quantite_utilisee -= quantityUsed;
        
        // Ensure no negative used
        if (stock.quantite_utilisee < 0) stock.quantite_utilisee = 0;
        
        await stock.save({ session });
        
        // Create movement
        const movement = new StockMovement({
            stockId: stock._id,
            clientId: stock.clientId,
            storeId: stock.storeId,
            colisId: colis._id,
            type: 'RETURN',
            quantity: quantityUsed,
            quantityBefore: qtyBefore,
            quantityAfter: stock.quantite_disponible,
            usedBefore: usedBefore,
            usedAfter: stock.quantite_utilisee,
            reason: `Returned from colis ${colis.code_suivi}`,
            performedBy: userId,
            performedByModel: userRole === 'admin' ? 'Admin' : 'System',
            performedByRole: userRole || 'system',
            referenceData: {
                colisCode: colis.code_suivi,
                productName: stock.productName,
                variantName: stock.variantName,
                sku: stock.sku
            }
        });
        
        await movement.save({ session });
        
        // Update colis produit
        produit.stockDeducted = false;
        
        // Re-check alerts
        await checkStockAlerts(stock, session);
    }
}

/**
 * @desc    Check and create stock alerts if needed
 * @param   {Object} stock - Stock object
 * @param   {Session} session - MongoDB session
 */
async function checkStockAlerts(stock, session) {
    // Check if low stock alert needed
    if (stock.quantite_disponible < stock.quantite_minimum && stock.quantite_disponible > 0) {
        // Check if alert already exists
        const existingAlert = await StockAlert.findOne({
            stockId: stock._id,
            type: 'LOW_STOCK',
            isResolved: false
        }).session(session);
        
        if (!existingAlert) {
            const alert = new StockAlert({
                stockId: stock._id,
                clientId: stock.clientId,
                storeId: stock.storeId,
                type: 'LOW_STOCK',
                severity: 'warning',
                title: 'Low Stock Warning',
                message: `${stock.productName} (${stock.sku}) is below minimum threshold`,
                stockSnapshot: {
                    sku: stock.sku,
                    productName: stock.productName,
                    variantName: stock.variantName,
                    quantite_disponible: stock.quantite_disponible,
                    quantite_minimum: stock.quantite_minimum,
                    status: stock.status
                },
                currentQuantity: stock.quantite_disponible,
                threshold: stock.quantite_minimum
            });
            
            await alert.save({ session });
        }
    }
    
    // Check if out of stock alert needed
    if (stock.quantite_disponible === 0) {
        const existingAlert = await StockAlert.findOne({
            stockId: stock._id,
            type: 'OUT_OF_STOCK',
            isResolved: false
        }).session(session);
        
        if (!existingAlert) {
            const alert = new StockAlert({
                stockId: stock._id,
                clientId: stock.clientId,
                storeId: stock.storeId,
                type: 'OUT_OF_STOCK',
                severity: 'critical',
                title: 'Out of Stock',
                message: `${stock.productName} (${stock.sku}) is out of stock`,
                stockSnapshot: {
                    sku: stock.sku,
                    productName: stock.productName,
                    variantName: stock.variantName,
                    quantite_disponible: 0,
                    status: 'depleted'
                },
                currentQuantity: 0,
                isUrgent: true
            });
            
            await alert.save({ session });
        }
    }
    
    // Auto-resolve alerts if stock is back to normal
    if (stock.quantite_disponible >= stock.quantite_minimum) {
        await StockAlert.updateMany(
            {
                stockId: stock._id,
                type: { $in: ['LOW_STOCK', 'OUT_OF_STOCK'] },
                isResolved: false,
                autoDismiss: true
            },
            {
                $set: {
                    isResolved: true,
                    resolvedAt: new Date(),
                    resolutionAction: 'AUTO_RESOLVED',
                    autoDismissedAt: new Date()
                }
            }
        ).session(session);
    }
}

/**
 * @desc    Validate stock availability before creating colis
 * @param   {Array} produits - Products array
 * @returns {Object} Validation result
 */
async function validateStockAvailability(produits) {
    const errors = [];
    
    for (const produit of produits) {
        if (!produit.usesStock || !produit.stockId) {
            continue;
        }
        
        const stock = await Stock.findById(produit.stockId);
        
        if (!stock) {
            errors.push({
                stockId: produit.stockId,
                error: 'Stock not found'
            });
            continue;
        }
        
        if (stock.status !== 'active') {
            errors.push({
                stockId: produit.stockId,
                sku: stock.sku,
                productName: stock.productName,
                error: `Stock is not active (status: ${stock.status})`
            });
            continue;
        }
        
        const quantityNeeded = produit.quantityUsed || 1;
        
        if (stock.quantite_disponible < quantityNeeded) {
            errors.push({
                stockId: produit.stockId,
                sku: stock.sku,
                productName: stock.productName,
                available: stock.quantite_disponible,
                requested: quantityNeeded,
                error: 'Insufficient stock'
            });
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

module.exports = {
    reserveStockForColis,
    deductStockForDeliveredColis,
    releaseStockForCancelledColis,
    returnStockFromColis,
    checkStockAlerts,
    validateStockAvailability
};

