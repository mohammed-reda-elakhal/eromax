const mongoose = require("mongoose");

const reclamationSchema = new mongoose.Schema({
    store: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Store'
    },
    colis: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Colis' // Ensure this matches the correct model name
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    resoudre: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});


const Reclamation = mongoose.model('Reclamation', reclamationSchema);

module.exports = {
    Reclamation
};
