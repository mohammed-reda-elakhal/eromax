const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const { Stock, validateStock, validateStockUpdate } = require("../Models/Stock");
const { StockMovement } = require("../Models/StockMovement");
const { StockAlert } = require("../Models/StockAlert");
const { Client } = require("../Models/Client");
const { Store } = require("../Models/Store");
const { getClientId, getStoreId } = require("../Middlewares/stockAccessMiddleware");

/**
 * ============================================================
 * CLIENT ENDPOINTS
 * ============================================================
 */

/**
 * @desc    Create new stock (Client/Team)
 * @route   POST /api/stock/create
 * @access  Private (Client/Team with stock_management access)
 */
const createStockClient = asyncHandler(async (req, res) => {
    // Validate input
    const { error } = validateStock(req.body);
    if (error) {
        return res.status(400).json({ 
            message: error.details[0].message 
        });
    }

    const session = await mongoose.startSession();
    
    try {
        await session.withTransaction(async () => {
            // Get client and store IDs
            const clientId = await getClientId(req);
            const storeId = getStoreId(req) || req.body.storeId;

            if (!clientId || !storeId) {
                throw new Error("Client ID or Store ID not found");
            }

            // Auto-generate SKU if not provided
            let finalSKU = req.body.sku;
            if (!finalSKU) {
                const cleaned = req.body.productName.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10);
                const random = Math.random().toString(36).substring(2, 8).toUpperCase();
                const timestamp = Date.now().toString().slice(-4);
                finalSKU = `${cleaned}-${random}${timestamp}`;
                console.log('[Stock Controller] Auto-generated SKU:', finalSKU);
            } else {
                finalSKU = finalSKU.toUpperCase();
            }
            
            // Check if SKU already exists for this client
            const existingSKU = await Stock.findOne({ 
                clientId, 
                sku: finalSKU,
                isDeleted: false
            }).session(session);

            if (existingSKU) {
                throw new Error(`SKU "${finalSKU}" already exists in your inventory`);
            }

            // Prepare stock data with defaults
            const stockData = {
                clientId,
                storeId,
                productName: req.body.productName,
                sku: finalSKU,
                quantite_initial: req.body.quantite_initial,
                quantite_disponible: 0, // Not available until approved
                quantite_reservee: 0,
                quantite_minimum: req.body.quantite_minimum || 10,
                unitCost: req.body.unitCost || 0,
                unitPrice: req.body.unitPrice,
                category: req.body.category || '',
                location: req.body.location || 'siege',
                productDescription: req.body.productDescription || '',
                hasVariants: false, // Always false for simplified version
                variantName: null,
                clientNotes: req.body.clientNotes || '',
                status: 'pending', // Always pending for client-created stock
                submittedBy: req.user.id,
                submittedAt: new Date(),
                createdBy: req.user.id,
                createdByModel: req.user.role === 'client' ? 'Client' : 'Team'
            };

            // Create stock
            const newStock = new Stock(stockData);
            const savedStock = await newStock.save({ session });

            // Create initial movement record
            const movement = new StockMovement({
                stockId: savedStock._id,
                clientId,
                storeId,
                type: 'INITIAL',
                quantity: req.body.quantite_initial,
                quantityBefore: 0,
                quantityAfter: 0, // Still 0 until approved
                reason: 'Stock item created and submitted for approval',
                notes: req.body.clientNotes || '',
                performedBy: req.user.id,
                performedByModel: stockData.createdByModel,
                performedByRole: req.user.role,
                performedByName: `${req.user.nom || ''} ${req.user.prenom || ''}`.trim(),
                referenceData: {
                    productName: savedStock.productName,
                    variantName: savedStock.variantName,
                    sku: savedStock.sku
                }
            });
            await movement.save({ session });

            // Create alert for admin (pending approval)
            const alert = new StockAlert({
                stockId: savedStock._id,
                clientId,
                storeId,
                type: 'PENDING_APPROVAL',
                severity: 'info',
                title: 'New Stock Awaiting Approval',
                message: `${savedStock.productName} (${savedStock.sku}) - ${savedStock.quantite_initial} units`,
                stockSnapshot: {
                    sku: savedStock.sku,
                    productName: savedStock.productName,
                    variantName: savedStock.variantName,
                    quantite_disponible: 0,
                    quantite_minimum: savedStock.quantite_minimum,
                    status: 'pending'
                },
                currentQuantity: savedStock.quantite_initial
            });
            await alert.save({ session });

            // Populate references
            await savedStock.populate('clientId', 'nom prenom email');
            await savedStock.populate('storeId', 'storeName');

            res.status(201).json({
                success: true,
                message: 'Stock created successfully and submitted for admin approval',
                stock: savedStock,
                movement: movement,
                alert: alert,
                note: 'Stock will be available for use once approved by admin'
            });
        });

        await session.endSession();

    } catch (error) {
        await session.endSession();
        console.error("Error creating stock:", error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Error creating stock' 
        });
    }
});

