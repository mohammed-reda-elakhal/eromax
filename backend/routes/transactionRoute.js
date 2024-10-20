
const express = require('express');
const router = express.Router();
const {createTransaction,getAllTransactions, getTransactionsByClient} = require('../Controllers/transactionController');

router.post('/',createTransaction);
router.get('/', getAllTransactions);
router.get('/client/:id_user', getTransactionsByClient);

module.exports = router;
