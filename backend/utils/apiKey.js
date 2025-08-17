const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Generate a base62 string from random bytes
function randomBase62(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += chars[bytes[i] % chars.length];
  }
  return out;
}

function now() {
  return new Date();
}

// role: 'client' | 'livreur'
function generateApiKey(role) {
  const prefix = role === 'livreur' ? 'liv' : 'cli';
  const short = randomBase62(8);
  const body = randomBase62(24);
  // Public key, safe to store and show anytime
  const key = `${prefix}_${short}_${body}`;
  // Secret returned only once; hash is stored
  const secretPlain = crypto.randomBytes(32).toString('base64url');
  return { key, secretPlain };
}

async function hashSecret(secretPlain) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(secretPlain, salt);
}

async function verifySecret(secretPlain, secretHash) {
  return bcrypt.compare(secretPlain, secretHash);
}

function defaultScopes(role) {
  if (role === 'livreur') {
    return ['colis:read_assigned', 'colis:update_status_valid'];
  }
  // client default
  return ['colis:read', 'colis:create', 'colis:update_own', 'colis:delete_if_new', 'colis:track'];
}

function defaultRateLimit() {
  return { limit: 600, windowSec: 60 }; // 600 req / minute default
}

module.exports = {
  randomBase62,
  generateApiKey,
  hashSecret,
  verifySecret,
  defaultScopes,
  defaultRateLimit,
  now,
};
