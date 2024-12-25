const express = require('express');
const router = express.Router();
const { 
  CreateMultipleColisCtrl, 
  getSuiviColis, 
  getColisInfoByCodeSuivi, 
  updateColisController, 
  deleteColisController, 
  login,
  updateMultipleColisStatus
} = require('../Controllers/apiIntegrationController');
const { verifyToken } = require('../Middlewares/VerifyToken');

// Route pour l'authentification
router.post('/login', login);

// Regroupement des routes liées aux colis
router
  .route('/colis')
  .post(verifyToken, CreateMultipleColisCtrl); // Ajouter un colis

router
  .route('/colis/:code_suivi')
  .get(verifyToken, getColisInfoByCodeSuivi) // Obtenir les infos d'un colis
  .patch(verifyToken, updateColisController) // Mettre à jour un colis
  .delete(verifyToken, deleteColisController); // Supprimer un colis

// Route spécifique pour le suivi des colis
router.get('/colis/track/:code_suivi', verifyToken, getSuiviColis);
router.post('/statut/update',verifyToken,updateMultipleColisStatus);


module.exports = router;
