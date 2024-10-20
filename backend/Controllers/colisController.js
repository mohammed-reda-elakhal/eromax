const asyncHandler = require("express-async-handler");
const { Colis, validateRegisterColis } = require("../Models/Colis");
const { Suivi_Colis } = require("../Models/Suivi_Colis");
const crypto = require("crypto");
const { Client } = require("../Models/Client");
const { Store } = require("../Models/Store");
const { default: mongoose } = require("mongoose");
const { Livreur } = require("../Models/Livreur");
const { Team } = require("../Models/Team");
const schedule = require('node-schedule');
const { Ville } = require("../Models/Ville");


// Utility function to generate a unique code_suivi
function generateCodeSuivi() {
  return crypto.randomBytes(8).toString('hex'); // Generates a 16-character hexadecimal string
}

/**
 * -------------------------------------------------------------------
 * @desc     Create new colis
 * @route    /api/colis/
 * @method   POST
 * @access   private (only logged in user)
 * -------------------------------------------------------------------
 **/

module.exports.CreateColisCtrl = asyncHandler(async (req, res) => {
  // Check if request body is provided
  if (!req.body) {
    return res.status(400).json({ message: "Les données de votre colis sont manquantes" });
  }

  // Input validation
  const { error } = validateRegisterColis(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // Validate that req.user is present and has store
  if (!req.user) {
    return res.status(400).json({ message: "Store information is missing in user data" });
  }

  // Extract store and team information
  let store = req.user.store || null;  // Assuming req.user.store should be used
  let team = req.user.id;  // Assuming team is the user id

  // Validate and fetch the ville by its ID from the request body
  const ville = await Ville.findById(req.body.ville);
  if (!ville) {
    return res.status(400).json({ message: "Ville not found" });
  }

  // Generate a unique code_suivi
  let code_suivi;
  let isUnique = false;
  while (!isUnique) {
    code_suivi = generateCodeSuivi();
    const existingColis = await Colis.findOne({ code_suivi });
    if (!existingColis) {
      isUnique = true;
    }
  }

  // Create and save the new Colis
  const newColis = new Colis({
    ...req.body,
    store,
    team,
    ville: ville._id,  // Add the ville reference
    code_suivi,
  });

  const saveColis = await newColis.save();


  // Populate store, team, and ville data
  await saveColis.populate('store');
  await saveColis.populate('team');
  await saveColis.populate('ville');

  // Verify that code_suivi is not null before proceeding
  if (!newColis.code_suivi) {
    console.log("Error: code_suivi is null after saving Colis");
    return res.status(500).json({ message: "Internal server error: code_suivi is null" });
  }

  // Create and save the new Suivi_Colis
  const suivi_colis = new Suivi_Colis({
    id_colis: newColis._id,
    code_suivi: newColis.code_suivi,
    date_create: newColis.createdAt,
    status_updates: [
      { status: "Attente de Ramassage", date: new Date() }  // Statut initial
    ]
  });

  const save_suivi = await suivi_colis.save();

  // Respond with both the saved Colis and Suivi_Colis
  res.status(201).json({
    message: 'Colis créé avec succès, merci ❤️',
    colis: saveColis,
    suiviColis: save_suivi,
  });
});
/**
 * -------------------------------------------------------------------
 * @desc     get all colis, optionally filter by statut
 * @route    /api/colis/
 * @method   GET
 * @access   private (only logged in user)
 * -------------------------------------------------------------------
**/
module.exports.getAllColisCtrl = asyncHandler(async (req, res) => {
  try {
    const { statut } = req.query; // Extract 'statut' from the query params
    let filter = {};

    // Add 'statut' to the filter if it's provided
    if (statut) {
      filter.statut = statut;
    }

    // Find colis with optional filtering by 'statut'
    const colis = await Colis.find(filter)
      .populate('team')        // Populate the team details
      .populate('livreur')     // Populate the livreur details
      .populate('store')       // Populate the store details
      .populate('ville')
      .sort({ updatedAt: -1 }); // Sort by updatedAt in descending order (most recent first)

    res.status(200).json(colis);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch colis.", error: error.message });
  }
});



/**
 * -------------------------------------------------------------------
 * @desc     get colis by id
 * @route    /api/colis/:id
 * @method   GET
 * @access   private (only logger in user )
 * -------------------------------------------------------------------
**/
module.exports.getColisByIdCtrl = asyncHandler(async (req, res) => {
  const colis = await Colis.findById(req.params.id).populate('livreur');
  if (!colis) {
    return res.status(404).json({ message: "Colis not found" });
  }
  res.status(200).json(colis);
})


/**
 * -------------------------------------------------------------------
 * @desc     get colis by code suivi
 * @route    /api/colis/:code_suivi
 * @method   GET
 * @access   private (only logger in user )
 * -------------------------------------------------------------------
**/
exports.getColisByCodeSuiviCtrl = asyncHandler(async (req, res) => {
  const colis = await Colis.findOne({ code_suivi: req.params.code_suivi }).populate('livreur');
  if (!colis) {
    return res.status(404).json({ message: "Colis not found" });
  }
  res.status(200).json(colis);
});

/**
 * -------------------------------------------------------------------
 * @desc     get colis by code suivi
 * @route    /api/colis/statu
 * @method   GET
 * @access   private (only logger in user )
 * -------------------------------------------------------------------
**/
exports.getColisByStatuCtrl = asyncHandler(async (req, res) => {
  const colis = await Colis.find({ statut: req.query.statu })
    .populate('livreur')
    .populate('store')
    .populate('team')
    .populate('ville')
    .sort({ updatedAt: -1 });


  if (!colis) {
    return res.status(404).json({ message: "Colis not found" });
  }

  res.status(200).json(colis);
});




/**
 * -------------------------------------------------------------------
 * @desc     get colis by user or store, optionally filter by statut
 * @route    /api/colis/:id_user
 * @method   GET
 * @access   private (only logged in user)
 * -------------------------------------------------------------------
**/
exports.getColisByUserOrStore = asyncHandler(async (req, res) => {
  let colis;
  let team = req.user.id;
  let store = req.user.store;
  let filter = {};

  // Check if the optional 'statut' parameter is provided
  const { statut } = req.query;

  if (req.user.role === "team" || req.user.role === "admin") {
    filter.team = team;
  } else {
    filter.store = store;
  }

  // Add 'statut' to the filter if it's provided
  if (statut) {
    filter.statut = statut;
  }

  // Find colis based on the constructed filter
  colis = await Colis.find(filter).populate('team').populate('livreur').populate('store').populate('ville').sort({ updatedAt: -1 });;

  if (!colis) {
    return res.status(404).json({ message: "Colis not found" });
  }

  res.status(200).json(colis);
});


/**
 * 
 */
exports.getColisByClient = asyncHandler(async (req, res) => {

  try {
    const clientId = req.params.id;
    const client = await Client.findById(clientId).populate('ville');

    if (!client) {
      return res.status(404).json({ message: "Cleint not Found" });

    }

    const colisList = await Colis.find({ clientId: clientId });
    res.status(200).json({ message: "Cleint fetched successfully", colis: colisList });

  } catch (err) {
    console.error("Error fetching colis", err);
    res.status(500).json({ message: "Internal Server error", error: err.message })
  }


});











/**
 * -------------------------------------------------------------------
 * @desc     delete colis
 * @route    /api/colis/:id
 * @method   DELETE
 * @access   private (only Admin )
 * -------------------------------------------------------------------
**/
module.exports.deleteColis = asyncHandler(async (req, res) => {
  const deletedColis = await Colis.findByIdAndDelete(req.params.id);
  if (!deletedColis) {
    return res.status(404).json({ message: "Colis not found" });
  }
  res.status(200).json({ message: "Colis deleted succesfully" });
});

/**
 * -------------------------------------------------------------------
 * @desc     update colis 
 * @route    /api/colis/:id
 * @method   PUT
 * @access   private ( only admin )
 * -------------------------------------------------------------------
 **/
module.exports.updateColis = asyncHandler(async (req, res) => {
  //input validation 
  const { error } = validateRegisterColis(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const updatedColis = await Colis.findByIdAndUpdate(req.params.code_suivi, req.body, { new: true });
  if (!updatedColis) {
    return res.status(404).json({ message: "Colis not found" });
  }
  res.status(200).json(updatedColis);
})


/**
 * -------------------------------------------------------------------
 * @desc     update statu colis 
 * @route    /api/colis/statu/:id
 * @method   PUT
 * @access   private (only autorise User )
 * -------------------------------------------------------------------
 **/
module.exports.UpdateStatusCtrl = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { new_status } = req.body;

  // Validate the new status
  const validStatuses = [
    "nouveau colis",
    "attend de ramassage",
    //   || admin changer statu => team replacer admin 
    "ramasser",
    "expidie", // affectation livreur and get data  ( nom , tele ) , autorisation
    "reçu",
    "mise en distribution",
    "livrée",
    "annulée",
    "programmée",
    "refusée",
  ];

  /*  if (!validStatuses.includes(new_status)) {
     return res.status(400).json({ message: "Invalid status value" });
   } */

  // verify statu === expidie ( to work )

  // Find the Colis by id
  const colis = await Colis.findById(id);

  if (!colis) {
    return res.status(404).json({ message: "Colis not found" });
  }

  // Update the status in Colis
  colis.statut = new_status;
  await colis.save();

  // Update the corresponding date in Suivi_Colis
  const suivi_colis = await Suivi_Colis.findOne({ id_colis: colis._id });

  if (!suivi_colis) {
    return res.status(404).json({ message: "Suivi_Colis not found" });
  }

  // Set the corresponding date field based on the new status
  const dateFieldMap = {
    "nouveau colis": "date_create",
    "attend de ramassage": "date_attend_ramassage",
    "ramasser": "date_ramassage",
    "expidie": "date_exp",
    "reçu": "date_reçu",
    "mise en distribution": "date_distribution",
    "livrée": "date_livraison",
    "annulée": "date_annule",
    "programmée": "date_programme",
    "refusée": "date_refusée",
  };

  const dateField = dateFieldMap[new_status];
  suivi_colis[dateField] = new Date();

  await suivi_colis.save();

  res.status(200).json({ message: "Status and date updated successfully", colis, suivi_colis });
});


