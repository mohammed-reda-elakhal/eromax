# 🧪 Stock Management API - Testing Guide

## 📋 Postman Collection Setup

### Base URL
```
http://localhost:5000/api/stock
```

### Headers (All Requests)
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 🔑 Step 1: Get Authentication Tokens

### Admin Login
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@eromax.com",
  "password": "admin_password"
}
```

### Client/Team Login
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "client@example.com",
  "password": "client_password"
}
```

**Save the token from response for subsequent requests!**

---

## 🎯 Test Scenarios

### Scenario 1: Enable Stock Management for Client

#### 1.1 Update Client Access (Admin Only)
```http
PUT /api/stock/admin/client/CLIENT_ID_HERE/access
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "features_access": {
    "stock_management": true,
    "bulk_operations": true
  },
  "stock_config": {
    "require_admin_approval": true,
    "low_stock_alert_threshold": 10,
    "allow_negative_stock": false
  }
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Client stock access updated successfully",
  "client": {
    "_id": "...",
    "nom": "Client Name",
    "features_access": {
      "stock_management": true,
      "bulk_operations": true
    },
    "stock_config": {
      "require_admin_approval": true,
      "low_stock_alert_threshold": 10
    }
  }
}
```

---

### Scenario 2: Client Creates Stock

#### 2.1 Create Stock (Client/Team)
```http
POST /api/stock/create
Authorization: Bearer CLIENT_TOKEN
Content-Type: application/json

{
  "storeId": "YOUR_STORE_ID",
  "productName": "iPhone 13 Pro",
  "sku": "IPH13PRO-BLK-256",
  "hasVariants": true,
  "variantName": "Black - 256GB",
  "quantite_initial": 100,
  "quantite_minimum": 10,
  "unitCost": 8000,
  "unitPrice": 12000,
  "currency": "MAD",
  "location": "siege",
  "category": "Electronics",
  "tags": ["phone", "apple", "premium"],
  "clientNotes": "First batch from supplier"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Stock created successfully and submitted for admin approval",
  "stock": {
    "_id": "STOCK_ID",
    "sku": "IPH13PRO-BLK-256",
    "productName": "iPhone 13 Pro",
    "status": "pending",
    "quantite_initial": 100,
    "quantite_disponible": 0,
    "submittedAt": "2025-01-15T10:30:00Z"
  },
  "note": "Stock will be available for use once approved by admin"
}
```

---

### Scenario 3: Admin Reviews Stock

