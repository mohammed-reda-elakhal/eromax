# Client API Documentation

Base URL: `/api/client-api`

All endpoints require API authentication.

- Preferred header: `Authorization: ApiKey <KEY>:<SECRET>`
- Alternative headers: `X-API-Key: <KEY>` and `X-API-Secret: <SECRET>`

The authenticated actor must be a Client. All data is scoped to the client's single store.

---

## Authentication Test
- Method: GET
- Path: `/test`
- Description: Verifies credentials and returns basic info.
- Response 200 Example:
```json
{
  "success": true,
  "message": "Client API is reachable and authenticated",
  "data": {
    "user": { "id": "...", "role": "client", "apiKey": "...", "nom": "..." },
    "nom": "...",
    "now": "2025-08-16T20:00:00.000Z"
  }
}
```

---

## Get My Store
- Method: GET
- Path: `/store`
- Description: Returns the single store linked to the authenticated client.
- Errors: 403 if role != client, 404 if no store found.

---

## Get My Colis (all from my single store)
- Method: GET
- Path: `/colis` (alias) OR `/store/colis`
- Description: Lists all colis belonging to the client's store.
- Response 200 Example:
```json
{
  "success": true,
  "storeId": "...",
  "count": 42,
  "data": [ { "_id": "...", "code_suivi": "...", "statut": "Nouveau Colis", ... } ]
}
```

---

## Get Colis By Store (by ID, with ownership check)
- Method: GET
- Path: `/stores/:storeId/colis`
- Description: Lists colis for a specific store, only if the store belongs to the authenticated client.
- Errors: 403, 404 accordingly.

---

## Create Colis (client)
- Method: POST
- Path: `/store/colis` (preferred) OR `/colis`
- Description: Creates a new colis for the client's single store. Generates unique `code_suivi`, creates `NoteColis`, `Suivi_Colis` (initial status "Nouveau Colis"), and a `NotificationUser`.
- Required fields (validated): `nom`, `tele`, `ville` (name correct from eromax data list ), `prix`.
- Optional: `adresse`, `commentaire`, `nature_produit`, `ouvrir`, `is_simple`, `is_remplace`, `is_fragile`, `produits`, `pret_payant`, `tarif_ajouter`, `crbt`, etc.
- Errors: 400 validation, 404 if store/ville not found, 500 if cannot generate unique code.
- Request Example:
```json
{ "nom":"Client A", "tele":"0612345678", "ville":"Casablanca", "prix":150, "adresse":"Bd Ghandi" }
```
- Response 201 Example:
```json
{
  "success": true,
  "message": "Colis créé avec succès, merci",
  "colis": { "_id":"...", "code_suivi":"CAS20250816-ABC123", "store": {"_id":"..."}, "ville": {"_id":"..."}, ... },
  "suiviColis": { "_id":"...", "code_suivi":"CAS20250816-ABC123", "status_updates":[{"status":"Nouveau Colis","date":"..."}] }
}
```

---

## Get Single Colis by code_suivi (client scope)
- Method: GET
- Path: `/colis/:code_suivi` (alias) OR `/store/colis/:code_suivi`
- Description: Fetches a single colis by `code_suivi`, restricted to the client's store.
- Errors: 404 if not found or not owned by client.

---

## Update Colis by code_suivi (only "Nouveau Colis")
- Method: PUT
- Path: `/colis/:code_suivi` (alias) OR `/store/colis/:code_suivi`
- Preconditions:
  - The colis must belong to the client’s store.
  - The colis `statut` must be exactly `"Nouveau Colis"`.
- Allowed fields: `nom`, `tele`, `ville` (name or id), `adresse`, `commentaire`, `note`, `prix`, `nature_produit`, `ouvrir`, `is_simple`, `is_remplace`, `is_fragile`, `produits`, `pret_payant`, `tarif_ajouter`, `crbt`.
- Errors: 400 if status not allowed or ville invalid, 404 if colis/store not found.
- Request Example:
```json
{ "nom":"Client B", "tele":"0611122233", "ville":"Rabat", "prix":180 }
```
- Response 200 Example:
```json
{ "success": true, "message": "Colis mis à jour avec succès", "data": { "_id":"...", "code_suivi":"...", ... } }
```

---

## Delete Colis by code_suivi (only "Nouveau Colis")
- Method: DELETE
- Path: `/colis/:code_suivi` (alias) OR `/store/colis/:code_suivi`
- Preconditions:
  - The colis must belong to the client’s store.
  - The colis `statut` must be exactly `"Nouveau Colis"`.
- Side effects: Best-effort cleanup of related `Suivi_Colis`, `NotificationUser`, and `NoteColis`.
- Response 200 Example:
```json
{ "success": true, "message": "Colis supprimé avec succès" }
```

---

## Get Suivi (tracking) by code_suivi
- Method: GET
- Path: `/colis/:code_suivi/suivi` (alias) OR `/store/colis/:code_suivi/suivi`
- Description: Returns the tracking history for a colis owned by the client. Updates are sorted by date ascending.
- Response 200 Example:
```json
{
  "success": true,
  "data": {
    "code_suivi": "CAS20250816-ABC123",
    "id_colis": "66c0...",
    "updates": [
      { "status": "Nouveau Colis", "date": "2025-08-16T20:10:00.000Z", "livreur": null }
    ]
  }
}
```

---

## Common Errors
- 401: Missing or invalid API credentials.
- 403: Role not allowed or API key not active/secret missing.
- 404: Store or resource not found/owned by the client.
- 400: Validation errors, missing required fields, or forbidden state transitions.
- 500: Server error or unique code generation failure.

---

## Notes
- All endpoints require `client` role via security middleware `secureApiAuth()`.
- Ownership is enforced by filtering on the client’s single store.
- `ville` can be provided as a city name or as a MongoDB ObjectId; it will be resolved internally.
