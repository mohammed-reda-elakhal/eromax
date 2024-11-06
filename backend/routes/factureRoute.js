const express = require('express');
const router = express.Router();
const {createFacturesForClientsAndLivreurs, getAllFacture, getFactureByCode, getFacturesByStore, getFacturesByLivreur, setFacturePay} = require('../Controllers/factureController');
const { getAllRamasserFacture, getRamasserFacturesByStore, getRamasserFactureByCode } = require('../Controllers/factureRamasserController');
const { verifyToken } = require('../Middlewares/VerifyToken');
const { createFacturesRetourController, getFacturesRetourController, getFactureRetourByCodeFacture } = require('../Controllers/factureRetourController');


// /api/facture
router.route('/')
    .post(createFacturesForClientsAndLivreurs)
    .get(getAllFacture)


router.route('/retour')
    .post(createFacturesRetourController)
    .get(verifyToken , getFacturesRetourController)


router.route('/retour/:code_facture')
    .get(getFactureRetourByCodeFacture)

router.route('/ramasser')
    .get( verifyToken , getAllRamasserFacture)

router.route('/ramasser/:code_facture')
    .get(getRamasserFactureByCode)





router.get('/detail/:code_facture', getFactureByCode);
router.get('/detail/client/:storeId',getFacturesByStore);
router.get('/detail/livreur/:livreurId',getFacturesByLivreur);

    router.put('/pay/:id',setFacturePay);





module.exports = router;