#### 3.1 Get Pending Stocks (Admin)
```http
GET /api/stock/admin/pending?page=1&limit=20
Authorization: Bearer ADMIN_TOKEN
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "STOCK_ID",
      "sku": "IPH13PRO-BLK-256",
      "productName": "iPhone 13 Pro",
      "status": "pending",
      "quantite_initial": 100,
      "submittedAt": "2025-01-15T10:30:00Z",
      "clientId": {
        "nom": "Client",
        "prenom": "Name",
        "email": "client@example.com"
      }
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

#### 3.2 Approve Stock (Admin)
```http
POST /api/stock/admin/STOCK_ID/approve
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "confirmationNotes": "Stock received and verified. Condition: excellent",
  "dateReceived": "2025-01-15",
  "actualQuantity": 100,
  "location": "siege - shelf A3"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Stock approved successfully",
  "stock": {
    "_id": "STOCK_ID",
    "status": "active",
    "quantite_disponible": 100,
    "reviewedBy": { "nom": "Admin", "prenom": "Name" },
    "reviewedAt": "2025-01-15T11:00:00Z"
  }
}
```

#### 3.3 Reject Stock (Admin) - Alternative
```http
POST /api/stock/admin/STOCK_ID/reject
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "rejectionReason": "Quantities don't match invoice. Please resubmit with correct information."
}
```

---

### Scenario 4: Client Views Their Stocks

#### 4.1 Get My Stocks (Client)
```http
GET /api/stock/my-stocks?status=active&page=1&limit=20&search=iPhone
Authorization: Bearer CLIENT_TOKEN
```

**Query Parameters:**
- `status` (optional): pending, active, rejected, depleted
- `page` (default: 1)
- `limit` (default: 20)
- `search` (optional): search in SKU, productName, variantName
- `sortBy` (default: createdAt): field to sort by
- `sortOrder` (default: desc): asc or desc

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "STOCK_ID",
      "sku": "IPH13PRO-BLK-256",
      "productName": "iPhone 13 Pro",
      "variantName": "Black - 256GB",
      "status": "active",
      "quantite_disponible": 100,
      "quantite_reservee": 0,
      "quantite_utilisee": 0,
      "quantite_totale": 100,
      "isLowStock": false,
      "isOutOfStock": false
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

#### 4.2 Get Stock Detail
```http
GET /api/stock/STOCK_ID
Authorization: Bearer CLIENT_TOKEN
```

**Expected Response (200):**
```json
{
  "success": true,
  "stock": {
    "_id": "STOCK_ID",
    "sku": "IPH13PRO-BLK-256",
    "productName": "iPhone 13 Pro",
    "quantite_disponible": 100,
    "quantite_reservee": 0,
    "quantite_utilisee": 0,
    "status": "active",
    // ... full stock details
  },
  "recentMovements": [
    {
      "type": "CONFIRMED",
      "quantity": 100,
      "reason": "Stock approved by admin",
      "date": "2025-01-15T11:00:00Z"
    }
  ],
  "unresolvedAlerts": []
}
```

---

### Scenario 5: Get Available Stocks for Colis

#### 5.1 Get Available Stocks (Client)
```http
GET /api/stock/available-for-colis?storeId=STORE_ID&search=iPhone
Authorization: Bearer CLIENT_TOKEN
```

**Expected Response (200):**
```json
{
  "success": true,
  "count": 1,
  "stocks": [
    {
      "value": "STOCK_ID",
      "label": "iPhone 13 Pro - Black - 256GB (IPH13PRO-BLK-256)",
      "sku": "IPH13PRO-BLK-256",
      "productName": "iPhone 13 Pro",
      "variantName": "Black - 256GB",
      "available": 100,
      "isLow": false,
      "unitPrice": 12000
    }
  ]
}
```

---

### Scenario 6: Create Colis with Stock

#### 6.1 Create Colis Using Stock
```http
POST /api/colis/user/USER_ID
Authorization: Bearer CLIENT_TOKEN
Content-Type: application/json

{
  "nom": "Ahmed Alami",
  "tele": "0612345678",
  "ville": "VILLE_ID",
  "adresse": "123 Rue Example",
  "prix": 12000,
  "is_simple": false,
  "produits": [{
    "produit": "PRODUCT_ID",
    "usesStock": true,
    "stockId": "STOCK_ID",
    "quantityUsed": 2
  }]
}
```

**Expected Result:**
- Colis created successfully
- Stock: quantite_disponible = 98, quantite_reservee = 2
- StockMovement created (type: RESERVED)

---

### Scenario 7: Update Stock Quantity (Admin)

#### 7.1 Adjust Stock Quantity
```http
POST /api/stock/admin/STOCK_ID/adjust
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "quantityChange": 50,
  "reason": "Restock from supplier",
  "notes": "Invoice #12345, shipment verified"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Stock quantity adjusted successfully",
  "stock": {
    "_id": "STOCK_ID",
    "quantite_disponible": 148
  },
  "change": {
    "before": 98,
    "after": 148,
    "difference": 50
  }
}
```

---

### Scenario 8: Stock Movements History

#### 8.1 Get My Stock Movements (Client)
```http
GET /api/stock/my-movements?stockId=STOCK_ID&page=1&limit=50
Authorization: Bearer CLIENT_TOKEN
```

**Query Parameters:**
- `stockId` (optional): filter by specific stock
- `type` (optional): filter by movement type
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD
- `page`, `limit`

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "MOVEMENT_ID",
      "type": "IN",
      "quantity": 50,
      "quantityBefore": 98,
      "quantityAfter": 148,
      "reason": "Restock from supplier",
      "date": "2025-01-15T14:00:00Z",
      "performedBy": { "nom": "Admin", "prenom": "Name" }
    },
    {
      "_id": "MOVEMENT_ID_2",
      "type": "RESERVED",
      "quantity": -2,
      "quantityBefore": 100,
      "quantityAfter": 98,
      "reason": "Reserved for colis COL-12345",
      "colisId": { "code_suivi": "COL-12345", "statut": "Nouveau Colis" }
    }
  ]
}
```

---

### Scenario 9: Admin Views All Stocks

