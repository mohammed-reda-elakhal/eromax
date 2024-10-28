
const cron = require('node-cron');
const { Suivi_Colis } = require('../Models/Suivi_Colis');
const FactureRamasser = require('../Models/FactureRamasser');
const moment = require('moment');
const { Colis } = require('../Models/Colis');
const shortid = require('shortid');




//--------------------Helper Function 
cron.schedule('45 21 * * *', async () => {
    console.log('Running daily facture generation at 00:02');
    await createRamasserFacturesForClient();
});
const generateCodeFacture = (date) => {
    const formattedDate = moment(date).format('YYYYMMDD');
    const randomNumber = shortid.generate().slice(0, 6).toUpperCase(); // Shorten and uppercase for readability
    return `RFCT${formattedDate}-${randomNumber}`;
};

const getRamassageDate = async (code_suivi) => {
    const suiviColis = await Suivi_Colis.findOne({ code_suivi }).lean();
    if (suiviColis) {
        const ramassage = suiviColis.status_updates.find(status => status.status === 'Ramassée');
        return ramassage ? ramassage.date : null; // Return the delivery date if found
    }
    return null;
};

//----------------------

const getAllRamasserFacture = async (req, res) => {
    try {
        // Destructure query parameters with default values
        const { page = 1, limit = 50, type, date, storeId, sortBy = 'date', order = 'desc' } = req.query;

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


        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = order === 'asc' ? 1 : -1;

        // Query the database
        const factures = await FactureRamasser.find(filter)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate({
                path: 'id_store',
                select: 'storeName id_client'
            })
            .populate({
                path: 'id_colis',
                populate: [
                    { path: 'ville', select: 'nom key ref tarif' },
                    { path: 'store', select: 'storeName' },
                ]
            })
            .sort(sortOptions)
            .sort({ createdAt: -1 })
            .lean();

        // Count total documents matching the filter
        const total = await FactureRamasser.countDocuments(filter);

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

const getRamasserFacturesByStore = async (req, res) => {
    try {
        // Destructure query parameters with default values
        const { page = 1, limit = 50, date, sortBy = 'date', order = 'desc' } = req.query;
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
    

        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = order === 'asc' ? 1 : -1;

        // Query the database for factures based on storeId
        const factures = await FactureRamasser.find(filter)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate({
                path: 'id_store',
                select: 'storeName id_client'  // Populate store name and client
            })
            .populate({
                path: 'id_colis',
                populate: [
                    { path: 'ville', select: 'nom key ref tarif' },  // Populate ville details
                    { path: 'store', select: 'storeName' }  // Populate store details within colis
                ]
            })
            .sort(sortOptions)
            .sort({ createdAt: -1 })  // Secondary sort by creation date (most recent first)
            .lean();

        // Count total documents matching the filter
        const total = await FactureRamasser.countDocuments(filter);

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


const getRamasserFactureByCode = async (req, res) => {
    try {
        const { code_facture } = req.params;

        // Build the query object
        const query = { code_facture };

        // Find the facture by its code and type
        const facture = await FactureRamasser.findOne(query)
            .populate({
                path: 'id_store',
                select: 'storeName id_client',
                populate: {
                    path: 'id_client',  // Populate the client details from store
                    select: 'tele',  // Assuming 'tele' is the client's telephone field
                },
            })
            .populate({
                path: 'id_colis',
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
        const getRamassageDate = async (code_suivi) => {
            const suiviColis = await Suivi_Colis.findOne({ code_suivi }).lean();
            if (suiviColis) {
                const ramassage = suiviColis.status_updates.find(status => status.status === 'Ramassée');
                return ramassage ? ramassage.date : null; // Return the delivery date if found
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
            totalPrix: facture.totalPrix,
            date: facture.date,
            colis: await Promise.all(facture.id_colis.map(async col => {
                const ramassageDate = await getRamassageDate(col.code_suivi); // Get delivery date from Suivi_Colis
                return {
                    code_suivi: col.code_suivi,
                    destinataire: col.nom,
                    telephone: col.tele,
                    ville: col.ville ? col.ville.nom : null,
                    adresse: col.adresse,
                    statu: col.statut,
                    prix: col.prix,
                    tarif: col.ville ? col.ville.tarif : null,
                    ram_date: ramassageDate // Add the delivery date
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

const createRamasserFacturesForClient = async (req, res) => {
    try {
        const todayStart = moment().startOf('day').toDate();
        const todayEnd = moment().endOf('day').toDate();

        const colisList = await Colis.find({
            store: { $ne: null },
            statut: 'Ramassée'
        }).populate('store').populate('ville');
        console.log('Colis R',colisList)

        const RamasseTodayColis = [];
        for (const colis of colisList) {
            if (!colis.code_suivi) continue; // Skip if no code_suivi
            const dateRamassage = await getRamassageDate(colis.code_suivi);
            if (dateRamassage && moment(dateRamassage).isBetween(todayStart, todayEnd)) {
                const existingFacture = await FactureRamasser.findOne({ id_colis: colis._id });
                if (!existingFacture) {
                    RamasseTodayColis.push(colis);
                }
            }
        }

        const facturesRamasseMapClient = {};
        RamasseTodayColis.forEach(colis => {
            const storeId = colis.store._id.toString();
            const dateKey = moment(colis.dateRamassage).format('YYYY-MM-DD');

            if (!facturesRamasseMapClient[storeId]) {
                facturesRamasseMapClient[storeId] = {};
            }

            if (!facturesRamasseMapClient[storeId][dateKey]) {
                facturesRamasseMapClient[storeId][dateKey] = {
                    store: colis.store,
                    date: colis.date_livraisant,
                    colis: [],
                    totalPrix: 0,
                    totalTarif: 0,
                };
            }

            facturesRamasseMapClient[storeId][dateKey].colis.push(colis);
            facturesRamasseMapClient[storeId][dateKey].totalPrix += colis.prix;
            facturesRamasseMapClient[storeId][dateKey].totalTarif += colis.ville?.tarif || 0;  // Use optional chaining here
        });

        const facturesToInsertClient = [];
        for (const storeId in facturesRamasseMapClient) {
            for (const dateKey in facturesRamasseMapClient[storeId]) {
                const factureRamasseData = facturesRamasseMapClient[storeId][dateKey];
                const newFacture = new FactureRamasser({
                    code_facture: generateCodeFacture(factureRamasseData.date),
                    id_store: factureRamasseData.store._id,
                    date: factureRamasseData.date,
                    id_colis: factureRamasseData.colis.map(colis => colis._id),
                    totalPrix: factureRamasseData.totalPrix,
                });

                facturesToInsertClient.push(newFacture);

                const result = factureRamasseData.totalPrix - factureRamasseData.totalTarif;
                console.log("Result after tariff deduction:", result);
            }
        }

        await FactureRamasser.insertMany(facturesToInsertClient);

        res.status(200).json({ message: 'Factures created successfully', factures: facturesToInsertClient });
    } catch (error) {
        console.error("An error occurred:", error);

    }
};




module.exports={
    createRamasserFacturesForClient,
    getAllRamasserFacture,
    getRamasserFactureByCode,
    getRamasserFacturesByStore
}
