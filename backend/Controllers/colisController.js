// controllers/colisController.js

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
const Notification_User = require("../Models/Notification_User");
const shortid = require('shortid');
const NotificationUser = require("../Models/Notification_User");
const { log } = require("console");
const axios = require('axios');
const { NoteColis } = require("../Models/NoteColis");

// Utility function to generate a unique code_suivi
const generateCodeSuivi = (refVille) => {
  const currentDate = new Date(); // Get the current date
  const formattedDate = currentDate.toISOString().slice(0, 10).replace(/-/g, ''); // Format date as YYYYMMDD
  const randomNumber = shortid.generate().slice(0, 6).toUpperCase(); // Shorten and uppercase for readability
  return `${refVille}${formattedDate}-${randomNumber}`;
};

/**
 * -------------------------------------------------------------------
 * @desc     Create new colis
 * @route    /api/colis/user/:id_user
 * @method   POST
 * @access   private (only logged in user)
 * -------------------------------------------------------------------
**/
module.exports.CreateColisCtrl = asyncHandler(async (req, res) => {
  // Check if request body is provided
  if (!req.body) {
    return res.status(400).json({ message: "Les données de votre colis sont manquantes" });
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
    code_suivi = generateCodeSuivi(ville.ref);
    const existingColis = await Colis.findOne({ code_suivi });
    if (!existingColis) {
      isUnique = true;
    }
  }

  // Prepare new Colis data
  const colisData = {
    ...req.body,
    store,
    team,
    ville: ville._id,  // Add the ville reference
    code_suivi,
  };

  // Create and save the new Colis
  const newColis = new Colis(colisData);
  const saveColis = await newColis.save();

  // Populate store, team, and ville data
  await saveColis.populate('store');
  await saveColis.populate('team');
  await saveColis.populate('ville');

  // Verify that code_suivi is not null before proceeding
  if (!saveColis.code_suivi) {
    return res.status(500).json({ message: "Internal server error: code_suivi is null" });
  }

  // --------------------------
  // Create the associated NoteColis document
  // --------------------------
  const newNoteColis = new NoteColis({ colis: saveColis._id });
  await newNoteColis.save();

  // Create a notification for the user when a new colis is added
  if (saveColis.store) {
    try {
      const notification = new Notification_User({
        id_store: store,
        colisId: saveColis._id,
        title: 'Nouvelle colis',
        description: `Un nouveau colis avec le code de suivi ${saveColis.code_suivi} est en attente de Ramassage.`,
      });
      await notification.save();  // Save the notification
    } catch (error) {
      console.log(error);
      // Continue without failing the request
    }
  }

  // Create and save the new Suivi_Colis
  const suivi_colis = new Suivi_Colis({
    id_colis: saveColis._id,
    code_suivi: saveColis.code_suivi,
    date_create: saveColis.createdAt,
    status_updates: [
      { status: "Attente de Ramassage", date: new Date() }  // Initial status
    ]
  });
  const save_suivi = await suivi_colis.save();

  // Respond with both the saved Colis and Suivi_Colis
  res.status(201).json({
    message: 'Colis créé avec succès, merci',
    colis: saveColis,
    suiviColis: save_suivi,
  });
});
/**
 * -------------------------------------------------------------------
 * @desc     Create new colis from admin
 * @route    /api/colis/admin/:storeId
 * @method   POST
 * @access   private (only logged in user)
 * -------------------------------------------------------------------
**/

module.exports.CreateColisAdmin = asyncHandler(async (req, res) => {
  // Check if request body is provided
  if (!req.body) {
    return res.status(400).json({ message: "Les données de votre colis sont manquantes" });
  }

  // Extract store and team information
  let store = req.params.storeId || null;  // Assuming req.user.store should be used

  // Validate and fetch the ville by its ID from the request body
  const ville = await Ville.findOne({ nom: req.body.ville });
  if (!ville) {
    return res.status(400).json({ message: "Ville not found" });
  }

  // Generate a unique code_suivi
  let code_suivi;
  let isUnique = false;
  while (!isUnique) {
    code_suivi = generateCodeSuivi(ville.ref);
    const existingColis = await Colis.findOne({ code_suivi });
    if (!existingColis) {
      isUnique = true;
    }
  }

  // Prepare new Colis data
  const colisData = {
    ...req.body,
    store,
    ville: ville._id,  // Add the ville reference
    code_suivi,
  };

  // Create and save the new Colis
  const newColis = new Colis(colisData);
  const saveColis = await newColis.save();

  // Populate store, team, and ville data
  await saveColis.populate('store');
  await saveColis.populate('team');
  await saveColis.populate('ville');

  // Verify that code_suivi is not null before proceeding
  if (!saveColis.code_suivi) {
    return res.status(500).json({ message: "Internal server error: code_suivi is null" });
  }

  // Create the associated NoteColis document
  const newNoteColis = new NoteColis({ colis: saveColis._id });
  await newNoteColis.save();

  // Create a notification for the user when a new colis is added
  if (saveColis.store) {
    try {
      const notification = new Notification_User({
        id_store: store,
        colisId: saveColis._id,
        title: 'Nouvelle colis',
        description: `Un nouveau colis avec le code de suivi ${saveColis.code_suivi} est en attente de Ramassage.`,
      });
      await notification.save();  // Save the notification
    } catch (error) {
      console.log(error);
      // Continue without failing the request
    }
  }

  // Create and save the new Suivi_Colis
  const suivi_colis = new Suivi_Colis({
    id_colis: saveColis._id,
    code_suivi: saveColis.code_suivi,
    date_create: saveColis.createdAt,
    status_updates: [
      { status: "Attente de Ramassage", date: new Date() }  // Initial status
    ]
  });

  const save_suivi = await suivi_colis.save();

  // Respond with both the saved Colis and Suivi_Colis
  res.status(201).json({
    message: 'Colis créé avec succès, merci ',
    colis: saveColis,
    suiviColis: save_suivi,
  });
});



/**
 * -------------------------------------------------------------------
 * @desc     Clone an existing colis by duplicating its data into a new colis
 * @route    /api/colis/clone/:id_colis
 * @method   POST
 * @access   Private (only authenticated users)
 * -------------------------------------------------------------------
 **/
module.exports.CloneColisCtrl = asyncHandler(async (req, res) => {
  let { id_colis } = req.params;

  let existingColis;
  // Check if id_colis is a valid ObjectId
  if (mongoose.Types.ObjectId.isValid(id_colis)) {
    existingColis = await Colis.findById(id_colis)
      .populate('ville')
      .populate('livreur')
      .populate('store')
      .populate('team');
  }
  // If not valid as ObjectId, try to search by code_suivi
  if (!existingColis) {
    existingColis = await Colis.findOne({ code_suivi: id_colis })
      .populate('ville')
      .populate('livreur')
      .populate('store')
      .populate('team');
  }

  if (!existingColis) {
    return res.status(404).json({ message: "Colis non trouvé." });
  }

  // Generate a unique code_suivi for the new colis
  let code_suivi;
  let isUnique = false;
  while (!isUnique) {
    code_suivi = generateCodeSuivi(existingColis.ville.ref); // Adjust as needed
    const existing = await Colis.findOne({ code_suivi });
    if (!existing) {
      isUnique = true;
    }
  }

  // Prepare new Colis data based on the existing one
  const colisData = {
    nom: existingColis.nom,
    tele: existingColis.tele,
    ville: existingColis.ville,
    adresse: existingColis.adresse,
    commentaire: existingColis.commentaire,
    prix: existingColis.prix,
    nature_produit: existingColis.nature_produit,
    ouvrir: existingColis.ouvrir,
    is_remplace: existingColis.is_remplace,
    is_fragile: existingColis.is_fragile,
    store: existingColis.store,
    team: null, // Or assign to current user's team if needed
    code_suivi: code_suivi,
    livreur: null, // Exclude the livreur data
    // Optionally, add other fields as necessary
  };

  // Optionally link the new colis to the original one
  // colisData.originalColis = existingColis._id;

  // Create and save the new Colis
  const newColis = new Colis(colisData);
  const savedColis = await newColis.save();

  // Populate store, team, and ville data
  await savedColis.populate('store');
  await savedColis.populate('team');
  await savedColis.populate('ville');

  // Create the associated NoteColis document
  const newNoteColis = new NoteColis({ colis: savedColis._id });
  await newNoteColis.save();

  // Create a notification for the user when a new colis is added
  if (savedColis.store) {
    try {
      const notification = new Notification_User({
        id_store: savedColis.store._id,
        colisId: savedColis._id,
        title: 'Nouvelle colis',
        description: `Un nouveau colis avec le code de suivi ${savedColis.code_suivi} est en attente de Ramassage.`,
      });
      await notification.save();
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
    }
  }

  // Create and save the new Suivi_Colis for the new colis
  const suivi_colis = new Suivi_Colis({
    id_colis: savedColis._id,
    code_suivi: savedColis.code_suivi,
    date_create: savedColis.createdAt,
    status_updates: [
      { status: "Attente de Ramassage", date: new Date() }
    ]
  });

  const save_suivi = await suivi_colis.save();

  res.status(201).json({
    message: 'Colis cloné et créé avec succès.',
    colis: savedColis,
    suiviColis: save_suivi,
  });
});




