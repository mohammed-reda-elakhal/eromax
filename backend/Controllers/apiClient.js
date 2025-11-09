const asyncHandler = require('express-async-handler');
const { Store } = require('../Models/Store');
const { Colis, validateRegisterColis } = require('../Models/Colis');
const { Ville } = require('../Models/Ville');
const { Suivi_Colis } = require('../Models/Suivi_Colis');
const Notification_User = require('../Models/Notification_User');
const { NoteColis } = require('../Models/NoteColis');
const shortid = require('shortid');

// Utility: generate code_suivi with ville ref + YYYYMMDD + random suffix
const generateCodeSuivi = (refVille) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = shortid.generate().slice(0, 6).toUpperCase();
  return `${refVille}${formattedDate}-${randomPart}`;
};

// Simple test handler for Client API
const clientApiTest = asyncHandler(async (req, res) => {
  // req.apiUser is set by SecureApiAuth middleware
  return res.status(200).json({
    success: true,
    message: 'Client API is reachable and authenticated',
    data: {
      user: req.apiUser,
      nom: req.apiUser?.nom,
      now: new Date().toISOString(),
    },
  });
});

// Get single store owned by the authenticated client (each client has one store)
const getMyStore = asyncHandler(async (req, res) => {
  if (req.apiUser?.role !== 'client') {
    return res.status(403).json({ success: false, message: 'Forbidden: client role required' });
  }
  const store = await Store.findOne({ id_client: req.apiUser.id }).lean();
  if (!store) {
    return res.status(404).json({ success: false, message: 'Store not found for this client' });
  }
  return res.status(200).json({ success: true, data: store });
});

// Get all colis for the authenticated client's single store
const getMyColis = asyncHandler(async (req, res) => {
  if (req.apiUser?.role !== 'client') {
    return res.status(403).json({ success: false, message: 'Forbidden: client role required' });
  }
  const store = await Store.findOne({ id_client: req.apiUser.id }).select('_id').lean();
  if (!store) {
    return res.status(404).json({ success: false, message: 'Store not found for this client' });
  }
  const colis = await Colis.find({ store: store._id, isTrashed: { $ne: true } })
    .sort({ createdAt: -1 })
    .lean();
  return res.status(200).json({ success: true, storeId: store._id, count: colis.length, data: colis });
});

// Get all colis for a specific store that belongs to the authenticated client
const getColisByStore = asyncHandler(async (req, res) => {
  if (req.apiUser?.role !== 'client') {
    return res.status(403).json({ success: false, message: 'Forbidden: client role required' });
  }
  const { storeId } = req.params;
  const store = await Store.findOne({ _id: storeId, id_client: req.apiUser.id }).lean();
  if (!store) {
    return res.status(404).json({ success: false, message: 'Store not found for this client' });
  }
  const colis = await Colis.find({ store: storeId, isTrashed: { $ne: true } }).sort({ createdAt: -1 }).lean();
  return res.status(200).json({ success: true, store, count: colis.length, data: colis });
});

