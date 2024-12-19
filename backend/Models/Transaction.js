// models/transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  id_store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  retrait: { type: mongoose.Schema.Types.ObjectId, ref: 'DemandeRetrait', required: false },
  type: { type: String, enum: ['debit', 'credit'], required: true },
  montant: { type: Number, required: true },
  etat : {type : Boolean, default:false }

}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
