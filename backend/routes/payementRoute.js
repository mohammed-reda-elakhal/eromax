const { createPayement, getAllPayements, getPayementById, deletePayement, getPaymentsByClientId, updatePayement, setDefaultPayement } = require('../Controllers/payementController');

const router = require('express').Router();



// Route to create a new Meth_Payement with image upload
router.post('/', createPayement);
router.get('/',getAllPayements);
 router.route('/:id')
    .get(getPayementById)
    .put(updatePayement)
    .delete(deletePayement)
 router.get('/client/:clientId',getPaymentsByClientId);
 router.post('/payement/default',setDefaultPayement);



module.exports = router;