const mongoose = require("mongoose")



const Suivi_Colis_Schema = new mongoose.Schema({

    id_colis: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Colis',
        required: true
    },
    code_suivi: {
        type: String,
        required: true,
        unique: true
    },
    date_ramassage: {
        type: Date,
        required: true
    },
    date_exp: {
        type: Date,
        required: true
    },
    date_distribution: {
        type: Date,
        required: true
    },
    date_livraison: {
        type: Date,
        required: true
    }
}, { timestamps: true });

const Suivi_Colis= mongoose.model("Suivi_Colis", Suivi_Colis_Schema);


module.exports={
    Suivi_Colis
}