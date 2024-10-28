const express = require("express");
const { getAllClients, getClientById, createClient, updateClient, deleteClient, clientPhotoController, UploadClientfiles, UploadClientFiles, generateFactureClient, generateFactureClientwithLiv } = require("../Controllers/clientControllers");
const photoUpload = require("../Middlewares/photoUpload");
const { verifyToken, verifyTokenAndStore, verifyTokenAndClient, verifyTokenAndAdmin, verifyTokenAndLivreurOrAdmin } = require("../Middlewares/VerifyToken");
const fileUpload = require("../Middlewares/fileUpload");
const colisController = require('../Controllers/colisController')
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
router.get('/generate/:storeId/:date',generateFactureClientwithLiv);

router.route("/programme").post(colisController.colisProgramme);
router.route("/annuler").post(colisController.annulerColis);
router.route("/refuser").post(colisController.refuserColis);//move to client route pour executer




module.exports= router;