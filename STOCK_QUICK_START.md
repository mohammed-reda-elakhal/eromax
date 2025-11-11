# 🚀 STOCK MANAGEMENT - QUICK START GUIDE

## 📖 Overview

This is an **advanced stock management system** with:
- ✅ Client-initiated stock creation (pending approval)
- ✅ Admin approval workflow
- ✅ Product variant support
- ✅ Granular access control
- ✅ Automatic stock reservation/deduction
- ✅ Complete audit trail

---

## 🎯 Key Concepts

### **Stock Status Flow**
```
pending → (admin reviews) → approved/active → (used in colis) → depleted
                          ↓
                       rejected
```

### **Stock Quantities**
- `quantite_initial`: Original amount when created
- `quantite_disponible`: Available for new colis
- `quantite_reservee`: Reserved for pending colis
- `quantite_utilisee`: Already used in delivered colis

**Formula:** `initial = disponible + reservee + utilisee`

### **Access Control**
Not all clients have stock access. Admin must enable via:
```javascript
client.features_access.stock_management = true
```

---

## 📊 Visual Workflows

### **Workflow 1: Stock Creation & Approval**

```
┌─────────────┐
│   CLIENT    │
│ Creates     │
│ Stock       │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Status: PENDING │
│ Qty Available: 0│
└──────┬──────────┘
       │
       │ Notification sent
       ▼
┌─────────────┐
│    ADMIN    │
│  Reviews    │
└──────┬──────┘
       │
   ┌───┴───┐
   ▼       ▼
APPROVE  REJECT
   │       │
   ▼       └─→ Status: REJECTED
┌─────────────────┐
│ Status: ACTIVE  │
│ Qty Available:X │
└─────────────────┘
       │
       │ Can now be used
       ▼
┌─────────────┐
│  In COLIS   │
└─────────────┘
```

### **Workflow 2: Stock in Colis Lifecycle**

```
COLIS CREATED
└─→ Stock RESERVED
    ├─ quantite_disponible -= qty
    └─ quantite_reservee += qty

        │
    ┌───┴───┐
    ▼       ▼
DELIVERED  CANCELLED
    │       │
    ▼       ▼
  DEDUCT  RELEASE
    │       │
    ▼       └─→ quantite_disponible += qty
quantite_utilisee += qty    quantite_reservee -= qty
quantite_reservee -= qty
```

---

## 🔧 Implementation Order

### **Week 1-2: Models**
1. Update `Client.js` - Add `features_access` and `stock_config`
2. Update `Store.js` - Add `features_access` and `stock_location`
3. Create `Stock.js` - Main stock model
4. Create `StockMovement.js` - History tracking
5. Create `StockAlert.js` - Notifications
6. Update `Colis.js` - Add stock fields to products

### **Week 3-4: Backend**
1. Create `stockAccessMiddleware.js`
2. Create `stockController.js` (all endpoints)
3. Update `colisController.js` (stock integration)
4. Create `stockRoute.js`
5. Register routes in main app

### **Week 5-6: Frontend Admin**
1. Stock Dashboard
2. Pending Approvals Page
3. Approval/Rejection Modals
4. All Stocks Management
5. Alerts Panel
6. Client Access Manager

### **Week 7-8: Frontend Client**
1. My Stock List
2. Create Stock Request Form
3. Stock Detail View
4. Stock Selector for Colis
5. Update Colis Creation Form

### **Week 9-10: Testing & Deploy**
1. Unit tests
2. Integration tests
3. E2E tests
4. Staging deployment
5. Pilot client rollout
6. Production deployment

---

## 🛠️ First Steps - Hands On

### **Step 1: Update Client Model** (5 mins)

Add to `backend/Models/Client.js`:

```javascript
const ClientSchema = new mongoose.Schema({
    // ... existing fields ...
    
    // ADD THIS:
    features_access: {
        stock_management: {
            type: Boolean,
            default: false
        },
        api_integration: {
            type: Boolean,
            default: false
        },
        advanced_reporting: {
            type: Boolean,
            default: false
        },
        multi_store: {
            type: Boolean,
            default: false
        },
        bulk_operations: {
            type: Boolean,
            default: false
        },
        custom_branding: {
            type: Boolean,
            default: false
        }
    },
    
    stock_config: {
        require_admin_approval: {
            type: Boolean,
            default: true
        },
        auto_approve_threshold: {
            type: Number,
            default: null
        },
        low_stock_alert_threshold: {
            type: Number,
            default: 10
        },
        allow_negative_stock: {
            type: Boolean,
            default: false
        }
    }
}, { timestamps: true });

// ADD INDEX:
ClientSchema.index({ 'features_access.stock_management': 1 });
```

