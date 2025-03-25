const express = require('express');
const router = express.Router();
const {
    createWalletsForStores,
    getWallet,
    getWalletByStore,
    toggleWalletActivation,
    depositMoney,
    withdrawMoney,
    resetWallet
} = require('../Controllers/WalletController');

// Route to create wallets for all stores that don't have one
router.post('/create', createWalletsForStores);

// Route to get wallet by store ID
router.get('/store/:storeId', getWalletByStore);

// Route to get wallet by ID or key
router.get('/:identifier', getWallet);

// Route to toggle wallet activation (using ID or key)
router.patch('/active/:identifier', toggleWalletActivation);

// Route for money operations (using ID or key)
router.post('/deposit/:identifier', depositMoney);
router.post('/withdraw/:identifier', withdrawMoney);

// Route to reset wallet to initial state (using ID or key)
router.post('/reset/:identifier', resetWallet);

module.exports = router; 