/**
 * @desc    Get my stocks (Client/Team)
 * @route   GET /api/stock/my-stocks
 * @access  Private (Client/Team with stock_management access)
 */
const getMyStocks = asyncHandler(async (req, res) => {
    try {
        const clientId = await getClientId(req);
        
        if (!clientId) {
            return res.status(400).json({ message: "Client ID not found" });
        }

        // Parse query parameters
        const { 
            status, 
            search, 
            page = 1, 
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        const query = { 
            clientId,
            isDeleted: false
        };

        if (status) {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { sku: { $regex: search, $options: 'i' } },
                { productName: { $regex: search, $options: 'i' } },
                { variantName: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        // Execute query
        const stocks = await Stock.find(query)
            .sort(sortOptions)
            .limit(parseInt(limit))
            .skip(skip)
            .populate('storeId', 'storeName stock_location')
            .populate('submittedBy', 'nom prenom')
            .populate('reviewedBy', 'nom prenom')
            .lean();

        // Get total count
        const total = await Stock.countDocuments(query);

        // Add calculated fields
        const stocksWithCalc = stocks.map(stock => ({
            ...stock,
            quantite_totale: stock.quantite_disponible + stock.quantite_reservee,
            isLowStock: stock.quantite_disponible < stock.quantite_minimum && stock.quantite_disponible > 0,
            isOutOfStock: stock.quantite_disponible === 0
        }));

        res.status(200).json({
            success: true,
            data: stocksWithCalc,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error("Error fetching stocks:", error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching stocks',
            error: error.message 
        });
    }
});

/**
 * @desc    Get available stocks for colis creation
 * @route   GET /api/stock/available-for-colis
 * @access  Private (Client/Team with stock_management access)
 */
const getAvailableStocksForColis = asyncHandler(async (req, res) => {
    try {
        const { storeId, search } = req.query;
        
        console.log('[Get Available Stocks] Request from:', req.user.role);
        console.log('[Get Available Stocks] StoreId param:', storeId);

        let clientId;
        
        // For admin: get clientId from the provided store
        if (req.user.role === 'admin' && storeId) {
            const store = await Store.findById(storeId).select('id_client');
            if (!store) {
                return res.status(404).json({ 
                    success: false,
                    message: "Store not found" 
                });
            }
            clientId = store.id_client;
            console.log('[Get Available Stocks] Admin accessing store, clientId:', clientId);
        } else {
            // For client/team: use their own clientId
            clientId = await getClientId(req);
            console.log('[Get Available Stocks] Client/Team, clientId:', clientId);
        }

        if (!clientId) {
            return res.status(400).json({ 
                success: false,
                message: "Client ID not found" 
            });
        }

        // Build query - only active stocks with available quantity
        const query = {
            clientId,
            status: 'active',
            quantite_disponible: { $gt: 0 },
            isDeleted: false
        };

        if (storeId) {
            query.storeId = storeId;
        }

        if (search) {
            query.$or = [
                { sku: { $regex: search, $options: 'i' } },
                { productName: { $regex: search, $options: 'i' } },
                { variantName: { $regex: search, $options: 'i' } }
            ];
        }

        console.log('[Get Available Stocks] Query:', JSON.stringify(query));

        const stocks = await Stock.find(query)
            .sort({ productName: 1 })
            .select('sku productName variantName quantite_disponible quantite_minimum unitPrice')
            .lean();

        console.log('[Get Available Stocks] Found stocks count:', stocks.length);

        // Format for dropdown/selector
        const formattedStocks = stocks.map(stock => ({
            value: stock._id,
            label: `${stock.productName}${stock.variantName ? ' - ' + stock.variantName : ''} (${stock.sku})`,
            sku: stock.sku,
            productName: stock.productName,
            variantName: stock.variantName,
            available: stock.quantite_disponible,
            isLow: stock.quantite_disponible < stock.quantite_minimum,
            unitPrice: stock.unitPrice
        }));

        res.status(200).json({
            success: true,
            count: formattedStocks.length,
            stocks: formattedStocks,
            debug: {
                clientId: clientId.toString(),
                storeId: storeId || 'none',
                userRole: req.user.role
            }
        });

    } catch (error) {
        console.error("Error fetching available stocks:", error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching available stocks',
            error: error.message 
        });
    }
});

/**
 * @desc    Get stock detail by ID
 * @route   GET /api/stock/:stockId
 * @access  Private (Client/Team - own stock only)
 */
const getStockDetail = asyncHandler(async (req, res) => {
    try {
        // Stock already attached by checkStockOwnership middleware
        const stock = req.stock;

        // Get recent movements
        const movements = await StockMovement.find({ stockId: stock._id })
            .sort({ date: -1 })
            .limit(10)
            .populate('performedBy', 'nom prenom')
            .populate('colisId', 'code_suivi statut');

        // Get unresolved alerts
        const alerts = await StockAlert.find({ 
            stockId: stock._id,
            isResolved: false 
        }).sort({ createdAt: -1 });

        // Populate references in stock
        await stock.populate('storeId', 'storeName stock_location');
        await stock.populate('submittedBy', 'nom prenom');
        await stock.populate('reviewedBy', 'nom prenom');

        res.status(200).json({
            success: true,
            stock,
            recentMovements: movements,
            unresolvedAlerts: alerts,
            calculated: {
                quantite_totale: stock.quantite_disponible + stock.quantite_reservee,
                isLowStock: stock.quantite_disponible < stock.quantite_minimum && stock.quantite_disponible > 0,
                isOutOfStock: stock.quantite_disponible === 0
            }
        });

    } catch (error) {
        console.error("Error fetching stock detail:", error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching stock detail',
            error: error.message 
        });
    }
});

/**
 * @desc    Get my stock movements
 * @route   GET /api/stock/my-movements
 * @access  Private (Client/Team with stock_management access)
 */
const getMyStockMovements = asyncHandler(async (req, res) => {
    try {
        const clientId = await getClientId(req);
        
        const { 
            stockId, 
            type, 
            startDate, 
            endDate,
            page = 1,
            limit = 50
        } = req.query;

        // Build query
        const query = { clientId };

        if (stockId) query.stockId = stockId;
        if (type) query.type = type;
        
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const movements = await StockMovement.find(query)
            .sort({ date: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .populate('stockId', 'sku productName variantName')
            .populate('performedBy', 'nom prenom')
            .populate('colisId', 'code_suivi statut');

        const total = await StockMovement.countDocuments(query);

        res.status(200).json({
            success: true,
            data: movements,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error("Error fetching movements:", error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching stock movements',
            error: error.message 
        });
    }
});

/**
 * @desc    Update stock info (limited fields)
 * @route   PUT /api/stock/:stockId/info
 * @access  Private (Client/Team - own stock only)
 */
const updateStockInfo = asyncHandler(async (req, res) => {
    try {
        const { error } = validateStockUpdate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const stock = req.stock; // From middleware

        // Update allowed fields only
        const allowedFields = [
            'productName', 'productDescription', 'variantName',
            'category', 'tags', 'clientNotes', 'quantite_minimum'
        ];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                stock[field] = req.body[field];
            }
        });

        stock.updatedBy = req.user.id;
        stock.updatedByModel = req.user.role === 'client' ? 'Client' : 'Team';

        await stock.save();

        res.status(200).json({
            success: true,
            message: 'Stock information updated successfully',
            stock
        });

    } catch (error) {
        console.error("Error updating stock:", error);
        res.status(500).json({ 
            success: false,
            message: 'Error updating stock',
            error: error.message 
        });
    }
});

/**
 * @desc    Request restock (notify admin)
 * @route   POST /api/stock/:stockId/request-restock
 * @access  Private (Client/Team - own stock only)
 */
const requestRestock = asyncHandler(async (req, res) => {
    try {
        const stock = req.stock;
        const { quantity, notes, urgency = 'normal' } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ 
                message: 'Valid quantity is required' 
            });
        }

        // Create alert for admin
        const alert = new StockAlert({
            stockId: stock._id,
            clientId: stock.clientId,
            storeId: stock.storeId,
            type: 'RESTOCK_NEEDED',
            severity: urgency === 'urgent' ? 'warning' : 'info',
            title: 'Restock Request',
            message: `Client requests ${quantity} units of ${stock.productName} (${stock.sku}). ${notes || ''}`,
            stockSnapshot: {
                sku: stock.sku,
                productName: stock.productName,
                variantName: stock.variantName,
                quantite_disponible: stock.quantite_disponible,
                quantite_minimum: stock.quantite_minimum,
                status: stock.status
            },
            currentQuantity: stock.quantite_disponible,
            isUrgent: urgency === 'urgent'
        });

        await alert.save();

        res.status(200).json({
            success: true,
            message: 'Restock request sent to administrator',
            alert
        });

    } catch (error) {
        console.error("Error requesting restock:", error);
        res.status(500).json({ 
            success: false,
            message: 'Error sending restock request',
            error: error.message 
        });
    }
});

