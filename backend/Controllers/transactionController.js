// controllers/transaction.controller.js
const { Store } = require('../Models/Store');
const Transaction = require('../Models/Transaction');

exports.createTransaction = async (req, res) => {
    try {
        const transaction = new Transaction(req.body);
        await transaction.save();

        // Assuming you have the id_store available in transaction
        const store = await Store.findById(transaction.id_store); // Fetch the store based on the transaction
        if (!store) {
            return res.status(404).json({ error: "Store not found" });
        }

        let somme = store.somme; // Use let instead of const
        const montant = transaction.montant;
        console.log(somme);

        if (transaction.type === 'debit') {
            somme += montant; // Increment somme
        } else if (transaction.type === 'credit') {
            somme -= montant; // If you also handle credits, for example
        }

        console.log('nouveau somme', somme);

        // Update the store with the new somme value
        store.somme = somme;
        await store.save(); // Save the updated store

        res.status(201).json(transaction);
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: error.message });
    }
};


exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
    .populate({
      path: 'id_store',           // Populate id_store (Store)
      populate: { path: 'id_client' } // Then populate id_client from Store
    })
    .sort({ createdAt: -1 })

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getTransactionsByClient = async (req, res) => {
  try {
    const id_store = req.params.id_user ; 
    const transactions = await Transaction.find( {id_store})
    .populate({
      path: 'id_store',           // Populate id_store (Store)
      populate: { path: 'id_client' } // Then populate id_client from Store
    })
    .sort({ createdAt: -1 })
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.countTotalGainsByRole = async (req, res) => {
  try {
    const { role, id } = req.params; // Get role and id from request parameters
    const objectId = new mongoose.Types.ObjectId(id);

    // Determine the field to match based on the role
    let matchField;
    if (role === 'client') {
      matchField = 'id_store';
    } else if (role === 'team') {
      matchField = 'id_team';
    } else if (role === 'livreur') {
      matchField = 'id_livreur';
    } else {
      return res.status(400).json({ message: 'Role invalide fourni' });
    }

    // Aggregate query to calculate the total gains for debit transactions by role
    const totalGainsResult = await Transaction.aggregate([
      { $match: { type: 'debit', [matchField]: objectId } }, // Filter by debit type and dynamic role ID
      {
        $group: {
          _id: null,
          totalGains: { $sum: "$montant" } // Sum up the montant field for debit transactions
        }
      }
    ]);

    const totalGains = totalGainsResult[0]?.totalGains || 0;

    return res.status(200).json({
      message: `Total des gains pour le rôle ${role}`,
      roleId: id,
      totalGains: totalGains
    });
  } catch (error) {
    console.error(`Erreur lors du calcul des gains pour le rôle ${role}:`, error);
    return res.status(500).json({ message: `Erreur serveur lors du calcul des gains pour le rôle ${role}` });
  }
};
