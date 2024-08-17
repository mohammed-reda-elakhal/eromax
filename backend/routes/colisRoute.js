const express = require("express");
const router = express.Router();
const colisController = require("../Controllers/colisController");
const { 
        verifyToken , 
        verifyTokenAndAdmin  , 
        verifyTokenAndClientOrAdmin, 
        verifyTokenAndClient, 
        verifyTokenAndLivreur,
        verifyTokenAndStore,
        verifyTokenStoreTeamAdmin,
        verifyTokenAdminTeam,
        verifyTokenStoreTeamAdminClient
        } = require("../Middlewares/VerifyToken"); 
const { updateSuiviColis } = require("../Controllers/suivi_colisController");
const { isValidObjectId } = require("mongoose");
const { ajoutVille } = require("../Controllers/villeCtrl");


//Router api/colis
router.route('/')
        .get( verifyTokenAdminTeam , colisController.getAllColisCtrl)

// Router api/colis/:id_user or :id_store
router.route('/:id_user')
        .post(verifyTokenStoreTeamAdminClient,colisController.CreateColisCtrl)
        .get( verifyTokenStoreTeamAdmin , colisController.getColisByUserOrStore)


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
router.route("/livreur").post(colisController.affecterLivreur);





module.exports= router;