/**
 * ============================================================
 * ADMIN ENDPOINTS
 * ============================================================
 */

/**
 * @desc    Get all pending stocks (Admin)
 * @route   GET /api/stock/admin/pending
 * @access  Private (Admin only)
 */
const getAllPendingStocks = asyncHandler(async (req, res) => {
    try {
        const { 
            clientId, 
            page = 1, 
            limit = 20,
            sortBy = 'submittedAt',
            sortOrder = 'desc'
        } = req.query;

        const query = { 
            status: 'pending',
            isDeleted: false
        };

        if (clientId) {
            query.clientId = clientId;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const stocks = await Stock.find(query)
            .sort(sortOptions)
            .limit(parseInt(limit))
            .skip(skip)
            .populate('clientId', 'nom prenom email')
            .populate('storeId', 'storeName')
            .populate('submittedBy', 'nom prenom');

        const total = await Stock.countDocuments(query);

        res.status(200).json({
            success: true,
            data: stocks,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error("Error fetching pending stocks:", error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching pending stocks',
            error: error.message 
        });
    }
});

/**
 * @desc    Approve stock (Admin)
 * @route   POST /api/stock/admin/:stockId/approve
 * @access  Private (Admin only)
 */
const approveStock = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    
    try {
        await session.withTransaction(async () => {
            const { stockId } = req.params;
            const { confirmationNotes, dateReceived, actualQuantity, location } = req.body;

            const stock = await Stock.findById(stockId).session(session);

            if (!stock) {
                throw new Error('Stock not found');
            }

            if (stock.status !== 'pending') {
                throw new Error(`Stock is not pending approval (current status: ${stock.status})`);
            }

            // Update actual quantity if provided
            const finalQuantity = actualQuantity || stock.quantite_initial;

            // Update stock
            stock.status = 'confirmed'; // Will auto-become 'active' via pre-save hook
            stock.quantite_initial = finalQuantity;
            stock.quantite_disponible = finalQuantity;
            stock.reviewedBy = req.user.id;
            stock.reviewedAt = new Date();
            stock.dateReceived = dateReceived || new Date();
            stock.confirmationNotes = confirmationNotes || '';
            if (location) stock.location = location;

            await stock.save({ session });

            // Create movement
            const movement = new StockMovement({
                stockId: stock._id,
                clientId: stock.clientId,
                storeId: stock.storeId,
                type: 'CONFIRMED',
                quantity: finalQuantity,
                quantityBefore: 0,
                quantityAfter: finalQuantity,
                reason: 'Stock approved by admin and activated',
                notes: confirmationNotes || '',
                performedBy: req.user.id,
                performedByModel: 'Admin',
                performedByRole: 'admin',
                performedByName: `${req.user.nom || ''} ${req.user.prenom || ''}`.trim(),
                referenceData: {
                    productName: stock.productName,
                    variantName: stock.variantName,
                    sku: stock.sku
                }
            });
            await movement.save({ session });

            // Resolve pending approval alert
            await StockAlert.updateMany(
                { 
                    stockId: stock._id, 
                    type: 'PENDING_APPROVAL',
                    isResolved: false
                },
                {
                    $set: {
                        isResolved: true,
                        resolvedBy: req.user.id,
                        resolvedByModel: 'Admin',
                        resolvedAt: new Date(),
                        resolutionAction: 'APPROVED'
                    }
                }
            ).session(session);

            // Create approval alert for client
            const clientAlert = new StockAlert({
                stockId: stock._id,
                clientId: stock.clientId,
                storeId: stock.storeId,
                type: 'STOCK_APPROVED',
                severity: 'info',
                title: 'Stock Approved',
                message: `Your stock ${stock.productName} (${stock.sku}) has been approved and is now available`,
                stockSnapshot: {
                    sku: stock.sku,
                    productName: stock.productName,
                    variantName: stock.variantName,
                    quantite_disponible: finalQuantity,
                    status: 'active'
                },
                currentQuantity: finalQuantity
            });
            await clientAlert.save({ session });

            await stock.populate('clientId', 'nom prenom email');
            await stock.populate('storeId', 'storeName');

            res.status(200).json({
                success: true,
                message: 'Stock approved successfully',
                stock,
                movement
            });
        });

        await session.endSession();

    } catch (error) {
        await session.endSession();
        console.error("Error approving stock:", error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Error approving stock'
        });
    }
});

