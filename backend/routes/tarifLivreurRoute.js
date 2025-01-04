// File: routes/tarifLivreurRoute.js

const express = require('express');
const router = express.Router();
const tarifLivreurController = require('../Controllers/tarifLivreurController');

// CRUD Routes
router.route('/')
    .post(tarifLivreurController.createTarifLivreur)
    .get(tarifLivreurController.getAllTarifLivreurs);

router.route('/:id')
    .get(tarifLivreurController.getTarifLivreurById)
    .put(tarifLivreurController.updateTarifLivreur)
    .delete(tarifLivreurController.deleteTarifLivreur);

// New Routes for fetching by Livreur and Ville
router.route('/livreur/:livreurId')
    .get(tarifLivreurController.getTarifLivreurByLivreur);

router.route('/ville/:villeId')
    .get(tarifLivreurController.getTarifLivreurByVille);

module.exports = router;
