const mongoose = require("mongoose");
const Joi = require("joi");

// Stock Schema
const StockSchema = new mongoose.Schema({
    // ============ OWNERSHIP & ASSOCIATION ============
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
        index: true,
        description: "Client who owns this stock"
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
        index: true,
        description: "Store associated with this stock"
    },
    
    // ============ PRODUCT INFORMATION ============
    // Optional reference to product catalog
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: null,
        description: "Reference to product in catalog (optional)"
    },
    
    // Product details (always required, even if linked to catalog)
    productName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255,
        description: "Product name"
    },
    productDescription: {
        type: String,
        trim: true,
        maxlength: 1000,
        description: "Product description"
    },
    
    // ============ VARIANT SUPPORT ============
    hasVariants: {
        type: Boolean,
        default: false,
        description: "Whether this stock item has variants (size, color, etc)"
    },
    variantId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        description: "Reference to variant _id from Product.variants array"
    },
    variantName: {
        type: String,
        default: null,
        trim: true,
        maxlength: 100,
        description: "Variant name (e.g., 'Red - Large', 'Blue - 256GB')"
    },
    
    // ============ SKU & IDENTIFICATION ============
    sku: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        maxlength: 50,
        description: "Stock Keeping Unit - must be unique per client"
    },
    barcode: {
        type: String,
        trim: true,
        default: null,
        maxlength: 50,
        description: "Product barcode (optional)"
    },
    
    // ============ QUANTITY MANAGEMENT ============
    quantite_initial: {
        type: Number,
        required: true,
        min: 0,
        description: "Initial quantity when stock created/approved"
    },
    quantite_disponible: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
        description: "Available quantity for creating new colis"
    },
    quantite_reservee: {
        type: Number,
        default: 0,
        min: 0,
        description: "Quantity reserved for pending/in-process colis"
    },
    quantite_utilisee: {
        type: Number,
        default: 0,
        min: 0,
        description: "Total quantity used in delivered colis"
    },
    quantite_minimum: {
        type: Number,
        default: 10,
        min: 0,
        description: "Minimum quantity threshold for low stock alert"
    },
    
    // ============ STATUS & WORKFLOW ============
    status: {
        type: String,
        enum: [
            'pending',      // Client created, awaiting admin confirmation
            'confirmed',    // Admin confirmed (will auto-become 'active')
            'rejected',     // Admin rejected
            'active',       // Active and can be used in colis
            'inactive',     // Temporarily disabled
            'depleted'      // Quantity reached 0
        ],
        default: 'pending',
        required: true,
        index: true,
        description: "Current status of stock item"
    },
    
    // ============ PRICING ============
    unitCost: {
        type: Number,
        default: 0,
        min: 0,
        description: "Cost per unit (for client reference/accounting)"
    },
    unitPrice: {
        type: Number,
        default: 0,
        min: 0,
        description: "Selling price per unit"
    },
    currency: {
        type: String,
        default: "MAD",
        maxlength: 10
    },
    
    // ============ LOCATION & STORAGE ============
    location: {
        type: String,
        default: "siege",
        trim: true,
        maxlength: 100,
        description: "Storage location (e.g., siege, shelf A3, warehouse)"
    },
    zone: {
        type: String,
        trim: true,
        maxlength: 50,
        description: "Storage zone or section within location"
    },
    
    // ============ PRODUCT SPECIFICATIONS ============
    dimensions: {
        length: { type: Number, default: null, min: 0 },
        width: { type: Number, default: null, min: 0 },
        height: { type: Number, default: null, min: 0 },
        unit: { 
            type: String, 
            default: "cm", 
            enum: ["cm", "m", "mm", "in"] 
        }
    },
    weight: {
        value: { type: Number, default: null, min: 0 },
        unit: { 
            type: String, 
            default: "kg", 
            enum: ["kg", "g", "mg", "lb"] 
        }
    },
    
    // ============ ADMIN APPROVAL WORKFLOW ============
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        description: "Client/Team member who submitted the stock"
    },
    submittedAt: {
        type: Date,
        default: Date.now,
        description: "When stock was submitted for approval"
    },
    
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null,
        description: "Admin who reviewed (approved/rejected) the stock"
    },
    reviewedAt: {
        type: Date,
        default: null,
        description: "When stock was reviewed"
    },
    
    confirmationNotes: {
        type: String,
        trim: true,
        maxlength: 1000,
        description: "Admin notes when confirming stock"
    },
    
    rejectionReason: {
        type: String,
        trim: true,
        maxlength: 500,
        description: "Reason for rejection (if rejected)"
    },
    
    // ============ DATES & TRACKING ============
    dateReceived: {
        type: Date,
        description: "Date stock physically received at siege"
    },
    expirationDate: {
        type: Date,
        default: null,
        description: "Expiration date (for perishable items)"
    },
    lastRestockDate: {
        type: Date,
        default: null,
        description: "Last time stock was replenished"
    },
    lastUsedDate: {
        type: Date,
        default: null,
        description: "Last time stock was used in a colis"
    },
    
    // ============ ADDITIONAL INFORMATION ============
    notes: {
        type: String,
        trim: true,
        maxlength: 1000,
        description: "Internal notes (visible to admin only)"
    },
    clientNotes: {
        type: String,
        trim: true,
        maxlength: 1000,
        description: "Notes from client when creating stock"
    },
    
    // ============ IMAGES ============
    images: [{
        url: { type: String, required: true },
        publicId: { type: String, default: null },
        uploadedAt: { type: Date, default: Date.now }
    }],
    
    // ============ METADATA ============
    tags: [{
        type: String,
        trim: true,
        maxlength: 50
    }],
    category: {
        type: String,
        trim: true,
        maxlength: 100,
        description: "Product category"
    },
    
    // ============ AUDIT TRAIL ============
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'createdByModel',
        description: "Who created this stock entry"
    },
    createdByModel: {
        type: String,
        enum: ['Admin', 'Team', 'Client'],
        default: 'Team'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'updatedByModel',
        description: "Who last updated this stock"
    },
    updatedByModel: {
        type: String,
        enum: ['Admin', 'Team', 'Client'],
        default: 'Team'
    },
    
    // ============ SOFT DELETE ============
    isDeleted: {
        type: Boolean,
        default: false,
        index: true,
        description: "Soft delete flag"
    },
    deletedAt: {
        type: Date,
        default: null
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    }
    
}, { 
    timestamps: true  // Adds createdAt and updatedAt automatically
});