/**
 * @desc    Reject stock (Admin)
 * @route   POST /api/stock/admin/:stockId/reject
 * @access  Private (Admin only)
 */
const rejectStock = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    
    try {
        await session.withTransaction(async () => {
            const { stockId } = req.params;
            const { rejectionReason } = req.body;

            if (!rejectionReason || rejectionReason.trim() === '') {
                throw new Error('Rejection reason is required');
            }

            const stock = await Stock.findById(stockId).session(session);

            if (!stock) {
                throw new Error('Stock not found');
            }

            if (stock.status !== 'pending') {
                throw new Error(`Stock is not pending approval (current status: ${stock.status})`);
            }

            // Update stock
            stock.status = 'rejected';
            stock.reviewedBy = req.user.id;
            stock.reviewedAt = new Date();
            stock.rejectionReason = rejectionReason;

            await stock.save({ session });

            // Create movement
            const movement = new StockMovement({
                stockId: stock._id,
                clientId: stock.clientId,
                storeId: stock.storeId,
                type: 'REJECTED',
                quantity: 0,
                quantityBefore: 0,
                quantityAfter: 0,
                reason: `Stock rejected by admin: ${rejectionReason}`,
                performedBy: req.user.id,
                performedByModel: 'Admin',
                performedByRole: 'admin',
                performedByName: `${req.user.nom || ''} ${req.user.prenom || ''}`.trim(),
                referenceData: {
                    productName: stock.productName,
                    variantName: stock.variantName,
                    sku: stock.sku
                }
            });
            await movement.save({ session });

            // Resolve pending approval alert
            await StockAlert.updateMany(
                { 
                    stockId: stock._id, 
                    type: 'PENDING_APPROVAL',
                    isResolved: false
                },
                {
                    $set: {
                        isResolved: true,
                        resolvedBy: req.user.id,
                        resolvedByModel: 'Admin',
                        resolvedAt: new Date(),
                        resolutionAction: 'REJECTED'
                    }
                }
            ).session(session);

            // Create rejection alert for client
            const clientAlert = new StockAlert({
                stockId: stock._id,
                clientId: stock.clientId,
                storeId: stock.storeId,
                type: 'STOCK_REJECTED',
                severity: 'warning',
                title: 'Stock Rejected',
                message: `Your stock ${stock.productName} (${stock.sku}) was rejected: ${rejectionReason}`,
                stockSnapshot: {
                    sku: stock.sku,
                    productName: stock.productName,
                    variantName: stock.variantName,
                    status: 'rejected'
                }
            });
            await clientAlert.save({ session });

            res.status(200).json({
                success: true,
                message: 'Stock rejected',
                stock,
                movement
            });
        });

        await session.endSession();

    } catch (error) {
        await session.endSession();
        console.error("Error rejecting stock:", error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Error rejecting stock'
        });
    }
});

