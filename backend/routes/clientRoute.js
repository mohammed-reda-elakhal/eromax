const express = require("express");
const { getAllClients, getClientById, createClient, updateClient, deleteClient , toggleActiveClient, verifyClient, verifyClientAll } = require("../Controllers/clientControllers");
const { getMyAccess } = require("../Controllers/clientAccessController");
const { verifyToken } = require("../Middlewares/VerifyToken");
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

// api/client/my-access - Get current client's features access
router.get("/my-access", verifyToken, getMyAccess);



module.exports= router;