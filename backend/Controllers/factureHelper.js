// controllers/factureHelper.js
const FactureRamasser = require('../Models/FactureRamasser');
const shortid = require('shortid');

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

module.exports = {
  handleFactureRamasser,
};
