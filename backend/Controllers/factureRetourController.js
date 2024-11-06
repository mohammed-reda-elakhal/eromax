// Controllers/FactureRetourController.js
const { Colis } = require('../Models/Colis'); 
const FactureRetour = require('../Models/FactureRetour');
const moment = require('moment');
const shortid = require('shortid');
const { Suivi_Colis } = require('../Models/Suivi_Colis');
const { Store } = require('../Models/Store');
const { Livreur } = require('../Models/Livreur');
const NotificationUser = require('../Models/Notification_User');

// Function to generate code_facture
const generateCodeFactureRetour = (date) => {
    const formattedDate = moment(date).format('YYYYMMDD');
    const randomNumber = shortid.generate().slice(0, 6).toUpperCase();
    return `FCRT${formattedDate}-${randomNumber}`;
};

// Helper function to get `date_livraison` from `Suivi_Colis`
const getDeliveryDate = async (code_suivi) => {
    const suiviColis = await Suivi_Colis.findOne({ code_suivi }).lean();
    if (suiviColis) {
        const livraison = suiviColis.status_updates.find(status => ['Livrée', 'Refusée', 'Annulée', 'Remplacée'].includes(status.status));
        return livraison ? livraison.date : null;
    }
    return null;
};

// Core function to generate FactureRetour
const generateFacturesRetour = async () => {
    console.log('Starting FactureRetour generation process.');

    // Define today's date range
    const todayStart = moment().startOf('day').toDate();
    const todayEnd = moment().endOf('day').toDate();

    // Fetch all colis with statuses Refusée, Annulée, Remplacée
    const colisList = await Colis.find({
        statut: { $in: ['Refusée', 'Annulée', 'Remplacée'] },
    }).populate('store').populate('livreur').populate('ville');

    console.log(`Total colis fetched: ${colisList.length}`);

    // Filter colis processed today and not already part of a FactureRetour
    const processedTodayColis = [];
    for (const colis of colisList) {
        const dateLivraison = await getDeliveryDate(colis.code_suivi);
        if (dateLivraison && moment(dateLivraison).isBetween(todayStart, todayEnd)) {
            // Check if this colis is already part of an existing FactureRetour
            const existingFactureRetour = await FactureRetour.findOne({ colis: colis._id });
            if (!existingFactureRetour) {
                processedTodayColis.push(colis);
            }
        }
    }

    console.log(`Colis processed today and not yet invoiced: ${processedTodayColis.length}`);

    if (processedTodayColis.length === 0) {
        console.log('No FactureRetour to create for today.');
        return [];
    }

    // Separate colis for clients (stores) and livreurs
    const colisForClients = processedTodayColis.filter(colis => colis.store);
    const colisForLivreurs = processedTodayColis.filter(colis => colis.livreur);

    console.log(`Colis for clients (stores): ${colisForClients.length}`);
    console.log(`Colis for livreurs: ${colisForLivreurs.length}`);

    // Group colis by store for client factures
    const facturesRetourMapClients = {};
    colisForClients.forEach(colis => {
        const storeId = colis.store._id.toString();
        if (!facturesRetourMapClients[storeId]) {
            facturesRetourMapClients[storeId] = {
                store: colis.store,
                date: colis.date_livraison,
                colis: [],
            };
        }
        facturesRetourMapClients[storeId].colis.push(colis._id);
    });

    // Group colis by livreur for livreur factures
    const facturesRetourMapLivreurs = {};
    colisForLivreurs.forEach(colis => {
        const livreurId = colis.livreur._id.toString();
        if (!facturesRetourMapLivreurs[livreurId]) {
            facturesRetourMapLivreurs[livreurId] = {
                livreur: colis.livreur,
                date: colis.date_livraison,
                colis: [],
            };
        }
        facturesRetourMapLivreurs[livreurId].colis.push(colis._id);
    });

    console.log(`Unique stores: ${Object.keys(facturesRetourMapClients).length}`);
    console.log(`Unique livreurs: ${Object.keys(facturesRetourMapLivreurs).length}`);

    const facturesRetourToInsert = [];

    // Create FactureRetour for Clients (Stores)
    for (const storeId in facturesRetourMapClients) {
        const factureData = facturesRetourMapClients[storeId];
        const newFactureRetour = new FactureRetour({
            code_facture: generateCodeFactureRetour(factureData.date),
            type: 'client',
            store: factureData.store._id,
            colis: factureData.colis,
            etat: false, // Open by default
        });
        facturesRetourToInsert.push(newFactureRetour);

        // Send notification to store
        try {
            const notificationClient = new NotificationUser({
                id_store: factureData.store._id,
                title: `Nouvelle Facture Retour: ${newFactureRetour.code_facture}`,
                description: `Une nouvelle facture de retour a été générée pour vos colis retournés.`,
            });
            await notificationClient.save();
            console.log(`Notification sent to store: ${factureData.store._id}`);
        } catch (notifError) {
            console.error(`Error sending notification to store ${factureData.store._id}:`, notifError);
        }
    }

    // Create FactureRetour for Livreurs
    for (const livreurId in facturesRetourMapLivreurs) {
        const factureData = facturesRetourMapLivreurs[livreurId];
        const newFactureRetour = new FactureRetour({
            code_facture: generateCodeFactureRetour(factureData.date),
            type: 'livreur',
            livreur: factureData.livreur._id,
            colis: factureData.colis,
            etat: false, // Open by default
        });
        facturesRetourToInsert.push(newFactureRetour);

        // Send notification to livreur
        try {
            const notificationLivreur = new NotificationUser({
                id_store: null, // Not associated with a store
                id_livreur: factureData.livreur._id,
                title: `Nouvelle Facture Retour: ${newFactureRetour.code_facture}`,
                description: `Une nouvelle facture de retour a été générée pour vos colis retournés.`,
            });
            await notificationLivreur.save();
            console.log(`Notification sent to livreur: ${factureData.livreur._id}`);
        } catch (notifError) {
            console.error(`Error sending notification to livreur ${factureData.livreur._id}:`, notifError);
        }
    }

    try {
        // Save all FactureRetour records
        await FactureRetour.insertMany(facturesRetourToInsert, { ordered: false });
        console.log(`Generated ${facturesRetourToInsert.length} FactureRetour records for ${moment().format('YYYY-MM-DD')}.`);
    } catch (error) {
        if (error.name === 'BulkWriteError') {
            console.error('Some FactureRetour records could not be created due to duplicates:', error.writeErrors);
        } else {
            throw error; // Re-throw if it's a different error
        }
    }

    console.log('FactureRetour generation process completed.');
    return facturesRetourToInsert;
};

