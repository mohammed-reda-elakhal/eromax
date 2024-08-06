const mongoose = require("mongoose");
const Joi = require("joi");


const ClientSchema= new mongoose.Schema({
 
    //add additional attributes
    nom: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    prenom: { type: String, required: true, minlength: 2 },
    username: { type: String, required: true , minlength : 2 },
    ville: { type: String, required: true },
    adresse: { type: String, required: true },
    tele: { type: String, required: true},
    password: { type: String, required: true, trim: true, minlength: 5 },
    email: { type: String, required: true, trim: true, minlength: 5, maxlength: 100, unique: true },
    profile: {
        type: Object,
        default: {
            url: "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png",
            publicId: null,
        }
    },
    active: { type: Boolean, default: true },
    role: {
        type: String,
        required: true,
        default:'client'
    },
    start_date:{
        type:String,
    },
<<<<<<< HEAD
    number_colis:{
        type:String,
    },
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }] //Array of fiels 
    
=======
    nomber_colis:{
        type:String,
    },
    file:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'file' 
    },
>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada
},{
    timestamps: true
})

// Creating the Client model by extending the User model with discriminator
const Client= mongoose.model("Client",ClientSchema);

const clientValidation = (obj) => {
    const clientJoiSchema = Joi.object({
        nom: Joi.string().trim().min(2).max(100).required(),
        prenom: Joi.string().trim().min(2).required(),
        username: Joi.string().trim().min(2).required(),
        ville: Joi.string().required(),
        adresse: Joi.string().required(),
        tele: Joi.string().required(),
        password: Joi.string().trim().min(5).required(),
        email: Joi.string().email().trim().min(5).max(100).required(),
        profile: Joi.object({
            url: Joi.string().uri(),
            publicId: Joi.string().allow(null)
        }).default({
            url: "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png",
            publicId: null
        }),
        active: Joi.boolean().default(true),
        role: Joi.string().default("client"),
        start_date:Joi.string(),
<<<<<<< HEAD
        number_colis:Joi.string(),
=======
        nomber_colis:Joi.string(),
>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada
    });
    return clientJoiSchema.validate(obj);
}

module.exports={
    Client , clientValidation
}