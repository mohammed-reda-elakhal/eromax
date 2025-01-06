const mongoose = require('mongoose');
const shortid = require('shortid');

// Updated Facture Schema
const FactureSchema = new mongoose.Schema(
    {
        code_facture: {
            type: String,
            unique: true,
            required: true,
        },
        type: {
            type: String,
            enum: ['client', 'livreur'],
            required: true,
        },
        store: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
            required: function () {
                return this.type === 'client';
            },
        },
        livreur: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Livreur',
            required: function () {
                return this.type === 'livreur';
            },
        },
        date: {
            type: Date,
            required: false,
        },
        colis: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Colis',
                required: true,
            },
        ],
        totalPrix: {
            type: Number,
            required: true,
            default: 0,
        },
        totalTarifLivraison: {
            type: Number,
            required: true,
            default: 0,
        },
        totalTarifFragile: {
            type: Number,
            required: true,
            default: 0,
        },
        totalTarifAjouter: {
            type: Number,
            required: true,
            default: 0,
        },
        totalTarif: {
            type: Number,
            required: true,
            default: 0,
        },
        totalFraisRefus: { // Added Field
            type: Number,
            required: false,
            default: 0,
        },
        originalTarifLivraison: {
            type: Number,
            required: true,
            default: 0,
        },
        etat: {
            type: Boolean,
            required: false,
            default: false,
        },
        promotion: {
            type: {
                type: String,
                enum: ['fixed_tarif', 'percentage_discount'],
            },
            value: {
                type: Number,
            },
            startDate: {
                type: Date,
            },
            endDate: {
                type: Date,
            },
            appliesTo: {
                type: String,
                enum: ['all', 'specific'],
            },
            clients: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Store',
                },
            ],
        },
    },
    {
        timestamps: true,
    }
);

const Facture = mongoose.model('Facture', FactureSchema);

module.exports = Facture;
