# 📦 STOCK MANAGEMENT SYSTEM - COMPLETE DOCUMENTATION

## 🎯 Overview
Advanced stock management system with client-initiated stock creation, admin approval workflow, variant support, and granular access control.

---

## 🏗️ SYSTEM ARCHITECTURE

### **Core Features**
1. ✅ Client can create stock items (status: `pending`)
2. ✅ Admin reviews and confirms stock when received at siege
3. ✅ Only `confirmed` stock can be used in colis
4. ✅ Full product variant support
5. ✅ Access control - stock feature enabled per client/store
6. ✅ Extensible access system for future features
7. ✅ Complete audit trail and history tracking

---

## 📊 DATABASE MODELS

### **1. Client Model Enhancement** (`backend/Models/Client.js`)

```javascript
const ClientSchema = new mongoose.Schema({
    // ... existing fields ...
    
    // NEW: Feature Access Control
    features_access: {
        stock_management: {
            type: Boolean,
            default: false,
            description: "Access to stock management features"
        },
        api_integration: {
            type: Boolean,
            default: false,
            description: "Access to API integration"
        },
        advanced_reporting: {
            type: Boolean,
            default: false,
            description: "Access to advanced analytics"
        },
        multi_store: {
            type: Boolean,
            default: false,
            description: "Can have multiple stores"
        },
        bulk_operations: {
            type: Boolean,
            default: false,
            description: "Can perform bulk operations"
        },
        custom_branding: {
            type: Boolean,
            default: false,
            description: "Custom branding options"
        },
        // Extensible - add more features as needed
    },
    
    // Stock configuration for this client
    stock_config: {
        require_admin_approval: {
            type: Boolean,
            default: true,
            description: "Stock must be approved by admin"
        },
        auto_approve_threshold: {
            type: Number,
            default: null,
            description: "Auto-approve stock below this value"
        },
        low_stock_alert_threshold: {
            type: Number,
            default: 10,
            description: "Alert when stock below this quantity"
        },
        allow_negative_stock: {
            type: Boolean,
            default: false,
            description: "Allow orders when stock is 0"
        }
    }
}, { timestamps: true });

// Index for feature access queries
ClientSchema.index({ 'features_access.stock_management': 1 });
```

**Validation Update:**
```javascript
const clientValidation = (obj) => {
    const clientJoiSchema = Joi.object({
        // ... existing validations ...
        
        features_access: Joi.object({
            stock_management: Joi.boolean(),
            api_integration: Joi.boolean(),
            advanced_reporting: Joi.boolean(),
            multi_store: Joi.boolean(),
            bulk_operations: Joi.boolean(),
            custom_branding: Joi.boolean(),
        }).optional(),
        
        stock_config: Joi.object({
            require_admin_approval: Joi.boolean(),
            auto_approve_threshold: Joi.number().min(0).allow(null),
            low_stock_alert_threshold: Joi.number().min(0),
            allow_negative_stock: Joi.boolean(),
        }).optional()
    });
    return clientJoiSchema.validate(obj);
};
```

---

### **2. Store Model Enhancement** (`backend/Models/Store.js`)

```javascript
const StoreSchema = new mongoose.Schema({
    // ... existing fields ...
    
    // NEW: Store-level feature access (overrides client settings if needed)
    features_access: {
        stock_management: {
            type: Boolean,
            default: null, // null = inherit from client
            description: "Access to stock management for this store"
        },
        // Can add store-specific features here
    },
    
    // Stock location identifier
    stock_location: {
        type: String,
        default: "siege",
        enum: ["siege", "warehouse_1", "warehouse_2", "external"],
        description: "Physical location of stock for this store"
    }
}, { timestamps: true });
```

---

### **3. Stock Model** (`backend/Models/Stock.js`)

