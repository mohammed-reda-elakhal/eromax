const asyncHandler = require('express-async-handler');
const { Client } = require('../Models/Client');
const { Livreur } = require('../Models/Livreur');
const { verifySecret } = require('../utils/apiKey');

function parseAuthHeader(header) {
  if (!header) return null;
  // Expected: Authorization: ApiKey <key>:<secret>
  const [scheme, token] = header.split(' ');
  if (!/^ApiKey$/i.test(scheme) || !token) return null;
  const idx = token.indexOf(':');
  if (idx === -1) return null;
  const key = token.slice(0, idx);
  const secret = token.slice(idx + 1);
  return { key, secret };
}

function parseCustomHeaders(req) {
  // Alternative: X-API-Key and X-API-Secret
  const key = req.headers['x-api-key'];
  const secret = req.headers['x-api-secret'];
  if (key && secret) return { key, secret };
  return null;
}

async function findActorByApiKey(key) {
  // Try Client first
  let actor = await Client.findOne({ apiKey: key }).select('+apiSecretHash status lastUsedAt');
  if (actor) return { actor, role: 'client' };
  // Then Livreur
  actor = await Livreur.findOne({ apiKey: key }).select('+apiSecretHash status lastUsedAt');
  if (actor) return { actor, role: 'livreur' };
  return null;
}

// Custom middleware verifying API header and secret
function secureApiAuth(requiredStatus = 'active') {
  return asyncHandler(async (req, res, next) => {
    const parsed = parseAuthHeader(req.headers['authorization']) || parseCustomHeaders(req);
    if (!parsed) {
      return res.status(401).json({ 
        success: false, 
        message: 'Missing credentials. Send Authorization: ApiKey <key>:<secret> OR X-API-Key and X-API-Secret headers.' 
      });
    }
    const { key, secret } = parsed;

    const found = await findActorByApiKey(key);
    if (!found) {
      return res.status(401).json({ success: false, message: 'Invalid API key' });
    }
    const { actor, role } = found;

    if (requiredStatus && actor.status !== requiredStatus) {
      return res.status(403).json({ success: false, message: `API key is not ${requiredStatus}` });
    }

    if (!actor.apiSecretHash) {
      return res.status(403).json({ success: false, message: 'API secret not set' });
    }

    const ok = await verifySecret(secret, actor.apiSecretHash);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid API secret' });
    }

    // Attach context
    req.apiUser = { id: actor._id, role, apiKey: actor.apiKey, nom: actor.nom };

    // Best-effort usage timestamp
    actor.lastUsedAt = new Date();
    actor.save().catch(() => {});

    next();
  });
}

module.exports = { secureApiAuth };
