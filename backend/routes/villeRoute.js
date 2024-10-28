const { ajoutVille, getAllVilles, updateVille, deleteVille, getVilleById, addTarifRefusToAllVilles } = require("../Controllers/villeCtrl");

const router = require("express").Router()

router.route("/")
        .post(ajoutVille)
        .get(getAllVilles)
        .put(addTarifRefusToAllVilles)

router.route("/:id")
        .put(updateVille)
        .get(getVilleById)
        .delete(deleteVille)


module.exports=router