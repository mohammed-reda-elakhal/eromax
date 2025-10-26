# Relancer Feature - Technical Implementation Specification

## Implementation Overview

This document provides the exact technical specifications for implementing the Relancer feature in the Eromax backend.

---

## Part 1: Database Schema Update

### File: `backend/Models/Colis.js`

**Location:** After line 220, before the timestamps closing brace

**Add Field:**
```javascript
colis_relanced_from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Colis',
    default: null
}
```

**Update Validation Schema** (in `validateRegisterColis` function):
```javascript
// Add after line 309, before the return
colis_relanced_from: Joi.string().optional(),
```

**Complete Updated Schema Section:**
```javascript
const ColisSchema = new mongoose.Schema({
    // ... existing fields ...
    
    statu_final: {
        type: String,
        enum: ["Livrée", "Refusée"],
        default: null,
    },
    colis_relanced_from: {  // ← NEW FIELD
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Colis',
        default: null
    }
}, {
    timestamps: true
});
```

---

## Part 2: Controller Implementation

### File: `backend/Controllers/colisController.js`

### 2.1 Helper Functions (Add before exports)

**Location:** After line 26 (after `generateCodeSuivi`)

```javascript
/**
 * Check if a colis can be relanced based on its status
 * @param {String} status - The current status of the colis
 * @returns {Boolean} - True if relance is allowed
 */
const canRelancerColis = (status) => {
  const restrictedStatuses = [
    "Nouveau Colis",
    "attente de ramassage",
    "Ramassée",
    "Expediée",
    "Reçu",
    "Mise en Distribution",
    "Livrée"
  ];
  return !restrictedStatuses.includes(status);
};

/**
 * Relancer colis with same data (Type 1)
 * @param {Object} originalColis - The original colis to relance from
 * @param {Object} ville - The ville Object
 * @returns {Object} - The newly created colis
 */
const createRelanceSameData = async (originalColis, ville) => {
  // Validate livreur exists
  if (!originalColis.livreur) {
    throw new Error("Cannot relance: Original colis has no livreur assigned");
  }

  // Generate unique code_suivi
  let code_suivi;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 5;
  while (!isUnique && attempts < maxAttempts) {
    code_suivi = generateCodeSuivi(ville.ref);
    const existingColis = await Colis.findOne({ code_suivi });
    if (!existingColis) isUnique = true;
    attempts++;
  }
  if (!isUnique) {
    throw new Error('Impossible de générer un code_suivi unique');
  }

  // Create new colis with same data
  const newColisData = {
    nom: originalColis.nom,
    tele: originalColis.tele,
    ville: originalColis.ville,
    adresse: originalColis.adresse,
    commentaire: originalColis.commentaire,
    prix: originalColis.prix,
    nature_produit: originalColis.nature_produit,
    ouvrir: originalColis.ouvrir,
    is_remplace: originalColis.is_remplace,
    is_fragile: originalColis.is_fragile,
    store: originalColis.store,
    team: originalColis.team,
    livreur: originalColis.livreur,
    produits: originalColis.produits,
    code_suivi,
    statut: "Expediée",
    colis_relanced_from: originalColis._id
  };

  const newColis = new Colis(newColisData);
  await newColis.save();

  return newColis;
};

/**
 * Relancer colis with new data (Type 2)
 * @param {Object} originalColis - The original colis to relance from
 * @param {Object} ville - The ville Object (could be same or different)
 * @param {Object} newClientInfo - New client information
 * @param {Boolean} isSameVille - Whether using same ville
 * @param {Object} session - MongoDB session for transaction
 * @returns {Object} - The newly created colis
 */
const createRelanceNewData = async (originalColis, ville, newClientInfo, isSameVille, session) => {
  // Validate new client info
  if (!newClientInfo.nom || !newClientInfo.tele) {
    throw new Error("New client information (nom, tele) is required");
  }

  // Generate unique code_suivi for new ville
  let code_suivi;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 5;
  while (!isUnique && attempts < maxAttempts) {
    code_suivi = generateCodeSuivi(ville.ref);
    const existingColis = await Colis.findOne({ code_suivi }).session(session);
    if (!existingColis) isUnique = true;
    attempts++;
  }
  if (!isUnique) {
    throw new Error('Impossible de générer un code_suivi unique');
  }

  // Determine status and livreur based on ville
  let statut;
  let livreur;
  
  if (isSameVille) {
    // Type 2A: Same ville, can use same livreur
    statut = "Expediée";
    livreur = originalColis.livreur;
    
    // Validate livreur exists
    if (!livreur) {
      // If no original livreur, find appropriate one for ville
      const livreurs = await Livreur.find({ ville: ville.nom, active: true });
      if (livreurs.length === 0) {
        throw new Error(`No active livreur found for ville: ${ville.nom}`);
      }
      livreur = livreurs[0]._id; // Assign first available
    }
  } else {
    // Type 2B: Different ville, needs new assignment
    statut = "Nouveau Colis";
    livreur = null; // Will be assigned later by admin
  }

  // Create new colis with updated data
  const newColisData = {
    nom: newClientInfo.nom,
    tele: newClientInfo.tele,
    ville: ville._id,
    adresse: newClientInfo.adresse || originalColis.adresse,
    commentaire: newClientInfo.commentaire || originalColis.commentaire,
    prix: originalColis.prix,
    nature_produit: originalColis.nature_produit,
    ouvrir: originalColis.ouvrir,
    is_remplace: originalColis.is_remplace,
    is_fragile: originalColis.is_fragile,
    store: originalColis.store,
    team: originalColis.team,
    livreur,
    produits: originalColis.produits,
    code_suivi,
    statut,
    colis_relanced_from: originalColis._id
  };

  const newColis = new Colis(newColisData);
  await newColis.save({ session });

  return { newColis, statut };
};
```

