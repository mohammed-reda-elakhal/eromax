const mongoose = require('mongoose');

const factureSchema = new mongoose.Schema({
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: false },
    colis: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Colis', required: true }], // Array of colis IDs
    livreur: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Livreur', required: false }], // Array of colis IDs
    code_facture: { type: String, unique: true, required: true },
    etat: {
        // soit ferme = true  ou ouverte = false
        type: Boolean,
        required: false,
        default : false,
    },
    type: {
        type: String,
        enum: ['client', 'livreur'],
        required: true,
    },
    createdAt: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const FactureRamasser = mongoose.model('FactureRetour', factureSchema);

module.exports = FactureRamasser;
