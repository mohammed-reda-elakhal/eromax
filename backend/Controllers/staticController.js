const asyncHandler = require("express-async-handler");
const { Colis } = require("../Models/Colis");
const { default: mongoose } = require("mongoose");
const Transaction = require("../Models/Transaction");
const { subDays } = require('date-fns'); // Optionally use date-fns for date handling



exports.countColisByRole = async (req, res) => {
  try {
      const { role, id } = req.params; // Get role and id from request parameters

      // If role is admin, count all colis excluding "Livrée" and "Annulée" statuses
      if (role === 'admin') {
          const countAllColis = await Colis.aggregate([
              { $match: { statut: { $nin: ['Livrée', 'Annulée'] } } }, // Exclude 'Livrée' and 'Annulée'
              {
                  $group: {
                      _id: null, // Group all results together
                      totalColis: { $count: {} } // Count the total colis
                  }
              }
          ]);

          // Return the result
          return res.status(200).json({
              message: "Nombre de colis pour l'admin (excluant ceux livrés et annulés)",
              totalColis: countAllColis[0]?.totalColis || 0 // Return the total count or 0 if none found
          });
      }

      // For other roles, continue with the original role-based logic
      const objectId = new mongoose.Types.ObjectId(id);

      // Determine the field to match based on the role
      let matchField;
      if (role === 'client') {
          matchField = 'store';
      } else if (role === 'team') {
          matchField = 'team';
      } else if (role === 'livreur') {
          matchField = 'livreur';
      } else {
          return res.status(400).json({ message: 'Rôle invalide fourni' });
      }

      // Aggregate query to count colis for the specified role, excluding certain statuses
      const countForRole = await Colis.aggregate([
          { 
              $match: { 
                  statut: { $nin: ['Livrée', 'Annulée'] }, // Exclude 'Livrée' and 'Annulée'
                  [matchField]: objectId // Match by the specific role field and ID
              } 
          },
          {
              $group: {
                  _id: `$${matchField}`, // Group by the role field
                  totalColis: { $count: {} } // Count the total colis for this role
              }
          }
      ]);
   // Return the result
      return res.status(200).json({
          message: `Total de colis pour le ${role} (excluant ceux livrés et annulés)`,
          roleId: id,
          totalColis: countForRole[0].totalColis // The total count for this role
      });
  } catch (error) {
      console.error(`Erreur lors du comptage des colis pour le rôle ${role}:`, error);
      return res.status(500).json({ message: `Erreur serveur lors du comptage des colis pour le rôle ${role}` });
  }
};
exports.countColisLivreByRole = async (req, res) => {
try {
  const { role, id } = req.params; // Get role and id from request parameters

  // If role is admin, count all "Livré" colis
  if (role === 'admin') {
    const countAllLivres = await Colis.aggregate([
      { $match: { statut: 'Livrée' } }, // Match all colis with "Livrée" status
      {
        $group: {
          _id: null, // Group all results together
          totalColis: { $count: {} } // Count the total colis
        }
      }
    ]);

    // Return the result
    return res.status(200).json({
      message: "Nombre de colis livrés pour l'admin",
      totalColis: countAllLivres[0]?.totalColis || 0 // Return the total count or 0 if none found
    });
  }

  // For other roles, continue with the original role-based logic
  const objectId = new mongoose.Types.ObjectId(id);

  // Determine the field to match based on the role
  let matchField;
  if (role === 'client') {
    matchField = 'store';
  } else if (role === 'team') {
    matchField = 'team';
  } else if (role === 'livreur') {
    matchField = 'livreur';
  } else {
    return res.status(400).json({ message: 'Rôle invalide fourni' });
  }

  // Aggregate query to count "Livré" colis for the specified role
  const countForRole = await Colis.aggregate([
    { $match: { statut: 'Livrée', [matchField]: objectId } }, // Use dynamic match field and id
    {
      $group: {
        _id: `$${matchField}`, // Group by the dynamic field
        totalColis: { $count: {} } // Count the total colis
      }
    }
  ]);
  // Return the result
  return res.status(200).json({
    message: `Nombre de colis livrés pour le ${role}`,
    roleId: id,
    totalColis: countForRole[0].totalColis // The total count for this role
  });
} catch (error) {
  console.error(`Erreur lors du comptage des colis livrés pour le ${role}:`, error);
  return res.status(500).json({ message: `Erreur serveur lors du comptage des colis livrés pour le ${role}` });
}
};
exports.countCanceledColisByRole = async (req, res) => {
try {
  const { role, id } = req.params; // Get role and id from request parameters

  // If role is admin, count all "Annulée" colis
  if (role === 'admin') {
    const countAllCanceled = await Colis.aggregate([
      { $match: { statut: 'Annulée' } }, // Match all colis with "Annulée" status
      {
        $group: {
          _id: null, // Group all results together
          totalColis: { $count: {} } // Count the total colis
        }
      }
    ]);

    // Return the result
    return res.status(200).json({
      message: "Nombre de colis annulés pour l'admin",
      totalColis: countAllCanceled[0]?.totalColis || 0 // Return the total count or 0 if none found
    });
  }

  // For other roles, continue with the original role-based logic
  const objectId = new mongoose.Types.ObjectId(id);

  // Determine the field to match based on the role
  let matchField;
  if (role === 'client') {
    matchField = 'store';
  } else if (role === 'team') {
    matchField = 'team';
  } else if (role === 'livreur') {
    matchField = 'livreur';
  } else {
    return res.status(400).json({ message: 'Rôle invalide fourni' });
  }

  // Aggregate query to count "Annulée" colis for the specified role
  const countForRole = await Colis.aggregate([
    { $match: { statut: 'Annulée', [matchField]: objectId } }, // Use dynamic match field and id
    {
      $group: {
        _id: `$${matchField}`, // Group by the dynamic field
        totalColis: { $count: {} } // Count the total colis
      }
    }
  ]);

  // Return the result
  return res.status(200).json({
    message: `Nombre de colis annulés pour le ${role}`,
    roleId: id,
    totalColis: countForRole[0]?.totalColis // The total count for this role
  });
} catch (error) {
  console.error(`Erreur lors du comptage des colis annulés pour le rôle ${role}:`, error);
  return res.status(500).json({ message: `Erreur serveur lors du comptage des colis annulés pour le rôle ${role}` });
}
};