```javascript
const mongoose = require("mongoose");
const Joi = require("joi");

const StockSchema = new mongoose.Schema({
    // Ownership & Association
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
        index: true
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
        index: true
    },
    
    // Product Reference (optional - can be null for custom items)
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: null
    },
    
    // Product Information
    productName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255
    },
    productDescription: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    
    // Variant Information (if product has variants)
    hasVariants: {
        type: Boolean,
        default: false
    },
    variantId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        description: "Reference to variant _id from Product.variants array"
    },
    variantName: {
        type: String,
        default: null,
        trim: true
    },
    
    // SKU & Identification
    sku: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        description: "Stock Keeping Unit - must be unique per client"
    },
    barcode: {
        type: String,
        trim: true,
        default: null
    },
    
    // Quantity Management
    quantite_initial: {
        type: Number,
        required: true,
        min: 0,
        description: "Initial quantity when stock created"
    },
    quantite_disponible: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
        description: "Available quantity for use"
    },
    quantite_reservee: {
        type: Number,
        default: 0,
        min: 0,
        description: "Reserved for pending colis"
    },
    quantite_utilisee: {
        type: Number,
        default: 0,
        min: 0,
        description: "Total used in delivered colis"
    },
    quantite_minimum: {
        type: Number,
        default: 10,
        min: 0,
        description: "Alert threshold"
    },
    
    // Stock Status & Workflow
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'rejected', 'active', 'inactive', 'depleted'],
        default: 'pending',
        required: true,
        index: true,
        description: `
            - pending: Client created, awaiting admin confirmation
            - confirmed: Admin confirmed receipt, stock activated
            - rejected: Admin rejected the stock entry
            - active: Stock is active and can be used
            - inactive: Temporarily disabled by admin/client
            - depleted: Stock quantity reached 0
        `
    },
    
    // Pricing
    unitCost: {
        type: Number,
        default: 0,
        min: 0,
        description: "Cost per unit (for client reference)"
    },
    unitPrice: {
        type: Number,
        default: 0,
        min: 0,
        description: "Selling price per unit"
    },
    currency: {
        type: String,
        default: "MAD"
    },
    
    // Location & Storage
    location: {
        type: String,
        default: "siege",
        trim: true,
        description: "Storage location (siege, shelf number, etc)"
    },
    zone: {
        type: String,
        trim: true,
        description: "Storage zone or section"
    },
    
    // Product Specifications
    dimensions: {
        length: { type: Number, default: null },
        width: { type: Number, default: null },
        height: { type: Number, default: null },
        unit: { type: String, default: "cm", enum: ["cm", "m", "mm"] }
    },
    weight: {
        value: { type: Number, default: null },
        unit: { type: String, default: "kg", enum: ["kg", "g", "mg"] }
    },
    
    // Admin Approval Workflow
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        description: "Client/Team member who submitted the stock"
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null,
        description: "Admin who reviewed the stock"
    },
    reviewedAt: {
        type: Date,
        default: null
    },
    
    confirmationNotes: {
        type: String,
        trim: true,
        maxlength: 1000,
        description: "Admin notes when confirming/rejecting"
    },
    
    rejectionReason: {
        type: String,
        trim: true,
        maxlength: 500,
        description: "Reason for rejection"
    },
    
    // Dates & Tracking
    dateReceived: {
        type: Date,
        description: "Date stock physically received at siege"
    },
    expirationDate: {
        type: Date,
        default: null,
        description: "For perishable items"
    },
    lastRestockDate: {
        type: Date,
        default: null
    },
    lastUsedDate: {
        type: Date,
        default: null
    },
    
    // Additional Information
    notes: {
        type: String,
        trim: true,
        maxlength: 1000,
        description: "Internal notes"
    },
    clientNotes: {
        type: String,
        trim: true,
        maxlength: 1000,
        description: "Notes from client when creating stock"
    },
    
    // Images
    images: [{
        url: { type: String },
        publicId: { type: String, default: null },
        uploadedAt: { type: Date, default: Date.now }
    }],
    
    // Metadata
    tags: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        trim: true
    },
    
    // Audit Trail
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
    
    // Soft Delete
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
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
    timestamps: true 
});

// Indexes for performance
StockSchema.index({ clientId: 1, storeId: 1, sku: 1 }, { unique: true });
StockSchema.index({ clientId: 1, status: 1 });
StockSchema.index({ productId: 1, variantId: 1 });
StockSchema.index({ status: 1, quantite_disponible: 1 });
StockSchema.index({ sku: 1 });
StockSchema.index({ isDeleted: 1, status: 1 });

// Virtual for total quantity
StockSchema.virtual('quantite_totale').get(function() {
    return this.quantite_disponible + this.quantite_reservee;
});

// Pre-save hook: Auto-activate confirmed stock
StockSchema.pre('save', function(next) {
    // If status changed to confirmed, also set to active
    if (this.isModified('status') && this.status === 'confirmed') {
        this.status = 'active';
        this.quantite_disponible = this.quantite_initial;
    }
    
    // If available quantity is 0, mark as depleted
    if (this.quantite_disponible === 0 && this.status === 'active') {
        this.status = 'depleted';
    }
    
    next();
});

const Stock = mongoose.model("Stock", StockSchema);

// Joi Validation
function validateStock(obj) {
    const schema = Joi.object({
        clientId: Joi.string().required(),
        storeId: Joi.string().required(),
        productId: Joi.string().allow(null).optional(),
        productName: Joi.string().trim().max(255).required(),
        productDescription: Joi.string().trim().max(1000).allow('').optional(),
        hasVariants: Joi.boolean().optional(),
        variantId: Joi.string().allow(null).optional(),
        variantName: Joi.string().trim().allow(null).optional(),
        sku: Joi.string().trim().uppercase().required(),
        barcode: Joi.string().trim().allow(null).optional(),
        quantite_initial: Joi.number().min(0).required(),
        quantite_minimum: Joi.number().min(0).optional(),
        unitCost: Joi.number().min(0).optional(),
        unitPrice: Joi.number().min(0).optional(),
        currency: Joi.string().optional(),
        location: Joi.string().trim().optional(),
        zone: Joi.string().trim().optional(),
        dimensions: Joi.object({
            length: Joi.number().allow(null),
            width: Joi.number().allow(null),
            height: Joi.number().allow(null),
            unit: Joi.string().valid('cm', 'm', 'mm')
        }).optional(),
        weight: Joi.object({
            value: Joi.number().allow(null),
            unit: Joi.string().valid('kg', 'g', 'mg')
        }).optional(),
        expirationDate: Joi.date().allow(null).optional(),
        notes: Joi.string().trim().max(1000).allow('').optional(),
        clientNotes: Joi.string().trim().max(1000).allow('').optional(),
        images: Joi.array().items(Joi.object({
            url: Joi.string(),
            publicId: Joi.string().allow(null)
        })).optional(),
        tags: Joi.array().items(Joi.string().trim()).optional(),
        category: Joi.string().trim().optional()
    });
    return schema.validate(obj);
}

module.exports = {
    Stock,
    validateStock
};
```

---

### **4. StockMovement Model** (`backend/Models/StockMovement.js`)

```javascript
const mongoose = require("mongoose");

const StockMovementSchema = new mongoose.Schema({
    // References
    stockId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
        required: true,
        index: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
        index: true
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    colisId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Colis',
        default: null,
        index: true,
        description: "If movement is related to a colis"
    },
    
    // Movement Type
    type: {
        type: String,
        enum: [
            'INITIAL',          // Initial stock creation
            'IN',               // Stock added (restock)
            'OUT',              // Stock removed (used in colis)
            'ADJUSTMENT',       // Manual adjustment by admin
            'RESERVED',         // Reserved for pending colis
            'RELEASED',         // Reservation released (colis cancelled)
            'RETURN',           // Stock returned from colis
            'CONFIRMED',        // Admin confirmed pending stock
            'REJECTED',         // Admin rejected pending stock
            'TRANSFER',         // Transfer between locations
            'DAMAGED',          // Marked as damaged
            'EXPIRED',          // Marked as expired
            'CORRECTION'        // Error correction
        ],
        required: true,
        index: true
    },
    
    // Quantities
    quantity: {
        type: Number,
        required: true,
        description: "Quantity moved (positive or negative)"
    },
    quantityBefore: {
        type: Number,
        required: true,
        description: "Available quantity before movement"
    },
    quantityAfter: {
        type: Number,
        required: true,
        description: "Available quantity after movement"
    },
    reservedBefore: {
        type: Number,
        default: 0,
        description: "Reserved quantity before movement"
    },
    reservedAfter: {
        type: Number,
        default: 0,
        description: "Reserved quantity after movement"
    },
    
    // Details
    reason: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
        description: "Reason for movement"
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 1000,
        description: "Additional notes"
    },
    
    // Who performed the action
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'performedByModel',
        required: true,
        description: "Who performed this movement"
    },
    performedByModel: {
        type: String,
        enum: ['Admin', 'Team', 'Client', 'System'],
        required: true
    },
    performedByRole: {
        type: String,
        enum: ['admin', 'client', 'team', 'system', 'livreur'],
        required: true
    },
    
    // Reference data (snapshot at time of movement)
    referenceData: {
        colisCode: { type: String },
        clientName: { type: String },
        productName: { type: String },
        variantName: { type: String },
        sku: { type: String }
    },
    
    // Timestamp
    date: {
        type: Date,
        default: Date.now,
        index: true
    }
    
}, { 
    timestamps: true 
});

// Indexes
StockMovementSchema.index({ stockId: 1, date: -1 });
StockMovementSchema.index({ clientId: 1, date: -1 });
StockMovementSchema.index({ type: 1, date: -1 });
StockMovementSchema.index({ colisId: 1 });

const StockMovement = mongoose.model("StockMovement", StockMovementSchema);

module.exports = {
    StockMovement
};
```

---

### **5. StockAlert Model** (`backend/Models/StockAlert.js`)

