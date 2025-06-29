const asyncHandler = require("express-async-handler");
const { Colis } = require("../Models/Colis");
const { default: mongoose } = require("mongoose");
const Transaction = require("../Models/Transaction");
const { subDays } = require('date-fns'); // Optionally use date-fns for date handling
const { Store } = require("../Models/Store");
const { Wallet } = require("../Models/Wallet"); // Import Wallet model
const { Transfer } = require("../Models/Transfer");
const { Withdrawal } = require("../Models/Withdrawal");



exports.colisStatic = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const userStore = req.user.store;

    // Conditions for each status
    const colisLivreeCondition = { statut: "Livrée" };
    const colisRefuseeCondition = { statut: { $in: ["Refusée", "Annulée"] } };
    const colisEnCoursCondition = {
      statut: {
        $in: [
          "Nouveau Colis",
          "attente de ramassage",
          "Ramassée",
          "Expediée",
          "Reçu",
          "Mise en Distribution",
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
          "Programmée",
        ],
      },
    };
    const colisEnRetourCondition = { statut: "En Retour" };

    let colisLivreeCount = 0;
    let colisRefuseeCount = 0;
    let colisEnCoursCount = 0;
    let colisEnRetourCount = 0;

    // Query adjustment based on user role
    let baseCondition = {};
    if (userRole === "admin") {
      baseCondition = {}; // Admin has no restrictions
    } else if (userRole === "client") {
      baseCondition = { store: new mongoose.Types.ObjectId(userStore) }; // Client restricted by store
    } else if (userRole === "livreur") {
      baseCondition = { livreur: new mongoose.Types.ObjectId(userId) }; // Livreur restricted by their ID
    } else {
      return res
        .status(403)
        .json({ message: "You do not have permission to access these statistics." });
    }

    // Fetch counts
    colisLivreeCount = await Colis.countDocuments({ ...baseCondition, ...colisLivreeCondition });
    colisRefuseeCount = await Colis.countDocuments({ ...baseCondition, ...colisRefuseeCondition });
    colisEnCoursCount = await Colis.countDocuments({ ...baseCondition, ...colisEnCoursCondition });
    colisEnRetourCount = await Colis.countDocuments({ ...baseCondition, ...colisEnRetourCondition });

    // Return results with message
    return res.status(200).json({
      message: `Statistics of colis retrieved successfully for role: ${userRole}`,
      role: userRole,
      data: {
        colisLivree: colisLivreeCount,
        colisRefusee: colisRefuseeCount,
        colisEnCours: colisEnCoursCount,
        colisEnRetour: colisEnRetourCount,
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "Server error while counting colis." });
  }
};


exports.transactionStatistics = async (req, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const userStore = req.user.store;

      // Verify the user role
      if (userRole !== "client") {
        return res.status(403).json({ message: "Access denied. Only clients can access this resource." });
      }

      // Ensure the store ID is provided
      if (!userStore) {
        return res.status(400).json({ message: "Store ID is not defined for the user." });
      }

      // Convert store ID to ObjectId
      const storeId = new mongoose.Types.ObjectId(userStore);

      // 1. Total transactions with type "debit" for the user's store
      const totalDebitTransactions = await Transaction.aggregate([
        { $match: { id_store: storeId, type: "debit" } },
        { $group: { _id: null, total: { $sum: "$montant" } } },
      ]);

      // 2. The last transaction montant for the user's store
      const lastTransaction = await Transaction.findOne({ id_store: storeId })
        .sort({ createdAt: -1 }) // Sort by descending creation date
        .select("montant") // Select only the montant field
        .lean();

      // 3. The largest transaction montant with type "debit" for the user's store
      const largestDebitTransaction = await Transaction.findOne({ id_store: storeId, type: "debit" })
        .sort({ montant: -1 }) // Sort by descending montant
        .select("montant") // Select only the montant field
        .lean();

      // Prepare the results
      const result = {
        totalDebit: totalDebitTransactions[0]?.total || 0, // Default to 0 if no results
        lastTransaction: lastTransaction?.montant || 0, // Default to 0 if no transaction exists
        largestDebitTransaction: largestDebitTransaction?.montant || 0, // Default to 0 if no transaction exists
      };

      // Return the results
      return res.status(200).json({
        message: "Transaction statistics retrieved successfully.",
        role: userRole,
        data: result,
      });
    } catch (error) {
      console.error("Server error:", error);
      return res.status(500).json({ message: "Server error while retrieving transaction statistics." });
    }
};



