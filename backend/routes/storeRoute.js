const express = require("express");
const { getAllStores, getStoreById, deleteStore, createStores, updateStore, profileStore } = require("../Controllers/storeController");
const {verifyTokenAndClient, verifyTokenAndStore} = require("../Middlewares/VerifyToken")
const router = express.Router();

// api/store
router.route('/')
        .get(getAllStores)

// api/store/:id_user        
router.route('/:id_user')
        .post( verifyTokenAndClient , createStores)


// api/store/:id
router.route('/:id')
        .get(getStoreById)
        .put(updateStore)
        .delete(deleteStore)

module.exports= router;