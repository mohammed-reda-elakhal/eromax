const express = require("express");
const { createProduit, getAllProduit, getProduitByClient, updateProduit, updateProduitQuantity, getProduitById, deleteProduit } = require("../Controllers/produitController");
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


// api/produit/stock/:id
router.route("/stock/:id")
        .put(updateProduitQuantity)

module.exports= router;