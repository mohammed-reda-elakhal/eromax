const express = require("express");
<<<<<<< HEAD
const { getAllStores, getStoreById, deleteStore, createStores, updateStore,storePhotoController } = require("../Controllers/storeController");
const {verifyTokenAndClient, verifyTokenAndStore, verifyToken} = require("../Middlewares/VerifyToken");
const { route } = require("./clientRoute");
const photoUpload = require("../Middlewares/photoUpload");
=======
const { getAllStores, getStoreById, deleteStore, createStores, updateStore, profileStore } = require("../Controllers/storeController");
const {verifyTokenAndClient, verifyTokenAndStore, verifyToken} = require("../Middlewares/VerifyToken")
>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada
const router = express.Router();

// api/store
router.route('/')
        .get(getAllStores)

// api/store/:id_user        
<<<<<<< HEAD
router.route('/:id_user')
=======
router.route('/client/:id_user')
>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada
        .post( verifyTokenAndClient , createStores)


// api/store/:id
router.route('/:id')
<<<<<<< HEAD
        .put(updateStore)
        .delete(deleteStore)



router.route("/:id_user").get(verifyTokenAndStore,getStoreById);

// api/store/update-photo/:id
router.route("/:id/photo").post(photoUpload.single("image"),storePhotoController);


=======
        .get(verifyTokenAndStore , getStoreById)
        .put(updateStore)
        .delete(deleteStore)

>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada
module.exports= router;