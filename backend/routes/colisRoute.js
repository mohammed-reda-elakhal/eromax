const express = require("express");
const router = express.Router();
const colisController = require("../Controllers/colisController");


//Router api/colis
router.route('/')
        .post(colisController.CreateColisCtrl)
        .get(colisController.getAllColisCtrl)

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