```javascript
const mongoose = require("mongoose");

const StockAlertSchema = new mongoose.Schema({
    stockId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
        required: true,
        index: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
        index: true
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    
    // Alert Type
    type: {
        type: String,
        enum: [
            'LOW_STOCK',           // Stock below minimum threshold
            'OUT_OF_STOCK',        // Stock depleted
            'RESTOCK_NEEDED',      // Needs restock
            'PENDING_APPROVAL',    // Pending admin approval
            'STOCK_APPROVED',      // Stock approved by admin
            'STOCK_REJECTED',      // Stock rejected by admin
            'EXPIRING_SOON',       // Will expire soon
            'EXPIRED',             // Has expired
            'HIGH_RESERVATION'     // Too many reservations
        ],
        required: true,
        index: true
    },
    
    // Alert Details
    severity: {
        type: String,
        enum: ['info', 'warning', 'critical'],
        default: 'info'
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    currentQuantity: {
        type: Number,
        description: "Stock quantity when alert created"
    },
    threshold: {
        type: Number,
        description: "Threshold that triggered alert"
    },
    
    // Status
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    readBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'readBy.userModel'
        },
        userModel: {
            type: String,
            enum: ['Admin', 'Client', 'Team']
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Action taken
    isResolved: {
        type: Boolean,
        default: false,
        index: true
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'resolvedByModel'
    },
    resolvedByModel: {
        type: String,
        enum: ['Admin', 'Client', 'Team']
    },
    resolvedAt: {
        type: Date
    },
    resolutionNotes: {
        type: String,
        trim: true,
        maxlength: 500
    },
    
    // Auto-dismiss after resolution
    autoDismiss: {
        type: Boolean,
        default: true
    }
    
}, { 
    timestamps: true 
});

// Indexes
StockAlertSchema.index({ clientId: 1, isRead: 1, isResolved: 1 });
StockAlertSchema.index({ type: 1, isResolved: 1 });
StockAlertSchema.index({ createdAt: -1 });

const StockAlert = mongoose.model("StockAlert", StockAlertSchema);

module.exports = {
    StockAlert
};
```

---

### **6. Colis Model Update** (`backend/Models/Colis.js`)

```javascript
// ADD to existing Colis schema:

produits: [{
    produit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Produit'
    },
    variants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Variant'
    }],
    
    // NEW FIELDS FOR STOCK INTEGRATION
    usesStock: {
        type: Boolean,
        default: false,
        description: "Whether this product uses stock management"
    },
    stockId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
        default: null,
        description: "Reference to stock item"
    },
    stockSku: {
        type: String,
        default: null,
        description: "SKU at time of colis creation (snapshot)"
    },
    quantityUsed: {
        type: Number,
        default: 1,
        min: 1,
        description: "Quantity of this stock item used"
    },
    stockReserved: {
        type: Boolean,
        default: false,
        description: "Whether stock is reserved for this colis"
    },
    stockDeducted: {
        type: Boolean,
        default: false,
        description: "Whether stock was deducted (after delivery)"
    }
}]

// Validation update:
produits: Joi.array().items(
    Joi.object({
        produit: Joi.string().required(),
        variants: Joi.array().items(Joi.string()),
        usesStock: Joi.boolean().optional(),
        stockId: Joi.string().allow(null).optional(),
        stockSku: Joi.string().allow(null).optional(),
        quantityUsed: Joi.number().min(1).optional(),
        stockReserved: Joi.boolean().optional(),
        stockDeducted: Joi.boolean().optional()
    })
)
```

---

## 🔄 WORKFLOWS

### **Workflow 1: Client Creates Stock (Pending → Confirmed)**

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT CREATES STOCK                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Client fills stock form:                                │
│     - Product name                                           │
│     - SKU                                                    │
│     - Quantity                                               │
│     - Variant (if applicable)                                │
│     - Notes                                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. System validates:                                        │
│     ✓ Client has stock_management access                    │
│     ✓ SKU is unique for this client                         │
│     ✓ Quantity > 0                                           │
│     ✓ Store exists                                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Stock created with:                                      │
│     - status: 'pending'                                      │
│     - quantite_initial: X                                    │
│     - quantite_disponible: 0 (not yet available)            │
│     - submittedBy: client/team ID                           │
│     - submittedAt: now                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  4. System creates:                                          │
│     - StockMovement (type: INITIAL)                         │
│     - StockAlert (type: PENDING_APPROVAL) → to Admin        │
│     - Notification to Admin                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN REVIEWS STOCK                       │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
        ┌───────────────┐       ┌───────────────┐
        │   CONFIRM     │       │    REJECT     │
        └───────────────┘       └───────────────┘
                │                       │
                ▼                       ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│ Status: 'active'         │   │ Status: 'rejected'       │
│ quantite_disponible: X   │   │ quantite_disponible: 0   │
│ reviewedBy: admin ID     │   │ rejectionReason: "..."   │
│ reviewedAt: now          │   │ reviewedBy: admin ID     │
│ dateReceived: now        │   │ reviewedAt: now          │
└─────────────────────────┘   └─────────────────────────┘
                │                       │
                ▼                       ▼
    ┌──────────────────────┐   ┌──────────────────────┐
    │ StockMovement:       │   │ StockAlert:          │
    │ type: CONFIRMED      │   │ type: STOCK_REJECTED │
    │                      │   │ → to Client          │
    │ StockAlert:          │   │                      │
    │ type: STOCK_APPROVED │   │ Notification         │
    │ → to Client          │   │ → to Client          │
    └──────────────────────┘   └──────────────────────┘
```

---

### **Workflow 2: Using Stock in Colis Creation**

```
┌─────────────────────────────────────────────────────────────┐
│              CLIENT CREATES COLIS WITH STOCK                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Client selects:                                          │
│     - Colis type: is_simple = false (stock-based)           │
│     - Product from stock list (only active stocks shown)    │
│     - Quantity needed                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. System validates:                                        │
│     ✓ Stock status is 'active'                              │
│     ✓ quantite_disponible >= quantity requested             │
│     ✓ Stock belongs to this client                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Stock reservation (within transaction):                 │
│     - quantite_disponible -= quantity                        │
│     - quantite_reservee += quantity                          │
│     - Stock.lastUsedDate = now                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Create Colis with:                                       │
│     - produits[].usesStock = true                           │
│     - produits[].stockId = stock._id                        │
│     - produits[].stockSku = stock.sku                       │
│     - produits[].quantityUsed = quantity                    │
│     - produits[].stockReserved = true                       │
│     - is_simple = false                                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Create StockMovement:                                    │
│     - type: RESERVED                                         │
│     - quantity: -quantity (negative)                         │
│     - quantityBefore: old disponible                         │
│     - quantityAfter: new disponible                          │
│     - reservedBefore: old reserved                           │
│     - reservedAfter: new reserved                            │
│     - colisId: colis._id                                     │
│     - reason: "Reserved for colis [code_suivi]"             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Check for alerts:                                        │
│     - If quantite_disponible < quantite_minimum             │
│       → Create StockAlert (LOW_STOCK)                       │
│     - If quantite_disponible = 0                            │
│       → Create StockAlert (OUT_OF_STOCK)                    │
└─────────────────────────────────────────────────────────────┘
```

---

### **Workflow 3: Colis Lifecycle & Stock Updates**

```
┌─────────────────────────────────────────────────────────────┐
│                   COLIS STATUS CHANGES                       │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
      ┌─────────┐    ┌─────────┐    ┌─────────┐
      │ LIVRÉE  │    │ REFUSÉE │    │ ANNULÉE │
      └─────────┘    └─────────┘    └─────────┘
            │               │               │
            ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │ Stock OUT    │ │ Stock RELEASE│ │ Stock RELEASE│
    └──────────────┘ └──────────────┘ └──────────────┘

