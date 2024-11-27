const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const shortid = require('shortid');
const {Client} = require('../Models/Client'); // Assurez-vous d'avoir un modèle User pour l'utilisateur
const asyncHandler = require('express-async-handler');
const { validateRegisterColis, Colis } = require('../Models/Colis');
const { Ville } = require('../Models/Ville');
const { Suivi_Colis } = require('../Models/Suivi_Colis');
const { Store } = require('../Models/Store');


const generateToken = (id, role, store) => {
  return jwt.sign({ id, role, store }, process.env.JWT_SECRET, { expiresIn: '1y' });
};

const generateCodeSuivi = (refVille) => {
    const currentDate = new Date(); // Get the current date
    const formattedDate = currentDate.toISOString().slice(0, 10).replace(/-/g, ''); // Format date as YYYYMMDD
    const randomNumber = shortid.generate().slice(0, 6).toUpperCase(); // Shorten and uppercase for readability
    return `TEST-${refVille}${formattedDate}-${randomNumber}`;
  };

  module.exports.loginProfileCtrl = asyncHandler(async (req, res) => {
    // Validation
    const { error } = validateLogin(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;
    let user;
    let token;

    user = await Client.findOne({ email });

    // Check if user exists
    if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    // Validate password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    // Handle client role with default store

        const store = await Store.findOne({ id_client: user._id, default: true });
        if (!store) {
            return res.status(400).json({ message: "No default store found for this client" });
        }
       
        token = generateToken(user._id, user.role, store._id);
        // Respond with token and user profile
        return res.status(200).json({
            message: "Login successful",
            token,
            user,
            store
        });
   
});
// Fonction de connexion
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Vérifier si l'utilisateur existe
    const user = await Client.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Utilisateur non trouvé.' });
    }

    // 2. Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mot de passe incorrect.' });
    }

    // 3. Générer le token JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET, // Clé secrète de votre choix
      { expiresIn: '1y' } // Durée de validité du token
    );

    // 4. Retourner le token
    res.json({
      message: 'Connexion réussie.',
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
module.exports.CreateMultipleColisCtrl = asyncHandler(async (req, res) => {
    try {
      // 1. Vérification du token JWT (comme avant)
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: "Token manquant ou invalide." });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;
      if (!userId) {
        return res.status(400).json({ message: "Informations utilisateur manquantes." });
      }
  
      // 2. Validation des données de colis
      if (!req.body || !Array.isArray(req.body) || req.body.length === 0) {
        return res.status(400).json({ message: "Les données de colis sont manquantes ou invalides." });
      }
  
      const colisToInsert = [];
  
      for (const [index, colisInput] of req.body.entries()) {
        // Validation de chaque colis
        const { error } = validateRegisterColis(colisInput);
        if (error) {
          return res.status(400).json({ message: `Erreur de validation pour le colis à l'index ${index}: ${error.details[0].message}` });
        }
  
        // Recherche de la ville par son nom
        const ville = await Ville.findOne({ nom: colisInput.ville.trim() });
        if (!ville) {
          return res.status(400).json({ message: `Ville "${colisInput.ville}" non trouvée pour le colis à l'index ${index}.` });
        }
  
        // Génération du code de suivi unique
        let code_suivi;
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 5;
  
        while (!isUnique && attempts < maxAttempts) {
          code_suivi = generateCodeSuivi(ville.ref);
          const existingColis = await Colis.findOne({ code_suivi });
          if (!existingColis) {
            isUnique = true;
          }
          attempts++;
        }
  
        if (!isUnique) {
          return res.status(500).json({ message: `Impossible de générer un code de suivi unique pour le colis à l'index ${index}.` });
        }
  
        // Préparer les données du colis
        const colisData = {
          ...colisInput,
          userId,
          ville: ville._id, // Utilisation de l'ID après résolution par le nom
          code_suivi,
        };
  
        colisToInsert.push(colisData);
      }
  
      // Insertion des colis
      const insertedColis = await Colis.insertMany(colisToInsert);
  
      res.status(201).json({
        message: 'Les colis ont été créés avec succès.',
        colis: insertedColis,
      });
    } catch (error) {
      console.error('Erreur lors de la création des colis:', error);
      res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
});

module.exports.TrackColisCtrl = asyncHandler(async (req, res) => {
    try {
      // 1. Validate the Authorization Token
      const token = req.headers.authorization?.split(' ')[1]; // Extract Bearer token
      if (!token) {
        return res.status(401).json({ message: "Token manquant ou invalide." });
      }
  
      // 2. Decode and Verify Token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token using your secret key
      } catch (error) {
        return res.status(401).json({ message: "Token invalide ou expiré." });
      }
  
      // 3. Validate the `code_suivi` Parameter
      const { code_suivi } = req.params;
      if (!code_suivi) {
        return res.status(400).json({ message: "Code de suivi manquant." });
      }
  
      // 4. Find the Package (`Colis`) by `code_suivi`
      const colis = await Colis.findOne({ code_suivi })
        .populate("ville", "nom")// Peupler uniquement le champ "nom" de la ville
        .populate("products.product", "nom quantite categorie") // Peupler les produits associés
  
      if (!colis) {
        return res.status(404).json({ message: `Aucun colis trouvé avec le code de suivi: ${code_suivi}` });
      }
  
      // 5. Fetch Tracking Updates (if applicable)
      const suivi = await Suivi_Colis.findOne({ code_suivi });
  
      // 6. Respond with Colis and Tracking Details
      res.status(200).json({
        message: "Colis trouvé.",
        colis: {
          id_Colis: colis.id_Colis,
          code_suivi: colis.code_suivi,
          nom: colis.nom,
          tele: colis.tele,
          ville: colis.ville?.nom,
          adresse: colis.adresse,
          commentaire: colis.commentaire,
          prix: colis.prix,
          nature_produit: colis.nature_produit,
          statut: colis.statut,
          ouvrir: colis.ouvrir,
          is_simple: colis.is_simple,
          is_remplace: colis.is_remplace,
          is_fragile: colis.is_fragile,
          createdAt: colis.createdAt,
          updatedAt: colis.updatedAt,
        },
        suivi: suivi
          ? {
              status_updates: suivi.status_updates,
              last_status: suivi.status_updates[suivi.status_updates.length - 1]?.status,
              last_update: suivi.status_updates[suivi.status_updates.length - 1]?.date,
            }
          : "Aucun suivi disponible pour ce colis.",
      });
    } catch (error) {
      console.error("Erreur lors du suivi du colis :", error);
      res.status(500).json({ message: "Erreur interne du serveur." });
    }
  });
  