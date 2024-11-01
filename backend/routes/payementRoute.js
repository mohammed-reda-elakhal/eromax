const { createPayement, getAllPayements, getPayementById, deletePayement, getPaymentsByClientId, updatePayement } = require('../Controllers/payementController');

const router = require('express').Router();



// Route to create a new Meth_Payement with image upload
router.post('/', createPayement);
router.get('/',getAllPayements);
 router.route('/:id')
    .get(getPayementById)
    .put(updatePayement)
    .delete(deletePayement)
 router.get('/client/:clientId',getPaymentsByClientId);


module.exports = router;