─────────────────────────────────────────────────────────────

CASE 1: COLIS DELIVERED (statut = "Livrée")
┌─────────────────────────────────────────────────────────────┐
│  1. For each product with usesStock = true:                 │
│     - quantite_reservee -= quantityUsed                      │
│     - quantite_utilisee += quantityUsed                      │
│     - produits[].stockDeducted = true                       │
│     - Create StockMovement (type: OUT)                      │
└─────────────────────────────────────────────────────────────┘

CASE 2: COLIS REFUSED/CANCELLED (statut = "Refusée"/"Annulée")
┌─────────────────────────────────────────────────────────────┐
│  1. For each product with stockReserved = true:             │
│     - quantite_disponible += quantityUsed                    │
│     - quantite_reservee -= quantityUsed                      │
│     - produits[].stockReserved = false                      │
│     - Create StockMovement (type: RELEASED)                 │
└─────────────────────────────────────────────────────────────┘

CASE 3: COLIS RETURNED (statut = "En Retour")
┌─────────────────────────────────────────────────────────────┐
│  1. If stockDeducted = true:                                 │
│     - quantite_disponible += quantityUsed                    │
│     - quantite_utilisee -= quantityUsed                      │
│     - produits[].stockDeducted = false                      │
│     - Create StockMovement (type: RETURN)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎮 CONTROLLERS

### **1. StockController** (`backend/Controllers/stockController.js`)

#### **CLIENT ENDPOINTS**

```javascript
// 1. CREATE STOCK (Client) - Creates pending stock
POST /api/stock/create
Access: Client with stock_management feature
Status: Creates stock with status='pending'
Returns: Stock object + StockMovement + StockAlert

// 2. GET MY STOCKS (Client)
GET /api/stock/my-stocks
Access: Client with stock_management feature
Query params: ?status=active&page=1&limit=20&search=SKU
Returns: Paginated list of client's stocks

// 3. GET STOCK DETAIL (Client)
GET /api/stock/:stockId
Access: Client (own stock only)
Returns: Stock details + recent movements

// 4. GET MY STOCK MOVEMENTS (Client)
GET /api/stock/my-movements
Access: Client with stock_management feature
Query params: ?stockId=xxx&startDate=xxx&endDate=xxx&type=OUT
Returns: Paginated movements history

// 5. REQUEST RESTOCK (Client)
POST /api/stock/:stockId/request-restock
Access: Client (own stock only)
Body: { quantity: 100, notes: "..." }
Returns: Creates pending stock entry or notification to admin

// 6. GET AVAILABLE STOCKS FOR COLIS (Client)
GET /api/stock/available-for-colis
Access: Client with stock_management feature
Query params: ?storeId=xxx&search=SKU
Returns: Only active stocks with quantite_disponible > 0

// 7. UPDATE STOCK INFO (Client) - Limited fields only
PUT /api/stock/:stockId/info
Access: Client (own stock only, cannot change quantities)
Body: { productName, notes, category, tags }
Returns: Updated stock
```

#### **ADMIN ENDPOINTS**

```javascript
// 1. GET ALL PENDING STOCKS (Admin)
GET /api/stock/admin/pending
Access: Admin only
Query params: ?page=1&limit=20&clientId=xxx
Returns: All pending stocks awaiting approval

// 2. APPROVE STOCK (Admin)
POST /api/stock/admin/:stockId/approve
Access: Admin only
Body: { confirmationNotes, dateReceived, location }
Returns: Activated stock + movements + alerts

// 3. REJECT STOCK (Admin)
POST /api/stock/admin/:stockId/reject
Access: Admin only
Body: { rejectionReason }
Returns: Rejected stock + alerts to client

// 4. GET ALL STOCKS (Admin)
GET /api/stock/admin/all
Access: Admin only
Query params: ?clientId=xxx&status=active&page=1&limit=20
Returns: All stocks across all clients

// 5. ADJUST STOCK QUANTITY (Admin)
POST /api/stock/admin/:stockId/adjust
Access: Admin only
Body: { quantityChange: 50, reason: "Restock", notes: "..." }
Returns: Updated stock + movement

// 6. CREATE STOCK FOR CLIENT (Admin)
POST /api/stock/admin/create
Access: Admin only
Body: { clientId, storeId, ..., status: 'active' }
Returns: Stock directly activated (bypasses approval)

// 7. DELETE STOCK (Admin) - Soft delete
DELETE /api/stock/admin/:stockId
Access: Admin only
Returns: Success message

// 8. GET STOCK MOVEMENTS (Admin)
GET /api/stock/admin/:stockId/movements
Access: Admin only
Returns: Full movement history

// 9. GET LOW STOCK ALERTS (Admin)
GET /api/stock/admin/alerts/low-stock
Access: Admin only
Returns: All low/out of stock items

// 10. BULK IMPORT STOCKS (Admin)
POST /api/stock/admin/bulk-import
Access: Admin only
Body: FormData with CSV/Excel file
Returns: Import results (success/errors)

// 11. EXPORT STOCKS (Admin)
GET /api/stock/admin/export
Access: Admin only
Query params: ?clientId=xxx&format=csv
Returns: CSV/Excel file download

// 12. UPDATE CLIENT STOCK ACCESS (Admin)
PUT /api/stock/admin/client/:clientId/access
Access: Admin only
Body: { 
    features_access: { stock_management: true },
    stock_config: { require_admin_approval: true }
}
Returns: Updated client
```

---

### **2. Update ColisController** (`backend/Controllers/colisController.js`)

