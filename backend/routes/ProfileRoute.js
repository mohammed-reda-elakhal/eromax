const express = require("express");
const router = express.Router();
const {
    getClientProfile,
    updateClientProfile,
    updateClientPassword,
    updateClientStore,
    getClientWallet,
    getClientPayments,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    getClientStats,
    getLivreurProfile,
    updateLivreurProfile,
    updateLivreurPassword,
    generateClientApiSecret,
    generateLivreurApiSecret,
    rotateClientApiSecret,
    rotateLivreurApiSecret,
    revokeClientApiSecret,
    revokeLivreurApiSecret,
    getAdminProfile,
    updateAdminProfile,
    updateAdminPassword
} = require("../Controllers/profileController");
const { verifyToken} = require("../Middlewares/VerifyToken"); 


// Import middleware for authentication (you'll need to create this or use existing)
// const { protect, authorize } = require("../Middlewares/authMiddleware");

// Client Profile Routes
// All routes are prefixed with /api/profile

// GET /api/profile/client/:id - Get complete client profile
router.get("/client/:id", getClientProfile);

// GET /api/profile/client/:id - Get complete client profile (for authenticated user)
router.get("/client", getClientProfile);

// PUT /api/profile/client/:id - Update client profile information
router.put("/client/:id", updateClientProfile);

// PUT /api/profile/client - Update client profile information (for authenticated user)
router.put("/client", updateClientProfile);

// PUT /api/profile/client/:id/password - Update client password
router.put("/client/:id/password", updateClientPassword);

// PUT /api/profile/client/password - Update client password (for authenticated user)
router.put("/client/password", updateClientPassword);

// PUT /api/profile/client/:id/store - Update client store information
router.put("/client/:id/store" , verifyToken , updateClientStore);

// PUT /api/profile/client/store - Update client store information (for authenticated user)
router.put("/client/store", updateClientStore);

// GET /api/profile/client/:id/wallet - Get client wallet information
router.get("/client/:id/wallet", getClientWallet);

// GET /api/profile/client/wallet - Get client wallet information (for authenticated user)
router.get("/client/wallet", getClientWallet);

// GET /api/profile/client/:id/payments - Get client payment methods
router.get("/client/:id/payments", getClientPayments);

// GET /api/profile/client/payments - Get client payment methods (for authenticated user)
router.get("/client/payments", getClientPayments);

// POST /api/profile/client/:id/payments - Add new payment method
router.post("/client/:id/payments", addPaymentMethod);

// POST /api/profile/client/payments - Add new payment method (for authenticated user)
router.post("/client/payments", addPaymentMethod);

// PUT /api/profile/client/:id/payments/:paymentId - Update payment method
router.put("/client/:id/payments/:paymentId", updatePaymentMethod);

// PUT /api/profile/client/payments/:paymentId - Update payment method (for authenticated user)
router.put("/client/payments/:paymentId", updatePaymentMethod);

// DELETE /api/profile/client/:id/payments/:paymentId - Delete payment method
router.delete("/client/:id/payments/:paymentId", deletePaymentMethod);

// DELETE /api/profile/client/payments/:paymentId - Delete payment method (for authenticated user)
router.delete("/client/payments/:paymentId", deletePaymentMethod);

// GET /api/profile/client/:id/stats - Get client statistics
router.get("/client/:id/stats", getClientStats);

// GET /api/profile/client/stats - Get client statistics (for authenticated user)
router.get("/client/stats", getClientStats);

// POST /api/profile/client/:id/api-secret - Generate API secret (self-serve)
router.post("/client/:id/api-secret", verifyToken, generateClientApiSecret);

// POST /api/profile/client/:id/api-secret/rotate - Rotate API secret (self-serve)
router.post("/client/:id/api-secret/rotate", verifyToken, rotateClientApiSecret);

// POST /api/profile/client/:id/api-secret/revoke - Revoke (delete) API secret (self-serve)
router.post("/client/:id/api-secret/revoke", verifyToken, revokeClientApiSecret);

// Livreur Profile Routes
// GET /api/profile/livreur/:id - Get complete livreur profile
router.get("/livreur/:id", getLivreurProfile);

// GET /api/profile/livreur - Get complete livreur profile (for authenticated user)
router.get("/livreur", getLivreurProfile);

// PUT /api/profile/livreur/:id - Update livreur profile information
router.put("/livreur/:id", updateLivreurProfile);

// PUT /api/profile/livreur - Update livreur profile information (for authenticated user)
router.put("/livreur", updateLivreurProfile);

// PUT /api/profile/livreur/:id/password - Update livreur password
router.put("/livreur/:id/password", updateLivreurPassword);

// PUT /api/profile/livreur/password - Update livreur password (for authenticated user)
router.put("/livreur/password", updateLivreurPassword);

// POST /api/profile/livreur/:id/api-secret - Generate API secret (self-serve)
router.post("/livreur/:id/api-secret", verifyToken, generateLivreurApiSecret);

// POST /api/profile/livreur/:id/api-secret/rotate - Rotate API secret (self-serve)
router.post("/livreur/:id/api-secret/rotate", verifyToken, rotateLivreurApiSecret);

// POST /api/profile/livreur/:id/api-secret/revoke - Revoke (delete) API secret (self-serve)
router.post("/livreur/:id/api-secret/revoke", verifyToken, revokeLivreurApiSecret);

// TODO: Add middleware for authentication and authorization
// Example of how to add middleware when ready:
// router.use(protect); // Protect all routes
// router.use(authorize('client')); // Authorize only clients

// Admin Profile Routes
// GET /api/profile/admin/:id - Get admin profile
router.get("/admin/:id", getAdminProfile);

// GET /api/profile/admin - Get admin profile (for authenticated user)
router.get("/admin", getAdminProfile);

// PUT /api/profile/admin/:id - Update admin profile
router.put("/admin/:id", updateAdminProfile);

// PUT /api/profile/admin - Update admin profile (for authenticated user)
router.put("/admin", updateAdminProfile);

// PUT /api/profile/admin/:id/password - Update admin password
router.put("/admin/:id/password", updateAdminPassword);

// PUT /api/profile/admin/password - Update admin password (for authenticated user)
router.put("/admin/password", updateAdminPassword);

module.exports = router;