/**
 * @desc    Get all stocks (Admin)
 * @route   GET /api/stock/admin/all
 * @access  Private (Admin only)
 */
const getAllStocksAdmin = asyncHandler(async (req, res) => {
    try {
        const { 
            clientId, 
            storeId,
            status, 
            search,
            page = 1, 
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = { isDeleted: false };

        if (clientId) query.clientId = clientId;
        if (storeId) query.storeId = storeId;
        if (status) query.status = status;

        if (search) {
            query.$or = [
                { sku: { $regex: search, $options: 'i' } },
                { productName: { $regex: search, $options: 'i' } },
                { variantName: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const stocks = await Stock.find(query)
            .sort(sortOptions)
            .limit(parseInt(limit))
            .skip(skip)
            .populate('clientId', 'nom prenom email')
            .populate('storeId', 'storeName')
            .populate('reviewedBy', 'nom prenom');

        const total = await Stock.countDocuments(query);

        // Get statistics
        const stats = await Stock.aggregate([
            { $match: { isDeleted: false } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: stocks,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            },
            stats
        });

    } catch (error) {
        console.error("Error fetching all stocks:", error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching stocks',
            error: error.message 
        });
    }
});

/**
 * @desc    Adjust stock quantity (Admin)
 * @route   POST /api/stock/admin/:stockId/adjust
 * @access  Private (Admin only)
 */
const adjustStockQuantity = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    
    try {
        await session.withTransaction(async () => {
            const { stockId } = req.params;
            const { quantityChange, reason, notes } = req.body;

            if (!quantityChange || quantityChange === 0) {
                throw new Error('Quantity change must be non-zero');
            }

            if (!reason) {
                throw new Error('Reason for adjustment is required');
            }

            const stock = await Stock.findById(stockId).session(session);

            if (!stock) {
                throw new Error('Stock not found');
            }

            if (stock.status !== 'active') {
                throw new Error('Can only adjust active stock');
            }

            const qtyBefore = stock.quantite_disponible;
            const newQty = qtyBefore + quantityChange;

            if (newQty < 0) {
                throw new Error('Cannot reduce quantity below zero');
            }

            // Update stock
            stock.quantite_disponible = newQty;
            stock.quantite_initial += quantityChange; // Update initial too

            if (quantityChange > 0) {
                stock.lastRestockDate = new Date();
            }

            await stock.save({ session });

            // Create movement
            const movement = new StockMovement({
                stockId: stock._id,
                clientId: stock.clientId,
                storeId: stock.storeId,
                type: quantityChange > 0 ? 'IN' : 'ADJUSTMENT',
                quantity: quantityChange,
                quantityBefore: qtyBefore,
                quantityAfter: newQty,
                reason,
                notes: notes || '',
                performedBy: req.user.id,
                performedByModel: 'Admin',
                performedByRole: 'admin',
                performedByName: `${req.user.nom || ''} ${req.user.prenom || ''}`.trim(),
                referenceData: {
                    productName: stock.productName,
                    variantName: stock.variantName,
                    sku: stock.sku
                }
            });
            await movement.save({ session });

            // Check for alerts
            if (newQty < stock.quantite_minimum && newQty > 0) {
                // Create low stock alert
                const alert = new StockAlert({
                    stockId: stock._id,
                    clientId: stock.clientId,
                    storeId: stock.storeId,
                    type: 'LOW_STOCK',
                    severity: 'warning',
                    title: 'Low Stock Alert',
                    message: `${stock.productName} (${stock.sku}) is below minimum threshold`,
                    stockSnapshot: {
                        sku: stock.sku,
                        productName: stock.productName,
                        variantName: stock.variantName,
                        quantite_disponible: newQty,
                        quantite_minimum: stock.quantite_minimum,
                        status: stock.status
                    },
                    currentQuantity: newQty,
                    threshold: stock.quantite_minimum
                });
                await alert.save({ session });
            } else if (newQty === 0) {
                // Create out of stock alert
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
                    currentQuantity: 0
                });
                await alert.save({ session });
            }

            res.status(200).json({
                success: true,
                message: 'Stock quantity adjusted successfully',
                stock,
                movement,
                change: {
                    before: qtyBefore,
                    after: newQty,
                    difference: quantityChange
                }
            });
        });

        await session.endSession();

    } catch (error) {
        await session.endSession();
        console.error("Error adjusting stock:", error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Error adjusting stock quantity'
        });
    }
});

