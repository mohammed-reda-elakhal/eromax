const { Ville } = require('../Models/Ville'); // Assure-toi que le chemin est correct
const asyncHandler = require('express-async-handler');

// Controller pour ajouter une nouvelle ville
const ajoutVille = async (req, res) => {
  try {
    const { key, ref_ville, nom_ville, tarif } = req.body;

    // Créer une nouvelle instance de Ville
    const nouvelleVille = new Ville({
      key,
      ref_ville,
      nom_ville,
      tarif
    });

    // Sauvegarder la ville dans la base de données
    await nouvelleVille.save();

    res.status(201).json({ message: 'Ville ajoutée avec succès!', ville: nouvelleVille });
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
const getAllVilles= asyncHandler(async (req, res) => {
  const ville = await Ville.find()
  res.json(ville);
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
  deleteVille
};
