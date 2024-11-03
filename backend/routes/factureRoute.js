const express = require('express');
const router = express.Router();
const {createFacturesForClientsAndLivreurs, getAllFacture, getFactureByCode, getFacturesByStore, getFacturesByLivreur, setFacturePay} = require('../Controllers/factureController');
const { getAllRamasserFacture, getRamasserFacturesByStore } = require('../Controllers/factureRamasserController');
const { verifyToken } = require('../Middlewares/VerifyToken');


// /api/facture
router.route('/')
    .post(createFacturesForClientsAndLivreurs)
    .get(getAllFacture)



router.route('/ramasser')
    .get( verifyToken , getAllRamasserFacture)

router.route('/ramasser/:storeId')
    .get(getRamasserFacturesByStore)


    router.get('/detail/:code_facture', getFactureByCode);
    router.get('/detail/client/:storeId',getFacturesByStore);
    router.get('/detail/livreur/:livreurId',getFacturesByLivreur);

    router.put('/pay/:id',setFacturePay);





module.exports = router;