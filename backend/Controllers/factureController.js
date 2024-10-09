const { Colis } = require('../Models/Colis');
const Facture = require('../Models/Facture');
const moment = require('moment');
const shortid = require('shortid');
const { Suivi_Colis } = require('../Models/Suivi_Colis');
const cron = require('node-cron');

// Function to generate code_facture
const generateCodeFacture = (date) => {
    const formattedDate = moment(date).format('YYYYMMDD');
    const randomNumber = shortid.generate().slice(0, 6).toUpperCase(); // Shorten and uppercase for readability
    return `FCT${formattedDate}-${randomNumber}`;
};

// Helper function to get `date_livraison` from `Suivi_Colis`
const getDeliveryDate = async (code_suivi) => {
    const suiviColis = await Suivi_Colis.findOne({ code_suivi }).lean();
    if (suiviColis) {
        const livraison = suiviColis.status_updates.find(status => status.status === 'Livrée');
        return livraison ? livraison.date : null; // Return the delivery date if found
    }
    return null;
};

// Controller to create factures for clients and livreurs based on daily delivered packages
const createFacturesForClientsAndLivreurs = async (req, res) => {
    try {
        // Get today's date
        const todayStart = moment().startOf('day').toDate();
        const todayEnd = moment().endOf('day').toDate();

        // Fetch all 'Livrée' colis with non-null store and livreur that were delivered today
        const colisList = await Colis.find({
            store: { $ne: null },
            livreur: { $ne: null },
            statut: 'Livrée'
        }).populate('store').populate('livreur');

        // Filter out the colis that were delivered today by checking `Suivi_Colis`
        const deliveredTodayColis = [];
        for (const colis of colisList) {
            const dateLivraison = await getDeliveryDate(colis.code_suivi);
            if (dateLivraison && moment(dateLivraison).isBetween(todayStart, todayEnd)) {
                // Check if this colis is already part of an existing facture
                const existingFacture = await Facture.findOne({ colis: colis._id });
                if (!existingFacture) {
                    deliveredTodayColis.push(colis); // Include only today's deliveries and not already in a facture
                }
            }
        }

        // If no deliveries happened today, send a message
        if (deliveredTodayColis.length === 0) {
            return res.status(200).json({ message: 'No factures to create for today.' });
        }

        // Group by store, livreur, and date
        const facturesMapClient = {};
        const facturesMapLivreur = {};

        deliveredTodayColis.forEach(colis => {
            const storeId = colis.store._id.toString();
            const livreurId = colis.livreur._id.toString();
            const dateKey = moment(colis.date_livraisant).format('YYYY-MM-DD'); // Group by day

            // Group for client factures
            if (!facturesMapClient[storeId]) {
                facturesMapClient[storeId] = {};
            }

            if (!facturesMapClient[storeId][dateKey]) {
                facturesMapClient[storeId][dateKey] = {
                    store: colis.store,
                    date: colis.date_livraisant,
                    colis: [],
                    totalPrix: 0,
                };
            }

            facturesMapClient[storeId][dateKey].colis.push(colis);
            facturesMapClient[storeId][dateKey].totalPrix += colis.prix;

            // Group for livreur factures
            if (!facturesMapLivreur[livreurId]) {
                facturesMapLivreur[livreurId] = {};
            }

            if (!facturesMapLivreur[livreurId][dateKey]) {
                facturesMapLivreur[livreurId][dateKey] = {
                    livreur: colis.livreur,
                    date: colis.date_livraisant,
                    colis: [],
                    totalPrix: 0,
                };
            }

            facturesMapLivreur[livreurId][dateKey].colis.push(colis);
            facturesMapLivreur[livreurId][dateKey].totalPrix += colis.prix;
        });

        // Prepare factures for clients
        const facturesToInsertClient = [];
        for (const storeId in facturesMapClient) {
            for (const dateKey in facturesMapClient[storeId]) {
                const factureData = facturesMapClient[storeId][dateKey];

                const newFacture = new Facture({
                    code_facture: generateCodeFacture(factureData.date),
                    type: 'client',
                    store: factureData.store._id,
                    date: factureData.date,
                    colis: factureData.colis.map(colis => colis._id),
                    totalPrix: factureData.totalPrix,
                });

                facturesToInsertClient.push(newFacture);
            }
        }

        // Prepare factures for livreurs
        const facturesToInsertLivreur = [];
        for (const livreurId in facturesMapLivreur) {
            for (const dateKey in facturesMapLivreur[livreurId]) {
                const factureData = facturesMapLivreur[livreurId][dateKey];

                const newFacture = new Facture({
                    code_facture: generateCodeFacture(factureData.date),
                    type: 'livreur',
                    livreur: factureData.livreur._id,
                    date: factureData.date,
                    colis: factureData.colis.map(colis => colis._id),
                    totalPrix: factureData.totalPrix,
                });

                facturesToInsertLivreur.push(newFacture);
            }
        }

        // Combine both types of factures
        const facturesToInsert = [...facturesToInsertClient, ...facturesToInsertLivreur];

        // Save all factures
        await Facture.insertMany(facturesToInsert);

        res.status(200).json({ message: 'Factures created successfully', factures: facturesToInsert });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Schedule a job to create factures every day at midnight
cron.schedule('30 1 * * *', async () => {
    console.log('Running daily facture generation at 02:07');
    await createFacturesForClientsAndLivreurs();
});



const getAllFacture = async (req, res) => {
    try {
        // Destructure query parameters with default values
        const { page = 1, limit = 10, type, date, storeId, livreurId, sortBy = 'date', order = 'desc' } = req.query;

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


const getFactureByCode = async (req, res) => {
    try {
        const { code_facture } = req.params;

        // Build the query object
        const query = { code_facture };

        // Find the facture by its code and type
        const facture = await Facture.findOne(query)
            .populate({
                path: 'store',
                select: 'storeName id_client',
                populate: {
                    path: 'id_client',  // Populate the client details from store
                    select: 'tele',  // Assuming 'tele' is the client's telephone field
                },
            })
            .populate({
                path: 'livreur',
                select: 'nom tele tarif',
            })
            .populate({
                path: 'colis',
                populate: [
                    { path: 'ville', select: 'nom key ref tarif' },  // Populate 'ville' details
                    { path: 'store', select: 'storeName' },  // Populate 'store' details within 'colis'
                ],
            })
            .lean();

        // If the facture does not exist, return a 404 error
        if (!facture) {
            return res.status(404).json({ message: 'Facture not found' });
        }

        // Function to fetch the delivery date for a given code_suivi
        const getDeliveryDate = async (code_suivi) => {
            const suiviColis = await Suivi_Colis.findOne({ code_suivi }).lean();
            if (suiviColis) {
                const livraison = suiviColis.status_updates.find(status => status.status === 'Livrée');
                return livraison ? livraison.date : null; // Return the delivery date if found
            }
            return null;
        };

        // Prepare the response data
        const response = {
            code_facture: facture.code_facture,
            date: facture.createdAt,
            type: facture.type,
            store: facture.store ? facture.store.storeName : null,
            client_tele: facture.store && facture.store.id_client ? facture.store.id_client.tele : null, // Get client telephone
            livreur: facture.livreur ? facture.livreur.nom : null,
            livreur_tele: facture.livreur ? facture.livreur.tele : null,
            livreur_tarif: facture.livreur ? facture.livreur.tarif : null,
            totalPrix: facture.totalPrix,
            date: facture.date,
            colis: await Promise.all(facture.colis.map(async col => {
                const livraisonDate = await getDeliveryDate(col.code_suivi); // Get delivery date from Suivi_Colis
                return {
                    code_suivi: col.code_suivi,
                    destinataire: col.nom,
                    telephone: col.tele,
                    ville: col.ville ? col.ville.nom : null,
                    adresse: col.adresse,
                    statu: col.statut,
                    prix: col.prix,
                    tarif: col.ville ? col.ville.tarif : null,
                    date_livraison: livraisonDate // Add the delivery date
                };
            }))
        };

        // Send the formatted response
        res.status(200).json({ message: 'Facture details retrieved successfully', list: response });
    } catch (error) {
        console.error('Error fetching facture by code:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = {
    createFacturesForClientsAndLivreurs,
    getAllFacture ,
    getFactureByCode
};
