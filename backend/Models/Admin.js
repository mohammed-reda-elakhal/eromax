const mongoose = require("mongoose");
const Joi = require("joi");

const AdminSchema = new mongoose.Schema({
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
        default: 'admin'
    },
    message: {
        type: String,
        required: false
    },
    permission: {
        type: String,
        enum: ['all', 'none'],  // Define allowed permissions
        default: 'none'         // Default permission for new users
    },
    type: {
        type: String,
        enum: ['super', 'normal'],  // Only 'super_admin' or 'admin' allowed
        default: 'normal'                // Default type for new users
    }
}, {
    timestamps: true
});


const Admin = mongoose.model("Admin", AdminSchema);

// Validation schema for Admin data
const adminValidation = (obj) => {
    const adminJoiSchema = Joi.object({
        nom: Joi.string().trim().min(2).max(100).required(),
        prenom: Joi.string().trim().min(2).required(),
        username: Joi.string(),
        message: Joi.string(),
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
        permission: Joi.string().valid('all', 'none').default('none'), // Validate permission field
        type: Joi.string().valid('super', 'normal').default('normal') // Validate type field
    });
    return adminJoiSchema.validate(obj);
}

const validateLogin = (obj) => {
    const adminJoiSchema = Joi.object({
        username: Joi.string().trim(),
        password: Joi.string().trim().min(5).required(),
        email: Joi.string().email().trim().min(5).max(100).required(),
    });
    return adminJoiSchema.validate(obj);
}

module.exports = {
    Admin,
    adminValidation,
    validateLogin
};
