const mongoose = require("mongoose");
const Joi = require("joi");

// Wallet Schema
const WalletSchema = new mongoose.Schema({
    key: {
        type: String,
        unique: true,
        required: true
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    solde: {
        type: Number,
        default: 0,
        required: true
    },
    active: {
        type: Boolean,
        default: true,
        required: true
    },
    activationDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Enforce one wallet per store
WalletSchema.index({ store: 1 }, { unique: true });

// Wallet Model
const Wallet = mongoose.model("Wallet", WalletSchema);

// Joi Validation for Wallet
function validateWallet(obj) {
    const schema = Joi.object({
        key: Joi.string().required(),
        store: Joi.string().required(),
        solde: Joi.number().min(0).optional(),
        active: Joi.boolean().optional(),
        activationDate: Joi.date().optional()
    });
    return schema.validate(obj);
}
module.exports = {
    Wallet,
    validateWallet
};
