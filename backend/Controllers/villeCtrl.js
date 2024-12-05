const { Ville } = require('../Models/Ville'); // Assure-toi que le chemin est correct
const asyncHandler = require('express-async-handler');

const ajoutVille = async (req, res) => {
  try {
    // Vérifier si la requête contient plusieurs villes
    const villes = Array.isArray(req.body) ? req.body : [req.body];

    // Insérer plusieurs villes ou une seule ville dans la base de données
    if (villes.length > 1) {
      const result = await Ville.insertMany(villes);
      res.status(201).json({ message: `${result.length} villes ajoutées avec succès!`, villes: result });
    } else {
      const nouvelleVille = new Ville(villes[0]);
      await nouvelleVille.save();
      res.status(201).json({ message: 'Ville ajoutée avec succès!', ville: nouvelleVille });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'ajout de la ville', error });
  }
};


/** -------------------------------------------
 *@desc get list ville    
 * @router /api/ville
 * @method GET
 * @access private  only admin
 -------------------------------------------
*/
const getAllVilles = asyncHandler(async (req, res) => {
  try {
    // Fetch villes and sort by 'tarif' in ascending order
    const villes = await Ville.find().sort({ tarif: 1 });  // 1 for ascending order
    res.json(villes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


/** -------------------------------------------
 *@desc get ville by id    
 * @router /api/ville/:id
 * @method GET
 * @access private  admin admin
 -------------------------------------------
*/
const getVilleById = asyncHandler(async (req, res) => {
  const ville = await Ville.findById(req.params.id)
  if (!ville) {
    res.status(404).json({ message: 'Store not found' });
    return;
  }
  res.json(ville);
});


/** -------------------------------------------
 *@desc update ville    
 * @router /api/ville/:id
 * @method PUT
 * @access private  only admin
 -------------------------------------------
*/
const updateVille = asyncHandler(async (req, res) => {
  const ville = await Ville.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!ville) {
    res.status(404).json({ message: 'Ville not found' });
    return;
  }
  res.json(ville);
});


// Controller to add or update 'tarif_refus' for all records in Ville collection
const addTarifRefusToAllVilles = async (req, res) => {
  try {
      const tarifRefusValue = 15; // Set the desired default value for tarif_refus

      // Update all documents to add or set 'tarif_refus' to 15
      const result = await Ville.updateMany({}, { tarif_refus: tarifRefusValue });

      // Respond with the result of the update operation
      res.status(200).json({
          message: "tarif_refus attribute updated to 15 for all Villes.",
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
      });
  } catch (error) {
      console.error('Error adding tarif_refus to all Villes:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};


/** -------------------------------------------
 *@desc delete ville    
 * @router /api/ville/:id
 * @method DELETE
 * @access private  only admin
 -------------------------------------------
*/

const deleteVille = asyncHandler(async (req, res) => {
  const ville = await Ville.findByIdAndDelete(req.params.id);
  if (!ville) {
    res.status(404).json({ message: 'Store not found' });
    return;
  }
  res.json({ message: 'Ville deleted' });
});




module.exports = { 
  ajoutVille ,
  getAllVilles ,
  getVilleById ,
  updateVille , 
  deleteVille ,
  addTarifRefusToAllVilles
};
