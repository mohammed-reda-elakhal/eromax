const express = require("express");
const router = express.Router();
const colisController = require("../Controllers/colisController");


//Router Add Colis
router.post('/addcolis',colisController.CreateColisCtrl);


//Router get All colis

router.get('/getAllColis',colisController.getAllColisCtrl);
 
//Router getColisByCode suivi

router.get('/tracking/:code_suivi', colisController.getColisByCodeSuiviCtrl);
// Route pour obtenir un Colis par son ID

router.get('/colis/:id', colisController.getColisByIdCtrl);


router.delete('/colis/:id', colisController.deleteColis);


module.exports= router;
