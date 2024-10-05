
const express = require('express');
const router = express.Router();
const {createDemandeRetrait,getAllDemandesRetrait} = require('../Controllers/demandeRetraitController');

router.post('/',createDemandeRetrait);
router.get('/', getAllDemandesRetrait);

module.exports = router;
