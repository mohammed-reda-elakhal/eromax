const Meth_Payement = require('../Models/Meth_Payement');
const Payement = require('../Models/Payement');
const asyncHandler= require("express-async-handler");
const mongoose = require('mongoose');


// Create a new payment
const createPayement = async (req, res) => {
    try {
        const { clientId, idBank, nom, rib } = req.body;

        // Vérifier si le Meth_Payement sélectionné existe
        const methPayement = await Meth_Payement.findById(idBank);

        if (!methPayement) {
            return res.status(404).json({ message: 'Méthode de paiement sélectionnée introuvable.' });
        }

        // Vérifier s'il existe déjà des paiements pour ce client
        const existingPayements = await Payement.countDocuments({ clientId });

        // Créer un nouveau paiement
        const newPayement = new Payement({
            clientId,
            idBank,
            nom,
            rib,
            default: existingPayements === 0 // Si aucun paiement, celui-ci est le premier et devient le par défaut
        });

        // Enregistrer le paiement dans la base de données
        const savedPayement = await newPayement.save();

        // Répondre avec succès
        res.status(201).json({
            message: 'Paiement créé avec succès.',
            data: savedPayement,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const setDefaultPayement = async (req, res) => {
    try {
        const { clientId, payementId } = req.body;

        // Vérifier si le paiement appartient à l'utilisateur
        const payement = await Payement.findOne({ _id: payementId, clientId });

        if (!payement) {
            return res.status(404).json({ message: 'Méthode de paiement introuvable ou non autorisée.' });
        }

        // Réinitialiser le champ default pour tous les paiements de l'utilisateur
        await Payement.updateMany(
            { clientId },
            { $set: { default: false } }
        );

        // Définir le paiement sélectionné comme par défaut
        payement.default = true;
        await payement.save();

        res.status(200).json({
            message: 'La méthode de paiement par défaut a été mise à jour avec succès.',
            payement,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur lors de la mise à jour du paiement par défaut.',
            error: error.message,
        });
    }
};


// Get all payments
const getAllPayements =asyncHandler(async (req, res) => {
    try {
        const payements = await Payement.find().populate('clientId idBank').sort({ createdAt: -1 });
        res.status(200).json(payements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a payment by ID
const getPayementById =asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const payement = await Payement.findById(id).populate('clientTd idBank');

        if (!payement) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        res.status(200).json(payement);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const getPaymentsByClientId = async (req, res) => {
    try {
        // Extract client ID from request parameters
        const clientId = req.params.clientId;

        // Validate the ObjectId format
        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ message: `Invalid client ID format: ${clientId}` });
        }

        // Find payments associated with the given client ID
        const payments = await Payement.find({ clientId: clientId }).populate('clientId').populate('idBank').sort({ createdAt: -1 });

        // Check if any payments were found
        if (!payments.length) {
            return res.status(200).json({ message: 'No payments found for this client' });
        }

        // Send the found payments as response
        res.status(200).json(payments);
    } catch (error) {
        // Handle and return errors
        res.status(500).json({ error: error.message });
    }
};
// Update a payment
const updatePayement = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const updatedPayement = await Payement.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

        if (!updatedPayement) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        res.status(200).json(updatedPayement);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a payment
const deletePayement =asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const deletedPayement = await Payement.findByIdAndDelete(id);

        if (!deletedPayement) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        res.status(200).json({ message: 'Payment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports={
    createPayement,
    getAllPayements,
    getPayementById,
    deletePayement,
    updatePayement,
    getPaymentsByClientId,
    setDefaultPayement
    
}