exports.countRetourColisByRole = async (req, res) => {
  try {
    const { role, id } = req.params; // Get role and id from request parameters
  
    // If role is admin, count all "Annulée" colis
    if (role === 'admin') {
      const countAllCanceled = await Colis.aggregate([
        { $match: { statut: 'En retour' } }, // Match all colis with "Annulée" status
        {
          $group: {
            _id: null, // Group all results together
            totalColis: { $count: {} } // Count the total colis
          }
        }
      ]);
  
      // Return the result
      return res.status(200).json({
        message: "Nombre de colis retournée  pour l'admin",
        totalColis: countAllCanceled[0]?.totalColis || 0 // Return the total count or 0 if none found
      });
    }
  
    // For other roles, continue with the original role-based logic
    const objectId = new mongoose.Types.ObjectId(id);
  
    // Determine the field to match based on the role
    let matchField;
    if (role === 'client') {
      matchField = 'store';
    } else if (role === 'team') {
      matchField = 'team';
    } else if (role === 'livreur') {
      matchField = 'livreur';
    } else {
      return res.status(400).json({ message: 'Rôle invalide fourni' });
    }
  
    // Aggregate query to count "Annulée" colis for the specified role
    const countForRole = await Colis.aggregate([
      { $match: { statut: 'En retour', [matchField]: objectId } }, // Use dynamic match field and id
      {
        $group: {
          _id: `$${matchField}`, // Group by the dynamic field
          totalColis: { $count: {} } // Count the total colis
        }
      }
    ]);
    // Return the result
    return res.status(200).json({
      message: `Nombre de colis retourné`,
      roleId: id,
      totalColis: countForRole[0].totalColis // The total count for this role
    });
  } catch (error) {
    console.error(`Erreur lors du comptage des colis annulés pour le rôle :`, error);
    return res.status(500).json({ message: `Erreur serveur lors du comptage des colis annulés pour le rôle` });
  }
};
exports.countTotalGains = async (req, res) => {
  try {
    // Aggregate query to calculate the total gains for debit transactions
    const totalGainsResult = await Transaction.aggregate([
      { $match: { type: 'debit' } }, // Filter for transactions of type "debit"
      {
        $group: {
          _id: null,
          totalGains: { $sum: "$montant" } // Sum up the montant field for debit transactions
        }
      }
    ]);

    // Get the total gains or default to 0 if no results found
    const totalGains = totalGainsResult[0]?.totalGains || 0;

    return res.status(200).json({
      message: 'Total des gains pour les transactions de type débit',
      totalGains: totalGains
    });
  } catch (error) {
    console.error('Erreur lors du calcul des gains totaux:', error);
    return res.status(500).json({ message: 'Erreur serveur lors du calcul des gains totaux' });
  }
};
exports.countTotalGainsByRole = async (req, res) => { 
  try {
      const { role, id } = req.params; // Get role and id from request parameters
      const objectId = new mongoose.Types.ObjectId(id); // Convert id to ObjectId for MongoDB

      // Determine the field to match based on the role
      let matchField;
      if (role === 'client') {
          matchField = 'store';
      } else if (role === 'team') {
          matchField = 'team';
      } else if (role === 'livreur') {
          matchField = 'livreur';
      } else {
          return res.status(400).json({ message: 'Rôle invalide fourni' });
      }

      // Aggregate query to calculate the total gains for debit transactions for the specified role
      const totalGainsResult = await Transaction.aggregate([
          { 
              $match: { 
                  type: 'debit', // Filter for debit transactions
              } 
          },
          {
              $group: {
                  _id: `$${matchField}`, // Group by the role field
                  totalGains: { $sum: "$montant" } // Sum up the montant field for debit transactions
              }
          }
      ]);

      // Get the total gains or default to 0 if no results found
      const totalGains = totalGainsResult[0]?.totalGains || 0;

      return res.status(200).json({
          message: `Total des gains pour le rôle ${role} avec ID ${id}`,
          totalGains: totalGains
      });
  } catch (error) {
      console.error(`Erreur lors du calcul des gains pour le rôle ${role}:`, error);
      return res.status(500).json({ message: `Erreur serveur lors du calcul des gains pour le rôle ${role}` });
  }
};

