const mongoose = require("mongoose");
const Joi = require("joi");


const ClientSchema= new mongoose.Schema({
 
    //add additional attributes
    Nom: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    Prenom: { type: String, required: true, minlength: 2 },
    ville: { type: String, required: true },
    adresse: { type: String, required: true },
    Tel: { type: String, required: true},
    password: { type: String, required: true, trim: true, minlength: 5 },
    email: { type: String, required: true, trim: true, minlength: 5, maxlength: 100, unique: true },
    profilePhoto: {
        type: Object,
        default: {
            url: "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png",
            publicId: null,
        }
    },
    isAccountVerified: { type: Boolean, default: false },
    role: {
        type: String,
        required: true,
        default:'client'
    },
    start:{
        type:String,
    },
    colis_num:{
        type:String,
    },
},{
    timestamps: true
})

// Creating the Client model by extending the User model with discriminator
const Client= mongoose.model("Client",ClientSchema);

const clientValidation = (obj) => {
    const clientJoiSchema = Joi.object({
        Nom: Joi.string().trim().min(2).max(100).required(),
        Prenom: Joi.string().trim().min(2).required(),
        ville: Joi.string().required(),
        adresse: Joi.string().required(),
        Tel: Joi.string().required(),
        password: Joi.string().trim().min(5).required(),
        email: Joi.string().email().trim().min(5).max(100).required(),
        profilePhoto: Joi.object({
            url: Joi.string().uri(),
            publicId: Joi.string().allow(null)
        }).default({
            url: "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png",
            publicId: null
        }),
        isAccountVerified: Joi.boolean().default(false),
        role: Joi.string().required(),
        start:Joi.string(),
        colis_num:Joi.string()
    });
    return clientJoiSchema.validate(obj);
}

module.exports={
    Client , clientValidation
}
