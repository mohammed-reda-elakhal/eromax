const express = require("express");
<<<<<<< HEAD
const { getAllLivreur, createLivreur, getLivreurById, updateLivreur, deleteLivreur, getLivreurbyVille  } = require("../Controllers/livreurController");
=======
const { getAllLivreur, createLivreur, getLivreurById, updateLivreur, deleteLivreur  } = require("../Controllers/livreurController");
>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada
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

<<<<<<< HEAD
//  api/livreur/ville  ---- get Livreurs by Ville
router.route("/ville").post(getLivreurbyVille)
=======
>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada
module.exports= router;