// controllers/colisController.js


/**
 * -------------------------------------------------------------------
 * @desc     Create multiple colis without transactions
 * @route    /api/colis/multiple
 * @method   POST
 * @access   Private (only logged-in users)
 * -------------------------------------------------------------------
**/
module.exports.CreateMultipleColisCtrl = asyncHandler(async (req, res) => {
  try {
    // 1. Validate Request Body
    if (!req.body || !Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({ message: "Les données de vos colis sont manquantes ou invalides." });
    }

    // 2. Validate User and Extract Store & Team Information
    if (!req.user) {
      return res.status(400).json({ message: "Informations sur l'utilisateur manquantes." });
    }

    const store = req.user.store || null;  // Assuming req.user.store contains the store ObjectId
    const team = req.user.id;  // Assuming 'team' is the user ID

    const colisToInsert = [];
    const suiviColisToInsert = [];
    const notificationsToInsert = [];

    for (const [index, colisInput] of req.body.entries()) {
      // 3. Validate Each Colis Individually
      const { error } = validateRegisterColis(colisInput);
      if (error) {
        return res.status(400).json({ message: `Erreur de validation dans le colis à l'index ${index}: ${error.details[0].message}` });
      }

      // 4. Lookup Ville by Name
      const ville = await Ville.findOne({ nom: colisInput.ville });
      if (!ville) {
        return res.status(400).json({ message: `Ville avec le nom "${colisInput.ville}" non trouvée dans le colis à l'index ${index}.` });
      }

      // 5. Generate Unique code_suivi
      let code_suivi;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 5; // Prevent infinite loops

      while (!isUnique && attempts < maxAttempts) {
        code_suivi = generateCodeSuivi(ville.ref);
        const existingColis = await Colis.findOne({ code_suivi });
        if (!existingColis) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        return res.status(500).json({ message: `Impossible de générer un code_suivi unique pour le colis à l'index ${index}. Veuillez réessayer.` });
      }

      // 6. Prepare Colis Data
      const colisData = {
        ...colisInput,
        store,
        team,
        ville: ville._id,  // Store Ville ObjectId
        code_suivi,
      };

      // 7. Handle Colis Replacement if is_remplace is true
      if (colisInput.is_remplace) {
        const replacedCodeSuivi = colisInput.replacedColis; // Now expecting code_suivi

        if (!replacedCodeSuivi) {
          return res.status(400).json({ message: `Aucun code_suivi de colis à remplacer fourni pour le colis à l'index ${index}.` });
        }

        // Validate that the replacedColis code_suivi corresponds to a delivered Colis and not already replaced
        const oldColis = await Colis.findOne({
          code_suivi: replacedCodeSuivi,
          statut: 'Livrée',
          is_remplace: false,
        });

        if (!oldColis) {
          return res.status(400).json({
            message: `Le colis à remplacer avec le code_suivi "${replacedCodeSuivi}" est invalide (soit non livré, soit déjà remplacé) pour le colis à l'index ${index}.`,
          });
        }

        // Mark the old Colis as replaced
        oldColis.is_remplace = true;
        await oldColis.save();

        // Link the old Colis to the new Colis
        colisData.replacedColis = oldColis._id;
      }

      colisToInsert.push(colisData);

      // 8. Prepare Suivi_Colis Data
      suiviColisToInsert.push({
        id_colis: null, // To be updated after insertion
        code_suivi: code_suivi,
        date_create: new Date(),
        status_updates: [
          { status: "Attente de Ramassage", date: new Date() }
        ]
      });

      // 9. Prepare Notifications Data
      if (store) {
        notificationsToInsert.push({
          id_store: store,
          colisId: null, // To be updated after insertion
          title: 'Nouvelle colis',
          description: `Un nouveau colis avec le code de suivi ${code_suivi} est en attente de Ramassage.`,
          read: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    // 10. Insert Colis
    const insertedColis = await Colis.insertMany(colisToInsert);

    // 10.5 Create corresponding NoteColis documents for each inserted colis
    const noteColisToInsert = insertedColis.map(colis => ({ colis: colis._id }));
    const insertedNoteColis = await NoteColis.insertMany(noteColisToInsert);

    // 11. Update Suivi_Colis and Notifications with Colis IDs
    insertedColis.forEach((colis, idx) => {
      suiviColisToInsert[idx].id_colis = colis._id;
      if (notificationsToInsert[idx]) {
        notificationsToInsert[idx].colisId = colis._id;
      }
    });

    // 12. Insert Suivi_Colis
    const insertedSuiviColis = await Suivi_Colis.insertMany(suiviColisToInsert);

    // 13. Insert Notifications
    const insertedNotifications = await Notification_User.insertMany(notificationsToInsert);

    // 14. Respond with All Created Colis, Suivi_Colis, and NoteColis if needed
    res.status(201).json({
      message: 'Colis créés avec succès.',
      colis: insertedColis,
      suiviColis: insertedSuiviColis,
      notifications: insertedNotifications,
      noteColis: insertedNoteColis,
    });

  } catch (error) {
    console.error('Erreur lors de la création multiple des colis:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});




/**
 * -------------------------------------------------------------------
 * @desc     Get all colis, filter based on user role and optional store, ville, statut, livreur, and date
 * @route    /api/colis/
 * @method   GET
 * @access   Private (only logged-in users)
 * -------------------------------------------------------------------
 **/
module.exports.getAllColisCtrl = asyncHandler(async (req, res) => {
  try {
    const { statut, store, ville, livreur, dateFrom, dateTo, dateRange } = req.query; // Extract query params
    const user = req.user; // Extract user information from request (set by verifyToken middleware)

    let filter = {};

    // Role-based filtering
    switch (user.role) {
      case 'admin':
        // Admin can see all colis; additional store filter if provided
        if (store) {
          filter.store = store;
        }
        break;

      case 'livreur':
        // Livreur can see only colis assigned to them
        filter.livreur = user.id;
        break;

      case 'client':
        // Client can see only colis associated with their store
        if (user.store) {
          filter.store = user.store;
        } else {
          // If the client doesn't have a store associated, respond with an error
          return res.status(400).json({ message: "Client does not have an associated store." });
        }
        break;

      default:
        // For any other roles, deny access
        return res.status(403).json({ message: "Access denied: insufficient permissions." });
    }

    // Optional statut filtering
    if (statut) {
      filter.statut = statut;

      // Additional filtering based on statut
      if (statut === "attente de ramassage" || statut === "Ramassée") {
        filter.expedation_type = "eromax";
      }
    }

    // Optional ville filtering
    if (ville) {
      filter.ville = ville;
    }

    // **Optional livreur filtering**
    if (livreur) {
      filter.livreur = livreur;
    }

    // Date filtering based on dateRange or specific dateFrom/dateTo
    if (dateRange && dateRange !== 'custom') {
      // Dynamic date range based on dateRange parameter
      const now = new Date();
      let startDateDynamic;

      switch (dateRange) {
        case 'last_week':
          startDateDynamic = new Date();
          startDateDynamic.setDate(now.getDate() - 7);
          break;
        case 'last_2_weeks':
          startDateDynamic = new Date();
          startDateDynamic.setDate(now.getDate() - 14);
          break;
        case 'last_month':
          startDateDynamic = new Date();
          startDateDynamic.setMonth(now.getMonth() - 1);
          break;
        case 'last_2_months':
          startDateDynamic = new Date();
          startDateDynamic.setMonth(now.getMonth() - 2);
          break;
        case 'last_3_months':
          startDateDynamic = new Date();
          startDateDynamic.setMonth(now.getMonth() - 3);
          break;
        case 'last_6_months':
          startDateDynamic = new Date();
          startDateDynamic.setMonth(now.getMonth() - 6);
          break;
        default:
          // Default to last month if dateRange is invalid
          startDateDynamic = new Date();
          startDateDynamic.setMonth(now.getMonth() - 1);
      }

      filter.createdAt = {
        $gte: startDateDynamic,
        $lte: now,
      };
    } else if (dateFrom || dateTo) {
      // Custom date range filtering based on createdAt
      filter.createdAt = {}; // Assuming you want to filter based on creation date

      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        if (!isNaN(fromDate)) {
          filter.createdAt.$gte = fromDate;
        }
      }

      if (dateTo) {
        const toDate = new Date(dateTo);
        if (!isNaN(toDate)) {
          filter.createdAt.$lte = toDate;
        }
      }

      // Remove createdAt filter if invalid dates are provided
      if (Object.keys(filter.createdAt).length === 0) {
        delete filter.createdAt;
      }
    } else {
      // Default: only return colis from the last month
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filter.createdAt = { $gte: oneMonthAgo };
    }

    // Fetch colis based on the constructed filter
    const colis = await Colis.find(filter)
      .populate('team')        // Populate the team details
      .populate('livreur')     // Populate the livreur details
      .populate('store')       // Populate the store details
      .populate('ville')
      .sort({ updatedAt: -1 }); // Sort by updatedAt in descending order

    // Get total count for reference (optional since no pagination)
    const total = await Colis.countDocuments(filter);

    res.status(200).json({
      total,
      colis,
    });
  } catch (error) {
    console.error("Error fetching colis:", error);
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
module.exports.getColisByIdCtrl=asyncHandler(async(req,res)=>{
  const colis = await Colis.findById(req.params.id)
  .populate('team')        // Populate the team details
      .populate('livreur')     // Populate the livreur details
      .populate('store')       // Populate the store details
      .populate('ville')
      .sort({ updatedAt: -1 }); // Sort by updatedAt in descending order (most recent first)
  if(!colis){
      return res.status(404).json({message:"Colis not found"});
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
  const { code_suivi } = req.params;

  // Check if code_suivi is provided
  if (!code_suivi) {
    return res.status(400).json({ message: "Code suivi is required" });
  }

  try {
    // Find the colis by code_suivi
    const colis = await Colis.findOne({ code_suivi })
    .populate('team')        // Populate the team details
    .populate('livreur')     // Populate the livreur details
    .populate('store')       // Populate the store details
    .populate('ville')
    .sort({ updatedAt: -1 }); // Sort by updatedAt in descending order (most recent first)

    // If no colis found, return 404
    if (!colis) {
      return res.status(404).json({ message: "Colis not found" });
    }

    // Return the found colis
    return res.status(200).json(colis);

  } catch (error) {
    // Handle any other errors (e.g. database issues)
    console.error("Error fetching colis by code suivi:", error);
    return res.status(500).json({ message: "An error occurred while fetching the colis." });
  }
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
 * @desc     get colis by code suivi
 * @route    /api/colis/statu
 * @method   GET
 * @access   private (only logger in user )
 * -------------------------------------------------------------------
**/
exports.ChangeLivreurCtrl  = asyncHandler(async (req, res) => {

  const { id } = req.params; // Colis ID from route parameters
  const { newLivreurId } = req.body; // New Livreur ID from request body

  // 4. Check if the new Livreur exists
  const newLivreur = await Livreur.findById(newLivreurId);
  if (!newLivreur) {
    return res.status(404).json({ message: "New Livreur not found." });
  }

  // 5. Find the Colis by ID
  const colis = await Colis.findById(id).populate("livreur").populate("store");
  if (!colis) {
    return res.status(404).json({ message: "Colis not found." });
  }

  // 6. Update the Colis: Remove existing Livreur and expedation_type, then set new Livreur and expedation_type
  colis.livreur = newLivreurId;
  colis.expedation_type = "eromax";
  colis.statut = "Expediée";

  // 7. Save the updated Colis
  await colis.save();

  // 9. Create a notification for the store about the Livreur change
  if (colis.store) {
    try {
      const notification = new Notification_User({
        id_store: colis.store,
        colisId: colis._id,
        title: "Livreur changé",
        description: `Le livreur du colis avec le code de suivi ${colis.code_suivi} a été changé pour ${newLivreur.nom}.`,
      });
      await notification.save();
    } catch (error) {
      console.error("Failed to create notification:", error);
      // Continue without failing the request
    }
  }

  // 10. Populate the updated Livreur field for the response
  await colis.populate("livreur");

  // 11. Respond with the updated Colis
  res.status(200).json({
    message: "Livreur du colis mis à jour avec succès.",
    colis,
  });
});
/**
 * -------------------------------------------------------------------
 * @desc     get colis by code suivi
 * @route    /api/colis/statu
 * @method   GET
 * @access   private (only logger in user )
 * -------------------------------------------------------------------
**/
exports.getColisAmeexCtrl = asyncHandler(async (req, res) => {
  const colis = await Colis.find({expedation_type: 'ameex'})
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
  const { statut } = req.query;
  if (req.user.role === "team" || req.user.role === "admin") {
    filter.team = team;
  } else {
    filter.store = store;
  }
  if (statut) {
    filter.statut = statut;
  }
  if(statut == "attente de ramassage" || statut == "Ramassée"  ){
    filter.expedation_type = "eromax"
  }
  // Chaining populate to access id_client through store
  colis = await Colis.find(filter)
    .populate('team')
    .populate('livreur')
    .populate({
      path: 'store',
      populate: {
        path: 'id_client',
        select: '-password'
      }
    })
    .populate('ville')
    .sort({ updatedAt: -1 });

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
 * @desc     Update Colis by _id
 * @route    /api/colis/:id
 * @method   PUT
 * @access   Private
 * -------------------------------------------------------------------
 **/
module.exports.updateColis = asyncHandler(async (req, res) => {


  // Find and update Colis by _id
  const updatedColis = await Colis.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('ville')
    .populate('store')
    .populate('livreur');

  if (!updatedColis) {
    return res.status(404).json({ message: "Colis not found" });
  }

  res.status(200).json(updatedColis);
});

/**
 * -------------------------------------------------------------------
 * @desc     Update the `etat` attribute of Colis to true
 * @route    /api/colis/pret_payant/:id
 * @method   PATCH
 * @access   Private (only admin)
 * -------------------------------------------------------------------
 **/

module.exports.toggleColisPayant = asyncHandler(async (req, res) => {
  let identifier = req.params.id; // This can be an ObjectId or a code_suivi
  let colis;

  // Check if the identifier is a valid ObjectId
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    colis = await Colis.findById(identifier);
  }
  // If not, assume it's a code_suivi
  if (!colis) {
    colis = await Colis.findOne({ code_suivi: identifier });
  }

  if (!colis) {
    return res.status(404).json({ message: "Colis not found" });
  }

  // Toggle the 'pret_payant' boolean
  colis.pret_payant = !colis.pret_payant;

  // Save the updated colis
  const updatedColis = await colis.save();

  // Return the updated colis data
  res.status(200).json({
    message: "Colis modifié avec succès.",
    data: updatedColis,
  });
});

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
// controllers/colisController.js

module.exports.getSuiviColis = asyncHandler(async (req, res) => {
  try {
    // Find the colis by code_suivi
    const colis = await Colis.findOne({ code_suivi: req.params.code_suivi });

    if (!colis) {
      return res.status(404).json({ message: "S'il vous plaît vérifier le code de suivi" });
    }

    if (colis.expedation_type === 'ameex') {
      // Use Ameex API to get tracking data
      const code_suivi_ameex = colis.code_suivi_ameex;

      // Prepare Ameex API request
      const authId = process.env.AMEEX_API_ID || 3452;
      const authKey = process.env.AMEEX_API_KEY || "9435a2-921aa4-67fc55-ced90c-1bafbc";
      const headers = {
        'C-Api-Id': authId,
        'C-Api-Key': authKey,
        'Content-Type': 'application/json',
      };

      try {
        const ameexResponse = await axios.get(
          `https://api.ameex.app/customer/Delivery/Parcels/Tracking?ParcelCode=${code_suivi_ameex}`,
          { headers }
        );

        if (ameexResponse.status === 200) {
          const responseData = ameexResponse.data;
          if (responseData.api && responseData.api.type === 'success') {
            const trackingData = responseData.api.tracking;

            // Map the tracking data
            const statusUpdates = [];

            for (let key in trackingData) {
              if (trackingData.hasOwnProperty(key)) {
                const track = trackingData[key];
                const status = track.statut_name || track.statut;
                const timeInSeconds = parseInt(track.time);
                const date = new Date(timeInSeconds * 1000).toISOString();

                const statusUpdate = {
                  status: status,
                  date: date,
                };

                // If 'by_data' is present, include 'livreur' information
                if (track.by_data) {
                  const livreur = {
                    nom: track.by_data.NAME || track.by_data.name,
                    tele: track.by_data.PHONE || track.by_data.phone,
                    // Add other fields if needed
                  };
                  statusUpdate.livreur = livreur;
                }

                statusUpdates.push(statusUpdate);
              }
            }

            // Sort the statusUpdates by date
            statusUpdates.sort((a, b) => new Date(a.date) - new Date(b.date));

            // Construct the response object
            const suivi_colis = {
              id_colis: colis._id,
              code_suivi: colis.code_suivi,
              status_updates: statusUpdates,
            };

            res.status(200).json(suivi_colis);

          } else {
            return res.status(500).json({
              message: 'Erreur lors de la récupération des données de suivi d\'Ameex',
              details: responseData,
            });
          }
        } else {
          return res.status(500).json({
            message: 'Erreur lors de la récupération des données de suivi d\'Ameex',
            status: ameexResponse.status,
          });
        }
      } catch (error) {
        console.error('Error fetching tracking data from Ameex:', error.message);
        return res.status(500).json({
          message: 'Erreur lors de la récupération des données de suivi d\'Ameex',
          error: error.message,
        });
      }
    } else {
      // Use existing logic to get tracking data from Suivi_Colis collection
      const suivi_colis = await Suivi_Colis.findOne({ code_suivi: req.params.code_suivi })
        .populate({
          path: 'status_updates.livreur',
          select: '-password -__v',
        });

      if (!suivi_colis) {
        return res.status(404).json({ message: "S'il vous plaît vérifier le code de suivi" });
      }

      res.status(200).json(suivi_colis);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur du serveur interne", error: error.message });
  }
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

    // Affecter le livreur et mettre à jour le statut du colis
    colis.livreur = livreurId;
    colis.statut = 'Expediée';  // Update the status to 'Expediée'

    // Sauvegarder les modifications sur le colis
    await colis.save();

    // Récupérer le suivi de colis, ou en créer un nouveau s'il n'existe pas
    let suivi_colis = await Suivi_Colis.findOne({ id_colis: colis._id });

    if (!suivi_colis) {
      suivi_colis = new Suivi_Colis({
        id_colis: colisId,
        code_suivi: colis.code_suivi,
        status_updates: [
          { status: 'Expediée', date: new Date(), livreur: livreurId }  // Add 'livreur' field here
        ]
      });
    } else {
      // Ajouter une nouvelle mise à jour du statut avec le livreur affecté
      suivi_colis.status_updates.push({ status: 'Expediée', date: new Date(), livreur: livreurId });  // Add 'livreur' field here
    }

    // Sauvegarder les mises à jour du suivi de colis
    await suivi_colis.save();

    // Créer une notification pour le livreur
    const notification = new NotificationUser({
      id_livreur: livreurId,
      colisId: colisId,
      title: 'Nouveau Colis',
      description: `Bonjour, un nouveau colis a été affecté pour vous.`,
    });

    // Sauvegarder la notification
    await notification.save();

    // Envoyer une réponse avec les informations du livreur et du colis
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



module.exports.affecterLivreurMultipleByCodeSuivi = asyncHandler(async (req, res) => {
  const { codesSuivi, livreurId } = req.body; // Expecting an array of codesSuivi and a single livreurId

  try {
    // Validate input
    if (!Array.isArray(codesSuivi) || codesSuivi.length === 0) {
      return res.status(400).json({ message: "codesSuivi must be a non-empty array" });
    }

    if (!livreurId) {
      return res.status(400).json({ message: "livreurId is required" });
    }

    // Find the new livreur
    const newLivreur = await Livreur.findById(livreurId);
    if (!newLivreur) {
      return res.status(404).json({ message: "New Livreur not found" });
    }

    const results = [];

    // Iterate over each code_suivi to assign or reassign it to the new livreur
    for (const codeSuivi of codesSuivi) {
      try {
        // Retrieve the colis by its code_suivi
        const colis = await Colis.findOne({ code_suivi: codeSuivi });
        if (!colis) {
          results.push({ codeSuivi, message: "Colis not found" });
          continue; // Skip to the next codeSuivi
        }
        const oldLivreurId = colis.livreur;
        let isReassigned = false;

        if (oldLivreurId && oldLivreurId.toString() !== livreurId) {
          // Reassign to the new livreur
          const oldLivreur = await Livreur.findById(oldLivreurId);
          colis.livreur = livreurId;
          isReassigned = true;

          // **New Code: Clear `code_suivi_ameex` and set `expedition_type` to 'eromax'**
          colis.code_suivi_ameex = null; // Alternatively, you can set it to null: colis.code_suivi_ameex = null;
          colis.expedition_type = 'eromax';

          // Optionally, notify the old livreur about the reassignment
          if (oldLivreur) {
            const oldNotification = new NotificationUser({
              id_livreur: oldLivreurId,
              colisId: colis._id,
              title: 'Colis Réassigné',
              description: `Le colis avec le code de suivi ${colis.code_suivi} a été réassigné à un autre livreur.`,
            });
            await oldNotification.save();
          }
        } else if (!oldLivreurId) {
          // Assign to the new livreur
          colis.livreur = livreurId;
        } else {
          // Colis is already assigned to the same livreur
          results.push({
            codeSuivi,
            message: "Colis is already assigned to this Livreur",
            livreur: {
              nom: newLivreur.nom,
              tele: newLivreur.tele
            },
            colis: {
              code_suivi: colis.code_suivi,
              statut: colis.statut
            }
          });
          continue; // Skip to the next codeSuivi
        }

        // Update the status to 'Expediée'
        colis.statut = 'Expediée';
        await colis.save(); // Save the updated colis

        // Retrieve or create the suivi_colis
        let suivi_colis = await Suivi_Colis.findOne({ id_colis: colis._id });
        if (!suivi_colis) {
          suivi_colis = new Suivi_Colis({
            id_colis: colis._id,
            code_suivi: colis.code_suivi,
            status_updates: [
              { status: 'Expediée', date: new Date(), livreur: livreurId }
            ]
          });
        } else {
          // Add a new status update with the new livreur
          suivi_colis.status_updates.push({ status: 'Expediée', date: new Date(), livreur: livreurId });
        }
        await suivi_colis.save(); // Save the updated suivi_colis

        // Create a notification for the new livreur
        const notification = new NotificationUser({
          id_livreur: livreurId,
          colisId: colis._id,
          title: 'Nouveau Colis',
          description: `Bonjour, un nouveau colis a été affecté pour vous. Code de suivi: ${colis.code_suivi}`,
        });
        await notification.save(); // Save the notification

        // Add result to response data
        results.push({
          codeSuivi,
          message: isReassigned ? "Livreur reassigned successfully" : "Livreur assigned successfully",
          livreur: {
            nom: newLivreur.nom,
            tele: newLivreur.tele
          },
          colis: {
            code_suivi: colis.code_suivi,
            statut: colis.statut
          }
        });
      } catch (innerError) {
        console.error(`Error processing codeSuivi ${codeSuivi}:`, innerError);
        results.push({ codeSuivi, message: "Error processing this colis", error: innerError.message });
      }
    }

    // Send the response after processing all code_suivi
    res.status(200).json({ message: "Colis assignments completed", results });
  } catch (error) {
    console.error("Error assigning Livreur:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

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
  const livreurId = req.params.id_livreur;
  let filter = {};

  // Define the allowed statuses
  const allowedStatuses = [
    "Expediée",
    "Mise en Distribution",
    "Livrée",
    "Annulée",
    "Reçu",
    "Refusée",
    "Programmée",
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

  // Extract 'statut' from query parameters
  const { statut } = req.query;

  if (req.user.role === "livreur") {
    filter.livreur = livreurId;

    if (statut) {
      if (Array.isArray(statut)) {
        // If multiple 'statut' parameters are provided as an array
        filter.statut = { $in: statut };
      } else if (typeof statut === 'string' && statut.includes(',')) {
        // If 'statut' is a comma-separated string
        const statutArray = statut.split(',').map((s) => s.trim());
        filter.statut = { $in: statutArray };
      } else {
        // If a single 'statut' is provided
        filter.statut = statut;
      }
    } else {
      // If no 'statut' is provided, use the allowed statuses
      filter.statut = { $in: allowedStatuses };
    }
  }

  // Fetch colis based on the constructed filter
  colis = await Colis.find(filter)
    .populate('team')
    .populate('livreur')
    .populate('store')
    .populate('ville')
    .sort({ updatedAt: -1 });

  if (!colis || colis.length === 0) {
    return res.status(404).json({ message: "Colis not found" });
  }

  // Respond with the shape { colis: [...], total: number }
  res.status(200).json({
    colis,
    total: colis.length,
  });
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
    /* if (colis.statut === 'Expédié' || colis.statut === 'Livré') {
      return res.status(400).json({ message: 'Impossible d\'annuler un colis déjà expédié ou livré' });
    } */

    // Mise à jour du statut du colis à "Annulé"
    colis.statut = 'Annulé';
    colis.comment_annule=commentaire
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


exports.refuserColis = async (req, res) => {
  try {
    const { idColis, commentaire } = req.body;
    console.log('ID du colis recherché:', idColis);

    // Recherche du colis dans la base de données
    const colis = await Colis.findById(idColis);
    console.log("Colis recherché:", colis); // Ajoutez ce log

    // Vérification si le colis existe
    if (!colis) {
      return res.status(404).json({ message: 'Colis non trouvé' });
    }

    // Vérification si le colis peut être annulé (par exemple, s'il n'est pas expédié ou livré)
    if (colis.statut !== 'Expediée'||colis.statut !== 'Livrée') {
      return res.status(400).json({ message: 'Le colis ne peut être refusé que s\'il est expédié ou livré' });
    }
    // Recherche de la ville pour obtenir le tarif de refus
    const ville = await Ville.findOne({ ref: colis.ville });
    if (!ville) {
      return res.status(404).json({ message: 'Ville non trouvée pour ce colis' });
    }

    // Retrieve the associated store
    const store = await Store.findById(colis.store);
    if (!store) {
      return res.status(404).json({ message: 'Store non trouvé' });
    }
    //Ajuster pour la facture !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    store.solde -=ville.tarif_refus;
    await store.save(); // Save the updated store with the new balance

    // Mise à jour du statut du colis à "Annulé"
    colis.statut = 'Refusée';
    colis.comment_refuse=commentaire
    await colis.save();
    // **Mise à jour du Suivi_Colis avec le statut "Annulé"**
    let suivi_colis = await Suivi_Colis.findOne({ id_colis: colis._id });
    if (!suivi_colis) {
      // Créer une nouvelle entrée Suivi_Colis si elle n'existe pas
      suivi_colis = new Suivi_Colis({
        id_colis: colis._id,
        code_suivi: colis.code_suivi,
        status_updates: [{ status: 'Refusée', date: new Date() }],
      });
    } else {
      // Ajouter une nouvelle mise à jour de statut
      suivi_colis.status_updates.push({ status: 'Refusée', date: new Date() });
    }

    await suivi_colis.save();

    // Réponse avec succès
    return res.status(200).json({ message: 'Colis refusée avec succès', colis });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur lors de refus du colis' });
  }
};

exports.countColisLivre = async (req, res) => {
  try {
    // Count the number of colis with the status "Livré"
    const colisCount = await Colis.countDocuments({ statut: 'Livrée' });

    // Return the count in the response
    return res.status(200).json({ message: 'Nombre de colis livrés', count: colisCount });
  } catch (error) {
    console.error('Erreur lors du comptage des colis livrés:', error);
    return res.status(500).json({ message: 'Erreur serveur lors du comptage des colis livrés' });
  }
};


exports.countColisLivreByClient = async (req, res) => {
  try {
    const { storeId } = req.params; // Get storeId from request parameters

    // Aggregate query to count "Livré" colis for a specific store
    const countForStore = await Colis.aggregate([
      { $match: { statut: 'Livrée', store: storeId } }, // Filter by statut 'Livrée' and storeId
      {
        $group: {
          _id: "$store", // Group by storeId
          totalColis: { $count: {} }, // Count the total colis for this store
        }
      }
    ]);

    if (countForStore.length === 0) {
      return res.status(404).json({ message: 'Aucun colis livré trouvé pour ce magasin' });
    }

    // Return the result
    return res.status(200).json({
      message: 'Nombre de colis livrés pour le magasin',
      storeId: storeId,
      totalColis: countForStore[0].totalColis // The total count for this store
    });
  } catch (error) {
    console.error('Erreur lors du comptage des colis livrés pour le magasin:', error);
    return res.status(500).json({ message: 'Erreur serveur lors du comptage des colis livrés pour le magasin' });
  }
};



exports.countColisLivreByTeam = async (req, res) => {
  try {
    const { teamId } = req.params; // Get teamId from request parameters

    // Aggregate query to count "Livré" colis for a specific team
    const countForTeam = await Colis.aggregate([
      { $match: { statut: 'Livré', team: teamId } }, // Filter by statut 'Livré' and teamId
      {
        $group: {
          _id: "$team", // Group by team
          totalColis: { $count: {} }, // Count the total colis for this team
        }
      }
    ]);

    if (countForTeam.length === 0) {
      return res.status(404).json({ message: 'Aucun colis livré trouvé pour cette équipe' });
    }

    // Return the result
    return res.status(200).json({
      message: 'Nombre de colis livrés pour l\'équipe',
      teamId: teamId,
      totalColis: countForTeam[0].totalColis // The total count for this team
    });
  } catch (error) {
    console.error('Erreur lors du comptage des colis livrés pour l\'équipe:', error);
    return res.status(500).json({ message: 'Erreur serveur lors du comptage des colis livrés pour l\'équipe' });
  }
};


exports.countColisLivreByLivreur = async (req, res) => {
  try {
    const { livreurId } = req.params; // Get livreurId from request parameters

    // Aggregate query to count "Livré" colis for a specific livreur
    const countForLivreur = await Colis.aggregate([
      { $match: { statut: 'Livré', livreur: livreurId } }, // Filter by statut 'Livré' and livreurId
      {
        $group: {
          _id: "$livreur", // Group by livreur
          totalColis: { $count: {} }, // Count the total colis for this livreur
        }
      }
    ]);

    if (countForLivreur.length === 0) {
      return res.status(404).json({ message: 'Aucun colis livré trouvé pour ce livreur' });
    }

    // Return the result
    return res.status(200).json({
      message: 'Nombre de colis livrés pour le livreur',
      livreurId: livreurId,
      totalColis: countForLivreur[0].totalColis // The total count for this livreur
    });
  } catch (error) {
    console.error('Erreur lors du comptage des colis livrés pour le livreur:', error);
    return res.status(500).json({ message: 'Erreur serveur lors du comptage des colis livrés pour le livreur' });
  }
};


exports.countColis = async (req, res) => {
  try {
    // Aggregate query to count all colis except those with statut 'Livrée'
    const count = await Colis.aggregate([
      { $match: { statut: { $ne: 'Livrée' } } }, // Exclude colis that are delivered
      {
        $group: {
          _id: null, // Grouping all results together
          totalColis: { $count: {} } // Count the total colis
        }
      }
    ]);

    // If no colis found
    if (count.length === 0) {
      return res.status(200).json({ message: 'Aucun colis trouvé', totalColis: 0 });
    }

    // Return the result
    return res.status(200).json({
      message: 'Total de colis (excluant ceux livrés)',
      totalColis: count[0].totalColis // The total count of colis excluding 'Livrée'
    });
  } catch (error) {
    console.error('Erreur lors du comptage des colis:', error);
    return res.status(500).json({ message: 'Erreur serveur lors du comptage des colis' });
  }
};

exports.countColisByClinet = async (req, res) => {
  try {
    const { storeId } = req.params; // Get storeId from request parameters

    // Aggregate query to count colis for a specific store excluding those with statut 'Livrée'
    const countForStore = await Colis.aggregate([
      { $match: { statut: { $ne: 'Livrée' }, store: storeId } }, // Exclude delivered colis for the specific store
      {
        $group: {
          _id: "$store", // Group by storeId
          totalColis: { $count: {} } // Count the total colis for this store
        }
      }
    ]);

    // If no colis found
    if (countForStore.length === 0) {
      return res.status(200).json({ message: 'Aucun colis trouvé pour ce magasin', totalColis: 0 });
    }

    // Return the result
    return res.status(200).json({
      message: 'Total de colis (excluant ceux livrés) pour le magasin',
      storeId: storeId,
      totalColis: countForStore[0].totalColis // The total count for this store
    });
  } catch (error) {
    console.error('Erreur lors du comptage des colis par magasin:', error);
    return res.status(500).json({ message: 'Erreur serveur lors du comptage des colis par magasin' });
  }
};


exports.countColisByTeam = async (req, res) => {
  try {
    const { teamId } = req.params; // Get teamId from request parameters

    // Aggregate query to count colis for a specific team excluding those with statut 'Livrée'
    const countForTeam = await Colis.aggregate([
      { $match: { statut: { $ne: 'Livrée' }, team: teamId } }, // Exclude delivered colis for the specific team
      {
        $group: {
          _id: "$team", // Group by teamId
          totalColis: { $count: {} } // Count the total colis for this team
        }
      }
    ]);

    // If no colis found
    if (countForTeam.length === 0) {
      return res.status(200).json({ message: 'Aucun colis trouvé pour cette équipe', totalColis: 0 });
    }

    // Return the result
    return res.status(200).json({
      message: 'Total de colis (excluant ceux livrés) pour l\'équipe',
      teamId: teamId,
      totalColis: countForTeam[0].totalColis // The total count for this team
    });
  } catch (error) {
    console.error('Erreur lors du comptage des colis par équipe:', error);
    return res.status(500).json({ message: 'Erreur serveur lors du comptage des colis par équipe' });
  }
};


exports.countColisByLivreur = async (req, res) => {
  try {
    const { livreurId } = req.params; // Get livreurId from request parameters

    // Aggregate query to count colis for a specific livreur excluding those with statut 'Livrée'
    const countForLivreur = await Colis.aggregate([
      { $match: { statut: { $ne: 'Livrée' }, livreur: livreurId } }, // Exclude delivered colis for the specific livreur
      {
        $group: {
          _id: "$livreur", // Group by livreurId
          totalColis: { $count: {} } // Count the total colis for this livreur
        }
      }
    ]);

    // If no colis found
    if (countForLivreur.length === 0) {
      return res.status(200).json({ message: 'Aucun colis trouvé pour ce livreur', totalColis: 0 });
    }

    // Return the result
    return res.status(200).json({
      message: 'Total de colis (excluant ceux livrés) pour le livreur',
      livreurId: livreurId,
      totalColis: countForLivreur[0].totalColis // The total count for this livreur
    });
  } catch (error) {
    console.error('Erreur lors du comptage des colis par livreur:', error);
    return res.status(500).json({ message: 'Erreur serveur lors du comptage des colis par livreur' });
  }
};

// Controller function to delete all colis with expedation_type = 'ameex'
exports.deleteAllAmeexColis = asyncHandler(async (req, res) => {
  try {
    // Optional: Check if the user is authorized to perform this action
    // For example, ensure that the user has admin privileges
    /*
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
      */

    // Confirm the action (if called from frontend, you can implement a confirmation step)
    // For API, ensure that the request is intentional

    // Delete all colis with expedation_type = 'ameex'
    const result = await Colis.deleteMany({ expedation_type: 'ameex' });

    res.status(200).json({
      message: `${result.deletedCount} colis with expedation_type 'ameex' have been deleted.`,
    });
  } catch (error) {
    console.error('Error deleting colis:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});



/* -------------        crbt section      ------------ */



/**
 * Controller to retrieve all CRBT information details for all Colis.
 *
 * This function:
 * - Queries the database for all Colis documents.
 * - Selects only the necessary fields: id_Colis, code_suivi, crbt, ville, and store.
 * - Populates the 'ville' and 'store' fields to include detailed information.
 * - Returns the list of Colis with their CRBT details.
 *
 * Example endpoint: GET /api/colis/crbt
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getAllCrbtInfo = async (req, res) => {
  try {
    // Extract the user's role and store from the token (assumed to be added to req.user)
    const role = req.user.role;
    let filter = {};

    // Build filter based on the user's role.
    if (role === 'admin') {
      // For admin, no additional filtering is applied.
      filter = {};
    } else if (role === 'client') {
      // For client, filter by the client's store.
      filter.store = req.user.store;
    }

     // Add a constant filter for statu_final: only "Livrée" or "Refusée" should be returned.
     filter.statu_final = { $in: ["Livrée", "Refusée"] };

    // Query the database for Colis documents using the filter.
    // Selecting only the necessary fields and populating 'ville' and 'store' for detailed info.
    const colisList = await Colis.find(filter)
      .select('id_Colis statu_final prix code_suivi crbt ville store')
      .populate('ville')  // Populate the 'ville' field with its associated document.
      .populate('store'); // Populate the 'store' field with its associated document.

    // Get the count of the returned documents.
    const count = colisList.length;

    // If no Colis is found, return a message with an empty data array and count of zero.
    if (!colisList || count === 0) {
      return res.status(200).json({
        message: 'No colis with CRBT info found',
        count: 0,
        data: []
      });
    }

    // Return the list of Colis with their CRBT details along with the count.
    return res.status(200).json({
      message: 'All CRBT info retrieved successfully',
      count: count,
      data: colisList
    });
  } catch (error) {
    // Log and return a 500 error response in case of a server error.
    console.error('Error retrieving all CRBT info:', error);
    return res.status(500).json({
      message: 'Server error while retrieving CRBT info',
      error: error.message,
    });
  }
};



/**
 * Controller to retrieve CRBT info details for a specific Colis.
 * The Colis can be found either by its ObjectId or by its code_suivi.
 *
 * This function:
 * - Extracts the identifier (either ObjectId or code_suivi) from the URL parameters.
 * - Checks if the identifier is a valid ObjectId using mongoose.Types.ObjectId.isValid().
 * - Builds a query accordingly.
 * - Finds the colis document, selecting only the fields: id_Colis, code_suivi, crbt, ville, and store.
 * - Populates the 'ville' and 'store' fields.
 *
 * Example endpoint: GET /api/colis/crbt/:identifier
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getCrbtInfoDetail = async (req, res) => {
  try {
    // Extract the identifier from request parameters.
    // This identifier can be either a MongoDB ObjectId or a code_suivi string.
    const { colisId } = req.params;

    let query;
    // Check if the identifier is a valid ObjectId.
    if (mongoose.Types.ObjectId.isValid(colisId)) {
      // If valid, query by _id.
      query = { _id: colisId };
    } else {
      // Otherwise, assume it's a code_suivi.
      query = { code_suivi: colisId };
    }

    // Find the colis document with the specified query,
    // selecting only the desired fields and populating 'ville' and 'store'.
    const colis = await Colis.findOne(query)
      .select('id_Colis statu_final prix code_suivi crbt ville store')
      .populate('ville')  // Populates the 'ville' field with the associated document.
      .populate('store'); // Populates the 'store' field with the associated document.

    // If no colis is found, return a 404 error response.
    if (!colis) {
      return res.status(404).json({ message: 'Colis not found' });
    }

    // Return the retrieved colis data with a success response.
    return res.status(200).json({
      message: 'CRBT info retrieved successfully',
      data: colis,
    });
  } catch (error) {
    // Log the error and return a 500 error response.
    console.error('Error retrieving CRBT info detail:', error);
    return res.status(500).json({
      message: 'Server error while retrieving CRBT info detail',
      error: error.message,
    });
  }
};
/**
 * Controller to update the CRBT attribute of a specific Colis.
 *
 * This function:
 * - Extracts the colis ID from the URL parameters.
 * - Expects a CRBT object in the request body containing fields like:
 *   prix_colis, tarif_livraison, tarif_refuse, tarif_fragile, tarif_supplementaire,
 *   prix_a_payant, and total_tarif.
 * - Updates the colis document with the new CRBT information.
 *
 * Example endpoint: PUT /api/colis/:colisId/crbt
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.updateCrbtInfo = async (req, res) => {
  try {
    // Extract colisId from request parameters
    const { colisId } = req.params;

    // Extract the CRBT data from the request body.
    const { crbt } = req.body;

    // Validate that the CRBT object is provided in the request body.
    if (!crbt || typeof crbt !== 'object') {
      return res.status(400).json({
        message: 'Invalid CRBT data provided. It should be an object.',
      });
    }

    // Update the colis document with the new CRBT information.
    // The { new: true } option returns the updated document after the update.
    const updatedColis = await Colis.findByIdAndUpdate(
      colisId,
      { crbt: crbt },
      { new: true }
    );

    // If no colis is found with the provided ID, return a 404 error response.
    if (!updatedColis) {
      return res.status(404).json({ message: 'Colis not found' });
    }

    // Return the updated colis document with a success message.
    return res.status(200).json({
      message: 'CRBT information updated successfully',
      data: updatedColis,
    });
  } catch (error) {
    // Log the error and return a 500 error response.
    console.error('Error updating CRBT info:', error);
    return res.status(500).json({
      message: 'Server error while updating CRBT info',
      error: error.message,
    });
  }
};


/**
 * Controller to fix/recalculate the CRBT values for a specific Colis.
 *
 * This function:
 * - Expects a `code_suivi` parameter in the URL.
 * - Finds the Colis document with the matching `code_suivi`.
 * - Verifies that the colis has a statu_final of either "Livrée" or "Refusée".
 * - For "Livrée":
 *      - If crbt.prix_colis is zero, use colis.prix as the base price.
 *      - If crbt.tarif_livraison is zero, use colis.ville.tarif (if available) as the delivery tariff.
 *      - Then, total_tarif = tarif_livraison + tarif_refuse + tarif_fragile + tarif_supplementaire
 *        and prix_a_payant = base price - total_tarif.
 * - For "Refusée":
 *      - Compute total_tarif as above.
 *      - Set prix_a_payant = -total_tarif.
 * - Saves the updated Colis document and returns the updated data.
 *
 * Example endpoint: PUT /api/colis/fix-crbt/:code_suivi
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.fixCrbtForColis = async (req, res) => {
  try {
    const { code_suivi } = req.params;
    if (!code_suivi) {
      return res.status(400).json({ message: "code_suivi parameter is required" });
    }

    // Find the colis using the provided code_suivi and populate the 'ville' field.
    const colis = await Colis.findOne({ code_suivi }).populate('ville');
    if (!colis) {
      return res.status(404).json({ message: "Colis not found" });
    }

    // If statu_final is null, check the Suivi_Colis model for updates
    if (!colis.statu_final) {
      const suivi = await Suivi_Colis.findOne({ id_colis: colis._id });

      if (suivi) {
        // Look for a status update that is "Livrée" or "Refusée"
        const statusUpdate = suivi.status_updates.find(update =>
          update.status === "Livrée" || update.status === "Refusée"
        );

        if (statusUpdate) {
          // If found, update the statu_final field of colis
          colis.statu_final = statusUpdate.status;
          await colis.save(); // Save the updated colis
        }
      }
    }

    // Verify that the colis has a statu_final of either "Livrée" or "Refusée"
    if (colis.statu_final !== "Livrée" && colis.statu_final !== "Refusée") {
      return res.status(400).json({
        message: "CRBT fix is allowed only for colis with statu_final 'Livrée' or 'Refusée'"
      });
    }

    // Ensure the CRBT object exists
    if (!colis.crbt) {
      return res.status(400).json({ message: "CRBT data not found for this colis" });
    }

    // Retrieve individual tariff values from CRBT (defaulting to 0 if not present).
    let prixColis = colis.crbt.prix_colis || 0;
    let tarifLivraison = colis.crbt.tarif_livraison || 0;
    let tarifRefuse = colis.crbt.tarif_refuse || 0;
    let tarifFragile = colis.crbt.tarif_fragile || 0;
    let tarifSupplementaire = colis.crbt.tarif_supplementaire || 0;

    let totalTarif, prixAPayant;

    if (colis.statu_final === "Refusée") {
      // For a refused colis:
      if (prixColis === 0) {
        prixColis = colis.prix || 0;
        colis.crbt.prix_colis = prixColis;
      }
      tarifLivraison = 0;
      colis.crbt.tarif_livraison = 0;
      if (tarifRefuse === 0 && colis.ville && colis.ville.tarif_refus) {
        tarifRefuse = colis.ville.tarif_refus;
        colis.crbt.tarif_refuse = tarifRefuse;
      }
      totalTarif = tarifLivraison + tarifRefuse + tarifFragile + tarifSupplementaire;
      prixAPayant = - totalTarif;
    } else {
      // For a delivered colis ("Livrée")
      if (prixColis === 0) {
        prixColis = colis.prix || 0;
        colis.crbt.prix_colis = prixColis;
      }
      if (tarifLivraison === 0 && colis.ville && colis.ville.tarif) {
        tarifLivraison = colis.ville.tarif;
        colis.crbt.tarif_livraison = tarifLivraison;
      }
      totalTarif = tarifLivraison + tarifRefuse + tarifFragile + tarifSupplementaire;
      prixAPayant = prixColis - totalTarif;
    }

    // Update the CRBT fields.
    colis.crbt.total_tarif = totalTarif;
    colis.crbt.prix_a_payant = prixAPayant;

    // Save the updated Colis document.
    await colis.save();

    // Return the updated Colis document.
    return res.status(200).json({
      message: "CRBT data updated successfully",
      data: colis,
    });
  } catch (error) {
    console.error("Error fixing CRBT for colis:", error);
    return res.status(500).json({
      message: "Server error while updating CRBT data",
      error: error.message,
    });
  }
};

/**
 * -------------------------------------------------------------------
 * @desc     Update tarif_ajouter for a specific colis
 * @route    /api/colis/tarif/:identifier
 * @method   PUT
 * @access   private (only admin)
 * -------------------------------------------------------------------
 **/
exports.updateTarifAjouter = async (req, res) => {
  try {
    const { identifier } = req.params;
    const { value, description } = req.body;

    // Validate the input
    if (typeof value !== 'number') {
      return res.status(400).json({ message: "Value must be a number" });
    }

    // Find the colis either by ID or code_suivi and populate ville and store
    let colis;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      colis = await Colis.findById(identifier).populate('ville').populate('store');
    } else {
      colis = await Colis.findOne({ code_suivi: identifier }).populate('ville').populate('store');
    }

    if (!colis) {
      return res.status(404).json({ message: "Colis not found" });
    }

    // Store the old tarif_ajouter value for comparison
    const oldTarifAjouter = colis.tarif_ajouter ? colis.tarif_ajouter.value || 0 : 0;

    // Update the tarif_ajouter field
    colis.tarif_ajouter = {
      value: value,
      description: description || '' // Use empty string if description is not provided
    };

    // Check if colis has a final status and recalculate CRBT if needed
    if (colis.statu_final === "Livrée" || colis.statu_final === "Refusée") {
      // Ensure CRBT object exists
      if (!colis.crbt) {
        colis.crbt = {
          prix_colis: 0,
          tarif_livraison: 0,
          tarif_refuse: 0,
          tarif_fragile: 0,
          tarif_supplementaire: 0,
          prix_a_payant: 0,
          total_tarif: 0
        };
      }

      // Get existing values
      let prixColis = colis.crbt.prix_colis || colis.prix || 0;
      let tarifLivraison = colis.crbt.tarif_livraison || 0;
      let tarifRefuse = colis.crbt.tarif_refuse || 0;
      let tarifFragile = colis.is_fragile ? 5 : 0;

      // Update supplementary tarif with new value
      let tarifSupplementaire = value;

      // Calculate totals based on status
      let totalTarif, prixAPayant;

      if (colis.statu_final === "Refusée") {
        // For refused colis
        tarifLivraison = 0;
        if (tarifRefuse === 0 && colis.ville && colis.ville.tarif_refus) {
          tarifRefuse = colis.ville.tarif_refus;
        }
        totalTarif = tarifLivraison + tarifRefuse + tarifFragile + tarifSupplementaire;
        prixAPayant = -totalTarif;
      } else {
        // For delivered colis
        if (tarifLivraison === 0 && colis.ville && colis.ville.tarif) {
          tarifLivraison = colis.ville.tarif;
        }
        totalTarif = tarifLivraison + tarifRefuse + tarifFragile + tarifSupplementaire;
        prixAPayant = prixColis - totalTarif;
      }

      // Update CRBT fields
      colis.crbt = {
        ...colis.crbt,
        prix_colis: prixColis,
        tarif_livraison: tarifLivraison,
        tarif_refuse: tarifRefuse,
        tarif_fragile: tarifFragile,
        tarif_supplementaire: tarifSupplementaire,
        total_tarif: totalTarif,
        prix_a_payant: prixAPayant
      };
    }

    // Check if the colis has been processed for wallet and handle wallet update
    let transferCreated = null;
    if (colis.wallet_prosseced && colis.store) {
      // Import required models
      const { Wallet } = require('../Models/Wallet');
      const { Transfer } = require('../Models/Transfer');

      // Find the wallet associated with the store
      const wallet = await Wallet.findOne({ store: colis.store._id });

      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found for this store" });
      }

      if (!wallet.active) {
        return res.status(400).json({ message: "Wallet is not active" });
      }

      // Calculate the difference between new and old tarif_ajouter values
      const tarifDifference = value - oldTarifAjouter;

      // Only update wallet and create transfer if there's a change in value
      if (tarifDifference !== 0) {
        // Check if wallet has sufficient balance
        if (wallet.solde < tarifDifference) {
          return res.status(400).json({ message: "Insufficient wallet balance for tarif adjustment" });
        }

        // Create transfer object
        const transferData = {
          wallet: wallet._id,
          type: 'Manuel Withdrawal',
          montant: tarifDifference,
          commentaire: description || 'Ajustement de tarif supplémentaire',
          admin: req.user.id,
          status: 'validé'
        };

        // Create new transfer
        const transfer = new Transfer(transferData);

        // Update wallet balance (subtract for withdrawal)
        wallet.solde -= tarifDifference;

        // Save both documents
        await Promise.all([
          transfer.save(),
          wallet.save()
        ]);

        // Store the created transfer for response
        transferCreated = await Transfer.findById(transfer._id)
          .populate('wallet')
          .populate('admin', 'Nom Prenom email');
      }
    }

    // Save the updated colis
    await colis.save();

    // Return the updated colis and transfer if created
    const response = {
      message: "Tarif ajouter updated successfully",
      data: colis
    };

    if (transferCreated) {
      response.transfer = transferCreated;
      response.message += " and wallet balance adjusted";
    }

    res.status(200).json(response);

  } catch (error) {
    console.error("Error updating tarif_ajouter:", error);
    res.status(500).json({
      message: "Server error while updating tarif_ajouter",
      error: error.message
    });
  }
};

/**
 * -------------------------------------------------------------------
 * @desc     Get tarif_ajouter for a specific colis
 * @route    /api/colis/tarif/:identifier
 * @method   GET
 * @access   private (only admin)
 * -------------------------------------------------------------------
 **/
exports.getTarifAjouter = async (req, res) => {
  try {
    const { identifier } = req.params;

    // Find the colis either by ID or code_suivi
    let colis;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      colis = await Colis.findById(identifier);
    } else {
      colis = await Colis.findOne({ code_suivi: identifier });
    }

    if (!colis) {
      return res.status(404).json({ message: "Colis not found" });
    }

    // Return the tarif_ajouter information
    res.status(200).json({
      message: "Tarif ajouter retrieved successfully",
      data: {
        id: colis._id,
        code_suivi: colis.code_suivi,
        tarif_ajouter: colis.tarif_ajouter
      }
    });

  } catch (error) {
    console.error("Error retrieving tarif_ajouter:", error);
    res.status(500).json({
      message: "Server error while retrieving tarif_ajouter",
      error: error.message
    });
  }
};




/**
 * Réinitialise un colis et son suivi à l'état initial
 * @route PUT /api/colis/reset-all/:identifier
 */
exports.resetColisAndSuivi = async (req, res) => {
  try {
    const { identifier } = req.params;

    // Trouver le colis par id ou code_suivi
    let colis;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      colis = await Colis.findById(identifier);
    }
    if (!colis) {
      colis = await Colis.findOne({ code_suivi: identifier });
    }
    if (!colis) {
      return res.status(404).json({ message: "Colis non trouvé." });
    }

    // Réinitialisation des champs du colis
    colis.statut = "attente de ramassage";
    colis.livreur = null;
    colis.commentaire = null;
    colis.note = null;
    colis.comment_annule = null;
    colis.comment_refuse = null;
    colis.prix_payer = 0;
    colis.etat = false;
    colis.date_programme = null;
    colis.date_reporte = null;
    colis.date_livraisant = null;
    colis.code_suivi_ameex = null;
    colis.code_suivi_gdil = null;
    colis.expedation_type = 'eromax';
    colis.pret_payant = false;
    colis.tarif_ajouter = { value: 0, description: '' };
    colis.crbt = {
      prix_colis: 0,
      tarif_livraison: 0,
      tarif_refuse: 0,
      tarif_fragile: 0,
      tarif_supplementaire: 0,
      prix_a_payant: 0,
      total_tarif: 0
    };
    colis.statu_final = null;
    colis.produits = [];
    colis.wallet_prosseced = false;
    colis.replacedColis = null;
    colis.is_simple = true;

    await colis.save();

    // Réinitialisation du suivi colis
    let suiviColis = await Suivi_Colis.findOne({ id_colis: colis._id });
    if (suiviColis) {
      suiviColis.status_updates = [
        {
          status: "attente de ramassage",
          date: new Date()
        }
      ];
      await suiviColis.save();
    } else {
      suiviColis = new Suivi_Colis({
        id_colis: colis._id,
        code_suivi: colis.code_suivi,
        status_updates: [
          {
            status: "attente de ramassage",
            date: new Date()
          }
        ]
      });
      await suiviColis.save();
    }

    res.status(200).json({
      message: "Colis et suivi réinitialisés avec succès.",
      colis,
      suiviColis
    });
  } catch (error) {
    console.error("Erreur lors de la réinitialisation :", error);
    res.status(500).json({ message: "Erreur serveur lors de la réinitialisation." });
  }
};