### **Step 2: Update Validation** (2 mins)

Add to validation function:

```javascript
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
```

### **Step 3: Create Stock Model** (15 mins)

Create `backend/Models/Stock.js`:

```javascript
const mongoose = require("mongoose");
const Joi = require("joi");

const StockSchema = new mongoose.Schema({
    // Ownership
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
    
    // Product Info
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: null
    },
    productName: {
        type: String,
        required: true,
        trim: true
    },
    
    // Variant Support
    hasVariants: {
        type: Boolean,
        default: false
    },
    variantId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    variantName: {
        type: String,
        default: null
    },
    
    // SKU
    sku: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    
    // Quantities
    quantite_initial: {
        type: Number,
        required: true,
        min: 0
    },
    quantite_disponible: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    quantite_reservee: {
        type: Number,
        default: 0,
        min: 0
    },
    quantite_utilisee: {
        type: Number,
        default: 0,
        min: 0
    },
    quantite_minimum: {
        type: Number,
        default: 10,
        min: 0
    },
    
    // Status (KEY FIELD!)
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'rejected', 'active', 'inactive', 'depleted'],
        default: 'pending',
        required: true,
        index: true
    },
    
    // Pricing
    unitCost: {
        type: Number,
        default: 0,
        min: 0
    },
    unitPrice: {
        type: Number,
        default: 0,
        min: 0
    },
    
    // Approval Workflow
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    },
    confirmationNotes: {
        type: String,
        trim: true
    },
    rejectionReason: {
        type: String,
        trim: true
    },
    
    // Other
    location: {
        type: String,
        default: "siege"
    },
    notes: {
        type: String,
        trim: true
    },
    clientNotes: {
        type: String,
        trim: true
    }
    
}, { timestamps: true });

// Indexes
StockSchema.index({ clientId: 1, storeId: 1, sku: 1 }, { unique: true });
StockSchema.index({ clientId: 1, status: 1 });
StockSchema.index({ status: 1, quantite_disponible: 1 });

// Pre-save hook
StockSchema.pre('save', function(next) {
    if (this.isModified('status') && this.status === 'confirmed') {
        this.status = 'active';
        this.quantite_disponible = this.quantite_initial;
    }
    if (this.quantite_disponible === 0 && this.status === 'active') {
        this.status = 'depleted';
    }
    next();
});

const Stock = mongoose.model("Stock", StockSchema);

// Validation
function validateStock(obj) {
    const schema = Joi.object({
        clientId: Joi.string().required(),
        storeId: Joi.string().required(),
        productId: Joi.string().allow(null).optional(),
        productName: Joi.string().trim().required(),
        hasVariants: Joi.boolean().optional(),
        variantId: Joi.string().allow(null).optional(),
        variantName: Joi.string().allow(null).optional(),
        sku: Joi.string().trim().uppercase().required(),
        quantite_initial: Joi.number().min(0).required(),
        quantite_minimum: Joi.number().min(0).optional(),
        unitCost: Joi.number().min(0).optional(),
        unitPrice: Joi.number().min(0).optional(),
        location: Joi.string().trim().optional(),
        notes: Joi.string().trim().optional(),
        clientNotes: Joi.string().trim().optional()
    });
    return schema.validate(obj);
}

module.exports = { Stock, validateStock };
```

### **Step 4: Test Stock Model** (5 mins)

Create a simple test script `test_stock.js`:

```javascript
const mongoose = require("mongoose");
const { Stock } = require("./Models/Stock");

mongoose.connect("mongodb://localhost:27017/eromax_test");

async function testStock() {
    try {
        const stock = new Stock({
            clientId: "6123456789abcdef01234567",
            storeId: "6123456789abcdef01234568",
            productName: "Test Product",
            sku: "TEST-001",
            quantite_initial: 100,
            status: 'pending'
        });
        
        await stock.save();
        console.log("✅ Stock created:", stock);
        
        // Test approval
        stock.status = 'confirmed';
        await stock.save();
        console.log("✅ Stock confirmed (should be active):", stock.status);
        console.log("✅ Available quantity:", stock.quantite_disponible);
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        mongoose.connection.close();
    }
}

testStock();
```

Run: `node test_stock.js`

---

## 🎮 Testing Your Implementation

### **Test 1: Access Control**

```bash
# Try accessing stock without feature enabled
curl -X GET http://localhost:5000/api/stock/my-stocks \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: 403 Forbidden
# "Stock management feature not enabled"
```

### **Test 2: Create Stock (Client)**

```bash
curl -X POST http://localhost:5000/api/stock/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "iPhone 13 Pro",
    "sku": "IPH13-BLK-256",
    "quantite_initial": 50,
    "unitCost": 8000,
    "unitPrice": 12000,
    "clientNotes": "First batch"
  }'

# Expected: 201 Created
# Stock with status='pending'
```

