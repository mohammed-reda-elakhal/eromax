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



const getAllFacture = async (req, res) => {
    try {
        // Extract 'type' from route parameters
        const { type } = req.query;

        // Destructure user data from token
        const { role, store: storeId, id: userId } = req.user;

        // Initialize filter with 'type' if provided
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
                // No additional filters
                break;

            default:
                return res.status(403).json({ message: 'Access denied: Unknown role' });
        }

        // Query the database with the constructed filter
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
                    { path: 'ville', select: 'nom key ref tarif' },
                    { path: 'store', select: 'storeName' },
                ]
            })
            .sort({ updatedAt: -1 }) // Sort by updatedAt in descending order
            .lean();

        // Optionally, you can include pagination here

        // Send response with the selected factures
        res.status(200).json({
            message: 'Factures retrieved successfully',
            factures,
        });

    } catch (error) {
        console.error("Error fetching factures:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

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
                select: 'nom tele',
            })
            .populate({
                path: 'colis',
                populate: [
                    { path: 'ville', select: 'nom key ref tarif tarif_refus' },
                    { path: 'store', select: 'storeName' },
                    { path: 'livreur', select: 'nom tele' }, // Ensure 'livreur' is populated within colis
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

            // Initialize variables
            let montant_a_payer = 0;
            let tarif_livraison = 0;
            let old_tarif_livraison = 0;
            let tarif_fragile = 0; // Initialize to 0 for livreur
            let tarif_ajouter = 0; // Initialize to 0 for livreur
            let tarif_total = 0;
            let remarque = ''; // Initialize remarque

            if (facture.type === 'client') {
                // **Client Facture Calculations**

                if (col.statut === 'Livrée') {
                    old_tarif_livraison = col.ville?.tarif || 0;

                    // Apply the stored promotion if available
                    if (storedPromotion) {
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
                    tarif_livraison = storedPromotion ? (
                        storedPromotion.type === 'fixed_tarif' ? 
                            storedPromotion.value : 
                            (old_tarif_livraison * (1 - storedPromotion.value / 100))
                    ) : old_tarif_livraison;
                }

                // Ensure tarif_livraison does not exceed old_tarif_livraison
                if (tarif_livraison > old_tarif_livraison) {
                    tarif_livraison = old_tarif_livraison;
                }

                if (col.pret_payant) {
                    // If pret_payant is true, set both old and new tarif_livraison to 0
                    old_tarif_livraison = 0;
                    tarif_livraison = 0;
                }

                // Extract tarif_ajouter from colis
                if (col.tarif_ajouter && typeof col.tarif_ajouter.value === 'number') {
                    tarif_ajouter = col.tarif_ajouter.value;
                }

                // Calculate tarif_fragile if applicable
                if (col.is_fragile) {
                    tarif_fragile = 5; // Example value, adjust as needed
                }

                // Calculate total tarif for this colis
                if (['Refusée', 'En Retour', 'Fermée'].includes(col.statut)) {
                    // Exclude tarif_livraison for these statuses
                    tarif_total = tarif_fragile + tarif_ajouter;
                    montant_a_payer = 0; // Set to 0 for refusée colis
                } else {
                    tarif_total = tarif_livraison + tarif_fragile + tarif_ajouter;
                    montant_a_payer = col.prix - tarif_total; // Correct calculation
                }
            } else if (facture.type === 'livreur') {
                // **Livreur Facture Calculations**

                if (col.statut === 'Livrée') {
                    // Fetch TarifLivreur based on livreur and ville
                    const tarifLivreur = await TarifLivreur.findOne({
                        id_livreur: col.livreur._id,
                        id_ville: col.ville._id
                    }).lean();

                    if (!tarifLivreur) {
                        throw new Error(`TarifLivreur not found for livreur ${col.livreur._id} and ville ${col.ville._id}`);
                    }

                    old_tarif_livraison = tarifLivreur.tarif || 0;
                    tarif_livraison = old_tarif_livraison;
                    montant_a_payer = col.prix - tarif_livraison;

                    // Ensure montant_a_payer is not negative
                    if (montant_a_payer < 0) montant_a_payer = 0;
                } else if (['Refusée', 'Annulée'].includes(col.statut)) {
                    // For refusée or annulée, tarif livreur is 0
                    old_tarif_livraison = 0;
                    tarif_livraison = 0;
                    montant_a_payer = 0; // Set to 0 instead of col.prix

                    remarque = 'Colis refusée'; // Add a remarque
                } else {
                    // For other statuses, default handling
                    old_tarif_livraison = 0;
                    tarif_livraison = 0;
                    montant_a_payer = 0; // Assuming no payment for other statuses
                }

                if (col.pret_payant) {
                    // If pret_payant is true, set montant_a_payer to 0
                    montant_a_payer = 0;
                    tarif_livraison = 0;
                }

                // For 'livreur' factures, set tarif_fragile and tarif_ajouter to 0
                tarif_fragile = 0;
                tarif_ajouter = 0;

                // Calculate total tarif for this colis
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
                old_tarif_livraison: old_tarif_livraison,
                new_tarif_livraison: tarif_livraison,
                tarif_fragile: tarif_fragile,
                tarif_ajouter: tarif_ajouter,
                tarif_total: tarif_total,
                montant_a_payer: montant_a_payer,
                date_livraison: livraisonDate,
                remarque: remarque, // Include remarque if any
                fragile: col.is_fragile,
                pret_payant: col.pret_payant, // Include pret_payant in the response
            };
        }));

        // Calculate totals
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
                    // For 'Refusée', 'En Retour', 'Fermée'
                    totalFraisRefus += col.old_tarif_livraison; // ville.tarif_refus
                    totalOldTarifLivraison += col.old_tarif_livraison;
                    totalNewTarifLivraison += col.new_tarif_livraison;
                    totalTarifFragile += col.tarif_fragile;
                    totalTarifAjouter += col.tarif_ajouter;
                    totalTarif += col.tarif_total; // Only tarif_fragile + tarif_ajouter
                }
            } else if (facture.type === 'livreur') {
                    totalPrix += col.montant_a_payer;
                    totalOldTarifLivraison += col.old_tarif_livraison;
                    totalNewTarifLivraison += col.new_tarif_livraison;
                    totalTarifFragile += col.tarif_fragile; // Should be 0
                    totalTarifAjouter += col.tarif_ajouter; // Should be 0
                    totalTarif += col.tarif_total;
            }
        });

        // Prepare the facture response
        const factureResponse = {
            code_facture: facture.code_facture,
            etat: facture.etat,
            date_facture: facture.createdAt,
            type: facture.type,
            store: facture.store ? facture.store.storeName : null,
            client_tele: facture.store && facture.store.id_client ? facture.store.id_client.tele : null,
            livreur: facture.livreur ? facture.livreur.nom : null,
            livreur_tele: facture.livreur ? facture.livreur.tele : null,
            // livreur_tarif is calculated per colis, not stored directly in the facture
            totalPrix: totalPrix,
            totalOldTarifLivraison: totalOldTarifLivraison,
            totalNewTarifLivraison: totalNewTarifLivraison,
            totalTarifFragile: totalTarifFragile,
            totalTarifAjouter: totalTarifAjouter,
            totalTarif: totalTarif,
            totalFraisRefus: totalFraisRefus,
            netAPayer: facture.type === 'client' 
                ? (totalPrix + totalTarifAjouter - totalTarif) - totalFraisRefus
                : totalPrix, // For 'livreur', netAPayer is totalPrix
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
    getFacturesByUser
};
