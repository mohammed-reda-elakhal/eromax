const asyncHandler = require("express-async-handler");
const { Suivi_Colis } = require("../Models/Suivi_Colis");
const NotificationUser = require('../Models/Notification_User');  // Use NotificationUser, not Notification_User
const { Colis } = require("../Models/Colis");
const { Ville } = require("../Models/Ville"); // Import Ville model
const { Store } = require("../Models/Store"); // Import Store model
const axios = require('axios');
const cron = require('node-cron');
const { handleFactureRamasser } = require('./factureHelper');
const { createOrUpdateFacture } = require("./factureController");


/*
Boite vocale
Pas de reponse jour 1
Pas de reponse jour 2
Pas de reponse jour 3
Pas reponse + sms / + whatsap 
En voyage 
Injoignable
Hors-zone
Intéressé
Numéro Incorrect
Reporté
Confirmé Par Livreur
Endomagé
*/



const updateSuiviColis = asyncHandler(async (req, res) => {
  const id_colis = req.params.id;
  const { new_status, comment, date_programme, date_reporte, note } = req.body;

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
  ];

  // Validate inputs
  if (!id_colis || !new_status) {
    return res.status(400).json({ message: "id_colis and new_status are required" });
  }

  if (!validStatuses.includes(new_status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  // For "Programmée" or "Reporté", ensure date and note are provided
  if (["Programmée", "Reporté"].includes(new_status)) {
    if ((!date_programme && new_status === "Programmée") || (!date_reporte && new_status === "Reporté")) {
      return res.status(400).json({ message: "Date is required for the selected status" });
    }
    // Note is optional, but you can enforce it if needed
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

  if (new_status === "Livrée") {
    colis.date_livraisant = new Date();
  }

  // Handle "Programmée" and "Reporté" statuses
  if (new_status === "Programmée") {
    colis.date_programme = new Date(date_programme);
  } else if (new_status === "Reporté") {
    colis.date_reporte = new Date(date_reporte);
  }

  // Update the note if provided
  if (note) {
    colis.note = note;
  }

  // Update the Colis status
  colis.statut = new_status;
  await colis.save();

  // Handle special case when new_status is "Livrée" and colis has a replacedColis
  if (new_status === "Livrée" && colis.replacedColis) {
    const replacedColis = await Colis.findById(colis.replacedColis);
    if (replacedColis) {
      replacedColis.statut = "Remplacée";
      await replacedColis.save();

      // Update or create the Suivi_Colis entry for the replaced colis
      let suiviReplacedColis = await Suivi_Colis.findOne({ id_colis: replacedColis._id });
      if (!suiviReplacedColis) {
        suiviReplacedColis = new Suivi_Colis({
          id_colis: replacedColis._id,
          code_suivi: replacedColis.code_suivi,
          status_updates: [{ status: "Remplacée", date: new Date() }]
        });
      } else {
        suiviReplacedColis.status_updates.push({ status: "Remplacée", date: new Date() });
      }
      await suiviReplacedColis.save();
    }
  }

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

  // Update or create the Suivi_Colis entry (tracking record) for the main colis
  let suivi_colis = await Suivi_Colis.findOne({ id_colis: colis._id });
  if (!suivi_colis) {
    suivi_colis = new Suivi_Colis({
      id_colis,
      code_suivi: colis.code_suivi,
      status_updates: [{ status: new_status, date: new Date() }]
    });
  } else {
    const statusUpdate = { status: new_status, date: new Date() };
    if (["Programmée", "Reporté"].includes(new_status)) {
      statusUpdate.date_programme = colis.date_programme;
      statusUpdate.date_reporte = colis.date_reporte;
      statusUpdate.note = colis.note;
    }
    suivi_colis.status_updates.push(statusUpdate);
  }

  // **Invoke the Facture Creation/Update Function**
  if (["Livrée", "Annulée"].includes(new_status)) {
    try {
      await createOrUpdateFacture(colis._id);
    } catch (factureError) {
      console.error(`Error creating/updating facture for colis ${id_colis}:`, factureError);
      // Optionally, handle the error (e.g., send a notification to admin)
      // Depending on requirements, you might want to rollback the colis status update
    }
  }

  await suivi_colis.save();

  res.status(200).json({
    message: "Status, comment, date, and note updated successfully",
    colis,
    suivi_colis,
  });
});





const updateMultipleColisStatus = asyncHandler(async (req, res) => {
  const { colisCodes, new_status, comment } = req.body;
  // if colis ==> bml changer 
  
  const validStatuses = [
    "Nouveau Colis",
    "attente de ramassage",
    "Préparer pour Roteur",
    "Ramassée",
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
  const failedUpdates = [];

  for (const codeSuivi of colisCodes) {
    try {
      const colis = await Colis.findOne({ code_suivi: codeSuivi }).populate('store');
      if (!colis) {
        console.log(`Colis with code_suivi ${codeSuivi} not found`);
        failedUpdates.push({ codeSuivi, error: "Colis not found" });
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

      // Handle special case when new_status is "Livrée" and colis has a replacedColis
      if (new_status === "Livrée" && colis.replacedColis) {
        const replacedColis = await Colis.findById(colis.replacedColis);
        if (replacedColis) {
          replacedColis.statut = "Remplacée";
          await replacedColis.save();

          // Update or create the Suivi_Colis entry for the replaced colis
          let suiviReplacedColis = await Suivi_Colis.findOne({ id_colis: replacedColis._id });
          if (!suiviReplacedColis) {
            suiviReplacedColis = new Suivi_Colis({
              id_colis: replacedColis._id,
              code_suivi: replacedColis.code_suivi,
              status_updates: [{ status: "Remplacée", date: new Date() }]
            });
          } else {
            suiviReplacedColis.status_updates.push({ status: "Remplacée", date: new Date() });
          }
          await suiviReplacedColis.save();
        }
      }

      if (new_status === "Ramassée") {
        await handleFactureRamasser(colis.store, colis._id);
      }

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

      // **Invoke the Facture Creation/Update Function**
      if (["Livrée", "Refusée"].includes(new_status)) {
        try {
            await createOrUpdateFacture(colis._id);
        } catch (factureError) {
            console.error(`Error creating/updating facture for colis ${id_colis}:`, factureError);
            // Optionally, handle the error (e.g., send a notification to admin)
            // Depending on requirements, you might want to rollback the colis status update
        }
      }

      // Save the Suivi_Colis entry
      await suivi_colis.save();
      trackingUpdates.push(suivi_colis);
    } catch (err) {
      console.error(`Error updating colis with code_suivi ${codeSuivi}:`, err);
      failedUpdates.push({ codeSuivi, error: err.message });
    }
  }

  if (updatedColisList.length === 0) {
    return res.status(404).json({ message: "No colis found or updated", failedUpdates });
  }

  // Respond with the list of updated colis, tracking updates, and any failed updates
  res.status(200).json({
    message: "Colis status updated successfully",
    updatedColisList,
    trackingUpdates,
    failedUpdates
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

// controllers/ameexController.js
// Function to map Ameex status to your own statuses
function mapAmeexStatusToOurStatus(ameexStatus) {
  const statusMapping = {
    "DELIVERED": "Livrée",
    "CANCEL": "Annulée",
    "REFUSE": "Refusée",
    "RETURNED": "En retour",
    "SENT": "Expediée",
    "RECEIVED": "Reçu",
    "DISTRIBUTION": "Mise en Distribution",
    "NEW_PARCEL": "Nouveau Colis",
    "PICKED_UP": "Ramassée",
    "WAITING_PICKUP": "attente de ramassage",
  };

  return statusMapping[ameexStatus] || "attente de ramassage"; // Default to 'attente de ramassage' if no mapping is found
}

// Function to handle special cases
async function handleSpecialCases(colis, newStatus) {
  // Handle FactureRamasser if status is "Ramassée"
  if (newStatus === "Ramassée") {
    await handleFactureRamasser(colis.store, colis._id);
  }

  // Create Notification for specific statuses
  if (["Ramassée", "Livrée"].includes(newStatus)) {
    const notificationTitle = newStatus === "Ramassée" ? 'Colis Ramassée' : 'Colis Livrée';
    const notificationDescription = `Votre colis avec le code de suivi ${colis.code_suivi} a été ${newStatus.toLowerCase()} avec succès.`;

    const notification = new NotificationUser({
      id_store: colis.store,
      title: notificationTitle,
      description: notificationDescription,
    });
    await notification.save();
  }
}

// Core Function to synchronize colis statuses with Ameex
async function syncColisStatusWithAmeexCore() {
  try {
    // Step 1: Fetch all colis with expedation_type="ameex" created in the last two weeks
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const colisList = await Colis.find({
        expedation_type: 'ameex',
      createdAt: { $gte: twoWeeksAgo }
    }).populate('store');

    if (colisList.length === 0) {
      console.log('No colis to update');
      return { updatedColis: [], errors: [] };
    }

    // Prepare authentication headers for Ameex API
    const authId = process.env.AMEEX_API_ID || 3452;
    const authKey = process.env.AMEEX_API_KEY || "9435a2-921aa4-67fc55-ced90c-1bafbc";
    const headers = {
      'C-Api-Id': authId,
      'C-Api-Key': authKey,
      'Content-Type': 'application/json',
    };

    // Initialize arrays to keep track of updates and errors
    const updatedColisList = [];
    const errorList = [];

    // Loop through each colis
    for (const colis of colisList) {
      try {
        const code_suivi_ameex = colis.code_suivi_ameex;

        // Make the API call to Ameex to get colis info
        const response = await axios.get(
          `https://api.ameex.app/customer/Delivery/Parcels/Info?ParcelCode=${code_suivi_ameex}`,
          { headers }
        );

        if (response.status === 200) {
          const responseData = response.data;
          // Extract the 'statut' field
          const ameexStatus = responseData.api.parcel.statut;

          // Map Ameex status to your own statuses
          const mappedStatus = mapAmeexStatusToOurStatus(ameexStatus);

          // If the status has changed, update the colis and Suivi_Colis
          if (colis.statut !== mappedStatus) {
            const oldStatus = colis.statut; // Save the old status

            // Update the colis status
            colis.statut = mappedStatus;
            await colis.save();

            // Update or create the Suivi_Colis entry
            let suivi_colis = await Suivi_Colis.findOne({ id_colis: colis._id });
            if (!suivi_colis) {
              suivi_colis = new Suivi_Colis({
                id_colis: colis._id,
                code_suivi: colis.code_suivi,
                status_updates: [{ status: mappedStatus, date: new Date() }]
              });
            } else {
              suivi_colis.status_updates.push({ status: mappedStatus, date: new Date() });
            }
            await suivi_colis.save();

            // Handle special cases (e.g., create notifications)
            await handleSpecialCases(colis, mappedStatus);

            // Add to updated colis list
            updatedColisList.push({
              colis_id: colis._id,
              code_suivi: colis.code_suivi,
              old_status: oldStatus,
              new_status: mappedStatus
            });
          }
        } else {
          // Handle unexpected response statuses
          errorList.push({
            colis_id: colis._id,
            code_suivi: colis.code_suivi,
            message: 'Failed to fetch colis info from Ameex',
            status: response.status
          });
        }
      } catch (error) {
        console.error(`Error syncing colis ${colis.code_suivi}:`, error.message);
        errorList.push({
          colis_id: colis._id,
          code_suivi: colis.code_suivi,
          message: error.message
        });
      }
    }

    console.log('Colis status sync completed');
    return { updatedColis: updatedColisList, errors: errorList };
  } catch (error) {
    console.error('Error syncing colis statuses:', error);
    throw error;
  }
}

// Controller function to be used as an Express route handler
const syncColisStatusWithAmeex = asyncHandler(async (req, res) => {
  try {
    const { updatedColis, errors } = await syncColisStatusWithAmeexCore();
    res.status(200).json({
      message: 'Colis status sync completed',
      updatedColis,
      errors
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = {
  updateMultipleSuiviColis,
  updateSuiviColis , 
  updateMultipleColisStatus,
  syncColisStatusWithAmeex,
  syncColisStatusWithAmeexCore,
};
