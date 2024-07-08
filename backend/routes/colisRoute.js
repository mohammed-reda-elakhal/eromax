const express = require("express");
const router = express.Router();
const colisController = require("../Controllers/colisController");
const { 
        verifyToken , 
        verifyTokenAndAdmin  , 
        verifyTokenAndClientOrAdmin, 
        verifyTokenAndClient, 
        verifyTokenAndLivreur,
        verifyTokenAndStore
        } = require("../Middlewares/VerifyToken")


//Router api/colis
router.route('/')
        .post( verifyTokenAndClient , colisController.CreateColisCtrl)
        .get( verifyTokenAndStore , colisController.getAllColisCtrl)

// Router api/colis/:id
router.route('/:id')
        .get(colisController.getColisByIdCtrl)
        .delete(colisController.deleteColis)
        .put(colisController.updateColis)
 
// Router api/colis/:code_suivi
router.route('/:code_suivi')
        .get(colisController.getColisByCodeSuiviCtrl)

// router api/colis/statu/:id
router.route('/statu/:id')
        .put(colisController.UpdateStatusCtrl)

// router api/colis/truck/:code_suivi
router.route('/truck/:code_suivi')
        .get(colisController.getSuiviColis)



module.exports= router;
