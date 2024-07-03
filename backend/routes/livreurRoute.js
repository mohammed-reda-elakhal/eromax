const express = require("express");
const router = express.Router();
const livreurController = require("../Controllers/livreurController");


//Router Add Colis
router.post('/addLivreur',livreurController.createLivreurCtrl);


//Router get All Livreurs

router.get('/getAllLivreur',livreurController.deleteLivreurCtrl);
 
//Router get livreur by id 
router.get('/livreur/:id', livreurController.getLivreurByIdCtrl);

//Router delete livreur
router.delete('/livreur/:id', livreurController.deleteLivreurCtrl);


module.exports= router;
