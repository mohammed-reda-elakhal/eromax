const express = require("express");
const router = express.Router();

// Import controllers
const {
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
    updateClientStockAccess,
    updateStockInfoAdmin,
    setStockStatusAdmin
} = require("../Controllers/stockController");

// Import middleware
const { 
    checkStockAccess, 
    checkStockOwnership, 
    adminOnly 
} = require("../Middlewares/stockAccessMiddleware");

const { verifyToken } = require("../Middlewares/VerifyToken");

/**
 * ============================================================
 * CLIENT ROUTES
 * All routes require authentication + stock_management access
 * ============================================================
 */

// Create new stock (pending approval)
router.post(
    "/create", 
    verifyToken, 
    checkStockAccess, 
    createStockClient
);

// Get my stocks (list with pagination)
router.get(
    "/my-stocks", 
    verifyToken, 
    checkStockAccess, 
    getMyStocks
);

// Get available stocks for colis creation (admin can access any store)
router.get(
    "/available-for-colis", 
    verifyToken, 
    // checkStockAccess removed - admin can view any store's stock
    getAvailableStocksForColis
);

// Get my stock movements (history)
router.get(
    "/my-movements", 
    verifyToken, 
    checkStockAccess, 
    getMyStockMovements
);

// Get stock detail by ID (with ownership check)
router.get(
    "/:stockId", 
    verifyToken, 
    checkStockAccess, 
    checkStockOwnership, 
    getStockDetail
);

// Update stock information (limited fields, with ownership check)
router.put(
    "/:stockId/info", 
    verifyToken, 
    checkStockAccess, 
    checkStockOwnership, 
    updateStockInfo
);

// Request restock (notify admin, with ownership check)
router.post(
    "/:stockId/request-restock", 
    verifyToken, 
    checkStockAccess, 
    checkStockOwnership, 
    requestRestock
);

/**
 * ============================================================
 * ADMIN ROUTES
 * All routes require admin authentication
 * ============================================================
 */

// Get all pending stocks (awaiting approval)
router.get(
    "/admin/pending", 
    verifyToken, 
    adminOnly, 
    getAllPendingStocks
);

// Approve stock
router.post(
    "/admin/:stockId/approve", 
    verifyToken, 
    adminOnly, 
    approveStock
);

// Reject stock
router.post(
    "/admin/:stockId/reject", 
    verifyToken, 
    adminOnly, 
    rejectStock
);

// Get all stocks (all clients)
router.get(
    "/admin/all", 
    verifyToken, 
    adminOnly, 
    getAllStocksAdmin
);

// Adjust stock quantity manually
router.post(
    "/admin/:stockId/adjust", 
    verifyToken, 
    adminOnly, 
    adjustStockQuantity
);

// Create stock for client (bypass approval)
router.post(
    "/admin/create", 
    verifyToken, 
    adminOnly, 
    createStockAdmin
);

// Update stock info (admin)
router.put(
    "/admin/:stockId/info",
    verifyToken,
    adminOnly,
    updateStockInfoAdmin
);

// Set stock status (admin)
router.put(
    "/admin/:stockId/status",
    verifyToken,
    adminOnly,
    setStockStatusAdmin
);

// Delete stock (soft delete)
router.delete(
    "/admin/:stockId", 
    verifyToken, 
    adminOnly, 
    deleteStock
);

// Get stock movements (full history)
router.get(
    "/admin/:stockId/movements", 
    verifyToken, 
    adminOnly, 
    getStockMovements
);

// Get low stock alerts
router.get(
    "/admin/alerts/low-stock", 
    verifyToken, 
    adminOnly, 
    getLowStockAlerts
);

// Update client stock access & configuration
router.put(
    "/admin/client/:clientId/access", 
    verifyToken, 
    adminOnly, 
    updateClientStockAccess
);

module.exports = router;