exports.getTopVilles = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const userStore = req.user.store;

    // Define a base match condition based on the user's role
    let baseMatch = {};

    if (userRole === "admin") {
      // Admin: No additional filtering
      baseMatch = {};
    } else if (userRole === "client") {
      // Client: Filter by store
      baseMatch = { store: new mongoose.Types.ObjectId(userStore) };
    } else if (userRole === "livreur") {
      // Livreur: Filter by livreur ID
      baseMatch = { livreur: new mongoose.Types.ObjectId(userId)  };
    } else {
      return res.status(403).json({ message: "Access denied. Invalid user role." });
    }

    // Aggregate to group by ville and count the number of colis
    const topVilles = await Colis.aggregate([
      { $match: baseMatch }, // Apply role-based filter
      {
        $group: {
          _id: "$ville", // Group by ville ID
          count: { $sum: 1 }, // Count the number of colis
        },
      },
      { $sort: { count: -1 } }, // Sort by count in descending order
      { $limit: 10 }, // Limit to the top 10 villes
      {
        $lookup: {
          from: "villes", // Reference the Ville collection
          localField: "_id", // Match _id (ville in Colis)
          foreignField: "_id", // Match _id in Ville
          as: "villeDetails", // Populate ville details
        },
      },
      { $unwind: "$villeDetails" }, // Unwind the array to make it a single object
      {
        $project: {
          _id: 0, // Exclude the default _id field
          ville: "$villeDetails.nom", // Include the ville name
          count: 1, // Include the count of colis
        },
      },
    ]);

    res.status(200).json({
      message: `Top 10 villes retrieved successfully by ${userRole}`,
      data: topVilles,
    });
  } catch (error) {
    console.error("Error retrieving top villes:", error);
    res.status(500).json({ message: "Server error while retrieving top villes" });
  }
});




exports.getTopClient = async (req, res) => {
  try {
    // Aggregate to count the number of colis processed by each store
    const topStores = await Colis.aggregate([
      {
        $group: {
          _id: "$store", // Group by store ID
          count: { $sum: 1 }, // Count the number of parcels for each store
        },
      },
      { $sort: { count: -1 } }, // Sort by the count of parcels in descending order
      { $limit: 10 }, // Limit to the top 10 stores
      {
        $lookup: {
          from: "stores", // Reference the Store collection
          localField: "_id", // Match _id (store in Colis)
          foreignField: "_id", // Match _id in Store
          as: "storeDetails", // Populate store details
        },
      },
      { $unwind: "$storeDetails" }, // Unwind the array to make it a single object
      {
        $project: {
          _id: 0, // Exclude the default _id field
          storeName: "$storeDetails.storeName", // Store name
          profileImage: "$storeDetails.image.url", // Store profile image URL
          colisCount: "$count", // Number of parcels processed by the store
        },
      },
    ]);

    // Return the result
    res.status(200).json({
      message: "Top 10 stores retrieved successfully",
      data: topStores,
    });
  } catch (error) {
    console.error("Error retrieving top stores:", error);
    res.status(500).json({ message: "Server error while retrieving top stores" });
  }
};





exports.colisCountUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const userRole = req.params.role;

    let countColis

   
    // Return results with message
    return res.status(200).json({
      message: `Statistics of colis retrieved successfully for role: ${userRole}`,
      role: userRole,
      data: {
        colisLivree: colisLivreeCount,
       
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "Server error while counting colis." });
  }
};

// Controller: getColisReporteeProgramméeCodes
exports.getColisReporteeProgramméeCodes = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const userStore = req.user.store;

    // Build base condition based on user role
    let baseCondition = {};
    if (userRole === "admin") {
      baseCondition = {}; // Admin has no restrictions
    } else if (userRole === "client") {
      baseCondition = { store: new mongoose.Types.ObjectId(userStore) }; // Client restricted by store
    } else if (userRole === "livreur") {
      baseCondition = { livreur: new mongoose.Types.ObjectId(userId) }; // Livreur restricted by their ID
    } else {
      return res.status(403).json({ 
        message: "You do not have permission to access these statistics." 
      });
    }

    // Condition to fetch colis with statut "Reportée" or "Programmée"
    const statusCondition = { statut: { $in: ["Reporté", "Programmée"] } };

    // Merge base condition with status condition
    const queryCondition = { ...baseCondition, ...statusCondition };

    // Execute both queries concurrently:
    const [count, codes] = await Promise.all([
      Colis.countDocuments(queryCondition),
      Colis.find(queryCondition).select('code_suivi -_id')
    ]);

    return res.status(200).json({
      message: "List of codes and count retrieved successfully.",
      count,
      codes,
      userRole,
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      message: "Server error while retrieving colis statistics."
    });
  }
};