// ============ INDEXES FOR PERFORMANCE ============
// Compound unique index: SKU must be unique per client
StockSchema.index({ clientId: 1, storeId: 1, sku: 1 }, { unique: true });
// Common query patterns
StockSchema.index({ clientId: 1, status: 1 });
StockSchema.index({ productId: 1, variantId: 1 });
StockSchema.index({ status: 1, quantite_disponible: 1 });
StockSchema.index({ sku: 1 });
StockSchema.index({ isDeleted: 1, status: 1 });
StockSchema.index({ createdAt: -1 });

// ============ VIRTUAL FIELDS ============
// Total quantity (available + reserved)
StockSchema.virtual('quantite_totale').get(function() {
    return this.quantite_disponible + this.quantite_reservee;
});

// Is stock low?
StockSchema.virtual('isLowStock').get(function() {
    return this.quantite_disponible < this.quantite_minimum && this.quantite_disponible > 0;
});

// Is stock out?
StockSchema.virtual('isOutOfStock').get(function() {
    return this.quantite_disponible === 0;
});

// ============ PRE-SAVE HOOKS ============
StockSchema.pre('save', function(next) {
    // Auto-activate when confirmed
    if (this.isModified('status') && this.status === 'confirmed') {
        this.status = 'active';
        this.quantite_disponible = this.quantite_initial;
    }
    
    // Auto-mark as depleted when quantity reaches 0
    if (this.quantite_disponible === 0 && this.status === 'active') {
        this.status = 'depleted';
    }
    
    // If stock becomes available again, reactivate
    if (this.quantite_disponible > 0 && this.status === 'depleted') {
        this.status = 'active';
    }
    
    next();
});

