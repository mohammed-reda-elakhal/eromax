const express = require('express');
const router = express.Router();
const { secureApiAuth } = require('../Middlewares/SecureApiAuth');
const { clientApiTest, getMyStore, getMyColis, getColisByStore, createMyColis, getMyColisByCodeSuivi, updateMyColisByCodeSuivi, deleteMyColisByCodeSuivi, getMySuiviByCodeSuivi } = require('../Controllers/apiClient');

// Test endpoint for client API
router.get('/test', secureApiAuth(), clientApiTest);

// Get the single store for the authenticated client
router.get('/store', secureApiAuth(), getMyStore);

// Get all colis across all stores for the authenticated client
router.get('/colis', secureApiAuth(), getMyColis);

// New: Get colis for the authenticated client's single store (no param)
router.get('/store/colis', secureApiAuth(), getMyColis);

// Get colis for a specific store (must belong to authenticated client)
router.get('/stores/:storeId/colis', secureApiAuth(), getColisByStore);

// Create a colis for the authenticated client's single store
router.post('/store/colis', secureApiAuth(), createMyColis);

// Alias: Create colis via /colis (backward-friendly)
router.post('/colis', secureApiAuth(), createMyColis);

// Get single colis by code_suivi for the authenticated client's store
router.get('/store/colis/:code_suivi', secureApiAuth(), getMyColisByCodeSuivi);
router.get('/colis/:code_suivi', secureApiAuth(), getMyColisByCodeSuivi);

// Update a colis by code_suivi (only when statut === 'Nouveau Colis')
router.put('/store/colis/:code_suivi', secureApiAuth(), updateMyColisByCodeSuivi);
router.put('/colis/:code_suivi', secureApiAuth(), updateMyColisByCodeSuivi);

// Delete a colis by code_suivi (only when statut === 'Nouveau Colis')
router.delete('/store/colis/:code_suivi', secureApiAuth(), deleteMyColisByCodeSuivi);
router.delete('/colis/:code_suivi', secureApiAuth(), deleteMyColisByCodeSuivi);

// Get suivi (tracking) by code_suivi for the authenticated client's store
router.get('/store/colis/:code_suivi/suivi', secureApiAuth(), getMySuiviByCodeSuivi);
router.get('/colis/:code_suivi/suivi', secureApiAuth(), getMySuiviByCodeSuivi);

module.exports = router;
