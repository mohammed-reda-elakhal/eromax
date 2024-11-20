const { Colis } = require('../Models/Colis'); 
const Facture = require('../Models/Facture');
const moment = require('moment');
const asyncHandler = require('express-async-handler');
const shortid = require('shortid');
const { Suivi_Colis } = require('../Models/Suivi_Colis');
const { Store } = require('../Models/Store');
const cron = require('node-cron');
const Transaction = require('../Models/Transaction');
const NotificationUser = require('../Models/Notification_User');
const Promotion = require('../Models/Promotion'); // Import the Promotion model

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

                // Record the transaction
                const transaction = new Transaction({
                    id_store: store._id,
                    montant: montant,
                    type: 'credit', // Adding to the store's balance
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

                // Record the transaction for livreur
                const transactionLivreur = new Transaction({
                    id_livreur: livreur._id,
                    montant: montantLivreur,
                    type: 'credit', // Adding to the livreur's balance
                });
                await transactionLivreur.save();

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
        } else {
            console.log('Factures created successfully');
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
    console.log('Running daily facture generation at 17:54');
    await createFacturesForClientsAndLivreurs();
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

        // Check the current state of 'etat' and update if it is false
        if (facture.etat === false) {
            facture.etat = true; // Set etat of Facture to true
            await facture.save(); // Save the updated facture

            // Update etat of all related colis to true
            await Colis.updateMany(
                { _id: { $in: facture.colis } }, // Match all colis IDs in the facture
                { etat: true } // Set etat to true for each matching colis
            );

            return res.status(200).json({
                message: 'Facture etat updated to true and all related colis marked as paid',
                facture,
            });
        } else {
            // If etat is already true, return a message indicating no update was needed
            return res.status(200).json({
                message: 'Facture etat is already true, no update to colis needed',
                facture,
            });
        }
    } catch (error) {
        console.error('Error updating facture etat:', error);
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
                return livraison ? livraison.date : null; // Return the delivery date if found
            }
            return null;
        };

        // Prepare the response data for colis
        const colisDetails = await Promise.all(facture.colis.map(async col => {
            const livraisonDate = await getDeliveryDate(col.code_suivi, col.statut); // Get delivery date from Suivi_Colis

            // Initialize tarif_livraison and montant_a_payer based on statut
            let old_tarif_livraison = 0;
            let new_tarif_livraison = 0;
            let montant_a_payer = 0;

            if (col.statut === 'Livrée') {
                old_tarif_livraison = col.ville?.tarif || 0;
                montant_a_payer = col.prix; // montant_a_payer is the same as prix for 'Livrée' colis

                // Apply the stored promotion if available
                if (storedPromotion) {
                    if (storedPromotion.type === 'fixed_tarif') {
                        new_tarif_livraison = storedPromotion.value;
                    } else if (storedPromotion.type === 'percentage_discount') {
                        new_tarif_livraison = old_tarif_livraison * (1 - storedPromotion.value / 100);
                    }
                } else {
                    new_tarif_livraison = old_tarif_livraison; // No promotion applied
                }
            } else if (['Refusée', 'En Retour', 'Fermée'].includes(col.statut)) {
                old_tarif_livraison = col.ville?.tarif_refus || 0;
                montant_a_payer = 0; // montant_a_payer is 0 for these statuses

                new_tarif_livraison = old_tarif_livraison; // Do not apply promotion
            } else {
                // Handle any other statuses if necessary
                old_tarif_livraison = col.ville?.tarif || 0; // Default to regular tarif
                new_tarif_livraison = storedPromotion ? (
                    storedPromotion.type === 'fixed_tarif' ? 
                        storedPromotion.value : 
                        (old_tarif_livraison * (1 - storedPromotion.value / 100))
                ) : old_tarif_livraison;
                montant_a_payer = col.prix;
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
                old_tarif_livraison: old_tarif_livraison, // Original delivery fee
                new_tarif_livraison: new_tarif_livraison, // Delivery fee after promotion
                tarif_fragile: tarif_fragile,
                tarif_ajouter: tarif_ajouter, // Include tarif_ajouter
                tarif_total: tarif_total,
                montant_a_payer: montant_a_payer,
                date_livraison: livraisonDate,
                fragile: col.is_fragile,
            };
        }));

        // Calculate totals, including tarif_ajouter
        let totalPrix = 0;
        let totalOldTarifLivraison = 0;
        let totalNewTarifLivraison = 0;
        let totalTarifFragile = 0;
        let totalTarifAjouter = 0; // New total for tarif_ajouter
        let totalTarif = 0;
        let totalFraisRefus = 0;

        colisDetails.forEach(col => {
            if (col.statut === 'Livrée') {
                totalPrix += col.prix;
                totalOldTarifLivraison += col.old_tarif_livraison;
                totalNewTarifLivraison += col.new_tarif_livraison;
                totalTarifFragile += col.tarif_fragile;
                totalTarifAjouter += col.tarif_ajouter; // Sum tarif_ajouter
                totalTarif += col.tarif_total;
            } else{
                totalFraisRefus += col.old_tarif_livraison;
                totalOldTarifLivraison += col.old_tarif_livraison;
                totalNewTarifLivraison += col.new_tarif_livraison;
                totalTarifFragile += col.tarif_fragile;
                totalTarifAjouter += col.tarif_ajouter; // Sum tarif_ajouter
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
            totalOldTarifLivraison: totalOldTarifLivraison, // Total before promotion
            totalNewTarifLivraison: totalNewTarifLivraison, // Total after promotion
            totalTarifFragile: totalTarifFragile,
            totalTarifAjouter: totalTarifAjouter, // Total tarif_ajouter
            totalTarif: totalTarif,
            totalFraisRefus: totalFraisRefus,
            netAPayer: (totalPrix + totalTarifAjouter - totalTarif) - totalFraisRefus, // Adjusted net amount
            colis: colisDetails,
        };

        // Send the formatted response
        res.status(200).json({
            message: 'Facture details retrieved successfully',
            facture: factureResponse,
            promotion: storedPromotion, // Include the stored promotion details
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



module.exports = {
    createFacturesForClientsAndLivreurs,
    getAllFacture ,
    getFactureByCode,
    getFacturesByLivreur,
    getFacturesByStore,
    setFacturePay
};
