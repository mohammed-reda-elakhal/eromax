const { Colis } = require('../Models/Colis'); 
const Facture = require('../Models/Facture');
const moment = require('moment');
const asyncHandler = require('express-async-handler');
const shortid = require('shortid');
const { Suivi_Colis } = require('../Models/Suivi_Colis');
const { Store } = require('../Models/Store');
const { Livreur } = require('../Models/Livreur');
const cron = require('node-cron');
const Transaction = require('../Models/Transaction');
const NotificationUser = require('../Models/Notification_User');
const Promotion = require('../Models/Promotion'); // Import the Promotion model
const { createAutomaticDemandeRetrait } = require('./demandeRetraitController');

// Function to generate code_facture
const generateCodeFacture = (date) => {
    const formattedDate = moment(date).format('YYYYMMDD');
    const randomNumber = shortid.generate().slice(0, 6).toUpperCase(); // Shorten and uppercase for readability
    return `FCTL${formattedDate}-${randomNumber}`;
};

// Helper function to get `date_livraison` from `Suivi_Colis`
const getDeliveryDate = async (code_suivi) => {
    const suiviColis = await Suivi_Colis.findOne({ code_suivi }).lean();
    if (suiviColis) {
        const livraison = suiviColis.status_updates.find(status => ['Livrée', 'Refusée'].includes(status.status));
        return livraison ? livraison.date : null; // Return the delivery date if found
    }
    return null;
};




// Helper function to apply promotion
const applyPromotion = (storeId, originalTarifLivraison, activePromotions) => {
    const storeIdStr = storeId.toString();

    // Filter store-specific promotions
    const storeSpecificPromotions = activePromotions.filter(promo =>
        promo.appliesTo === 'specific' &&
        promo.clients.map(client => client.toString()).includes(storeIdStr)
    );

    // Filter global promotions
    const globalPromotions = activePromotions.filter(promo => promo.appliesTo === 'all');

    let appliedPromotion = null;

    if (storeSpecificPromotions.length > 0) {
        // Apply the first store-specific promotion
        const promo = storeSpecificPromotions[0];
        appliedPromotion = {
            type: promo.type,
            value: promo.value,
            startDate: promo.startDate,
            endDate: promo.endDate,
            appliesTo: promo.appliesTo,
            clients: promo.clients.map(clientId => clientId.toString()),
        };
    } else if (globalPromotions.length > 0) {
        // Apply the first global promotion
        const promo = globalPromotions[0];
        appliedPromotion = {
            type: promo.type,
            value: promo.value,
            startDate: promo.startDate,
            endDate: promo.endDate,
            appliesTo: promo.appliesTo,
            clients: [],
        };
    }

    let tarif_livraison = originalTarifLivraison;

    if (appliedPromotion) {
        if (appliedPromotion.type === 'fixed_tarif') {
            tarif_livraison = appliedPromotion.value;
        } else if (appliedPromotion.type === 'percentage_discount') {
            tarif_livraison = originalTarifLivraison * (1 - appliedPromotion.value / 100);
        }

        // Ensure tarif_livraison does not exceed original_tarif
        if (tarif_livraison > originalTarifLivraison) {
            tarif_livraison = originalTarifLivraison;
        }
    }

    return { tarif_livraison, appliedPromotion };
};

