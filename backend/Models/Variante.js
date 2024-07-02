const moongose  = require("mongoose");

const VarianteSchema = new moongose.Schema({
    id_produit:{
       type: moongose.Schema.Types.ObjectId,
        ref:'Produit',

    },
    nom_variante:{
        type:String

    },
    quantite:{
        type:Number
    }


});

const Variante = moongose.model("Variante",VarianteSchema);


module.exports={
    Variante
}