/**
 * -------------------------------------------------------------------
 * @desc     get suivi colis code suivi 
 * @route    api/colis/truck/:code_suivi
 * @method   GET
 * @access   private ( only admin )
 * -------------------------------------------------------------------
 **/
module.exports.getSuiviColis = asyncHandler(async (req, res) => {
  const suivi_colis = await Suivi_Colis.findOne({ code_suivi: req.params.code_suivi });
  if (!suivi_colis) {
    return res.status(404).json({ message: "S'il vous pliz vérifier code de suivi" });
  }
  res.status(200).json(suivi_colis);
});


/**
 * -------------------------------------------------------------------
 * @desc     get Colis By Store Id
 * @route    api/colis/truck/:code_suivi
 * @method   GET api/colis/colisStore/:id_store
 * @access   ( client )
 * -------------------------------------------------------------------
**/
exports.getColisByStore = asyncHandler(async (req, res) => {

  try {
    console.log("Received request:", req.params);

    const storeId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      console.error("Invalid Store ID format:", storeId);
      return res.status(400).json({ message: "Invalid Store ID format" });
    }

    console.log("Finding store with ID:", storeId);
    const store = await Store.findById(storeId);

    if (!store) {
      console.error("Store not found with ID:", storeId);
      return res.status(404).json({ message: "Store not found" });
    }

    console.log("Store found:", store);

    const colisList = await Colis.find({ store: storeId }).populate('ville');

    console.log("Colis list fetched:", colisList);

    res.status(200).json({
      message: "Colis fetched successfully",
      colis: colisList
    });
  } catch (err) {
    console.error("Error fetching colis", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }

});

