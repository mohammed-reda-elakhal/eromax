const asyncHandler = require("express-async-handler");
const { Suivi_Colis } = require("../Models/Suivi_Colis");
const { Colis } = require("../Models/Colis");
const { Ville } = require("../Models/Ville"); // Import Ville model
const { Store } = require("../Models/Store"); // Import Store model

const updateSuiviColis = asyncHandler(async (req, res) => {
  const id_colis = req.params.id;
  const { new_status } = req.body;
  const validStatuses = [
    "Nouveau Colis",
    "Attente de Ramassage",
    "Ramassée",
    "Expediée",
    "Reçu",
    "Mise en Distribution",
    "Livrée",  // Status for delivered packages
    "Annulée",
    "Programmée",
    "Refusée",
  ];

  // Validate inputs
  if (!id_colis || !new_status) {
    return res.status(400).json({ message: "id_colis and new_status are required " });
  }
  
  if (!validStatuses.includes(new_status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  // Find the package (Colis)
  const colis = await Colis.findById(id_colis)
    .populate('ville')  // Populate the Ville reference
    .populate('store'); // Populate the Store reference

  if (!colis) {
    return res.status(404).json({ message: "Colis not found" });
  }

  // Update the status in Colis
  colis.statut = new_status;
  await colis.save();

  // **Special operation when status is "Livrée"**

  // Update or create the Suivi_Colis entry (tracking record)
  let suivi_colis = await Suivi_Colis.findOne({ id_colis: colis._id });
  if (!suivi_colis) {
    // Create a new Suivi_Colis entry if not found
    suivi_colis = new Suivi_Colis({
      id_colis,
      code_suivi: colis.code_suivi,
      status_updates: [
        { status: new_status, date: new Date() }
      ]
    });
  } else {
    // Append the new status update
    suivi_colis.status_updates.push({ status: new_status, date: new Date() });
  }

  await suivi_colis.save();

  // Respond with updated status
  res.status(200).json({
    message: "Status and date updated successfully",
    colis,
    suivi_colis,
    updated_store_solde: colis.store.somme // Optional: include updated solde in response
    // 
  });
});

module.exports = {
  updateSuiviColis
};
