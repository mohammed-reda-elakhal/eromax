// controllers/factureHelper.js
const FactureRamasser = require('../Models/FactureRamasser');
const shortid = require('shortid');
const { Facture } = require('../Models/Facture');
const { Colis } = require('../Models/Colis');

/**
 * Helper function to create or update FactureRamasser for a store.
 * @param {mongoose.Types.ObjectId} storeId - The ID of the store.
 * @param {mongoose.Types.ObjectId} colisId - The ID of the colis to add.
 * @returns {Promise<FactureRamasser>} - The updated or newly created FactureRamasser.
 */
const handleFactureRamasser = async (storeId, colisId) => {
  // Get the start and end of the current day
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Check if a FactureRamasser exists for this store today
  let facture = await FactureRamasser.findOne({
    id_store: storeId,
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  if (facture) {
    // Add the colis to the existing facture if not already present
    if (!facture.id_colis.includes(colisId)) {
      facture.id_colis.push(colisId);
      await facture.save();
    }
  } else {
    // Generate a unique code_facture
    const datePart = startOfDay.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const randomPart = shortid.generate().slice(0, 6).toUpperCase();
    const code_facture = `FCR${datePart}-${randomPart}`;

    // Create a new FactureRamasser
    facture = new FactureRamasser({
      id_store: storeId,
      id_colis: [colisId],
      code_facture,
    });

    await facture.save();
  }

  return facture;
};


const recalculateFactureForColis = async (colisId) => {
  // First, find the facture (client type) that includes this colis.
  const facture = await Facture.findOne({ colis: colisId, type: 'client' })
    .populate({
      path: 'colis',
      populate: [
        { path: 'ville', select: 'nom tarif tarif_refus' },
        { path: 'store', select: 'storeName' }
      ]
    })
    .lean();

  if (!facture) {
    // No facture found for this colis (or the facture might be of a different type)
    return;
  }

  // Initialize totals
  let totalPrix = 0;
  let totalOldTarifLivraison = 0;
  let totalNewTarifLivraison = 0;
  let totalTarifFragile = 0;
  let totalTarifAjouter = 0;
  let totalTarif = 0;
  let totalFraisRefus = 0;

  // Loop over each colis in the facture and recalculate totals.
  facture.colis.forEach(col => {
    // For a client facture, assume that:
    // - For delivered colis ("Livrée"), we use the city's normal tariff.
    // - For refused or similar statuses, we use the city's refusal tariff.
    let oldTarif = 0;
    let newTarif = 0;
    if (col.statut === 'Livrée') {
      oldTarif = col.ville?.tarif || 0;
      // Here, the new tariff is expected to be already computed and stored in col.crbt.tarif_livraison.
      newTarif = col.crbt?.tarif_livraison || oldTarif;
      totalPrix += col.prix || 0;
    } else if (['Refusée', 'En Retour', 'Fermée'].includes(col.statut)) {
      oldTarif = col.ville?.tarif_refus || 0;
      newTarif = col.crbt?.tarif_livraison || oldTarif;
      totalFraisRefus += oldTarif;
    } else {
      oldTarif = col.ville?.tarif || 0;
      newTarif = col.crbt?.tarif_livraison || oldTarif;
    }

    totalOldTarifLivraison += oldTarif;
    totalNewTarifLivraison += newTarif;
    totalTarifFragile += col.crbt?.tarif_fragile || 0;
    totalTarifAjouter += col.crbt?.tarif_supplementaire || 0;
    totalTarif += col.crbt?.total_tarif || 0;
  });

  // For client factures, netAPayer is calculated as:
  // netAPayer = (totalPrix + totalTarifAjouter - totalTarif) - totalFraisRefus
  const netAPayer = (totalPrix + totalTarifAjouter - totalTarif) - totalFraisRefus;

  // Update the facture totals in the database
  await Facture.updateOne(
    { _id: facture._id },
    {
      $set: {
        totalPrix,
        totalTarifLivraison: totalNewTarifLivraison,
        totalTarifFragile,
        totalTarifAjouter,
        totalTarif,
        totalFraisRefus,
        netAPayer,
      },
    }
  );
};

module.exports = {
  handleFactureRamasser,
  recalculateFactureForColis
};
