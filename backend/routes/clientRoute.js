const express = require("express");
<<<<<<< HEAD
const { getAllClients, getClientById, createClient, updateClient, deleteClient, clientPhotoController, UploadClientfiles, UploadClientFiles } = require("../Controllers/clientControllers");
const photoUpload = require("../Middlewares/photoUpload");
const { verifyToken, verifyTokenAndStore, verifyTokenAndClient } = require("../Middlewares/VerifyToken");
const fileUpload = require("../Middlewares/fileUpload");
=======
const { getAllClients, getClientById, createClient, updateClient, deleteClient } = require("../Controllers/clientControllers");
>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada
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

<<<<<<< HEAD
router.route("/:id/photo").post(verifyTokenAndClient,photoUpload.single("image"),clientPhotoController);
router.route("/files/:id").post(fileUpload.single('file'),UploadClientFiles);

module.exports= router;
=======
module.exports= router; 
>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada
