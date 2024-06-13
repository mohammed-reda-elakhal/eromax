const { required, boolean, bool } = require("joi");
const mongoose = require("mongoose");


const ProduitSchema = new mongoose.Schema({
    id_produit:{},
    nom_produit:{
        type:String,
        required:true,
    },
    produit_type:{
        type:String,
        required:true,
    },
    quantite:{
        type:Number
    },
    is_recu:{
        type:bool,

    },
    id_client:{
        type:moongose.Schema.Types.ObjectId,
        ref:'Client',
    },
    variants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Variante' }]


});
const Produit = mongoose.model("Produit",ProduitSchema); 

module.exports={
    Produit
}