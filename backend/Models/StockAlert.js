const mongoose = require("mongoose");

// StockAlert Schema - Manages stock-related notifications and alerts
const StockAlertSchema = new mongoose.Schema({
    // ============ REFERENCES ============
    stockId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
        required: true,
        index: true,
        description: "Stock item this alert relates to"
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
    
    // ============ ALERT TYPE ============
    type: {
        type: String,
        enum: [
            'LOW_STOCK',           // Stock below minimum threshold
            'OUT_OF_STOCK',        // Stock depleted (quantity = 0)
            'RESTOCK_NEEDED',      // Manual restock request/reminder
            'PENDING_APPROVAL',    // New stock awaiting admin approval
            'STOCK_APPROVED',      // Stock approved by admin
            'STOCK_REJECTED',      // Stock rejected by admin
            'EXPIRING_SOON',       // Stock will expire within X days
            'EXPIRED',             // Stock has expired
            'HIGH_RESERVATION',    // Too many reservations (potential issue)
            'STOCK_DAMAGED',       // Stock marked as damaged
            'STOCK_LOST',          // Stock marked as lost
            'UNUSUAL_ACTIVITY'     // Unusual stock movement detected
        ],
        required: true,
        index: true,
        description: "Type of alert"
    },
    
    // ============ ALERT DETAILS ============
    severity: {
        type: String,
        enum: ['info', 'warning', 'critical'],
        default: 'info',
        index: true,
        description: "Alert severity level"
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
        description: "Alert title/heading"
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
        description: "Alert message/description"
    },
    
    // ============ STOCK DATA SNAPSHOT ============
    // Capture stock state at time of alert
    stockSnapshot: {
        sku: { type: String },
        productName: { type: String },
        variantName: { type: String },
        quantite_disponible: { type: Number },
        quantite_reservee: { type: Number },
        quantite_minimum: { type: Number },
        status: { type: String }
    },
    
    // ============ ALERT METADATA ============
    currentQuantity: {
        type: Number,
        description: "Stock quantity when alert was created"
    },
    threshold: {
        type: Number,
        description: "Threshold value that triggered alert (if applicable)"
    },
    expirationDate: {
        type: Date,
        description: "Expiration date (for expiring/expired alerts)"
    },
    daysUntilExpiration: {
        type: Number,
        description: "Days until expiration (for expiring soon alerts)"
    },
    
    // ============ ALERT STATUS ============
    isRead: {
        type: Boolean,
        default: false,
        index: true,
        description: "Whether alert has been read"
    },
    
    // Track who read the alert (can have multiple readers)
    readBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'readBy.userModel',
            description: "User who read the alert"
        },
        userModel: {
            type: String,
            enum: ['Admin', 'Client', 'Team'],
            description: "Model type of reader"
        },
        userName: {
            type: String,
            description: "Name of user who read (snapshot)"
        },
        readAt: {
            type: Date,
            default: Date.now,
            description: "When alert was read"
        }
    }],
    
    // ============ RESOLUTION ============
    isResolved: {
        type: Boolean,
        default: false,
        index: true,
        description: "Whether the issue has been resolved"
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'resolvedByModel',
        description: "User who resolved the alert"
    },
    resolvedByModel: {
        type: String,
        enum: ['Admin', 'Client', 'Team'],
        description: "Model type of resolver"
    },
    resolvedByName: {
        type: String,
        description: "Name of user who resolved (snapshot)"
    },
    resolvedAt: {
        type: Date,
        description: "When alert was resolved"
    },
    resolutionNotes: {
        type: String,
        trim: true,
        maxlength: 500,
        description: "Notes about how alert was resolved"
    },
    resolutionAction: {
        type: String,
        enum: [
            'RESTOCKED',           // Stock was replenished
            'ACKNOWLEDGED',        // Alert acknowledged but no action needed
            'APPROVED',            // Stock was approved (for pending approval alerts)
            'REJECTED',            // Stock was rejected
            'DISMISSED',           // Alert dismissed
            'AUTO_RESOLVED'        // Automatically resolved by system
        ],
        description: "Action taken to resolve"
    },
    
    // ============ AUTO-DISMISS ============
    autoDismiss: {
        type: Boolean,
        default: true,
        description: "Whether to auto-dismiss when condition is resolved"
    },
    autoDismissedAt: {
        type: Date,
        description: "When alert was auto-dismissed"
    },
    
    // ============ NOTIFICATION STATUS ============
    notificationSent: {
        type: Boolean,
        default: false,
        description: "Whether notification was sent to user"
    },
    notificationSentAt: {
        type: Date,
        description: "When notification was sent"
    },
    notificationChannels: [{
        type: String,
        enum: ['email', 'sms', 'push', 'in_app', 'whatsapp'],
        description: "Channels through which notification was sent"
    }],
    
    // ============ PRIORITY & URGENCY ============
    priority: {
        type: Number,
        default: 5,
        min: 1,
        max: 10,
        description: "Alert priority (1=lowest, 10=highest)"
    },
    isUrgent: {
        type: Boolean,
        default: false,
        description: "Whether this is an urgent alert"
    },
    
    // ============ EXPIRATION ============
    expiresAt: {
        type: Date,
        description: "When alert expires/becomes irrelevant"
    },
    isExpired: {
        type: Boolean,
        default: false,
        index: true,
        description: "Whether alert has expired"
    },
    
    // ============ RELATED RECORDS ============
    relatedColisId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Colis',
        description: "Related colis (if applicable)"
    },
    relatedMovementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StockMovement',
        description: "Related stock movement (if applicable)"
    }
    
}, { 
    timestamps: true  // Adds createdAt and updatedAt
});

