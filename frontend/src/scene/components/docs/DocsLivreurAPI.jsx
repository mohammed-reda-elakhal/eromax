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
  h2 { font-size: 20px; margin: 22px 0 8px; border-left: 4px solid #10b981; padding-left: 8px; }
  h3 { font-size: 16px; margin: 18px 0 6px; }
  p { margin: 8px 0; }
  code { background: #0f172a; color: #e2e8f0; padding: 2px 6px; border-radius: 4px; }
  pre { background: #0f172a; color: #e2e8f0; padding: 14px; border-radius: 8px; overflow: auto; }
  .note { background: #f1f5f9; border-left: 3px solid #94a3b8; padding: 10px 12px; border-radius: 6px; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
`;

const BASE = "https://intelligent-illumination-production.up.railway.app/api/livreur-api";

export default function DocsLivreurAPI() {
  return (
    <Container>
      <h1>Livreur API Documentation</h1>
      <p><b>Base URL:</b> <code>/api/livreur-api</code></p>
      <div className="note">
        <p><b>Auth:</b> All endpoints require API authentication with role <code>livreur</code>.</p>
        <ul>
          <li>Header: <code>Authorization: ApiKey &lt;LIVREUR_KEY&gt;:&lt;LIVREUR_SECRET&gt;</code></li>
          <li>Content-Type: <code>application/json</code> for requests with a body</li>
        </ul>
      </div>

      <hr />

      <h2>Valid statuses</h2>
      <p>All status changes are validated against the centralized allowlist in the backend.</p>
      <pre>{`Allowed values:
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
- Manque de stock`}</pre>
      <p className="note">Spelling and accents must match exactly. Invalid values return 400.</p>

      <hr />

      <h2>GET /colis</h2>
      <p><b>Method:</b> GET</p>
      <p><b>Path:</b> <code>/colis</code></p>
      <p><b>Description:</b> Fetch colis assigned to the authenticated livreur. Results are sorted by last tracking update date (desc), then by <code>updatedAt</code>, then <code>createdAt</code>.</p>
      <p><b>Query:</b> <code>statut</code> (optional). Single value or comma-separated list. All must be valid.</p>
      <h3>Examples</h3>
      <pre>{`GET ${BASE}/colis
Authorization: ApiKey LIVREUR_KEY:LIVREUR_SECRET

# Filter by multiple statuses
GET ${BASE}/colis?statut=Livrée,Refusée,Programmée
Authorization: ApiKey LIVREUR_KEY:LIVREUR_SECRET`}</pre>

      <hr />

      <h2>GET /colis/:code_suivi</h2>
      <p><b>Method:</b> GET</p>
      <p><b>Path:</b> <code>/colis/:code_suivi</code></p>
      <p><b>Description:</b> Fetch a single colis owned by the authenticated livreur. Response excludes <code>store</code> and includes tracking history sorted chronologically plus the latest update.</p>
      <h3>Example</h3>
      <pre>{`GET ${BASE}/colis/ABC2025-XYZ
Authorization: ApiKey LIVREUR_KEY:LIVREUR_SECRET`}</pre>

      <hr />

      <h2>PATCH /colis/:code_suivi/status</h2>
      <p><b>Method:</b> PATCH</p>
      <p><b>Path:</b> <code>/colis/:code_suivi/status</code></p>
      <p><b>Description:</b> Update status of a colis you own. Transactional: writes to <code>Colis</code> and appends a tracking update in <code>Suivi_Colis</code>.</p>

      <h3>Body</h3>
      <pre>{`{
  "new_status": "<one of allowed statuses>",
  "comment": "optional unless status requires it",
  "note": "optional",
  "date_programme": "ISO string (required if new_status = Programmée)",
  "date_reporte": "ISO string (required if new_status = Reporté)"
}`}</pre>

      <h3>Per-status conditions</h3>
      <ul>
        <li><b>Livrée</b>: comment optional; triggers notifications and facture updates</li>
        <li><b>Refusée</b>: comment required; saved to <code>colis.comment_refuse</code></li>
        <li><b>Annulée</b>: comment required; saved to <code>colis.comment_annule</code></li>
        <li><b>Programmée</b>: <code>date_programme</code> required; optional note</li>
        <li><b>Reporté</b>: <code>date_reporte</code> required; optional note</li>
        <li><b>Remplacée</b>: set automatically when a replacement colis is delivered</li>
      </ul>

      <h3>Examples</h3>
      <pre>{`PATCH ${BASE}/colis/KTR20250801-FKYXIR/status
Authorization: ApiKey LIVREUR_KEY:LIVREUR_SECRET
Content-Type: application/json

{"new_status":"Livrée","comment":"delivered to client"}

PATCH ${BASE}/colis/ABC2025-XYZ/status
Authorization: ApiKey LIVREUR_KEY:LIVREUR_SECRET
Content-Type: application/json

{"new_status":"Programmée","date_programme":"2025-08-20T10:00:00.000Z","note":"client wants morning"}

PATCH ${BASE}/colis/ABC2025-XYZ/status
Authorization: ApiKey LIVREUR_KEY:LIVREUR_SECRET
Content-Type: application/json

{"new_status":"Reporté","date_reporte":"2025-08-21T00:00:00.000Z","note":"client absent"}`}</pre>

      <h3>Responses</h3>
      <ul>
        <li>200 on success, returns updated <code>colis</code> (without <code>store</code>).</li>
        <li>400 on invalid <code>new_status</code> or missing required date/comment.</li>
        <li>403 if caller is not role <code>livreur</code>.</li>
        <li>404 if colis not found or not owned by the livreur.</li>
      </ul>

      <hr />

      <h2>Notes</h2>
      <ul>
        <li>Status validation and sorting are implemented in <code>backend/Controllers/apiLivreur.js</code>.</li>
        <li>Latest tracking timestamps drive ordering in list endpoint.</li>
      </ul>
    </Container>
  );
}
