const router = require('express').Router();

const { createMeth, getAllMethPayements, getMethPayementById, deleteMethPayement } = require('../Controllers/methController');
//const methPayementController = require('../controllers/methPayementController');
const photoUpload = require('../Middlewares/photoUpload');

// Route to create a new Meth_Payement with image upload
router.post('/', photoUpload.single('image'), createMeth);
router.get('/',getAllMethPayements);
router.get('/:id',getMethPayementById);
router.delete('/:id',deleteMethPayement);

module.exports = router;
