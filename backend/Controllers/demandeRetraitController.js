// controllers/demande_retour.controller.js
const DemandeRetrait = require('../Models/Demande_Retrait');
const Notification_User = require('../Models/Notification_User');
const { Store } = require('../Models/Store');
const Transaction = require('../Models/Transaction')


exports.createDemandeRetrait = async (req, res) => {
  try {
    const { id_store } = req.body; // Assuming the store ID is tied to the user
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Find the latest demande retrait by this store (or user)
    const lastDemande = await DemandeRetrait.findOne({
      id_store: id_store, // Filter by store/user
      createdAt: { $gte: oneDayAgo }, // Only consider demandes created within the last 24 hours
    });

    // If a demande exists within the last 24 hours, prevent the new creation
    if (lastDemande) {
      return res.status(400).json({
        message: 'Vous ne pouvez soumettre qu\'une seule demande de retrait toutes les 24 heures.',
      });
    }

    // Create a new demande retrait
    const demandeRetrait = new DemandeRetrait(req.body);
    await demandeRetrait.save();
    res.status(201).json( {message : "Votre demande est bien reçu attendez pour effectuer votre verment" , data : demandeRetrait});

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getAllDemandesRetrait = async (req, res) => {
  try {
    const demandes = await DemandeRetrait.find()
      .populate({
        path: 'id_store',           // Populate id_store (Store)
        populate: { path: 'id_client' } // Then populate id_client from Store
      })
      .populate({
        path: 'id_payement',        // Populate id_payement (Payment)
        populate: { path: 'idBank' }    // Then populate idBank from Payment
      });

    res.status(200).json(demandes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getDemandesRetraitByClient = async (req, res) => {
  try {
    const demandes = await DemandeRetrait.find({id_store : req.params.id_user}) 
    .populate({
      path: 'id_store',           // Populate id_store (Store)
      populate: { path: 'id_client' } // Then populate id_client from Store
    })
    .populate({
      path: 'id_payement',        // Populate id_payement (Payment)
      populate: { path: 'idBank' }    // Then populate idBank from Payment
    });
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
    // Créer une notification pour l'utilisateur concernant le versement de la demande de retrait

    const notification = new Notification_User({
      storeId: store._id,
      clientId: store.id_client,  // Assuming `clientId` is a field in the `store` model representing the user
      description: `Votre demande de retrait d'un montant de ${demandeRetrait.montant} MAD a été versée avec succès.`,
    });
    await notification.save();  // Sauvegarder la notification

    res.status(200).json({
        message: 'Versement effectué avec succès 💵🤑',
        data: { demandeRetrait, transaction }
    });

  } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour du versement', error: error.message });
  }
};
