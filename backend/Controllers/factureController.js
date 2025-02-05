const { Colis } = require('../Models/Colis'); 
const Facture = require('../Models/Facture');
const moment = require('moment');
const mongoose = require('mongoose');

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
const { TarifLivreur } = require('../Models/Tarif_livreur');

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

// Function to create or update facture for clients based on a single colis

// Function to create or update facture for clients based on a single colis
// Function to create or update facture for clients based on a single colis
const createOrUpdateFacture = asyncHandler(async (colisId) => {
    try {
        // Fetch the colis data with necessary populates
        const colis = await Colis.findById(colisId)
            .populate('store')
            .populate('ville')
            .exec();

        if (!colis) {
            throw new Error('Colis not found');
        }

        // Ensure the facture is for a client
        if (!colis.store) {
            throw new Error('Colis must be associated with a store for client facture');
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

          // *** New Verification: Check if the colis is already in any facture ***
          const factureExists = await Facture.findOne({ colis: colis._id , type:'client' });
          if (factureExists) {
              throw new Error(`This colis with code ${colis.code_suivi} is already associated with a facture.`);
          }

        // Calculate original tarif_livraison based on colis status
        let originalTarifLivraisonClient = 0;
        if (colis.statut === 'Livrée') {
            originalTarifLivraisonClient = colis.ville?.tarif || 0;
        } else if (colis.statut === 'Refusée') {
            originalTarifLivraisonClient = colis.ville?.tarif_refus || 0;
        }

        // Apply promotion for client
        let tarif_livraisonClient = originalTarifLivraisonClient;
        let appliedPromotion = null;

        const promotionResult = applyPromotion(
            colis.store._id,
            originalTarifLivraisonClient,
            activePromotions
        );
        tarif_livraisonClient = promotionResult.tarif_livraison;
        appliedPromotion = promotionResult.appliedPromotion;

        // Calculate tarif_fragile and tarif_ajouter if statut === 'Livrée'
        let tarif_fragile = 0;
        let tarif_ajouter = 0;

        if (colis.statut === 'Livrée') {
            tarif_fragile = colis.is_fragile ? 5 : 0;
            tarif_ajouter = colis.tarif_ajouter?.value || 0;
        }

        // Calculate total_tarif for client
        let total_tarifClient = 0;
        if (colis.statut === 'Refusée') {
            // Exclude tarif_livraison for Refusée colis
            total_tarifClient = tarif_fragile + tarif_ajouter;
        } else {
            total_tarifClient = tarif_livraisonClient + tarif_fragile + tarif_ajouter;
        }

        // Calculate the 'rest' for the store (client side)
        // Only calculate 'rest' if statut is 'Livrée'
        let rest = 0;
        if (colis.statut === 'Livrée') {
            rest = colis.prix - total_tarifClient;
        }

        // Validate 'rest' and 'originalTarifLivraisonClient' to prevent NaN
        rest = typeof rest === 'number' && !isNaN(rest) ? rest : 0;
        originalTarifLivraisonClient = typeof originalTarifLivraisonClient === 'number' && !isNaN(originalTarifLivraisonClient)
            ? originalTarifLivraisonClient
            : 0;

        // -------------------------
        // Calculate `crbt` Data
        // -------------------------
        const crbtData = {
            prix_colis: colis.prix,
            tarif_livraison: colis.statut === 'Refusée' ? 0 : tarif_livraisonClient,
            tarif_refuse: colis.statut === 'Refusée' ? originalTarifLivraisonClient : 0,
            tarif_fragile: tarif_fragile,
            tarif_supplementaire: tarif_ajouter,
            prix_a_payant: colis.statut === 'Livrée' ? rest : 0,
            total_tarif: total_tarifClient,
        };

        // -------------------------
        // Handle Client Facture
        // -------------------------
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
                const updateFields = {
                    $push: { colis: colis._id },
                    $inc: {
                        totalTarifLivraison: tarif_livraisonClient,
                        totalTarifFragile: tarif_fragile,
                        totalTarifAjouter: tarif_ajouter,
                        totalTarif: total_tarifClient,
                    },
                    // Set `crbt` fields
                    $set: {
                        'crbt.prix_colis': crbtData.prix_colis,
                        'crbt.tarif_livraison': crbtData.tarif_livraison,
                        'crbt.tarif_refuse': crbtData.tarif_refuse,
                        'crbt.tarif_fragile': crbtData.tarif_fragile,
                        'crbt.tarif_supplementaire': crbtData.tarif_supplementaire,
                        'crbt.prix_a_payant': crbtData.prix_a_payant,
                        'crbt.total_tarif': crbtData.total_tarif,
                        // Set `statu_final` based on colis.statut
                        'statu_final': colis.statut === 'Livrée' ? 'Livrée' : 'Refusée',
                    },
                };

                // Adjust totalPrix based on colis status
                if (colis.statut === 'Livrée') {
                    updateFields.$inc.totalPrix = rest;
                } else if (colis.statut === 'Refusée') {
                    updateFields.$inc.totalPrix = -originalTarifLivraisonClient;
                }

                // Include applied promotion if any
                if (appliedPromotion) {
                    updateFields.$set.promotion = appliedPromotion;
                }

                await Facture.updateOne(
                    { _id: existingFactureClient._id },
                    updateFields
                );

                // -------------------------
                // Update `crbt` and `statu_final` in Colis Document
                // -------------------------
                colis.crbt = crbtData;
                colis.statu_final = colis.statut === 'Livrée' ? 'Livrée' : 'Refusée';
                await colis.save();
            }
        } else {
            // Create a new facture for the client
            const newFactureClient = new Facture({
                code_facture: generateCodeFacture(dateLivraison),
                type: 'client',
                store: colis.store._id,
                date: moment(dateLivraison).startOf('day').toDate(),
                colis: [colis._id],
                totalPrix: colis.statut === 'Livrée' ? rest : -originalTarifLivraisonClient, // Correctly set based on status
                totalTarifLivraison: tarif_livraisonClient,
                totalTarifFragile: tarif_fragile,
                totalTarifAjouter: tarif_ajouter,
                totalTarif: total_tarifClient,
                promotion: appliedPromotion || null,
                originalTarifLivraison: originalTarifLivraisonClient,
                crbt: crbtData,
                statu_final: colis.statut === 'Livrée' ? 'Livrée' : 'Refusée',
            });

            await newFactureClient.save();

            // -------------------------
            // Update `crbt` and `statu_final` in Colis Document
            // -------------------------
            colis.crbt = crbtData;
            colis.statu_final = colis.statut === 'Livrée' ? 'Livrée' : 'Refusée';
            await colis.save();
        }

        // -------------------------
        // Update Store Solde and Related Transactions (Uncomment if needed)
        // -------------------------
        /*
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
    } catch (error) {
        console.error(`Error creating/updating facture for colis ${colisId}:`, error);
        throw error; // Propagate the error to be handled upstream
    }
});
  





const createOrUpdateFactureLivreur = async (colisId) => {
    // Fetch the colis data with necessary populates
    const colis = await Colis.findById(colisId)
        .populate('livreur') // Ensure 'livreur' is populated
        .populate('ville')    // Ensure 'ville' is populated
        .exec();

    if (!colis) {
        throw new Error('Colis not found');
    }

    // Ensure the facture is for a livreur
    if (!colis.livreur) {
        throw new Error('Colis must be associated with a livreur for livreur facture');
    }

    // Use date_livraisant as the key date for the facture
    const dateLivraison = colis.date_livraisant;
    if (!dateLivraison) {
        throw new Error('Delivery date (date_livraisant) not set for the colis');
    }

    // Fetch the TarifLivreur for the given livreur and ville
    const tarifLivreur = await TarifLivreur.findOne({
        id_livreur: colis.livreur._id,
        id_ville: colis.ville._id
    }).exec();

      // *** New Verification: Check if the colis is already in any facture ***
      const factureExists = await Facture.findOne({ colis: colis._id , type:'livreur' });
      if (factureExists) {
          throw new Error(`This colis with code ${colis.code_suivi} is already associated with a facture.`);
      }

    if (!tarifLivreur) {
        throw new Error(`TarifLivreur not found for livreur ${colis.livreur._id} and ville ${colis.ville._id}`);
    }

    // Determine the tarif and montant_a_payer based on statut
    let tarif = 0;
    let montant_a_payer = 0;
    let remarque = ''; // To store any remarks

    if (colis.statut === 'Livrée') {
        tarif = tarifLivreur.tarif || 0;
        montant_a_payer = colis.prix - tarif;

        // Ensure montant_a_payer is not negative
        if (montant_a_payer < 0) montant_a_payer = 0;
    } else {
        // For statuses other than 'Livrée' (e.g., 'Refusée', 'Annulée'), skip operations
        // Optionally, you can log or handle these cases as needed
        console.log(`Colis ${colis.code_suivi} has status ${colis.statut}. No operations performed for livreur facture.`);
        return; // Exit the function as no operation is needed
    }

    // -------------------------
    // Handle Livreur Facture
    // -------------------------
    // Find existing facture for this date + livreur
    const existingFactureLivreur = await Facture.findOne({
        type: 'livreur',
        livreur: colis.livreur._id,
        date: moment(dateLivraison).startOf('day').toDate(),
    }).exec();

    if (existingFactureLivreur) {
        // Check if this colis is already in the facture
        const alreadyExists = existingFactureLivreur.colis.some(
            (existingColisId) => existingColisId.toString() === colis._id.toString()
        );

        if (alreadyExists) {
            // If it already exists, skip to avoid duplication
            console.log(`Colis ${colis.code_suivi} already exists in facture ${existingFactureLivreur.code_facture}. Skipping.`);
            return;
        } else {
            // Update existing facture
            existingFactureLivreur.colis.push(colis._id);
            existingFactureLivreur.totalPrix += montant_a_payer;
            existingFactureLivreur.totalTarifLivraison += tarif;
            existingFactureLivreur.totalTarif += tarif;

            await existingFactureLivreur.save();
            console.log(`Facture ${existingFactureLivreur.code_facture} updated with colis ${colis.code_suivi}.`);
        }
    } else {
        // Create a new facture for the livreur
        const newFactureLivreur = new Facture({
            code_facture: generateCodeFacture(dateLivraison),
            type: 'livreur',
            livreur: colis.livreur._id,
            date: moment(dateLivraison).startOf('day').toDate(),
            colis: [colis._id],
            totalPrix: montant_a_payer, // Set as (colis.prix - tarif)
            totalTarifLivraison: tarif,
            totalTarifFragile: 0, // Not applicable for livreur
            totalTarifAjouter: 0, // Not applicable for livreur
            totalTarif: tarif,
            totalFraisRefus: 0, // Not applicable
            originalTarifLivraison: tarif, // Could be 0 or tarifLivreur.tarif
            promotion: null, // Livreurs don't have promotions
        });

        await newFactureLivreur.save();
        console.log(`New facture ${newFactureLivreur.code_facture} created for colis ${colis.code_suivi}.`);
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
cron.schedule('50 23 * * *', async () => {
    await generateFacturesRetour(); // Ensure this function is also adjusted if needed
});



const getAllFacture = asyncHandler(async (req, res) => {
    try {
        // Extract 'type' from query parameters (if provided)
        const { type } = req.query;

        // Destructure user data from token
        const { role, store: storeId, id: userId } = req.user;

        // Build initial filter
        const filter = {};
        if (type) {
            filter.type = type;
        }

        // Apply role-based filtering
        switch (role) {
            case 'client':
                if (storeId) {
                    filter.store = storeId;
                }
                break;
            case 'livreur':
                filter.livreur = userId;
                break;
            case 'admin':
                // No additional filtering for admin
                break;
            default:
                return res.status(403).json({ message: 'Access denied: Unknown role' });
        }

        // Query the database for factures matching the filter
        const factures = await Facture.find(filter)
            .populate({
                path: 'store',
                select: 'storeName id_client'
            })
            .populate({
                path: 'livreur',
                select: 'nom tele'
            })
            .populate({
                path: 'colis',
                populate: [
                    { path: 'ville', select: 'nom key ref tarif tarif_refus' },
                    { path: 'store', select: 'storeName' }
                    // (Add more populates as needed)
                ]
            })
            .sort({ updatedAt: -1 })
            .lean();

        // Dynamically recalculate totals for each facture using CRBT from each colis
        factures.forEach(facture => {
            let totalPrix = 0;
            let totalTarifLivraison = 0;
            let totalTarifFragile = 0;
            let totalTarifAjouter = 0;
            let totalTarif = 0;
            let totalFraisRefus = 0;

            if (facture.colis && facture.colis.length > 0) {
                facture.colis.forEach(col => {
                    // For client factures, we assume CRBT data is stored on each colis in the "crbt" field.
                    if (facture.type === 'client') {
                        if (col.statut === 'Livrée') {
                            totalPrix += col.prix || 0;
                            // For delivered colis, use CRBT delivery tariff
                            totalTarifLivraison += col.crbt ? (col.crbt.tarif_livraison || 0) : 0;
                            totalTarifFragile += col.crbt ? (col.crbt.tarif_fragile || 0) : 0;
                            totalTarifAjouter += col.crbt ? (col.crbt.tarif_supplementaire || 0) : 0;
                            totalTarif += col.crbt ? (col.crbt.total_tarif || 0) : 0;
                        } else {
                            // For refused, en retour, or fermée, you may count refusal tariffs
                            // Here, we assume that the refusal tariff is stored in crbt.tarif_refuse or use the city's refusal tariff.
                            totalFraisRefus += col.crbt ? (col.crbt.tarif_refuse || 0) : 0;
                            totalOldTarifLivraison = col.ville ? (col.ville.tarif_refus || 0) : 0;
                            totalTarifLivraison += col.crbt ? (col.crbt.tarif_livraison || 0) : 0;
                            totalTarifFragile += col.crbt ? (col.crbt.tarif_fragile || 0) : 0;
                            totalTarifAjouter += col.crbt ? (col.crbt.tarif_supplementaire || 0) : 0;
                            totalTarif += col.crbt ? (col.crbt.total_tarif || 0) : 0;
                        }
                    } else if (facture.type === 'livreur') {
                        // For livreur factures
                        totalPrix += col.montant_a_payeur || 0;
                        totalTarifLivraison += col.crbt ? (col.crbt.tarif_livraison || 0) : 0;
                        totalTarifFragile += col.crbt ? (col.crbt.tarif_fragile || 0) : 0;
                        totalTarifAjouter += col.crbt ? (col.crbt.tarif_supplementaire || 0) : 0;
                        totalTarif += col.crbt ? (col.crbt.total_tarif || 0) : 0;
                    }
                });
            }
            // Calculate netAPayer
            const netAPayer = facture.type === 'client'
                ? (totalPrix + totalTarifAjouter - totalTarif) - totalFraisRefus
                : totalPrix;

            // Attach the dynamic totals to the facture object
            facture.totalPrix = totalPrix;
            facture.totalTarifLivraison = totalTarifLivraison;
            facture.totalTarifFragile = totalTarifFragile;
            facture.totalTarifAjouter = totalTarifAjouter;
            facture.totalTarif = totalTarif;
            facture.totalFraisRefus = totalFraisRefus;
            facture.netAPayer = netAPayer;
        });

        // Send the response with factures and their dynamic totals
        res.status(200).json({
            message: 'Factures retrieved successfully',
            factures,
        });

    } catch (error) {
        console.error("Error fetching factures:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


/**
 * Controller to get factures by user based on type ('client' or 'livreur').
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @query {string} storeId - The ID of the store or livreur.
 * @query {string} type - The type of user ('client' or 'livreur').
 */
const getFacturesByUser = async (req, res) => {
    try {
        // Extract 'storeId' and 'type' from query parameters
        const { storeId, type } = req.query;

        // Validate 'type' parameter
        if (!type || (type !== 'client' && type !== 'livreur')) {
            return res.status(400).json({ message: 'Invalid or missing type. Allowed types: client, livreur' });
        }

        // Validate 'storeId' based on 'type'
        if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
            return res.status(400).json({ message: 'Invalid or missing storeId/livreurId' });
        }

        let filter = {};
        let factures;

        if (type === 'client') {
            // For 'client' type, filter factures by 'storeId' and 'type'
            filter = { store: storeId, type: 'client' };

            factures = await Facture.find(filter)
                .populate({
                    path: 'store',
                    select: 'storeName id_client image tele solde'
                })
                .populate({
                    path: 'livreur',
                    select: 'nom tele profile'
                })
                .populate({
                    path: 'colis',
                    populate: [
                        { path: 'ville', select: 'nom key ref tarif' },
                        { path: 'store', select: 'storeName' },
                    ]
                })
                .sort({ updatedAt: -1 }) // Sort by updatedAt in descending order
                .lean();

            return res.status(200).json({
                message: 'Factures retrieved successfully for client',
                factures,
            });

        } else if (type === 'livreur') {
            // For 'livreur' type, filter factures by 'livreurId' and 'type'
            filter = { livreur: storeId, type: 'livreur' };

            factures = await Facture.find(filter)
                .populate({
                    path: 'store',
                    select: 'storeName id_client image tele solde'
                })
                .populate({
                    path: 'livreur',
                    select: 'nom tele profile'
                })
                .populate({
                    path: 'colis',
                    populate: [
                        { path: 'ville', select: 'nom key ref tarif' },
                        { path: 'store', select: 'storeName' },
                    ]
                })
                .sort({ updatedAt: -1 }) // Sort by updatedAt in descending order
                .lean();

            return res.status(200).json({
                message: 'Factures retrieved successfully for livreur',
                factures,
            });
        }

    } catch (error) {
        console.error("Error fetching factures by user:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


/**
 * Controller to get factures grouped by store or livreur based on type.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @query {string} type - The type of grouping ('client' or 'livreur').
 */
const getFacturesGroupedByUser = async (req, res) => {
    try {
        const { type } = req.query;

        // Validate 'type' parameter
        if (!type || (type !== 'client' && type !== 'livreur')) {
            return res.status(400).json({ message: 'Invalid or missing type. Allowed types: client, livreur' });
        }

        let factures;

        if (type === 'client') {
            // Group factures by store for 'client' type
            factures = await Facture.aggregate([
                { $match: { type: 'client' } },
                {
                    $group: {
                        _id: '$store',
                        factureCount: { $sum: 1 },
                        totalColis: { $sum: { $size: '$colis' } },
                        nonPayerCount: {
                            $sum: { $cond: [{ $eq: ['$etat', false] }, 1, 0] }
                        }
                    },
                },
                {
                    $lookup: {
                        from: 'stores', // Ensure this matches your collection name
                        localField: '_id',
                        foreignField: '_id',
                        as: 'storeDetails',
                    },
                },
                { $unwind: '$storeDetails' },
                {
                    $project: {
                        _id: 0,
                        storeName: '$storeDetails.storeName',
                        tele: '$storeDetails.tele',
                        image: '$storeDetails.image',
                        solde: '$storeDetails.solde',
                        _id: '$storeDetails._id',
                        factureCount: 1,
                        totalColis: 1,
                        nonPayerCount: 1, // Include non-payer count in the result
                    },
                },
                { $sort: { factureCount: -1 } },
            ]);
        } else if (type === 'livreur') {
            // Group factures by livreur for 'livreur' type
            factures = await Facture.aggregate([
                { $match: { type: 'livreur' } },
                {
                    $group: {
                        _id: '$livreur',
                        factureCount: { $sum: 1 },
                        totalColis: { $sum: { $size: '$colis' } },
                        nonPayerCount: {
                            $sum: { $cond: [{ $eq: ['$etat', false] }, 1, 0] }
                        }
                    },
                },
                {
                    $lookup: {
                        from: 'livreurs', // Ensure this matches your collection name
                        localField: '_id',
                        foreignField: '_id',
                        as: 'livreurDetails',
                    },
                },
                { $unwind: '$livreurDetails' },
                {
                    $project: {
                        _id: '$livreurDetails._id',
                        nom: '$livreurDetails.nom',
                        tele: '$livreurDetails.tele',
                        profile: '$livreurDetails.profile',
                        factureCount: 1,
                        totalColis: 1,
                        nonPayerCount: 1, // Include non-payer count in the result
                    },
                },
                { $sort: { factureCount: -1 } },
            ]);
        }

        res.status(200).json({
            message: `Factures grouped by ${type} retrieved successfully`,
            factures,
        });
    } catch (error) {
        console.error(`Error grouping factures by ${type}:`, error);
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

        // Find the facture by its code with necessary population
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
                select: 'nom tele',
            })
            .populate({
                path: 'colis',
                populate: [
                    { path: 'ville', select: 'nom key ref tarif tarif_refus' },
                    { path: 'store', select: 'storeName' },
                    { path: 'livreur', select: 'nom tele' },
                ],
            })
            .lean();

        if (!facture) {
            return res.status(404).json({ message: 'Facture not found' });
        }

        // Use the promotion stored in the facture (if any)
        const storedPromotion = facture.promotion || null;

        // Helper function: get delivery date from Suivi_Colis for a given code_suivi and statut
        const getDeliveryDate = async (code_suivi, statut) => {
            const suiviColis = await Suivi_Colis.findOne({ code_suivi }).lean();
            if (suiviColis) {
                const livraison = suiviColis.status_updates.find(status => status.status === statut);
                return livraison ? livraison.date : null;
            }
            return null;
        };

        // Prepare details for each colis
        const colisDetails = await Promise.all(facture.colis.map(async col => {
            const livraisonDate = await getDeliveryDate(col.code_suivi, col.statut);

            // Initialize variables
            let montant_a_payeur = 0;
            let tarif_livraison = 0;
            let old_tarif_livraison = 0;
            let tarif_fragile = 0;
            let tarif_ajouter = 0;
            let tarif_total = 0;
            let remarque = '';

            if (facture.type === 'client') {
                if (col.statut === 'Livrée') {
                    // For delivered colis, use the city's delivery tariff
                    old_tarif_livraison = col.ville?.tarif || 0;
                    if (storedPromotion && typeof storedPromotion.value === 'number') {
                        if (storedPromotion.type === 'fixed_tarif') {
                            tarif_livraison = storedPromotion.value;
                        } else if (storedPromotion.type === 'percentage_discount') {
                            tarif_livraison = old_tarif_livraison * (1 - storedPromotion.value / 100);
                        }
                    } else {
                        tarif_livraison = old_tarif_livraison;
                    }
                } else if (['Refusée', 'En Retour', 'Fermée'].includes(col.statut)) {
                    old_tarif_livraison = col.ville?.tarif_refus || 0;
                    tarif_livraison = old_tarif_livraison;
                } else {
                    old_tarif_livraison = col.ville?.tarif || 0;
                    tarif_livraison = (storedPromotion && typeof storedPromotion.value === 'number')
                        ? (storedPromotion.type === 'fixed_tarif'
                            ? storedPromotion.value
                            : old_tarif_livraison * (1 - storedPromotion.value / 100))
                        : old_tarif_livraison;
                }

                if (tarif_livraison > old_tarif_livraison) {
                    tarif_livraison = old_tarif_livraison;
                }

                if (col.pret_payant) {
                    old_tarif_livraison = 0;
                    tarif_livraison = 0;
                }

                if (col.tarif_ajouter && typeof col.tarif_ajouter.value === 'number') {
                    tarif_ajouter = col.tarif_ajouter.value;
                }

                if (col.is_fragile) {
                    tarif_fragile = 5;
                }

                if (['Refusée', 'En Retour', 'Fermée'].includes(col.statut)) {
                    tarif_total = tarif_fragile + tarif_ajouter;
                    montant_a_payeur = 0;
                } else {
                    tarif_total = tarif_livraison + tarif_fragile + tarif_ajouter;
                    montant_a_payeur = col.prix - tarif_total;
                }
            } else if (facture.type === 'livreur') {
                // For livreur facture, use separate logic:
                if (col.statut === 'Livrée') {
                    // Fetch TarifLivreur based on livreur and ville
                    const tarifLivreur = await TarifLivreur.findOne({
                        id_livreur: col.livreur._id,
                        id_ville: col.ville._id
                    }).lean();
                    // If not found, default to 20
                    old_tarif_livraison = tarifLivreur && tarifLivreur.tarif ? tarifLivreur.tarif : 20;
                    tarif_livraison = old_tarif_livraison;
                    montant_a_payeur = col.prix - tarif_livraison;
                    if (montant_a_payeur < 0) montant_a_payeur = 0;
                } else if (['Refusée', 'Annulée'].includes(col.statut)) {
                    old_tarif_livraison = 0;
                    tarif_livraison = 0;
                    montant_a_payeur = 0;
                    remarque = 'Colis refusée';
                } else {
                    old_tarif_livraison = 0;
                    tarif_livraison = 0;
                    montant_a_payeur = 0;
                }
                if (col.pret_payant) {
                    montant_a_payeur = 0;
                    tarif_livraison = 0;
                }
                tarif_fragile = 0;
                tarif_ajouter = 0;
                tarif_total = tarif_livraison + tarif_fragile + tarif_ajouter;
            }

            return {
                code_suivi: col.code_suivi,
                destinataire: col.nom,
                telephone: col.tele,
                ville: col.ville ? col.ville.nom : null,
                adresse: col.adresse,
                statut: col.statut,
                prix: col.prix,
                old_tarif_livraison,
                new_tarif_livraison: tarif_livraison,
                tarif_fragile,
                tarif_ajouter,
                tarif_total,
                montant_a_payeur,
                date_livraison: col.date_livraisant,
                remarque,
                fragile: col.is_fragile,
                pret_payant: col.pret_payant,
            };
        }));

        // Aggregate totals from all colis details (client facture type)
        let totalPrix = 0;
        let totalOldTarifLivraison = 0;
        let totalNewTarifLivraison = 0;
        let totalTarifFragile = 0;
        let totalTarifAjouter = 0;
        let totalTarif = 0;
        let totalFraisRefus = 0;

        colisDetails.forEach(col => {
            if (facture.type === 'client') {
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
            } else if (facture.type === 'livreur') {
                totalPrix += col.montant_a_payeur;
                totalOldTarifLivraison += col.old_tarif_livraison;
                totalNewTarifLivraison += col.new_tarif_livraison;
                totalTarifFragile += col.tarif_fragile;
                totalTarifAjouter += col.tarif_ajouter;
                totalTarif += col.tarif_total;
            }
        });

        const netAPayer = facture.type === 'client'
            ? (totalPrix + totalTarifAjouter - totalTarif) - totalFraisRefus
            : totalPrix;

        const factureResponse = {
            code_facture: facture.code_facture,
            etat: facture.etat,
            date_facture: facture.createdAt,
            type: facture.type,
            store: facture.store ? facture.store.storeName : null,
            client_tele: facture.store && facture.store.id_client ? facture.store.id_client.tele : null,
            livreur: facture.livreur ? facture.livreur.nom : null,
            livreur_tele: facture.livreur ? facture.livreur.tele : null,
            totalPrix,
            totalOldTarifLivraison,
            totalNewTarifLivraison,
            totalTarifFragile,
            totalTarifAjouter,
            totalTarif,
            totalFraisRefus,
            netAPayer,
            colis: colisDetails,
        };

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
    const facture = await Facture.findOne({ colis: colis._id , type : "client" });

    if (facture) {
        res.status(200).json({facture});
    } else {
        res.status(404).json({
            message: "Cette colis n'a pas de facture associée.",
        });
    }
});



/**
 * @desc    Merge multiple factures into a single facture based on code_facture
 * @route   POST /api/facture/merge
 * @method  POST
 * @access  Private/Admin
 */
const mergeFactures = asyncHandler(async (req, res) => {
    const { factureCodes } = req.body; // Expecting an array of code_facture

    // Step 1: Input Validation
    if (!factureCodes || !Array.isArray(factureCodes) || factureCodes.length < 2) {
        return res.status(400).json({
            message: 'Please provide an array of at least two code_facture values to merge.',
        });
    }

    // Step 2: Fetch Factures based on code_facture
    const factures = await Facture.find({ code_facture: { $in: factureCodes } })
        .populate('store')
        .populate('livreur')
        .populate('colis')
        .lean();

    if (factures.length !== factureCodes.length) {
        return res.status(404).json({
            message: 'One or more factures not found based on the provided code_facture.',
        });
    }

    // Step 3: Ensure all factures are of the same type
    const factureType = factures[0].type;
    if (!factures.every(facture => facture.type === factureType)) {
        return res.status(400).json({
            message: 'All factures must be of the same type (client or livreur).',
        });
    }

    // Step 4: Ensure same store or livreur
    let commonStore = null;
    let commonLivreur = null;

    if (factureType === 'client') {
        commonStore = factures[0].store;
        if (!commonStore) {
            return res.status(400).json({
                message: 'Facture of type client must be associated with a store.',
            });
        }
        const allSameStore = factures.every(facture => facture.store && facture.store._id.toString() === commonStore._id.toString());
        if (!allSameStore) {
            return res.status(400).json({
                message: 'All client factures must belong to the same store.',
            });
        }
    } else if (factureType === 'livreur') {
        commonLivreur = factures[0].livreur;
        if (!commonLivreur) {
            return res.status(400).json({
                message: 'Facture of type livreur must be associated with a livreur.',
            });
        }
        const allSameLivreur = factures.every(facture => facture.livreur && facture.livreur._id.toString() === commonLivreur._id.toString());
        if (!allSameLivreur) {
            return res.status(400).json({
                message: 'All livreur factures must belong to the same livreur.',
            });
        }
    } else {
        return res.status(400).json({
            message: 'Unknown facture type. Allowed types: client, livreur.',
        });
    }

    // Step 5: Aggregate Data with Safe Number Parsing
    let mergedColis = [];
    let mergedTotalPrix = 0;
    let mergedTotalTarifLivraison = 0;
    let mergedTotalTarifFragile = 0;
    let mergedTotalTarifAjouter = 0;
    let mergedTotalTarif = 0;
    let mergedTotalFraisRefus = 0;
    let mergedOriginalTarifLivraison = 0;
    let mergedPromotion = null; // Assuming promotions are consistent across factures; handle otherwise

    for (const facture of factures) {
        // Aggregate colis
        if (facture.colis && Array.isArray(facture.colis)) {
            mergedColis = mergedColis.concat(facture.colis.map(col => col._id));
        }

        // Sum up the tariffs with safe parsing
        mergedTotalPrix += Number(facture.totalPrix) || 0;
        mergedTotalTarifLivraison += Number(facture.totalTarifLivraison) || 0;
        mergedTotalTarifFragile += Number(facture.totalTarifFragile) || 0;
        mergedTotalTarifAjouter += Number(facture.totalTarifAjouter) || 0;
        mergedTotalTarif += Number(facture.totalTarif) || 0;
        mergedTotalFraisRefus += Number(facture.totalFraisRefus) || 0;
        mergedOriginalTarifLivraison += Number(facture.originalTarifLivraison) || 0;

        // Handle promotions
        if (facture.promotion) {
            if (!mergedPromotion) {
                mergedPromotion = facture.promotion;
            } else {
                // Ensure all promotions are the same; otherwise, decide on a strategy
                // For simplicity, we'll assume all promotions are identical
                const isSamePromotion = JSON.stringify(mergedPromotion) === JSON.stringify(facture.promotion);
                if (!isSamePromotion) {
                    // If promotions differ, decide whether to keep one, combine, or skip
                    // Here, we'll skip merging if promotions differ
                    return res.status(400).json({
                        message: 'Cannot merge factures with different promotions.',
                    });
                }
            }
        }
    }

    // Optional: Remove duplicate colis IDs
    mergedColis = [...new Set(mergedColis.map(col => col.toString()))].map(id => new mongoose.Types.ObjectId(id));

    // Step 6: Create Merged Facture
    try {
        // Generate a new code_facture based on the latest date among factures
        const latestDate = factures.reduce((max, facture) => {
            return facture.date > max ? facture.date : max;
        }, new Date(0));
        const newCodeFacture = generateCodeFacture(latestDate);

        // Create the new merged facture
        const mergedFactureData = {
            code_facture: newCodeFacture,
            type: factureType,
            date: latestDate,
            colis: mergedColis, // Already ensured to contain only ObjectIds
            totalPrix: mergedTotalPrix,
            totalTarifLivraison: mergedTotalTarifLivraison,
            totalTarifFragile: mergedTotalTarifFragile,
            totalTarifAjouter: mergedTotalTarifAjouter,
            totalTarif: mergedTotalTarif,
            totalFraisRefus: mergedTotalFraisRefus,
            originalTarifLivraison: mergedOriginalTarifLivraison,
            etat: false, // Default to not paid; adjust if needed
            promotion: mergedPromotion, // Assign merged promotion if applicable
        };

        if (factureType === 'client') {
            mergedFactureData.store = commonStore._id;
        } else if (factureType === 'livreur') {
            mergedFactureData.livreur = commonLivreur._id;
        }

        const mergedFacture = new Facture(mergedFactureData);
        await mergedFacture.save();

        // Step 7: Delete Original Factures
        const deleteResult = await Facture.deleteMany({ code_facture: { $in: factureCodes } });

        if (deleteResult.deletedCount !== factureCodes.length) {
            // If not all factures were deleted, you might want to handle this scenario
            console.warn('Not all original factures were deleted.');
        }

        // Step 8: Respond with the merged facture
        const populatedMergedFacture = await Facture.findById(mergedFacture._id)
            .populate('store')
            .populate('livreur')
            .populate('colis')
            .lean();

        res.status(200).json({
            message: 'Factures merged successfully.',
            mergedFacture: populatedMergedFacture,
        });
    } catch (error) {
        console.error('Error merging factures:', error);
        res.status(500).json({
            message: 'An error occurred while merging factures.',
            error: error.message,
        });
    }
});


/**
 * @desc    Remove a colis from a facture using code_facture and code_suivi, and update all related calculations
 * @route   DELETE /api/facture/:code_facture/colis/:code_suivi
 * @method  DELETE
 * @access  Private/Admin
 */
const removeColisFromFacture = asyncHandler(async (req, res) => {
    const { code_facture, code_suivi } = req.params;

    // Step 1: Input Validation
    if (!code_facture || !code_suivi) {
        return res.status(400).json({ message: 'Both code_facture and code_suivi are required.' });
    }

    // Step 2: Fetch the Facture by code_facture
    const facture = await Facture.findOne({ code_facture })
        .populate('store')
        .populate('livreur')
        .populate('colis')
        .exec();

    if (!facture) {
        return res.status(404).json({ message: 'Facture not found.' });
    }

    // Step 3: Fetch the Colis by code_suivi
    const colis = await Colis.findOne({ code_suivi }).populate('ville').exec();

    if (!colis) {
        return res.status(404).json({ message: 'Colis not found.' });
    }

    // Step 4: Verify Colis Association with Facture
    const colisIndex = facture.colis.findIndex(col => col.code_suivi === code_suivi);
    if (colisIndex === -1) {
        return res.status(404).json({ message: 'Colis not found in the specified facture.' });
    }

    // Step 5: Calculate the Impact of Removing the Colis
    let {
        prix,
        statut,
        is_fragile,
        tarif_ajouter,
        ville,
        pret_payant,
    } = colis;

    // Initialize variables for calculations
    let originalTarifLivraison = 0;
    let tarif_livraison = 0;
    let tarif_fragile_val = is_fragile ? 5 : 0; // Avoid naming conflict
    let total_tarif = 0;
    let montant = 0;
    let fraisRefus = 0;

    if (facture.type === 'client') {
        if (statut === 'Livrée') {
            originalTarifLivraison = Number(ville.tarif) || 0;
            tarif_livraison = Number(facture.originalTarifLivraison) >= originalTarifLivraison
                ? originalTarifLivraison
                : Number(facture.originalTarifLivraison) || 0; // Ensure consistency
            montant = pret_payant ? 0 : (Number(prix) || 0) - (tarif_livraison + tarif_fragile_val + (Number(tarif_ajouter) || 0));
        } else if (statut === 'Refusée') {
            originalTarifLivraison = Number(ville.tarif_refus) || 0;
            tarif_livraison = Number(facture.originalTarifLivraison) >= originalTarifLivraison
                ? originalTarifLivraison
                : Number(facture.originalTarifLivraison) || 0; // Ensure consistency
            montant = pret_payant ? 0 : -originalTarifLivraison;
            fraisRefus = tarif_livraison;
        } else {
            // Handle other statuses if necessary
            originalTarifLivraison = Number(ville.tarif) || 0;
            tarif_livraison = Number(facture.originalTarifLivraison) >= originalTarifLivraison
                ? originalTarifLivraison
                : Number(facture.originalTarifLivraison) || 0;
            montant = pret_payant ? 0 : (Number(prix) || 0) - (tarif_livraison + tarif_fragile_val + (Number(tarif_ajouter) || 0));
        }

        total_tarif = tarif_livraison + tarif_fragile_val + (Number(tarif_ajouter) || 0);
    } else if (facture.type === 'livreur') {
        if (statut === 'Livrée') {
            originalTarifLivraison = Number(facture.originalTarifLivraison) || 0;
            tarif_livraison = originalTarifLivraison;
            montant = pret_payant ? 0 : (Number(prix) || 0) - tarif_livraison;
        } else {
            originalTarifLivraison = 0;
            tarif_livraison = 0;
            montant = 0;
            // Optionally handle other statuses like 'Refusée' or 'Annulée'
        }

        total_tarif = tarif_livraison; // For livreur, fragile and ajouter are typically not applicable
    }

    // Debugging: Log the calculated values
    console.log('Calculated Values for Removal:');
    console.log(`montant: ${montant}`);
    console.log(`tarif_livraison: ${tarif_livraison}`);
    console.log(`tarif_fragile_val: ${tarif_fragile_val}`);
    console.log(`tarif_ajouter: ${tarif_ajouter}`);
    console.log(`total_tarif: ${total_tarif}`);
    console.log(`fraisRefus: ${fraisRefus}`);
    console.log(`originalTarifLivraison: ${originalTarifLivraison}`);

    // Ensure all variables are valid numbers
    montant = Number(montant) || 0;
    tarif_livraison = Number(tarif_livraison) || 0;
    tarif_fragile_val = Number(tarif_fragile_val) || 0;
    tarif_ajouter = Number(tarif_ajouter) || 0;
    total_tarif = Number(total_tarif) || 0;
    fraisRefus = Number(fraisRefus) || 0;
    originalTarifLivraison = Number(originalTarifLivraison) || 0;

    // Step 6: Update Facture Totals by Removing Colis Contributions
    facture.colis.splice(colisIndex, 1); // Remove the colis from the array

    // Adjust totals with safeguards
    facture.totalPrix = (Number(facture.totalPrix) || 0) - montant;
    facture.totalTarifLivraison = (Number(facture.totalTarifLivraison) || 0) - tarif_livraison;

    if (facture.type === 'client') {
        facture.totalTarifFragile = (Number(facture.totalTarifFragile) || 0) - tarif_fragile_val;
        facture.totalTarifAjouter = (Number(facture.totalTarifAjouter) || 0) - tarif_ajouter;
    }

    facture.totalTarif = (Number(facture.totalTarif) || 0) - total_tarif;

    if (statut === 'Refusée') {
        facture.totalFraisRefus = (Number(facture.totalFraisRefus) || 0) - fraisRefus;
    }

    facture.originalTarifLivraison = (Number(facture.originalTarifLivraison) || 0) - originalTarifLivraison;

    // Optional: Handle negative totals
    // Ensure totals do not go below zero
    facture.totalPrix = Math.max(facture.totalPrix, 0);
    facture.totalTarifLivraison = Math.max(facture.totalTarifLivraison, 0);
    if (facture.type === 'client') {
        facture.totalTarifFragile = Math.max(facture.totalTarifFragile, 0);
        facture.totalTarifAjouter = Math.max(facture.totalTarifAjouter, 0);
    }
    facture.totalTarif = Math.max(facture.totalTarif, 0);
    if (statut === 'Refusée') {
        facture.totalFraisRefus = Math.max(facture.totalFraisRefus, 0);
    }
    facture.originalTarifLivraison = Math.max(facture.originalTarifLivraison, 0);

    // Debugging: Log the updated totals
    console.log('Updated Facture Totals:');
    console.log(`totalPrix: ${facture.totalPrix}`);
    console.log(`totalTarifLivraison: ${facture.totalTarifLivraison}`);
    if (facture.type === 'client') {
        console.log(`totalTarifFragile: ${facture.totalTarifFragile}`);
        console.log(`totalTarifAjouter: ${facture.totalTarifAjouter}`);
    }
    console.log(`totalTarif: ${facture.totalTarif}`);
    if (statut === 'Refusée') {
        console.log(`totalFraisRefus: ${facture.totalFraisRefus}`);
    }
    console.log(`originalTarifLivraison: ${facture.originalTarifLivraison}`);

    // Step 7: Save the Updated Facture
    await facture.save();

    // Step 8: Update Related Entities (Store or Livreur)
    if (facture.type === 'client') {
        const store = facture.store;

        if (store) {
            // Calculate the montant to adjust the store's solde
            const montantToAdjust = montant; // This could be positive or negative

            store.solde = (Number(store.solde) || 0) - montantToAdjust; // Subtract since we're removing the colis
            await store.save();

            // Create a corresponding transaction
            const transaction = new Transaction({
                id_store: store._id,
                montant: montantToAdjust,
                type: montantToAdjust >= 0 ? 'credit' : 'debit',
                etat: true,
            });
            await transaction.save();

            // Send a notification to the store
            const notification = new NotificationUser({
                id_store: store._id,
                title: montantToAdjust >= 0 ? `+ ${montantToAdjust} DH` : `- ${Math.abs(montantToAdjust)} DH`,
                description: `Votre portefeuille a été ${montantToAdjust >= 0 ? 'crédité' : 'débité'} de ${Math.abs(montantToAdjust)} DH suite à la suppression du colis ${colis.code_suivi} de la facture ${facture.code_facture}.`,
            });
            await notification.save();
        }
    } else if (facture.type === 'livreur') {
        const livreur = facture.livreur;

        if (livreur) {
            // Calculate the montant to adjust the livreur's solde
            const montantToAdjust = montant; // This could be positive or negative

            livreur.solde = (Number(livreur.solde) || 0) - montantToAdjust; // Subtract since we're removing the colis
            await livreur.save();

            // Create a corresponding transaction
            const transaction = new Transaction({
                id_livreur: livreur._id, // Assuming 'id_livreur' is the correct field
                montant: montantToAdjust,
                type: montantToAdjust >= 0 ? 'credit' : 'debit',
                etat: true,
            });
            await transaction.save();

            // Send a notification to the livreur
            const notification = new NotificationUser({
                id_livreur: livreur._id,
                title: montantToAdjust >= 0 ? `+ ${montantToAdjust} DH` : `- ${Math.abs(montantToAdjust)} DH`,
                description: `Votre portefeuille a été ${montantToAdjust >= 0 ? 'crédité' : 'débité'} de ${Math.abs(montantToAdjust)} DH suite à la suppression du colis ${colis.code_suivi} de la facture ${facture.code_facture}.`,
            });
            await notification.save();
        }
    }

    // Step 9: Handle Empty Facture (Optional)
    if (facture.colis.length === 0) {
        // Decide whether to delete the facture or retain it with zero colis
        // Here, we'll delete the facture
        await Facture.findOneAndDelete({ code_facture });
        return res.status(200).json({ message: 'Colis removed and facture deleted as it has no more colis.', facture: null });
    }

    // Step 10: Respond to the Client with the Updated Facture
    res.status(200).json({
        message: 'Colis removed successfully from the facture.',
        facture,
    });
});


/**
 * Controller to remove a colis from a client facture.
 * This function updates the facture totals by subtracting the pricing of the removed colis.
 * It assumes that the same business logic used in createOrUpdateFacture applies for computing the amounts.
 *
 * Expects:
 *   req.params.id       - Facture ID or code identifying the facture.
 *   req.params.colisId  - The ID of the colis to remove.
 */
const removeColisFromClientFacture = asyncHandler(async (req, res) => {
    // Get facture code and colis code_suivi from request parameters
    const { code_facture, code_suivi } = req.params;
  
    // 1. Find the facture by its code_facture
    const facture = await Facture.findOne({ code_facture });
    if (!facture) {
      return res.status(404).json({ message: 'Facture not found' });
    }
    if (facture.type !== 'client') {
      return res.status(400).json({ message: 'This endpoint only handles client factures' });
    }
  
    // 2. Find the colis by its code_suivi
    const colis = await Colis.findOne({ code_suivi }).populate('ville').exec();
    if (!colis) {
      return res.status(404).json({ message: 'Colis not found' });
    }
  
    // 3. Verify that this colis is part of the facture
    const colisExists = facture.colis.some(
      (colId) => colId.toString() === colis._id.toString()
    );
    if (!colisExists) {
      return res.status(404).json({ message: 'Colis is not associated with this facture' });
    }
  
    // 4. Recompute pricing details for the colis using the same logic as when adding it
    let originalTarifLivraisonClient = 0;
    if (colis.statut === 'Livrée') {
      originalTarifLivraisonClient = colis.ville?.tarif || 0;
    } else if (colis.statut === 'Refusée') {
      originalTarifLivraisonClient = colis.ville?.tarif_refus || 0;
    }
  
    // For this example, assume that any promotion adjustments have been saved previously in the colis.crbt field.
    // If not, you can re-run your promotion logic here.
    const tarif_livraisonClient = colis.crbt ? colis.crbt.tarif_livraison : originalTarifLivraisonClient;
    const tarif_fragile = colis.crbt ? colis.crbt.tarif_fragile : (colis.is_fragile ? 5 : 0);
    const tarif_ajouter = colis.crbt ? colis.crbt.tarif_supplementaire : (colis.tarif_ajouter?.value || 0);
  
    let total_tarifClient = 0;
    if (colis.statut === 'Refusée') {
      total_tarifClient = tarif_fragile + tarif_ajouter;
    } else {
      total_tarifClient = tarif_livraisonClient + tarif_fragile + tarif_ajouter;
    }
  
    // Calculate the "rest" (prix à payer) for delivered colis
    let rest = 0;
    if (colis.statut === 'Livrée') {
      rest = colis.prix - total_tarifClient;
    }
  
    // 5. Build the update object to remove this colis and adjust totals accordingly.
    const update = {
        $pull: { colis: new mongoose.Types.ObjectId(colis._id) }, // Use 'new' here
      };
      
      // Adjust totals based on the colis status
      if (colis.statut === 'Livrée') {
        update.$inc = {
          totalPrix: -rest,
          totalTarifLivraison: -tarif_livraisonClient,
          totalTarifFragile: -tarif_fragile,
          totalTarifAjouter: -tarif_ajouter,
          totalTarif: -total_tarifClient,
        };
      } else if (colis.statut === 'Refusée') {
        // Adjust if necessary for refusals (this logic may vary based on your business rules)
        update.$inc = {
          totalPrix: originalTarifLivraisonClient, // Adjust as needed
          totalTarifLivraison: 0,
          totalTarifFragile: -tarif_fragile,
          totalTarifAjouter: -tarif_ajouter,
          totalTarif: -total_tarifClient,
        };
      } else {
        update.$inc = {};
      }
    // 6. Update the facture document in the database
    await Facture.updateOne({ _id: facture._id }, update);
  
    // 7. Optionally, update the colis document (e.g. remove its facture reference)
    // For example, if you keep a 'facture' field on the colis, set it to null.
    colis.facture = null;
    await colis.save();
  
    // 8. Return the updated facture document or a success message
    const updatedFacture = await Facture.findById(facture._id).lean();
    res.status(200).json({
      message: 'Colis removed from facture successfully',
      facture: updatedFacture,
    });
  });


  /**
 * Controller to add a colis to an existing client facture.
 * This endpoint uses:
 *   - The facture's unique code (code_facture) to find the facture.
 *   - The colis' unique code_suivi to find the colis.
 *
 * Requirements:
 *   - The facture must exist and be of type "client".
 *   - The colis must exist and have statut "Livrée".
 *   - The colis must not already be in any client facture.
 *   - The store in the colis must match the store in the facture.
 *   - The CRBT calculations and any active promotion adjustments are applied.
 *
 * Expected route:
 *   POST /api/facture/client/code/:code_facture/colis/:code_suivi
 */
const addColisToExistingClientFacture = asyncHandler(async (req, res) => {
    const { code_facture, code_suivi } = req.params;
  
    // 1. Find the existing facture by its unique code.
    const facture = await Facture.findOne({ code_facture });
    if (!facture) {
      return res.status(404).json({ message: 'Facture not found' });
    }
    if (facture.type !== 'client') {
      return res.status(400).json({ message: 'This endpoint only applies to client factures' });
    }
  
    // 2. Find the colis by its code_suivi (with store and ville populated).
    const colis = await Colis.findOne({ code_suivi })
      .populate('store')
      .populate('ville')
      .exec();
    if (!colis) {
      return res.status(404).json({ message: 'Colis not found' });
    }
  
    // 3. Verify that the colis has statut "Livrée".
    if (colis.statut !== 'Livrée') {
      return res.status(400).json({ message: 'Only colis with status "Livrée" can be added to a facture' });
    }
  
    // 4. Verify that the store in the colis matches the store in the facture.
    if (facture.store.toString() !== colis.store._id.toString()) {
      return res.status(400).json({
        message: 'The store in the colis does not match the store in the facture',
      });
    }
  
    // 5. Ensure the colis is not already associated with any client facture.
    const existingFactureForColis = await Facture.findOne({
      type: 'client',
      colis: colis._id,
    });
    if (existingFactureForColis) {
      return res.status(400).json({
        message: `Colis with code ${colis.code_suivi} is already associated with a client facture`,
      });
    }
  
    // 6. Fetch active promotions.
    const now = new Date();
    const activePromotions = await Promotion.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).lean();
  
    // 7. Calculate the original delivery tariff from the ville.
    const originalTarifLivraisonClient = colis.ville?.tarif || 0;
  
    // 8. Apply any active promotion.
    let tarif_livraisonClient = originalTarifLivraisonClient;
    let appliedPromotion = null;
    const promotionResult = applyPromotion(
      colis.store._id,
      originalTarifLivraisonClient,
      activePromotions
    );
    tarif_livraisonClient = promotionResult.tarif_livraison;
    appliedPromotion = promotionResult.appliedPromotion;
  
    // 9. Compute additional fees:
    const tarif_fragile = colis.is_fragile ? 5 : 0;
    const tarif_ajouter = colis.tarif_ajouter?.value || 0;
  
    // 10. Compute the total tariff for this colis.
    const total_tarifClient = tarif_livraisonClient + tarif_fragile + tarif_ajouter;
  
    // 11. Calculate the "rest" (prix à payer) for this colis.
    const rest = colis.prix - total_tarifClient;
  
    // 12. Build the cost breakdown (CRBT) object.
    const crbtData = {
      prix_colis: colis.prix,
      tarif_livraison: tarif_livraisonClient,
      tarif_refuse: 0, // Not applicable for delivered colis.
      tarif_fragile,
      tarif_supplementaire: tarif_ajouter,
      prix_a_payant: rest,
      total_tarif: total_tarifClient,
    };
  
    // 13. (Optional) Verify that the facture date (grouping key) is consistent.
    // Here, we assume that the facture already exists, so we do not change its date.
  
    // 14. Check if the colis is already included in this facture.
    const alreadyInFacture = facture.colis.some(
      (existingId) => existingId.toString() === colis._id.toString()
    );
    if (alreadyInFacture) {
      return res.status(400).json({
        message: `Colis with code ${colis.code_suivi} is already included in this facture`,
      });
    }
  
    // 15. Update the facture by adding the colis and updating totals.
    const updateFields = {
      $push: { colis: colis._id },
      $inc: {
        totalTarifLivraison: tarif_livraisonClient,
        totalTarifFragile: tarif_fragile,
        totalTarifAjouter: tarif_ajouter,
        totalTarif: total_tarifClient,
        totalPrix: rest, // Add the "rest" from this colis.
      },
    };
    if (appliedPromotion) {
      updateFields.$set = { promotion: appliedPromotion };
    }
    await Facture.updateOne({ _id: facture._id }, updateFields);
  
    // 16. Update the colis document to record its association with the facture and CRBT details.
    colis.facture = facture._id; // If you track this relation.
    colis.crbt = crbtData;
    colis.statu_final = 'Livrée';
    await colis.save();
  
    // 17. Return the updated facture.
    const updatedFacture = await Facture.findById(facture._id)
      .populate('store')
      .populate('colis')
      .lean();
  
    res.status(200).json({
      message: 'Colis added successfully to the existing client facture',
      facture: updatedFacture,
    });
  });




 
/**
 * Controller to get colis without facture (for client factures).
 * The query returns colis that:
 *   - Have a non-null "store" (indicating they belong to a client)
 *   - Have a null "livreur" (ensuring they are not for livreurs)
 *   - Have no associated facture (facture is null or does not exist)
 *
 * Optionally, you can pass a "storeId" query parameter to filter by a specific store.
 *
 * Example endpoint:
 *   GET /api/colis/withoutfacture?storeId=60c1f9d1234567890abcdef
 */
const getColisWithoutFactureForClient = asyncHandler(async (req, res) => {
    try {
        const { storeId } = req.query;
    
        // 1. Retrieve only factures of type 'client' and select the 'colis' field.
        const factures = await Facture.find({ type: 'client' }, 'colis').lean();
        console.log('Retrieved Factures (type: client):', factures);
    
        // 2. Extract all colis IDs from the factures.
        let facturedColisIds = [];
        factures.forEach((facture) => {
          if (facture.colis && Array.isArray(facture.colis)) {
            facture.colis.forEach((colisId) => {
              // Make sure that the colisId exists and is not null
              if (colisId) {
                facturedColisIds.push(colisId.toString());
              }
            });
          }
        });
    
        // Remove duplicates and convert to ObjectId
        facturedColisIds = Array.from(new Set(facturedColisIds)).map(
          (id) => new mongoose.Types.ObjectId(id)
        );
        console.log('Collected factured Colis IDs:', facturedColisIds);
    
        // 3. Build the base query for Colis:
        //    - Filter for client colis (store not null)
        //    - No assigned livreur (explicitly check for null)
        const query = {
          store: { $ne: null },
          livreur: null,
        };
    
        // 4. Exclude colis that are referenced in a client facture.
        // If facturedColisIds is empty, this condition does nothing.
        if (facturedColisIds.length > 0) {
          query._id = { $nin: facturedColisIds };
        }
        
        // 5. Optionally filter by storeId if provided.
        if (storeId) {
          if (mongoose.Types.ObjectId.isValid(storeId)) {
            query.store = new mongoose.Types.ObjectId(storeId);
          } else {
            console.warn(`Ignoring invalid storeId "${storeId}".`);
          }
        }
    
        // 6. Debug: Log the final query
        console.log('Final Colis query:', JSON.stringify(query, null, 2));
    
        // 7. Query Colis collection with the constructed query.
        const colisWithoutFacture = await Colis.find(query).lean();
        console.log(`Found ${colisWithoutFacture.length} colis without facture.`);
    
        // 8. Return the results.
        res.status(200).json({
          message: 'Colis without facture retrieved successfully',
          colis: colisWithoutFacture,
        });
      } catch (error) {
        console.error('Error fetching colis without facture:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
      }
    });

  
    /**
 * Controller to transfer one or more colis from one client facture (mother) to another (child).
 * 
 * Expects:
 *  - req.params.source_code_facture : The unique code of the source facture.
 *  - req.params.target_code_facture : (Optional) The unique code of the target facture.
 *      If not provided, a new facture will be created.
 *  - req.body.colisCodes : An array of colis code_suivi values to transfer.
 */
    const transferColisBetweenFactures = asyncHandler(async (req, res) => {
        const { source_code_facture, target_code_facture } = req.params;
        const { colisCodes } = req.body; // an array of colis code_suivi values
      
        if (!colisCodes || !Array.isArray(colisCodes) || colisCodes.length === 0) {
          return res.status(400).json({ message: "No colis codes provided for transfer." });
        }
      
        // 1. Find the source facture by its unique code.
        const sourceFacture = await Facture.findOne({ code_facture: source_code_facture });
        if (!sourceFacture) {
          return res.status(404).json({ message: "Source facture not found." });
        }
        if (sourceFacture.type !== 'client') {
          return res.status(400).json({ message: "Source facture is not a client facture." });
        }
      
        // 2. Determine the target facture:
        //    - If a target facture code is provided, try to find it.
        //    - Otherwise, create a new facture (using the store from the first colis).
        let targetFacture;
        if (target_code_facture) {
          targetFacture = await Facture.findOne({ code_facture: target_code_facture });
          if (!targetFacture) {
            return res.status(404).json({ message: "Target facture not found." });
          }
          if (targetFacture.type !== 'client') {
            return res.status(400).json({ message: "Target facture is not a client facture." });
          }
        } else {
          // Retrieve the first colis to determine the store.
          const firstColis = await Colis.findOne({ code_suivi: colisCodes[0] }).populate('store');
          if (!firstColis) {
            return res.status(404).json({ message: "The first colis was not found." });
          }
          targetFacture = new Facture({
            code_facture: `F-${Date.now()}`, // simple new code generation; customize as needed
            type: 'client',
            store: firstColis.store._id,
            // Initialize totals (including separate fields for old and new tariffs)
            totalPrix: 0,
            totalOldTarifLivraison: 0,
            totalNewTarifLivraison: 0,
            totalTarifFragile: 0,
            totalTarifAjouter: 0,
            totalTarif: 0
          });
          await targetFacture.save();
        }
      
        // Prepare accumulators for updating facture totals.
        let removalUpdate = { $inc: {
          totalPrix: 0,
          totalOldTarifLivraison: 0,
          totalNewTarifLivraison: 0,
          totalTarifFragile: 0,
          totalTarifAjouter: 0,
          totalTarif: 0
        }};
        let additionUpdate = { $inc: {
          totalPrix: 0,
          totalOldTarifLivraison: 0,
          totalNewTarifLivraison: 0,
          totalTarifFragile: 0,
          totalTarifAjouter: 0,
          totalTarif: 0
        }};
      
        // Process each colis code.
        for (const code_suivi of colisCodes) {
          // 3. Find the colis by its code_suivi (populate ville and store).
          const colis = await Colis.findOne({ code_suivi }).populate('ville store');
          if (!colis) {
            return res.status(404).json({ message: `Colis with code ${code_suivi} not found.` });
          }
      
          // 4. Verify that this colis is part of the source facture.
          const inSource = sourceFacture.colis.some(
            (colId) => colId.toString() === colis._id.toString()
          );
          if (!inSource) {
            return res.status(400).json({ message: `Colis with code ${code_suivi} is not in the source facture.` });
          }
      
          /* --------------------------------------
             REMOVAL LOGIC (from Source Facture)
             -------------------------------------- */
          // Use the "old" tariff from the ville (normal tariff) and fees.
          const oldTarifLivraison = colis.ville?.tarif || 0;
          const fragileFee = colis.is_fragile ? 5 : 0;
          const additionalFee = colis.tarif_ajouter?.value || 0;
          const totalTarifForColis = oldTarifLivraison + fragileFee + additionalFee;
          // For removal, subtract the entire colis price and associated tariff fees.
          removalUpdate.$inc.totalPrix -= colis.prix;
          removalUpdate.$inc.totalOldTarifLivraison -= oldTarifLivraison;
          removalUpdate.$inc.totalNewTarifLivraison -= oldTarifLivraison; // source uses normal tariff
          removalUpdate.$inc.totalTarifFragile -= fragileFee;
          removalUpdate.$inc.totalTarifAjouter -= additionalFee;
          removalUpdate.$inc.totalTarif -= totalTarifForColis;
      
          // Remove the colis from the source facture.
          await Facture.updateOne({ _id: sourceFacture._id }, { $pull: { colis: colis._id } });
      
          /* --------------------------------------
             ADDITION LOGIC (to Target Facture)
             -------------------------------------- */
          // Only delivered colis can be added.
          if (colis.statut !== 'Livrée') {
            return res.status(400).json({ message: `Only delivered colis can be added to target facture. Colis ${code_suivi} has status ${colis.statut}.` });
          }
          // Ensure that the store matches.
          if (targetFacture.store.toString() !== colis.store._id.toString()) {
            return res.status(400).json({ message: `Store mismatch for colis ${code_suivi} when adding to target facture.` });
          }
      
          // --- Calculate tariffs for the target facture ---
          // The "old" tariff is the normal tariff from the ville.
          const computedOldTarif = oldTarifLivraison;
          let computedNewTarif = computedOldTarif;
          let appliedPromotion = null;
      
          if (target_code_facture) {
            // When transferring to an existing facture, apply active promotions.
            const now = new Date();
            const activePromotions = await Promotion.find({
              isActive: true,
              startDate: { $lte: now },
              endDate: { $gte: now }
            }).lean();
            const promoResult = applyPromotion(colis.store._id, computedOldTarif, activePromotions);
            computedNewTarif = promoResult.tarif_livraison;
            // If the old tariff is greater than or equal to the computed new tariff, keep the old tariff.
            if (computedOldTarif >= computedNewTarif) {
              computedNewTarif = computedOldTarif;
            }
            appliedPromotion = promoResult.appliedPromotion;
          } else {
            // New facture: no promotion, so new tariff equals old tariff.
            computedNewTarif = computedOldTarif;
            appliedPromotion = null;
          }
      
          // Fees remain the same.
          const addFragileFee = fragileFee;
          const addAdditionalFee = additionalFee;
          let computedTotalTarif = computedNewTarif + addFragileFee + addAdditionalFee;
          // If the colis already has a CRBT and its tariff_total is higher, retain that value.
          if (colis.crbt && colis.crbt.tarif_total >= computedTotalTarif) {
            computedTotalTarif = colis.crbt.tarif_total;
            computedNewTarif = computedOldTarif; // keep the old tariff if necessary
          }
          const montantAPayer = colis.prix - computedTotalTarif;
      
          // Accumulate values for target facture update.
          additionUpdate.$inc.totalPrix += colis.prix;
          additionUpdate.$inc.totalOldTarifLivraison += computedOldTarif;
          additionUpdate.$inc.totalNewTarifLivraison += computedNewTarif;
          additionUpdate.$inc.totalTarifFragile += addFragileFee;
          additionUpdate.$inc.totalTarifAjouter += addAdditionalFee;
          additionUpdate.$inc.totalTarif += computedTotalTarif;
      
          // **Do not update the colis’ CRBT field.** We only update the facture association.
          colis.facture = targetFacture._id;
          await colis.save();
      
          // Add the colis to the target facture’s array.
          await Facture.updateOne({ _id: targetFacture._id }, { $push: { colis: colis._id } });
        } // end for each colis
      
        // 7. Update the source and target facture totals.
        await Facture.updateOne({ _id: sourceFacture._id }, removalUpdate);
        await Facture.updateOne({ _id: targetFacture._id }, additionUpdate);
      
        // 8. Retrieve the updated target facture.
        const updatedTargetFacture = await Facture.findById(targetFacture._id)
          .populate('colis store')
          .lean();
      
        // Compute netAPayer as totalPrix minus totalTarif.
        updatedTargetFacture.netAPayer = updatedTargetFacture.totalPrix - updatedTargetFacture.totalTarif;
      
        res.status(200).json({
          message: 'Colis transferred successfully.',
          facture: updatedTargetFacture,
          promotion: updatedTargetFacture.promotion || null
        });
      });


      const getFactureClientByCode = async (req, res) => {
        try {
          const { code_facture } = req.params;
      
          // Validate that code_facture is provided
          if (!code_facture) {
            res.status(400);
            throw new Error('code_facture parameter is required');
          }
      
          // Find the facture of type "client" with the provided code_facture.
          // Populate the store (with additional fields) and the colis array with selected fields:
          // - For each colis, we populate: code_suivi, prix, statut, crbt, statu_final.
          // - Also, for each colis, we populate the ville field with tariff fields.
          const facture = await Facture.findOne({ code_facture, type: 'client' })
            .populate({
              path: 'store',
              select: 'storeName id_client adress phone',
              populate: { 
                path: 'id_client', 
                select: 'tele email' 
              },
            })
            .populate({
              path: 'colis',
              select: 'code_suivi prix statut crbt statu_final date_livraisant',
              populate: {
                path: 'ville',
                select: 'nom key ref tarif tarif_refus'
              },
            })
            .lean();
      
          if (!facture) {
            res.status(404);
            throw new Error('Facture not found');
          }
      
          // Initialize dynamic totals
          let totalPrix = 0; // Sum of prix for delivered colis only
          let totalTarifLivraison = 0; // Sum of delivery tariffs (from crbt.tarif_livraison) for delivered colis
          let totalTarifRefuse = 0; // Sum of refusal tariffs (from crbt.tarif_refuse) for refused colis
          let totalTarifFragile = 0; // Sum of fragile fees (from crbt.tarif_fragile)
          let totalTarifAjouter = 0; // Sum of additional tariffs (from crbt.tarif_supplementaire)
          let totalTarif = 0; // Overall tariff sum (different calculation for delivered vs. refused colis)
      
          // Iterate over each colis and accumulate totals based on CRBT values.
          if (Array.isArray(facture.colis)) {
            facture.colis.forEach(col => {
              if (col.statut === 'Livrée') {
                totalPrix += col.prix || 0;
                totalTarifLivraison += col.crbt ? (col.crbt.tarif_livraison || 0) : 0;
                totalTarifFragile += col.crbt ? (col.crbt.tarif_fragile || 0) : 0;
                totalTarifAjouter += col.crbt ? (col.crbt.tarif_supplementaire || 0) : 0;
                // For delivered colis, use stored total_tarif
                totalTarif += col.crbt ? (col.crbt.total_tarif || 0) : 0;
              } else if (['Refusée', 'En Retour', 'Fermée'].includes(col.statut)) {
                // For refused colis, we add the refusal tariff (plus any fragile and additional fees) even if total_tarif is 0.
                totalTarifRefuse += col.crbt ? (col.crbt.tarif_refuse || 0) : 0;
                // Also accumulate fragile and additional fees.
                totalTarifFragile += col.crbt ? (col.crbt.tarif_fragile || 0) : 0;
                totalTarifAjouter += col.crbt ? (col.crbt.tarif_supplementaire || 0) : 0;
                totalTarif += col.crbt
                  ? ((col.crbt.tarif_refuse || 0) + (col.crbt.tarif_fragile || 0) + (col.crbt.tarif_supplementaire || 0))
                  : 0;
              } else {
                // For any other status, default to using the stored total_tarif.
                totalTarif += col.crbt ? (col.crbt.total_tarif || 0) : 0;
              }
            });
          }
      
          // Calculate the net amount to be paid for the facture: only delivered colis contribute to totalPrix.
          const netAPayer = totalPrix - totalTarif;
      
          // Build the facture response by merging the dynamic totals with the facture data.
          const factureResponse = {
            ...facture,
            totalPrix,
            totalTarifLivraison,
            totalTarifRefuse,
            totalTarifFragile,
            totalTarifAjouter,
            totalTarif,
            netAPayer,
          };
      
          res.status(200).json({
            message: 'Facture details retrieved successfully',
            facture: factureResponse,
          });
        } catch (error) {
          console.error('Error fetching facture by code:', error);
          res.status(500).json({ message: 'Internal server error' });
        }
      };
      

      const getFactureClient = async (req, res) => {
        try {
            // Get store id and date range from query parameters
            const { store: storeId, startDate, endDate } = req.query;
    
            // Build the query filter. Always include type 'client' and optionally filter by store.
            const filter = { type: 'client' };
            if (storeId) {
                filter.store = storeId;
            }
    
            // Date filtering (optional)
            if (startDate && endDate) {
                filter.createdAt = {
                    $gte: new Date(startDate),  // Greater than or equal to start date
                    $lte: new Date(endDate),    // Less than or equal to end date
                };
            }
    
            // Find factures of type "client" (and optionally by store) and select only the necessary fields.
            const factures = await Facture.find(filter)
                .select('code_facture etat createdAt colis type')
                .populate({
                    path: 'colis',
                    select: 'crbt statu_final', // Only populate the crbt field for each colis
                })
                .populate({
                    path: 'store',
                    select: 'storeName tele solde', // Only populate store fields
                })
                .lean()
                .sort({ etat: 1, createdAt: -1 }); // Sort by 'etat = false' first and then by latest date
    
            // For each facture, compute the number of colis and the sum of prix_a_payant from each colis.
            const updatedFactures = factures.map(facture => {
                const colisCount = facture.colis ? facture.colis.length : 0;
                const totalPrixAPayant =
                    facture.colis && facture.colis.length > 0
                        ? facture.colis.reduce((acc, col) => {
                            // Ensure col.crbt exists and add its prix_a_payant (defaulting to 0 if missing)
                            return acc + (col.crbt ? (col.crbt.prix_a_payant || 0) : 0);
                        }, 0)
                        : 0;
                return {
                    ...facture,
                    colisCount,
                    totalPrixAPayant,
                };
            });
    
            res.status(200).json({
                message: 'Client factures retrieved successfully',
                factures: updatedFactures,
            });
        } catch (error) {
            console.error('Error fetching client factures:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
    
      
      
      
      
module.exports = {
    createFacturesForClientsAndLivreurs,
    getAllFacture ,
    getFactureByCode,
    setFacturePay,
    createOrUpdateFacture,
    getCodeFactureByColis,
    createOrUpdateFactureLivreur,
    mergeFactures,
    removeColisFromFacture,
    getFacturesGroupedByUser,
    getFacturesByUser,
    removeColisFromClientFacture,
    addColisToExistingClientFacture,
    getColisWithoutFactureForClient,
    transferColisBetweenFactures,
    getFactureClientByCode,
    getFactureClient
};