// ============ INDEXES FOR PERFORMANCE ============
// Common query patterns
StockAlertSchema.index({ clientId: 1, isRead: 1, isResolved: 1 });
StockAlertSchema.index({ stockId: 1, createdAt: -1 });
StockAlertSchema.index({ type: 1, isResolved: 1 });
StockAlertSchema.index({ severity: 1, isRead: 1 });
StockAlertSchema.index({ createdAt: -1 });
StockAlertSchema.index({ isUrgent: 1, isResolved: 1 });
// For auto-dismissal job
StockAlertSchema.index({ autoDismiss: 1, isResolved: 1, expiresAt: 1 });

// ============ VIRTUAL FIELDS ============
// How long alert has been unresolved (in hours)
StockAlertSchema.virtual('unresolvedDuration').get(function() {
    if (this.isResolved) return 0;
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60));
});

// Is alert stale? (unresolved for > 72 hours)
StockAlertSchema.virtual('isStale').get(function() {
    return !this.isResolved && this.unresolvedDuration > 72;
});

// ============ STATIC METHODS ============
// Get unresolved alerts for a client
StockAlertSchema.statics.getUnresolvedAlerts = async function(clientId, options = {}) {
    const { type = null, severity = null, limit = 50 } = options;
    
    const query = {
        clientId,
        isResolved: false,
        isExpired: false
    };
    
    if (type) query.type = type;
    if (severity) query.severity = severity;
    
    return this.find(query)
        .sort({ priority: -1, createdAt: -1 })
        .limit(limit)
        .populate('stockId', 'sku productName variantName quantite_disponible');
};

// Get alert statistics for dashboard
StockAlertSchema.statics.getAlertStats = async function(clientId) {
    const stats = await this.aggregate([
        { $match: { clientId: mongoose.Types.ObjectId(clientId) } },
        {
            $facet: {
                byType: [
                    { $group: { _id: '$type', count: { $sum: 1 } } },
                    { $sort: { count: -1 } }
                ],
                bySeverity: [
                    { $group: { _id: '$severity', count: { $sum: 1 } } }
                ],
                byStatus: [
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 },
                            unresolved: {
                                $sum: { $cond: [{ $eq: ['$isResolved', false] }, 1, 0] }
                            },
                            urgent: {
                                $sum: { $cond: [{ $eq: ['$isUrgent', true] }, 1, 0] }
                            }
                        }
                    }
                ]
            }
        }
    ]);
    
    return stats[0];
};

