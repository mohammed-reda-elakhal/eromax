const asyncHandler = require("express-async-handler");
const { Colis, validateRegisterColis } = require("../Models/Colis");
const { Suivi_Colis } = require("../Models/Suivi_Colis");
const crypto = require("crypto");
const { Client } = require("../Models/Client");
const {Store} =require("../Models/Store");
const { default: mongoose } = require("mongoose");
const { Livreur } = require("../Models/Livreur");
const { Team } = require("../Models/Team");


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
  if (!req.user ) {
    return res.status(400).json({ message: "Store information is missing in user data" });
  }
  
  // Extract store and team information
  let store = req.user.store || null; // Assuming req.user.store should be used
  let team = req.user.id;     // Assuming team is the user id

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
    code_suivi,
  });

  const saveColis = await newColis.save();

  // Populate store and team data
  await saveColis.populate('store');
  await saveColis.populate('team');

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
  });

  const save_suivi = await suivi_colis.save();

  // Respond with both the saved Colis and Suivi_Colis
  res.status(201).json({
    message : 'Colis est créer , merci ❤️',
    colis: saveColis,
    suiviColis: save_suivi
  });
});

/**
 * -------------------------------------------------------------------
 * @desc     get all colis
 * @route    /api/colis/
 * @method   GET
 * @access   private (only logger in user )
 * -------------------------------------------------------------------
**/
module.exports.getAllColisCtrl = asyncHandler(async (req, res) => {
  try {
    const colis = await Colis.find()
      .populate('team')        // Populate the team details
      .populate('livreur')     // Populate the livreur details
      .populate('store')       // Populate the store details
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
module.exports.getColisByIdCtrl=asyncHandler(async(req,res)=>{
    const colis = await Colis.findById(req.params.id);
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
    const colis = await Colis.findOne({ code_suivi: req.params.code_suivi });
    if (!colis) {
        return res.status(404).json({ message: "Colis not found" });
    }
    res.status(200).json(colis);
});

/**
 * -------------------------------------------------------------------
 * @desc     get colis by user or store
 * @route    /api/colis/:id_user
 * @method   GET
 * @access   private (only logger in user )
 * -------------------------------------------------------------------
**/
exports.getColisByUserOrStore = asyncHandler(async (req, res) => {
  let colis 
  let team = req.user.id
  let store = req.user.store
  if(req.user.role === "team" || req.user.role === "admin"){
    colis = await Colis.find({ team }).populate('team');
  }else{
    colis = await Colis.find({ store }).populate("store");
  }
  if (!colis) {
      return res.status(404).json({ message: "Colis not found" });
  }

  res.status(200).json(colis);
});


/**
 * 
 */
exports.getColisByClient=asyncHandler(async(req,res)=>{
   
  try{
    const clientId= req.params.id;
  const client = await Client.findById(clientId);

  if(!client){
    return res.status(404).json({message:"Cleint not Found"});

  }

  const colisList= await Colis.find({clientId:clientId});
  res.status(200).json({message:"Cleint fetched successfully",colis:colisList});

  }catch(err){
    console.error("Error fetching colis",err);
    res.status(500).json({message:"Internal Server error",error:err.message})
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
module.exports.deleteColis= asyncHandler(async(req,res)=>{
    const deletedColis = await Colis.findByIdAndDelete(req.params.id);
    if(!deletedColis){
        return res.status(404).json({message:"Colis not found"});
    }
    res.status(200).json({message:"Colis deleted succesfully"});
});

/**
 * -------------------------------------------------------------------
 * @desc     update colis 
 * @route    /api/colis/:id
 * @method   PUT
 * @access   private ( only admin )
 * -------------------------------------------------------------------
 **/
module.exports.updateColis= asyncHandler(async(req,res)=>{
    //input validation 
    const {error}=validateRegisterColis(req.body);
    if(error){
        return res.status(400).json({message:error.details[0].message});
    }
    const updatedColis = await Colis.findByIdAndUpdate(req.params.code_suivi,req.body,{new:true} );
    if(!updatedColis){
        return res.status(404).json({message:"Colis not found"});
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
  const suivi_colis = await Suivi_Colis.findOne({ id_colis:colis._id });

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
module.exports.getSuiviColis= asyncHandler(async(req,res)=>{
    const suivi_colis = await Suivi_Colis.findOne({ code_suivi: req.params.code_suivi });
    if (!suivi_colis) {
        return res.status(404).json({ message: "S'il vous pliz vérifier code de suivi" });
    }
    res.status(200).json(suivi_colis);
});


/**
 * get colis by Store 
 */


exports.getColisByStore= asyncHandler(async(req,res)=>{

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

    const colisList = await Colis.find({ store: storeId });

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

module.exports.affecterLivreur = async (req, res) => {
    const { colisId, livreurId } = req.body; // Assuming these are passed in the request body

    try {
        // Récupérer le colis par son ID
        const colis = await Colis.findById(colisId);

        if (!colis) {
            return res.status(404).json({ message: "Colis not found" });
        }

        // Vérifier si le statut est "expédié"
        if (colis.statut !== "expedié") {
            return res.status(400).json({ message: "Colis is not in the 'expédié' status" });
        }

        // Récupérer le livreur par son ID
        const livreur = await Livreur.findById(livreurId);

        if (!livreur) {
            return res.status(404).json({ message: "Livreur not found" });
        }

        // Affecter le livreur au colis
        colis.livreur = livreurId;

        // Sauvegarder les modifications
        await colis.save();
        const dataLiv = {
          Nom:livreur.nom,
          Tele:livreur.tele
      };
        res.status(200).json({ message: "Livreur assigned successfully", dataLiv });
    } catch (error) {
        console.error("Error assigning Livreur:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
module.exports.getColisByIdLivreur=asyncHandler(async(req,res)=>{

  const id_livreur= req.params.id_livreur
  if(!id_livreur){
    return res.status(400).json({ message: "Id Livreur no provided" });
  }
  const liv = Livreur.findById(id_livreur);
  if(!liv){
    return res.status(404).json({ message: "Livreur not found" });
  }
  const colisList= await Colis.find({livreur:id_livreur});
  res.status(200).json({ message: "Colis Fetched Successfully", colisList });


});
module.exports.getColisByTeam=asyncHandler(async(req,res)=>{

  const id_team= req.params.id_team;
  if(!id_team){
    return res.status(400).json({ message: "Id Team not provided" });
  }
  const team = Team.findById(id_team);
  if(!team){
    return res.status(404).json({ message: "Team not found" });
  }
  const colisList= await Colis.find({team:id_team});
  res.status(200).json({ message: "Colis Fetched Successfullt", colisList });


});



