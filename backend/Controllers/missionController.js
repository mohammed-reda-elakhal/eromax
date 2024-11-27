const DemandeRetrait = require('../Models/Demande_Retrait');
const { Reclamation } = require('../Models/Reclamation');
const { Colis } = require('../Models/Colis');
const Demande_Retrait = require('../Models/Demande_Retrait');

// Helper function to get today's date range
const getTodayDateRange = () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); // 00:00:00.000

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); // 23:59:59.999

    return { startOfDay, endOfDay };
};

const getDemandeRetraitToday = async (req, res) => {
    try {
        const { startOfDay, endOfDay } = getTodayDateRange();

        const demandes = await Demande_Retrait.find({
           createdAt: { $gte: startOfDay, $lte: endOfDay },
            verser: false, // Assuming `verser` is a boolean field
        });

        res.status(200).json(demandes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching withdrawal requests', error });
    }
};

const getReclamationToday = async (req, res) => {
    try {
        const { startOfDay, endOfDay } = getTodayDateRange();

        const reclamations = await Reclamation.find({
            createdAt: { $gte: startOfDay, $lte: endOfDay },
            resoudre: false, // Assuming `resoudre` is a boolean field
        });

        res.status(200).json(reclamations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reclamations', error });
    }
};

const getColisATRToday = async (req, res) => {
    try {
        const { startOfDay, endOfDay } = getTodayDateRange();

        const colis = await Colis.find({
            createdAt: { $gte: startOfDay, $lte: endOfDay },
            statut: 'attente de ramassage', // Assuming this is the correct status
        });

        res.status(200).json(colis);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching packages', error });
    }
};

module.exports = {
    getDemandeRetraitToday,
    getReclamationToday,
    getColisATRToday,
};
