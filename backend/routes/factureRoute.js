const express = require('express');
const router = express.Router();
const {createFacturesForClientsAndLivreurs, getAllFacture, getFactureByCode, getFactureByClient, getFactureByLivreur} = require('../Controllers/factureController');


// /api/facture
router.route('/')
    .post(createFacturesForClientsAndLivreurs)
    .get(getAllFacture)

    router.get('/detail/:code_facture', getFactureByCode);
    router.get('/detail/:id_client',getFactureByClient);
    router.get('/detail/liv/:id_livreur',getFactureByLivreur);


module.exports = router;