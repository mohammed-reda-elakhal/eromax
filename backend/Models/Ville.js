const mongoose = require('mongoose');

const VilleSchema = new mongoose.Schema({
  ref_ville: String,
  nom_ville: String
});

const Ville = mongoose.model('Ville', VilleSchema);
module.exports = {Ville};
