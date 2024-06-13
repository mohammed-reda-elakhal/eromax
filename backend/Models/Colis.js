const mongoose = require ("mongoose");
const Joi = require("joi");
const shortid = require('shortid');

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
        default:"En attente de ramassage ",

    },
    etat_payement:{ type: Boolean},

    ouvrir: {  type: Boolean},

    is_simple: {  type: Boolean},

    a_remplace:{  type: Boolean},
    
    id_client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    id_livreur: { type: mongoose.Schema.Types.ObjectId, ref: 'Livreur' }
    
    

    
    


},{
    timestamps:true  //genreate created at and updated up automatically 
});

//generate code suivi 
ColisSchema.pre('save', function(next) {
    if (!this.code_suivi) {
        this.code_suivi = shortid.generate();
    }
    next();
    console.log(this.code_suivi);
});


//Colis Model
const  Colis = mongoose.model("Colis",ColisSchema);

// validate Colis 

function validateRegisterColis(obj){
    const schema = Joi.object({
        
        adresse_Resp: Joi.string().required(),
        id_store:Joi.string().trim(),
        CIN:Joi.string().required().min(5),
        Nom_Resp:Joi.string().required(),
        ville_Resp:Joi.string().required(),
        Tel_Resp:Joi.string().pattern(/^[0-9]{10}$/).required(),
        Nature_Produit:Joi.string().required(),
        Price: Joi.number().required(),
        Commentaire:Joi.string(),
        etat:Joi.string(),
        

    
    });
    return schema.validate(obj);
}
module.exports={
    Colis ,
    
    validateRegisterColis
}