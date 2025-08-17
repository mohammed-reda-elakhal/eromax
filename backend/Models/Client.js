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
    email: { type: String, required: true, trim: true, minlength: 5, maxlength: 100, unique: true, lowercase: true },
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
    // API integration fields
    // keyId: opaque, immutable; uniqueness enforced via partial index below (see Schema.index)
    keyId: { type: String, immutable: true },
    // apiKey: public identifier (cli_), unique (see Schema.index)
    apiKey: { type: String },
    // Hash of secret, never store raw; keep it excluded from default selects
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
    // Lifecycle status for the key
    status: { type: String, enum: ['inactive','pending_verification','active','suspended','revoked','expired'], default: 'inactive' },
    // Timestamps related to the API key lifecycle (createdAt is provided by timestamps option)
    activatedAt: { type: Date },
    lastUsedAt: { type: Date },
    revokedAt: { type: Date },
    expiresAt: { type: Date },
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }] //Array of fiels 
    
},{
    timestamps: true
})

// Index definitions (explicit, though some are already set on fields)
ClientSchema.index({ apiKey: 1 }, { unique: true, sparse: true });
// Enforce unique keyId only when it exists (safe during migration)
ClientSchema.index(
    { keyId: 1 }, 
    { unique: true, partialFilterExpression: { keyId: { $exists: true, $type: 'string' } } }
);
ClientSchema.index({ status: 1 });
ClientSchema.index({ lastUsedAt: 1 });
ClientSchema.index({ expiresAt: 1 });

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
        // API fields are system-managed; forbid in user payloads
        keyId: Joi.forbidden(),
        apiKey: Joi.forbidden(),
        apiSecretHash: Joi.forbidden(),
        status: Joi.forbidden(),
        activatedAt: Joi.forbidden(),
        lastUsedAt: Joi.forbidden(),
        revokedAt: Joi.forbidden(),
        expiresAt: Joi.forbidden(),
    });
    return clientJoiSchema.prefs({ stripUnknown: true }).validate(obj);
};


module.exports={
    Client , clientValidation
}