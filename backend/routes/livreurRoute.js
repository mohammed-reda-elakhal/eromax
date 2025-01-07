const express = require("express");
const { getAllLivreur, createLivreur, getLivreurById, updateLivreur, deleteLivreur, getLivreurbyVille, generateFactureLivreur, assignColisToAmeex, toggleActiveLivreur  } = require("../Controllers/livreurController");
const { affecterLivreur } = require("../Controllers/colisController");
const { verifyToken } = require("../Middlewares/VerifyToken");
const router = express.Router();


// api/livreur
router.route("/")
        .get(getAllLivreur)
        .post(createLivreur)

// api/livreur/:id
router.route("/:id")
        .get(getLivreurById)
        .put( updateLivreur)
        .delete(deleteLivreur)

router.route("/active/:id")
        .patch(toggleActiveLivreur)
// api/livreur/ameex
router.route("/ameex")
        .post(assignColisToAmeex)

//  api/livreur/ville  ---- get Livreurs by Ville
router.route("/ville").post(getLivreurbyVille)
router.route("/colis").post(affecterLivreur);
router.route("/facture/:colisId").post(generateFactureLivreur);


module.exports= router;