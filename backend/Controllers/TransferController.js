const { Transfer, validateTransfer } = require('../Models/Transfer');
const { Wallet } = require('../Models/Wallet');
const { Colis } = require('../Models/Colis');
const mongoose = require('mongoose');

// Create new transfer
const createTransfer = async (req, res) => {
    try {
        // Validate request body
        const { error } = validateTransfer(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Create new transfer
        const transfer = new Transfer(req.body);
        await transfer.save();

        // Return created transfer
        res.status(201).json({
            message: "Transfer created successfully",
            transfer: await Transfer.findById(transfer._id)
                .populate('colis')
                .populate('wallet')
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all transfers
const getAllTransfers = async (req, res) => {
    try {
        const { 
            storeName, 
            transferStatus, 
            colisStatus, 
            walletKey,
            startDate,
            endDate
        } = req.query;

        let query = {};
        let transfers;

        // If user is admin, get all transfers with filters
        if (req.user.role === 'admin') {
            // Build the query based on search parameters
            if (transferStatus) {
                query.status = transferStatus;
            }

            transfers = await Transfer.find(query)
                .populate('colis')
                .populate({
                    path: 'wallet',
                    populate: {
                        path: 'store',
                        select: 'storeName'
                    }
                })
                .sort({ createdAt: -1 });

            // Apply additional filters after population
            transfers = transfers.filter(transfer => {
                let match = true;

                // Filter by store name
                if (storeName && transfer.wallet?.store?.storeName) {
                    match = match && transfer.wallet.store.storeName
                        .toLowerCase()
                        .includes(storeName.toLowerCase());
                }

                // Filter by colis status
                if (colisStatus && transfer.colis?.statu_final) {
                    match = match && transfer.colis.statu_final
                        .toLowerCase() === colisStatus.toLowerCase();
                }

                // Filter by wallet key
                if (walletKey && transfer.wallet?.key) {
                    match = match && transfer.wallet.key
                        .toLowerCase()
                        .includes(walletKey.toLowerCase());
                }

                // Filter by date range
                if (startDate && endDate) {
                    const transferDate = new Date(transfer.createdAt);
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    match = match && transferDate >= start && transferDate <= end;
                }

                return match;
            });
        } 
        // If user is client, get only their transfers with filters
        else if (req.user.role === 'client') {
            if (transferStatus) {
                query.status = transferStatus;
            }

            transfers = await Transfer.find(query)
                .populate('colis')
                .populate({
                    path: 'wallet',
                    populate: {
                        path: 'store',
                        select: 'storeName'
                    }
                })
                .sort({ createdAt: -1 })
                .then(transfers => transfers.filter(transfer => {
                    let match = transfer.wallet?.store?._id.toString() === req.user.store;

                    // Filter by colis status
                    if (colisStatus && transfer.colis?.statu_final) {
                        match = match && transfer.colis.statu_final
                            .toLowerCase() === colisStatus.toLowerCase();
                    }

                    // Filter by date range
                    if (startDate && endDate) {
                        const transferDate = new Date(transfer.createdAt);
                        const start = new Date(startDate);
                        const end = new Date(endDate);
                        match = match && transferDate >= start && transferDate <= end;
                    }

                    return match;
                }));
        }
        // For other roles or unauthorized access
        else {
            return res.status(403).json({ message: "Not authorized to view transfers" });
        }

        res.status(200).json(transfers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get transfer by ID
const getTransferById = async (req, res) => {
    try {
        const transfer = await Transfer.findById(req.params.id)
            .populate('colis')
            .populate('wallet');

        if (!transfer) {
            return res.status(404).json({ message: "Transfer not found" });
        }

        res.status(200).json(transfer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get transfers by wallet
const getTransfersByWallet = async (req, res) => {
    try {
        const transfers = await Transfer.find({ wallet: req.params.walletId })
            .populate('colis')
            .populate('wallet')
            .sort({ createdAt: -1 });

        res.status(200).json(transfers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get transfers by colis
const getTransfersByColis = async (req, res) => {
    try {
        const transfers = await Transfer.find({ colis: req.params.colisId })
            .populate('colis')
            .populate('wallet')
            .sort({ createdAt: -1 });

        res.status(200).json(transfers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete transfer
const deleteTransfer = async (req, res) => {
    try {
        const transfer = await Transfer.findById(req.params.id);

        if (!transfer) {
            return res.status(404).json({ message: "Transfer not found" });
        }

        await transfer.deleteOne();
        res.status(200).json({ message: "Transfer deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const cancelTransfer = async (req, res) => {
    try {
        const { transferId } = req.params;

        // Find the transfer and check its status
        const transfer = await Transfer.findById(transferId);
        if (!transfer) {
            return res.status(404).json({ message: "Transfer not found" });
        }

        // Check if transfer is already cancelled
        if (transfer.status === 'annuler') {
            return res.status(400).json({ message: "Transfer is already cancelled" });
        }

        // Find the associated wallet
        const wallet = await Wallet.findById(transfer.wallet);
        if (!wallet) {
            return res.status(404).json({ message: "Wallet not found" });
        }

        // Find the associated colis
        const colis = await Colis.findById(transfer.colis);
        if (!colis) {
            return res.status(404).json({ message: "Colis not found" });
        }

        try {
            // First mark the transfer as cancelled to prevent concurrent cancellations
            transfer.status = 'annuler';
            await transfer.save();

            // Then update the wallet balance using findOneAndUpdate to ensure atomicity
            const updatedWallet = await Wallet.findOneAndUpdate(
                { _id: wallet._id },
                { $inc: { solde: -transfer.montant } },
                { new: true }
            );

            if (!updatedWallet) {
                // If wallet update fails, revert transfer status
                transfer.status = 'annuler';
                await transfer.save();
                throw new Error('Failed to update wallet balance');
            }

            // Finally update the colis status
            const updatedColis = await Colis.findOneAndUpdate(
                { _id: colis._id },
                { wallet_prosseced: false },
                { new: true }
            );

            if (!updatedColis) {
                // If colis update fails, revert previous changes
                transfer.status = 'annuler';
                await transfer.save();
                await Wallet.findOneAndUpdate(
                    { _id: wallet._id },
                    { $inc: { solde: transfer.montant } }
                );
                throw new Error('Failed to update colis status');
            }

            res.status(200).json({
                message: "Transfer cancelled successfully",
                transfer,
                wallet: updatedWallet,
                colis: updatedColis
            });

        } catch (error) {
            throw new Error(`Failed to cancel transfer: ${error.message}`);
        }

    } catch (error) {
        console.error('Error cancelling transfer:', error);
        res.status(500).json({ 
            message: "Error cancelling transfer", 
            error: error.message 
        });
    }
};

const validateTransferStatus = async (req, res) => {
    try {
        const { transferId } = req.params;

        // Find the transfer and check its status
        const transfer = await Transfer.findById(transferId);
        if (!transfer) {
            return res.status(404).json({ message: "Transfer not found" });
        }

        // Check if transfer is already validated
        if (transfer.status === 'validé') {
            return res.status(400).json({ message: "Transfer is already validated" });
        }

        // Find the associated wallet
        const wallet = await Wallet.findById(transfer.wallet);
        if (!wallet) {
            return res.status(404).json({ message: "Wallet not found" });
        }

        // Find the associated colis
        const colis = await Colis.findById(transfer.colis);
        if (!colis) {
            return res.status(404).json({ message: "Colis not found" });
        }

        try {
            // First mark the transfer as validated to prevent concurrent validations
            transfer.status = 'validé';
            await transfer.save();

            // Then update the wallet balance using findOneAndUpdate to ensure atomicity
            const updatedWallet = await Wallet.findOneAndUpdate(
                { _id: wallet._id },
                { $inc: { solde: transfer.montant } },
                { new: true }
            );

            if (!updatedWallet) {
                // If wallet update fails, revert transfer status
                transfer.status = 'pending';
                await transfer.save();
                throw new Error('Failed to update wallet balance');
            }

            // Finally update the colis status
            const updatedColis = await Colis.findOneAndUpdate(
                { _id: colis._id },
                { wallet_prosseced: true },
                { new: true }
            );

            if (!updatedColis) {
                // If colis update fails, revert previous changes
                transfer.status = 'pending';
                await transfer.save();
                await Wallet.findOneAndUpdate(
                    { _id: wallet._id },
                    { $inc: { solde: -transfer.montant } }
                );
                throw new Error('Failed to update colis status');
            }

            res.status(200).json({
                message: "Transfer validated successfully",
                transfer,
                wallet: updatedWallet,
                colis: updatedColis
            });

        } catch (error) {
            throw new Error(`Failed to validate transfer: ${error.message}`);
        }

    } catch (error) {
        console.error('Error validating transfer:', error);
        res.status(500).json({ 
            message: "Error validating transfer", 
            error: error.message 
        });
    }
};

const correctTransfer = async (req, res) => {
    try {
        const { transferId } = req.params;
        const { newMontant, description } = req.body;

        if (!newMontant || typeof newMontant !== 'number') {
            return res.status(400).json({ 
                message: "newMontant is required and must be a number" 
            });
        }

        if (!description) {
            return res.status(400).json({ 
                message: "Description is required for correction transfers" 
            });
        }

        // Find the transfer
        const transfer = await Transfer.findById(transferId);
        if (!transfer) {
            return res.status(404).json({ message: "Transfer not found" });
        }

        // Check if transfer can be corrected
        if (transfer.type === 'Correction') {
            return res.status(400).json({ 
                message: "Cannot correct a correction transfer" 
            });
        }

        if (transfer.status !== 'validé') {
            return res.status(400).json({ 
                message: "Only validated transfers can be corrected" 
            });
        }

        // Find the associated wallet
        const wallet = await Wallet.findById(transfer.wallet);
        if (!wallet) {
            return res.status(404).json({ message: "Wallet not found" });
        }

        // Calculate difference
        const oldMontant = transfer.montant;
        const difference = newMontant - oldMontant;

        // Check if wallet has sufficient balance for deduction
        if (difference < 0 && wallet.solde + difference < 0) {
            return res.status(400).json({ 
                message: "Insufficient wallet balance for this correction" 
            });
        }

        try {
            // First update the transfer to prevent concurrent modifications
            transfer.originalMontant = oldMontant;
            transfer.montant = newMontant;
            transfer.status = 'corrigé';
            transfer.type = 'Correction';
            transfer.description = description;
            transfer.correctionDate = new Date();
            await transfer.save();

            // Then update the wallet balance
            const updatedWallet = await Wallet.findOneAndUpdate(
                { _id: wallet._id },
                { $inc: { solde: difference } },
                { new: true }
            );

            if (!updatedWallet) {
                // If wallet update fails, revert transfer changes
                transfer.montant = oldMontant;
                transfer.status = 'validé';
                transfer.type = 'Deposit';
                transfer.description = undefined;
                transfer.originalMontant = undefined;
                transfer.correctionDate = undefined;
                await transfer.save();
                throw new Error('Failed to update wallet balance');
            }

            res.status(200).json({
                message: "Transfer corrected successfully",
                transfer: await Transfer.findById(transfer._id)
                    .populate('colis')
                    .populate('wallet'),
                wallet: updatedWallet,
                correction: {
                    oldAmount: oldMontant,
                    newAmount: newMontant,
                    difference,
                    description
                }
            });

        } catch (error) {
            throw new Error(`Failed to correct transfer: ${error.message}`);
        }

    } catch (error) {
        console.error('Error correcting transfer:', error);
        res.status(500).json({ 
            message: "Error correcting transfer", 
            error: error.message 
        });
    }
};

module.exports = {
    createTransfer,
    getAllTransfers,
    getTransferById,
    getTransfersByWallet,
    getTransfersByColis,
    deleteTransfer,
    cancelTransfer,
    validateTransferStatus,
    correctTransfer
}; 