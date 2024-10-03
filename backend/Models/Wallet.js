const { number } = require("joi");
const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema({
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    solde: {
        type: number,
        default : 0,
    },
   
}, { timestamps: true });

const Wallet = mongoose.model('Wallet', WalletSchema);

module.exports = {
    Wallet
};
