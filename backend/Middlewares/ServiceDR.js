// controllers/demande_retour.controller.js
const DemandeRetrait = require('../Models/Demande_Retrait');
const Notification_User = require('../Models/Notification_User');
const Payement = require('../Models/Payement');
const { Store } = require('../Models/Store');
const Transaction = require('../Models/Transaction')


// demandeRetraitService.js
const performAutomaticDemandeRetrait = async () => {
    const tarif = 5; // Fixed tariff for each withdrawal
    const seuilSolde = 105; // Minimum threshold to trigger a withdrawal
  
    // Step 1: Retrieve stores with auto_DR = true and solde >= seuilSolde
    const stores = await Store.find({ auto_DR: true, solde: { $gte: seuilSolde } });
  
    if (!stores.length) {
      throw new Error('Aucun magasin éligible pour un retrait automatique.');
    }
  
    const demandesRetrait = [];
  
    // Step 2: Iterate over eligible stores
    for (const store of stores) {
      // Retrieve the default payment method for this store
      const defaultPayement = await Payement.findOne({ clientId: store.id_client, default: true });
  
      if (!defaultPayement) {
        console.warn(`Aucun paiement par défaut trouvé pour le magasin ${store.storeName}.`);
        continue; // Skip this store and continue with the next one
      }
  
      // Calculate the amount after deducting the tariff
      const montantNet = store.solde - tarif;
  
      // Create a withdrawal request
      const demandeRetrait = new DemandeRetrait({
        id_store: store._id,
        id_payement: defaultPayement._id,
        montant: montantNet,
        tarif,
        verser: false,
      });
  
      // Save the request
      const savedDemandeRetrait = await demandeRetrait.save();
  
      // Update the store's balance
      store.solde = 0; // Reset balance after withdrawal
      await store.save();
  
      demandesRetrait.push(savedDemandeRetrait);
    }
  
    return demandesRetrait;
  };
  
  module.exports = { performAutomaticDemandeRetrait };
  