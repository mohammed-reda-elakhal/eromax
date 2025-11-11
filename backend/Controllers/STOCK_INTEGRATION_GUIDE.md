# Stock Integration Guide for Colis Controller

## Overview
This guide explains how to integrate stock management into the existing `colisController.js` without breaking current functionality.

## Files Created
- `stockHelper.js` - Contains all stock-related helper functions
- `stockController.js` - Main stock management controller
- `stockAccessMiddleware.js` - Access control middleware

## Integration Points in colisController.js

### 1. Import Stock Helpers (Add at top of file)

```javascript
const {
    reserveStockForColis,
    deductStockForDeliveredColis,
    releaseStockForCancelledColis,
    returnStockFromColis,
    validateStockAvailability
} = require("./stockHelper");
```

### 2. Modify CreateColisCtrl (around line 37-148)

#### Add after line 50 (inside withTransaction, after store/team extraction):

```javascript
// ============ STOCK MANAGEMENT INTEGRATION ============
// Check if colis uses stock
const usesStock = req.body.is_simple === false && req.body.produits.some(p => p.usesStock);

if (usesStock) {
    // Validate stock availability first
    const stockValidation = await validateStockAvailability(req.body.produits);
    
    if (!stockValidation.isValid) {
        throw new Error(`Stock validation failed: ${JSON.stringify(stockValidation.errors)}`);
    }
}
```

#### Add after colis is saved (around line 92, after saveColis creation):

```javascript
// Reserve stock if using stock management
if (usesStock) {
    const updatedProduits = await reserveStockForColis(
        saveColis.produits,
        saveColis._id,
        saveColis.code_suivi,
        req.user.id,
        req.user.role,
        session
    );
    
    // Update colis with stock info
    saveColis.produits = updatedProduits;
    await saveColis.save({ session });
}
```

### 3. Modify UpdateColisStatutCtrl (Status Change Handler)

#### Find where status is updated, add stock logic:

```javascript
// Get old status
const oldStatus = colis.statut;
const newStatus = req.body.statut;

// Update status
colis.statut = newStatus;
await colis.save({ session });

// ============ STOCK MANAGEMENT ON STATUS CHANGE ============
// Handle stock based on status transition
if (newStatus === "Livrée" && oldStatus !== "Livrée") {
    // Colis delivered - deduct stock
    await deductStockForDeliveredColis(colis, req.user.id, req.user.role, session);
}

if ((newStatus === "Annulée" || newStatus === "Refusée") && 
    (oldStatus !== "Annulée" && oldStatus !== "Refusée")) {
    // Colis cancelled/refused - release stock
    await releaseStockForCancelledColis(colis, req.user.id, req.user.role, session);
}

if (newStatus === "En Retour" && oldStatus !== "En Retour") {
    // Colis returned - return stock to available
    await returnStockFromColis(colis, req.user.id, req.user.role, session);
}
```

### 4. Modify CreateMultipleColisCtrl (Bulk Creation)

#### Similar integration as CreateColisCtrl:

```javascript
// Before insertMany, process each colis
for (const colisInput of req.body) {
    if (colisInput.is_simple === false && colisInput.produits.some(p => p.usesStock)) {
        // Validate stock
        const stockValidation = await validateStockAvailability(colisInput.produits);
        if (!stockValidation.isValid) {
            return res.status(400).json({
                message: "Stock validation failed",
                errors: stockValidation.errors
            });
        }
    }
}

// After insertMany
for (const colis of insertedColis) {
    if (colis.is_simple === false && colis.produits.some(p => p.usesStock)) {
        const updatedProduits = await reserveStockForColis(
            colis.produits,
            colis._id,
            colis.code_suivi,
            req.user.id,
            req.user.role,
            session
        );
        colis.produits = updatedProduits;
        await colis.save({ session });
    }
}
```

## Testing the Integration

### Test Case 1: Create Colis with Stock
```javascript
POST /api/colis/user/:id_user
{
    "nom": "Test Client",
    "tele": "0612345678",
    "ville": "VILLE_ID",
    "prix": 500,
    "is_simple": false,  // Important!
    "produits": [{
        "produit": "PRODUCT_ID",
        "usesStock": true,
        "stockId": "STOCK_ID",
        "quantityUsed": 2
    }]
}
```

**Expected:**
- Stock reserved
- quantite_disponible decreased
- quantite_reservee increased
- StockMovement created (type: RESERVED)

### Test Case 2: Deliver Colis
```javascript
PUT /api/colis/:id/statut
{
    "statut": "Livrée"
}
```

**Expected:**
- quantite_reservee decreased
- quantite_utilisee increased
- StockMovement created (type: OUT)
- produit.stockDeducted = true

### Test Case 3: Cancel Colis
```javascript
PUT /api/colis/:id/statut
{
    "statut": "Annulée"
}
```

**Expected:**
- quantite_disponible increased
- quantite_reservee decreased
- StockMovement created (type: RELEASED)
- produit.stockReserved = false

### Test Case 4: Return Colis
```javascript
PUT /api/colis/:id/statut
{
    "statut": "En Retour"
}
```

**Expected:**
- quantite_disponible increased
- quantite_utilisee decreased
- StockMovement created (type: RETURN)
- produit.stockDeducted = false

## Error Handling

All stock operations are wrapped in MongoDB transactions. If any stock operation fails:
1. Entire transaction rolls back
2. No colis is created/updated
3. Error message returned to user
4. Stock quantities remain unchanged

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Stock not found" | Invalid stockId | Verify stock exists and is not deleted |
| "Stock is not active" | Stock status != 'active' | Stock must be approved by admin first |
| "Insufficient stock" | quantite_disponible < quantityUsed | Reduce quantity or wait for restock |
| "Stock validation failed" | Multiple validation errors | Check error details for each product |

## Performance Considerations

1. **Stock checks add ~50-100ms per product** to colis creation
2. **Use MongoDB sessions** to ensure transactional integrity
3. **Stock alerts** are created asynchronously
4. **Consider caching** active stock list for high-volume clients

## Safety Features

✅ **Transactional:** All-or-nothing operations  
✅ **Validated:** Stock checked before reservation  
✅ **Logged:** Every movement tracked  
✅ **Alerted:** Low/out-of-stock notifications  
✅ **Idempotent:** Repeated calls don't duplicate reservations  

## Migration Notes

- Existing colis (before stock integration) have `is_simple = true` by default
- They won't trigger stock operations
- Only new colis with `is_simple = false` and `usesStock = true` use stock
- **No breaking changes to existing functionality**

## Next Steps

1. Test in development environment
2. Enable stock management for pilot clients
3. Monitor stock operations logs
4. Gather feedback
5. Roll out gradually

---

**Ready to integrate?** Follow the steps above or contact the development team for assistance.

