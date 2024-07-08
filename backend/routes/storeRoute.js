const express = require("express");
const { getAllStores, getStoreById, deleteStore, createStores, updateStore } = require("../Controllers/storeController");
const {verifyTokenAndClient} = require("../Middlewares/VerifyToken")
const router = express.Router();

// api/store
router.route('/')
        .get(getAllStores)

// api/store/:id_client        
router.route('/:id')
        .post( verifyTokenAndClient , createStores)

// api/store/:id
router.route('/:id')
        .get(getStoreById)
        .put(updateStore)
        .delete(deleteStore)

module.exports= router;