const moongose= require("mongoose");
const Joi = require("joi");
const { default: mongoose } = require("mongoose");


const AdminSchema = new moongose.Schema({
    //add additional attributes
    nom: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    prenom: { type: String, required: true, minlength: 2 },
    username: { type: String , minlength: 2 },
    tele: { type: String, required: true },
    password: { type: String, required: true, trim: true, minlength: 5 },
    email: { type: String, required: true, trim: true, minlength: 5, maxlength: 100, unique: true },
    profile: {
        type: Object,
        default: {
            url: "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png",
            publicId: null,
        }
    },
    role: {
        type: String,
        required: true,
        default:'admin'
    }
},{
    timestamps: true
});

const Admin = mongoose.model("Admin",AdminSchema);

const adminValidation = (obj) => {
    const adminJoiSchema = Joi.object({
        nom: Joi.string().trim().min(2).max(100).required(),
        prenom: Joi.string().trim().min(2).required(),
        username: Joi.string(),
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
        role: Joi.string().default("admin"),
    });
    return adminJoiSchema.validate(obj);
}

const validateLogin = (obj) => {
    const adminJoiSchema = Joi.object({
        username:Joi.string().trim(),
        password: Joi.string().trim().min(5).required(),
        email: Joi.string().email().trim().min(5).max(100).required(),
        username : Joi.string().trim()
    });
    return adminJoiSchema.validate(obj);
}
module.exports={
    Admin,
    adminValidation,
    validateLogin
}