// Create a colis for the authenticated client's single store
const createMyColis = asyncHandler(async (req, res) => {
  if (req.apiUser?.role !== 'client') {
    return res.status(403).json({ success: false, message: 'Forbidden: client role required' });
  }

  // Basic body presence check
  if (!req.body) {
    return res.status(400).json({ success: false, message: "Les données de votre colis sont manquantes" });
  }

  // Validate payload using Joi schema from Colis model (ville provided as string: name or id)
  const { error } = validateRegisterColis(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details?.[0]?.message || 'Invalid payload' });
  }

  // Resolve client's store
  const store = await Store.findOne({ id_client: req.apiUser.id }).select('_id').lean();
  if (!store) {
    return res.status(404).json({ success: false, message: 'Store not found for this client' });
  }

  // Resolve ville: try by ObjectId first, else by name
  let villeDoc = null;
  try {
    villeDoc = await Ville.findById(req.body.ville);
  } catch (_) {
    // ignore invalid ObjectId errors
  }
  if (!villeDoc) {
    villeDoc = await Ville.findOne({ nom: req.body.ville });
  }
  if (!villeDoc) {
    return res.status(400).json({ success: false, message: 'Ville not found' });
  }

  // Generate a unique code_suivi based on ville ref
  let code_suivi;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 5;
  while (!isUnique && attempts < maxAttempts) {
    code_suivi = generateCodeSuivi(villeDoc.ref);
    const exists = await Colis.findOne({ code_suivi }).select('_id');
    if (!exists) isUnique = true;
    attempts++;
  }
  if (!isUnique) {
    return res.status(500).json({ success: false, message: 'Impossible de générer un code de suivi unique. Réessayez.' });
  }

  // Build colis data
  const colisData = {
    ...req.body,
    store: store._id,
    team: null,
    ville: villeDoc._id,
    code_suivi,
    expedation_type: req.body.expedation_type || 'eromax',
  };

  // Create Colis
  const colis = new Colis(colisData);
  const savedColis = await colis.save();
  await savedColis.populate('store');
  await savedColis.populate('team');
  await savedColis.populate('ville');

  // Create NoteColis
  const note = new NoteColis({ colis: savedColis._id });
  await note.save();

  // Notification for store
  try {
    const notification = new Notification_User({
      id_store: store._id,
      colisId: savedColis._id,
      title: 'Nouvelle colis',
      description: `Un nouveau colis avec le code de suivi ${savedColis.code_suivi} est en attente de Ramassage.`,
    });
    await notification.save();
  } catch (e) {
    // non-fatal
  }

  // Create suivi
  const suivi = new Suivi_Colis({
    id_colis: savedColis._id,
    code_suivi: savedColis.code_suivi,
    date_create: savedColis.createdAt,
    status_updates: [{ status: 'Nouveau Colis', date: new Date() }],
  });
  const savedSuivi = await suivi.save();

  return res.status(201).json({
    success: true,
    message: 'Colis créé avec succès, merci',
    colis: savedColis,
    suiviColis: savedSuivi,
  });
});

// Get a single colis by its code_suivi for the authenticated client's store
const getMyColisByCodeSuivi = asyncHandler(async (req, res) => {
  if (req.apiUser?.role !== 'client') {
    return res.status(403).json({ success: false, message: 'Forbidden: client role required' });
  }
  const { code_suivi } = req.params;
  if (!code_suivi) {
    return res.status(400).json({ success: false, message: 'code_suivi is required' });
  }

  // Ensure the colis belongs to the client's single store
  const store = await Store.findOne({ id_client: req.apiUser.id }).select('_id').lean();
  if (!store) {
    return res.status(404).json({ success: false, message: 'Store not found for this client' });
  }

  const colis = await Colis.findOne({ code_suivi, store: store._id })
    .populate('team')
    .populate('livreur')
    .populate('store')
    .populate('ville');

  if (!colis) {
    return res.status(404).json({ success: false, message: 'Colis not found for this client with the provided code_suivi' });
  }

  return res.status(200).json({ success: true, data: colis });
});

// Update a colis by code_suivi (only when statut === 'Nouveau Colis')
const updateMyColisByCodeSuivi = asyncHandler(async (req, res) => {
  if (req.apiUser?.role !== 'client') {
    return res.status(403).json({ success: false, message: 'Forbidden: client role required' });
  }
  const { code_suivi } = req.params;
  if (!code_suivi) {
    return res.status(400).json({ success: false, message: 'code_suivi is required' });
  }

  const store = await Store.findOne({ id_client: req.apiUser.id }).select('_id').lean();
  if (!store) {
    return res.status(404).json({ success: false, message: 'Store not found for this client' });
  }

  const colis = await Colis.findOne({ code_suivi, store: store._id });
  if (!colis) {
    return res.status(404).json({ success: false, message: 'Colis not found for this client with the provided code_suivi' });
  }

  if (colis.statut !== 'Nouveau Colis') {
    return res.status(400).json({ success: false, message: "Seuls les colis avec le statut 'Nouveau Colis' peuvent être modifiés." });
  }

  // Whitelist updatable fields
  const allowed = new Set(['nom','tele','ville','adresse','commentaire','note','prix','nature_produit','ouvrir','is_simple','is_remplace','is_fragile','produits','pret_payant','tarif_ajouter','crbt']);
  const updates = {};
  for (const [k, v] of Object.entries(req.body || {})) {
    if (allowed.has(k)) updates[k] = v;
  }

  // Handle ville resolution if provided
  if (updates.ville) {
    let villeDoc = null;
    try { villeDoc = await Ville.findById(updates.ville); } catch (_) {}
    if (!villeDoc) villeDoc = await Ville.findOne({ nom: updates.ville });
    if (!villeDoc) {
      return res.status(400).json({ success: false, message: 'Ville not found' });
    }
    updates.ville = villeDoc._id;
  }

  Object.assign(colis, updates);
  await colis.save();
  await colis.populate('team');
  await colis.populate('livreur');
  await colis.populate('store');
  await colis.populate('ville');

  return res.status(200).json({ success: true, message: 'Colis mis à jour avec succès', data: colis });
});

