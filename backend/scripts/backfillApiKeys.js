/*
 One-time migration: Backfill keyId and apiKey for Clients and Livreurs.
 - keyId: 128-bit random (hex)
 - apiKey: role-prefixed (cli_ or liv_) + ~24-char URL-safe random
 - status: set to 'inactive' when assigning keys (do not touch apiSecretHash)

 Features:
 - Batching with bulkWrite (default 500)
 - Dry-run support (--dry-run)
 - Filter by collection: --collection=clients|livreurs|both (default both)
 - Progress logging and collision retry on duplicate key

 Usage:
   NODE_ENV=production node backend/scripts/backfillApiKeys.js --batch=500 --collection=both [--dry-run]
 Preconditions: Ensure indexes exist (partial unique on keyId; unique sparse on apiKey) or run with care.
*/

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const crypto = require('crypto');

const { Client } = require('../Models/Client');
const { Livreur } = require('../Models/Livreur');

function genKeyIdHex() {
  return crypto.randomBytes(16).toString('hex'); // 128-bit hex
}

function genApiKey(prefix) {
  // 24-char URL-safe base64 (no padding), safe for copy/paste
  const raw = crypto.randomBytes(18); // 24 base64 chars
  return `${prefix}${raw.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;
}

async function ensureUnique(docModel, fieldName, generator) {
  // Generate value until no collision exists in the collection
  for (;;) {
    const candidate = generator();
    const exists = await docModel.exists({ [fieldName]: candidate });
    if (!exists) return candidate;
  }
}

async function backfillCollection(Model, rolePrefix, label, opts) {
  const { batchSize = 500, dryRun = false } = opts;
  const filter = { $or: [{ keyId: { $exists: false } }, { apiKey: { $exists: false } }] };
  const projection = { _id: 1, keyId: 1, apiKey: 1, status: 1 };
  const cursor = Model.find(filter, projection).lean().cursor();

  let processed = 0;
  let updated = 0;
  let batch = [];

  async function flush() {
    if (!batch.length) return;
    if (dryRun) {
      updated += batch.length;
      batch = [];
      return;
    }
    try {
      // Use native collection bulkWrite to bypass Mongoose immutability on updates
      const res = await Model.collection.bulkWrite(batch, { ordered: false });
      updated += (res.modifiedCount || 0) + (res.upsertedCount || 0);
      batch = [];
    } catch (err) {
      if (err && err.code === 11000) {
        console.warn(`[${label}] Duplicate key encountered in bulkWrite, retrying conflicting ops one-by-one...`);
        // Retry each op individually with regeneration on conflict
        for (const op of batch) {
          const id = op.updateOne.filter._id;
          try {
            // Use native update to ensure immutable paths can be set during migration
            await Model.collection.updateOne({ _id: id }, op.updateOne.update, { upsert: false });
            updated += 1;
          } catch (e) {
            if (e && e.code === 11000) {
              // Regenerate and retry once
              const doc = await Model.findById(id, projection).lean();
              if (!doc) continue;
              const set = {};
              if (!doc.keyId) set.keyId = await ensureUnique(Model, 'keyId', genKeyIdHex);
              if (!doc.apiKey) set.apiKey = await ensureUnique(Model, 'apiKey', () => genApiKey(rolePrefix));
              if (Object.keys(set).length) {
                try {
                  await Model.collection.updateOne({ _id: id }, { $set: set, $setOnInsert: {} });
                  updated += 1;
                } catch (e2) {
                  console.error(`[${label}] Retry failed for _id=${id}:`, e2.message);
                }
              }
            } else {
              console.error(`[${label}] Update failed for _id=${id}:`, e.message);
            }
          }
        }
        batch = [];
      } else {
        console.error(`[${label}] bulkWrite error:`, err.message);
        batch = [];
      }
    }
  }

  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    processed += 1;
    const toSet = {};
    if (!doc.keyId) toSet.keyId = await ensureUnique(Model, 'keyId', genKeyIdHex);
    if (!doc.apiKey) toSet.apiKey = await ensureUnique(Model, 'apiKey', () => genApiKey(rolePrefix));
    // Ensure status is set to 'inactive' when issuing apiKey OR when patching missing keyId while apiKey exists
    const missingKeyIdHasApiKey = !doc.keyId && !!doc.apiKey;
    const needsInactive = (doc.status !== 'inactive') && (missingKeyIdHasApiKey || !!toSet.apiKey);
    if (needsInactive) toSet.status = 'inactive';

    if (Object.keys(toSet).length) {
      batch.push({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: toSet },
          upsert: false,
        }
      });
    }

    if (batch.length >= batchSize) {
      await flush();
      console.log(`[${label}] Progress: processed=${processed}, updated=${updated}`);
    }
  }

  await flush();
  console.log(`[${label}] Done: processed=${processed}, updated=${updated}`);
}

async function countMissingKeyIdWithApiKey(Model, label) {
  const count = await Model.countDocuments({
    apiKey: { $exists: true, $ne: null },
    keyId: { $exists: false }
  });
  console.log(`[${label}] Pre-check: apiKey exists but keyId missing -> count=${count}`);
  return count;
}

(async () => {
  try {
    // Prefer MONGO_URI; fallback to MONGODB_URI for compatibility
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
      console.error("MONGO_URI (or MONGODB_URI) is not defined in environment.");
      process.exit(1);
    }
    // Respect production index policy but allow script to run regardless
    if (process.env.NODE_ENV === 'production') {
      mongoose.set('autoIndex', false);
    }
    await mongoose.connect(uri);

    // Lowercase + trim email normalization safeguard during migration
    // (Optional) Uncomment if you want to normalize emails here too
    // await Model.updateMany({ email: { $exists: true } }, [
    //   { $set: { email: { $toLower: { $trim: { input: '$email' } } } } }
    // ]);

    // CLI args
    const args = process.argv.slice(2);
    const getArg = (name, def) => {
      const m = args.find(a => a.startsWith(`--${name}=`));
      if (!m) return def;
      const v = m.split('=')[1];
      return v ?? def;
    };
    const dryRun = args.includes('--dry-run');
    const batch = parseInt(getArg('batch', '500'), 10) || 500;
    const collection = (getArg('collection', 'both') || 'both').toLowerCase();

    const opts = { batchSize: batch, dryRun };

    if (collection === 'clients' || collection === 'both') {
      await countMissingKeyIdWithApiKey(Client, 'Client');
      await backfillCollection(Client, 'cli_', 'Client', opts);
    }
    if (collection === 'livreurs' || collection === 'both') {
      await countMissingKeyIdWithApiKey(Livreur, 'Livreur');
      await backfillCollection(Livreur, 'liv_', 'Livreur', opts);
    }

    await mongoose.disconnect();
    console.log('Backfill complete.');
    process.exit(0);
  } catch (e) {
    console.error('Backfill failed:', e);
    process.exit(1);
  }
})();
