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
    email: { type: String, required: true, trim: true, minlength: 5, maxlength: 100, unique: true, lowercase: true },
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
    file: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },

    // Add region attribute
    villes: {
        type: [String], 
        required: false
    },
    // API integration fields (indexes defined via Schema.index below)
    keyId: { type: String, immutable: true },
    apiKey: { type: String },
    apiSecretHash: { 
        type: String, 
        select: false,
        validate: {
            validator: function(v) {
                if (!v) return true; // allow empty/not set
                const bcrypt = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
                const argon2id = /^\$argon2id\$v=\d+\$m=\d+,t=\d+,p=\d+\$[A-Za-z0-9_\-+/=]+\$[A-Za-z0-9_\-+/=]+$/;
                return bcrypt.test(v) || argon2id.test(v);
            },
            message: 'apiSecretHash must be a valid bcrypt or argon2id hash.'
        }
    },
    status: { type: String, enum: ['inactive','pending_verification','active','suspended','revoked','expired'], default: 'inactive' },
    activatedAt: { type: Date },
    lastUsedAt: { type: Date },
    revokedAt: { type: Date },
    expiresAt: { type: Date },
}, { timestamps: true });

// Indexes for API key management
LivreurSchema.index({ apiKey: 1 }, { unique: true, sparse: true });
// Enforce unique keyId only when it exists (safe during migration)
LivreurSchema.index(
    { keyId: 1 },
    { unique: true, partialFilterExpression: { keyId: { $exists: true, $type: 'string' } } }
);
LivreurSchema.index({ status: 1 });
LivreurSchema.index({ lastUsedAt: 1 });
LivreurSchema.index({ expiresAt: 1 });

const Livreur = mongoose.model("Livreur", LivreurSchema);

const livreurValidation = (obj) => {
    const livreurJoiSchema = Joi.object({
        nom: Joi.string().trim().min(2).max(100).required(),
        prenom: Joi.string().trim().min(2).required(),
        username: Joi.string().trim().min(2).optional(),
        ville: Joi.string().required(),
        adresse: Joi.string().optional(),
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
        villes: Joi.array().items(Joi.string()).optional(), // Optional and allows array of strings
        // API fields are system-managed; forbid in user payloads
        keyId: Joi.forbidden(),
        apiKey: Joi.forbidden(),
        apiSecretHash: Joi.forbidden(),
        status: Joi.forbidden(),
        activatedAt: Joi.forbidden(),
        lastUsedAt: Joi.forbidden(),
        revokedAt: Joi.forbidden(),
        expiresAt: Joi.forbidden()
    });
    
    return livreurJoiSchema.prefs({ stripUnknown: true }).validate(obj);
};


module.exports = {
    Livreur,
    livreurValidation
};
