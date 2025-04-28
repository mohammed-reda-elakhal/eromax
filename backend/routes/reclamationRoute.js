const {
    createReclamation,
    getReclamations,
    getReclamationById,
    getReclamationsByStore,
    getReclamationsByColis,
    addMessage,
    updateReclamationStatus,
    reopenReclamation,
    deleteReclamation,
    markMessageAsRead,
    deleteMessage
} = require("../Controllers/reclamationController");

const {
    verifyToken,
    verifyTokenAndAdmin,
    verifyTokenAdminTeam,
    verifyTokenAndClient
} = require("../Middlewares/VerifyToken");
const router = require("express").Router();

// Base routes
router.route("/")
    .get(verifyToken, getReclamations)
    .post(verifyTokenAndClient, createReclamation);

// Routes for specific reclamation by ID
router.route("/:id")
    .get(verifyToken, getReclamationById)
    .delete(verifyTokenAdminTeam, deleteReclamation);

// Routes for reclamation status
router.route("/:id/status")
    .put(verifyTokenAdminTeam, updateReclamationStatus);

// Route to reopen a closed reclamation
router.route("/:id/reopen")
    .put(verifyTokenAdminTeam, reopenReclamation);

// Routes for messages
router.route("/:id/message")
    .post(verifyToken, addMessage);

// Routes for specific messages
router.route("/:id/message/:messageId/read")
    .put(verifyToken, markMessageAsRead);

// Route to delete a message
router.route("/:id/message/:messageId")
    .delete(verifyToken, deleteMessage);

// Routes to get reclamations by store
router.route("/store/:storeId")
    .get(verifyToken, getReclamationsByStore);

// Routes to get reclamations by colis
router.route("/colis/:colisId")
    .get(verifyToken, getReclamationsByColis);

module.exports = router;