// Mark alert as read
StockAlertSchema.statics.markAsRead = async function(alertId, userId, userModel, userName) {
    return this.findByIdAndUpdate(
        alertId,
        {
            $set: { isRead: true },
            $push: {
                readBy: {
                    userId,
                    userModel,
                    userName,
                    readAt: new Date()
                }
            }
        },
        { new: true }
    );
};

// Auto-dismiss resolved alerts
StockAlertSchema.statics.autoDismissResolved = async function() {
    // This would be called by a cron job
    // Dismiss alerts where stock is back above threshold, etc.
    // Implementation depends on specific business logic
    return this.updateMany(
        {
            autoDismiss: true,
            isResolved: false,
            type: { $in: ['LOW_STOCK', 'OUT_OF_STOCK'] }
            // Add more conditions based on actual stock state
        },
        {
            $set: {
                isResolved: true,
                resolvedAt: new Date(),
                resolutionAction: 'AUTO_RESOLVED',
                autoDismissedAt: new Date()
            }
        }
    );
};

// ============ INSTANCE METHODS ============
// Resolve alert
StockAlertSchema.methods.resolve = async function(userId, userModel, userName, notes, action) {
    this.isResolved = true;
    this.resolvedBy = userId;
    this.resolvedByModel = userModel;
    this.resolvedByName = userName;
    this.resolvedAt = new Date();
    this.resolutionNotes = notes || '';
    this.resolutionAction = action || 'ACKNOWLEDGED';
    
    return this.save();
};

// Mark as read
StockAlertSchema.methods.markRead = async function(userId, userModel, userName) {
    // Check if already read by this user
    const alreadyRead = this.readBy.some(
        reader => reader.userId.toString() === userId.toString()
    );
    
    if (!alreadyRead) {
        this.readBy.push({
            userId,
            userModel,
            userName,
            readAt: new Date()
        });
        this.isRead = true;
        return this.save();
    }
    
    return this;
};

// Format alert for display
StockAlertSchema.methods.getDisplayInfo = function() {
    return {
        id: this._id,
        type: this.type,
        severity: this.severity,
        title: this.title,
        message: this.message,
        currentQuantity: this.currentQuantity,
        threshold: this.threshold,
        isRead: this.isRead,
        isResolved: this.isResolved,
        isUrgent: this.isUrgent,
        createdAt: this.createdAt,
        unresolvedDuration: this.unresolvedDuration,
        stock: {
            sku: this.stockSnapshot?.sku,
            productName: this.stockSnapshot?.productName,
            variantName: this.stockSnapshot?.variantName
        }
    };
};

// ============ PRE-SAVE HOOKS ============
StockAlertSchema.pre('save', function(next) {
    // Set priority based on severity and type
    if (this.isNew) {
        if (this.severity === 'critical') {
            this.priority = 9;
            this.isUrgent = true;
        } else if (this.severity === 'warning') {
            this.priority = 6;
        } else {
            this.priority = 3;
        }
        
        // Higher priority for certain types
        if (this.type === 'OUT_OF_STOCK') {
            this.priority = Math.max(this.priority, 8);
        } else if (this.type === 'PENDING_APPROVAL') {
            this.priority = 7;
        }
    }
    
    // Check if alert should expire
    if (this.expiresAt && this.expiresAt < new Date()) {
        this.isExpired = true;
    }
    
    next();
});

// ============ MODEL ============
const StockAlert = mongoose.model("StockAlert", StockAlertSchema);

module.exports = {
    StockAlert
};

