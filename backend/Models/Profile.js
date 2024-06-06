const Joi = require("joi");
const mongoose = require("mongoose");

// User Schema
const ProfileSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    CIN: {
        type: String,
        minlength: 5,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 100,
        unique: true,
    },
    ville: {
        type: String,
        required: true,
    },
    adresse: {
        type: String,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
    },
    Tel: {
        type: String,
        required: true,
        maxlength: 10,
        minlength: 10
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isAccountVerified: {
        type: Boolean,
        default: false,
    },
    profilePhoto: {
        type: Object,
        default: {
            url: "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png",
            publicId: null,
        }
    },
    info: {
        type: Object,
        default: {
            date_start: "",
            number_colis: "",
        }
    }
}, {
    timestamps: true // generate createdAt and updatedAt automatically
});

// Profile Model
const Profile = mongoose.model("Profile", ProfileSchema);

function validateRegisterProfile(obj) {
    const schema = Joi.object({
        username: Joi.string().trim().min(2).max(100).required(),
        CIN: Joi.string().min(5).allow(''),  // Assuming CIN can be optional
        email: Joi.string().trim().min(5).max(100).required().email(),
        ville: Joi.string().required(),
        adresse: Joi.string().allow(''),  // Assuming adresse can be optional
        password: Joi.string().trim().min(5).required(),
        Tel: Joi.string().required().length(10),
        isAdmin: Joi.boolean().optional(),  // Assuming isAdmin can be optional
        isAccountVerified: Joi.boolean().optional(),  // Assuming isAccountVerified can be optional
        profilePhoto: Joi.object().optional(),  // Assuming profilePhoto can be optional
        info: Joi.object().optional(),  // Assuming info can be optional
        date_start: Joi.string().allow(''),
        number_colis: Joi.string().allow('')
    });
    return schema.validate(obj);
}

// Validate Login Profile
function validateLoginProfile(obj) {
    const schema = Joi.object({
        email: Joi.string().trim().min(8).max(100).required().email(),
        password: Joi.string().trim().min(5).required(),
    });
    return schema.validate(obj);
}

module.exports = {
    Profile,
    validateRegisterProfile,
    validateLoginProfile
};