/**
 * @desc    Create stock for client (Admin)
 * @route   POST /api/stock/admin/create
 * @access  Private (Admin only)
 */
const createStockAdmin = asyncHandler(async (req, res) => {
    const { error } = validateStock(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const session = await mongoose.startSession();
    
    try {
        await session.withTransaction(async () => {
            const { clientId, storeId } = req.body;

            // Check if SKU exists for this client
            const existingSKU = await Stock.findOne({ 
                clientId, 
                sku: req.body.sku.toUpperCase(),
                isDeleted: false
            }).session(session);

            if (existingSKU) {
                throw new Error(`SKU "${req.body.sku}" already exists for this client`);
            }

            // Create stock directly as active (admin bypass)
            const stockData = {
                ...req.body,
                sku: req.body.sku.toUpperCase(),
                status: 'active', // Admin created = directly active
                quantite_disponible: req.body.quantite_initial,
                submittedBy: req.user.id,
                submittedAt: new Date(),
                reviewedBy: req.user.id,
                reviewedAt: new Date(),
                dateReceived: new Date(),
                createdBy: req.user.id,
                createdByModel: 'Admin'
            };

            const newStock = new Stock(stockData);
            const savedStock = await newStock.save({ session });

            // Create movement
            const movement = new StockMovement({
                stockId: savedStock._id,
                clientId,
                storeId,
                type: 'INITIAL',
                quantity: req.body.quantite_initial,
                quantityBefore: 0,
                quantityAfter: req.body.quantite_initial,
                reason: 'Stock created by admin (auto-approved)',
                performedBy: req.user.id,
                performedByModel: 'Admin',
                performedByRole: 'admin',
                performedByName: `${req.user.nom || ''} ${req.user.prenom || ''}`.trim(),
                referenceData: {
                    productName: savedStock.productName,
                    variantName: savedStock.variantName,
                    sku: savedStock.sku
                }
            });
            await movement.save({ session });

            await savedStock.populate('clientId', 'nom prenom email');
            await savedStock.populate('storeId', 'storeName');

            res.status(201).json({
                success: true,
                message: 'Stock created successfully (admin bypass - directly active)',
                stock: savedStock,
                movement
            });
        });

        await session.endSession();

    } catch (error) {
        await session.endSession();
        console.error("Error creating stock:", error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Error creating stock'
        });
    }
});

