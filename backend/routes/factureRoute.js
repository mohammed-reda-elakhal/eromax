const express = require('express');
const router = express.Router();
const { transferColisClient , transferColisLivreur , getAllFacture , getFactureLivreur , getColisWithoutFactureForClient , addColisToExistingClientFacture, getFactureByCode, setFacturePay, getCodeFactureByColis, mergeFactures, removeColisFromFacture, getFacturesGroupedByUser, getFacturesByUser , removeColisFromClientFacture, getFactureClientByCode, getFactureClient, getFactureLivreurByCode} = require('../Controllers/factureController');
const { getAllRamasserFacture, getRamasserFactureByCode } = require('../Controllers/factureRamasserController');
const { verifyToken } = require('../Middlewares/VerifyToken');
const { createFacturesRetourController, getFacturesRetourController, getFactureRetourByCodeFacture } = require('../Controllers/factureRetourController');


// /api/facture
router.route('/')
    .get(verifyToken , getAllFacture)


router.route('/retour')
    .post(createFacturesRetourController)
    .get(verifyToken , getFacturesRetourController)

router.route('/merge')
    .post(mergeFactures)



router.route('/groupe/user')
    .get(getFacturesGroupedByUser)

router.route('/user')
    .get(getFacturesByUser)

router.route('/retour/:code_facture')
    .get(getFactureRetourByCodeFacture)

router.route('/ramasser')
    .get( verifyToken , getAllRamasserFacture)

router.route('/ramasser/:code_facture')
    .get(getRamasserFactureByCode)

// get facture by colis
router.route('/colis/:colisId')
    .get(getCodeFactureByColis)


router.get('/client', getFactureClient);
router.get('/livreur', getFactureLivreur);
router.get('/detail/:code_facture', getFactureByCode);
router.get('/detail/client/:code_facture', getFactureClientByCode);
router.get('/detail/livreur/:code_facture', getFactureLivreurByCode);


// trasfer colis routes -------------
router.post('/transfer/client', transferColisClient);
router.post('/transfer/livreur', transferColisLivreur);




router.put('/pay/:id',setFacturePay);

router.delete('/:code_facture/colis/:code_suivi', removeColisFromClientFacture);
router.patch('/:code_facture/colis/:code_suivi', addColisToExistingClientFacture);
router.get('/sans_facture', getColisWithoutFactureForClient);






module.exports = router;