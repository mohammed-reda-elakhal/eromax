const express = require("express");
const router = express.Router();
const colisController = require("../Controllers/colisController");
const {verifyTokenStoreTeamAdminClient, verifyTokenAndAdmin, verifyTokenAndLivreurOrAdmin, verifyTokenAndLivreur, verifyTokenAdminTeam, verifyTokenAndClient, verifyToken} = require("../Middlewares/VerifyToken"); 
const { updateSuiviColis, updateMultipleSuiviColis, updateMultipleColisStatus, syncColisStatusWithAmeex } = require("../Controllers/suivi_colisController");
const { ajoutVille } = require("../Controllers/villeCtrl");


// crbt route

// Route to get CRBT info detail of a colis
router.route('/crbt')
        .get( verifyToken , colisController.getAllCrbtInfo)
        
router.route('/crbt/:colisId')
        .get(colisController.getCrbtInfoDetail)
        .put(colisController.updateCrbtInfo)

router.put('/fix-crbt/:code_suivi', colisController.fixCrbtForColis);

//Router api/colis
router.route('/')
        .get( verifyToken , colisController.getAllColisCtrl)
        .post(verifyToken , colisController.CreateMultipleColisCtrl)

//Router api/colis/select/status
router.route('/select/status')
        .get(colisController.getColisByStatuCtrl)

// Router api/colis/:id_user or :id_store
router.route('/user/:id_user')
        .post(verifyTokenStoreTeamAdminClient ,colisController.CreateColisCtrl)
        .get(verifyTokenStoreTeamAdminClient , colisController.getColisByUserOrStore);

router.route('/admin/:storeId')
        .post(verifyTokenAndAdmin , colisController.CreateColisAdmin)

router.route('/copie/:id_colis')
        .post( colisController.CloneColisCtrl)


// Router api/colis/:id
router.route('/:id')
        .get(colisController.getColisByIdCtrl)
        .delete(colisController.deleteColis)
        .put(colisController.updateColis)
 
// Router api/colis/:code_suivi
router.route('/code_suivi/:code_suivi')
        .get(colisController.getColisByCodeSuiviCtrl)


// Router /api/colis/pret_payant/:id
router.route('/pret_payant/:id')
        .patch(colisController.toggleColisPayant)


router.route('/send/ameex')
        .get(colisController.getColisAmeexCtrl)
        .put(syncColisStatusWithAmeex)


//router api/colis/St
router.route("/St/:id")
        .put(updateSuiviColis)

router.route("/statu/update")
        .put(updateMultipleColisStatus)

router.route("/statu/affecter")
        .put(colisController.affecterLivreurMultipleByCodeSuivi)

//router api/colis/St
router.route("/St/multiple")
        .post(updateMultipleSuiviColis)


//router api/colis/St
router.route("/facture/colis")
        .get(colisController.createFactureByClient)

// router api/colis/truck/:code_suivi
router.route('/truck/:code_suivi')
        .get(colisController.getSuiviColis)

// router api/colis/colisStore/:id_store get colis by store 
router.route("/colisStore/:id").get(verifyTokenStoreTeamAdminClient,colisController.getColisByStore);
// router api/colis/livreur
router.route("/livreur").post(verifyTokenAdminTeam,colisController.affecterLivreur);

router.route("/getColisLiv/:id_livreur").get(verifyTokenAndLivreurOrAdmin,colisController.getColisByLivreur)
router.route("/getColisTeam/:id_team").get(verifyTokenAndAdmin,colisController.getColisByTeam)
router.route("/programme").post(colisController.colisProgramme);//move to client route pour executer 
router.route("/annule").post(colisController.annulerColis);//move to client route pour executer
router.route("/refuser").post(colisController.refuserColis);//move to client route pour executer

// Routes for managing tarif_ajouter
router.route('/tarif/:identifier')
    .get(verifyTokenAndAdmin, colisController.getTarifAjouter)
    .put(verifyTokenAndAdmin, colisController.updateTarifAjouter);

module.exports= router;
