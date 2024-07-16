const express = require("express");
const { getAllClients, getClientById, createClient, updateClient, deleteClient } = require("../Controllers/clientControllers");
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

module.exports= router; 
