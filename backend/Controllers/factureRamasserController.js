
const cron = require('node-cron');
const { Suivi_Colis } = require('../Models/Suivi_Colis');
const FactureRamasser = require('../Models/FactureRamasser');
const moment = require('moment');
const { Colis } = require('../Models/Colis');
const shortid = require('shortid');
// controllers/factureController.js
const asyncHandler = require("express-async-handler");





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
const getAllRamasserFacture = asyncHandler(async (req, res) => {
    const { role, store: userStore } = req.user;
    let query = {};

    if (role === 'client') {
        if (!userStore) {
            return res.status(400).json({ message: "Store ID not found for client" });
        }
        query.id_store = userStore;
    }

    // Extract pagination parameters from query, set default values
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const factures = await FactureRamasser.find(query)
            .select('_id code_facture id_store createdAt id_colis')
            .populate({
                path: 'id_store',
                select: 'storeName tele'
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await FactureRamasser.countDocuments(query);

        if (!factures || factures.length === 0) {
            return res.status(404).json({ message: "No factures found" });
        }

        const customizedFactures = factures.map(facture => ({
            _id: facture._id,
            code_facture: facture.code_facture,
            count_colis: facture.id_colis.length,
            storeName: facture.id_store.storeName,
            tele: facture.id_store.tele,
            createdAt: facture.createdAt
        }));

        res.status(200).json({
            message: "Factures retrieved successfully",
            factures: customizedFactures,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error retrieving factures:", error);
        res.status(500).json({ message: error.message || "Error retrieving factures" });
    }
});

  

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

const getRamasserFactureByCode = asyncHandler(async (req, res) => {
    try {
      const { code_facture } = req.params;
  
      // Find the facture by its code and populate all data
      const facture = await FactureRamasser.findOne({ code_facture })
        .populate({
          path: 'id_store',
        })
        .populate({
          path: 'id_colis',
          populate: [
            { path: 'ville' }, // Populate all 'ville' details
            { path: 'store' }, // Populate all 'store' details within 'colis'
          ],
        })
        .lean(); // Convert to plain JavaScript object
  
      // If the facture does not exist, return a 404 error
      if (!facture) {
        return res.status(404).json({ message: 'Facture not found' });
      }
  
      // Function to fetch the ramassage date for a given code_suivi
      const getRamassageDate = async (code_suivi) => {
        const suiviColis = await Suivi_Colis.findOne({ code_suivi }).lean();
        if (suiviColis) {
          const ramassage = suiviColis.status_updates.find(
            (status) => status.status === 'Ramassée'
          );
          return ramassage ? ramassage.date : null; // Return the ramassage date if found
        }
        return null;
      };
  
      // For each colis, get the ramassage date and add it to the colis object
      await Promise.all(
        facture.id_colis.map(async (col) => {
          const ramassageDate = await getRamassageDate(col.code_suivi); // Get ramassage date from Suivi_Colis
          col.ram_date = ramassageDate; // Add the ramassage date
        })
      );
  
      // Send the formatted response
      res.status(200).json({
        message: 'Facture details retrieved successfully',
        facture,
      });
    } catch (error) {
      console.error('Error fetching facture by code:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
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
