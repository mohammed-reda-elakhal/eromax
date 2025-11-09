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
    correctTransfer,
    createManualDeposit,
    createManualWithdrawal
} = require('../Controllers/TransferController');
const { verifyToken, verifyTokenAndAdmin } = require('../Middlewares/VerifyToken');

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

// Route to cancel a transfer (admin only)
router.put('/cancel/:transferId', verifyTokenAndAdmin, cancelTransfer);

// Route to validate a transfer (admin only)
router.put('/validate/:transferId', verifyTokenAndAdmin, validateTransferStatus);

// Route to correct a transfer (admin only)
router.put('/correct/:transferId', verifyTokenAndAdmin, correctTransfer);

// Routes for manual transfers (admin only)
router.post('/manuel-depot', verifyTokenAndAdmin, createManualDeposit);
router.post('/manuel-withdrawal', verifyTokenAndAdmin, createManualWithdrawal);

module.exports = router;