exports.getLastTransfer = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const userStore = req.user.store;

    // Verify the user role
    if (userRole !== "client") {
      return res.status(403).json({ message: "Access denied. Only clients can access this resource." });
    }

    // Ensure the store ID is provided
    if (!userStore) {
      return res.status(400).json({ message: "Store ID is not defined for the user." });
    }

    // Convert store ID to ObjectId
    const storeId = new mongoose.Types.ObjectId(userStore);

    // Find the wallet associated with the store
    const wallet = await Wallet.findOne({ store: storeId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found for the user's store." });
    }

    // Find the last transfer related to the wallet
    const lastTransfer = await Transfer.findOne({ wallet: wallet._id })
      .sort({ createdAt: -1 }) // Sort by descending creation date
      .select("montant") // Select only the montant field
      .lean();

    // Calculate the total of transfer.montant for the wallet (only for specific types)
    const totalTransfers = await Transfer.aggregate([
      { $match: { wallet: wallet._id, type: { $in: ['Deposit', 'Correction', 'Manuel Depot'] } } },
      { $group: { _id: null, total: { $sum: "$montant" } } },
    ]);

    // Find the largest transfer related to the wallet
    const largestTransfer = await Transfer.findOne({ wallet: wallet._id })
      .sort({ montant: -1 }) // Sort by descending montant
      .select("montant") // Select only the montant field
      .lean();

    // Prepare the response
    return res.status(200).json({
      message: "Transfer statistics retrieved successfully.",
      data: {
        walletId: wallet._id,
        lastTransferMontant: lastTransfer?.montant || 0,
        totalTransfers: totalTransfers[0]?.total || 0,
        largestTransferMontant: largestTransfer?.montant || 0,
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "Server error while retrieving transfer statistics." });
  }
};

exports.getTransferStatistics = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const userStore = req.user.store;

    // Verify the user role
    if (userRole !== "client") {
      return res.status(403).json({ message: "Access denied. Only clients can access this resource." });
    }

    // Ensure the store ID is provided
    if (!userStore) {
      return res.status(400).json({ message: "Store ID is not defined for the user." });
    }

    // Convert store ID to ObjectId
    const storeId = new mongoose.Types.ObjectId(userStore);

    // Find the wallet associated with the store
    const wallet = await Wallet.findOne({ store: storeId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found for the user's store." });
    }

    // Find the last transfer related to the wallet
    const lastTransfer = await Transfer.findOne({ wallet: wallet._id })
      .sort({ createdAt: -1 })
      .select("montant")
      .lean();

    // Calculate the total of transfer.montant for the wallet (only for specific types)
    const totalTransfers = await Transfer.aggregate([
      { $match: { wallet: wallet._id, type: { $in: ['Deposit', 'Correction', 'Manuel Depot'] } } },
      { $group: { _id: null, total: { $sum: "$montant" } } },
    ]);

    // Find the largest transfer related to the wallet
    const largestTransfer = await Transfer.findOne({ wallet: wallet._id })
      .sort({ montant: -1 })
      .select("montant")
      .lean();

    // Prepare the response
    return res.status(200).json({
      message: "Transfer statistics retrieved successfully.",
      data: {
        walletId: wallet._id,
        lastTransferMontant: lastTransfer?.montant || 0,
        totalTransfers: totalTransfers[0]?.total || 0,
        largestTransferMontant: largestTransfer?.montant || 0,
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "Server error while retrieving transfer statistics." });
  }
};

exports.WithdrawalNotComplete = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const userStore = req.user.store;

    // Verify user role
    if (userRole !== "client") {
      return res.status(403).json({ message: "Access denied. Only clients can access this resource." });
    }

    // Get the wallet associated with the store
    const wallet = await Wallet.findOne({ store: userStore });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found for the user's store." });
    }

    // Count withdrawals that are not complete (not 'done' or 'rejected')
    const incompleteCount = await Withdrawal.countDocuments({
      wallet: wallet._id,
      status: { 
        $nin: ['done', 'rejected']
      }
    });

    return res.status(200).json({
      message: "Incomplete withdrawals count retrieved successfully",
      count: incompleteCount
    });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "Server error while counting incomplete withdrawals." });
  }
};
