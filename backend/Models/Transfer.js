const mongoose = require("mongoose");
const Joi = require("joi");

// Transfer Schema
const TransferSchema = new mongoose.Schema({
    colis: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Colis',
        required: function() {
            return this.type !== 'Manuel Depot' && this.type !== 'Manuel Withdrawal' && this.type !== 'withdrawal';
        }
    },
    wallet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true
    },
    type: {
        type: String,
        enum: ['Deposit', 'Correction', 'Manuel Depot', 'Manuel Withdrawal', 'withdrawal'],
        default: 'Deposit',
        required: true
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
    commentaire: {
        type: String,
        required: function() {
            return this.type === 'Manuel Depot' || this.type === 'Manuel Withdrawal' || this.type === 'withdrawal';
        }
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: function() {
            return this.type === 'Manuel Depot' || this.type === 'Manuel Withdrawal';
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
        colis: Joi.string().when('type', {
            is: Joi.string().valid('Manuel Depot', 'Manuel Withdrawal', 'withdrawal'),
            then: Joi.optional(),
            otherwise: Joi.required()
        }),
        wallet: Joi.string().required(),
        type: Joi.string().valid('Deposit', 'Correction', 'Manuel Depot', 'Manuel Withdrawal', 'withdrawal'),
        status: Joi.string().valid('validé', 'corrigé', 'annuler', 'pending').default('validé'),
        description: Joi.string().when('type', {
            is: 'Correction',
            then: Joi.required(),
            otherwise: Joi.optional()
        }),
        commentaire: Joi.string().when('type', {
            is: Joi.string().valid('Manuel Depot', 'Manuel Withdrawal', 'withdrawal'),
            then: Joi.required(),
            otherwise: Joi.optional()
        }),
        admin: Joi.string().when('type', {
            is: Joi.string().valid('Manuel Depot', 'Manuel Withdrawal'),
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