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
<<<<<<< HEAD
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      }
=======
        required: true,
        unique: true
    },
    date_create: {
        type: Date,
        required: true
    }
    ,
    date_attend_ramassage: {
        type: Date,
        required: false
    },
    date_preparation: {
        type: Date,
        required: false
    },
    date_ramassage: {
        type: Date,
        required: false
    },
    date_exp: {
        type: Date,
        required: false
    },
    date_reçu: {
        type: Date,
        required: false
    },
    date_distribution: {
        type: Date,
        required: false
    },
    date_livraison: {
        type: Date,
        required: false
    }
    ,
    date_annule: {
        type: Date,
        required: false
    }
    ,
    date_programme: { // cette attric=rubut cet la colis changer date de livraison a une autre date 
        type: Date,
        required: false
>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada
    }
  ]
});

const Suivi_Colis = mongoose.model("Suivi_Colis", suiviColisSchema);

module.exports = {
  Suivi_Colis
};
