const mongoose = require('mongoose');

const VilleSchema = new mongoose.Schema({
  key:String,
  ref: String,
  nom: String,
  tarif:{
    type:Number
  }
});

const Ville = mongoose.model('Ville', VilleSchema);
module.exports = {Ville};
