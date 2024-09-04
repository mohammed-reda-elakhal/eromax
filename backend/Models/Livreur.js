const mongoose = require("mongoose");
const Joi = require("joi");

const LivreurSchema = new mongoose.Schema({
    nom: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    prenom: { type: String, required: true, minlength: 2 },
    username: { type: String, minlength: 2 },
    ville: { type: String, required: true },
    adresse: { type: String, required: false },
    tele: { type: String, required: true },
    cin: { type: String, required: false },
    password: { type: String, required: true, trim: true, minlength: 5 },
    email: { type: String, required: true, trim: true, minlength: 5, maxlength: 100, unique: true },
    profile: {
        type: Object,
        default: {
            url: "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png",
            publicId: null,
        }
    },
    active: { type: Boolean, default: false },
    role: { type: String, required: true, default: 'livreur' },
    type: { type: String, required: true, default: 'simple' },
    domaine:{type : String , required : false},
    file: { type: mongoose.Schema.Types.ObjectId, ref: 'file' },

    // Add region attribute
    villes: {
        type: [String], 
        required: true
    }
}, { timestamps: true });

const Livreur = mongoose.model("Livreur", LivreurSchema);

const livreurValidation = (obj) => {
    const livreurJoiSchema = Joi.object({
        nom: Joi.string().trim().min(2).max(100).required(),
        prenom: Joi.string().trim().min(2).required(),
        username: Joi.string().trim().min(2),
        ville: Joi.string().required(),
        adresse: Joi.string().required(),
        tele: Joi.string().required(),
        type: Joi.string().required().default('simple'),
        domaine: Joi.string(),
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
        active: Joi.boolean().default(false),
        role: Joi.string().default("livreur"),

        // Joi validation for region
        villes: Joi.array().items(Joi.string()) // Region is optional but must follow this structure if provided
    });
    
    return livreurJoiSchema.validate(obj);
};

module.exports = {
    Livreur,
    livreurValidation
};
