const express = require('express');
const router = express.Router();
const { secureApiAuth } = require('../Middlewares/SecureApiAuth');
const { livreurApiTest, getColisByLivreur, getMyColisByCodeSuivi, updateMyColisStatus } = require('../Controllers/apiLivreur');

// Test endpoint for livreur API
router.get('/test', secureApiAuth(), livreurApiTest);

// Get colis assigned to the authenticated livreur (with suivi)
router.get('/colis', secureApiAuth(), getColisByLivreur);

// Get a single colis by code_suivi for the authenticated livreur (with suivi)
router.get('/colis/:code_suivi', secureApiAuth(), getMyColisByCodeSuivi);

// Update statut of a colis by code_suivi for the authenticated livreur
router.patch('/colis/:code_suivi/status', secureApiAuth(), updateMyColisStatus);

module.exports = router;
