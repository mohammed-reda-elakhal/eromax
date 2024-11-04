const asyncHandler = require("express-async-handler");
const { Colis } = require("../Models/Colis");
const { default: mongoose } = require("mongoose");
const Transaction = require("../Models/Transaction");


exports.countColisLivre = async (req, res) => {
    try {
      // Count the number of colis with the status "Livré"
      const colisCount = await Colis.countDocuments({ statut: 'Livrée' });
      
      // Return the count in the response
      return res.status(200).json({ message: 'Nombre de colis livrés', count: colisCount });
    } catch (error) {
      console.error('Erreur lors du comptage des colis livrés:', error);
      return res.status(500).json({ message: 'Erreur serveur lors du comptage des colis livrés' });
    }
  };
  
  
  exports.countColisLivreByClient = async (req, res) => {
    try {
      const { storeId } = req.params; // Get storeId from request parameters
      const storeObjectId = new mongoose.Types.ObjectId(storeId);

      // Aggregate query to count "Livré" colis for a specific store
      const countForStore = await Colis.aggregate([
        { $match: { statut: 'Livrée', store: storeObjectId } }, // Filter by statut 'Livrée' and storeId
        {
          $group: {
            _id: "$store", // Group by storeId
            totalColis: { $count: {} }, // Count the total colis for this store
          }
        }
      ]);
  
      if (countForStore.length === 0) {
        return res.status(404).json({ message: 'Aucun colis livré trouvé pour ce magasin' });
      }
  
      // Return the result
      return res.status(200).json({
        message: 'Nombre de colis livrés pour le magasin',
        storeId: storeId,
        totalColis: countForStore[0].totalColis // The total count for this store
      });
    } catch (error) {
      console.error('Erreur lors du comptage des colis livrés pour le magasin:', error);
      return res.status(500).json({ message: 'Erreur serveur lors du comptage des colis livrés pour le magasin' });
    }
  };
  
  
  
  exports.countColisLivreByTeam = async (req, res) => {
    try {
      const { teamId } = req.params; // Get teamId from request parameters
  
      // Aggregate query to count "Livré" colis for a specific team
      const countForTeam = await Colis.aggregate([
        { $match: { statut: 'Livré', team: teamId } }, // Filter by statut 'Livré' and teamId
        {
          $group: {
            _id: "$team", // Group by team
            totalColis: { $count: {} }, // Count the total colis for this team
          }
        }
      ]);
  
      if (countForTeam.length === 0) {
        return res.status(404).json({ message: 'Aucun colis livré trouvé pour cette équipe' });
      }
  
      // Return the result
      return res.status(200).json({
        message: 'Nombre de colis livrés pour l\'équipe',
        teamId: teamId,
        totalColis: countForTeam[0].totalColis // The total count for this team
      });
    } catch (error) {
      console.error('Erreur lors du comptage des colis livrés pour l\'équipe:', error);
      return res.status(500).json({ message: 'Erreur serveur lors du comptage des colis livrés pour l\'équipe' });
    }
  };
  
  
  exports.countColisLivreByLivreur = async (req, res) => {
    try {
      const { livreurId } = req.params; // Get livreurId from request parameters
  
      // Aggregate query to count "Livré" colis for a specific livreur
      const countForLivreur = await Colis.aggregate([
        { $match: { statut: 'Livré', livreur: livreurId } }, // Filter by statut 'Livré' and livreurId
        {
          $group: {
            _id: "$livreur", // Group by livreur
            totalColis: { $count: {} }, // Count the total colis for this livreur
          }
        }
      ]);
  
      if (countForLivreur.length === 0) {
        return res.status(404).json({ message: 'Aucun colis livré trouvé pour ce livreur' });
      }
  
      // Return the result
      return res.status(200).json({
        message: 'Nombre de colis livrés pour le livreur',
        livreurId: livreurId,
        totalColis: countForLivreur[0].totalColis // The total count for this livreur
      });
    } catch (error) {
      console.error('Erreur lors du comptage des colis livrés pour le livreur:', error);
      return res.status(500).json({ message: 'Erreur serveur lors du comptage des colis livrés pour le livreur' });
    }
  };
  
  
  exports.countColis = async (req, res) => {
    try {
      // Aggregate query to count all colis except those with statut 'Livrée'
      const count = await Colis.aggregate([
        { $match: { statut: { $ne: 'Livrée' } } }, // Exclude colis that are delivered
        {
          $group: {
            _id: null, // Grouping all results together
            totalColis: { $count: {} } // Count the total colis
          }
        }
      ]);
  
      // If no colis found
      if (count.length === 0) {
        return res.status(200).json({ message: 'Aucun colis trouvé', totalColis: 0 });
      }
  
      // Return the result
      return res.status(200).json({
        message: 'Total de colis (excluant ceux livrés)',
        totalColis: count[0].totalColis // The total count of colis excluding 'Livrée'
      });
    } catch (error) {
      console.error('Erreur lors du comptage des colis:', error);
      return res.status(500).json({ message: 'Erreur serveur lors du comptage des colis' });
    }
  };
  
  exports.countColisByClinet = async (req, res) => {
    try {
      const { storeId } = req.params; // Get storeId from request parameters
  
      // Aggregate query to count colis for a specific store excluding those with statut 'Livrée'
      const countForStore = await Colis.aggregate([
        { $match: { statut: { $ne: 'Livrée' }, store: storeId } }, // Exclude delivered colis for the specific store
        {
          $group: {
            _id: "$store", // Group by storeId
            totalColis: { $count: {} } // Count the total colis for this store
          }
        }
      ]);
  
      // If no colis found
      if (countForStore.length === 0) {
        return res.status(200).json({ message: 'Aucun colis trouvé pour ce magasin', totalColis: 0 });
      }
  
      // Return the result
      return res.status(200).json({
        message: 'Total de colis (excluant ceux livrés) pour le magasin',
        storeId: storeId,
        totalColis: countForStore[0].totalColis // The total count for this store
      });
    } catch (error) {
      console.error('Erreur lors du comptage des colis par magasin:', error);
      return res.status(500).json({ message: 'Erreur serveur lors du comptage des colis par magasin' });
    }
  };
  
  
  exports.countColisByTeam = async (req, res) => {
    try {
      const { teamId } = req.params; // Get teamId from request parameters
  
      // Aggregate query to count colis for a specific team excluding those with statut 'Livrée'
      const countForTeam = await Colis.aggregate([
        { $match: { statut: { $ne: 'Livrée' }, team: teamId } }, // Exclude delivered colis for the specific team
        {
          $group: {
            _id: "$team", // Group by teamId
            totalColis: { $count: {} } // Count the total colis for this team
          }
        }
      ]);
  
      // If no colis found
      if (countForTeam.length === 0) {
        return res.status(200).json({ message: 'Aucun colis trouvé pour cette équipe', totalColis: 0 });
      }
  
      // Return the result
      return res.status(200).json({
        message: 'Total de colis (excluant ceux livrés) pour l\'équipe',
        teamId: teamId,
        totalColis: countForTeam[0].totalColis // The total count for this team
      });
    } catch (error) {
      console.error('Erreur lors du comptage des colis par équipe:', error);
      return res.status(500).json({ message: 'Erreur serveur lors du comptage des colis par équipe' });
    }
  };
  
  
  exports.countColisByLivreur = async (req, res) => {
    try {
      const { livreurId } = req.params; // Get livreurId from request parameters
  
      // Aggregate query to count colis for a specific livreur excluding those with statut 'Livrée'
      const countForLivreur = await Colis.aggregate([
        { $match: { statut: { $ne: 'Livrée' }, livreur: livreurId } }, // Exclude delivered colis for the specific livreur
        {
          $group: {
            _id: "$livreur", // Group by livreurId
            totalColis: { $count: {} } // Count the total colis for this livreur
          }
        }
      ]);
  
      // If no colis found
      if (countForLivreur.length === 0) {
        return res.status(200).json({ message: 'Aucun colis trouvé pour ce livreur', totalColis: 0 });
      }
  
      // Return the result
      return res.status(200).json({
        message: 'Total de colis (excluant ceux livrés) pour le livreur',
        livreurId: livreurId,
        totalColis: countForLivreur[0].totalColis // The total count for this livreur
      });
    } catch (error) {
      console.error('Erreur lors du comptage des colis par livreur:', error);
      return res.status(500).json({ message: 'Erreur serveur lors du comptage des colis par livreur' });
    }
  };
  


exports.countColisLivreByRole = async (req, res) => {
  try {
    const { role, id } = req.params; // Get role and id from request parameters
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
      return res.status(400).json({ message: 'Role invalide fourni' });
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
      return res.status(400).json({ message: 'Role invalide fourni' });
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

    if (countForRole.length === 0) {
      return res.status(404).json({ message: `Aucun colis annulé trouvé pour ce ${role}` });
    }

    // Return the result
    return res.status(200).json({
      message: `Nombre de colis annulés pour le ${role}`,
      roleId: id,
      totalColis: countForRole[0].totalColis // The total count for this role
    });
  } catch (error) {
    console.error(`Erreur lors du comptage des colis annulés pour le ${role}:`, error);
    return res.status(500).json({ message: `Erreur serveur lors du comptage des colis annulés pour le ${role}` });
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

