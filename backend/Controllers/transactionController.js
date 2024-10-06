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
    const transactions = await Transaction.find().populate('id_store');
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
