const Joi = require("joi");
const mongoose = require ("mongoose");

//User schema
const options = {discriminatorKey:'type',collection:'users'}
const UserSchema = new mongoose.Schema({

    Nom:{
        type:String,
        required:true,
        trim:true,
        minlenght:2,
        maxlenght:100
    },
    Prenom:{
        type:String,
        required:true,
        mainlenght:5,


    },
    ville:{
        type:String,
        required:true,
    },
    adresse:{
        type:String,
        required:true,
    },
  
    Tel:{
        type:Number,
        required:true,
        maxlenght:10,
        minlenght:10
    },
    password:{
        type:String,
        required :true,
        trim:true,
        minlenght:5,
    },
    email:{
        type:String,
        required :true,
        trim:true,
        minlenght:5,
        maxlength:100,
        unique:true,
    },
    profilePhoto: {
        type:Object,
        default:{
            url:"https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png",
            publicId :null,
        }

    },
    isAccountVerified:{
        type:Boolean,
        default:false,
    },
   



},
{timestamps:true},//generate updated at and created at automatically
options,




);


//Joi validation 
function userValidation(ibj){

    const userJoiSchema = Joi.object({
        Nom: Joi.string().trim().min(2).max(100).required(),
        Prenom: Joi.string().trim().min(5).required(),
        ville: Joi.string().required(),
        adresse: Joi.string().required(),
        Tel: Joi.string().length(10).required(),
        password: Joi.string().trim().min(5).required(),
        email: Joi.string().email().trim().min(5).max(100).required(),
        profilePhoto: Joi.object({
            url: Joi.string().uri(),
            publicId: Joi.string().allow(null)
        }).default({
            url: "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png",
            publicId: null
        }),
        isAccountVerified: Joi.boolean().default(false)
    });

}


const User= mongoose.model("User",UserSchema);
module.exports={
    User,
    userValidation
}