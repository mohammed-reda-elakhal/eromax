
const mongoose = require('mongoose');

const notificationUserSchema = new mongoose.Schema({
  id_store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: false },
 
  id_livreur: { 
    type: mongoose.Schema.Types.ObjectId, ref: 'Livreur',required: false 
  },
  colisId: { 
    type: mongoose.Schema.Types.ObjectId,ref: 'Colis',required: false 
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  is_read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('NotificationUser', notificationUserSchema);