// ============ MODEL ============
const Stock = mongoose.model("Stock", StockSchema);

// ============ JOI VALIDATION ============
// ============ SIMPLIFIED VALIDATION FOR STOCK CREATION ============
function validateStock(obj) {
    const schema = Joi.object({
        // ===== REQUIRED FIELDS ONLY =====
        productName: Joi.string().trim().max(255).required().messages({
            'string.empty': 'Le nom du produit est requis',
            'any.required': 'Le nom du produit est requis'
        }),
        quantite_initial: Joi.number().min(1).required().messages({
            'number.base': 'La quantité doit être un nombre',
            'number.min': 'La quantité doit être au moins 1',
            'any.required': 'La quantité est requise'
        }),
        unitPrice: Joi.number().min(0).required().messages({
            'number.base': 'Le prix doit être un nombre',
            'number.min': 'Le prix ne peut pas être négatif',
            'any.required': 'Le prix est requis'
        }),
        
        // ===== OPTIONAL/AUTO-GENERATED FIELDS =====
        clientId: Joi.string().optional(), // Set by backend
        storeId: Joi.string().optional(), // Set by backend  
        productId: Joi.string().allow(null).optional(),
        productDescription: Joi.string().trim().max(1000).allow('').optional(),
        hasVariants: Joi.boolean().optional(),
        variantId: Joi.string().allow(null).optional(),
        variantName: Joi.string().trim().max(100).allow(null).optional(),
        sku: Joi.string().trim().uppercase().max(50).optional(), // Auto-generated if not provided
        barcode: Joi.string().trim().max(50).allow(null).optional(),
        quantite_minimum: Joi.number().min(0).optional(),
        unitCost: Joi.number().min(0).optional(),
        currency: Joi.string().max(10).optional(),
        location: Joi.string().trim().max(100).allow('', null).optional(),
        zone: Joi.string().trim().max(50).allow('', null).optional(),
        dimensions: Joi.object({
            length: Joi.number().min(0).allow(null),
            width: Joi.number().min(0).allow(null),
            height: Joi.number().min(0).allow(null),
            unit: Joi.string().valid('cm', 'm', 'mm', 'in')
        }).optional(),
        weight: Joi.object({
            value: Joi.number().min(0).allow(null),
            unit: Joi.string().valid('kg', 'g', 'mg', 'lb')
        }).optional(),
        expirationDate: Joi.date().allow(null).optional(),
        notes: Joi.string().trim().max(1000).allow('', null).optional(),
        clientNotes: Joi.string().trim().max(1000).allow('', null).optional(),
        images: Joi.array().items(Joi.object({
            url: Joi.string().required(),
            publicId: Joi.string().allow(null)
        })).optional(),
        tags: Joi.array().items(Joi.string().trim().max(50)).optional(),
        category: Joi.string().trim().max(100).allow('', null).optional()
    });
    return schema.validate(obj);
}

// Validation for updating stock info (client can update)
function validateStockUpdate(obj) {
    const schema = Joi.object({
        productName: Joi.string().trim().max(255).optional(),
        productDescription: Joi.string().trim().max(1000).allow('').optional(),
        variantName: Joi.string().trim().max(100).allow(null).optional(),
        category: Joi.string().trim().max(100).optional(),
        tags: Joi.array().items(Joi.string().trim().max(50)).optional(),
        clientNotes: Joi.string().trim().max(1000).allow('').optional(),
        quantite_minimum: Joi.number().min(0).optional(),
        // Cannot update quantities directly - must use adjustment endpoint
        quantite_initial: Joi.forbidden(),
        quantite_disponible: Joi.forbidden(),
        quantite_reservee: Joi.forbidden(),
        quantite_utilisee: Joi.forbidden(),
        // Cannot update status - admin only
        status: Joi.forbidden()
    });
    return schema.validate(obj);
}

module.exports = {
    Stock,
    validateStock,
    validateStockUpdate
};

