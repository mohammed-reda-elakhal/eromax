const express = require('express');
const { uploadProfilePhotoController, updateProfilePhotoController, storePhotoController, updatePhotoStoreController, UploadClientFiles } = require('../Controllers/imagesController');
const { verifyToken } = require('../Middlewares/VerifyToken');
const photoUpload = require('../Middlewares/photoUpload');
const fileUpload = require('../Middlewares/fileUpload');
const router = express.Router();

// Route pour tester l'upload de la photo de profil, sécurisée avec verifyToken
router.route('/upload/:role/:id')
    .post(verifyToken, photoUpload.single('image'),uploadProfilePhotoController)
    .put(verifyToken, photoUpload.single('image'),updateProfilePhotoController)

router.route("/store/upload/:id")
    .post(photoUpload.single("image"),storePhotoController)
    .put(photoUpload.single("image"),updatePhotoStoreController)


router.route("/files/:id").post(fileUpload.single('file'),UploadClientFiles);

module.exports = router;