---

### 2.2 Main Controller Method

**Location:** Add after the last export (before `module.exports` closing)

```javascript
/**
 * -------------------------------------------------------------------
 * @desc     Relancer a colis (create new colis from existing failed one)
 * @route    POST /api/colis/relancer/:colisId
 * @method   POST
 * @access   private (Admin, Team, Store, Client)
 * @params   colisId - ID of the colis to relance from
 * @body     { type, new_client_info?, new_ville_id?, same_ville_confirmed? }
 * -------------------------------------------------------------------
 **/
module.exports.relancerColis = asyncHandler(async (req, res) => {
  const { colisId } = req.params;
  const { type, new_client_info, new_ville_id, same_ville_confirmed } = req.body;

  // Validate request body
  if (!type || !['same_data', 'new_data'].includes(type)) {
    return res.status(400).json({ 
      message: "Type is required and must be 'same_data' or 'new_data'" 
    });
  }

  // Validate new_data requirements
  if (type === 'new_data') {
    if (!new_client_info || !new_client_info.nom || !new_client_info.tele) {
      return res.status(400).json({ 
        message: "New client information (nom, tele) is required for new_data type" 
      });
    }
  }

  const session = await mongoose.startSession();
  try {
    const result = await session.withTransaction(async () => {
      // 1. Find original colis
      const originalColis = await Colis.findById(colisId).session(session)
        .populate('ville')
        .populate('store')
        .populate('livreur')
        .populate('team');

      if (!originalColis) {
        throw new Error("Colis not found");
      }

      // 2. Validate colis can be relanced
      if (!canRelancerColis(originalColis.statut)) {
        throw new Error(`Cannot relance colis with status: ${originalColis.statut}`);
      }

      // 3. Create new colis based on type
      let newColis, relanceType;
      const ville = await Ville.findById(originalColis.ville._id).session(session);

      if (type === 'same_data') {
        // Type 1: Same data relance
        newColis = await createRelanceSameData(originalColis, ville);
        await newColis.populate('livreur').populate('ville').populate('store');
        relanceType = 'same_data';
      } else {
        // Type 2: New data relance
        let targetVille = ville;
        let isSameVille = true;

        if (new_ville_id && new_ville_id !== originalColis.ville._id.toString()) {
          // Different ville requested
          targetVille = await Ville.findById(new_ville_id).session(session);
          if (!targetVille) {
            throw new Error("Target ville not found");
          }
          isSameVille = false;
        }

        const { newColis: createdColis, statut } = await createRelanceNewData(
          originalColis, 
          targetVille, 
          new_client_info, 
          isSameVille,
          session
        );
        newColis = createdColis;
        relanceType = isSameVille ? 'new_same_ville' : 'new_different_ville';
      }

      // 4. Create Suivi_Colis
      const suivi_colis = new Suivi_Colis({
        id_colis: newColis._id,
        code_suivi: newColis.code_suivi,
        date_create: newColis.createdAt,
        status_updates: [
          { status: newColis.statut, date: new Date(), livreur: newColis.livreur || null }
        ]
      });
      await suivi_colis.save({ session });

      // 5. Create NoteColis
      const newNoteColis = new NoteColis({ colis: newColis._id });
      await newNoteColis.save({ session });

      // 6. Create Notification (if applicable)
      if (newColis.store && newColis.statut === "Nouveau Colis") {
        try {
          const notification = new Notification_User({
            id_store: newColis.store._id,
            colisId: newColis._id,
            title: 'Nouvelle colis (Relancée)',
            description: `Un colis relancé avec le code de suivi ${newColis.code_suivi} a été créé.`,
          });
          await notification.save({ session });
        } catch (error) {
          console.log("Notification creation failed:", error);
          // Non-fatal, continue
        }
      }

      // 7. Create Notification for livreur (if assigned)
      if (newColis.livreur) {
        try {
          const notification = new Notification({
            id_livreur: newColis.livreur._id || newColis.livreur,
            colisId: newColis._id,
            title: 'Nouveau Colis Relancé',
            description: `Un colis relancé avec le code de suivi ${newColis.code_suivi} a été assigné pour vous.`,
          });
          await notification.save({ session });
        } catch (error) {
          console.log("Livreur notification creation failed:", error);
          // Non-fatal, continue
        }
      }

      return {
        message: "Relancer avec succès",
        original_colis: {
          id: originalColis._id,
          code_suivi: originalColis.code_suivi,
          statut: originalColis.statut
        },
        new_colis: newColis,
        relance_type: relanceType
      };
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error in relancerColis:', error);
    return res.status(500).json({ 
      message: error.message || 'Erreur interne du serveur lors du relance' 
    });
  } finally {
    await session.endSession();
  }
});
```

