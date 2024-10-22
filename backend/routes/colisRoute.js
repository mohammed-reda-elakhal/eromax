const express = require("express");
const router = express.Router();
const colisController = require("../Controllers/colisController");
const {verifyTokenStoreTeamAdminClient, verifyTokenAndAdmin, verifyTokenAndLivreurOrAdmin, verifyTokenAndLivreur, verifyTokenAdminTeam, verifyTokenAndClient} = require("../Middlewares/VerifyToken"); 
const { updateSuiviColis, updateMultipleSuiviColis } = require("../Controllers/suivi_colisController");
const { ajoutVille } = require("../Controllers/villeCtrl");


//Router api/colis
router.route('/')
        .get( verifyTokenAndAdmin , colisController.getAllColisCtrl)

//Router api/colis/select/status
router.route('/select/status')
        .get(colisController.getColisByStatuCtrl)

// Router api/colis/:id_user or :id_store
router.route('/user/:id_user')
        .post(verifyTokenStoreTeamAdminClient ,colisController.CreateColisCtrl)
        .get(verifyTokenStoreTeamAdminClient , colisController.getColisByUserOrStore);


// Router api/colis/:id
router.route('/:id')
        .get(colisController.getColisByIdCtrl)
        .delete(colisController.deleteColis)
        .put(colisController.updateColis)
 
// Router api/colis/:code_suivi
router.route('/code_suivi/:code_suivi')
        .get(colisController.getColisByCodeSuiviCtrl)




//router api/colis/St
router.route("/St/:id")
        .put(updateSuiviColis)

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
router.route("/annule/:idColis").post(colisController.annulerColis);//move to client route pour executer
router.get('/count/livres/livreur/:livreurId', colisController.countColisLivreByLivreur);
router.get('/count/livres/client/:storeId', colisController.countColisLivreByClient);
router.get('/count/livres/team/:teamId',colisController.countColisLivreByTeam);
router.get('/count/livres',verifyTokenAdminTeam,colisController.countColisLivre);
router.get('/count/colis',verifyTokenAdminTeam,colisController.countColis);
router.get('/count/colis/client/:storeId',colisController.countColisByClinet);
router.get('/count/colis/livreur/:livreurId',colisController.countColisByLivreur);
router.get('/count/colis/team/:teamId',colisController.countColisByTeam);
















module.exports= router;
