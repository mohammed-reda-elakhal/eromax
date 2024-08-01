const express = require("express");
const { getAllClients, getClientById, createClient, updateClient, deleteClient, clientPhotoController, UploadClientfiles, UploadClientFiles } = require("../Controllers/clientControllers");
const photoUpload = require("../Middlewares/photoUpload");
const { verifyToken, verifyTokenAndStore, verifyTokenAndClient } = require("../Middlewares/VerifyToken");
const fileUpload = require("../Middlewares/fileUpload");
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

router.route("/:id/photo").post(verifyTokenAndClient,photoUpload.single("image"),clientPhotoController);
router.route("/files/:id").post(fileUpload.single('file'),UploadClientFiles);

module.exports= router;