---

## Part 3: Route Definition

### File: `backend/routes/colisRoute.js`

**Location:** Add after line 38 (after copie route)

```javascript
router.route('/relancer/:colisId')
        .post(verifyTokenStoreTeamAdminClient, colisController.relancerColis)
```

**Complete section should look like:**
```javascript
router.route('/copie/:id_colis')
        .post(colisController.CloneColisCtrl)

router.route('/relancer/:colisId')
        .post(verifyTokenStoreTeamAdminClient, colisController.relancerColis)

// Place this above any /:id route to avoid collision
router.get('/ramassee', verifyToken, colisController.getRamasseeColisCtrl);
```

---

## Part 4: Required Imports Check

### In `colisController.js`

Ensure these imports exist:
```javascript
const { Colis } = require("../Models/Colis");
const { Livreur } = require("../Models/Livreur");
const { Ville } = require("../Models/Ville");
const { Suivi_Colis } = require("../Models/Suivi_Colis");
const { NoteColis } = require("../Models/NoteColis");
const { Notification_User } = require("../Models/Notification_User");
const { Notification } = require("../Models/Notification");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
```

---

## Part 5: Testing Checklist

### Test Case 1: Type 1 (Same Data)
```javascript
POST /api/colis/relancer/:colisId
Body: {
  "type": "same_data"
}
Expected: New colis with status "Expediée", same livreur
```

### Test Case 2: Type 2A (Same Ville)
```javascript
POST /api/colis/relancer/:colisId
Body: {
  "type": "new_data",
  "new_client_info": {
    "nom": "New Name",
    "tele": "0612345678",
    "adresse": "New Address"
  },
  "same_ville_confirmed": true
}
Expected: New colis with status "Expediée", same ville, updated info
```

### Test Case 3: Type 2B (Different Ville)
```javascript
POST /api/colis/relancer/:colisId
Body: {
  "type": "new_data",
  "new_client_info": {
    "nom": "New Name",
    "tele": "0612345678",
    "adresse": "New Address"
  },
  "new_ville_id": "differentVilleId"
}
Expected: New colis with status "Nouveau Colis", different ville
```

### Test Case 4: Error Handling
```javascript
// Already delivered colis
Status: "Livrée"
Expected: 400 error "Cannot relance delivered colis"

// Invalid status
Status: "Expediée"
Expected: 400 error "Cannot relance colis with status: Expediee"

// Missing required fields
No "nom" or "tele"
Expected: 400 error "New client information is required"
```

---

## Summary

This implementation:
1. ✅ Adds database field to track origin
2. ✅ Creates reusable helper functions
3. ✅ Implements all three relancer types
4. ✅ Uses transactions for data integrity
5. ✅ Creates all required tracking records
6. ✅ Sends notifications appropriately
7. ✅ Handles errors comprehensively
8. ✅ Follows existing code patterns

**Next Steps:** Implement code, run tests, verify all scenarios work correctly.