```javascript
// Modify CreateColisCtrl:
module.exports.CreateColisCtrl = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    
    try {
        await session.withTransaction(async () => {
            // ... existing code ...
            
            // NEW: Handle stock-based colis
            if (!req.body.is_simple) {
                // Validate stock management access
                const store = await Store.findById(req.user.store).populate('id_client');
                const client = store.id_client;
                
                if (!client.features_access?.stock_management) {
                    throw new Error("Stock management not enabled for this account");
                }
                
                // Process each product with stock
                for (let produit of req.body.produits) {
                    if (produit.usesStock && produit.stockId) {
                        // Get stock with lock
                        const stock = await Stock.findById(produit.stockId).session(session);
                        
                        if (!stock) {
                            throw new Error(`Stock not found: ${produit.stockId}`);
                        }
                        
                        if (stock.status !== 'active') {
                            throw new Error(`Stock ${stock.sku} is not active`);
                        }
                        
                        if (stock.quantite_disponible < produit.quantityUsed) {
                            throw new Error(
                                `Insufficient stock for ${stock.productName}. ` +
                                `Available: ${stock.quantite_disponible}, ` +
                                `Requested: ${produit.quantityUsed}`
                            );
                        }
                        
                        // Reserve stock
                        const qtyBefore = stock.quantite_disponible;
                        const reservedBefore = stock.quantite_reservee;
                        
                        stock.quantite_disponible -= produit.quantityUsed;
                        stock.quantite_reservee += produit.quantityUsed;
                        stock.lastUsedDate = new Date();
                        
                        await stock.save({ session });
                        
                        // Create movement
                        const movement = new StockMovement({
                            stockId: stock._id,
                            clientId: client._id,
                            storeId: store._id,
                            colisId: saveColis._id, // Will be set after colis saved
                            type: 'RESERVED',
                            quantity: -produit.quantityUsed,
                            quantityBefore: qtyBefore,
                            quantityAfter: stock.quantite_disponible,
                            reservedBefore: reservedBefore,
                            reservedAfter: stock.quantite_reservee,
                            reason: `Reserved for colis ${code_suivi}`,
                            performedBy: req.user.id,
                            performedByModel: 'Team',
                            performedByRole: 'team',
                            referenceData: {
                                colisCode: code_suivi,
                                productName: stock.productName,
                                sku: stock.sku
                            }
                        });
                        await movement.save({ session });
                        
                        // Update colis product info
                        produit.stockReserved = true;
                        produit.stockSku = stock.sku;
                        
                        // Check for low stock alerts
                        if (stock.quantite_disponible < stock.quantite_minimum) {
                            const alertType = stock.quantite_disponible === 0 
                                ? 'OUT_OF_STOCK' 
                                : 'LOW_STOCK';
                            
                            const alert = new StockAlert({
                                stockId: stock._id,
                                clientId: client._id,
                                storeId: store._id,
                                type: alertType,
                                severity: stock.quantite_disponible === 0 ? 'critical' : 'warning',
                                message: `${stock.productName} (${stock.sku}) is ${alertType.toLowerCase().replace('_', ' ')}`,
                                currentQuantity: stock.quantite_disponible,
                                threshold: stock.quantite_minimum
                            });
                            await alert.save({ session });
                        }
                    }
                }
            }
            
            // ... rest of existing code ...
        });
    } catch (error) {
        // ... error handling ...
    }
});

// Add new helper functions:
async function handleColisDelivered(colisId, session) {
    // Called when colis status changes to "Livrée"
    const colis = await Colis.findById(colisId).session(session);
    
    for (let produit of colis.produits) {
        if (produit.usesStock && produit.stockReserved && !produit.stockDeducted) {
            const stock = await Stock.findById(produit.stockId).session(session);
            
            const reservedBefore = stock.quantite_reservee;
            
            stock.quantite_reservee -= produit.quantityUsed;
            stock.quantite_utilisee += produit.quantityUsed;
            
            await stock.save({ session });
            
            // Create movement
            const movement = new StockMovement({
                stockId: stock._id,
                clientId: colis.clientId || stock.clientId,
                storeId: colis.store,
                colisId: colis._id,
                type: 'OUT',
                quantity: -produit.quantityUsed,
                quantityBefore: stock.quantite_disponible,
                quantityAfter: stock.quantite_disponible, // No change to disponible
                reservedBefore: reservedBefore,
                reservedAfter: stock.quantite_reservee,
                reason: `Used in delivered colis ${colis.code_suivi}`,
                performedBy: req.user.id,
                performedByModel: 'System',
                performedByRole: 'system',
                referenceData: {
                    colisCode: colis.code_suivi,
                    productName: stock.productName,
                    sku: stock.sku
                }
            });
            await movement.save({ session });
            
            // Update colis
            produit.stockDeducted = true;
        }
    }
    
    await colis.save({ session });
}

async function handleColisCancelled(colisId, session) {
    // Called when colis status changes to "Annulée" or "Refusée"
    const colis = await Colis.findById(colisId).session(session);
    
    for (let produit of colis.produits) {
        if (produit.usesStock && produit.stockReserved && !produit.stockDeducted) {
            const stock = await Stock.findById(produit.stockId).session(session);
            
            const qtyBefore = stock.quantite_disponible;
            const reservedBefore = stock.quantite_reservee;
            
            stock.quantite_disponible += produit.quantityUsed;
            stock.quantite_reservee -= produit.quantityUsed;
            
            await stock.save({ session });
            
            // Create movement
            const movement = new StockMovement({
                stockId: stock._id,
                clientId: colis.clientId || stock.clientId,
                storeId: colis.store,
                colisId: colis._id,
                type: 'RELEASED',
                quantity: produit.quantityUsed,
                quantityBefore: qtyBefore,
                quantityAfter: stock.quantite_disponible,
                reservedBefore: reservedBefore,
                reservedAfter: stock.quantite_reservee,
                reason: `Released from ${colis.statut.toLowerCase()} colis ${colis.code_suivi}`,
                performedBy: req.user.id,
                performedByModel: 'System',
                performedByRole: 'system',
                referenceData: {
                    colisCode: colis.code_suivi,
                    productName: stock.productName,
                    sku: stock.sku
                }
            });
            await movement.save({ session });
            
            // Update colis
            produit.stockReserved = false;
        }
    }
    
    await colis.save({ session });
}

async function handleColisReturned(colisId, session) {
    // Called when colis status changes to "En Retour"
    const colis = await Colis.findById(colisId).session(session);
    
    for (let produit of colis.produits) {
        if (produit.usesStock && produit.stockDeducted) {
            const stock = await Stock.findById(produit.stockId).session(session);
            
            const qtyBefore = stock.quantite_disponible;
            
            stock.quantite_disponible += produit.quantityUsed;
            stock.quantite_utilisee -= produit.quantityUsed;
            
            await stock.save({ session });
            
            // Create movement
            const movement = new StockMovement({
                stockId: stock._id,
                clientId: colis.clientId || stock.clientId,
                storeId: colis.store,
                colisId: colis._id,
                type: 'RETURN',
                quantity: produit.quantityUsed,
                quantityBefore: qtyBefore,
                quantityAfter: stock.quantite_disponible,
                reason: `Returned from colis ${colis.code_suivi}`,
                performedBy: req.user.id,
                performedByModel: 'System',
                performedByRole: 'system',
                referenceData: {
                    colisCode: colis.code_suivi,
                    productName: stock.productName,
                    sku: stock.sku
                }
            });
            await movement.save({ session });
            
            // Update colis
            produit.stockDeducted = false;
        }
    }
    
    await colis.save({ session });
}
```

---

## 🛡️ MIDDLEWARE & VALIDATION

### **1. Access Control Middleware** (`backend/middleware/stockAccessMiddleware.js`)

