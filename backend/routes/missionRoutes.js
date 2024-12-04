const express = require('express');
const { getReclamationToday, getDemandeRetraitToday, getColisATRToday, countExpedieColisForLivreur, countPretToLivreeColisForLivreur } = require('../Controllers/missionController');
const { verifyTokenAndAdmin, verifyToken} = require('../Middlewares/VerifyToken');

const router = express.Router();


// base url : /api/mission
router.get('/reclamation', verifyTokenAndAdmin, getReclamationToday);
router.get('/demande-retrait', verifyTokenAndAdmin, getDemandeRetraitToday);
router.get('/colis-ATR', verifyTokenAndAdmin, getColisATRToday);
router.get('/colis-Ex', verifyToken, countExpedieColisForLivreur);
router.get('/colis-Pret', verifyToken, countPretToLivreeColisForLivreur);



module.exports = router;
