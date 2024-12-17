const router = require('express').Router();

const { createMeth, getAllMethPayements, getMethPayementById, deleteMethPayement, updateMethPayement } = require('../Controllers/methController');
//const methPayementController = require('../controllers/methPayementController');
const photoUpload = require('../Middlewares/photoUpload');

// Route to create a new Meth_Payement with image upload
router.post('/', photoUpload.single('image'), createMeth);
router.get('/',getAllMethPayements);
router.get('/:id',getMethPayementById);
// **Add PUT route for updating a Meth_Payement**
router.put('/:id', photoUpload.single('image'), updateMethPayement);
router.delete('/:id',deleteMethPayement);

module.exports = router;
