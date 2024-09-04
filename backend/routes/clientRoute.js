const express = require("express");
const { getAllClients, getClientById, createClient, updateClient, deleteClient, clientPhotoController, UploadClientfiles, UploadClientFiles, generateFactureClient } = require("../Controllers/clientControllers");
const photoUpload = require("../Middlewares/photoUpload");
const { verifyToken, verifyTokenAndStore, verifyTokenAndClient, verifyTokenAndAdmin } = require("../Middlewares/VerifyToken");
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
router.get('/generate/:colisId',generateFactureClient);


module.exports= router;