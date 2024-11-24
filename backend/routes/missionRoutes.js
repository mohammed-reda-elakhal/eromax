const express = require('express');
const { getReclamationToday, getDemandeRetraitToday, getColisATRToday } = require('../Controllers/missionController');
const { verifyTokenAndAdmin} = require('../Middlewares/VerifyToken');

const router = express.Router();

router.get('/reclamation', verifyTokenAndAdmin, getReclamationToday);
router.get('/demande-retrait', verifyTokenAndAdmin, getDemandeRetraitToday);
router.get('/colis-ATR', verifyTokenAndAdmin, getColisATRToday);



module.exports = router;
