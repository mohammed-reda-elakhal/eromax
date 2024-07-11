const mongoose = require("mongoose");
const Joi = require("joi");
const shortid = require('shortid');

// Colis Schema
const ColisSchema = new mongoose.Schema({
    id_Colis: {
        type: String,
        unique: true,
        default: shortid.generate
    },
    code_suivi: {
        type: String,
        unique: true,
    },
    nom: {
        type: String,
        required: true,
    },
    tele: {
        type: Number,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 10,
    },
    ville: {
        type: String,
        required: true,
    },
    code_ville: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ville'
    },
    adresse: {
        type: String,
        required: true,
    },
    commentaire: {
        type: String,
    },
    prix: {
        type: Number,
        required: true,
    },
    nature_produit: {
        type: String,
        required: true,
    },
    etat: {
        type: Boolean,
        default: false,
    },
    statut: {
        type: String,
        default: "attente de ramassage",
    },
    ouvrir: {
        type: Boolean,
        default: true,
    },
    is_simple: {
        type: Boolean,
        default : true,
    },
    is_remplace: {
        type: Boolean,
        default : false,
    },
    is_fragile: {
        type: Boolean,
        default : false,
    },
    produits: [{ // array
        produit: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Produit' 
        },
        variants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Variant'
        }]
    }],
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store'
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    },
    livreur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Livreur'
    },
}, {
    timestamps: true
});

// Generate code suivi
ColisSchema.pre('save', function (next) {
    if (!this.code_suivi) {
        this.code_suivi = shortid.generate();
    }
    next();
    console.log(this.code_suivi);
});

// Colis Model
const Colis = mongoose.model("Colis", ColisSchema);

// Joi Validation for Colis
function validateRegisterColis(obj) {
    const schema = Joi.object({
        adresse: Joi.string().required(),
        nom: Joi.string().required(),
        ville: Joi.string().required(),
        tele: Joi.string().pattern(/^[0-9]{10}$/).required(),
        prix: Joi.number().required(),
        commentaire: Joi.string(),
        etat: Joi.boolean(),
        nature_produit: Joi.string().required(),
        statut: Joi.string(),
        ouvrir: Joi.boolean(),
        is_simple: Joi.boolean(),
        is_remplace: Joi.boolean(),
        is_fragile: Joi.boolean(),
        code_ville: Joi.string(),
        code_suivi: Joi.string(),
        produits: Joi.array().items(Joi.object({
            produit: Joi.string().required(),
            variants: Joi.array().items(Joi.string())
        }))
    });
    return schema.validate(obj);
}

module.exports = {
    Colis,
    validateRegisterColis
};
