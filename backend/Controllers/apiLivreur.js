const asyncHandler = require('express-async-handler');
const { Colis } = require('../Models/Colis');
const { Livreur } = require('../Models/Livreur');
const { Suivi_Colis } = require('../Models/Suivi_Colis');
const NotificationUser = require('../Models/Notification_User');
const mongoose = require('mongoose');
const { handleFactureRamasser } = require('./factureHelper');
const { createOrUpdateFacture, createOrUpdateFactureLivreur } = require('./factureController');
const { generateFacturesRetour } = require('./factureRetourController');

// Global list of valid statuses for livreur operations
const VALID_LIVREUR_STATUSES = [
  "Expediée",
  "Reçu",
  "Mise en Distribution",
  "Livrée",
  "Annulée",
  "Programmée",
  "Refusée",
  "En Retour",
  "Remplacée",
  "Fermée",
  "Boite vocale",
  "Pas de reponse jour 1",
  "Pas de reponse jour 2",
  "Pas de reponse jour 3",
  "Pas reponse + sms / + whatsap",
  "En voyage",
  "Injoignable",
  "Hors-zone",
  "Intéressé",
  "Numéro Incorrect",
  "Reporté",
  "Confirmé Par Livreur",
  "Endomagé",
  "Préparer pour Roteur",
  "Prét Pour Expédition",
  "Manque de stock",
  "Intéressé"
];

// Simple test handler for Livreur API
const livreurApiTest = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Livreur API is reachable and authenticated',
    data: {
      user: req.apiUser,
      nom: req.apiUser?.nom,
      now: new Date().toISOString(),
    },
  });
});

module.exports = { livreurApiTest };

// Get list of colis assigned to the authenticated livreur with their suivi
// Access: authenticated livreur only (ID derived from secureApiAuth)
const getColisByLivreur = asyncHandler(async (req, res) => {
  // Security: only the logged-in livreur can access their own colis
  if (!req.apiUser || req.apiUser.role !== 'livreur') {
    return res.status(403).json({ success: false, message: 'Forbidden: livreur role required' });
  }
  const livreurId = String(req.apiUser.id);

  // Ensure livreur exists/active (optional but helpful)
  const livreur = await Livreur.findById(livreurId).select('_id active');
  if (!livreur) {
    return res.status(404).json({ success: false, message: 'Livreur not found' });
  }

  // Optional filter by statut: accept single value or comma-separated list via ?statut=
  let filter = { livreur: livreurId };
  if (req.query?.statut) {
    const raw = String(req.query.statut);
    const requested = raw.split(',').map(s => s.trim()).filter(Boolean);
    // Validate requested statuses
    const invalid = requested.filter(s => !VALID_LIVREUR_STATUSES.includes(s));
    if (invalid.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid statut value(s)',
        invalid,
        allowed: VALID_LIVREUR_STATUSES
      });
    }
    filter.statut = requested.length === 1 ? requested[0] : { $in: requested };
  }

  // Fetch colis assigned to this livreur (with optional statut filter)
  const colisList = await Colis.find(filter)
    .select('-store')
    .populate('ville')
    .populate('team')
    .lean();

  if (!colisList.length) {
    return res.status(200).json({ success: true, count: 0, data: [] });
  }

  // Fetch suivis in bulk and map by id_colis
  const ids = colisList.map(c => c._id);
  const suivis = await Suivi_Colis.find({ id_colis: { $in: ids } })
    .populate({
      path: 'status_updates.livreur',
      select: 'nom prenom username ville adresse tele email profile active role type villes createdAt updatedAt status',
    })
    .lean();
  const suiviByColis = new Map(suivis.map(s => [String(s.id_colis), s]));

  // Attach suivi to each colis and compute latest status
  const data = colisList.map(c => {
    const suivi = suiviByColis.get(String(c._id));
    const updates = (suivi?.status_updates || []).sort((a, b) => new Date(a.date) - new Date(b.date));
    const latest_update = updates.length ? updates[updates.length - 1] : null;
    return {
      ...c,
      suivi: {
        code_suivi: suivi?.code_suivi || c.code_suivi,
        updates,
        latest_update,
      }
    };
  });

  // Sort by latest update date desc (fallback to updatedAt/createdAt)
  const getSortDate = (item) => {
    if (item?.suivi?.latest_update?.date) return new Date(item.suivi.latest_update.date);
    if (item?.updatedAt) return new Date(item.updatedAt);
    if (item?.createdAt) return new Date(item.createdAt);
    return new Date(0);
  };
  data.sort((a, b) => getSortDate(b) - getSortDate(a));

  return res.status(200).json({ success: true, count: data.length, data });
});

