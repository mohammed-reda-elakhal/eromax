const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const shortid = require('shortid');
const {Client} = require('../Models/Client'); // Assurez-vous d'avoir un modèle User pour l'utilisateur
const asyncHandler = require('express-async-handler');
const { validateRegisterColis, Colis } = require('../Models/Colis');
const { Ville } = require('../Models/Ville');
const { Suivi_Colis } = require('../Models/Suivi_Colis');
const { Store } = require('../Models/Store');
const { validateLogin } = require('../Models/Admin');


const generateToken = (id, role, store) => {
  return jwt.sign({ id, role, store }, process.env.JWT_SECRET, { expiresIn: '1y' });
};

const generateCodeSuivi = (refVille) => {
    const currentDate = new Date(); // Get the current date
    const formattedDate = currentDate.toISOString().slice(0, 10).replace(/-/g, ''); // Format date as YYYYMMDD
    const randomNumber = shortid.generate().slice(0, 6).toUpperCase(); // Shorten and uppercase for readability
    return `API-${refVille}${formattedDate}-${randomNumber}`;
  };

  module.exports.login = asyncHandler(async (req, res) => {
    try {
      // Validation
      const { error } = validateLogin(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
  
      const { email, password } = req.body;
  
      // Trouver l'utilisateur par email
      const user = await Client.findOne({ email }).lean();
  
      // Vérifier si l'utilisateur existe
      if (!user) {
        return res.status(400).json({ message: "Email ou mot de passe invalide" });
      }
  
      // Valider le mot de passe
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        return res.status(400).json({ message: "Email ou mot de passe invalide" });
      }
  
      // Trouver la boutique par défaut
      const store = await Store.findOne({ id_client: user._id, default: true }).lean();
      if (!store) {
        return res.status(400).json({ message: "Aucune boutique par défaut trouvée pour ce client" });
      }
  
      // Générer un token JWT
      const token = generateToken(user._id, user.role, store._id);
  
      // Filtrer les champs sensibles de l'utilisateur
      const filteredUser = {
        nom: user.nom,
        prenom: user.prenom,
        username: user.username,
        ville: user.ville,
        adresse: user.adresse,
        tele: user.tele,
        email: user.email,
        active: user.active,
        role: user.role,
      };
  
      // Filtrer les champs sensibles de la boutique
      const filteredStore = {
        storeName: store.storeName,
        default: store.default,
        solde: store.solde,
      };
  
      // Renvoyer la réponse
      return res.status(200).json({
        message: "Login successful",
        token,
        user: filteredUser,
        store: filteredStore,
      });
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  });
  
module.exports.CreateMultipleColisCtrl = asyncHandler(async (req, res) => {
  try {
    // 1. Vérification du token JWT
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

    const villes = await Ville.find().lean(); // Charger toutes les villes en mémoire
    const villeMap = villes.reduce((acc, ville) => {
      const nomVille = ville.nom?.trim().toLowerCase(); // Vérifie si "nom" existe
      if (nomVille) {
        acc[nomVille] = ville;
      }
      return acc;
    }, {});

    const colisToInsert = [];
    const errors = [];

    for (const [index, colisInput] of req.body.entries()) {
      try {
        // Validation de chaque colis
        const { error } = validateRegisterColis(colisInput);
        if (error) {
          throw new Error(`Erreur de validation : ${error.details[0].message}`);
        }

        // Validation de la propriété "ville"
        const villeInput = colisInput.ville?.trim().toLowerCase();
        if (!villeInput) {
          throw new Error(`La propriété "ville" est manquante ou vide pour le colis à l'index ${index}.`);
        }

        // Recherche de la ville
        const ville = villeMap[villeInput];
        if (!ville) {
          throw new Error(`Ville "${colisInput.ville}" non trouvée.`);
        }

        // Génération du code de suivi unique
        let code_suivi;
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 10;

        while (!isUnique && attempts < maxAttempts) {
          code_suivi = generateCodeSuivi(ville.ref);
          const existingColis = await Colis.findOne({ code_suivi });
          if (!existingColis) {
            isUnique = true;
          }
          attempts++;
        }

        if (!isUnique) {
          throw new Error("Impossible de générer un code de suivi unique.");
        }

        // Préparer les données du colis
        const colisData = {
          ...colisInput,
          userId,
          ville: ville._id, // Utilisation de l'ID
          code_suivi,
        };

        colisToInsert.push(colisData);
      } catch (err) {
        // Stocker les erreurs par colis
        errors.push({ index, error: err.message });
      }
    }

    // Insertion des colis valides
    const insertedColis = colisToInsert.length > 0 ? await Colis.insertMany(colisToInsert) : [];

    // Ajouter les suivis pour chaque colis inséré
    const suiviToInsert = insertedColis.map((colis) => ({
      code_suivi: colis.code_suivi,
      id_colis: colis._id, // Ajout de l'ID du colis
      status_updates: [
        {
          date: new Date(),
          status: "Nouveau Colis",
        },
      ],
    }));

    const insertedSuivi = suiviToInsert.length > 0 ? await Suivi_Colis.insertMany(suiviToInsert) : [];

    // Exclure les champs indésirables de la réponse
    const filteredInsertedColis = insertedColis.map((colis) => {
      const { _id, id_Colis, __v, createdAt, updatedAt, ...filteredColis } = colis.toObject();
      return filteredColis;
    });

    // Réponse finale
    res.status(201).json({
      message: 'Opération terminée.',
      inserted: filteredInsertedColis,
      errors,
    });
  } catch (error) {
    console.error('Erreur lors de la création des colis:', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});


module.exports.updateColisController = asyncHandler(async (req, res) => {
  try {
    // Récupérer le code de suivi depuis les paramètres
    const { code_suivi } = req.params;

    // Vérifier si le colis existe
    const colis = await Colis.findOne({ code_suivi });
    if (!colis) {
      return res.status(404).json({ message: "Colis introuvable. Veuillez vérifier le code de suivi." });
    }

    // Validation des données envoyées dans le corps de la requête
    const allowedUpdates = [
      "nom",
      "tele",
      "ville",
      "adresse",
      "nature_produit",
      "prix",
      "ouvrir",
      "is_simple",
      "is_remplace",
      "is_fragile",
    ]; // Liste des champs autorisés pour la mise à jour

    const updates = Object.keys(req.body); // Clés des champs à mettre à jour
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      return res.status(400).json({ message: "Mise à jour invalide. Champs non autorisés inclus." });
    }

    // Appliquer les mises à jour autorisées
    updates.forEach((update) => {
      colis[update] = req.body[update];
    });

    // Sauvegarder les modifications
    await colis.save();

    // Filtrer les champs sensibles
    const filteredColis = {
      code_suivi: colis.code_suivi,
      nom: colis.nom,
      tele: colis.tele,
      ville: colis.ville,
      adresse: colis.adresse,
      nature_produit: colis.nature_produit,
      prix: colis.prix,
      ouvrir: colis.ouvrir,
      is_simple: colis.is_simple,
      is_remplace: colis.is_remplace,
      is_fragile: colis.is_fragile,
    };

    // Retourner les informations mises à jour
    res.status(200).json({
      message: "Colis mis à jour avec succès.",
      colis: filteredColis,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du colis :", error);
    res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
  }
});


module.exports.deleteColisController = asyncHandler(async (req, res) => {
  try {
    const { code_suivi } = req.params;

    // Vérifier si le colis existe
    const colis = await Colis.findOne({ code_suivi });
    if (!colis) {
      return res.status(404).json({ message: "Colis introuvable. Veuillez vérifier le code de suivi." });
    }

    // Supprimer le colis
    await Colis.deleteOne({ code_suivi });

    // Supprimer les données de suivi associées
    await Suivi_Colis.deleteMany({ code_suivi });

    // Retourner une réponse simple
    res.status(200).json({
      message: "Colis et données de suivi supprimés avec succès.",
      code_suivi: code_suivi,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du colis et des données associées :", error);
    res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
  }
});

module.exports.updateMultipleColisStatus = asyncHandler(async (req, res) => {
  const { colisCodes, new_status, comment } = req.body;

  // Liste des statuts valides
  const validStatuses = [
    "Nouveau Colis",
    "attente de ramassage",
    "Ramassée",
    "Expediée",
    "Reçu",
    "Mise en Distribution",
    "Livrée",
    "Annulée",
    "Programmée",
    "Refusée",
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

  // Validation des entrées
  if (!colisCodes || !Array.isArray(colisCodes) || colisCodes.length === 0) {
    return res.status(400).json({ message: "colisCodes must be a non-empty array" });
  }
  if (!new_status) {
    return res.status(400).json({ message: "new_status is required" });
  }
  if (!validStatuses.includes(new_status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const updatedColisList = [];
  const trackingUpdates = [];
  const failedUpdates = [];

  for (const codeSuivi of colisCodes) {
    try {
      const colis = await Colis.findOne({ code_suivi: codeSuivi }).populate('store');
      if (!colis) {
        console.log(`Colis with code_suivi ${codeSuivi} not found`);
        failedUpdates.push({ codeSuivi, error: "Colis not found" });
        continue;
      }

      if (new_status === "Annulée" && comment) {
        colis.comment_annule = comment;
      } else if (new_status === "Refusée" && comment) {
        colis.comment_refuse = comment;
      }

      colis.statut = new_status;
      await colis.save();
      updatedColisList.push({
        code_suivi: colis.code_suivi,
        nom: colis.nom,
        tele: colis.tele,
        adresse: colis.adresse,
        statut: colis.statut,
        storeName: colis.store?.storeName,
        livreur: colis.livreur ? {
          nom: colis.livreur.nom,
          prenom: colis.livreur.prenom,
          tele: colis.livreur.tele,
          email: colis.livreur.email
        } : null,
      });

      /* if (new_status === "Ramassée") {
        await handleFactureRamasser(colis.store, colis._id);
      } */

      let suivi_colis = await Suivi_Colis.findOne({ id_colis: colis._id });
      if (!suivi_colis) {
        suivi_colis = new Suivi_Colis({
          id_colis: colis._id,
          code_suivi: colis.code_suivi,
          status_updates: [{ status: new_status, date: new Date() }]
        });
      } else {
        suivi_colis.status_updates.push({ status: new_status, date: new Date() });
      }

      await suivi_colis.save();
      trackingUpdates.push({
        code_suivi: suivi_colis.code_suivi,
        status_updates: suivi_colis.status_updates.map(update => ({
          status: update.status,
          date: update.date
        })),
      });
    } catch (err) {
      console.error(`Error updating colis with code_suivi ${codeSuivi}:`, err);
      failedUpdates.push({ codeSuivi, error: err.message });
    }
  }

  if (updatedColisList.length === 0) {
    return res.status(404).json({ message: "No colis found or updated", failedUpdates });
  }

  // Réponse filtrée sans données sensibles
  res.status(200).json({
    message: "Colis status updated successfully",
    updatedColisList,
    trackingUpdates,
    failedUpdates
  });
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


  module.exports.getSuiviColis = asyncHandler(async (req, res) => {
    try {
      // Find the colis by code_suivi
      const colis = await Colis.findOne({ code_suivi: req.params.code_suivi });
  
      if (!colis) {
        return res.status(404).json({ message: "S'il vous plaît vérifier le code de suivi" });
      }
  
      // Find the tracking information
      const suivi_colis = await Suivi_Colis.findOne({ code_suivi: req.params.code_suivi })
        .populate({
          path: 'status_updates.livreur',
          select: '-password -__v',
        });
  
      if (!suivi_colis) {
        return res.status(404).json({ message: "Données de suivi non trouvées pour ce colis" });
      }
  
      // Filtrer les champs avant d'envoyer la réponse
      const filteredSuivi = {
        code_suivi: suivi_colis.code_suivi,
        status_updates: suivi_colis.status_updates.map((update) => ({
          status: update.status,
          date: update.date,
        })),
      };
  
      // Send response
      res.status(200).json(filteredSuivi);
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ message: "Erreur du serveur interne", error: error.message });
    }
});


module.exports.getColisInfoByCodeSuivi = asyncHandler(async (req, res) => {
  try {
    // Vérification du token JWT
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "Accès refusé : Token manquant ou invalide." });
    }

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (err) {
      return res.status(403).json({ message: "Accès refusé : Token invalide ou expiré." });
    }

    if (!userId) {
      return res.status(403).json({ message: "Utilisateur non identifié." });
    }

    // Récupérer le colis à partir du code de suivi
    const colis = await Colis.findOne({ code_suivi: req.params.code_suivi }).lean();

    if (!colis) {
      return res.status(404).json({ message: "Colis introuvable. Veuillez vérifier le code de suivi." });
    }

    // Récupérer les informations de suivi et du livreur
    const suivi_colis = await Suivi_Colis.findOne({ code_suivi: req.params.code_suivi })
      .populate({
        path: 'status_updates.livreur',
        select: 'nom email tele -_id', // Inclure uniquement les champs nécessaires du livreur
      })
      .lean();

    if (!suivi_colis) {
      return res.status(404).json({ message: "Aucune donnée de suivi trouvée pour ce colis." });
    }

    // Combiner les informations du colis et du livreur
    const livreurInfo =
      suivi_colis.status_updates?.find((update) => update.livreur)?.livreur || null;

    const response = {
      code_suivi: colis.code_suivi,
      nom: colis.nom,
      tele: colis.tele,
      ville: colis.ville,
      adresse: colis.adresse,
      nature_produit: colis.nature_produit,
      prix: colis.prix,
      statut: colis.statut,
      livreur: livreurInfo
        ? {
            nom: livreurInfo.nom,
            email: livreurInfo.email,
            tele: livreurInfo.tele,
          }
        : null,
    };

    // Renvoyer la réponse
    res.status(200).json(response);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
  }
});


  
  