/**
 * @desc    Delete stock (Admin - soft delete)
 * @route   DELETE /api/stock/admin/:stockId
 * @access  Private (Admin only)
 */
const deleteStock = asyncHandler(async (req, res) => {
    try {
        const { stockId } = req.params;
        const stock = await Stock.findById(stockId);

        if (!stock) {
            return res.status(404).json({ 
                success: false,
                message: 'Stock not found' 
            });
        }

        // Prevent deletion if stock has been used
        if (stock.quantite_utilisee > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Cannot delete stock that has been used in delivered colis',
                quantityUsed: stock.quantite_utilisee
            });
        }

        // Prevent deletion if stock is reserved
        if (stock.quantite_reservee > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Cannot delete stock with pending reservations',
                quantityReserved: stock.quantite_reservee
            });
        }

        // Soft delete
        stock.isDeleted = true;
        stock.deletedAt = new Date();
        stock.deletedBy = req.user.id;
        stock.status = 'inactive';

        await stock.save();

        res.status(200).json({
            success: true,
            message: 'Stock deleted successfully',
            stockId: stock._id
        });

    } catch (error) {
        console.error("Error deleting stock:", error);
        res.status(500).json({ 
            success: false,
            message: 'Error deleting stock',
            error: error.message 
        });
    }
});