module.exports.getColisByLivreur = getColisByLivreur;

// Get a single colis by code_suivi for the authenticated livreur
const getMyColisByCodeSuivi = asyncHandler(async (req, res) => {
  if (!req.apiUser || req.apiUser.role !== 'livreur') {
    return res.status(403).json({ success: false, message: 'Forbidden: livreur role required' });
  }
  const { code_suivi } = req.params;
  if (!code_suivi) {
    return res.status(400).json({ success: false, message: 'code_suivi is required' });
  }

  const livreurId = String(req.apiUser.id);

  const colis = await Colis.findOne({ code_suivi, livreur: livreurId })
    .select('-store')
    .populate('ville')
    .populate('team');

  if (!colis) {
    return res.status(404).json({ success: false, message: 'Colis not found or not assigned to this livreur' });
  }

  const suivi = await Suivi_Colis.findOne({ id_colis: colis._id })
    .populate({
      path: 'status_updates.livreur',
      select: 'nom prenom username ville adresse tele email profile active role type villes createdAt updatedAt status',
    });

  const updates = (suivi?.status_updates || []).sort((a, b) => new Date(a.date) - new Date(b.date));
  const latest_update = updates.length ? updates[updates.length - 1] : null;

  return res.status(200).json({
    success: true,
    data: {
      colis,
      suivi: {
        code_suivi: suivi?.code_suivi || colis.code_suivi,
        updates,
        latest_update,
      }
    }
  });
});

module.exports.getMyColisByCodeSuivi = getMyColisByCodeSuivi;

// Export statuses for reuse by other controllers if needed
module.exports.VALID_LIVREUR_STATUSES = VALID_LIVREUR_STATUSES;

