// models/Colis.js

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
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
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
        type: String, // Changed to String for better handling of leading zeros
        required: true,
        trim: true,
    },
    ville: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ville',
        required: true
    },
    adresse: {
        type: String,
        required: true,
    },
    commentaire: {
        type: String,
    },
    comment_annule:{
        type: String,
    },
    comment_refuse:{
        type: String,
    },
    prix: {
        type: Number,
        required: true,
    },
    prix_payer: {
        type: Number,
        default: 0,
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
        enum: [
            "Nouveau Colis",
            "attente de ramassage",
            "Ramassée",
            "Expediée",
            "Reçu",
            "Mise en Distribution",
            "Livrée",
            "Annulée",
            "Programmée",
            "Refusée",
            "En retour",
            "Remplacée"
        ]
    },
    ouvrir: {
        type: Boolean,
        default: true,
    },
    is_simple: {
        type: Boolean,
        default: true,
    },
    is_remplace: {
        type: Boolean,
        default: false,
    },
    is_fragile: {
        type: Boolean,
        default: false,
    },
    produits: [{
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
    date_programme: {
        type: Date,
    },
    date_livraisant: {
        type: Date,
    },
    replacedColis: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Colis',
        default: null, // Change from array to single reference
    },
    code_suivi_ameex: {
        type: String,
        required : false 
    },
    expedation_type : {
        type:String ,
        required : false ,
        default : 'eromax'
    }
}, {
    timestamps: true
});

// Generate code suivi
ColisSchema.pre('save', function (next) {
    if (!this.code_suivi) {
        this.code_suivi = shortid.generate();
    }
    next();
});

// Colis Model
const Colis = mongoose.model("Colis", ColisSchema);

// Joi Validation for Colis
function validateRegisterColis(obj) {
    const schema = Joi.object({
        adresse: Joi.string().required(),
        nom: Joi.string().required(),
        ville: Joi.string().required(),
        tele: Joi.string().required(),
        prix: Joi.number().required(),
        commentaire: Joi.string(),
        etat: Joi.boolean(),
        nature_produit: Joi.string().required(),
        statut: Joi.string().valid(...[
            "Nouveau Colis",
            "attente de ramassage",
            "Ramassée",
            "Expediée",
            "Reçu",
            "Mise en Distribution",
            "Livrée",
            "Annulée",
            "Programmée",
            "Refusée",
            "En retour",
            "Remplacée"
        ]),
        ouvrir: Joi.boolean(),
        is_simple: Joi.boolean(),
        is_remplace: Joi.boolean(),
        is_fragile: Joi.boolean(),
        code_suivi: Joi.string(),
        produits: Joi.array().items(
            Joi.object({
                produit: Joi.string().required(),
                variants: Joi.array().items(Joi.string()),
            })
        ),
        replacedColis:Joi.string(), // New field for replaced colis
        expedation_type : Joi.string(),
        code_suivi_ameex : Joi.string(),

    });
    return schema.validate(obj);
}

module.exports = {
    Colis,
    validateRegisterColis
};
