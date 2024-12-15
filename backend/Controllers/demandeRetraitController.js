// controllers/demande_retour.controller.js
const { performAutomaticDemandeRetrait } = require('../Middlewares/ServiceDR');
const DemandeRetrait = require('../Models/Demande_Retrait');
const Notification_User = require('../Models/Notification_User');
const Payement = require('../Models/Payement');
const { Store } = require('../Models/Store');
const Transaction = require('../Models/Transaction')

exports.createDemandeRetrait = async (req, res) => {
  try {
    const { id_store, id_payement, montant } = req.body;

    // Declare tarif
    const tarif = 5; // Tariff in DH

    // Calculate the adjusted montant
    const montantStocked = montant - tarif;

    // Ensure that the montant after deduction is not negative
    if (montantStocked < 0) {
      return res.status(400).json({
        message: "Le montant après déduction du tarif ne peut pas être négatif.",
      });
    }

    // Validation: Check if montant is >= 100
    if (montant < 100) {
      return res.status(400).json({
        message: "Le montant doit être supérieur ou égal à 100 DH.",
      });
    }

    // Fetch the store to verify solde
    const store = await Store.findById(id_store);
    if (!store) {
      return res.status(404).json({
        message: "Store non trouvé.",
      });
    }

    // Validation: Check if store.solde >= montant
    if (store.solde < montant) {
      return res.status(400).json({
        message: "Solde insuffisant pour effectuer cette demande de retrait.",
      });
    }


    const latestDemandeRetrait = await DemandeRetrait.findOne({ id_store })
      .sort({ createdAt: -1 });

    if (latestDemandeRetrait) {
      const now = new Date();
      const lastDemandeTime = latestDemandeRetrait.createdAt;
      const hoursDifference = Math.abs(now - lastDemandeTime) / 36e5; // Convert milliseconds to hours

      // Validation: Check if at least 24 hours have passed since the last DemandeRetrait
      if (hoursDifference < 24) {
        return res.status(400).json({
          message: "Vous devez attendre 24 heures entre deux demandes de retrait.",
        });
      }
    }
    

    // Create a new DemandeRetrait instance
    const newDemandeRetrait = new DemandeRetrait({
      id_store,
      id_payement,
      montant: montantStocked, // Store the adjusted montant
      tarif,
      verser: false,
    });

    // Save the new DemandeRetrait to the database
    const savedDemandeRetrait = await newDemandeRetrait.save();

    // **New Operation:** Deduct the montant from the store's solde after successful creation
    // It's better to use the already fetched store to avoid an additional database call
    store.solde -= montant; // Deduct the original montant
    await store.save();

    // Send a success response
    res.status(201).json({
      message: 'Demande de retrait créée avec succès!',
      data: savedDemandeRetrait,
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      message: 'Erreur lors de la création de la demande de retrait.',
      error: error.message,
    });
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
      })
      .sort({ updatedAt: -1 }) // -1 for descending order

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
    })
    .sort({ updatedAt: -1 }) // -1 for descending order
    res.status(200).json(demandes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verserDemandeRetrait = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the DemandeRetrait by ID and populate 'id_store'
    const demandeRetrait = await DemandeRetrait.findById(id).populate('id_store');

    if (!demandeRetrait) {
      return res.status(404).json({ message: 'Demande de retrait non trouvée' });
    }

    // Check if 'verser' is already true
    if (demandeRetrait.verser) {
      return res.status(400).json({ message: 'La demande de retrait a déjà été versée.' });
    }

    // Update 'verser' status to true
    demandeRetrait.verser = true;
    await demandeRetrait.save();

    
    // Create a new Transaction
    const transaction = new Transaction({
      id_store: demandeRetrait.id_store,
      montant: demandeRetrait.montant,
      type: 'credit', // Transaction of type 'credit'
    });
    await transaction.save();

    // Create a notification for the user about the successful withdrawal
    const notification = new Notification_User({
      id_store: store._id,
      title: 'Demande de retrait',
      description: `Votre demande de retrait d'un montant de ${demandeRetrait.montant} MAD a été versée avec succès. 💵🤑`,
    });
    await notification.save(); // Save the notification

    // Send a success response
    res.status(200).json({
      message: 'Versement effectué avec succès 💵🤑',
      data: { demandeRetrait, transaction },
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      message: 'Erreur lors de la mise à jour du versement',
      error: error.message,
    });
  }
};


exports.createAutomaticDemandeRetrait = async (req, res) => {
  try {
    const demandesRetrait = await performAutomaticDemandeRetrait();
    res.status(201).json({
      message: 'Demandes de retrait automatiques créées avec succès.',
      data: demandesRetrait,
    });
    console.log('Demandes de retrait créées:', demandesRetrait);
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la création des demandes de retrait automatiques.',
      error: error.message,
    });
  }
};