// Delete a colis by code_suivi (only when statut === 'Nouveau Colis')
const deleteMyColisByCodeSuivi = asyncHandler(async (req, res) => {
  if (req.apiUser?.role !== 'client') {
    return res.status(403).json({ success: false, message: 'Forbidden: client role required' });
  }
  const { code_suivi } = req.params;
  if (!code_suivi) {
    return res.status(400).json({ success: false, message: 'code_suivi is required' });
  }

  const store = await Store.findOne({ id_client: req.apiUser.id }).select('_id').lean();
  if (!store) {
    return res.status(404).json({ success: false, message: 'Store not found for this client' });
  }

  const colis = await Colis.findOne({ code_suivi, store: store._id });
  if (!colis) {
    return res.status(404).json({ success: false, message: 'Colis not found for this client with the provided code_suivi' });
  }

  if (colis.statut !== 'Nouveau Colis') {
    return res.status(400).json({ success: false, message: "Seuls les colis avec le statut 'Nouveau Colis' peuvent être supprimés." });
  }

  // Delete the colis
  await Colis.deleteOne({ _id: colis._id });

  // Best-effort cleanup of related docs (non-fatal)
  try { await Suivi_Colis.deleteOne({ id_colis: colis._id }); } catch (_) {}
  try { await Notification_User.deleteMany({ colisId: colis._id }); } catch (_) {}
  try { await NoteColis.deleteOne({ colis: colis._id }); } catch (_) {}

  return res.status(200).json({ success: true, message: 'Colis supprimé avec succès' });
});

// Get suivi (tracking history) by code_suivi for the authenticated client's store
const getMySuiviByCodeSuivi = asyncHandler(async (req, res) => {
  if (req.apiUser?.role !== 'client') {
    return res.status(403).json({ success: false, message: 'Forbidden: client role required' });
  }
  const { code_suivi } = req.params;
  if (!code_suivi) {
    return res.status(400).json({ success: false, message: 'code_suivi is required' });
  }

  // Check ownership via Colis
  const store = await Store.findOne({ id_client: req.apiUser.id }).select('_id').lean();
  if (!store) {
    return res.status(404).json({ success: false, message: 'Store not found for this client' });
  }
  const colis = await Colis.findOne({ code_suivi, store: store._id }).select('_id code_suivi');
  if (!colis) {
    return res.status(404).json({ success: false, message: 'Colis not found for this client with the provided code_suivi' });
  }

  const suivi = await Suivi_Colis.findOne({ id_colis: colis._id })
    .populate('id_colis')
    .populate('status_updates.livreur');

  if (!suivi) {
    return res.status(404).json({ success: false, message: 'Suivi non trouvé pour ce colis' });
  }

  // Optionally sort updates by date ascending for timeline
  const updates = (suivi.status_updates || []).sort((a, b) => new Date(a.date) - new Date(b.date));

  return res.status(200).json({
    success: true,
    data: {
      code_suivi: colis.code_suivi,
      id_colis: colis._id,
      updates,
    }
  });
});

module.exports = { clientApiTest, getMyStore, getMyColis, getColisByStore, createMyColis, getMyColisByCodeSuivi, updateMyColisByCodeSuivi, deleteMyColisByCodeSuivi, getMySuiviByCodeSuivi };
