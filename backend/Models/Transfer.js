const mongoose = require("mongoose");
const Joi = require("joi");

// Transfer Schema
const TransferSchema = new mongoose.Schema({
    colis: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Colis',
        required: true
    },
    wallet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true
    },
    type: {
        type: String,
        enum: ['Deposit', 'Correction'],
        default: 'Deposit',
        required: false
    },
    status: {
        type: String,
        enum: ['validé', 'corrigé', 'annuler', 'pending'],
        default: 'validé',
        required: true
    },
    description: {
        type: String,
        required: function() {
            return this.type === 'Correction';
        }
    },
    montant: {
        type: Number,
        required: true
    },
    originalMontant: {
        type: Number,
        default: null
    },
    correctionDate: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Transfer Model
const Transfer = mongoose.model("Transfer", TransferSchema);

// Joi Validation for Transfer
function validateTransfer(obj) {
    const schema = Joi.object({
        colis: Joi.string().required(),
        wallet: Joi.string().required(),
        type: Joi.string().valid('Deposit', 'Correction'),
        status: Joi.string().valid('validé', 'corrigé', 'annuler', 'pending').default('validé'),
        description: Joi.string().when('type', {
            is: 'Correction',
            then: Joi.required(),
            otherwise: Joi.optional()
        }),
        montant: Joi.number().required(),
        originalMontant: Joi.number().optional(),
        correctionDate: Joi.date().optional()
    });
    return schema.validate(obj);
}

module.exports = {
    Transfer,
    validateTransfer
}; 