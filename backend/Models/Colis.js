const mongoose = require ("mongoose");
const Joi = require("joi");
const shortid = require('shortid');

//User Schema 
const ColisSchema = new mongoose.Schema({
    id_Colis: {
        type: String,
        unique: true,
        default: shortid.generate
    },
    code_suivi:{
        type:String,
        unique:true,
    },

    Nom_des:{
        type:String,
        required:true,

    },
    Tel_des:{
        type:Number,
        required :true,
        trim:true,
        minlenght:10,
        maxlength:10,
        //unique:true,


    },
    ville_des:{
        type:String,
        required:true,
    },
    code_ville:{
       type: mongoose.Schema.Types.ObjectId, ref: 'Ville' 

    },
    adresse_des:{
        type:String,
        required:true,
    },
    Commentaire:{
        type:String,

    },
    Price_total:{
        type:Number,
        required:true,
    },
    Nature_Produit:{
        type:String,
        required:true,

    },
    // etat de payement
    etat:{
        type : Boolean ,
        default : false,
    },
    statut:{
        type:String,
        default:"attente de ramassage",
    },
    ouvrir: {  
        type: Boolean,
        default : true ,
    },
    is_simple: {  type: Boolean},
    a_remplace:{  type: Boolean},
    id_client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },// a verifier 
    id_livreur: { type: mongoose.Schema.Types.ObjectId, ref: 'Livreur' },
    id_store:{type: mongoose.Schema.Types.ObjectId, ref: 'Store'}

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
        adresse_des: Joi.string().required(),
        //CIN:Joi.string().required().min(5),
        Nom_des:Joi.string().required(),
        ville_des:Joi.string().required(),
        Tel_des:Joi.string().pattern(/^[0-9]{10}$/).required(),
        Price_total: Joi.number().required(),
        Commentaire:Joi.string(),
        etat:Joi.string(),
        Nature_Produit:Joi.string(),
        statut: Joi.string(),
        ouvrir:Joi.boolean(),
        is_simple:Joi.boolean(),
        a_remplace:Joi.boolean(),
        id_client:Joi.string(),
        id_livreur:Joi.string(),
        id_store:Joi.string(),
        code_ville:Joi.string(),
        code_suivi:Joi.string(),

    
    });
    return schema.validate(obj);
}
module.exports={
    Colis ,
    
    validateRegisterColis
}