
const { required } = require('joi');
const mongoose = require('mongoose');

const demandeRetraitSchema = new mongoose.Schema({
  id_store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  id_payement: { type: mongoose.Schema.Types.ObjectId, ref: 'Payement', required: true },
  montant: { type: Number, required: true },
  tarif: { type: Number, required: false },
  verser : {type : Boolean , required:true, default:false }
}, { timestamps: true });

module.exports = mongoose.model('DemandeRetrait', demandeRetraitSchema);
