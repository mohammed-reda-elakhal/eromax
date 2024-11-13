const express = require('express');
const router = express.Router();
const promotionController = require('../Controllers/promotionController');

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

router.patch('/:id/toggle', promotionController.togglePromotionStatus);


module.exports = router;