/**
 * -------------------------------------------------------------------
 * @desc     Affecter Livreur
 * @route    api/colis/livreur
 * @method   GET 
 * @access   private ( admin )
 * -------------------------------------------------------------------
 **/

module.exports.affecterLivreur = async (req, res) => {
  const { colisId, livreurId } = req.body; // Assuming these are passed in the request body

  try {
    // Récupérer le colis par son ID
    const colis = await Colis.findById(colisId);

    if (!colis) {
      return res.status(404).json({ message: "Colis not found" });
    }

    // Vérifier si le statut est ramassé
    if (colis.statut !== "Ramassée") {
      return res.status(400).json({ message: "Colis is not in the 'Ramassé' status" });
    }

    // Récupérer le livreur par son ID
    const livreur = await Livreur.findById(livreurId);

    if (!livreur) {
      return res.status(404).json({ message: "Livreur not found" });
    }

    // Affecter le livreur  et le nouveau statut  au colis
    colis.livreur = livreurId;
    colis.statut = 'Expediée'
    // Sauvegarder les modifications
    await colis.save();

    let suivi_colis = await Suivi_Colis.findOne({ id_colis: colis._id });
    if (!suivi_colis) {
      suivi_colis = new Suivi_Colis({
        id_colis: colisId,
        code_suivi: colis.code_suivi,
        status_updates: [
          { status: 'Expediée', date: new Date() }  //ajouter le statut expediée
        ]
      });
    } else {
      // Ajouter la nouvelle mise à jour du statut
      suivi_colis.status_updates.push({ status: 'Expediée', date: new Date() });
    }

    // Sauvegarder les mises à jour du suivi
    await suivi_colis.save();
    const dataLiv = {
      Nom: livreur.nom,
      Tele: livreur.tele
    };
    res.status(200).json({ message: "Livreur assigned successfully", dataLiv, colis });
  } catch (error) {
    console.error("Error assigning Livreur:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
module.exports.getColisByIdLivreur = asyncHandler(async (req, res) => {
  const id_livreur = req.params.id_livreur
  if (!id_livreur) {
    return res.status(400).json({ message: "Id Livreur no provided" });
  }
  const liv = Livreur.findById(id_livreur);
  if (!liv) {
    return res.status(404).json({ message: "Livreur not found" });
  }
  const colisList = await Colis.find({ livreur: id_livreur });
  res.status(200).json({ message: "Colis Fetched Successfully", colisList });


});
module.exports.getColisByTeam = asyncHandler(async (req, res) => {

  const id_team = req.params.id_team;
  if (!id_team) {
    return res.status(400).json({ message: "Id Team not provided" });
  }
  const team = Team.findById(id_team);
  if (!team) {
    return res.status(404).json({ message: "Team not found" });
  }
  const colisList = await Colis.find({ team: id_team });
  res.status(200).json({ message: "Colis Fetched Successfullt", colisList });


});


exports.getColisByLivreur = asyncHandler(async (req, res) => {
  let colis;
  let livreur = req.params.id_livreur;
  let filter = {};
  const allowedStatuses = ["Expediée", "Mise en distribution", "Livrée"];

  // Check if the optional 'statut' parameter is provided
  const { statut } = req.query;

  if (req.user.role === "livreur") {
    filter.livreur = livreur;
    filter.statut = { $in: allowedStatuses };
  }



  // Add 'statut' to the filter if it's provided
  if (statut) {
    filter.statut = statut;
  }

  // Find colis based on the constructed filter
  colis = await Colis.find(filter).populate('livreur').populate('ville');

  if (!colis) {
    return res.status(404).json({ message: "Colis not found" });
  }

  res.status(200).json(colis);
});

exports.colisProgramme = asyncHandler(async (req, res) => {
  const { colisId, daysToAdd } = req.body;

  // Validate input
  if (!mongoose.Types.ObjectId.isValid(colisId)) {
    return res.status(400).send("Invalid Colis ID");
  }

  if (typeof daysToAdd !== 'number' || daysToAdd <= 0) {
    return res.status(400).send("Invalid number of days to add");
  }

  try {
    // Find the Colis by ID
    const colis = await Colis.findById(colisId);
    if (!colis) {
      return res.status(404).send("Colis not found");
    }

    // Calculate the scheduled delivery date by adding `daysToAdd` to the current date
    const currentDate = new Date();
    const deliveryDate = new Date(currentDate);
    deliveryDate.setDate(currentDate.getDate() + daysToAdd);

    // Update status to "expédié" and set the scheduled delivery date
    colis.statut = "Expediée";
    colis.date_programme = deliveryDate;
    await colis.save();

    // **Update Suivi_Colis with "Expédié" status**
    let suivi_colis = await Suivi_Colis.findOne({ id_colis: colis._id });
    if (!suivi_colis) {
      // Create a new Suivi_Colis entry if not found
      suivi_colis = new Suivi_Colis({
        id_colis: colis._id,
        code_suivi: colis.code_suivi,
        status_updates: [{ status: "Expediée", date: new Date() }]
      });
    } else {
      // Append the new status update
      suivi_colis.status_updates.push({ status: "Expediée", date: new Date() });
    }

    await suivi_colis.save();

    // Schedule a job to revert the status to "mise en distribution" on the scheduled delivery date
    schedule.scheduleJob(deliveryDate, async function () {
      const updatedColis = await Colis.findById(colisId);
      if (updatedColis) {
        updatedColis.statut = "Mise en Distribution";
        await updatedColis.save();
        console.log(`Colis ${colisId} status changed to "Mise en Distribution"`);
        // **Update Suivi_Colis with "Mise en Distribution" status**
        let suivi_colis = await Suivi_Colis.findOne({ id_colis: colisId });
        if (suivi_colis) {
          suivi_colis.status_updates.push({ status: "Mise en Distribution", date: new Date() });
          await suivi_colis.save();
        }
      }
    });


    return res.status(200).send(`Delivery scheduled for ${deliveryDate} and status updated to 'Expédié'.`);
  } catch (error) {
    return res.status(500).send("Something went wrong: " + error.message);
  }
});
 exports.annulerColis = async (req, res) => {
  try {
    const {idColis,commentaire}=req.body
    console.log('ID du colis recherché:', idColis); // Ajoutez ce log

    // Recherche du colis dans la base de données
    const colis = await Colis.findById(idColis);
    console.log("Colis recherché:", colis); // Ajoutez ce log

    // Vérification si le colis existe
    if (!colis) {
      return res.status(404).json({ message: 'Colis non trouvé' });
    }

    // Vérification si le colis peut être annulé (par exemple, s'il n'est pas expédié ou livré)
    if (colis.statut === 'Expédié' || colis.statut === 'Livré') {
      return res.status(400).json({ message: 'Impossible d\'annuler un colis déjà expédié ou livré' });
    }

    // Mise à jour du statut du colis à "Annulé"
    colis.statut = 'Annulé';
    colis.commentaire=commentaire
    await colis.save();
    // **Mise à jour du Suivi_Colis avec le statut "Annulé"**
    let suivi_colis = await Suivi_Colis.findOne({ id_colis: colis._id });
    if (!suivi_colis) {
      // Créer une nouvelle entrée Suivi_Colis si elle n'existe pas
      suivi_colis = new Suivi_Colis({
        id_colis: colis._id,
        code_suivi: colis.code_suivi,
        status_updates: [{ status: 'Annulé', date: new Date() }],
      });
    } else {
      // Ajouter une nouvelle mise à jour de statut
      suivi_colis.status_updates.push({ status: 'Annulé', date: new Date() });
    }

    await suivi_colis.save();

    // Réponse avec succès
    return res.status(200).json({ message: 'Colis annulé avec succès', colis });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur lors de l\'annulation du colis' });
  }
};




// Controller function to group by store and show data per day
exports.createFactureByClient = async (req, res) => {
  try {
    // Query the database for colis where store is not null and statut is 'Livrée'
    const colis = await Colis.find({
      store: { $ne: null }, // Store should not be null
      statut: 'Livrée',     // Statut should be 'Livrée'
    })
      .select('code_suivi store ville statut prix')  // Select only specific fields
      .populate('store')  // Populate store to show its name field
      .populate('ville'); // Populate ville to show its name field (assuming ville also has a name field)

    // If no colis found
    if (!colis.length) {
      return res.status(404).json({ message: 'No delivered colis found' });
    }

    // Return the found colis
    res.status(200).json(colis);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });

  }
};
