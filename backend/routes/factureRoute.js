const express = require('express');
const router = express.Router();
const {createFacturesForClientsAndLivreurs, getAllFacture, getFactureByCode} = require('../Controllers/factureController');


// /api/facture
router.route('/')
    .post(createFacturesForClientsAndLivreurs)
    .get(getAllFacture)

    router.get('/detail/:code_facture', getFactureByCode);

module.exports = router;