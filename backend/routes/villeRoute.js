const { ajoutVille, getAllVilles, updateVille, deleteVille, getVilleById } = require("../Controllers/villeCtrl");

const router = require("express").Router()

router.route("/")
        .post(ajoutVille)
        .get(getAllVilles)

router.route("/:id")
        .put(updateVille)
        .get(getVilleById)
        .delete(deleteVille)


module.exports=router