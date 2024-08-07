const express = require("express");
const { getAllStores, getStoreById, deleteStore, createStores, updateStore,storePhotoController } = require("../Controllers/storeController");
const {verifyTokenAndClient, verifyTokenAndStore, verifyToken} = require("../Middlewares/VerifyToken");
const { route } = require("./clientRoute");
const photoUpload = require("../Middlewares/photoUpload");
const router = express.Router();

// api/store
router.route('/')
        .get(getAllStores)

// api/store/:id_user        
router.route('/:id_user')
        .post( verifyTokenAndClient , createStores)


// api/store/:id
router.route('/:id')
        .put(updateStore)
        .delete(deleteStore)



router.route("/:id_user").get(verifyTokenAndStore,getStoreById);

// api/store/update-photo/:id
router.route("/:id/photo").post(photoUpload.single("image"),storePhotoController);


module.exports= router;