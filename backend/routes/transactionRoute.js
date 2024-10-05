
const express = require('express');
const router = express.Router();
const {createTransaction,getAllTransactions} = require('../Controllers/transactionController');

router.post('/',createTransaction);
router.get('/', getAllTransactions);

module.exports = router;
