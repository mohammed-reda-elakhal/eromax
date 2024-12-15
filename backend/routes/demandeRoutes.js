
const express = require('express');
const router = express.Router();
const {createDemandeRetrait,getAllDemandesRetrait, verserDemandeRetrait, getDemandesRetraitByClient, createAutomaticDemandeRetrait} = require('../Controllers/demandeRetraitController');
// /api/demande-retrait


router.post('/',createDemandeRetrait);
router.get('/', getAllDemandesRetrait);
router.post('/valide/:id', verserDemandeRetrait);
router.get('/client/:id_user', getDemandesRetraitByClient);
router.post('/automatic',createAutomaticDemandeRetrait);


module.exports = router;
