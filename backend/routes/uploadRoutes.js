const router = require('express').Router();
const { uploadVermentPreuve } = require('../Controllers/uploadController');
const photoUpload = require('../Middlewares/photoUpload');

// Upload verment preuve
router.post('/:id/verment-preuve', photoUpload.single('verment_preuve'), uploadVermentPreuve);

module.exports = router;
