import React from "react";
import styled from "styled-components";

const Container = styled.div`
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial;
  line-height: 1.65;
  color: #0f172a;
  padding: 18px 22px;
  max-width: 1100px;
  margin: 0 auto;

  h1 { font-size: 28px; margin: 8px 0 14px; }
  h2 { font-size: 20px; margin: 22px 0 8px; border-left: 4px solid #3b82f6; padding-left: 8px; }
  h3 { font-size: 16px; margin: 18px 0 6px; }
  p { margin: 8px 0; }
  code { background: #0f172a; color: #e2e8f0; padding: 2px 6px; border-radius: 4px; }
  pre { background: #0f172a; color: #e2e8f0; padding: 14px; border-radius: 8px; overflow: auto; }
  .note { background: #f1f5f9; border-left: 3px solid #94a3b8; padding: 10px 12px; border-radius: 6px; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
`;

const BASE = "https://intelligent-illumination-production.up.railway.app/api/client-api";

export default function DocsClientAPI() {
  return (
    <Container>
      <h1>Client API Documentation</h1>
      <p><b>Base URL:</b> <code>{BASE}</code></p>
      <div className="note">
        <p><b>Auth:</b> All endpoints require API authentication.</p>
        <ul>
          <li>Preferred header: <code>Authorization: ApiKey &lt;KEY&gt;:&lt;SECRET&gt;</code></li>
          <li>Alternative headers: <code>X-API-Key</code> and <code>X-API-Secret</code></li>
        </ul>
        <p>The authenticated actor must be a Client. All data is scoped to the client's single store.</p>
      </div>

      <hr />

      <h2>Authentication Test</h2>
      <p><b>Method:</b> GET</p>
      <p><b>Path:</b> <code>/test</code></p>
      <p><b>Description:</b> Verifies credentials and returns basic info.</p>
      <h3>Example response (200)</h3>
      <pre>{`{
  "success": true,
  "message": "Client API is reachable and authenticated",
  "data": {
    "user": { "id": "...", "role": "client", "apiKey": "...", "nom": "..." },
    "nom": "...",
    "now": "2025-08-16T20:00:00.000Z"
  }
}`}</pre>

      <hr />

      <h2>Get My Store</h2>
      <p><b>Method:</b> GET</p>
      <p><b>Path:</b> <code>/store</code></p>
      <p><b>Description:</b> Returns the single store linked to the authenticated client.</p>
      <p><b>Errors:</b> 403 if role != client, 404 if no store found.</p>

      <hr />

      <h2>Get My Colis (all from my single store)</h2>
      <p><b>Method:</b> GET</p>
      <p><b>Path:</b> <code>/colis</code> (alias) OR <code>/store/colis</code></p>
      <p><b>Description:</b> Lists all colis belonging to the client's store.</p>
      <h3>Example response (200)</h3>
      <pre>{`{
  "success": true,
  "storeId": "...",
  "count": 42,
  "data": [ { "_id": "...", "code_suivi": "...", "statut": "Nouveau Colis", ... } ]
}`}</pre>

      <hr />

      <h2>Get Colis By Store (by ID, with ownership check)</h2>
      <p><b>Method:</b> GET</p>
      <p><b>Path:</b> <code>/stores/:storeId/colis</code></p>
      <p><b>Description:</b> Lists colis for a specific store, only if the store belongs to the authenticated client.</p>
      <p><b>Errors:</b> 403, 404 accordingly.</p>

      <hr />

      <h2>Create Colis (client)</h2>
      <p><b>Method:</b> POST</p>
      <p><b>Path:</b> <code>/store/colis</code> (preferred) OR <code>/colis</code></p>
      <p><b>Description:</b> Creates a new colis for the client's single store. Generates unique <code>code_suivi</code>, creates <code>NoteColis</code>, <code>Suivi_Colis</code> (initial status "Nouveau Colis"), and a <code>NotificationUser</code>.</p>
      <p><b>Required:</b> <code>nom</code>, <code>tele</code>, <code>ville</code> (valid name), <code>prix</code></p>
      <p><b>Optional:</b> <code>adresse</code>, <code>commentaire</code>, <code>nature_produit</code>, <code>ouvrir</code>, <code>is_simple</code>, <code>is_remplace</code>, <code>is_fragile</code>, <code>produits</code>, <code>pret_payant</code>, <code>tarif_ajouter</code>, <code>crbt</code></p>
      <p><b>Errors:</b> 400 validation, 404 if store/ville not found, 500 if cannot generate unique code.</p>
      <h3>Request example</h3>
      <pre>{`POST ${BASE}/store/colis
Authorization: ApiKey CLIENT_KEY:CLIENT_SECRET
Content-Type: application/json

{
  "nom":"Client A",
  "tele":"0612345678",
  "ville":"Casablanca",
  "prix":150,
  "adresse":"Bd Ghandi"
}`}</pre>
      <h3>Response example (201)</h3>
      <pre>{`{
  "success": true,
  "message": "Colis créé avec succès, merci",
  "colis": { "_id":"...", "code_suivi":"CAS20250816-ABC123", "store": {"_id":"..."}, "ville": {"_id":"..."}, ... },
  "suiviColis": { "_id":"...", "code_suivi":"CAS20250816-ABC123", "status_updates":[{"status":"Nouveau Colis","date":"..."}] }
}`}</pre>

      <hr />

      <h2>Get Single Colis by code_suivi (client scope)</h2>
      <p><b>Method:</b> GET</p>
      <p><b>Path:</b> <code>/colis/:code_suivi</code> (alias) OR <code>/store/colis/:code_suivi</code></p>
      <p><b>Description:</b> Fetches a single colis by <code>code_suivi</code>, restricted to the client's store.</p>
      <p><b>Errors:</b> 404 if not found or not owned by client.</p>

      <hr />

      <h2>Update Colis by code_suivi (only "Nouveau Colis")</h2>
      <p><b>Method:</b> PUT</p>
      <p><b>Path:</b> <code>/colis/:code_suivi</code> (alias) OR <code>/store/colis/:code_suivi</code></p>
      <ul>
        <li>The colis must belong to the client’s store.</li>
        <li>The colis <code>statut</code> must be exactly <code>"Nouveau Colis"</code>.</li>
      </ul>
      <p><b>Allowed fields:</b> nom, tele, ville (name or id), adresse, commentaire, note, prix, nature_produit, ouvrir, is_simple, is_remplace, is_fragile, produits, pret_payant, tarif_ajouter, crbt</p>
      <p><b>Errors:</b> 400 if status not allowed or ville invalid, 404 if colis/store not found.</p>
      <h3>Request example</h3>
      <pre>{`PUT ${BASE}/colis/ABC2025-XYZ
Authorization: ApiKey CLIENT_KEY:CLIENT_SECRET
Content-Type: application/json

{ "adresse":"Rabat Agdal", "prix":199 }`}</pre>
      <h3>Response example (200)</h3>
      <pre>{`{ "success": true, "message": "Colis mis à jour avec succès", "data": { "_id":"...", "code_suivi":"...", ... } }`}</pre>

      <hr />

      <h2>Delete Colis by code_suivi (only "Nouveau Colis")</h2>
      <p><b>Method:</b> DELETE</p>
      <p><b>Path:</b> <code>/colis/:code_suivi</code> (alias) OR <code>/store/colis/:code_suivi</code></p>
      <ul>
        <li>The colis must belong to the client’s store.</li>
        <li>The colis <code>statut</code> must be exactly <code>"Nouveau Colis"</code>.</li>
      </ul>
      <p><b>Side effects:</b> Best-effort cleanup of related <code>Suivi_Colis</code>, <code>NotificationUser</code>, and <code>NoteColis</code>.</p>
      <h3>Response example (200)</h3>
      <pre>{`{ "success": true, "message": "Colis supprimé avec succès" }`}</pre>

      <hr />

      <h2>Get Suivi (tracking) by code_suivi</h2>
      <p><b>Method:</b> GET</p>
      <p><b>Path:</b> <code>/colis/:code_suivi/suivi</code> (alias) OR <code>/store/colis/:code_suivi/suivi</code></p>
      <p><b>Description:</b> Returns the tracking history for a colis owned by the client. Updates are sorted by date ascending.</p>
      <h3>Example response (200)</h3>
      <pre>{`{
  "success": true,
  "data": {
    "code_suivi": "CAS20250816-ABC123",
    "id_colis": "66c0...",
    "updates": [
      { "status": "Nouveau Colis", "date": "2025-08-16T20:10:00.000Z", "livreur": null }
    ]
  }
}`}</pre>

      <hr />

      <h2>Common Errors</h2>
      <ul>
        <li>401: Missing or invalid API credentials.</li>
        <li>403: Role not allowed or API key not active/secret missing.</li>
        <li>404: Store or resource not found/owned by the client.</li>
        <li>400: Validation errors, missing required fields, or forbidden state transitions.</li>
        <li>500: Server error or unique code generation failure.</li>
      </ul>

      <hr />

      <h2>Notes</h2>
      <ul>
        <li>All endpoints require <code>client</code> role via security middleware <code>secureApiAuth()</code>.</li>
        <li>Ownership is enforced by filtering on the client’s single store.</li>
        <li><code>ville</code> can be provided as a city name or as a MongoDB ObjectId; it will be resolved internally.</li>
      </ul>
    </Container>
  );
}
