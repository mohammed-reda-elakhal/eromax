const { Client } = require("../Models/Client");
const { Store } = require("../Models/Store");
const asyncHandler = require("express-async-handler");

/**
 * ============================================================
 * STOCK ACCESS MIDDLEWARE
 * Handles access control for stock management features
 * ============================================================
 */

/**
 * @desc    Check if user has stock management access
 * @access  Middleware
 * @usage   Apply to routes that require stock management feature
 * 
 * Flow:
 * 1. Identify user role (admin/client/team)
 * 2. For admin: always grant access
 * 3. For client: check features_access.stock_management
 * 4. For team: check client's features_access through store
 */
const checkStockAccess = asyncHandler(async (req, res, next) => {
    try {
        // Admin always has access to stock management
        if (req.user.role === 'admin') {
            req.hasStockAccess = true;
            return next();
        }
        
        let client;
        
        // If user is a client
        if (req.user.role === 'client') {
            client = await Client.findById(req.user.id).select('features_access stock_config');
            
            if (!client) {
                return res.status(404).json({ 
                    message: "Client not found" 
                });
            }
        } 
        // If user is a team member
        else if (req.user.role === 'team') {
            // Team members inherit access from their store's client
            if (!req.user.store) {
                return res.status(400).json({ 
                    message: "Team member has no associated store" 
                });
            }
            
            const store = await Store.findById(req.user.store).populate('id_client', 'features_access stock_config');
            
            if (!store || !store.id_client) {
                return res.status(404).json({ 
                    message: "Store or client not found" 
                });
            }
            
            client = store.id_client;
            req.userStore = store; // Attach store to request for later use
        } 
        else {
            return res.status(403).json({ 
                message: "Invalid user role for stock management" 
            });
        }
        
        // Check if client has stock management access
        if (!client.features_access || !client.features_access.stock_management) {
            return res.status(403).json({ 
                success: false,
                message: "Stock management feature not enabled for your account. Please contact administrator.",
                feature: "stock_management",
                hasAccess: false
            });
        }
        
        // Attach client data and stock config to request for later use
        req.clientData = client;
        req.stockConfig = client.stock_config || {
            require_admin_approval: true,
            low_stock_alert_threshold: 10,
            allow_negative_stock: false
        };
        req.hasStockAccess = true;
        
        next();
        
    } catch (error) {
        console.error("Error in checkStockAccess middleware:", error);
        return res.status(500).json({ 
            message: "Error checking stock access",
            error: error.message 
        });
    }
});

/**
 * @desc    Check if user owns the stock item
 * @access  Middleware
 * @usage   Apply to routes that operate on specific stock items
 * 
 * Flow:
 * 1. Get stockId from params
 * 2. Fetch stock from database
 * 3. For admin: always grant access
 * 4. For client/team: verify ownership
 */
const checkStockOwnership = asyncHandler(async (req, res, next) => {
    try {
        const { Stock } = require("../Models/Stock");
        
        // Get stock ID from params (try common parameter names)
        const stockId = req.params.stockId || req.params.id;
        
        if (!stockId) {
            return res.status(400).json({ 
                message: "Stock ID is required" 
            });
        }
        
        // Fetch stock
        const stock = await Stock.findById(stockId);
        
        if (!stock) {
            return res.status(404).json({ 
                success: false,
                message: "Stock not found",
                stockId 
            });
        }
        
        // Check if stock is deleted
        if (stock.isDeleted) {
            return res.status(410).json({ 
                success: false,
                message: "Stock has been deleted",
                stockId 
            });
        }
        
        // Admin can access any stock
        if (req.user.role === 'admin') {
            req.stock = stock;
            return next();
        }
        
        // Get client ID based on user role
        let clientId;
        
        if (req.user.role === 'client') {
            clientId = req.user.id;
        } else if (req.user.role === 'team') {
            // For team members, get client ID from their store
            if (req.userStore) {
                // Store already fetched in checkStockAccess
                clientId = req.userStore.id_client.toString();
            } else {
                // Fetch store if not already available
                const store = await Store.findById(req.user.store);
                if (!store) {
                    return res.status(404).json({ 
                        message: "Store not found for team member" 
                    });
                }
                clientId = store.id_client.toString();
            }
        }
        
        // Verify ownership
        if (stock.clientId.toString() !== clientId.toString()) {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. You don't have permission to access this stock item.",
                stockId 
            });
        }
        
        // Attach stock to request for later use
        req.stock = stock;
        next();
        
    } catch (error) {
        console.error("Error in checkStockOwnership middleware:", error);
        
        // Handle invalid ObjectId
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                message: "Invalid stock ID format",
                error: error.message 
            });
        }
        
        return res.status(500).json({ 
            message: "Error checking stock ownership",
            error: error.message 
        });
    }
});

/**
 * @desc    Restrict route to admin only
 * @access  Middleware
 * @usage   Apply to admin-only routes
 */
const adminOnly = asyncHandler(async (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ 
            success: false,
            message: "Access denied. Admin privileges required.",
            requiredRole: "admin",
            currentRole: req.user?.role || "unknown"
        });
    }
    next();
});

/**
 * @desc    Check if client requires admin approval for stock
 * @access  Helper middleware
 * @usage   Used internally in stock creation logic
 */
const requiresAdminApproval = asyncHandler(async (req, res, next) => {
    // This middleware should be used after checkStockAccess
    // so req.stockConfig is available
    
    if (!req.stockConfig) {
        // Default to requiring approval if config not found
        req.requiresApproval = true;
    } else {
        req.requiresApproval = req.stockConfig.require_admin_approval;
        
        // Check auto-approve threshold if set
        if (req.stockConfig.auto_approve_threshold && req.body.quantite_initial) {
            if (req.body.quantite_initial <= req.stockConfig.auto_approve_threshold) {
                req.requiresApproval = false;
                req.autoApproved = true;
            }
        }
    }
    
    next();
});

/**
 * @desc    Check if negative stock is allowed
 * @access  Helper middleware
 * @usage   Used in colis creation with stock
 */
const allowNegativeStock = (req, res, next) => {
    req.allowNegativeStock = req.stockConfig?.allow_negative_stock || false;
    next();
};

/**
 * @desc    Get client ID regardless of user role
 * @access  Helper function
 * @returns Client ID
 */
const getClientId = async (req) => {
    if (req.user.role === 'client') {
        return req.user.id;
    } else if (req.user.role === 'team') {
        const store = await Store.findById(req.user.store);
        return store ? store.id_client : null;
    }
    return null;
};

/**
 * @desc    Get store ID for user
 * @access  Helper function
 * @returns Store ID
 */
const getStoreId = (req) => {
    if (req.user.role === 'team') {
        return req.user.store;
    } else if (req.user.role === 'client' && req.body.storeId) {
        return req.body.storeId;
    }
    return null;
};

module.exports = {
    checkStockAccess,
    checkStockOwnership,
    adminOnly,
    requiresAdminApproval,
    allowNegativeStock,
    getClientId,
    getStoreId
};

