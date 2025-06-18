const express = require("express");
const { getAllStores, getStoreById, deleteStore, createStores, updateStore,storePhotoController, getStoreByUser, resetAutoDR, toggleAutoDR } = require("../Controllers/storeController");
const {verifyTokenAndClient, verifyTokenAndStore, verifyToken} = require("../Middlewares/VerifyToken");
const { route } = require("./clientRoute");
const photoUpload = require("../Middlewares/photoUpload");
const router = express.Router();

// api/store
router.put('/reset', resetAutoDR);

router.route('/')
        .get(getAllStores)

// api/store/:id_user        
router.route('/:id_user')
        .post( verifyTokenAndClient , createStores)


// api/store/:id
router.route('/:id')
        .put(updateStore)
        .delete(deleteStore)
        .get(verifyToken, getStoreById);

router.route('/user/:id')
        .get(verifyToken, getStoreByUser)

// api/store/:id/photo
router.route("/:id/photo")
  .post(photoUpload.single("image"), storePhotoController)
  .put(photoUpload.single("image"), storePhotoController); // Added PUT handler

  // api/store/:storeId/auto-dr
router.patch('/:storeId/auto-dr', toggleAutoDR);
// reset auto en haut de page 

module.exports= router;