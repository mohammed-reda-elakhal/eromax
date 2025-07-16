const express = require('express');
const { getReclamationToday, getDemandeRetraitToday, getColisATRToday, countExpedieColisForLivreur, countPretToLivreeColisForLivreur, getNouveauClient, getColisR, getIncompleteWithdrawalsCount, getColisNouveau } = require('../Controllers/missionController');
const { verifyTokenAndAdmin, verifyToken} = require('../Middlewares/VerifyToken');

const router = express.Router();


// base url : /api/mission
router.get('/reclamation', verifyTokenAndAdmin, getReclamationToday);
router.get('/demande-retrait', verifyTokenAndAdmin, getDemandeRetraitToday);
router.get('/colis-ATR', verifyTokenAndAdmin, getColisATRToday);
router.get('/colis-R', verifyTokenAndAdmin, getColisR);
router.get('/new-client', verifyTokenAndAdmin, getNouveauClient);
router.get('/withdrawal-incomplete', verifyTokenAndAdmin, getIncompleteWithdrawalsCount);
router.get('/colis-nouveau', verifyTokenAndAdmin, getColisNouveau);

router.get('/colis-Ex', verifyToken, countExpedieColisForLivreur);
router.get('/colis-Pret', verifyToken, countPretToLivreeColisForLivreur);



module.exports = router;