#### 9.1 Get All Stocks (Admin)
```http
GET /api/stock/admin/all?status=active&page=1&limit=20&clientId=CLIENT_ID
Authorization: Bearer ADMIN_TOKEN
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    // ... array of stocks from all clients
  ],
  "pagination": { /* ... */ },
  "stats": [
    { "_id": "active", "count": 45 },
    { "_id": "pending", "count": 3 },
    { "_id": "depleted", "count": 2 }
  ]
}
```

---

### Scenario 10: Low Stock Alerts

#### 10.1 Get Low Stock Alerts (Admin)
```http
GET /api/stock/admin/alerts/low-stock
Authorization: Bearer ADMIN_TOKEN
```

**Expected Response (200):**
```json
{
  "success": true,
  "summary": {
    "total": 5,
    "outOfStock": 2,
    "lowStock": 3
  },
  "outOfStock": [
    {
      "_id": "STOCK_ID",
      "sku": "TEST-002",
      "productName": "Product 2",
      "quantite_disponible": 0,
      "clientId": { "nom": "Client", "email": "..." }
    }
  ],
  "lowStock": [
    {
      "_id": "STOCK_ID_2",
      "sku": "TEST-003",
      "productName": "Product 3",
      "quantite_disponible": 5,
      "quantite_minimum": 10
    }
  ]
}
```

---

### Scenario 11: Request Restock (Client)

#### 11.1 Request Restock from Admin
```http
POST /api/stock/STOCK_ID/request-restock
Authorization: Bearer CLIENT_TOKEN
Content-Type: application/json

{
  "quantity": 50,
  "notes": "Running low, need urgent restock",
  "urgency": "urgent"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Restock request sent to administrator",
  "alert": {
    "_id": "ALERT_ID",
    "type": "RESTOCK_NEEDED",
    "severity": "warning",
    "message": "Client requests 50 units of iPhone 13 Pro (IPH13PRO-BLK-256). Running low, need urgent restock"
  }
}
```

---

### Scenario 12: Update Stock Info (Client)

#### 12.1 Update Limited Fields
```http
PUT /api/stock/STOCK_ID/info
Authorization: Bearer CLIENT_TOKEN
Content-Type: application/json

{
  "productDescription": "Updated description",
  "category": "Electronics - Mobile",
  "tags": ["phone", "apple", "premium", "5G"],
  "clientNotes": "Updated notes",
  "quantite_minimum": 15
}
```

**Note:** Cannot update quantities or status via this endpoint.

---

## 🧪 Error Testing

### Test 1: Access Denied (No Stock Feature)
```http
POST /api/stock/create
Authorization: Bearer CLIENT_WITHOUT_STOCK_TOKEN

Expected: 403 Forbidden
{
  "message": "Stock management feature not enabled for your account"
}
```

### Test 2: Insufficient Stock
```http
POST /api/colis/user/USER_ID
Body: {
  "produits": [{
    "stockId": "STOCK_ID",
    "quantityUsed": 200  // More than available
  }]
}

Expected: 500 with error message
{
  "message": "Insufficient stock for ..."
}
```

### Test 3: Duplicate SKU
```http
POST /api/stock/create
Body: {
  "sku": "EXISTING-SKU"
}

Expected: 500
{
  "message": "SKU \"EXISTING-SKU\" already exists in your inventory"
}
```

---

## 📊 Complete Test Checklist

### ✅ Client Endpoints
- [ ] Create stock (pending)
- [ ] Get my stocks (list)
- [ ] Get available stocks for colis
- [ ] Get stock detail
- [ ] Get stock movements
- [ ] Update stock info
- [ ] Request restock

### ✅ Admin Endpoints
- [ ] Get pending stocks
- [ ] Approve stock
- [ ] Reject stock
- [ ] Get all stocks
- [ ] Adjust stock quantity
- [ ] Create stock (bypass)
- [ ] Delete stock
- [ ] Get stock movements
- [ ] Get low stock alerts
- [ ] Update client access

### ✅ Integration Tests
- [ ] Create colis with stock (reserve)
- [ ] Deliver colis (deduct)
- [ ] Cancel colis (release)
- [ ] Return colis (return stock)
- [ ] Low stock alert triggers
- [ ] Out of stock alert triggers

---

## 🎯 Success Criteria

All tests should:
- ✅ Return correct HTTP status codes
- ✅ Return expected JSON structure
- ✅ Update database correctly
- ✅ Create audit trail (movements)
- ✅ Trigger alerts when needed
- ✅ Handle errors gracefully
- ✅ Validate permissions
- ✅ Use transactions (rollback on error)

---

*Happy Testing! 🚀*

