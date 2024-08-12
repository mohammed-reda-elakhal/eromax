const { createPayement, getAllPayements, getPayementById, deletePayement, getPaymentsByClientId } = require('../Controllers/payementController');

const router = require('express').Router();



// Route to create a new Meth_Payement with image upload
router.post('/', createPayement);
router.get('/',getAllPayements);
 router.get('/:id',getPayementById);
 router.delete('/:id',deletePayement);
 router.get('/client/:clientId',getPaymentsByClientId);


module.exports = router;