// Function to create or update factures for both client and livreur based on a single colis
const createOrUpdateFacture = async (colisId) => {
    // Fetch the colis data with necessary populates
    const colis = await Colis.findById(colisId)
      .populate('store')
      .populate('livreur')
      .populate('ville')
      .exec();
  
    if (!colis) {
      throw new Error('Colis not found');
    }
  
    // Determine if the facture is for a client (store) or livreur
    const isClientFacture = colis.store !== null;
    const isLivreurFacture = colis.livreur !== null;
  
    if (!isClientFacture && !isLivreurFacture) {
      throw new Error('Colis must be associated with either a store or a livreur');
    }
  
    // Use date_livraisant as the key date for the facture
    const dateLivraison = colis.date_livraisant;
    if (!dateLivraison) {
      throw new Error('Delivery date (date_livraisant) not set for the colis');
    }
  
    // Fetch active promotions
    const now = new Date();
    const activePromotions = await Promotion.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).lean();
  
    // Calculate original tarif_livraison for client
    let originalTarifLivraisonClient = 0;
    if (colis.statut === 'Livrée') {
      originalTarifLivraisonClient = colis.ville?.tarif || 0;
    } else if (colis.statut === 'Annulée' || colis.statut === 'Refusée') {
      originalTarifLivraisonClient = colis.ville?.tarif_refus || 0;
    }
  
    // Apply promotion for client
    let tarif_livraisonClient = originalTarifLivraisonClient;
    let appliedPromotion = null;
  
    if (isClientFacture) {
      const promotionResult = applyPromotion(
        colis.store._id,
        originalTarifLivraisonClient,
        activePromotions
      );
      tarif_livraisonClient = promotionResult.tarif_livraison;
      appliedPromotion = promotionResult.appliedPromotion;
    }
  
    // Calculate original tarif_livraison for livreur
    let originalTarifLivraisonLivreur = 0;
    if (colis.statut === 'Livrée') {
      originalTarifLivraisonLivreur = colis.livreur?.tarif || 0;
    } else if (colis.statut === 'Annulée' || colis.statut === 'Refusée') {
      // Assuming tarif_refus is 0 for livreur
      originalTarifLivraisonLivreur = 0;
    }
  
    // Calculate tarif_fragile and tarif_ajouter if statut === 'Livrée'
    let tarif_fragile = 0;
    let tarif_ajouter = 0;
  
    if (colis.statut === 'Livrée') {
      tarif_fragile = colis.is_fragile ? 5 : 0;
      tarif_ajouter = colis.tarif_ajouter?.value || 0;
    }
  
    // Calculate total_tarif for client and livreur
    const tarif_totalClient = tarif_livraisonClient + tarif_fragile + tarif_ajouter;
    const tarif_totalLivreur = originalTarifLivraisonLivreur + tarif_fragile + tarif_ajouter;
  
    // Calculate the 'rest' for the store (client side)
    const rest = colis.prix - tarif_totalClient;
  
    // -------------------------
    // Handle Client Facture
    // -------------------------
    if (isClientFacture) {
      // Find existing facture for this date + store
      const existingFactureClient = await Facture.findOne({
        type: 'client',
        store: colis.store._id,
        date: moment(dateLivraison).startOf('day').toDate(),
      });
  
      if (existingFactureClient) {
        // Check if this colis is already in the facture
        const alreadyExists = existingFactureClient.colis.some(
          (existingColisId) => existingColisId.toString() === colis._id.toString()
        );
        if (alreadyExists) {
          // If it already exists, throw an error or skip
          throw new Error(
            `Facture already exists for this client/date and includes colis ${colis.code_suivi}.`
          );
        } else {
          // Update existing facture
          await Facture.updateOne(
            { _id: existingFactureClient._id },
            {
              $push: { colis: colis._id },
              $inc: {
                totalPrix: rest, // Updated to increment by 'rest'
                totalTarifLivraison: tarif_livraisonClient,
                totalTarifFragile: tarif_fragile,
                totalTarifAjouter: tarif_ajouter,
                totalTarif: tarif_totalClient,
                ...(colis.statut === 'Annulée' || colis.statut === 'Refusée'
                  ? { totalFraisRefus: tarif_livraisonClient }
                  : {}),
              },
              ...(appliedPromotion && { promotion: appliedPromotion }),
            }
          );
        }
      } else {
        // Create a new facture for the client
        const newFactureClient = new Facture({
          code_facture: generateCodeFacture(dateLivraison),
          type: 'client',
          store: colis.store._id,
          date: moment(dateLivraison).startOf('day').toDate(),
          colis: [colis._id],
          totalPrix: rest, // Updated to set 'rest' as totalPrix
          totalTarifLivraison: tarif_livraisonClient,
          totalTarifFragile: tarif_fragile,
          totalTarifAjouter: tarif_ajouter,
          totalTarif: tarif_totalClient,
          totalFraisRefus:
            colis.statut === 'Annulée' || colis.statut === 'Refusée'
              ? tarif_livraisonClient
              : 0,
          promotion: appliedPromotion || null,
          originalTarifLivraison: originalTarifLivraisonClient,
        });
  
        await newFactureClient.save();
      }
  
      /**
      // Update store solde
      const store = await Store.findById(colis.store._id);
      if (store) {
        store.solde = (store.solde || 0) + (isNaN(rest) ? 0 : rest);
        await store.save();
      }

  
      // Create transaction
      const transactionClient = new Transaction({
        id_store: colis.store._id,
        montant: rest,
        type: 'credit',
        etat: true,
      });
      await transactionClient.save();
  
      // Create notification for the client
      const notificationClient = new NotificationUser({
        id_store: colis.store._id,
        title: `+ ${rest} DH`,
        description: `Votre portefeuille a été crédité de ${rest} DH suite à la livraison du colis ${colis.code_suivi}.`,
      });
      await notificationClient.save();
       */
    }
  
    // -------------------------
    // Handle Livreur Facture
    // -------------------------
    if (isLivreurFacture) {
      // Find existing facture for this date + livreur
      const existingFactureLivreur = await Facture.findOne({
        type: 'livreur',
        livreur: colis.livreur._id,
        date: moment(dateLivraison).startOf('day').toDate(),
      });
  
      if (existingFactureLivreur) {
        // Check if this colis is already in the facture
        const alreadyExists = existingFactureLivreur.colis.some(
          (existingColisId) => existingColisId.toString() === colis._id.toString()
        );
        if (alreadyExists) {
          throw new Error(
            `Facture already exists for this livreur/date and includes colis ${colis.code_suivi}.`
          );
        } else {
          // Update existing facture
          await Facture.updateOne(
            { _id: existingFactureLivreur._id },
            {
              $push: { colis: colis._id },
              $inc: {
                totalPrix: colis.prix,
                totalTarifLivraison: originalTarifLivraisonLivreur,
                totalTarifFragile: tarif_fragile,
                totalTarifAjouter: tarif_ajouter,
                totalTarif: tarif_totalLivreur,
                ...(colis.statut === 'Annulée' || colis.statut === 'Refusée'
                  ? { totalFraisRefus: originalTarifLivraisonLivreur }
                  : {}),
              },
            }
          );
        }
      } else {
        // Create new facture
        const newFactureLivreur = new Facture({
          code_facture: generateCodeFacture(dateLivraison),
          type: 'livreur',
          livreur: colis.livreur._id,
          date: moment(dateLivraison).startOf('day').toDate(),
          colis: [colis._id],
          totalPrix: colis.prix,
          totalTarifLivraison: originalTarifLivraisonLivreur,
          totalTarifFragile: tarif_fragile,
          totalTarifAjouter: tarif_ajouter,
          totalTarif: tarif_totalLivreur,
          totalFraisRefus:
            colis.statut === 'Annulée' || colis.statut === 'Refusée'
              ? originalTarifLivraisonLivreur
              : 0,
          promotion: null, // No promotion for livreurs
          originalTarifLivraison: originalTarifLivraisonLivreur,
        });
  
        await newFactureLivreur.save();
      }
    }
  };







