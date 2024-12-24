const mongoose = require("mongoose");
const Joi = require("joi");


const ClientSchema= new mongoose.Schema({
 
    nom: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    prenom: { type: String, required: true, minlength: 2 },
    username: { type: String, required: false , minlength : 2 },
    ville: { type: String, required: false },
    adresse: { type: String, required: false },
    tele: { type: String, required: false},
    cin: { type: String, required: false},
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
    verify: { type: Boolean, default: false },
    role: {
        type: String,
        required: true,
        default:'client'
    },
    start_date:{
        type:String,
    },
    number_colis:{
        type:String,
    },
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }] //Array of fiels 
    
},{
    timestamps: true
})

// Creating the Client model by extending the User model with discriminator
const Client= mongoose.model("Client",ClientSchema);

const clientValidation = (obj) => {
    const clientJoiSchema = Joi.object({
        nom: Joi.string().trim().min(2).max(100).required(),
        prenom: Joi.string().trim().min(2).required(),
        username: Joi.string().trim().min(2),
        ville: Joi.string(),
        adresse: Joi.string(),
        tele: Joi.string(),
        cin: Joi.string(),
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
        start_date: Joi.string(),
        number_colis: Joi.string(),
    });
    return clientJoiSchema.validate(obj);
};


module.exports={
    Client , clientValidation
}