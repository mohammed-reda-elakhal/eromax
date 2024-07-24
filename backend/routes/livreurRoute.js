const express = require("express");
const { getAllLivreur, createLivreur, getLivreurById, updateLivreur, deleteLivreur  } = require("../Controllers/livreurController");
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

module.exports= router;