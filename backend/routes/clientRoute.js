const express = require("express");
const { getAllClients, getClientById, createClient, updateClient, deleteClient , toggleActiveClient, verifyClient, verifyClientAll } = require("../Controllers/clientControllers");
const router = express.Router();

// api/client
router.route("/")
        .get(getAllClients)
        .post(createClient)

// api/client/:id
router.route("/:id")
        .get(getClientById)
        .put(updateClient)
        .delete(deleteClient)
   
// api/client/active/:id
router.route("/active/:id")
        .patch(toggleActiveClient)
// api/client/verify/:id
router.route("/verify/:id")
        .patch(verifyClient)






module.exports= router;