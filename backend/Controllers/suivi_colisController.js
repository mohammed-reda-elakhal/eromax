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
    "attente de ramassage",
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



const updateMultipleSuiviColis = asyncHandler(async (req, res) => {
  const { colisList } = req.body; // Expecting an array of colis with their code_suivi and status
  const validStatus = "Ramassée"; // We're only updating to "Ramassée" for this operation

  // Check if colisList exists and is an array
  if (!Array.isArray(colisList) || colisList.length === 0) {
    return res.status(400).json({ message: "colisList is required and should be a non-empty array" });
  }

  // Process each colis in the list
  const updatedColisList = [];
  const updatedSuiviColisList = [];

  for (const item of colisList) {
    const { code_suivi } = item;

    // Find the colis by its code_suivi
    const colis = await Colis.findOne({ code_suivi })
      .populate('ville')  // Populate the Ville reference
      .populate('store'); // Populate the Store reference

    if (!colis) {
      return res.status(404).json({ message: `Colis with code_suivi ${code_suivi} not found` });
    }

    // Check if the current status allows for this update
    if (colis.statut !== "attente de ramassage") {
      return res.status(400).json({ message: `Colis with code_suivi ${code_suivi} is not in 'Attente de Ramassage' state` });
    }

    // Update the status to "Ramassée"
    colis.statut = validStatus;
    await colis.save();
    updatedColisList.push(colis);

    // Create or update the tracking record (Suivi_Colis)
    let suivi_colis = await Suivi_Colis.findOne({ id_colis: colis._id });
    if (!suivi_colis) {
      // Create new Suivi_Colis if not found
      suivi_colis = new Suivi_Colis({
        id_colis: colis._id,
        code_suivi: colis.code_suivi,
        status_updates: [
          { status: validStatus, date: new Date() }
        ]
      });
    } else {
      // Append the new status update
      suivi_colis.status_updates.push({ status: validStatus, date: new Date() });
    }
    await suivi_colis.save();
    updatedSuiviColisList.push(suivi_colis);
  }

  // Respond with the updated colis and tracking records
  res.status(200).json({
    message: "Statuses and tracking records updated successfully",
    updatedColisList,
    updatedSuiviColisList,
  });
});


module.exports = {
  updateMultipleSuiviColis,
  updateSuiviColis
};
