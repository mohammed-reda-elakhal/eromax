const mongoose = require("mongoose");
const Joi = require("joi");

// Variant Schema
const VariantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});

// Product Schema
const ProductSchema = new mongoose.Schema({
    id_client: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Client'  
    },// a verifier 
    nom: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 255,
    },
    image: {
        type: Object,
        default: {
            url: "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png",
            publicId: null,
        }
    },
    categorie: {
        type: String,
        required: false,
        trim: true,
    },
    quantite: {
        type: Number,
        required: true,
    },
    
    variants: [VariantSchema], // Array of variants
    etat: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Joi Validation for Product
function validateProduit(product) {
    const schema = Joi.object({
        nom: Joi.string().trim().min(2).max(255).required(),
        image: Joi.object({
            url: Joi.string().uri(),
            publicId: Joi.string().allow(null)
        }).default({
            url: "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png",
            publicId: null
        }),
        categorie: Joi.string().trim(),
        quantite: Joi.number(),
        variants: Joi.array().items(Joi.object({
            name: Joi.string(),
            stock: Joi.number(),
        })),
        etat: Joi.boolean().default(false),
        id_client : Joi.string(),
    });

    return schema.validate(product);
}

const Produit = mongoose.model("Product", ProductSchema);

module.exports = {
    Produit,
    validateProduit,
};