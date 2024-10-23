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
}
});

const Ville = mongoose.model('Ville', VilleSchema);
module.exports = {Ville};
