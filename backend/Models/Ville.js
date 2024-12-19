  const mongoose = require('mongoose');

  const VilleSchema = new mongoose.Schema({
    key:String,
    ref: String,
    nom: String,
    tarif:{
      type:Number
    },
    tarif_refus:{
      type : Number,
      default : 15 ,
  },
  disponibility: {
    type: [String], // Array of strings representing days of the week
    enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Demanche'], // restrict to valid days
    default: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi' ,'Samedi'] // Default availability, if any
  }
  });

  const Ville = mongoose.model('Ville', VilleSchema);
  module.exports = {Ville};
