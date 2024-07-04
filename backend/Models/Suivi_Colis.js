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
    date_create: {
        type: Date,
        required: true
    }
    ,
    date_attend_ramassage: {
        type: Date,
        required: false
    },
    date_preparation: {
        type: Date,
        required: false
    },
    date_ramassage: {
        type: Date,
        required: false
    },
    date_exp: {
        type: Date,
        required: false
    },
    date_reçu: {
        type: Date,
        required: false
    },
    date_distribution: {
        type: Date,
        required: false
    },
    date_livraison: {
        type: Date,
        required: false
    }
    ,
    date_annule: {
        type: Date,
        required: false
    }
    ,
    date_programme: { // cette attric=rubut cet la colis changer date de livraison a une autre date 
        type: Date,
        required: false
    }
}, { timestamps: true });

const Suivi_Colis= mongoose.model("Suivi_Colis", Suivi_Colis_Schema);


module.exports={
    Suivi_Colis
}