// Controller function
const createFacturesRetourController = async (req, res) => {
    try {
        const facturesRetour = await generateFacturesRetour();
        res.status(200).json({ message: 'FactureRetour created successfully', facturesRetour });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Controller function to get all FactureRetour with role-based filtering
const getFacturesRetourController = async (req, res) => {
    try {
        // Destructure role from the authenticated user
        const { role } = req.user;

        // Initialize query object
        let query = {};

        // Apply role-based query filtering
        if (role === 'admin') {
            const { type } = req.query; // Assuming 'type' is sent as a query parameter
            if (type && ['client', 'livreur'].includes(type)) {
                query.type = type;
            }
        } else if (role === 'client') {
            const { store } = req.user; 
            if (!store) {
                return res.status(400).json({ message: 'Store information is missing for the client.' });
            }
            query.store = store;
        } else if (role === 'livreur') {
            const livreurId = req.user.id; 
            if (!livreurId) {
                return res.status(400).json({ message: 'Livreur ID is missing.' });
            }
            query.livreur = livreurId;
        } else {
            return res.status(403).json({ message: 'Access denied. Unknown role.' });
        }

        // Fetch and structure the factures
        const facturesRetour = await FactureRetour.find(query)
            .populate('store') 
            .populate('livreur') 
            .populate('colis', 'code_suivi status') 
            .sort({ createdAt: -1 }) 

        // Map the data to match the requested structure
        const formattedFactures = facturesRetour.map(facture => ({
            code_facture: facture.code_facture,
            type: facture.type,
            store: facture.store,
            livreur: facture.livreur,
            date_created: facture.createdAt,
            colis_count: facture.colis.length 
        }));

        // Send response
        res.status(200).json({
            success: true,
            count: formattedFactures.length,
            data: formattedFactures
        });
    } catch (error) {
        console.error('Error fetching FactureRetour:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};


// Controller function to get FactureRetour details by code_facture
const getFactureRetourByCodeFacture = async (req, res) => {
    try {
        const { code_facture } = req.params;

        // Find the FactureRetour by its code_facture
        const facture = await FactureRetour.findOne({ code_facture })
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
            return res.status(404).json({ message: 'FactureRetour not found' });
        }

        // Helper function to get delivery date from Suivi_Colis
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

            // Calculate tarifs and amounts based on status
            let tarif_livraison = 0;
            let montant_a_payer = 0;
            if (col.statut === 'Livrée') {
                tarif_livraison = col.ville?.tarif || 0;
                montant_a_payer = col.prix;
            } else if (col.statut === 'Refusée') {
                tarif_livraison = col.ville?.tarif_refus || 0;
                montant_a_payer = 0;
            }

            const tarif_fragile = col.is_fragile ? 5 : 0;
            const tarif_total = tarif_livraison + tarif_fragile;

            return {
                code_suivi: col.code_suivi,
                destinataire: col.nom,
                telephone: col.tele,
                ville: col.ville ? col.ville.nom : null,
                adresse: col.adresse,
                statut: col.statut,
                prix: col.prix,
                tarif_livraison: tarif_livraison,
                tarif_fragile: tarif_fragile,
                tarif_total: tarif_total,
                montant_a_payer: montant_a_payer,
                date_livraison: livraisonDate,
                fragile: col.is_fragile,
            };
        }));


        // Prepare final response
        const response = {
            code_facture: facture.code_facture,
            etat: facture.etat,
            date_facture: facture.createdAt,
            type: facture.type,
            store: facture.store ? facture.store.storeName : null,
            client_tele: facture.store && facture.store.id_client ? facture.store.id_client.tele : null,
            livreur: facture.livreur.length > 0 ? facture.livreur[0].nom : null,
            livreur_tele: facture.livreur.length > 0 ? facture.livreur[0].tele : null,
            livreur_tarif: facture.livreur.length > 0 ? facture.livreur[0].tarif : null,
            colis: colisDetails,
        };

        // Send the response
        res.status(200).json({ message: 'FactureRetour details retrieved successfully', facture: response });
    } catch (error) {
        console.error('Error fetching FactureRetour by code:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Export the functions
module.exports = {
    createFacturesRetourController,
    generateFacturesRetour  ,// Exported for cron usage 
    getFacturesRetourController ,
    getFactureRetourByCodeFacture
};
