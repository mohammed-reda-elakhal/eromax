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
<<<<<<< HEAD
        verifyTokenAdminTeam,
        verifyTokenStoreTeamAdminClient
        } = require("../Middlewares/VerifyToken"); 
const { updateSuiviColis } = require("../Controllers/suivi_colisController");
=======
        verifyTokenAdminTeam
        } = require("../Middlewares/VerifyToken") 
>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada


//Router api/colis
router.route('/')
        .get( verifyTokenAdminTeam , colisController.getAllColisCtrl)

// Router api/colis/:id_user or :id_store
router.route('/:id_user')
<<<<<<< HEAD
        .post(verifyTokenStoreTeamAdminClient,colisController.CreateColisCtrl)
=======
        .post( verifyTokenStoreTeamAdmin , colisController.CreateColisCtrl)
>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada
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

<<<<<<< HEAD
//router api/colis/St
router.route("/St/:id").put(updateSuiviColis)
=======
// router api/colis/truck/:code_suivi
router.route('/truck/:code_suivi')
        .get(colisController.getSuiviColis)
>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada

// router api/colis/truck/:code_suivi
router.route('/truck/:code_suivi')
        .get(colisController.getSuiviColis)

<<<<<<< HEAD
// router api/colis/colisStore/:id_store get colis by store 
router.route("/colisStore/:id").get(colisController.getColisByStore);
=======
>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada

module.exports= router;
