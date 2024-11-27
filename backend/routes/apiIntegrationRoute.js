const express = require('express');
const router = express.Router();
const { login, CreateMultipleColisCtrl, TrackColisCtrl } = require('../Controllers/apiIntegrationController');



router.post('/login', login); // Route pour la connexion
router.post('/colis/addColis', CreateMultipleColisCtrl); // Route pour la connexion
router.get("/colis/Track/:code_suivi", TrackColisCtrl);


module.exports = router;
