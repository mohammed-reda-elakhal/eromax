# Relancer API - Complete Documentation

## Overview
The **Relancer API** allows creating a new colis based on an existing one that could not be delivered. This feature is designed to handle scenarios where a colis delivery fails and needs to be relaunched with either the same information or new information.

---

## Business Logic Analysis

### Current Colis System Understanding

**Colis States:**
- **Active States (Can be relanced):**
  - "Annulée", "Refusée", "En Retour", "Remplacée", "Fermée", "Boite vocale"
  - "Pas de reponse jour 1/2/3", "Pas reponse + sms / + whatsap"
  - "En voyage", "Injoignable", "Hors-zone", "Intéressé"
  - "Numéro Incorrect", "Reporté", "Confirmé Par Livreur", "Endomagé"
  - "Préparer pour Roteur", "Prét Pour Expédition", "Manque de stock"

- **Cannot Relance States:**
  - "Nouveau Colis"
  - "attente de ramassage"
  - "Ramassée"
  - "Expediée"
  - "Reçu"
  - "Livrée"
  - "Mise en Distribution"

**Key Relationships:**
- Colis → Store (for which client)
- Colis → Team (created by which team member)
- Colis → Ville (destination city)
- Colis → Livreur (delivery person)
- Colis → Suivi_Colis (tracking history)

---

## Requirements Breakdown

### Type 1: Relancer avec les mêmes informations (Same Client, Same Data)

**Purpose:** Retry delivery with identical client information when the original failed.

**Conditions:**
- Original colis must have status that allows relancing (not in restricted states)
- Original colis must not be "Livrée" (already delivered)
- Original colis must have a livreur assigned

**Process:**
1. Validate original colis exists and is relancable
2. Create new colis with:
   - Same: nom, tele, adresse, prix, nature_produit, commentaire
   - Same: ville (from original colis)
   - Same: store (from original colis)
   - Same: livreur (from original colis)
   - Same: team (from original colis)
   - Same: is_fragile, is_remplace, ouvrir, produits
   - New: unique code_suivi (generated for new ville)
   - New: statut = "Expediée"
   - New: reference to original colis (colis_relanced_from)
3. Create new Suivi_Colis record with "Expediée" status
4. Create NoteColis for new colis
5. Create notification for store (if applicable)
6. Return new colis data

**Use Cases:**
- Client wants to retry delivery after temporary issue (wrong address format, etc.)
- Package was refused but client wants to try again
- Delivery failed due to external factors

---

### Type 2: Relancer avec nouvelles informations client (New Client Information)

**Purpose:** Update client details and/or delivery address when original information was incorrect.

**Sub-type 2A: Same Ville**
- Client information needs update (phone, address format, etc.)
- City remains the same

**Process:**
1. Validate original colis and ville
2. Get new client information from request body
3. Validate new ville is same as original (by ID or name)
4. Create new colis with:
   - NEW: nom, tele, adresse, commentaire (from request)
   - SAME: ville (confirmed same)
   - SAME: livreur (appropriate for same ville)
   - SAME: store, team, prix, nature_produit, produits
   - SAME: is_fragile, is_remplace, ouvrir
   - NEW: unique code_suivi
   - NEW: statut = "Expediée"
   - NEW: reference to original colis
5. Create Suivi_Colis, NoteColis, Notifications
6. Return new colis

**Sub-type 2B: Different Ville**
- Client wants to change delivery city entirely
- Different livreur required (assigned later)

**Process:**
1. Validate original colis
2. Get new client information AND new ville
3. Find/fetch new ville
4. Create new colis with:
   - NEW: nom, tele, adresse, commentaire
   - NEW: ville (different from original)
   - NULL: livreur (will be assigned later by admin)
   - SAME: store, team
   - SAME: prix, nature_produit, produits, is_fragile, is_remplace, ouvrir
   - NEW: unique code_suivi (generated for NEW ville)
   - NEW: statut = "Nouveau Colis"
   - NEW: reference to original colis
5. Create Suivi_Colis, NoteColis, Notifications
6. Return new colis (will need livreur assignment later)

**Use Cases:**
- Client moved to new address
- Wrong phone number needs correction
- Wrong city selected initially
- Client wants delivery to different location

---

## Database Schema Updates

### Colis Model - New Field

```javascript
colis_relanced_from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Colis',
    default: null
}
```

**Purpose:** Track which colis this relance originates from.

**Benefits:**
- Track history of relancées
- Audit trail
- Prevent infinite loops (optional: limit relance depth)
- Analytics on most relanced colis

---

## API Endpoint Specification

### Endpoint Details

**Route:** `POST /api/colis/relancer/:colisId`

**Authentication:** `verifyTokenStoreTeamAdminClient` or `verifyTokenAndAdmin`

**Request Body:**
```json
{
  "type": "same_data" | "new_data",
  "new_client_info": {
    "nom": "string",        // Required if type === "new_data"
    "tele": "string",       // Required if type === "new_data"
    "adresse": "string",    // Required if type === "new_data"
    "commentaire": "string" // Optional
  },
  "new_ville_id": "ObjectId",  // Required if type === "new_data" AND different ville
  "same_ville_confirmed": true  // Required if type === "new_data", to confirm same ville
}
```