```javascript
const { Client } = require("../Models/Client");
const { Store } = require("../Models/Store");
const asyncHandler = require("express-async-handler");

// Check if client has stock management access
const checkStockAccess = asyncHandler(async (req, res, next) => {
    // Get client from authenticated user
    let client;
    
    if (req.user.role === 'client') {
        client = await Client.findById(req.user.id);
    } else if (req.user.role === 'team') {
        // Team members inherit client's access through store
        const store = await Store.findById(req.user.store).populate('id_client');
        client = store.id_client;
    } else if (req.user.role === 'admin') {
        // Admins always have access
        return next();
    }
    
    if (!client) {
        return res.status(403).json({ 
            message: "Client not found" 
        });
    }
    
    // Check stock management access
    if (!client.features_access?.stock_management) {
        return res.status(403).json({ 
            message: "Stock management feature not enabled for your account. Please contact admin." 
        });
    }
    
    // Attach client to request for later use
    req.clientData = client;
    next();
});

// Check if client owns the stock
const checkStockOwnership = asyncHandler(async (req, res, next) => {
    const { Stock } = require("../Models/Stock");
    
    const stockId = req.params.stockId || req.params.id;
    const stock = await Stock.findById(stockId);
    
    if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
    }
    
    // Admins can access all stocks
    if (req.user.role === 'admin') {
        req.stock = stock;
        return next();
    }
    
    // Get client ID
    let clientId;
    if (req.user.role === 'client') {
        clientId = req.user.id;
    } else if (req.user.role === 'team') {
        const store = await Store.findById(req.user.store);
        clientId = store.id_client.toString();
    }
    
    // Check ownership
    if (stock.clientId.toString() !== clientId.toString()) {
        return res.status(403).json({ 
            message: "You don't have access to this stock" 
        });
    }
    
    req.stock = stock;
    next();
});

// Admin only middleware
const adminOnly = asyncHandler(async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            message: "Access denied. Admin privileges required." 
        });
    }
    next();
});

module.exports = {
    checkStockAccess,
    checkStockOwnership,
    adminOnly
};
```

---

## 🛣️ API ROUTES

### **Stock Routes** (`backend/Routes/stockRoute.js`)

```javascript
const express = require("express");
const router = express.Router();
const {
    // Client endpoints
    createStockClient,
    getMyStocks,
    getStockDetail,
    getMyStockMovements,
    requestRestock,
    getAvailableStocksForColis,
    updateStockInfo,
    
    // Admin endpoints
    getAllPendingStocks,
    approveStock,
    rejectStock,
    getAllStocksAdmin,
    adjustStockQuantity,
    createStockAdmin,
    deleteStock,
    getStockMovements,
    getLowStockAlerts,
    bulkImportStocks,
    exportStocks,
    updateClientStockAccess
} = require("../Controllers/stockController");

const { 
    checkStockAccess, 
    checkStockOwnership, 
    adminOnly 
} = require("../middleware/stockAccessMiddleware");

const { verifyToken } = require("../middleware/verifyToken");

// ============ CLIENT ROUTES ============
router.post("/create", 
    verifyToken, 
    checkStockAccess, 
    createStockClient
);

router.get("/my-stocks", 
    verifyToken, 
    checkStockAccess, 
    getMyStocks
);

router.get("/available-for-colis", 
    verifyToken, 
    checkStockAccess, 
    getAvailableStocksForColis
);

router.get("/my-movements", 
    verifyToken, 
    checkStockAccess, 
    getMyStockMovements
);

router.get("/:stockId", 
    verifyToken, 
    checkStockAccess, 
    checkStockOwnership, 
    getStockDetail
);

router.put("/:stockId/info", 
    verifyToken, 
    checkStockAccess, 
    checkStockOwnership, 
    updateStockInfo
);

router.post("/:stockId/request-restock", 
    verifyToken, 
    checkStockAccess, 
    checkStockOwnership, 
    requestRestock
);

// ============ ADMIN ROUTES ============
router.get("/admin/pending", 
    verifyToken, 
    adminOnly, 
    getAllPendingStocks
);

router.post("/admin/:stockId/approve", 
    verifyToken, 
    adminOnly, 
    approveStock
);

router.post("/admin/:stockId/reject", 
    verifyToken, 
    adminOnly, 
    rejectStock
);

router.get("/admin/all", 
    verifyToken, 
    adminOnly, 
    getAllStocksAdmin
);

router.post("/admin/:stockId/adjust", 
    verifyToken, 
    adminOnly, 
    adjustStockQuantity
);

router.post("/admin/create", 
    verifyToken, 
    adminOnly, 
    createStockAdmin
);

router.delete("/admin/:stockId", 
    verifyToken, 
    adminOnly, 
    deleteStock
);

router.get("/admin/:stockId/movements", 
    verifyToken, 
    adminOnly, 
    getStockMovements
);

router.get("/admin/alerts/low-stock", 
    verifyToken, 
    adminOnly, 
    getLowStockAlerts
);

router.post("/admin/bulk-import", 
    verifyToken, 
    adminOnly, 
    bulkImportStocks
);

router.get("/admin/export", 
    verifyToken, 
    adminOnly, 
    exportStocks
);

router.put("/admin/client/:clientId/access", 
    verifyToken, 
    adminOnly, 
    updateClientStockAccess
);

module.exports = router;
```

---

## 🎨 FRONTEND COMPONENTS

### **Admin Components**

```
admin/
├── stock/
│   ├── StockDashboard.jsx                  # Overview, stats, alerts
│   ├── PendingStockList.jsx                # List of pending approvals
│   ├── StockApprovalModal.jsx              # Approve/Reject modal
│   ├── AllStocksList.jsx                   # All stocks table
│   ├── StockDetailAdmin.jsx                # Detailed stock view
│   ├── CreateStockAdmin.jsx                # Create stock for client
│   ├── AdjustStockModal.jsx                # Adjust quantity
│   ├── BulkImportStock.jsx                 # CSV/Excel import
│   ├── StockAlertsPanel.jsx                # Alerts notification center
│   ├── StockMovementHistory.jsx            # Movement history table
│   ├── ClientStockAccessManager.jsx        # Manage client access
│   └── ExportStockReport.jsx               # Export functionality
```

### **Client Components**

```
client/
├── stock/
│   ├── MyStockList.jsx                     # Client's stock list (read-only)
│   ├── CreateStockRequest.jsx              # Create pending stock
│   ├── StockDetailClient.jsx               # View stock details
│   ├── StockMovementHistoryClient.jsx      # View own movements
│   ├── StockAlertsBanner.jsx               # Low stock notifications
│   ├── RequestRestockModal.jsx             # Request restock from admin
│   └── StockSelectorForColis.jsx           # Select stock in colis form
```

### **Shared Components**

```
shared/
├── StockCard.jsx                           # Stock item card
├── StockStatusBadge.jsx                    # Status badge (pending/active/etc)
├── StockQuantityIndicator.jsx              # Visual quantity indicator
├── VariantSelector.jsx                     # Select product variant
└── StockFilters.jsx                        # Filter stocks by various criteria
```

---

## 📱 UI/UX SPECIFICATIONS

### **Client: Create Stock Request Form**

```jsx
Fields:
- Product Name* (text)
- SKU* (auto-generated or manual)
- Product from catalog (dropdown - optional)
  └─ If selected → auto-fill variant options
- Has Variants? (checkbox)
  └─ If yes → Show variant selector
     - Variant Name
     - Quantity per variant
- Total Quantity* (number)
- Unit Cost (number - optional)
- Unit Price (number - optional)
- Minimum Stock Alert (number - default: 10)
- Category (text - optional)
- Tags (multi-select - optional)
- Location at siege (text - optional)
- Expiration Date (date - optional)
- Product Images (file upload - multiple)
- Notes (textarea)

Validation:
- SKU must be unique per client
- Quantity > 0
- If has variants, sum of variant quantities must equal total quantity

On Submit:
- Status: pending
- Show success message: "Stock request submitted for admin approval"
- Redirect to My Stocks page
```

