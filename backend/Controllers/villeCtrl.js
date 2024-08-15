const { Ville } = require('../Models/Ville'); // Assure-toi que le chemin est correct

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

module.exports = { ajoutVille };
