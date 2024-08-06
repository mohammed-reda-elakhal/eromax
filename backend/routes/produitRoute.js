const express = require("express");
<<<<<<< HEAD
const { createProduit, getAllProduit, getProduitByClient, updateProduit, updateProduitQuantity, getProduitById, deleteProduit, createProduitVariantes } = require("../Controllers/produitController");
=======
const { createProduit, getAllProduit, getProduitByClient, updateProduit, updateProduitQuantity, getProduitById, deleteProduit } = require("../Controllers/produitController");
>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada
const {verifyTokenAndClient} = require("../Middlewares/VerifyToken")
const router = express.Router();

// api/produit
router.route("/")
        .get(getAllProduit)

// api/produit/client/:id_client
router.route("/client/:id_client")
        .post( verifyTokenAndClient , createProduit)
        .get(verifyTokenAndClient , getProduitByClient)

// api/produit/:id
router.route("/:id")
        .put( updateProduit)
        .get(getProduitById)
        .delete(deleteProduit)
<<<<<<< HEAD
router.route("/variant/:id").post(createProduitVariantes)
=======

>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada

// api/produit/stock/:id
router.route("/stock/:id")
        .put(updateProduitQuantity)

module.exports= router;