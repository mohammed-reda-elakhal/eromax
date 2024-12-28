const asyncHandler = require("express-async-handler");
const { Colis } = require("../Models/Colis");
const { Livreur } = require("../Models/Livreur");
const { Ville } = require("../Models/Ville");
const bcrypt = require("bcryptjs");
const axios = require('axios');


function mapGoodDeliveryStatusToOurStatus(goodDeliveryStatus) {
  const statusMapping = {
    "Livrée": "Livrée",
    "Annulée": "Annulée",
    "Refusée": "Refusée",
    "En retour": "En Retour",
    "Expédié": "Expediée",
    "Reçu": "Reçu",
    "Mise en distribution": "Mise en Distribution",
    "Nouveau": "Nouveau Colis",
    "Collecté par agence principale": "Ramassée",
    "Prèt pour expédition": "attente de ramassage",
    "Boite vocale": "Boite vocale",
    "Pas de réponse jour 1": "Pas de reponse jour 1",
    "Pas de réponse jour 2": "Pas de reponse jour 2",
    "Pas de réponse jour 3": "Pas de reponse jour 3",
    "Pas de réponse + SMS / + WhatsApp": "Pas reponse + sms / + whatsap",
    "En voyage": "En voyage",
    "Injoignable": "Injoignable",
    "Hors-zone": "Hors-zone",
    "Numéro Incorrect": "Numéro Incorrect",
    "Reporté": "Reporté",
    "Endommagé": "Endomagé",
    "Intéressé": "Intéressé",
    "Confirmé par livreur": "Confirmé Par Livreur",
  };

  return statusMapping[goodDeliveryStatus] || "attente de ramassage"; // Default to 'attente de ramassage' if no mapping is found
}


