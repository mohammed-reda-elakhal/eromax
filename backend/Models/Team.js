const mongoose = require("mongoose");
const Joi = require("joi")

const teamSchema = new mongoose.Schema({
    //add additional attributes
    nom: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    prenom: { type: String, required: true, minlength: 2 },
    username: { type: String, minlength: 2 },
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
        default:'team'
    },
    file:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'file' 
    },
},{
 timestamps: true
})


const Team = mongoose.model("Team",teamSchema);

const teamValidation = (obj) => {
    const teamJoiSchema = Joi.object({
        nom: Joi.string().trim().min(2).max(100).required(),
        prenom: Joi.string().trim().min(2).required(),
        username: Joi.string().trim().min(2),
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
        role: Joi.string().default("team")
    });
    return teamJoiSchema.validate(obj);
}

module.exports={
    Team,
    teamValidation
}
