const asyncHandler = require("express-async-handler");
const { Colis } = require("../Models/Colis");
const { default: mongoose } = require("mongoose");
const Transaction = require("../Models/Transaction");



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

      // If no colis found for the role
      if (countForRole.length === 0) {
          return res.status(200).json({ message: `Aucun colis trouvé pour ce ${role}`, totalColis: 0 });
      }

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

  if (countForRole.length === 0) {
    return res.status(404).json({ message: `Aucun colis livré trouvé pour ce ${role}` });
  }

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
  
    if (countForRole.length === 0) {
      return res.status(404).json({ message: `Aucun colis retournée trouvé pour ce ${role}` });
    }
  
    // Return the result
    return res.status(200).json({
      message: `Nombre de colis retourné`,
      roleId: id,
      totalColis: countForRole[0].totalColis // The total count for this role
    });
  } catch (error) {
    console.error(`Erreur lors du comptage des colis annulés pour le rôle ${role}:`, error);
    return res.status(500).json({ message: `Erreur serveur lors du comptage des colis annulés pour le rôle ${role}` });
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

exports.countTopVilleForClient = async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const objectId = new mongoose.Types.ObjectId(clientId);

    const top10Villes = await Colis.aggregate([
      { $match: { clientId: objectId } }, // Filter by client ID
      { $group: { _id: "$ville", count: { $sum: 1 } } }, // Group by city and count occurrences
      { $sort: { count: -1 } }, // Sort by count in descending order
      { $limit: 10 } // Limit to the top 10 cities
    ]);

    if (top10Villes.length === 0) {
      return res.status(404).json({ message: "Aucun colis trouvé pour ce client" });
    }

    // Return the result
    res.status(200).json({
      message: "Top 10 villes avec le plus de colis pour ce client",
      clientId,
      top10Villes
    });
  } catch (error) {
    console.error("Erreur lors du comptage des villes:", error);
    res.status(500).json({ message: "Erreur serveur lors du comptage des villes" });
  }
};

exports.getLatestTransactionForClient = async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const latestTransaction = await Transaction.findOne({ clientId })
      .sort({ createdAt: -1 }) // Sort by date in descending order
      .exec();

    if (!latestTransaction) {
      return res.status(404).json({ message: "Aucune transaction trouvée pour ce client" });
    }

    res.status(200).json({
      message: "Dernière transaction pour le client",
      transaction: latestTransaction,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la dernière transaction:", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération de la dernière transaction" });
  }
};