// Controller to create factures for clients and livreurs based on daily delivered packages
const createFacturesForClientsAndLivreurs = async (req, res) => {
    try {
        // Get today's date range
        const todayStart = moment().startOf('day').toDate();
        const todayEnd = moment().endOf('day').toDate();

        // Fetch all 'Livrée' and 'Refusée' colis with non-null store and livreur
        const colisList = await Colis.find({
            store: { $ne: null },
            livreur: { $ne: null },
            statut: { $in: ['Livrée', 'Refusée'] },
        }).populate('store').populate('livreur').populate('ville');

        // Filter out the colis that were processed today and are not part of an existing facture
        const processedTodayColis = [];
        for (const colis of colisList) {
            const dateLivraison = await getDeliveryDate(colis.code_suivi);
            if (dateLivraison && moment(dateLivraison).isBetween(todayStart, todayEnd, undefined, '[]')) { // Inclusive
                // Check if this colis is already part of an existing facture
                const existingFacture = await Facture.findOne({ colis: colis._id });
                if (!existingFacture) {
                    processedTodayColis.push(colis);
                }
            }
        }

        if (processedTodayColis.length === 0) {
            if (res) {
                return res.status(200).json({ message: 'No factures to create for today.' });
            } else {
                console.log('No factures to create for today.');
                return;
            }
        }

        // Fetch active promotions
        const now = new Date();
        const activePromotions = await Promotion.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now },
        }).lean();

        // Group colis by store and date for client factures
        const facturesMapClient = {};

        // Group colis by livreur and date for livreur factures
        const facturesMapLivreur = {};

        // Initialize total variables for client factures
        let totalTarifAjouterClient = 0; // Total tarif_supplémentaire for clients

        // Initialize total variables for livreur factures
        let totalTarifAjouterLivreur = 0; // Total tarif_supplémentaire for livreurs

        // Iterate over each colis to populate the maps
        for (const colis of processedTodayColis) {
            const storeId = colis.store._id.toString();
            const livreurId = colis.livreur._id.toString();
            const dateKey = moment(colis.date_livraison).format('YYYY-MM-DD'); // Assuming 'date_livraison' is correct

            // Initialize nested objects if not present
            if (!facturesMapClient[storeId]) {
                facturesMapClient[storeId] = {};
            }

            if (!facturesMapClient[storeId][dateKey]) {
                facturesMapClient[storeId][dateKey] = {
                    store: colis.store,
                    date: colis.date_livraison,
                    colis: [],
                    totalPrix: 0,
                    totalTarifLivraison: 0,
                    totalTarifFragile: 0,
                    totalTarifAjouter: 0, // Initialize tarif_supplémentaire total
                    totalTarif: 0,
                    totalFraisRefus: 0,
                    promotion: null, // To store single promotion details
                    originalTarifLivraison: 0, // To store the original tarif livraison
                };
            }

            // Determine applicable promotions for this store
            const storeSpecificPromotions = activePromotions.filter(promo => 
                promo.appliesTo === 'specific' && promo.clients.map(client => client.toString()).includes(storeId)
            );

            const globalPromotions = activePromotions.filter(promo => promo.appliesTo === 'all');

            let appliedPromotion = null;

            if (storeSpecificPromotions.length > 0) {
                // **Priority:** Apply the first specific promotion
                appliedPromotion = {
                    type: storeSpecificPromotions[0].type,
                    value: storeSpecificPromotions[0].value,
                    startDate: storeSpecificPromotions[0].startDate,
                    endDate: storeSpecificPromotions[0].endDate,
                    appliesTo: storeSpecificPromotions[0].appliesTo,
                    clients: storeSpecificPromotions[0].clients.map(clientId => clientId.toString()),
                };
            } else if (globalPromotions.length > 0) {
                // **Fallback:** Apply the first global promotion
                appliedPromotion = {
                    type: globalPromotions[0].type,
                    value: globalPromotions[0].value,
                    startDate: globalPromotions[0].startDate,
                    endDate: globalPromotions[0].endDate,
                    appliesTo: globalPromotions[0].appliesTo,
                    clients: [],
                };
            }

            // Calculate original tarif_livraison based on statut
            let originalTarifLivraison = 0;
            if (colis.statut === 'Livrée') {
                originalTarifLivraison = colis.ville?.tarif || 0;
            } else if (colis.statut === 'Refusée') {
                originalTarifLivraison = colis.ville?.tarif_refus || 0;
            }

            // Apply promotion if applicable
            let tarif_livraison = originalTarifLivraison;
            if (appliedPromotion) {
                if (appliedPromotion.type === 'fixed_tarif') {
                    tarif_livraison = appliedPromotion.value;
                } else if (appliedPromotion.type === 'percentage_discount') {
                    tarif_livraison = originalTarifLivraison * (1 - appliedPromotion.value / 100);
                }

                 // Check if the tarif with promotion is higher than the original tarif
                if (tarif_livraison > originalTarifLivraison) {
                    tarif_livraison = originalTarifLivraison; // Revert to original tarif if promotion gives a higher value
                }
            }

            // Calculate tarif_fragile based on is_fragile
            const tarif_fragile = colis.is_fragile ? 5 : 0;

            // Calculate tarif_ajouter (tarif_supplémentaire)
            const tarif_ajouter = colis.tarif_ajouter?.value || 0;

            // Calculate total_tarif for this colis, including tarif_ajouter
            const tarif_total = tarif_livraison + tarif_fragile + tarif_ajouter;

            // Update the client facture map
            const clientFacture = facturesMapClient[storeId][dateKey];
            clientFacture.colis.push(colis._id);
            clientFacture.totalPrix += colis.prix;
            clientFacture.totalTarifLivraison += tarif_livraison;
            clientFacture.totalTarifFragile += tarif_fragile;
            clientFacture.totalTarifAjouter += tarif_ajouter; // Sum tarif_supplémentaire
            clientFacture.totalTarif += tarif_total;

            // Accumulate total tarif_supplémentaire for client factures
            totalTarifAjouterClient += tarif_ajouter;

            // Store the original tarif livraison
            clientFacture.originalTarifLivraison += originalTarifLivraison;

            // Assign the applied promotion if not already assigned
            if (appliedPromotion && !clientFacture.promotion) {
                clientFacture.promotion = appliedPromotion;
            }

            // Update totalFraisRefus if statut is 'Refusée'
            if (colis.statut === 'Refusée') {
                clientFacture.totalFraisRefus += tarif_livraison; // tarif_livraison here represents tarif_refus
            }

            // Similarly, update the livreur facture map
            if (!facturesMapLivreur[livreurId]) {
                facturesMapLivreur[livreurId] = {};
            }

            if (!facturesMapLivreur[livreurId][dateKey]) {
                facturesMapLivreur[livreurId][dateKey] = {
                    livreur: colis.livreur,
                    date: colis.date_livraison,
                    colis: [],
                    totalPrix: 0,
                    totalTarifLivraison: 0,
                    totalTarifFragile: 0,
                    totalTarifAjouter: 0, // Initialize tarif_supplémentaire total for livreur
                    totalTarif: 0,
                    totalFraisRefus: 0,
                };
            }

            // Update the livreur facture map
            const livreurFacture = facturesMapLivreur[livreurId][dateKey];
            livreurFacture.colis.push(colis._id);
            livreurFacture.totalPrix += colis.prix;
            livreurFacture.totalTarifLivraison += originalTarifLivraison; // Livreurs get the original tarif
            livreurFacture.totalTarifFragile += tarif_fragile;
            livreurFacture.totalTarifAjouter += tarif_ajouter; // Sum tarif_supplémentaire for livreur
            livreurFacture.totalTarif += tarif_livraison + tarif_fragile + tarif_ajouter;

            // Accumulate total tarif_supplémentaire for livreur factures
            totalTarifAjouterLivreur += tarif_ajouter;

            if (colis.statut === 'Refusée') {
                livreurFacture.totalFraisRefus += originalTarifLivraison;
            }
        }

        // Prepare and save client factures
        const facturesToInsertClient = [];
        for (const storeId in facturesMapClient) {
            for (const dateKey in facturesMapClient[storeId]) {
                const factureData = facturesMapClient[storeId][dateKey];

                const newFacture = new Facture({
                    code_facture: generateCodeFacture(factureData.date),
                    type: 'client',
                    store: factureData.store._id,
                    date: factureData.date,
                    colis: factureData.colis,
                    totalPrix: factureData.totalPrix,
                    totalTarifLivraison: factureData.totalTarifLivraison,
                    totalTarifFragile: factureData.totalTarifFragile,
                    totalTarifAjouter: factureData.totalTarifAjouter, // Include tarif_supplémentaire
                    totalTarif: factureData.totalTarif,
                    totalFraisRefus: factureData.totalFraisRefus,
                    promotion: factureData.promotion ? factureData.promotion : null, // Assign the single promotion or null
                    originalTarifLivraison: factureData.originalTarifLivraison,
                });

                facturesToInsertClient.push(newFacture);

                // Calculate the montant to add to the store's solde
                const montant = (factureData.totalPrix + factureData.totalTarifAjouter) - factureData.totalTarif - factureData.totalFraisRefus; // (prix + tarif_supplémentaire - total_tarif - frais_refus)

                // Update store solde
                const store = await Store.findById(factureData.store._id);
                if (store) {
                    store.solde = (store.solde || 0) + (isNaN(montant) ? 0 : montant);
                    await store.save();
                }

                const transaction = new Transaction({
                    id_store: factureData.store._id,  // Correctly passing id_store here
                    montant: montant,
                    type: 'debit', // Adding to the store's balance
                    etat : true ,
                });
                await transaction.save();

                // Create a notification for the store
                const notification = new NotificationUser({
                    id_store: factureData.store._id,
                    title: `+ ${montant} DH`,
                    description: `Votre argent a été ajouté dans votre portefeuille avec succès.`,
                });
                await notification.save();
            }
        }

        // Prepare and save livreur factures
        const facturesToInsertLivreur = [];
        for (const livreurId in facturesMapLivreur) {
            for (const dateKey in facturesMapLivreur[livreurId]) {
                const factureData = facturesMapLivreur[livreurId][dateKey];

                const newFacture = new Facture({
                    code_facture: generateCodeFacture(factureData.date),
                    type: 'livreur',
                    livreur: factureData.livreur._id,
                    date: factureData.date,
                    colis: factureData.colis,
                    totalPrix: factureData.totalPrix,
                    totalTarifLivraison: factureData.totalTarifLivraison,
                    totalTarifFragile: factureData.totalTarifFragile,
                    totalTarifAjouter: factureData.totalTarifAjouter, // Include tarif_supplémentaire
                    totalTarif: factureData.totalTarif,
                    totalFraisRefus: factureData.totalFraisRefus,
                    promotion: null, // Livreurs do not have promotions applied
                    originalTarifLivraison: factureData.totalTarifLivraison,
                });

                facturesToInsertLivreur.push(newFacture);

                // **Handle Livreurs' Solde or Other Operations Here if Needed**
                // Example: Update livreur solde similarly to store solde
                const montantLivreur = (factureData.totalPrix + factureData.totalTarifAjouter) - factureData.totalTarif - factureData.totalFraisRefus;

                const livreur = await Livreur.findById(factureData.livreur._id);
                if (livreur) {
                    livreur.solde = (livreur.solde || 0) + (isNaN(montantLivreur) ? 0 : montantLivreur);
                    await livreur.save();
                }

                // Create a notification for the livreur
                const notificationLivreur = new NotificationUser({
                    id_livreur: livreur._id,
                    title: `+ ${montantLivreur} DH`,
                    description: `Votre argent a été ajouté dans votre portefeuille avec succès.`,
                });
                await notificationLivreur.save();
            }
        }

        // Save all factures
        const facturesToInsert = [...facturesToInsertClient, ...facturesToInsertLivreur];
        await Facture.insertMany(facturesToInsert);

        if (res) {
            res.status(200).json({ message: 'Factures created successfully', factures: facturesToInsert });
        }
    } catch (error) {
        console.error(error);
        if (res) {
            res.status(500).json({ message: 'Internal server error', error: error.message });
        } else {
            console.error('Internal server error:', error.message);
        }
    }
};



