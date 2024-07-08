const asyncHandler = require("express-async-handler");
const { Colis, validateRegisterColis } = require("../Models/Colis");
const { Suivi_Colis } = require("../Models/Suivi_Colis");

/**
 * -------------------------------------------------------------------
 * @desc     Create new colis
 * @route    /api/colis/
 * @method   POST
 * @access   private (only logger in user )
 * -------------------------------------------------------------------
 **/
module.exports.CreateColisCtrl = asyncHandler(async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "Les données de votre colis sont manquantes" });
  }

  // Input validation
  const { error } = validateRegisterColis(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // Create and save the new Colis
  // Add id_client and id_store from the token
  const id_client = req.user.id;
  const id_store = req.user.store;

  // Create and save the new Colis
  const newColis = new Colis({
      ...req.body,
      id_client,
      id_store
  });
  const saveColis = await newColis.save();

  // Create and save the new Suivi_Colis
  const suivi_colis = new Suivi_Colis({
    id_colis: newColis._id,
    code_suivi: newColis.code_suivi,
    date_create: newColis.createdAt,
  });
  const save_suivi = await suivi_colis.save();

  // Respond with both the saved Colis and Suivi_Colis
  res.status(201).json({ colis: saveColis, suiviColis: save_suivi });
});


/**
 * -------------------------------------------------------------------
 * @desc     get all colis
 * @route    /api/colis/
 * @method   GET
 * @access   private (only logger in user )
 * -------------------------------------------------------------------
**/
module.exports.getAllColisCtrl= asyncHandler(async(req,res)=>{
    const colis = await Colis.find();
    res.status(200).json(colis);
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
    "ramasser",
    "expidie", // affectation livreur and get data  ( nom , tele ) , autorisation
    "reçu",
    "mise en distribution",
    "livrée",
    "annulée",
    "programmée",
    "refusée",
  ];

  if (!validStatuses.includes(new_status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

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
module.exports.getSuiviColis= asyncHandler(async(req,res)=>{
    const suivi_colis = await Suivi_Colis.findOne({ code_suivi: req.params.code_suivi });
    if (!suivi_colis) {
        return res.status(404).json({ message: "S'il vous pliz vérifier code de suivi" });
    }
    res.status(200).json(suivi_colis);
})