// Update status of a colis by code_suivi for the authenticated livreur
const updateMyColisStatus = asyncHandler(async (req, res) => {
  if (!req.apiUser || req.apiUser.role !== 'livreur') {
    return res.status(403).json({ success: false, message: 'Forbidden: livreur role required' });
  }
  const { code_suivi } = req.params;
  const { new_status, comment, date_programme, date_reporte, note } = req.body || {};

  if (!code_suivi) {
    return res.status(400).json({ success: false, message: 'code_suivi is required' });
  }
  if (!new_status) {
    return res.status(400).json({ success: false, message: 'new_status is required' });
  }
  if (!VALID_LIVREUR_STATUSES.includes(new_status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value', allowed: VALID_LIVREUR_STATUSES });
  }

  // For Programmée and Reporté ensure date present
  if (new_status === 'Programmée' && !date_programme) {
    return res.status(400).json({ success: false, message: 'date_programme is required for Programmée' });
  }
  if (new_status === 'Reporté' && !date_reporte) {
    return res.status(400).json({ success: false, message: 'date_reporte is required for Reporté' });
  }

  const session = await mongoose.startSession();
  let colis, suivi_colis;

  try {
    const livreurId = String(req.apiUser.id);

    await session.withTransaction(async () => {
      // Find colis assigned to this livreur
      colis = await Colis.findOne({ code_suivi, livreur: livreurId })
        .populate('ville')
        .session(session);
      if (!colis) {
        throw new Error('Colis not found or not assigned to this livreur');
      }

      // Comments for specific statuses
      if (new_status === 'Annulée' && comment) {
        colis.comment_annule = comment;
      } else if (new_status === 'Refusée' && comment) {
        colis.comment_refuse = comment;
      }

      // Dates for specific statuses
      if (new_status === 'Livrée' || new_status === 'Refusée' || new_status === 'Annulée') {
        colis.date_livraisant = new Date();
      }
      if (new_status === 'Programmée') {
        colis.date_programme = new Date(date_programme);
      } else if (new_status === 'Reporté') {
        colis.date_reporte = new Date(date_reporte);
      }

      // Optional note
      if (note) {
        colis.note = note;
      }

      // Update statut
      colis.statut = new_status;
      await colis.save({ session });

      // If this colis replaced another
      if (new_status === 'Livrée' && colis.replacedColis) {
        const replacedColis = await Colis.findById(colis.replacedColis).session(session);
        if (replacedColis) {
          replacedColis.statut = 'Remplacée';
          await replacedColis.save({ session });

          let suiviReplacedColis = await Suivi_Colis.findOne({ id_colis: replacedColis._id }).session(session);
          if (!suiviReplacedColis) {
            suiviReplacedColis = new Suivi_Colis({
              id_colis: replacedColis._id,
              code_suivi: replacedColis.code_suivi,
              status_updates: [{ status: 'Remplacée', date: new Date() }],
            });
          } else {
            suiviReplacedColis.status_updates.push({ status: 'Remplacée', date: new Date() });
          }
          await suiviReplacedColis.save({ session });
        }
      }

      // Create notifications for some statuses
      if (['Ramassée', 'Livrée', 'Refusée'].includes(new_status)) {
        let notificationTitle = '';
        let notificationDescription = '';
        switch (new_status) {
          case 'Ramassée':
            notificationTitle = 'Colis Ramassée';
            notificationDescription = `Votre colis avec le code de suivi ${colis.code_suivi} a été ramassée avec succès.`;
            break;
          case 'Livrée':
            notificationTitle = 'Colis Livrée';
            notificationDescription = `Votre colis avec le code de suivi ${colis.code_suivi} a été livrée avec succès.`;
            break;
          case 'Refusée':
            notificationTitle = 'Colis Refusée';
            notificationDescription = `Votre colis avec le code de suivi ${colis.code_suivi} a été refusée. Veuillez contacter le support pour plus d'informations.`;
            break;
          default:
            break;
        }
        if (notificationTitle && notificationDescription) {
          const notification = new NotificationUser({
            id_store: colis.store,
            title: notificationTitle,
            description: notificationDescription,
          });
          await notification.save({ session });
        }
      }

      // Update or create suivi for this colis
      suivi_colis = await Suivi_Colis.findOne({ id_colis: colis._id }).session(session);
      if (!suivi_colis) {
        const statusUpdate = { status: new_status, date: new Date(), livreur: livreurId };
        if (['Programmée', 'Reporté'].includes(new_status)) {
          statusUpdate.date_programme = colis.date_programme;
          statusUpdate.date_reporte = colis.date_reporte;
          statusUpdate.note = colis.note;
        }
        suivi_colis = new Suivi_Colis({
          id_colis: colis._id,
          code_suivi: colis.code_suivi,
          status_updates: [statusUpdate],
        });
      } else {
        const statusUpdate = { status: new_status, date: new Date(), livreur: livreurId };
        if (['Programmée', 'Reporté'].includes(new_status)) {
          statusUpdate.date_programme = colis.date_programme;
          statusUpdate.date_reporte = colis.date_reporte;
          statusUpdate.note = colis.note;
        }
        suivi_colis.status_updates.push(statusUpdate);
      }
      await suivi_colis.save({ session });
    });

    // External ops outside transaction
    if (new_status === 'Ramassée') {
      await handleFactureRamasser(colis.store, colis._id);
    }
    if (['Livrée', 'Refusée'].includes(new_status)) {
      try {
        await createOrUpdateFacture(colis._id);
        await createOrUpdateFactureLivreur(colis._id);
      } catch (factureError) {
        console.error(`Error creating/updating facture for colis ${colis._id}:`, factureError);
      }
    }
    if (['Refusée', 'Annulée', 'Remplacée'].includes(new_status)) {
      try {
        await generateFacturesRetour();
      } catch (factureError) {
        console.error(`Error generating retour factures:`, factureError);
      }
    }

    // Build response without exposing store
    const safeColis = colis.toObject ? colis.toObject() : colis;
    if (safeColis && 'store' in safeColis) delete safeColis.store;

    return res.status(200).json({
      success: true,
      message: 'Colis status updated successfully',
      colis: safeColis,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  } finally {
    await session.endSession();
  }
});

module.exports.updateMyColisStatus = updateMyColisStatus;