### **Admin: Pending Stock Approval**

```jsx
Display:
- List of all pending stocks
- Grouped by client
- Show: SKU, Product Name, Quantity, Client Name, Submitted Date
- Actions: [Approve] [Reject] [View Details]

Approve Modal:
- Confirmation Notes (textarea)
- Date Received (date picker - default: today)
- Actual Quantity Received (number - default: requested quantity)
- Storage Location (text)
- [Confirm Approval] [Cancel]

On Approve:
- Status → active
- quantite_disponible = quantity
- Create CONFIRMED movement
- Send alert to client: "Your stock [SKU] has been approved"

Reject Modal:
- Rejection Reason* (textarea)
- [Confirm Rejection] [Cancel]

On Reject:
- Status → rejected
- Send alert to client: "Your stock [SKU] was rejected: [reason]"
```

### **Client: Colis Creation with Stock**

```jsx
When is_simple = false:
1. Show "Use Stock" toggle
2. If enabled:
   - Show available stocks dropdown
   - Filter: status=active, quantite_disponible>0
   - Display format: "{productName} - {variantName} ({sku}) - Available: {qty}"
   - Quantity input
   - Real-time validation: quantity <= available
   - Show warning if low stock
   
Stock Selection Component:
┌────────────────────────────────────────────┐
│ 🔍 Search Stock                             │
├────────────────────────────────────────────┤
│ [▼] Product: iPhone 13 - Blue (IPH13-BLU)  │
│     Available: 25 units                     │
│                                             │
│ Quantity: [___5___] units                   │
│                                             │
│ ✓ Will reserve 5 units from stock          │
│ ⚠ Only 20 units will remain                │
└────────────────────────────────────────────┘
```

---

## 🔐 SECURITY & PERMISSIONS

### **Permission Matrix**

| Action | Admin | Client (with access) | Client (no access) | Team |
|--------|-------|---------------------|-------------------|------|
| View all stocks | ✅ | ❌ | ❌ | ❌ |
| View own stocks | ✅ | ✅ | ❌ | ✅ (via store) |
| Create stock (pending) | ✅ | ✅ | ❌ | ✅ |
| Approve stock | ✅ | ❌ | ❌ | ❌ |
| Reject stock | ✅ | ❌ | ❌ | ❌ |
| Adjust quantity | ✅ | ❌ | ❌ | ❌ |
| Delete stock | ✅ | ❌ | ❌ | ❌ |
| View movements | ✅ | ✅ (own) | ❌ | ✅ (own) |
| Use in colis | ✅ | ✅ | ❌ | ✅ |
| Enable stock feature | ✅ | ❌ | ❌ | ❌ |
| Export reports | ✅ | ✅ (own) | ❌ | ❌ |

---

## 📊 REPORTING & ANALYTICS

### **Admin Dashboard Metrics**

```
┌─────────────────────────────────────────────────────────┐
│  STOCK MANAGEMENT OVERVIEW                              │
├─────────────────────────────────────────────────────────┤
│  📦 Total Stocks: 1,234                                 │
│  ⏳ Pending Approval: 23                                │
│  ✅ Active Stocks: 1,180                                │
│  🔴 Low Stock Alerts: 45                                │
│  ⚫ Out of Stock: 8                                     │
│  📊 Total Value: 2,450,000 MAD                          │
├─────────────────────────────────────────────────────────┤
│  Recent Activity:                                        │
│  • [12:34] Client ABC requested 500 units (pending)     │
│  • [11:20] Stock "SKU123" depleted - alert sent         │
│  • [10:15] Admin approved 3 stock requests              │
└─────────────────────────────────────────────────────────┘
```

### **Client Dashboard Metrics**

```
┌─────────────────────────────────────────────────────────┐
│  MY STOCK OVERVIEW                                      │
├─────────────────────────────────────────────────────────┤
│  📦 Total Products: 45                                  │
│  ✅ Available Units: 3,420                              │
│  🔒 Reserved Units: 180 (in 25 pending colis)          │
│  ⏳ Pending Approval: 2 requests                        │
│  ⚠️ Low Stock Items: 7                                  │
├─────────────────────────────────────────────────────────┤
│  Quick Actions:                                          │
│  [+ Add Stock] [📊 View Reports] [📋 History]          │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 IMPLEMENTATION ROADMAP

### **Phase 1: Foundation (Week 1-2)**
- [ ] Update Client & Store models with access control
- [ ] Create Stock model with all fields
- [ ] Create StockMovement model
- [ ] Create StockAlert model
- [ ] Update Colis model for stock integration
- [ ] Create database migration scripts
- [ ] Create indexes

### **Phase 2: Backend API (Week 3-4)**
- [ ] Create stockAccessMiddleware
- [ ] Implement StockController (client endpoints)
- [ ] Implement StockController (admin endpoints)
- [ ] Create stock routes
- [ ] Update ColisController for stock integration
- [ ] Add stock lifecycle hooks (reserve, deduct, release)
- [ ] Implement stock alert system

### **Phase 3: Admin Frontend (Week 5-6)**
- [ ] Admin stock dashboard
- [ ] Pending stock approvals page
- [ ] Stock approval/rejection modals
- [ ] All stocks management page
- [ ] Stock detail view with movement history
- [ ] Adjust stock quantity interface
- [ ] Client access management page
- [ ] Bulk import functionality
- [ ] Export/reporting features
- [ ] Stock alerts panel

### **Phase 4: Client Frontend (Week 7-8)**
- [ ] Client stock list (read-only)
- [ ] Create stock request form
- [ ] Stock detail view
- [ ] Movement history viewer
- [ ] Low stock alerts banner
- [ ] Request restock modal
- [ ] Stock selector in colis creation
- [ ] Stock dashboard/overview

### **Phase 5: Integration & Testing (Week 9-10)**
- [ ] Integration testing (colis + stock)
- [ ] Test approval workflows
- [ ] Test stock reservation/release
- [ ] Test concurrent stock operations
- [ ] Test access control
- [ ] Performance testing
- [ ] Edge case handling
- [ ] Bug fixes

### **Phase 6: Documentation & Training (Week 11-12)**
- [ ] API documentation (Postman/Swagger)
- [ ] User guides (Admin)
- [ ] User guides (Client)
- [ ] Video tutorials
- [ ] FAQ documentation
- [ ] Admin training
- [ ] Client onboarding materials

---

## 🧪 TESTING SCENARIOS

### **Test Case 1: Client Creates Stock**
```
1. Login as client WITH stock_management access
2. Navigate to "My Stock" → "Add Stock"
3. Fill form with valid data
4. Submit
5. Verify:
   ✓ Stock created with status='pending'
   ✓ StockMovement created (type: INITIAL)
   ✓ StockAlert created for admin (type: PENDING_APPROVAL)
   ✓ Stock appears in "My Stocks" with pending badge
   ✓ Cannot use this stock in colis yet