/**
 * @desc    Get stock movements (Admin)
 * @route   GET /api/stock/admin/:stockId/movements
 * @access  Private (Admin only)
 */
const getStockMovements = asyncHandler(async (req, res) => {
    try {
        const { stockId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const movements = await StockMovement.find({ stockId })
            .sort({ date: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .populate('performedBy', 'nom prenom')
            .populate('colisId', 'code_suivi statut');

        const total = await StockMovement.countDocuments({ stockId });

        res.status(200).json({
            success: true,
            data: movements,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error("Error fetching movements:", error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching stock movements',
            error: error.message 
        });
    }
});

/**
 * @desc    Get low stock alerts (Admin)
 * @route   GET /api/stock/admin/alerts/low-stock
 * @access  Private (Admin only)
 */
const getLowStockAlerts = asyncHandler(async (req, res) => {
    try {
        // Find all active stocks that are low or out of stock
        const lowStocks = await Stock.find({
            status: 'active',
            isDeleted: false,
            $or: [
                { quantite_disponible: 0 },
                { $expr: { $lt: ['$quantite_disponible', '$quantite_minimum'] } }
            ]
        })
        .populate('clientId', 'nom prenom email')
        .populate('storeId', 'storeName')
        .sort({ quantite_disponible: 1 });

        // Categorize
        const outOfStock = lowStocks.filter(s => s.quantite_disponible === 0);
        const lowStock = lowStocks.filter(s => s.quantite_disponible > 0);

        res.status(200).json({
            success: true,
            summary: {
                total: lowStocks.length,
                outOfStock: outOfStock.length,
                lowStock: lowStock.length
            },
            outOfStock,
            lowStock
        });

    } catch (error) {
        console.error("Error fetching low stock alerts:", error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching low stock alerts',
            error: error.message 
        });
    }
});

/**
 * @desc    Update client stock access (Admin) - SIMPLIFIED
 * @route   PUT /api/stock/admin/client/:clientId/access
 * @access  Private (Admin only)
 */
const updateClientStockAccess = asyncHandler(async (req, res) => {
    try {
        const { clientId } = req.params;
        const { stock_management } = req.body; // Just true or false

        console.log('[Backend] Updating stock access for client:', clientId);
        console.log('[Backend] New value:', stock_management);

        const client = await Client.findById(clientId);

        if (!client) {
            return res.status(404).json({ 
                success: false,
                message: 'Client not found' 
            });
        }

        // Initialize features_access if it doesn't exist
        if (!client.features_access) {
            client.features_access = {};
        }

        // Initialize stock_config if it doesn't exist
        if (!client.stock_config) {
            client.stock_config = {
                require_admin_approval: true,
                low_stock_alert_threshold: 10,
                allow_negative_stock: false
            };
        }

        // Update just stock_management access
        client.features_access.stock_management = stock_management;

        await client.save();

        console.log('[Backend] Client updated successfully:', {
            _id: client._id,
            stock_management: client.features_access.stock_management
        });

        res.status(200).json({
            success: true,
            message: 'Client stock access updated successfully',
            client: {
                _id: client._id,
                nom: client.nom,
                prenom: client.prenom,
                email: client.email,
                features_access: client.features_access,
                stock_config: client.stock_config
            }
        });

    } catch (error) {
        console.error("[Backend] Error updating client access:", error);
        res.status(500).json({ 
            success: false,
            message: 'Error updating client stock access',
            error: error.message 
        });
    }
});

module.exports = {
    // Client endpoints
    createStockClient,
    getMyStocks,
    getAvailableStocksForColis,
    getStockDetail,
    getMyStockMovements,
    updateStockInfo,
    requestRestock,
    
    // Admin endpoints
    getAllPendingStocks,
    approveStock,
    rejectStock,
    getAllStocksAdmin,
    adjustStockQuantity,
    createStockAdmin,
    deleteStock,
    getStockMovements,
    getLowStockAlerts,
    updateClientStockAccess
};

