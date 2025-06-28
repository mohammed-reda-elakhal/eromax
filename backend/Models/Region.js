const mongoose = require('mongoose');

const RegionSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  key: { type: String, required: true }
});

const Region = mongoose.model('Region', RegionSchema);
module.exports = { Region };
