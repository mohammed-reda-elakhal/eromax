const express = require("express");
const { getAllLivreur, createLivreur, getLivreurById, updateLivreur, deleteLivreur, getLivreurbyVille  } = require("../Controllers/livreurController");
const { affecterLivreur } = require("../Controllers/colisController");
const router = express.Router();


// api/livreur
router.route("/")
        .get(getAllLivreur)
        .post(createLivreur)

// api/livreur/:id
router.route("/:id")
        .get(getLivreurById)
        .put(updateLivreur)
        .delete(deleteLivreur)

//  api/livreur/ville  ---- get Livreurs by Ville
router.route("/ville").post(getLivreurbyVille)
router.route("/colis").post(affecterLivreur);
module.exports= router;