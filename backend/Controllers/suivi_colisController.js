const asyncHandler = require("express-async-handler");
const { Suivi_Colis } = require("../Models/Suivi_Colis");
const NotificationUser = require('../Models/Notification_User');  // Use NotificationUser, not Notification_User
const { Colis } = require("../Models/Colis");
const { Ville } = require("../Models/Ville"); // Import Ville model
const { Store } = require("../Models/Store"); // Import Store model

const { handleFactureRamasser } = require('./factureHelper');

const updateSuiviColis = asyncHandler(async (req, res) => {
  const id_colis = req.params.id;
  const { new_status, comment } = req.body;
  const validStatuses = [
    "Nouveau Colis",
    "attente de ramassage",
    "Ramassée",
    "Expediée",
    "Reçu",
    "Mise en Distribution",
    "Livrée",
    "Annulée",
    "Programmée",
    "Refusée",
    "En retour",
    "Remplacée"

  ];

  // Validate inputs
  if (!id_colis || !new_status) {
    return res.status(400).json({ message: "id_colis and new_status are required" });
  }
  if (!validStatuses.includes(new_status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  // Find the Colis
  const colis = await Colis.findById(id_colis).populate('store');
  if (!colis) {
    return res.status(404).json({ message: "Colis not found" });
  }

  // Update comments if necessary
  if (new_status === "Annulée" && comment) {
    colis.comment_annule = comment;
  } else if (new_status === "Refusée" && comment) {
    colis.comment_refuse = comment;
  }

  // Update the Colis status
  colis.statut = new_status;
  await colis.save();

  // Handle FactureRamasser if status is "Ramassée"
  if (new_status === "Ramassée") {
    await handleFactureRamasser(colis.store, colis._id);
  }

  // Create Notification for specific statuses
  if (["Ramassée", "Livrée"].includes(new_status)) {
    const notificationTitle = new_status === "Ramassée" ? 'Colis Ramassée' : 'Colis Livrée';
    const notificationDescription = `Votre colis avec le code de suivi ${colis.code_suivi} a été ${new_status.toLowerCase()} avec succès.`;
    
    const notification = new NotificationUser({
      id_store: colis.store,
      title: notificationTitle,
      description: notificationDescription,
    });
    await notification.save();
  }

  // Update or create the Suivi_Colis entry (tracking record)
  let suivi_colis = await Suivi_Colis.findOne({ id_colis: colis._id });
  if (!suivi_colis) {
    suivi_colis = new Suivi_Colis({
      id_colis,
      code_suivi: colis.code_suivi,
      status_updates: [{ status: new_status, date: new Date() }]
    });
  } else {
    suivi_colis.status_updates.push({ status: new_status, date: new Date() });
  }

  await suivi_colis.save();

  res.status(200).json({
    message: "Status, comment, and date updated successfully",
    colis,
    suivi_colis,
  });
});



const updateMultipleColisStatus = asyncHandler(async (req, res) => {
  const { colisCodes, new_status, comment } = req.body;
  const validStatuses = [
    "Nouveau Colis",
    "attente de ramassage",
    "Ramassée",
    "Expediée",
    "Reçu",
    "Mise en Distribution",
    "Livrée",
    "Annulée",
    "Programmée",
    "Refusée",
  ];

  // Validate inputs
  if (!colisCodes || !Array.isArray(colisCodes) || colisCodes.length === 0) {
    return res.status(400).json({ message: "colisCodes must be a non-empty array" });
  }
  if (!new_status) {
    return res.status(400).json({ message: "new_status is required" });
  }
  if (!validStatuses.includes(new_status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const updatedColisList = [];
  const trackingUpdates = [];

  for (const codeSuivi of colisCodes) {
    const colis = await Colis.findOne({ code_suivi: codeSuivi }).populate('store');
    if (!colis) {
      console.log(`Colis with code_suivi ${codeSuivi} not found`);
      continue;
    }

    if (new_status === "Annulée" && comment) {
      colis.comment_annule = comment;
    } else if (new_status === "Refusée" && comment) {
      colis.comment_refuse = comment;
    }

    colis.statut = new_status;
    await colis.save();
    updatedColisList.push(colis);

    if (new_status === "Ramassée") {
      await handleFactureRamasser(colis.store, colis._id);
    }

    if (["Ramassée", "Livrée"].includes(new_status)) {
      const notificationTitle = new_status === "Ramassée" ? 'Colis Ramassée' : 'Colis Livrée';
      const notificationDescription = `Votre colis avec le code de suivi ${colis.code_suivi} a été ${new_status.toLowerCase()} avec succès.`;

      const notification = new NotificationUser({
        storeId: colis.store,
        clientId: colis.clientId,
        title: notificationTitle,
        description: notificationDescription,
      });
      await notification.save();
    }

    let suivi_colis = await Suivi_Colis.findOne({ id_colis: colis._id });
    if (!suivi_colis) {
      // If no Suivi_Colis entry exists, create a new one
      suivi_colis = new Suivi_Colis({
        id_colis: colis._id,
        code_suivi: colis.code_suivi,
        status_updates: [{ status: new_status, date: new Date() }]
      });
    } else {
      // Append the new status update to the existing tracking record
      suivi_colis.status_updates.push({ status: new_status, date: new Date() });
    }

    // Save the Suivi_Colis entry
    await suivi_colis.save();
    trackingUpdates.push(suivi_colis);
  }

  if (updatedColisList.length === 0) {
    return res.status(404).json({ message: "No colis found or updated" });
  }

  // Respond with the list of updated colis and their tracking information
  res.status(200).json({
    message: "Colis status updated successfully",
    updatedColisList,
    trackingUpdates,
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
  updateSuiviColis , 
  updateMultipleColisStatus
};
