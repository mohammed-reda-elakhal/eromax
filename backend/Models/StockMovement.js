const mongoose = require("mongoose");

// StockMovement Schema - Tracks all stock quantity changes
const StockMovementSchema = new mongoose.Schema({
    // ============ REFERENCES ============
    stockId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
        required: true,
        index: true,
        description: "Stock item this movement relates to"
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
        index: true,
        description: "Client who owns the stock"
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
        description: "Store associated with the stock"
    },
    colisId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Colis',
        default: null,
        description: "Related colis (if movement is colis-related)"
    },
    
    // ============ MOVEMENT TYPE ============
    type: {
        type: String,
        enum: [
            'INITIAL',          // Initial stock creation
            'IN',               // Stock added (restock, purchase)
            'OUT',              // Stock removed (used in delivered colis)
            'ADJUSTMENT',       // Manual adjustment by admin
            'RESERVED',         // Reserved for pending colis
            'RELEASED',         // Reservation released (colis cancelled/refused)
            'RETURN',           // Stock returned from colis
            'CONFIRMED',        // Admin confirmed pending stock
            'REJECTED',         // Admin rejected pending stock
            'TRANSFER',         // Transfer between locations/stores
            'DAMAGED',          // Marked as damaged/defective
            'EXPIRED',          // Marked as expired
            'LOST',             // Marked as lost/missing
            'CORRECTION'        // Error correction
        ],
        required: true,
        index: true,
        description: "Type of stock movement"
    },
    
    // ============ QUANTITIES ============
    quantity: {
        type: Number,
        required: true,
        description: "Quantity moved (positive for additions, negative for reductions)"
    },
    
    // Disponible (available) quantity tracking
    quantityBefore: {
        type: Number,
        required: true,
        description: "Available quantity before this movement"
    },
    quantityAfter: {
        type: Number,
        required: true,
        description: "Available quantity after this movement"
    },
    
    // Reservee (reserved) quantity tracking
    reservedBefore: {
        type: Number,
        default: 0,
        description: "Reserved quantity before this movement"
    },
    reservedAfter: {
        type: Number,
        default: 0,
        description: "Reserved quantity after this movement"
    },
    
    // Utilisee (used) quantity tracking
    usedBefore: {
        type: Number,
        default: 0,
        description: "Used quantity before this movement"
    },
    usedAfter: {
        type: Number,
        default: 0,
        description: "Used quantity after this movement"
    },
    
    // ============ DETAILS ============
    reason: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
        description: "Reason for this movement"
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 1000,
        description: "Additional notes or details"
    },
    
    // ============ WHO PERFORMED THE ACTION ============
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'performedByModel',
        required: true,
        description: "User/System who performed this movement"
    },
    performedByModel: {
        type: String,
        enum: ['Admin', 'Team', 'Client', 'System'],
        required: true,
        description: "Model type of the performer"
    },
    performedByRole: {
        type: String,
        enum: ['admin', 'client', 'team', 'system', 'livreur'],
        required: true,
        description: "Role of the performer"
    },
    performedByName: {
        type: String,
        trim: true,
        description: "Name of person who performed action (snapshot)"
    },
    
    // ============ REFERENCE DATA (SNAPSHOT) ============
    // Store snapshot data at time of movement for historical accuracy
    referenceData: {
        colisCode: { 
            type: String,
            description: "Code suivi of related colis"
        },
        clientName: { 
            type: String,
            description: "Client name at time of movement"
        },
        storeName: {
            type: String,
            description: "Store name at time of movement"
        },
        productName: { 
            type: String,
            description: "Product name at time of movement"
        },
        variantName: { 
            type: String,
            description: "Variant name at time of movement"
        },
        sku: { 
            type: String,
            description: "SKU at time of movement"
        },
        // Transfer-specific data
        fromLocation: {
            type: String,
            description: "Source location for transfers"
        },
        toLocation: {
            type: String,
            description: "Destination location for transfers"
        }
    },
    
    // ============ TIMESTAMP ============
    date: {
        type: Date,
        default: Date.now,
        index: true,
        description: "Date and time of this movement"
    },
    
    // ============ METADATA ============
    ipAddress: {
        type: String,
        description: "IP address of user who performed action"
    },
    userAgent: {
        type: String,
        description: "Browser/client user agent"
    }
    
}, { 
    timestamps: true  // Adds createdAt and updatedAt
});

// ============ INDEXES FOR PERFORMANCE ============
// Common query patterns
StockMovementSchema.index({ stockId: 1, date: -1 });
StockMovementSchema.index({ clientId: 1, date: -1 });
StockMovementSchema.index({ storeId: 1, date: -1 });
StockMovementSchema.index({ type: 1, date: -1 });
// Note: colisId already has index: true in schema definition above
StockMovementSchema.index({ performedBy: 1, date: -1 });
// Composite index for filtering by client and type
StockMovementSchema.index({ clientId: 1, type: 1, date: -1 });

// ============ VIRTUAL FIELDS ============
// Calculate net change (after - before for disponible)
StockMovementSchema.virtual('netChange').get(function() {
    return this.quantityAfter - this.quantityBefore;
});

// Is this an increase or decrease?
StockMovementSchema.virtual('isIncrease').get(function() {
    return this.quantityAfter > this.quantityBefore;
});

// ============ STATIC METHODS ============
// Get movement history for a stock
StockMovementSchema.statics.getStockHistory = async function(stockId, options = {}) {
    const { limit = 50, skip = 0, type = null } = options;
    
    const query = { stockId };
    if (type) {
        query.type = type;
    }
    
    return this.find(query)
        .sort({ date: -1 })
        .limit(limit)
        .skip(skip)
        .populate('performedBy', 'nom prenom email')
        .populate('colisId', 'code_suivi statut');
};

// Get movement summary for a stock
StockMovementSchema.statics.getStockSummary = async function(stockId) {
    return this.aggregate([
        { $match: { stockId: mongoose.Types.ObjectId(stockId) } },
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 },
                totalQuantity: { $sum: '$quantity' }
            }
        },
        { $sort: { count: -1 } }
    ]);
};

// Get movements by date range
StockMovementSchema.statics.getMovementsByDateRange = async function(clientId, startDate, endDate, options = {}) {
    const { type = null, stockId = null } = options;
    
    const query = {
        clientId,
        date: { $gte: startDate, $lte: endDate }
    };
    
    if (type) query.type = type;
    if (stockId) query.stockId = stockId;
    
    return this.find(query)
        .sort({ date: -1 })
        .populate('stockId', 'sku productName variantName')
        .populate('performedBy', 'nom prenom');
};

// ============ INSTANCE METHODS ============
// Format movement for display
StockMovementSchema.methods.getDisplayInfo = function() {
    return {
        id: this._id,
        type: this.type,
        quantity: this.quantity,
        netChange: this.netChange,
        isIncrease: this.isIncrease,
        quantityBefore: this.quantityBefore,
        quantityAfter: this.quantityAfter,
        reservedBefore: this.reservedBefore,
        reservedAfter: this.reservedAfter,
        reason: this.reason,
        performedBy: this.performedByName || 'System',
        date: this.date,
        colisCode: this.referenceData?.colisCode || null
    };
};

// ============ MODEL ============
const StockMovement = mongoose.model("StockMovement", StockMovementSchema);

module.exports = {
    StockMovement
};

