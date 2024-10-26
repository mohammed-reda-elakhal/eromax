const mongoose = require("mongoose");

const suiviColisSchema = new mongoose.Schema({
  id_colis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Colis',
    required: true
  },
  code_suivi: {
    type: String,
    required: true,
    unique: true // Ensure this field is unique
  },
  status_updates: [
    {
      status: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      },
      livreur : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Livreur',
        required: false , 
      }
    }
  ]
});

const Suivi_Colis = mongoose.model("Suivi_Colis", suiviColisSchema);

module.exports = {
  Suivi_Colis
};
