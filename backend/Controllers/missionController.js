const DemandeRetrait = require('../Models/Demande_Retrait');
const { Reclamation } = require('../Models/Reclamation');
const { Colis } = require('../Models/Colis');
const { Client } = require('../Models/Client');
const { Withdrawal } = require('../Models/Withdrawal');
const { Wallet } = require('../Models/Wallet');

// Get all Demande Retrait without date condition
const getDemandeRetraitToday = async (req, res) => {
    try {
        const demandes = await DemandeRetrait.find({
            verser: false, // Assuming `verser` is a boolean field
        });

        res.status(200).json(demandes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching withdrawal requests', error });
    }
};
const getNouveauClient = async (req, res) => {
    try {
        // Fetch clients where verify is false
        const newClients = await Client.find({ verify: false });

        res.status(200).json(newClients);
    } catch (error) {
        console.error("Error fetching new clients:", error);
        res.status(500).json({ message: 'Error fetching new clients', error: error.message });
    }
};


// Get count of open reclamations (where closed = false)
const getReclamationToday = async (req, res) => {
    try {
        // Count reclamations where closed is false
        const openReclamationsCount = await Reclamation.countDocuments({
            closed: false
        });

        // Return the count
        res.status(200).json({
            message: "Open reclamations count retrieved successfully",
            count: openReclamationsCount
        });
    } catch (error) {
        console.error("Error fetching open reclamations count:", error);
        res.status(500).json({ message: 'Error fetching open reclamations count', error: error.message });
    }
};

// Get all Colis without date condition
const getColisATRToday = async (req, res) => {
    try {
        const colis = await Colis.find({
            statut: 'attente de ramassage', // Assuming this is the correct status
            expedation_type : 'eromax'
        });

        res.status(200).json(colis);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching packages', error });
    }
};

// Get all Colis without date condition
const getColisR = async (req, res) => {
    try {
        const colis = await Colis.find({
            statut: 'Ramassée', // Assuming this is the correct status
            expedation_type : 'eromax'
        });

        res.status(200).json(colis);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching packages', error });
    }
};

// Get all Colis with statut 'Nouveau Colis' and expedation_type 'eromax'
const getColisNouveau = async (req, res) => {
    try {
        const colis = await Colis.find({
            statut: 'Nouveau Colis',
            expedation_type: 'eromax'
        });
        res.status(200).json(colis);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching new packages', error });
    }
};


// Controller to count Colis for a specific Livreur where statut is 'Expediée'
const countExpedieColisForLivreur = async (req, res) => {
    try {
        const livreurId = req.user.id;  // Assuming the livreur's id is in req.user.id
        const statut = "Expediée";  // The required status

        // Find the colis count based on livreur and statut
        const colisCount = await Colis.countDocuments({
            livreur: livreurId,
            statut: statut
        });

        // Send response with the count
        res.status(200).json(colisCount );
    } catch (error) {
        res.status(500).json({ message: 'Error counting colis', error });
    }
};


// Controller to count Colis for a specific Livreur where statut is in the "pret to livrée" statuses
const countPretToLivreeColisForLivreur = async (req, res) => {
    try {
        const livreurId = req.user.id;  // Assuming the livreur's id is in req.user.id

        // The list of statuses that represent "pret to livrée"
        const readyToDeliverStatuses = [
            "Mise en Distribution",
            "Programmée",
            "Boite vocale",
            "Pas de reponse jour 1",
            "Pas de reponse jour 2",
            "Pas de reponse jour 3",
            "Pas reponse + sms / + whatsap",
            "En voyage",
            "Injoignable",
            "Hors-zone",
            "Intéressé",
            "Numéro Incorrect",
            "Reporté",
            "Confirmé Par Livreur",
            "Endomagé"
        ];

        // Find the count of colis with livreur ID and matching any of the statuses in readyToDeliverStatuses
        const colisCount = await Colis.countDocuments({
            livreur: livreurId,
            statut: { $in: readyToDeliverStatuses }
        });

        // Send response with the count
        res.status(200).json(colisCount);
    } catch (error) {
        res.status(500).json({ message: 'Error counting colis', error });
    }
};

// Add this new controller function
const getIncompleteWithdrawalsCount = async (req, res) => {
    try {
        // Count withdrawals that are not complete (not 'done' or 'rejected')
        const incompleteCount = await Withdrawal.countDocuments({
            status: {
                $nin: ['done', 'rejected']
            }
        });

        return res.status(200).json({
            message: "Incomplete withdrawals count retrieved successfully",
            count: incompleteCount
        });

    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({ message: "Server error while counting incomplete withdrawals." });
    }
};

module.exports = {
    getDemandeRetraitToday,
    getReclamationToday,
    getColisATRToday,
    countExpedieColisForLivreur,
    countPretToLivreeColisForLivreur,
    getNouveauClient,
    getColisR,
    getIncompleteWithdrawalsCount,
    getColisNouveau
};