// Schedule a job to create factures every day at the specified time
cron.schedule('45 18 * * *', async () => {
    console.log('Running daily facture generation at 17:54');
    await generateFacturesRetour(); // Ensure this function is also adjusted if needed
});



const getAllFacture = async (req, res) => {
    try {
        // Destructure query parameters with default values
        const { page = 1, limit = 50, type, date, storeId, livreurId, sortBy = 'date', order = 'desc' } = req.query;

        // Build the filter object
        const filter = {};

        // Add type to filter if present in query
        if (type) filter.type = type;

        // Handle date filtering
        if (date) {
            const start = new Date(date);
            const end = new Date(date);
            end.setDate(end.getDate() + 1);
            filter.date = { $gte: start, $lt: end };
        }

        // Filter by storeId if provided
        if (storeId) filter.store = storeId;

        // Filter by livreurId if provided
        if (livreurId) filter.livreur = livreurId;

        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = order === 'asc' ? 1 : -1;

        // Query the database
        const factures = await Facture.find(filter)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate({
                path: 'store',
                select: 'storeName id_client'
            })
            .populate({
                path: 'livreur',
                select: 'nom  tele'
            })
            .populate({
                path: 'colis',
                populate: [
                    { path: 'ville', select: 'nom key ref tarif' },
                    { path: 'store', select: 'storeName' },
                ]
            })
            .sort(sortOptions)
            .sort({ createdAt: -1 })
            .lean();

        // Count total documents matching the filter
        const total = await Facture.countDocuments(filter);

        // Send response with the selected factures and pagination data
        res.status(200).json({
            message: 'Factures selected',
            factures,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error("Error fetching factures:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const getFacturesByStore = async (req, res) => {
    try {
        // Destructure query parameters with default values
        const { page = 1, limit = 50, date, livreurId, sortBy = 'date', order = 'desc' } = req.query;
        const { storeId } = req.params; // Extract storeId from req.params

        // Build the filter object
        const filter = {};

        // Ensure storeId is included in the filter
        if (storeId) filter.store = storeId;

        // Handle date filtering
        if (date) {
            const start = new Date(date);
            const end = new Date(date);
            end.setDate(end.getDate() + 1);
            filter.date = { $gte: start, $lt: end };
        }

        // Filter by livreurId if provided
        if (livreurId) filter.livreur = livreurId;

        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = order === 'asc' ? 1 : -1;

        // Query the database for factures based on storeId
        const factures = await Facture.find(filter)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate({
                path: 'store',
                select: 'storeName id_client'  // Populate store name and client
            })
            .populate({
                path: 'livreur',
                select: 'nom tele'  // Populate livreur name and phone number
            })
            .populate({
                path: 'colis',
                populate: [
                    { path: 'ville', select: 'nom key ref tarif' },  // Populate ville details
                    { path: 'store', select: 'storeName' }  // Populate store details within colis
                ]
            })
            .sort(sortOptions)
            .sort({ createdAt: -1 })  // Secondary sort by creation date (most recent first)
            .lean();

        // Count total documents matching the filter
        const total = await Facture.countDocuments(filter);

        // Send response with the selected factures and pagination data
        res.status(200).json({
            message: 'Factures retrieved successfully',
            factures,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error("Error fetching factures by store:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



const setFacturePay = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the facture by ID
        const facture = await Facture.findById(id);

        // If the facture doesn't exist, return a 404 error
        if (!facture) {
            return res.status(404).json({ message: 'Facture not found' });
        }

        // Check if this is a client facture or livreur facture
        if (facture.type === 'client') {
            // If it's a client facture, toggle facture.etat AND update related colis if needed
            if (facture.etat === false) {
                // If etat is currently false, set it to true
                facture.etat = true;
                await facture.save();

                // Mark all related colis as paid (etat: true)
                await Colis.updateMany(
                    { _id: { $in: facture.colis } },
                    { etat: true }
                );

                return res.status(200).json({
                    message: 'Facture est facturée',
                    facture,
                });
            } else {
                // If etat is currently true, set it to false
                facture.etat = false;
                await facture.save();

                // Mark all related colis as not paid (etat: false)
                await Colis.updateMany(
                    { _id: { $in: facture.colis } },
                    { etat: false }
                );

                return res.status(200).json({
                    message: 'Facture est non facturée',
                    facture,
                });
            }
        } else if (facture.type === 'livreur') {
            // If it's a livreur facture, toggle only the facture.etat
            if (facture.etat === false) {
                // If etat is currently false, set it to true
                facture.etat = true;
                await facture.save();

                return res.status(200).json({
                    message: 'Facture est facturée',
                    facture,
                });
            } else {
                // If etat is currently true, set it to false
                facture.etat = false;
                await facture.save();

                return res.status(200).json({
                    message: 'Facture est non facturée',
                    facture,
                });
            }
        } else {
            // If facture type is neither client nor livreur, just return a message
            return res.status(400).json({
                message: 'Unknown facture type. Allowed types: client, livreur.',
            });
        }
    } catch (error) {
        console.error('Error toggling facture etat:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getFactureByCode = asyncHandler(async (req, res) => {
    try {
        const { code_facture } = req.params;

        // Find the facture by its code
        const facture = await Facture.findOne({ code_facture })
            .populate({
                path: 'store',
                select: 'storeName id_client',
                populate: {
                    path: 'id_client',
                    select: 'tele',
                },
            })
            .populate({
                path: 'livreur',
                select: 'nom tele tarif',
            })
            .populate({
                path: 'colis',
                populate: [
                    { path: 'ville', select: 'nom key ref tarif tarif_refus' },
                    { path: 'store', select: 'storeName' },
                ],
            })
            .lean();

        // If the facture does not exist, return a 404 error
        if (!facture) {
            return res.status(404).json({ message: 'Facture not found' });
        }

        // Use the promotion stored in the facture
        const storedPromotion = facture.promotion || null;

        // Function to fetch the delivery date for a given code_suivi and statut
        const getDeliveryDate = async (code_suivi, statut) => {
            const suiviColis = await Suivi_Colis.findOne({ code_suivi }).lean();
            if (suiviColis) {
                const livraison = suiviColis.status_updates.find(status => status.status === statut);
                return livraison ? livraison.date : null;
            }
            return null;
        };

        // Prepare the response data for colis
        const colisDetails = await Promise.all(facture.colis.map(async col => {
            const livraisonDate = await getDeliveryDate(col.code_suivi, col.statut);

            // Initialize tarif_livraison and montant_a_payer based on statut
            let old_tarif_livraison = 0;
            let new_tarif_livraison = 0;
            let montant_a_payer = 0;

            if (col.statut === 'Livrée') {
                old_tarif_livraison = col.ville?.tarif || 0;
                montant_a_payer = col.prix;

                // Apply the stored promotion if available
                if (storedPromotion) {
                    if (storedPromotion.type === 'fixed_tarif') {
                        new_tarif_livraison = storedPromotion.value;
                    } else if (storedPromotion.type === 'percentage_discount') {
                        new_tarif_livraison = old_tarif_livraison * (1 - storedPromotion.value / 100);
                    }
                } else {
                    new_tarif_livraison = old_tarif_livraison;
                }
            } else if (['Refusée', 'En Retour', 'Fermée'].includes(col.statut)) {
                old_tarif_livraison = col.ville?.tarif_refus || 0;
                montant_a_payer = 0;
                new_tarif_livraison = old_tarif_livraison;
            } else {
                old_tarif_livraison = col.ville?.tarif || 0;
                new_tarif_livraison = storedPromotion ? (
                    storedPromotion.type === 'fixed_tarif' ? 
                        storedPromotion.value : 
                        (old_tarif_livraison * (1 - storedPromotion.value / 100))
                ) : old_tarif_livraison;
                montant_a_payer = col.prix;
            }

              // If the new tarif is greater than the old tarif, make the new tarif equal to the old tarif
                if (new_tarif_livraison > old_tarif_livraison) {
                    new_tarif_livraison = old_tarif_livraison;
                }


            if (col.pret_payant) {
                // If pret_payant is true, set both old and new tarif_livraison to 0
                old_tarif_livraison = 0;
                new_tarif_livraison = 0;
            }

            // Determine tarif_fragile
            const tarif_fragile = col.is_fragile ? 5 : 0;

            // Calculate tarif_ajouter
            const tarif_ajouter = col.tarif_ajouter?.value || 0;

            // Calculate total tarif for this colis, including tarif_ajouter
            const tarif_total = new_tarif_livraison + tarif_fragile + tarif_ajouter;

            return {
                code_suivi: col.code_suivi,
                destinataire: col.nom,
                telephone: col.tele,
                ville: col.ville ? col.ville.nom : null,
                adresse: col.adresse,
                statut: col.statut,
                prix: col.prix,
                old_tarif_livraison: old_tarif_livraison,
                new_tarif_livraison: new_tarif_livraison,
                tarif_fragile: tarif_fragile,
                tarif_ajouter: tarif_ajouter,
                tarif_total: tarif_total,
                montant_a_payer: montant_a_payer,
                date_livraison: livraisonDate,
                fragile: col.is_fragile,
                pret_payant: col.pret_payant, // Include pret_payant in the response
            };
        }));

        // Calculate totals, including tarif_ajouter
        let totalPrix = 0;
        let totalOldTarifLivraison = 0;
        let totalNewTarifLivraison = 0;
        let totalTarifFragile = 0;
        let totalTarifAjouter = 0;
        let totalTarif = 0;
        let totalFraisRefus = 0;

        colisDetails.forEach(col => {
            if (col.statut === 'Livrée') {
                totalPrix += col.prix;
                totalOldTarifLivraison += col.old_tarif_livraison;
                totalNewTarifLivraison += col.new_tarif_livraison;
                totalTarifFragile += col.tarif_fragile;
                totalTarifAjouter += col.tarif_ajouter;
                totalTarif += col.tarif_total;
            } else {
                totalFraisRefus += col.old_tarif_livraison;
                totalOldTarifLivraison += col.old_tarif_livraison;
                totalNewTarifLivraison += col.new_tarif_livraison;
                totalTarifFragile += col.tarif_fragile;
                totalTarifAjouter += col.tarif_ajouter;
                totalTarif += col.tarif_total;
            }
        });

        // Prepare the facture response
        const factureResponse = {
            code_facture: facture.code_facture,
            etat: facture.etat,
            date_facture: facture.date_facture,
            type: facture.type,
            store: facture.store ? facture.store.storeName : null,
            client_tele: facture.store && facture.store.id_client ? facture.store.id_client.tele : null,
            livreur: facture.livreur ? facture.livreur.nom : null,
            livreur_tele: facture.livreur ? facture.livreur.tele : null,
            livreur_tarif: facture.livreur ? facture.livreur.tarif : null,
            totalPrix: totalPrix,
            totalOldTarifLivraison: totalOldTarifLivraison,
            totalNewTarifLivraison: totalNewTarifLivraison,
            totalTarifFragile: totalTarifFragile,
            totalTarifAjouter: totalTarifAjouter,
            totalTarif: totalTarif,
            totalFraisRefus: totalFraisRefus,
            netAPayer: (totalPrix + totalTarifAjouter - totalTarif) - totalFraisRefus,
            colis: colisDetails,
        };

        // Send the formatted response
        res.status(200).json({
            message: 'Facture details retrieved successfully',
            facture: factureResponse,
            promotion: storedPromotion,
        });
    } catch (error) {
        console.error('Error fetching facture by code:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



const getFacturesByLivreur = async (req, res) => {
    try {
        // Destructure query parameters with default values
        const { page = 1, limit = 50, date, storeId, sortBy = 'date', order = 'desc' } = req.query;
        const { livreurId } = req.params; // Extract livreurId from req.params

        // Build the filter object
        const filter = {};

        // Ensure livreurId is included in the filter
        if (livreurId) filter.livreur = livreurId;

        // Handle date filtering
        if (date) {
            const start = new Date(date);
            const end = new Date(date);
            end.setDate(end.getDate() + 1);
            filter.date = { $gte: start, $lt: end };
        }

        // Filter by storeId if provided
        if (storeId) filter.store = storeId;

        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = order === 'asc' ? 1 : -1;

        // Query the database for factures based on livreurId
        const factures = await Facture.find(filter)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate({
                path: 'store',
                select: 'storeName id_client'  // Populate store name and client details
            })
            .populate({
                path: 'livreur',
                select: 'nom tele'  // Populate livreur name and phone number
            })
            .populate({
                path: 'colis',
                populate: [
                    { path: 'ville', select: 'nom key ref tarif' },  // Populate ville details
                    { path: 'store', select: 'storeName' }  // Populate store details within colis
                ]
            })
            .sort(sortOptions)
            .sort({ createdAt: -1 })  // Secondary sort by creation date (most recent first)
            .lean();

        // Count total documents matching the filter
        const total = await Facture.countDocuments(filter);

        // Send response with the selected factures and pagination data
        res.status(200).json({
            message: 'Factures retrieved successfully',
            factures,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error("Error fetching factures by livreur:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * @desc    Get the code_facture for a given colis
 * @route   GET /api/facture/colis/:colisId
 * @method  GET
 * @access  Private/Admin
 */
const getCodeFactureByColis = asyncHandler(async (req, res) => {
    const { colisId } = req.params;

    // Validate colisId
    if (!colisId) {
        res.status(400);
        throw new Error('Identifiant du colis est requis.');
    }

    // Attempt to find the colis by code_suivi or _id
    let colis;
    // Check if colisId matches code_suivi
    colis = await Colis.findOne({ code_suivi: colisId });
    // If not found, attempt to find by _id
    if (!colis) {
        colis = await Colis.findById(colisId);
    }

    if (!colis) {
        res.status(404);
        throw new Error('Colis non trouvé.');
    }

    // Search for a facture that includes this colis
    const facture = await Facture.findOne({ colis: colis._id });

    if (facture) {
        res.status(200).json({facture});
    } else {
        res.status(404).json({
            message: "Cette colis n'a pas de facture associée.",
        });
    }
});


module.exports = {
    createFacturesForClientsAndLivreurs,
    getAllFacture ,
    getFactureByCode,
    getFacturesByLivreur,
    getFacturesByStore,
    setFacturePay,
    createOrUpdateFacture,
    getCodeFactureByColis
};
