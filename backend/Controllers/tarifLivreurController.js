const asyncHandler = require('express-async-handler');
const { TarifLivreur, tarifLivreurValidation, tarifLivreurUpdateValidation } = require('../Models/Tarif_livreur');
const {Livreur} = require('../Models/Livreur');
const {Ville} = require('../Models/Ville');
const Joi = require('joi');

/**
 * @desc    Create a new TarifLivreur
 * @route   POST /api/tarif_livreur
 * @access  Admin
 */
const createTarifLivreur = asyncHandler(async (req, res) => {
    // **Validate Input**
    const { error, value } = tarifLivreurValidation(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { tarif, livreur, ville } = value;

    // **Check if Livreur Exists**
    const existingLivreur = await Livreur.findById(livreur);
    if (!existingLivreur) {
        return res.status(404).json({ message: "Livreur not found" });
    }

    // **Check if Ville Exists**
    const existingVille = await Ville.findById(ville);
    if (!existingVille) {
        return res.status(404).json({ message: "Ville not found" });
    }

    // **Optional: Prevent Duplicate TarifLivreur for the Same Livreur and Ville**
    const duplicate = await TarifLivreur.findOne({ id_livreur: livreur, id_ville: ville });
    if (duplicate) {
        return res.status(400).json({ message: "Tarif for this Livreur and Ville already exists" });
    }

    // **Create and Save TarifLivreur**
    const tarifLivreur = new TarifLivreur({
        tarif,
        id_livreur: livreur,
        id_ville: ville,
    });

    await tarifLivreur.save();

    res.status(201).json({
        message: "TarifLivreur created successfully",
        tarifLivreur,
    });
});

/**
 * @desc    Get all TarifLivreurs
 * @route   GET /api/tarif_livreur
 * @access  Admin
 */
const getAllTarifLivreurs = asyncHandler(async (req, res) => {
    const tarifLivreurs = await TarifLivreur.find()
        .populate('id_livreur', 'nom prenom tele') // Populate Livreur details
        .populate('id_ville'); // Populate Ville details

    res.status(200).json(tarifLivreurs);
});

/**
 * @desc    Get a single TarifLivreur by ID
 * @route   GET /api/tarif_livreur/:id
 * @access  Admin
 */
const getTarifLivreurById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // **Validate ID Format**
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid TarifLivreur ID format" });
    }

    const tarifLivreur = await TarifLivreur.findById(id)
        .populate('id_livreur', 'nom prenom tele') // Populate Livreur details
        .populate('id_ville', 'nom'); // Populate Ville details

    if (!tarifLivreur) {
        return res.status(404).json({ message: "TarifLivreur not found" });
    }

    res.status(200).json(tarifLivreur);
});

/**
 * @desc    Update a TarifLivreur by ID (partial fields)
 * @route   PUT /api/tarif_livreur/:id
 * @access  Admin
 */
const updateTarifLivreur = asyncHandler(async (req, res) => {
   // **Validate Input** (partial)
   const { error, value } = tarifLivreurUpdateValidation(req.body);
   if (error) {
     return res.status(400).json({ message: error.details[0].message });
   }
 
   // **Check if TarifLivreur Exists**
   const existingTarifLivreur = await TarifLivreur.findById(req.params.id);
   if (!existingTarifLivreur) {
     return res.status(404).json({ message: 'TarifLivreur not found' });
   }
 
   // We will build an `updateData` object only with the fields that were provided
   const updateData = {};
 
   // If `tarif` was provided, update it
   if (value.tarif !== undefined) {
     updateData.tarif = value.tarif;
   }
 
   // If `livreur` was provided, validate existence
   if (value.livreur) {
     const existingLivreur = await Livreur.findById(value.livreur);
     if (!existingLivreur) {
       return res.status(404).json({ message: 'Livreur not found' });
     }
     updateData.id_livreur = value.livreur;
   }
 
   // If `ville` was provided, validate existence
   if (value.ville) {
     const existingVille = await Ville.findById(value.ville);
     if (!existingVille) {
       return res.status(404).json({ message: 'Ville not found' });
     }
     updateData.id_ville = value.ville;
   }
 
   /**
    * Optional: Prevent Duplicate TarifLivreur for the same Livreur and Ville
    * Only check if both 'livreur' and 'ville' are among the updated fields
    */
   if (updateData.id_livreur && updateData.id_ville) {
     const duplicate = await TarifLivreur.findOne({
       _id: { $ne: req.params.id },
       id_livreur: updateData.id_livreur,
       id_ville: updateData.id_ville,
     });
     if (duplicate) {
       return res
         .status(400)
         .json({ message: 'Tarif for this Livreur and Ville already exists' });
     }
   }
 
   // **Perform the update**
   const updatedTarifLivreur = await TarifLivreur.findByIdAndUpdate(
     req.params.id,
     { $set: updateData }, // Only set the fields that were provided
     { new: true } // Return the updated document
   );
 
   res.status(200).json({
     message: 'TarifLivreur updated successfully',
     tarifLivreur: updatedTarifLivreur,
   });
 });

/**
 * @desc    Delete a TarifLivreur by ID
 * @route   DELETE /api/tarif_livreur/:id
 * @access  Admin
 */
const deleteTarifLivreur = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // **Validate ID Format**
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid TarifLivreur ID format" });
    }

    const tarifLivreur = await TarifLivreur.findById(id);
    if (!tarifLivreur) {
        return res.status(404).json({ message: "TarifLivreur not found" });
    }

    await tarifLivreur.remove();

    res.status(200).json({ message: "TarifLivreur deleted successfully" });
});

/**
 * @desc    Get TarifLivreur by Livreur ID
 * @route   GET /api/tarif_livreur/livreur/:livreurId
 * @access  Admin
 */
const getTarifLivreurByLivreur = asyncHandler(async (req, res) => {
    const { livreurId } = req.params;

    // **Validate Livreur ID Format**
    if (!livreurId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid Livreur ID format" });
    }

    // **Check if Livreur Exists**
    const existingLivreur = await Livreur.findById(livreurId);
    if (!existingLivreur) {
        return res.status(404).json({ message: "Livreur not found" });
    }

    // **Fetch TarifLivreur Records for the Livreur**
    const tarifLivreurs = await TarifLivreur.find({ id_livreur: livreurId })
        .populate('id_livreur', 'nom prenom tele') // Populate Livreur details
        .populate('id_ville', 'nom'); // Populate Ville details

    res.status(200).json(tarifLivreurs);
});

/**
 * @desc    Get TarifLivreur by Ville ID
 * @route   GET /api/tarif_livreur/ville/:villeId
 * @access  Admin
 */
const getTarifLivreurByVille = asyncHandler(async (req, res) => {
    const { villeId } = req.params;

    // **Validate Ville ID Format**
    if (!villeId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid Ville ID format" });
    }

    // **Check if Ville Exists**
    const existingVille = await Ville.findById(villeId);
    if (!existingVille) {
        return res.status(404).json({ message: "Ville not found" });
    }

    // **Fetch TarifLivreur Records for the Ville**
    const tarifLivreurs = await TarifLivreur.find({ id_ville: villeId })
        .populate('id_livreur', 'nom prenom tele') // Populate Livreur details
        .populate('id_ville', 'nom'); // Populate Ville details

    res.status(200).json(tarifLivreurs);
});


module.exports = {
    createTarifLivreur,
    getAllTarifLivreurs,
    getTarifLivreurById,
    updateTarifLivreur,
    deleteTarifLivreur,
    getTarifLivreurByLivreur,
    getTarifLivreurByVille,
};
