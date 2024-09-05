const express = require("express");
const router = express.Router();
const colisController = require("../Controllers/colisController");
const {verifyTokenStoreTeamAdminClient, verifyTokenAndAdmin, verifyTokenAndLivreurOrAdmin} = require("../Middlewares/VerifyToken"); 
const { updateSuiviColis } = require("../Controllers/suivi_colisController");
const { ajoutVille } = require("../Controllers/villeCtrl");


//Router api/colis
router.route('/')
        .get(verifyTokenAndAdmin,colisController.getAllColisCtrl)

// Router api/colis/:id_user or :id_store
router.route('/:id_user')
        .post(verifyTokenStoreTeamAdminClient,colisController.CreateColisCtrl)
        .get(colisController.getColisByUserOrStore)


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

//router api/colis/St
router.route("/St/:id").put(updateSuiviColis)

// router api/colis/truck/:code_suivi
router.route('/truck/:code_suivi')
        .get(colisController.getSuiviColis)

// router api/colis/colisStore/:id_store get colis by store 
router.route("/colisStore/:id").get(colisController.getColisByStore);
router.route("/livreur")
.post(colisController.affecterLivreur);

router.route("/getColisLiv/:id_livreur").get(verifyTokenAndLivreurOrAdmin,colisController.getColisByIdLivreur)
router.route("/getColisTeam/:id_team").get(verifyTokenAndAdmin,colisController.getColisByTeam)







module.exports= router;
