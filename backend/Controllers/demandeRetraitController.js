// controllers/demande_retour.controller.js
const DemandeRetrait = require('../Models/Demande_Retrait');
const { Store } = require('../Models/Store');
const Transaction = require('../Models/Transaction')
exports.createDemandeRetrait = async (req, res) => {
  try {
    const demandeRetrait = new DemandeRetrait(req.body);
    await demandeRetrait.save();
    res.status(201).json(demandeRetrait);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllDemandesRetrait = async (req, res) => {
  try {
    const demandes = await DemandeRetrait.find().populate('id_store id_payement');
    res.status(200).json(demandes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verserDemandeRetrait = async (req, res) => {
  const { id } = req.params;

  try {
      const demandeRetrait = await DemandeRetrait.findById(id).populate('id_store');
      const storeId=demandeRetrait.id_store
      if (!demandeRetrait) {
          return res.status(404).json({ message: 'Demande de retrait non trouvée' });
      }

      // Met à jour le statut "verser" à true
      demandeRetrait.verser = true;
      await demandeRetrait.save();
      
      const store= await Store.findById(storeId);
      store.solde -= demandeRetrait.montant;
      await store.save();

      const transaction = new Transaction({
        id_store: demandeRetrait.id_store,
        montant: demandeRetrait.montant,
        type: 'credit', // Transaction de type crédit
    });
    await transaction.save();

 

    res.status(200).json({
        message: 'Versement effectué avec succès et transaction créée',
        data: { demandeRetrait, transaction }
    });

  } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour du versement', error: error.message });
  }
};
