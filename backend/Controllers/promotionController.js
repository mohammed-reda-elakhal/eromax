const Promotion = require('../Models/Promotion');
const mongoose = require('mongoose');
const dayjs = require('dayjs');

// Create a new promotion
// Create a new promotion
exports.createPromotion = async (req, res) => {
  try {
    const promotionData = req.body;

    // Corrected validation check
    if (!promotionData.type || promotionData.value == null || !promotionData.startDate || !promotionData.endDate) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    const newPromotion = new Promotion(promotionData);
    const savedPromotion = await newPromotion.save();

    res.status(201).json({
      message: 'Promotion created successfully.',
      data: savedPromotion,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: 'Validation error.', errors: messages });
    }
    res.status(500).json({
      message: 'Error creating promotion.',
      error: error.message,
    });
  }
};

// Get all promotions
exports.getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find()
      .populate('clients'); // Populate client names if needed

    res.status(200).json({
      message: 'Promotions retrieved successfully.',
      data: promotions,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving promotions.',
      error: error.message,
    });
  }
};

// Get a promotion by ID
exports.getPromotionById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid promotion ID.' });
    }

    const promotion = await Promotion.findById(id)
      .populate('clients', 'name');

    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found.' });
    }

    res.status(200).json({
      message: 'Promotion retrieved successfully.',
      data: promotion,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving promotion.',
      error: error.message,
    });
  }
};

// Update a promotion
exports.updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const promotionData = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid promotion ID.' });
    }

    const updatedPromotion = await Promotion.findByIdAndUpdate(
      id,
      promotionData,
      { new: true, runValidators: true }
    ).populate('clients', 'name');

    if (!updatedPromotion) {
      return res.status(404).json({ message: 'Promotion not found.' });
    }

    res.status(200).json({
      message: 'Promotion updated successfully.',
      data: updatedPromotion,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating promotion.',
      error: error.message,
    });
  }
};

// Delete a promotion
exports.deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid promotion ID.' });
    }

    const deletedPromotion = await Promotion.findByIdAndDelete(id);

    if (!deletedPromotion) {
      return res.status(404).json({ message: 'Promotion not found.' });
    }

    res.status(200).json({
      message: 'Promotion deleted successfully.',
      data: deletedPromotion,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting promotion.',
      error: error.message,
    });
  }
};

// Toggle the isActive status of a promotion
exports.togglePromotionStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid promotion ID.' });
    }

    // Find the promotion by ID
    const promotion = await Promotion.findById(id);

    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found.' });
    }

    // Toggle the isActive status
    promotion.isActive = !promotion.isActive;
    await promotion.save();

    res.status(200).json({
      message: `Promotion ${promotion.isActive ? 'activated' : 'deactivated'} successfully.`,
      data: promotion,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error toggling promotion status.',
      error: error.message,
    });
  }
};




// Get valid promotions (active and within date range), considering client
exports.getValidPromotions = async (req, res) => {
  try {
    const currentDate = new Date();

    // Fetch all valid promotions
    const validPromotions = await Promotion.find({
      isActive: true,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    }).populate('clients');

    // Separate promotions by 'appliesTo' field
    const specificPromotions = validPromotions.filter(
      (promo) => promo.appliesTo === 'specific'
    );
    const allPromotions = validPromotions.filter(
      (promo) => promo.appliesTo === 'all'
    );

    let promotionsToReturn = [];

    // Check if there are any promotions that apply to specific clients
    if (specificPromotions.length > 0) {
      // Ensure that we have the client's store ID from the token
      if (req.user && req.user.store) {
        const clientStoreId = req.user.store.toString();

        // Find promotions where the client's store is included
        const promotionsForClient = specificPromotions.filter((promo) =>
          promo.clients.some((client) => client._id.toString() === clientStoreId)
        );

        if (promotionsForClient.length > 0) {
          // Return only promotions specific to the client
          promotionsToReturn = promotionsForClient;
        } else {
          // No specific promotions for client, return promotions that apply to all
          promotionsToReturn = allPromotions;
        }
      } else {
        // Client's store ID is missing in the token
        return res.status(400).json({
          message: 'Client store information is missing.',
        });
      }
    } else {
      // No specific promotions exist, return promotions that apply to all
      promotionsToReturn = allPromotions;
    }

    if (promotionsToReturn.length > 0) {
      // Return the promotions
      return res.status(200).json({
        message: 'Valid promotions retrieved successfully.',
        data: promotionsToReturn,
      });
    } else {
      // No promotions are available
      return res.status(200).json({
        message: 'No promotions available.',
        data: [],
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving valid promotions.',
      error: error.message,
    });
  }
};


