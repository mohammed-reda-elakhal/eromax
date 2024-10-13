
const express = require('express');
const router = express.Router();
const {createDemandeRetrait,getAllDemandesRetrait, verserDemandeRetrait} = require('../Controllers/demandeRetraitController');
// /api/demande-retrait
router.post('/',createDemandeRetrait);
router.get('/', getAllDemandesRetrait);
router.post('/valide/:id', verserDemandeRetrait);


module.exports = router;
