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
    }
}, {
    timestamps: true
});

// Wallet Model
const Wallet = mongoose.model("Wallet", WalletSchema);

// Joi Validation for Wallet
function validateWallet(obj) {
    const schema = Joi.object({
        key: Joi.string().required(),
        store: Joi.string().required(),
        solde: Joi.number().required(),
        active: Joi.boolean().required()
    });
    return schema.validate(obj);
}

module.exports = {
    Wallet,
    validateWallet
};
