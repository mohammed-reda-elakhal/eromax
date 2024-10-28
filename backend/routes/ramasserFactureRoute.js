const express = require('express');
const router = express.Router();
const { getRamasserFactureByCode, getRamasserFacturesByStore, createRamasserFacturesForClient, getAllRamasserFacture } = require('../Controllers/factureRamasserController');


// /api/Ramasserfacture
router.route('/')
    .post(createRamasserFacturesForClient)
    .get(getAllRamasserFacture)

    router.get('/detail/:code_facture', getRamasserFactureByCode);
    router.get('/detail/client/:storeId',getRamasserFacturesByStore);


module.exports = router;