### **Test 3: Approve Stock (Admin)**

```bash
curl -X POST http://localhost:5000/api/stock/admin/STOCK_ID/approve \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "confirmationNotes": "Stock received and verified",
    "dateReceived": "2025-01-15"
  }'

# Expected: 200 OK
# Stock with status='active', quantite_disponible=50
```

### **Test 4: Use Stock in Colis**

```bash
curl -X POST http://localhost:5000/api/colis/user/:id_user \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "John Doe",
    "tele": "0612345678",
    "ville": "VILLE_ID",
    "prix": 12000,
    "is_simple": false,
    "produits": [{
      "produit": "PRODUCT_ID",
      "usesStock": true,
      "stockId": "STOCK_ID",
      "quantityUsed": 2
    }]
  }'

# Expected: 201 Created
# Stock: quantite_disponible=48, quantite_reservee=2
```

---

## 📚 Key Files to Create/Modify

### **Models** (Create New)
- ✅ `backend/Models/Stock.js`
- ✅ `backend/Models/StockMovement.js`
- ✅ `backend/Models/StockAlert.js`

### **Models** (Modify Existing)
- ✅ `backend/Models/Client.js` - Add features_access
- ✅ `backend/Models/Store.js` - Add features_access
- ✅ `backend/Models/Colis.js` - Add stock fields to produits

### **Controllers** (Create New)
- ✅ `backend/Controllers/stockController.js`

### **Controllers** (Modify Existing)
- ✅ `backend/Controllers/colisController.js` - Stock integration

### **Middleware** (Create New)
- ✅ `backend/middleware/stockAccessMiddleware.js`

### **Routes** (Create New)
- ✅ `backend/Routes/stockRoute.js`

### **Frontend Admin** (Create New)
- ✅ All components in `admin/stock/` folder

### **Frontend Client** (Create New)
- ✅ All components in `client/stock/` folder

---

## 🎯 Success Criteria

### **Phase 1 Complete When:**
- [ ] All models created and tested
- [ ] Can create stock document in database
- [ ] Validation works correctly
- [ ] Pre-save hooks execute properly

### **Phase 2 Complete When:**
- [ ] All API endpoints respond correctly
- [ ] Access control works (with/without permission)
- [ ] Stock approval workflow works
- [ ] Colis creation reserves stock
- [ ] Status changes update stock

### **Phase 3 Complete When:**
- [ ] Admin can view pending stocks
- [ ] Admin can approve/reject
- [ ] Client can create stock requests
- [ ] Client can view their stocks
- [ ] Stock selector works in colis form
- [ ] UI is intuitive and responsive

---

## 💡 Pro Tips

1. **Start Small**: Implement one endpoint at a time, test thoroughly
2. **Use Transactions**: Always use MongoDB sessions for stock operations
3. **Log Everything**: Every stock change should create a movement record
4. **Test Edge Cases**: Concurrent operations, zero stock, etc.
5. **User Feedback**: Get feedback early and iterate
6. **Document As You Go**: Update API docs while coding
7. **Monitor Performance**: Watch for slow queries, add indexes as needed

---

## 🆘 Common Issues & Solutions

### **Issue: SKU Duplicate Error**
```
Solution: Ensure SKU is unique per client
Check: Stock.index({ clientId: 1, storeId: 1, sku: 1 }, { unique: true })
```

### **Issue: Stock Not Available After Approval**
```
Solution: Check pre-save hook
Verify: status === 'confirmed' sets quantite_disponible = quantite_initial
```

### **Issue: Stock Not Deducted After Colis Delivered**
```
Solution: Ensure handleColisDelivered is called
Check: UpdateColisStatutCtrl calls helper when status → "Livrée"
```

### **Issue: Client Can't Access Stock**
```
Solution: Check features_access
Verify: client.features_access.stock_management === true
```

---

## 📞 Next Steps

1. ✅ Read full documentation (STOCK_MANAGEMENT_DOCUMENTATION.md)
2. ✅ Follow implementation checklist (STOCK_IMPLEMENTATION_CHECKLIST.md)
3. ✅ Start with Client model update
4. ✅ Create Stock model
5. ✅ Test basic operations
6. ✅ Move to controllers
7. ✅ Build frontend incrementally

---

## 🎉 You're Ready!

You now have:
- ✅ Complete system documentation
- ✅ Step-by-step implementation guide
- ✅ Quick start examples
- ✅ Testing strategies
- ✅ Troubleshooting tips

**Time to build! 🚀**

Questions? Refer to main documentation or ask for help.

Good luck! 💪

