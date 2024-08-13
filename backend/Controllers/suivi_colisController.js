const asyncHandler = require("express-async-handler");
const { Suivi_Colis } = require("../Models/Suivi_Colis");
const { Colis } = require("../Models/Colis");


const updateSuiviColis = asyncHandler(async (req, res) => {

  const id_colis= req.params.id;
  const {new_status}=req.body;
  const validStatuses = [
    "nouveau colis",
    "attend de ramassage",
         //   || admin changer statu => team replacer admin 
    "ramasser",
    "expidie", // affectation livreur and get data  ( nom , tele ) , autorisation(a faire)
    "reçu",
    "mise en distribution",
    "livrée",
    "annulée",
    "programmée",
    "refusée",
  ];
  if (!id_colis || !new_status) {
    return res.status(400).json({ message: "id_colis and new_status are required" });
  }
   if (!validStatuses.includes(new_status)) {
    return res.status(400).json({ message: "Invalid status value" });
  } 
  

  // Find the colis
  const colis = await Colis.findById(id_colis);
  if (!colis) {
    return res.status(404).json({ message: "Colis not found" });
  }

  // Update the status in Colis
  colis.statut = new_status;
  await colis.save();

  // Find the corresponding Suivi_Colis entry
  let suivi_colis = await Suivi_Colis.findOne({ id_colis:colis._id });
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

  res.status(200).json({
    message: "Status and date updated successfully",
    colis,
    suivi_colis
  });
});

module.exports = {
  updateSuiviColis
};
