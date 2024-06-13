const mongoose = require("mongoose");

const PortfolioSchema = new mongoose.Schema({
    id_client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    balance: {
        type: Number,
        default: 0
    }
}, { timestamps: true });


const Portfolio =  mongoose.model("Portfolio", PortfolioSchema);

module.exports ={
    Portfolios
}
