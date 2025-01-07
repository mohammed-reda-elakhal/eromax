const express = require('express');
const router = express.Router();
const { getAllFacture, getFactureByCode, setFacturePay, getCodeFactureByColis, mergeFactures} = require('../Controllers/factureController');
const { getAllRamasserFacture, getRamasserFactureByCode } = require('../Controllers/factureRamasserController');
const { verifyToken } = require('../Middlewares/VerifyToken');
const { createFacturesRetourController, getFacturesRetourController, getFactureRetourByCodeFacture } = require('../Controllers/factureRetourController');


// /api/facture
router.route('/')
    .get(getAllFacture)


router.route('/retour')
    .post(createFacturesRetourController)
    .get(verifyToken , getFacturesRetourController)

router.route('/merge')
    .post(mergeFactures)

    
router.route('/retour/:code_facture')
    .get(getFactureRetourByCodeFacture)

router.route('/ramasser')
    .get( verifyToken , getAllRamasserFacture)

router.route('/ramasser/:code_facture')
    .get(getRamasserFactureByCode)

// get facture by colis
router.route('/colis/:colisId')
    .get(getCodeFactureByColis)



router.get('/detail/:code_facture', getFactureByCode);

    router.put('/pay/:id',setFacturePay);





module.exports = router;