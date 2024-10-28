const mongoose = require('mongoose');

const factureSchema = new mongoose.Schema({
    id_store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    id_colis: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Colis', required: true }], // Array of colis IDs
    code_facture: { type: String, unique: true, required: true },
    totalPrix: {
        type: Number,
        required: true,
    },
    createdAt: { type: Date, default: Date.now }
});

const FactureRamasser = mongoose.model('FactureRamasser', factureSchema);

module.exports = FactureRamasser;