exports.getColisGoodDeliveryCtrl = asyncHandler(async (req, res) => {
    const colis = await Colis.find({expedation_type: 'good delivery'})
      .populate('livreur')
      .populate('store')
      .populate('team')
      .populate('ville')     
      .populate({
        path: 'replacedColis',
        select: 'code_suivi prix statut', // Include the fields you want from replacedColis
        populate: {
          path: 'ville',
          select: 'nom', // Include the ville name if needed
        },
      })
      .sort({ updatedAt: -1 });
  
  
    if (!colis) {
      return res.status(404).json({ message: "Colis not found" });
    }
  
    res.status(200).json(colis);
  });


  module.exports.getSuiviColisGoodDelivery = asyncHandler(async (req, res) => {
    try {
      // Récupérer le colis via son code_suivi
      const colis = await Colis.findOne({ code_suivi: req.params.code_suivi });
  
      if (!colis) {
        return res
          .status(404)
          .json({ message: "S'il vous plaît vérifier le code de suivi" });
      }
  
      // Vérifier si le type d’expédition correspond à “good delivery”
      if (colis.expedation_type === 'good delivery') {
        // Utiliser l’API Good Delivery pour récupérer les données de tracking
        const code_suivi_gdel = colis.code_suivi_gdil;
  
        try {
          // Appel à l’API Good Delivery
          const gdeliveryResponse = await axios.get(
            `https://gooddelivery.ma/track.php?code=${code_suivi_gdel}`
          );
  
          // Vérifier le statut de la réponse
          if (gdeliveryResponse.status === 200) {
            // gdeliveryResponse.data est un tableau d'objets [{ Etat, Date_Evenement }, ...]
            const responseData = gdeliveryResponse.data;
  
            // Vérifier que c’est bien un tableau
            if (!Array.isArray(responseData)) {
              return res.status(500).json({
                message: "Format de données inattendu depuis l'API Good Delivery.",
                details: responseData,
              });
            }
  
            // Construire statusUpdates
            const statusUpdates = responseData.map((item) => {
              const timeInSeconds = parseInt(item.Date_Evenement, 10);
              const date = new Date(timeInSeconds * 1000).toISOString();
  
              return {
                status: item.Etat,
                date: date,
              };
            });
  
            // Trier les statuts par date croissante (du plus ancien au plus récent)
            statusUpdates.sort((a, b) => new Date(a.date) - new Date(b.date));
  
            // Construire l’objet de réponse
            const suivi_colis = {
              id_colis: colis._id,
              code_suivi: colis.code_suivi,
              status_updates: statusUpdates,
            };
  
            // Renvoyer le résultat
            return res.status(200).json(suivi_colis);
          } else {
            return res.status(500).json({
              message: "Erreur lors de la récupération des données de suivi de Good Delivery",
              status: gdeliveryResponse.status,
            });
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données de suivi de Good Delivery:", error.message);
          return res.status(500).json({
            message: "Erreur lors de la récupération des données de suivi de Good Delivery",
            error: error.message,
          });
        }
      } else {
        // Sinon, utiliser la logique existante (recherche dans la collection Suivi_Colis)
        const suivi_colis = await Suivi_Colis.findOne({
          code_suivi: req.params.code_suivi,
        }).populate({
          path: 'status_updates.livreur',
          select: '-password -__v',
        });
  
        if (!suivi_colis) {
          return res
            .status(404)
            .json({ message: "S'il vous plaît vérifier le code de suivi" });
        }
  
        return res.status(200).json(suivi_colis);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erreur du serveur interne", error: error.message });
    }
  });


  module.exports.findOrCreateGDelLivreur = asyncHandler(async () => {
  
    // Fetch all city names from the Ville collection
    const allVilles = await Ville.find().select("nom");
  
    const villeNames = allVilles.map(ville => ville.nom);
  
    // Define default data
    const defaultLivreurData = {
      nom: "good delivery",
      prenom: "good delivery",
      username: "Good Delivery",
      ville: "Marrakech",
      adresse: "123 Default Street",
      tele: "0656041383",
      password: "good delivery",
      email: "brahimtwilia28@gmail.com",
      profile: {
        url: "https://gooddelivery.ma/images/logo.png",
        publicId: null,
      },
      active: true,
      role: "livreur",
      type: "company",
      tarif: 33,
      domaine: "https://gooddelivery.ma",
      villes: villeNames,
    };
  
    // Check if the 'Good Delivery' livreur exists
    let livreur = await Livreur.findOne({ email: defaultLivreurData.email, type: "company" });
    if (!livreur) {
      console.log("'Good Delivery' livreur not found. Creating...");
      const hashedPassword = await bcrypt.hash(defaultLivreurData.password, 10);
      livreur = new Livreur({ ...defaultLivreurData, password: hashedPassword });
      await livreur.save();
      console.log("'Good Delivery' livreur created successfully!");
    } else {
      console.log("'Good Delivery' livreur already exists.");
    }
  
    return livreur;
  });
  

exports.deleteAllGoodDeliveryColis = asyncHandler(async (req, res) => {
  try {
    
    const result = await Colis.deleteMany({ expedation_type: 'good delivery' });

    res.status(200).json({
      message: `${result.deletedCount} colis with expedation_type 'good delivery' have been deleted.`,
    });
  } catch (error) {
    console.error('Error deleting colis:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports.assignColisToGoodDelivery = asyncHandler(async (req, res) => {
  try {
    const { codes_suivi } = req.body; // On s'attend à un tableau de code_suivi



    // Vérifier la validité du tableau codes_suivi
    if (!Array.isArray(codes_suivi) || codes_suivi.length === 0) {
      return res.status(400).json({ message: 'codes_suivi must be a non-empty array' });
    }

    const goodDeliveryLivreur = await Livreur.findOne({ email: 'brahimtwilia28@gmail.com', type: 'company' });
    if (!goodDeliveryLivreur) {
      return res.status(404).json({ message: 'Good Delivery livreur not found in the database' });
    }

    // Récupérer en base les colis correspondants
    const colisList = await Colis.find({
      code_suivi: { $in: codes_suivi },
    }).populate('ville'); // Pour récupérer le nom de la ville via ville.nom

    if (colisList.length === 0) {
      return res.status(404).json({ message: 'No colis found for the provided codes_suivi' });
    }

    // Variables d'authentification (token, secret key)
    const GOOD_DELIVERY_TOKEN =
      process.env.GOOD_DELIVERY_TOKEN || '53a95738b2ee8a65212f26c75719b4f6';
    const GOOD_DELIVERY_SECRET_KEY =
      process.env.GOOD_DELIVERY_SECRET_KEY || 'ad1df83537dde39e17eb899db13165cc';

    // Tableaux pour suivre le succès ou l'échec
    const successList = [];
    const errorList = [];

    // Boucle sur chaque colis
    for (const colis of colisList) {
      try {
        // Récupération du nom de la ville (via ville.nom)
        const cityName = colis.ville ? colis.ville.nom : 'Ville-inconnue';

        // Construction de l'URL pour l'API Good Delivery
        const url = `https://gooddelivery.ma/addcolis.php` +
                    `?tk=${GOOD_DELIVERY_TOKEN}` +
                    `&sk=${GOOD_DELIVERY_SECRET_KEY}` +
                    `&fullname=${encodeURIComponent(colis.nom)}` +
                    `&phone=${encodeURIComponent(colis.tele)}` +
                    `&city=${encodeURIComponent(cityName)}` +
                    `&address=${encodeURIComponent(colis.adresse)}` +
                    `&price=${colis.prix}` +
                    `&product=${encodeURIComponent(colis.nature_produit || '')}` +
                    `&qty=1` +
                    `&note=${encodeURIComponent(colis.commentaire || '')}` +
                    `&change=0` +
                    `&openpackage=1`;

        // Appel à l'API Good Delivery
        const gdResponse = await axios.get(url);

        // Vérifier le statut HTTP de la réponse
        if (gdResponse.status === 200) {
          const responseData = gdResponse.data;

          // Ajuster la vérification pour considérer "Package added successfully" comme succès
          if (responseData && responseData.message === "Package added succesfully") {
            const gdTrackingNumber = responseData.code; // Code de suivi retourné par Good Delivery

            // Mettre à jour le colis dans MongoDB
            colis.expedation_type = 'good delivery';
            colis.code_suivi_gdil = gdTrackingNumber;
            colis.livreur = goodDeliveryLivreur._id; // Affecter l'ID du livreur
            colis.statut = 'Ajouté'; // Adaptez le statut selon vos besoins
            await colis.save();

            // Ajouter au successList
            successList.push({
              code_suivi: colis.code_suivi,
              trackingNumber: gdTrackingNumber,
            });
          } else {
            // Si la réponse de l'API ne contient pas "Package added successfully"
            errorList.push({
              code_suivi: colis.code_suivi,
              message: 'Error assigning colis to Good Delivery (API returned failure)',
              details: responseData,
            });
          }
        } else {
          // Status HTTP inattendu
          errorList.push({
            code_suivi: colis.code_suivi,
            message: 'Error assigning colis to Good Delivery (HTTP status error)',
            status: gdResponse.status,
            details: gdResponse.data,
          });
        }
      } catch (error) {
        console.error(`Error assigning colis ${colis.code_suivi} to Good Delivery:`, error);

        // Si l'API Good Delivery renvoie un code d’erreur
        if (error.response) {
          errorList.push({
            code_suivi: colis.code_suivi,
            message: 'Good Delivery API error',
            status: error.response.status,
            details: error.response.data,
          });
        } else if (error.request) {
          errorList.push({
            code_suivi: colis.code_suivi,
            message: 'No response received from Good Delivery API',
            error: error.message,
          });
        } else {
          errorList.push({
            code_suivi: colis.code_suivi,
            message: 'Server error',
            error: error.message,
          });
        }
      }
    }

    // Retourner le résultat final
    return res.status(200).json({
      message: 'Assignment to Good Delivery completed',
      success: successList,
      errors: errorList,
    });
  } catch (error) {
    console.error('Error assigning multiple colis to Good Delivery:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
});


async function syncColisStatusWithGoodDeliveryCore() {
  try {
    // Step 1: Fetch all colis with expedation_type="good delivery" created in the last two weeks
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const colisList = await Colis.find({
      expedation_type: 'good delivery',
      createdAt: { $gte: twoWeeksAgo },
    }).populate('store');

    if (colisList.length === 0) {
      console.log('No colis to update');
      return { updatedColis: [], errors: [] };
    }

    // Initialize arrays to keep track of updates and errors
    const updatedColisList = [];
    const errorList = [];

    // Loop through each colis
    for (const colis of colisList) {
      try {
        const code_suivi_gdil = colis.code_suivi_gdil;

        // Make the API call to Good Delivery to get colis info
        const response = await axios.get(
          `https://gooddelivery.ma/track.php?code=${code_suivi_gdil}`
        );

        if (response.status === 200) {
          const responseData = response.data;

          // Verify the response format (it should be an array)
          if (!Array.isArray(responseData)) {
            throw new Error('Unexpected response format from Good Delivery');
          }

          // Extract the most recent status
          const latestStatus = responseData[0]; // Assuming the first item is the latest status
          const goodDeliveryStatus = latestStatus.Etat;

          // Map Good Delivery status to your own statuses
          const mappedStatus = mapGoodDeliveryStatusToOurStatus(goodDeliveryStatus);

          // If the status has changed, update the colis and Suivi_Colis
          if (colis.statut !== mappedStatus) {
            const oldStatus = colis.statut; // Save the old status

            // Update the colis status
            colis.statut = mappedStatus;
            await colis.save();

            // Update or create the Suivi_Colis entry
            let suivi_colis = await Suivi_Colis.findOne({ id_colis: colis._id });
            if (!suivi_colis) {
              suivi_colis = new Suivi_Colis({
                id_colis: colis._id,
                code_suivi: colis.code_suivi,
                status_updates: [{ status: mappedStatus, date: new Date() }],
              });
            } else {
              suivi_colis.status_updates.push({ status: mappedStatus, date: new Date() });
            }
            await suivi_colis.save();

            // Handle special cases (e.g., create notifications)
            await handleSpecialCases(colis, mappedStatus);

            // Add to updated colis list
            updatedColisList.push({
              colis_id: colis._id,
              code_suivi: colis.code_suivi,
              old_status: oldStatus,
              new_status: mappedStatus,
            });
          }
        } else {
          // Handle unexpected response statuses
          errorList.push({
            colis_id: colis._id,
            code_suivi: colis.code_suivi,
            message: 'Failed to fetch colis info from Good Delivery',
            status: response.status,
          });
        }
      } catch (error) {
        console.error(`Error syncing colis ${colis.code_suivi}:`, error.message);
        errorList.push({
          colis_id: colis._id,
          code_suivi: colis.code_suivi,
          message: error.message,
        });
      }
    }

    console.log('Colis status sync completed');
    return { updatedColis: updatedColisList, errors: errorList };
  } catch (error) {
    console.error('Error syncing colis statuses:', error);
    throw error;
  }
}

module.exports.syncColisStatusWithGoodDelivery = asyncHandler(async (req, res) => {
  try {
    // Call the core function to sync the colis statuses with Good Delivery
    const { updatedColis, errors } = await syncColisStatusWithGoodDeliveryCore();

    // Send the results back as a response
    res.status(200).json({
      message: 'Colis status sync with Good Delivery completed',
      updatedColis,
      errors,
    });
  } catch (error) {
    // Handle any errors that occur during the sync process
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports.getAllColisWithGoodDeliveryApi = asyncHandler(async (req, res) => {
  try {
    // Récupérer les credentials depuis les variables d'environnement ou valeurs par défaut
    const GOOD_DELIVERY_TOKEN = process.env.GOOD_DELIVERY_TOKEN || '53a95738b2ee8a65212f26c75719b4f6';
    const GOOD_DELIVERY_SECRET_KEY = process.env.GOOD_DELIVERY_SECRET_KEY || 'ad1df83537dde39e17eb899db13165cc';

    // Construire l'URL de l'API
    const url = `https://gooddelivery.ma/colislist.php?tk=${GOOD_DELIVERY_TOKEN}&sk=${GOOD_DELIVERY_SECRET_KEY}`;

    // Appel à l'API Good Delivery
    const response = await axios.get(url);

    // Vérifier le statut de la réponse
    if (response.status === 200) {
      const colisList = response.data;

      // Vérifier si la réponse est au bon format (array attendu)
      if (!Array.isArray(colisList)) {
        return res.status(500).json({
          message: 'Format inattendu de la réponse de Good Delivery',
          details: colisList,
        });
      }

      // Retourner les colis récupérés
      return res.status(200).json({
        message: 'Liste des colis récupérée avec succès',
        colis: colisList,
      });
    } else {
      return res.status(response.status).json({
        message: 'Erreur lors de la récupération des colis depuis Good Delivery',
        status: response.status,
        details: response.data,
      });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des colis depuis Good Delivery:', error.message);

    // Gestion des erreurs
    if (error.response) {
      return res.status(error.response.status).json({
        message: 'Erreur depuis l’API Good Delivery',
        status: error.response.status,
        details: error.response.data,
      });
    } else if (error.request) {
      return res.status(500).json({
        message: 'Aucune réponse reçue de l’API Good Delivery',
        error: error.message,
      });
    } else {
      return res.status(500).json({
        message: 'Erreur interne',
        error: error.message,
      });
    }
  }
});
