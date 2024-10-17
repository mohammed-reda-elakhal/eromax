
const mongoose = require('mongoose');

const notificationUserSchema = new mongoose.Schema({
  id_store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
 
  clientId: { 
    type: mongoose.Schema.Types.ObjectId, ref: 'Client',required: true 
  },
  colisId: { 
    type: mongoose.Schema.Types.ObjectId,ref: 'Colis',required: true 
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  is_read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('NotificationUser', notificationUserSchema);
