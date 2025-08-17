const asyncHandler = require('express-async-handler');
const { Client } = require('../Models/Client');
const { Livreur } = require('../Models/Livreur');
const { verifySecret } = require('../utils/apiKey');

// Simple in-memory rate limiter per api.key
const rateBuckets = new Map(); // key -> { count, resetAt }

function parseAuthHeader(header) {
  if (!header) return null;
  // Expect: 'ApiKey <key>:<secret>'
  const [scheme, token] = header.split(' ');
  if (!/^ApiKey$/i.test(scheme) || !token) return null;
  const idx = token.indexOf(':');
  if (idx === -1) return null;
  const key = token.slice(0, idx);
  const secret = token.slice(idx + 1);
  return { key, secret };
}

async function findUserByApiKey(key) {
  // Try both collections
  let user = await Client.findOne({ 'api.key': key });
  if (user) return { user, role: 'client' };
  user = await Livreur.findOne({ 'api.key': key });
  if (user) return { user, role: 'livreur' };
  return null;
}

function checkScopes(userScopes = [], required = []) {
  if (!required || required.length === 0) return true;
  const set = new Set(userScopes);
  return required.every(s => set.has(s));
}

function applyRateLimit(key, userLimit) {
  const limit = userLimit?.limit ?? 600;
  const windowSec = userLimit?.windowSec ?? 60;
  const now = Date.now();
  let bucket = rateBuckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowSec * 1000 };
  }
  bucket.count += 1;
  rateBuckets.set(key, bucket);
  if (bucket.count > limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    const err = new Error('Rate limit exceeded');
    err.statusCode = 429;
    err.retryAfter = retryAfter;
    throw err;
  }
}

function apiKeyAuth(requiredScopes = []) {
  return asyncHandler(async (req, res, next) => {
    const parsed = parseAuthHeader(req.headers['authorization']);
    if (!parsed) {
      return res.status(401).json({ message: 'Missing or invalid Authorization header. Use: Authorization: ApiKey <key>:<secret>' });
    }
    const { key, secret } = parsed;

    const found = await findUserByApiKey(key);
    if (!found) {
      return res.status(401).json({ message: 'Invalid API key' });
    }
    const { user, role } = found;

    if (!user.api || user.api.status !== 'active') {
      return res.status(403).json({ message: 'API key is not active' });
    }

    const ok = await verifySecret(secret, user.api.secretHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid API secret' });
    }

    // Rate limit
    try {
      applyRateLimit(user.api.key, user.api.rateLimit);
    } catch (e) {
      if (e.statusCode === 429) {
        return res.status(429).set('Retry-After', String(e.retryAfter)).json({ message: e.message });
      }
      throw e;
    }

    // Scope check
    if (!checkScopes(user.api.scopes, requiredScopes)) {
      return res.status(403).json({ message: 'Insufficient scope' });
    }

    // Attach context
    req.apiUser = { id: user._id, role, key: user.api.key };
    req.apiScopes = user.api.scopes;

    // Best effort: update usage timestamps (non-blocking)
    user.api.lastUsedAt = new Date();
    user.api.lastUsedIp = req.ip;
    user.save().catch(() => {});

    next();
  });
}

module.exports = { apiKeyAuth };
