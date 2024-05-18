const mongoose = require ("mongoose");
const Joi = require("joi");

//User Schema 
const ColisSchema = new mongoose.Schema({
    id_Colis:{
        type:String,
        unique:true,
    },
    code_suivi:{
        type:String,
        unique:true,
    },
    id_store:{
        type:String,
    },
    Nom_Resp:{
        type:String,
        required:true,

    },
    Tel_Resp:{
        type:Number,
        required :true,
        trim:true,
        minlenght:10,
        maxlength:10,
        //unique:true,


    },
    ville_Resp:{
        type:String,
        required:true,
    },
    adresse_Resp:{
        type:String,
        required:true,
    },
    Commentaire:{
        type:String,

    },
    Price:{
        type:Number,
        required:true,
    },
    Nature_Produit:{
        type:String,
        required:true,

    },
    etat:{

    },
    statut:{
        type:String,
        default:"En cours de rammasaage ",

    },
    Date_liv:{
        type:Date,
    }
    

    
    


},{
    timestamps:true  //genreate created at and updated up automatically 
});


//Colis Model
const  Colis = mongoose.model("Colis",ColisSchema);

// validate Colis 

function validateRegisterColis(obj){
    const schema = Joi.object({
        
        adresse_Resp: Joi.string().required(),
        CIN:Joi.string().required().min(5),
        Nom_Resp:Joi.string().required(),
        ville_Resp:Joi.string().required(),
        Tel_Resp:Joi.number().max(10).required().max(10),
        Nature_Produit:Joi.string().required(),
        

    
    });
    return schema.validate(obj);
}
module.exports={
    Colis ,
    
    validateRegisterColis
}