const express = require('express');
const router = express.Router();
const {
    createTransfer,
    getAllTransfers,
    getTransferById,
    getTransfersByWallet,
    getTransfersByColis,
    deleteTransfer,
    updateTransfer,
    cancelTransfer,
    validateTransferStatus,
    correctTransfer
} = require('../Controllers/TransferController');
const { verifyToken } = require('../Middlewares/VerifyToken');

// Create new transfer
router.post('/', createTransfer);

// Get all transfers
router.get('/' , verifyToken , getAllTransfers);

// Get transfer by ID
router.get('/:id', getTransferById);

// Get transfers by wallet
router.get('/wallet/:walletId', getTransfersByWallet);

// Get transfers by colis
router.get('/colis/:colisId', getTransfersByColis);

// Delete transfer
router.delete('/:id', deleteTransfer);

// Route to cancel a transfer
router.put('/cancel/:transferId', cancelTransfer);

// Route to validate a transfer
router.put('/validate/:transferId', validateTransferStatus);

// Route to correct a transfer
router.put('/correct/:transferId', correctTransfer);

module.exports = router; 