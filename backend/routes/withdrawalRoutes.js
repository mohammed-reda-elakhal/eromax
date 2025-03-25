const router = require('express').Router();
const { 
    createWithdrawal, 
    getAllWithdrawals, 
    getWithdrawalsByWalletId, 
    getWithdrawalsByWalletKey,
    getWithdrawalsByStoreId,
    getWithdrawalById,
    updateWithdrawalStatus,
    getWithdrawalsByStatus
} = require('../Controllers/withdrawalController');
const photoUpload = require('../Middlewares/photoUpload');
const { verifyToken } = require('../Middlewares/VerifyToken');

// Create a new withdrawal
router.post('/', photoUpload.single('verment_preuve'), createWithdrawal);

// Get all withdrawals
router.get('/', verifyToken , getAllWithdrawals);

// Get withdrawal by ID
router.get('/:id', getWithdrawalById);

// Get withdrawals by status
router.get('/status/:status', getWithdrawalsByStatus);

// Get withdrawals by wallet ID
router.get('/wallet/:walletId', getWithdrawalsByWalletId);

// Get withdrawals by wallet key
router.get('/wallet-key/:key', getWithdrawalsByWalletKey);

// Get withdrawals by store ID
router.get('/store/:storeId', getWithdrawalsByStoreId);

// Update withdrawal status
router.patch('/:id/status', photoUpload.single('verment_preuve'), updateWithdrawalStatus);

module.exports = router;