**Response Structure:**
```json
{
  "message": "Relancer avec succès",
  "original_colis": {
    "id": "ObjectId",
    "code_suivi": "string",
    "statut": "string"
  },
  "new_colis": {
    "id": "ObjectId",
    "code_suivi": "string",
    "statut": "string",
    "nom": "string",
    "tele": "string",
    "adresse": "string",
    "ville": {...},
    "livreur": {...},
    "colis_relanced_from": "ObjectId"
  },
  "relance_type": "same_data" | "new_same_ville" | "new_different_ville"
}
```

---

## Implementation Tasks

### Task List

1. **Update Colis Model** ✓
   - Add `colis_relanced_from` field
   - Update Joi validation schema
   - Add enum to allowed status tracking

2. **Create Controller Method**
   - File: `backend/Controllers/colisController.js`
   - Method: `relancerColis`
   - Logic implementation:
     - Validation of original colis
     - Check relance eligibility (status validation)
     - Handle Type 1: Same data relance
     - Handle Type 2: New data relance
     - Ville comparison logic
     - Code generation
     - Suivi_Colis creation
     - Notification creation

3. **Add Route**
   - File: `backend/routes/colisRoute.js`
   - Add: `router.post('/relancer/:colisId', verifyTokenAndAdmin, colisController.relancerColis)`

4. **Error Handling**
   - Colis not found (404)
   - Colis already delivered (400)
   - Invalid status for relance (400)
   - Ville not found (404)
   - Missing required fields (400)
   - Duplicate code_suivi handling (retry logic)

5. **Edge Cases**
   - Multiple relances from same colis
   - Relance of already relanced colis
   - Cancelled orginal colis fees/billing
   - Historical tracking

---

## Technical Implementation Details

### Validation Rules

**Original Colis Validation:**
- Must exist
- Status must NOT be in restricted list
- Cannot be "Livrée"
- Should have livreur for same_data type

**New Data Validation:**
- nom: required, string, min 2 chars
- tele: required, valid phone format
- adresse: optional but recommended
- ville_id: required for different ville
- same_ville_confirmed: boolean to confirm same ville

### Code Generation

Uses existing `generateCodeSuivi(ville.ref)` pattern with retry logic:
```javascript
let code_suivi;
let isUnique = false;
let attempts = 0;
const maxAttempts = 5;
while (!isUnique && attempts < maxAttempts) {
  code_suivi = generateCodeSuivi(ville.ref);
  const existing = await Colis.findOne({ code_suivi });
  if (!existing) isUnique = true;
  attempts++;
}
```

### Transaction Handling

Use MongoDB transactions to ensure atomicity:
- Create new Colis
- Create Suivi_Colis
- Create NoteColis
- Create Notifications
All within single transaction

---

## Status Flow Diagram

### Type 1 Flow
```
Original Colis [Failed Status] → New Colis ["Expediée"]
                                      ↓
                              Assigned to Same Livreur
```

### Type 2A Flow
```
Original Colis [Failed Status] → New Colis ["Expediée"]
  [Wrong Info]                           [Updated Info]
                                      ↓
                              Same Ville, Same Livreur
```

### Type 2B Flow
```
Original Colis [Failed Status] → New Colis ["Nouveau Colis"]
  [Wrong Ville]                          [New Ville]
                                      ↓
                              Needs Livreur Assignment
```

---

## Testing Scenarios

### Test Case 1: Same Data Relance
- Original colis status: "Refusée"
- Expected: New colis with "Expediée" status
- Same livreur, same ville, same data

### Test Case 2: New Info, Same Ville
- Update phone number
- Expected: "Expediée", same ville/livreur

### Test Case 3: New Ville
- Change city entirely
- Expected: "Nouveau Colis", no livreur, new code

### Test Case 4: Error - Already Delivered
- Original colis: "Livrée"
- Expected: 400 error, "Cannot relance delivered colis"

### Test Case 5: Error - Restricted Status
- Original colis: "Expediée"
- Expected: 400 error, "Cannot relance in this status"

---

## Future Enhancements

1. **Relance Limits:** Prevent more than N relances per original colis
2. **Relance Reason Tracking:** Store reason code (wrong address, phone issue, etc.)
3. **Auto-Assignment:** Auto-assign livreur for Type 2B if rules exist
4. **Analytics Dashboard:** Show relance rates, common reasons
5. **Billing Integration:** Handle fees for original failed delivery
6. **Client Notifications:** Notify client when colis is relanced

---

## Security Considerations

- Verify user has permission to access store/colis
- Validate all input data
- Prevent SQL injection (Mongoose handles)
- Rate limiting on API endpoint
- Audit logging for relance actions

---

## Summary

This feature enables efficient handling of failed deliveries by:
- Providing flexible relance options (same or new data)
- Maintaining data integrity with reference tracking
- Following existing code patterns and transactions
- Supporting both automated (same data) and manual (new data) processes

**Key Benefits:**
- Reduce manual data re-entry
- Maintain delivery history
- Support different failure scenarios
- Improve customer service flexibility

