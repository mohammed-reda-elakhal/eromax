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
    wallet_prosseced: {
        type: Boolean,
        default: false
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
        required: false,
    },
    commentaire: {
        type: String,
    },
    note: {
        type: String,
    },
    comment_annule: {
        type: String,
    },
    comment_refuse: {
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
        required: false,
    },
    etat: {
        type: Boolean,
        default: false,
    },
    statut: {
        type: String,
        default: "Nouveau Colis",
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
            "En Retour",
            "Préparer pour Roteur",
            "Remplacée",
            "Fermée",
            "Boite vocale",
            "Pas de reponse jour 1",
            "Pas de reponse jour 2",
            "Pas de reponse jour 3",
            "Pas reponse + sms / + whatsap",
            "En voyage",
            "Injoignable",
            "Hors-zone",
            "Intéressé",
            "Numéro Incorrect",
            "Reporté",
            "Confirmé Par Livreur",
            "Endomagé",
            "Prét Pour Expédition",
            "Manque de stock",
            "Intéressé"
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
    date_reporte: {
        type: Date,
    },
    date_livraisant: {
        type: Date,
    },
    code_suivi_ameex: {
        type: String,
        required: false
    },
    code_suivi_gdil:{
        type: String,
        required: false

    },
    expedation_type: {
        type: String,
        required: false,
        default: 'eromax'
    },
    pret_payant: {
        type: Boolean,
        default: false,
    },
    tarif_ajouter: {
        value: {
            type: Number,
            default: 0,
        },
        description: {
            type: String,
            default: '',
        }
    },
    // New Attribute: crbt
    crbt: {
        prix_colis: {
            type: Number,
            default: 0,
        },
        tarif_livraison: {
            type: Number,
            default: 0,
        },
        tarif_refuse: {
            type: Number,
            default: 0,
        },
        tarif_fragile: {
            type: Number,
            default: 0,
        },
        tarif_supplementaire: {
            type: Number,
            default: 0,
        },
        prix_a_payant: {
            type: Number,
            default: 0,
        },
        total_tarif: {
            type: Number,
            default: 0,
        }
    },
    // New Attribute: statu_final
    statu_final: {
        type: String,
        enum: [
            "Livrée",
            "Refusée"
        ],
        default: null,
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
        adresse: Joi.string().allow('', null),
        nom: Joi.string().required(),
        ville: Joi.string().required(),
        tele: Joi.string().required(),
        prix: Joi.number().required(),
        commentaire: Joi.string(),
        etat: Joi.boolean(),
        wallet_prosseced: Joi.boolean(),
        nature_produit: Joi.string().allow('', null),
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
            "En Retour",
            "Remplacée",
            "Fermée",
            "Boite vocale",
            "Pas de reponse jour 1",
            "Pas de reponse jour 2",
            "Pas de reponse jour 3",
            "Pas reponse + sms / + whatsap",
            "En voyage",
            "Injoignable",
            "Hors-zone",
            "Intéressé",
            "Numéro Incorrect",
            "Reporté",
            "Confirmé Par Livreur",
            "Endomagé",
            "Préparer pour Roteur",
            "Prét Pour Expédition",
            "Manque de stock",
            "Intéressé"
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
        expedation_type: Joi.string(),
        code_suivi_ameex: Joi.string(),
        tarif_ajouter: Joi.object({
            value: Joi.number(),
            description: Joi.string(),
        }),
        pret_payant : Joi.boolean(),
        // New Attributes in Validation
        crbt: Joi.object({
            prix_colis: Joi.number(),
            tarif_livraison: Joi.number(),
            tarif_refuse: Joi.number(),
            tarif_fragile: Joi.number(),
            tarif_supplementaire: Joi.number(),
            prix_a_payant: Joi.number(),
            total_tarif: Joi.number(),
        }),
        statu_final: Joi.string().valid("Livrée", "Refusée").allow(null),
    });
    return schema.validate(obj);
}

// ColisSchema pre-save hook
ColisSchema.pre('save', function(next) {
    if (this.isModified('statut')) {
        if (['Livrée', 'Refusée'].includes(this.statut)) {
            this.statu_final = this.statut;
        }
    }
    next();
});



module.exports = {
    Colis,
    validateRegisterColis
};
