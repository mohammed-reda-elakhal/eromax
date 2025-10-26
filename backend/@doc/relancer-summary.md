# Relancer Feature - Executive Summary

## What is Relancer?

**Relancer** is a feature that allows creating a new colis based on an existing one that could not be delivered. It provides flexible options to handle failed deliveries and update client information.

---

## Quick Overview

| Feature Type | When to Use | Result |
|-------------|-------------|--------|
| **Type 1: Same Data** | Original info is correct, retry delivery | New colis with status "Expediée", same livreur |
| **Type 2A: New Info, Same Ville** | Update client details, same city | New colis with status "Expediée", updated info |
| **Type 2B: Different Ville** | Client wants different city | New colis with status "Nouveau Colis", no livreur |

---

## Allowed vs Restricted Statuses

### ✅ CAN Relance (Statuses)
- "Refusée", "Annulée", "En Retour"
- "Boite vocale", "Injoignable"
- "Pas de reponse jour 1/2/3"
- "Numéro Incorrect", "Hors-zone"
- All other failed/failed-to-contact statuses

### ❌ CANNOT Relance (Statuses)
- "Nouveau Colis"
- "attente de ramassage"
- "Ramassée"
- "Expediée"
- "Reçu"
- "Mise en Distribution"
- "Livrée"

---

## Implementation Files to Modify

### 1. `backend/Models/Colis.js`
- **Add:** `colis_relanced_from` field (ObjectId reference)
- **Update:** Joi validation schema

### 2. `backend/Controllers/colisController.js`
- **Add:** Helper functions for validation and creation
- **Add:** Main `relancerColis` controller method
- **Add:** Utility functions for each relancer type

### 3. `backend/routes/colisRoute.js`
- **Add:** Route `POST /api/colis/relancer/:colisId`

---

## API Endpoint

### Request
```
POST /api/colis/relancer/:colisId
Authorization: Bearer <token>
Content-Type: application/json

For Type 1 (Same Data):
{
  "type": "same_data"
}

For Type 2A (Same Ville):
{
  "type": "new_data",
  "new_client_info": {
    "nom": "Mohamed Ali",
    "tele": "0612345678",
    "adresse": "123 New Address",
    "commentaire": "Updated delivery address"
  },
  "same_ville_confirmed": true
}

For Type 2B (Different Ville):
{
  "type": "new_data",
  "new_client_info": {
    "nom": "Mohamed Ali",
    "tele": "0612345678",
    "adresse": "123 New Address"
  },
  "new_ville_id": "64a1b2c3d4e5f6g7h8i9j0k1"
}
```

### Response (Success)
```json
{
  "message": "Relancer avec succès",
  "original_colis": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "code_suivi": "CM123456",
    "statut": "Refusée"
  },
  "new_colis": {
    "id": "64b2c3d4e5f6g7h8i9j0k2",
    "code_suivi": "CM789012",
    "statut": "Expediée",
    "nom": "Mohamed Ali",
    "tele": "0612345678",
    "ville": {...},
    "livreur": {...}
  },
  "relance_type": "new_same_ville"
}
```

---

## Implementation Checklist

### Database Layer
- [ ] Add `colis_relanced_from` field to Colis schema
- [ ] Update Joi validation to include new field
- [ ] Ensure field is optional in validation

### Business Logic Layer
- [ ] Implement `canRelancerColis()` validation helper
- [ ] Implement `createRelanceSameData()` helper
- [ ] Implement `createRelanceNewData()` helper
- [ ] Implement main `relancerColis()` controller
- [ ] Handle all three relancer types
- [ ] Create proper error messages

### Integration Layer
- [ ] Add route with authentication middleware
- [ ] Connect controller to route
- [ ] Test route accessibility

### Data Creation Flow
- [ ] Create new Colis record
- [ ] Generate unique code_suivi
- [ ] Create Suivi_Colis tracking record
- [ ] Create NoteColis record
- [ ] Create notifications (store, livreur if applicable)
- [ ] Handle MongoDB transactions

### Error Handling
- [ ] Colis not found → 404
- [ ] Invalid status → 400
- [ ] Missing required fields → 400
- [ ] Ville not found → 404
- [ ] Duplicate code_suivi → Retry logic
- [ ] Transaction failures → Rollback and error

---

## Business Rules

### Rule 1: Status Validation
```
IF original_colis.statut IN ["Livrée", "Expediée", "Reçu", ...]
THEN return error 400
ELSE allow relance
```

### Rule 2: Livreur Assignment
```
IF type === "same_data" OR same_ville
THEN assign existing livreur
ELSE set livreur = null (needs admin assignment)
```

### Rule 3: Status Assignment
```
IF same_data OR same_ville
THEN status = "Expediée"
ELSE IF different_ville
THEN status = "Nouveau Colis"
```

### Rule 4: Ville Handling
```
IF new_ville_id provided AND != original_ville_id
THEN fetch new ville, generate new code_suivi
ELSE use original ville
```

---

## Key Technical Decisions

### 1. Why MongoDB Transactions?
- **Reason:** Ensures atomicity when creating multiple related documents
- **Benefits:** Data consistency, rollback on failure

### 2. Why Reference Field?
- **Reason:** Track origin while maintaining independent documents
- **Benefits:** Can relance multiple times, clear audit trail

### 3. Why Three Helper Functions?
- **Reason:** Keep code DRY, separate concerns
- **Benefits:** Easier testing, clearer logic flow

### 4. Why Let Cod Suivi Be Regenerated?
- **Reason:** Must be unique, old code might conflict
- **Benefits:** Clean separation, no confusion between old/new

---

## Testing Priority

### Must Test ✅
1. Type 1: Same data → Expediee status
2. Type 2A: Same ville → Expediee, updated info
3. Type 2B: Different ville → Nouveau Colis
4. Error: Livree status → 400 error
5. Error: Invalid status → 400 error
6. Error: Missing nom/tele → 400 error

### Should Test ⚠️
1. Multiple relances from same colis
2. Relance of already relanced colis
3. Notification creation
4. Suivi_Colis tracking

### Nice to Test 💡
1. Performance with large datasets
2. Concurrent relancer requests
3. Edge cases with special characters in names

---

## Files Created

1. ✅ `backend/@doc/relancer-api.md` - Complete feature documentation
2. ✅ `backend/@doc/relancer-technical-spec.md` - Code specifications
3. ✅ `backend/@doc/relancer-summary.md` - This document

## Next Steps

After review:
1. Implement database schema changes
2. Implement controller logic
3. Add route
4. Test thoroughly
5. Deploy to staging
6. Monitor for issues

---

## Questions for Stakeholders

Before implementation:
1. Should there be a limit on how many times a colis can be relanced?
2. Should original colis be updated with any relance marker?
3. Should billing/fees be adjusted for original failed delivery?
4. Should clients receive automatic notifications when colis is relanced?
5. Should livreurs see relance reason or history?

---

## Expected Impact

### Positive
- ✅ Faster handling of failed deliveries
- ✅ Better customer satisfaction (no manual re-entry)
- ✅ Complete audit trail
- ✅ Flexible options for different scenarios

### Considerations
- ⚠️ May need user training on new feature
- ⚠️ Ensure proper permissions (who can relance)
- ⚠️ Monitor for abuse (excessive relances)

---

**Status:** Documentation Complete - Ready for Implementation Review 🚀

