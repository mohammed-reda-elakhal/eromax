const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['fixed_tarif', 'percentage_discount'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  appliesTo: {
    type: String,
    enum: ['all', 'specific'],
    default: 'all',
  },
  clients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
  }], // Only used if appliesTo is 'specific'
}, { timestamps: true });

module.exports = mongoose.model('Promotion', promotionSchema);
