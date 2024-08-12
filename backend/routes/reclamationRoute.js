const { createReclamation, getReclamations, getReclamationById, updateReclamation, deleteReclamtion, updateReclamationStatus, getReclamationByClient } = require("../Controllers/reclamationController");

const router = require("express").Router();

router.route("/")
        .get(getReclamations)
        .post(createReclamation)

// api/reclamation/:id
router.route("/:id")
        .get(getReclamationById)
        .put(updateReclamation)
        .delete(deleteReclamtion)

router.route("/statut/:id").put(updateReclamationStatus);
// api/reclamation/:id_user
router.route("/client/:id_user").get(getReclamationByClient)

module.exports=router;