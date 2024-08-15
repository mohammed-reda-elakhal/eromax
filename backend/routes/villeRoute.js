const { ajoutVille } = require("../Controllers/villeCtrl");

const router = require("express").Router()

router.route("/ajouter").post(ajoutVille);

module.exports=router