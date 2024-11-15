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
    active: { type: Boolean, default: true },
    role: { type: String, required: true, default: 'livreur' },
    type: { type: String, required: false, default: 'simple' },
    tarif:{type :Number , required:false},
    domaine:{type : String , required : false},
    file: { type: mongoose.Schema.Types.ObjectId, ref: 'file' },

    // Add region attribute
    villes: {
        type: [String], 
        required: false
    }
}, { timestamps: true });

const Livreur = mongoose.model("Livreur", LivreurSchema);

const livreurValidation = (obj) => {
    const livreurJoiSchema = Joi.object({
        nom: Joi.string().trim().min(2).max(100).required(),
        prenom: Joi.string().trim().min(2).required(),
        username: Joi.string().trim().min(2).optional(),
        ville: Joi.string().required(),
        adresse: Joi.string().required(),
        tele: Joi.string().required(),
        type: Joi.string().default('simple').optional(),
        domaine: Joi.string().optional(),
        cin: Joi.string().optional(),
        password: Joi.string().trim().min(5).required(),
        email: Joi.string().email().trim().min(5).max(100).required(),
        profile: Joi.object({
            url: Joi.string().uri().optional(),
            publicId: Joi.string().allow(null).optional()
        }).default({
            url: "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png",
            publicId: null
        }),
        active: Joi.boolean().default(true).optional(),
        role: Joi.string().default("livreur").optional(),
        tarif: Joi.number().optional(),
        villes: Joi.array().items(Joi.string()).optional() // Optional and allows array of strings
    });
    
    return livreurJoiSchema.validate(obj);
};


module.exports = {
    Livreur,
    livreurValidation
};