```

### **Test Case 2: Admin Approves Stock**
```
1. Login as admin
2. Navigate to "Stock Management" → "Pending Approvals"
3. Select pending stock
4. Click "Approve"
5. Fill approval form
6. Submit
7. Verify:
   ✓ Stock status changed to 'active'
   ✓ quantite_disponible = quantite_initial
   ✓ StockMovement created (type: CONFIRMED)
   ✓ StockAlert sent to client (type: STOCK_APPROVED)
   ✓ Stock now available for use in colis
```

### **Test Case 3: Create Colis with Stock**
```
1. Login as client
2. Create new colis with is_simple=false
3. Select stock item
4. Enter quantity (valid amount)
5. Submit
6. Verify:
   ✓ Colis created successfully
   ✓ Stock quantite_disponible decreased
   ✓ Stock quantite_reservee increased
   ✓ StockMovement created (type: RESERVED)
   ✓ If stock below threshold, alert created
   ✓ Cannot modify stock quantity while reserved
```

### **Test Case 4: Colis Delivered - Stock Deducted**
```
1. Admin changes colis status to "Livrée"
2. Verify:
   ✓ Stock quantite_reservee decreased
   ✓ Stock quantite_utilisee increased
   ✓ StockMovement created (type: OUT)
   ✓ Colis produit.stockDeducted = true
```

### **Test Case 5: Colis Cancelled - Stock Released**
```
1. Admin changes colis status to "Annulée"
2. Verify:
   ✓ Stock quantite_disponible increased
   ✓ Stock quantite_reservee decreased
   ✓ StockMovement created (type: RELEASED)
   ✓ Colis produit.stockReserved = false
```

### **Test Case 6: Client Without Access**
```
1. Login as client WITHOUT stock_management access
2. Try to access /api/stock/my-stocks
3. Verify:
   ✓ Returns 403 Forbidden
   ✓ Error message: "Stock management not enabled"
   ✓ No stock options visible in UI
   ✓ Cannot create stock-based colis
```

---

## ⚠️ EDGE CASES & ERROR HANDLING

### **Edge Case 1: Concurrent Stock Reservation**
```
Scenario: Two users try to use last 10 units simultaneously
Solution: Use MongoDB transactions with session locks
Implementation:
- Lock stock document during transaction
- Validate availability before reserve
- Rollback if conflict detected
```

### **Edge Case 2: Stock Already Used in Delivered Colis**
```
Scenario: Admin tries to delete stock that's been used
Solution: Prevent deletion if quantite_utilisee > 0
Error: "Cannot delete stock that has been used in delivered colis"
Alternative: Offer "Archive" instead of delete
```

### **Edge Case 3: Colis Status Changed Multiple Times**
```
Scenario: Colis goes Pending → Reserved → Cancelled → Reserved again
Solution: Track all state changes in movements
Implementation:
- Check current stock state before any operation
- Use idempotent operations
- Log all state transitions
```

### **Edge Case 4: Stock Expires During Reservation**
```
Scenario: Stock expires while reserved for pending colis
Solution:
- Run daily cron job to check expirations
- Create alert for expired reserved stock
- Admin decides: release reservation or deliver anyway
```

---

## 📈 SCALABILITY CONSIDERATIONS

### **Database Optimization**
```javascript
// Indexes for high-volume queries
Stock:
- { clientId: 1, status: 1, quantite_disponible: 1 }
- { status: 1, createdAt: -1 }
- { sku: 1, clientId: 1 } (unique)

StockMovement:
- { stockId: 1, date: -1, type: 1 }
- { clientId: 1, date: -1 }
- { colisId: 1, type: 1 }

// Compound indexes for common queries
{ clientId: 1, storeId: 1, status: 1, quantite_disponible: 1 }
```

### **Caching Strategy**
```javascript
// Cache frequently accessed data
Redis Keys:
- stock:{clientId}:active → List of active stocks
- stock:{stockId}:details → Stock details (1 hour TTL)
- client:{clientId}:access → Access permissions (24 hour TTL)

Invalidate on:
- Stock status change
- Quantity change
- Access permission change
```

### **Archiving Old Movements**
```javascript
// Archive movements older than 6 months
// Keep summary statistics
// Move to StockMovementArchive collection
// Maintain queryable archive for reports
```

---

## 📝 MIGRATION PLAN

### **Step 1: Add Access Fields to Existing Clients**
```javascript
// Migration script: add_stock_access_to_clients.js
db.clients.updateMany(
    {},
    {
        $set: {
            'features_access.stock_management': false,
            'features_access.api_integration': false,
            'features_access.advanced_reporting': false,
            'stock_config.require_admin_approval': true,
            'stock_config.low_stock_alert_threshold': 10,
            'stock_config.allow_negative_stock': false
        }
    }
);
```

### **Step 2: Enable Stock for Pilot Clients**
```javascript
// Manually enable for selected clients
db.clients.updateOne(
    { email: "pilot.client@example.com" },
    {
        $set: {
            'features_access.stock_management': true
        }
    }
);
```

### **Step 3: Import Existing Product Data as Stock**
```javascript
// Optional: Convert existing products to stock
// Only for clients with stock access enabled
```

---

## 🎓 USER TRAINING MATERIALS

### **Admin Quick Start**
1. Enable stock feature for client
2. Review pending stock requests daily
3. Approve/reject with notes
4. Monitor alerts dashboard
5. Adjust quantities when needed
6. Generate reports monthly

### **Client Quick Start**
1. Request stock management activation from admin
2. Create stock request with product details
3. Wait for admin approval
4. Once approved, use stock in colis creation
5. Monitor stock levels
6. Request restock when low

---

## 📚 API DOCUMENTATION PREVIEW

### **Endpoint: Create Stock (Client)**

```http
POST /api/stock/create
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "productName": "iPhone 13 Pro",
  "sku": "IPH13PRO-BLK-256",
  "hasVariants": true,
  "variantName": "Black - 256GB",
  "quantite_initial": 100,
  "quantite_minimum": 10,
  "unitCost": 8000,
  "unitPrice": 12000,
  "category": "Electronics",
  "tags": ["phone", "apple", "premium"],
  "clientNotes": "First batch arrival"
}

Response (201 Created):
{
  "success": true,
  "message": "Stock request submitted for admin approval",
  "stock": {
    "_id": "670abc...",
    "clientId": "660def...",
    "storeId": "665ghi...",
    "productName": "iPhone 13 Pro",
    "sku": "IPH13PRO-BLK-256",
    "status": "pending",
    "quantite_initial": 100,
    "quantite_disponible": 0,
    "submittedAt": "2025-01-15T10:30:00Z"
  },
  "alert": {
    "type": "PENDING_APPROVAL",
    "message": "New stock request from client awaits approval"
  }
}

Errors:
400 - SKU already exists
400 - Validation errors
403 - Stock management not enabled
500 - Server error
```

---

This comprehensive documentation covers all aspects of the advanced stock management system. Ready to start implementation? 🚀

