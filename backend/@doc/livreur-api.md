# Eromax Livreur API

This document describes the endpoints available for livreurs (delivery users). It focuses on:
- Valid statuses and rules
- How to fetch colis (with optional status filtering and sorting)
- How to update a colis status (with per-status required fields)

Base path for all endpoints below: `/api/livreur-api`
All endpoints require `secureApiAuth()` with role `livreur`.

## Authentication
- Header: `Authorization: ApiKey <LIVREUR_KEY>:<LIVREUR_SECRET>`
- Content-Type: `application/json` (for requests with body)

---

## Valid statuses
Controller source: `backend/Controllers/apiLivreur.js` (`VALID_LIVREUR_STATUSES`).

Allowed values (strings):
- Expediée
- Reçu
- Mise en Distribution
- Livrée
- Annulée
- Programmée
- Refusée
- En Retour
- Remplacée
- Fermée
- Boite vocale
- Pas de reponse jour 1
- Pas de reponse jour 2
- Pas de reponse jour 3
- Pas reponse + sms / + whatsap
- En voyage
- Injoignable
- Hors-zone
- Intéressé
- Numéro Incorrect
- Reporté
- Confirmé Par Livreur
- Endomagé
- Préparer pour Roteur
- Prét Pour Expédition
- Manque de stock

Notes:
- Spelling and accents must match exactly.
- Status validation uses this centralized list; any other value returns 400.

---

## GET /colis
Fetch colis assigned to the authenticated livreur.

Query parameters:
- `statut` (optional): filter by one or multiple statuses.
  - Single status: `?statut=Livrée`
  - Multiple: `?statut=Livrée,Refusée,Programmée`
  - All provided values are validated against `VALID_LIVREUR_STATUSES`.
  - If any invalid status is provided → 400 with the allowed list.

Sorting:
- The API sorts results by the last tracking update date (desc).
- Fallbacks if no tracking update:
  1) `updatedAt`
  2) `createdAt`

Response shape (simplified):
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "_id": "...",
      "code_suivi": "...",
      "statut": "...",
      "...": "...",
      "suivi": {
        "code_suivi": "...",
        "updates": [
          { "status": "...", "date": "...", "livreur": "...", "note": "...", "date_programme": "...", "date_reporte": "..." }
        ],
        "latest_update": { "status": "...", "date": "...", "livreur": "..." }
      }
    }
  ]
}
```

Examples:
```bash
# All colis (sorted by last update desc)
curl -X GET "http://localhost:5000/api/livreur-api/colis" \
  -H "Authorization: ApiKey LIVREUR_KEY:LIVREUR_SECRET"

# Filter by multiple statuses
curl -X GET "http://localhost:5000/api/livreur-api/colis?statut=Livrée,Refusée,Programmée" \
  -H "Authorization: ApiKey LIVREUR_KEY:LIVREUR_SECRET"
```

---

## GET /colis/:code_suivi
Fetch a single colis (must belong to the authenticated livreur). The response excludes `store` and includes `suivi.updates` sorted chronologically plus `latest_update`.

Example:
```bash
curl -X GET "http://localhost:5000/api/livreur-api/colis/ABC2025-XYZ" \
  -H "Authorization: ApiKey LIVREUR_KEY:LIVREUR_SECRET"
```

---

## PATCH /colis/:code_suivi/status
Update the status of a colis owned by the authenticated livreur. The operation is transactional and also appends a tracking update (`Suivi_Colis`). Some statuses have required fields.

Request body:
- `new_status` (string, required): must be in `VALID_LIVREUR_STATUSES`.
- `comment` (string): see per-status rules below.
- `note` (string, optional)
- `date_programme` (ISO string): required if `new_status = Programmée`.
- `date_reporte` (ISO string): required if `new_status = Reporté`.

Per-status conditions:
- Livrée
  - Comment: optional (recommended to describe delivery context)
  - Side effects: notification to store; facture updates
- Refusée
  - Comment: required → saved to `colis.comment_refuse`
  - Side effects: notification to store; facture updates; may generate retour factures
- Annulée
  - Comment: required → saved to `colis.comment_annule`
  - Side effects: may generate retour factures
- Programmée
  - `date_programme`: required (ISO date), saved on colis and in suivi update
  - Optional: `note`
- Reporté
  - `date_reporte`: required (ISO date), saved on colis and in suivi update
  - Optional: `note`
- Remplacée
  - Set automatically on the replaced colis when current colis becomes Livrée

Common behaviors:
- `suivi.status_updates` gets a new entry `{ status, date, livreur, ... }`.
- Latest update timestamps drive sorting in list endpoint.
- The update response omits `store`.

Examples:
```bash
# Livrée (comment optional)
curl -X PATCH "http://localhost:5000/api/livreur-api/colis/KTR20250801-FKYXIR/status" \
  -H "Authorization: ApiKey LIVREUR_KEY:LIVREUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"new_status":"Livrée","comment":"delivered to client"}'

# Refusée (comment required)
curl -X PATCH "http://localhost:5000/api/livreur-api/colis/ABC2025-XYZ/status" \
  -H "Authorization: ApiKey LIVREUR_KEY:LIVREUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"new_status":"Refusée","comment":"client refused at door"}'

# Annulée (comment required)
curl -X PATCH "http://localhost:5000/api/livreur-api/colis/ABC2025-XYZ/status" \
  -H "Authorization: ApiKey LIVREUR_KEY:LIVREUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"new_status":"Annulée","comment":"canceled by store"}'

# Programmée (date_programme required)
curl -X PATCH "http://localhost:5000/api/livreur-api/colis/ABC2025-XYZ/status" \
  -H "Authorization: ApiKey LIVREUR_KEY:LIVREUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"new_status":"Programmée","date_programme":"2025-08-20T10:00:00.000Z","note":"client wants morning"}'

# Reporté (date_reporte required)
curl -X PATCH "http://localhost:5000/api/livreur-api/colis/ABC2025-XYZ/status" \
  -H "Authorization: ApiKey LIVREUR_KEY:LIVREUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"new_status":"Reporté","date_reporte":"2025-08-21T00:00:00.000Z","note":"client absent"}'
```

Responses:
- 200 on success, body includes updated `colis` (without `store`).
- 400 on:
  - Missing or invalid `new_status`
  - `Programmée` without `date_programme`
  - `Reporté` without `date_reporte`
  - Invalid status filter in GET `colis?statut=...`
- 403 if caller is not role `livreur`.
- 404 if the colis is not found or not owned by the authenticated livreur.

---

## Implementation notes
- Controller: `backend/Controllers/apiLivreur.js`
  - List: `getColisByLivreur()`
    - Validates `statut` query and applies `$in` filter
    - Enriches with `suivi` and sorts by last update descending
  - Single: `getMyColisByCodeSuivi()`
  - Update: `updateMyColisStatus()`
    - Validates status against `VALID_LIVREUR_STATUSES`
    - Enforces ownership (uses `req.apiUser.id`)
    - Writes to `Colis` and `Suivi_Colis`
    - Triggers notifications/invoices per status

If you want the backend to strictly enforce the documentation rules (comment required for Refusée/Annulée), ensure the controller validates these fields before proceeding (return 400 if missing). Currently, date requirements for Programmée/Reporté are enforced; comment requirement can be toggled based on product decision.
