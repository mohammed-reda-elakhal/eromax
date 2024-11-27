const express = require('express');
const router = express.Router();
const promotionController = require('../Controllers/promotionController');
const { verifyToken} = require("../Middlewares/VerifyToken"); 

// Create a new promotion
router.post('/', promotionController.createPromotion);

// Get all promotions
router.get('/', promotionController.getAllPromotions);

// Get a promotion by ID
router.get('/:id', promotionController.getPromotionById);

// Update a promotion
router.put('/:id', promotionController.updatePromotion);

// Delete a promotion
router.delete('/:id', promotionController.deletePromotion);

// toggle active or desactive the promotion 
router.patch('/:id/toggle', promotionController.togglePromotionStatus);

// get valide promotion
router.get('/user/valide'  , verifyToken ,  promotionController.getValidPromotions);


module.exports = router;