exports.countTopVilleForStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const objectId = new mongoose.Types.ObjectId(storeId);

    const top10Villes = await Colis.aggregate([
      { $match: { store: objectId } }, // Filter by store ID
      { $group: { _id: "$ville", count: { $sum: 1 } } }, // Group by city ID and count
      { $sort: { count: -1 } }, // Sort by count in descending order
      { $limit: 10 }, // Limit to the top 10 cities
      {
        $lookup: {
          from: "villes",
          localField: "_id", // City ID in Colis
          foreignField: "_id", // City ID in Ville
          as: "villeInfo"
        }
      },
      {
        $set: {
          ville: { $arrayElemAt: ["$villeInfo.nom", 0] } // Extract city name
        }
      },
      { $project: { villeInfo: 0 } } // Remove villeInfo array
    ]);

    if (top10Villes.length === 0) {
      return res.status(404).json({ message: "Aucun colis trouvé pour ce magasin" });
    }

    res.status(200).json({
      message: "Top 10 villes avec le plus de colis pour ce magasin",
      storeId,
      top10Villes
    });
  } catch (error) {
    console.error("Erreur lors du comptage des villes:", error);
    res.status(500).json({ message: "Erreur serveur lors du comptage des villes" });
  }
};

exports.getLastTransactionByStore = async (req, res) => {
  try {
    const { storeId } = req.params; // Get store ID from request parameters

    // Check if storeId is a valid MongoDB ObjectId
    const objectId = new mongoose.Types.ObjectId(storeId);

    // Find the last transaction for the specified store, sorting by creation date
    const lastTransaction = await Transaction.findOne({ id_store: objectId })
      .sort({ createdAt: -1 }) // Sort in descending order by creation date
      .limit(1); // Limit to the most recent transaction

    // Return the latest transaction
    return res.status(200).json({
      message: 'Dernière transaction récupérée avec succès.',
      transaction: lastTransaction.montant,
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération de la dernière transaction pour le magasin ${req.params.storeId}:`, error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération de la dernière transaction.' });
  }
};

exports.getBigTransByStore = async (req, res) => {
  try {
    const { storeId } = req.params; // Get store ID from request parameters

    // Check if storeId is a valid MongoDB ObjectId
    const objectId = new mongoose.Types.ObjectId(storeId);

    // Find the largest debit transaction for the specified store
    const bigDebitTransaction = await Transaction.findOne({
      id_store: objectId,    // Filter by store ID
      type: 'debit'       // Filter by transaction type
    })
    .sort({ amount: -1 }) // Sort by amount in descending order to get the largest
    .limit(1);            // Limit to the highest transaction

    // Return the largest debit transaction
    return res.status(200).json({
      message: 'Plus grande transaction de débit récupérée avec succès.',
      transaction: bigDebitTransaction.montant,
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération de la plus grande transaction de débit pour le magasin ${req.params.storeId}:`, error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération de la plus grande transaction de débit.' });
  }
};

exports.countBenefitsPerPeriod=async(req, res) =>{
  try {
      // Define the date range (last 30 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);  // 30 days ago

      // Fetch all credit transactions within the 30-day period
      const debitTransactions = await Transaction.find({
          type: 'debit', // Assuming "debit" is the type for income/benefits
          createdAt: { $gte: startDate, $lte: endDate } // Filter within the 30-day range
        });
        console.log('debit ',debitTransactions);

      // Calculate the total benefit
      const totalBenefit = debitTransactions.reduce((sum, transaction) => {
          return sum + transaction.amount;
      }, 0);

      // Send response with total benefits
      res.status(200).json({ totalBenefit, period: "30 days" });
  } catch (error) {
      console.error("Error calculating benefits:", error);
      res.status(500).json({ message: "An error occurred while calculating benefits", error });
  }
}

exports.countColisParVille = async (req, res) => {
  try {
    const results = await Colis.aggregate([
      {
        $group: {
          _id: "$ville", // Group by city ID
          totalColis: { $sum: 1 },
          colisLivres: { $sum: { $cond: [{ $eq: ["$statut", "Livrée"] }, 1, 0] } },
          colisEnCours: { $sum: { $cond: [{ $eq: ["$statut", "en cours"] }, 1, 0] } },
          colisAnnules: { $sum: { $cond: [{ $eq: ["$statut", "Annulée"] }, 1, 0] } }
        }
      },
      {
        $lookup: {
          from: "villes", // The name of the 'Ville' collection in the database
          localField: "_id", // The city ID from Colis group (_id is ville ID)
          foreignField: "_id", // The ID field in Ville
          as: "villeDetails"
        }
      },
      {
        $unwind: "$villeDetails" // Unwind to get the first element as an object
      },
      {
        $project: {
          _id: 0,
          nomVille: "$villeDetails.nom", // City name from the Ville model
          totalColis: 1,
          colisLivres: 1,
          colisEnCours: 1,
          colisAnnules: 1,
          tauxLivraison: {
            $cond: {
              if: { $eq: ["$totalColis", 0] },
              then: 0,
              else: { $multiply: [{ $divide: ["$colisLivres", "$totalColis"] }, 100] }
            }
          },
          tauxAnnulation: {
            $cond: {
              if: { $eq: ["$totalColis", 0] },
              then: 0,
              else: { $multiply: [{ $divide: ["$colisAnnules", "$totalColis"] }, 100] }
            }
          }
        }
      },
      {
        $project: {
          nomVille: 1,
          totalColis: 1,
          colisLivres: 1,
          colisEnCours: 1,
          colisAnnules: 1,
          tauxLivraison: { $concat: [{ $toString: { $round: ["$tauxLivraison", 2] } }, "%"] },
          tauxAnnulation: { $concat: [{ $toString: { $round: ["$tauxAnnulation", 2] } }, "%"] }
        }
      }
    ]);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error counting packages by city:", error);
    res.status(500).json({ message: "An error occurred while counting packages by city", error });
  }
};

exports.countColisParLivreur = async (req, res) => {
  try {
    const results = await Colis.aggregate([
      {
        $group: {
          _id: "$livreur", // Group by livreur ID
          totalColis: { $sum: 1 },
          colisLivres: { $sum: { $cond: [{ $eq: ["$statut", "Livrée"] }, 1, 0] } },
          colisEnCours: { $sum: { $cond: [{ $eq: ["$statut", "en cours"] }, 1, 0] } },
          colisAnnules: { $sum: { $cond: [{ $eq: ["$statut", "Annulée"] }, 1, 0] } }
        }
      },
      {
        $lookup: {
          from: "livreurs", // The name of the 'Livreur' collection in the database
          localField: "_id", // The livreur ID from Colis group (_id is livreur ID)
          foreignField: "_id", // The ID field in Livreur
          as: "livreurDetails"
        }
      },
      {
        $unwind: "$livreurDetails" // Unwind to get the first element as an object
      },
      {
        $project: {
          _id: 0,
          nomLivreur: { $concat: ["$livreurDetails.nom", " ", "$livreurDetails.prenom"] }, // Full name of the livreur
          totalColis: 1,
          colisLivres: 1,
          colisEnCours: 1,
          colisAnnules: 1,
          tauxLivraison: {
            $cond: {
              if: { $eq: ["$totalColis", 0] },
              then: 0,
              else: { $multiply: [{ $divide: ["$colisLivres", "$totalColis"] }, 100] }
            }
          },
          tauxAnnulation: {
            $cond: {
              if: { $eq: ["$totalColis", 0] },
              then: 0,
              else: { $multiply: [{ $divide: ["$colisAnnules", "$totalColis"] }, 100] }
            }
          }
        }
      },
      {
        $project: {
          nomLivreur: 1,
          totalColis: 1,
          colisLivres: 1,
          colisEnCours: 1,
          colisAnnules: 1,
          tauxLivraison: { $concat: [{ $toString: { $round: ["$tauxLivraison", 2] } }, "%"] },
          tauxAnnulation: { $concat: [{ $toString: { $round: ["$tauxAnnulation", 2] } }, "%"] }
        }
      }
    ]);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error counting packages by livreur:", error);
    res.status(500).json({ message: "An error occurred while counting packages by livreur", error });
  }
};

