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


// Placeholder: update a transfer (not implemented yet)
const updateTransfer = async (req, res) => {
    return res.status(501).json({ message: 'updateTransfer not implemented' });
};

// Correct a transfer (transactional)
const correctTransfer = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { transferId } = req.params;
        const { newMontant, description } = req.body;

        // Validate admin permissions
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Only admins can correct transfers" });
        }

        // Validate required fields
        if (!newMontant || newMontant === undefined) {
            return res.status(400).json({ message: "New amount is required" });
        }
        if (!description || description.trim().length < 10) {
            return res.status(400).json({ message: "Description must be at least 10 characters" });
        }

        let result;
        await session.withTransaction(async () => {
            // Find the transfer
            const transfer = await Transfer.findById(transferId).session(session);
            if (!transfer) {
                throw new Error("Transfer not found");
            }

            // Check if transfer is already corrected
            if (transfer.type === 'Correction') {
                throw new Error("Cannot correct a correction transfer");
            }

            // Check if transfer is cancelled
            if (transfer.status === 'annuler') {
                throw new Error("Cannot correct a cancelled transfer");
            }

            // Find the associated wallet
            const wallet = await Wallet.findById(transfer.wallet).session(session);
            if (!wallet) {
                throw new Error("Wallet not found");
            }

            // Store original montant if not already stored
            const originalMontant = transfer.originalMontant !== null ? transfer.originalMontant : transfer.montant;
            
            // Calculate the difference between new and old montant
            const montantDifference = newMontant - transfer.montant;

            // Update wallet balance with the difference
            wallet.solde += montantDifference;
            await wallet.save({ session });

            // Update the transfer
            transfer.montant = newMontant;
            transfer.originalMontant = originalMontant;
            transfer.type = 'Correction';
            transfer.status = 'corrigé';
            transfer.description = description;
            transfer.correctionDate = new Date();
            await transfer.save({ session });

            result = { 
                transfer: await Transfer.findById(transfer._id)
                    .populate('colis')
                    .populate({
                        path: 'wallet',
                        populate: {
                            path: 'store',
                            select: 'storeName'
                        }
                    })
                    .populate('admin', 'nom username email')
                    .session(session),
                wallet,
                montantDifference
            };
        });

        res.status(200).json({
            message: "Transfer corrected successfully",
            transfer: result.transfer,
            montantDifference: result.montantDifference
        });

    } catch (error) {
        console.error('Error correcting transfer:', error);
        res.status(500).json({
            message: "Error correcting transfer",
            error: error.message
        });
    } finally {
        await session.endSession();
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
            endDate,
            transferType,
            manualOnly
        } = req.query;

        let query = {};
        let transfers;

        // Filter by transfer type if provided
        if (transferType) {
            query.type = transferType;
        }

        // Filter for manual transfers only if requested
        if (manualOnly === 'true') {
            query.type = { $in: ['Manuel Depot', 'Manuel Withdrawal'] };
        }

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
                .populate('admin', 'nom username email')
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
        return res.status(200).json({ message: "Transfer deleted successfully" });
    } catch (error) {
        console.error('Error deleting transfer:', error);
        return res.status(500).json({ message: "Error deleting transfer", error: error.message });
    }
};

// Cancel transfer (transactional)
const cancelTransfer = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { transferId } = req.params;

        let result;
        await session.withTransaction(async () => {
            const transfer = await Transfer.findById(transferId).session(session);
            if (!transfer) {
                throw new Error("Transfer not found");
            }
            if (transfer.status === 'annuler') {
                throw new Error("Transfer is already cancelled");
            }

            const wallet = await Wallet.findById(transfer.wallet).session(session);
            if (!wallet) {
                throw new Error("Wallet not found");
            }

            // Mark transfer cancelled
            transfer.status = 'annuler';
            await transfer.save({ session });

            // Revert wallet.balance by subtracting transfer.montant
            wallet.solde -= transfer.montant;
            await wallet.save({ session });

            // Optionally update colis flag
            let updatedColis = null;
            if (transfer.colis) {
                updatedColis = await Colis.findOneAndUpdate(
                    { _id: transfer.colis },
                    { wallet_prosseced: false },
                    { new: true, session }
                );
            }

            result = { transfer, wallet, colis: updatedColis };
        });

        return res.status(200).json({ message: "Transfer cancelled successfully", ...result });
    } catch (error) {
        console.error('Error cancelling transfer:', error);
        return res.status(500).json({ message: "Error cancelling transfer", error: error.message });
    } finally {
        await session.endSession();
    }
};


const validateTransferStatus = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { transferId } = req.params;

        let result;
        await session.withTransaction(async () => {
            // Find the transfer and check its status
            const transfer = await Transfer.findById(transferId).session(session);
            if (!transfer) {
                throw new Error("Transfer not found");
            }

            // Check if transfer is already validated
            if (transfer.status === 'validé') {
                throw new Error("Transfer is already validated");
            }

            // Find the associated wallet
            const wallet = await Wallet.findById(transfer.wallet).session(session);
            if (!wallet) {
                throw new Error("Wallet not found");
            }

            // Mark the transfer as validated
            transfer.status = 'validé';
            await transfer.save({ session });

            // Apply wallet balance change
            wallet.solde += transfer.montant;
            await wallet.save({ session });

            // Update colis status if present
            let updatedColis = null;
            if (transfer.colis) {
                updatedColis = await Colis.findOneAndUpdate(
                    { _id: transfer.colis },
                    { wallet_prosseced: true },
                    { new: true, session }
                );
            }

            result = { transfer, wallet, colis: updatedColis };
        });

        res.status(200).json({
            message: "Transfer validated successfully",
            ...result
        });

    } catch (error) {
        console.error('Error validating transfer:', error);
        res.status(500).json({
            message: "Error validating transfer",
            error: error.message
        });
    } finally {
        await session.endSession();
    }
};


// Create manual deposit
const createManualDeposit = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { wallet, montant, commentaire } = req.body;

        // Validate admin permissions
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Only admins can create manual deposits" });
        }

        // Validate amount
        if (!montant || montant <= 0) {
            return res.status(400).json({ message: "Amount must be positive for deposits" });
        }

        // Create transfer object
        const transferData = {
            wallet,
            type: 'Manuel Depot',
            montant,
            commentaire,
            admin: req.user.id,
            status: 'validé'
        };

        // Validate request body
        const { error } = validateTransfer(transferData);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        let savedTransfer;
        await session.withTransaction(async () => {
            // Find the wallet in the session
            const walletDoc = await Wallet.findById(wallet).session(session);
            if (!walletDoc) {
                throw new Error("Wallet not found");
            }
            if (!walletDoc.active) {
                throw new Error("Wallet is not active");
            }

            // Create new transfer
            const transfer = new Transfer(transferData);
            savedTransfer = await transfer.save({ session });

            // Update wallet balance
            walletDoc.solde += montant;
            await walletDoc.save({ session });
        });

        // Return created transfer
        res.status(201).json({
            message: "Manual deposit created successfully",
            transfer: await Transfer.findById(savedTransfer._id)
                .populate('wallet')
                .populate('admin', 'Nom Prenom email')
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.endSession();
    }
};


// Create manual withdrawal
const createManualWithdrawal = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { wallet, montant, commentaire } = req.body;

        // Validate admin permissions
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Only admins can create manual withdrawals" });
        }

        // Validate amount
        if (!montant || montant <= 0) {
            return res.status(400).json({ message: "Amount must be positive for withdrawals" });
        }

        // Create transfer object (use negative montant for withdrawals)
        const transferData = {
            wallet,
            type: 'Manuel Withdrawal',
            montant: -montant,
            commentaire,
            admin: req.user.id,
            status: 'validé'
        };

        // Validate request body
        const { error } = validateTransfer(transferData);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        let savedTransfer;
        await session.withTransaction(async () => {
            // Find the wallet
            const walletDoc = await Wallet.findById(wallet).session(session);
            if (!walletDoc) {
                throw new Error("Wallet not found");
            }
            if (!walletDoc.active) {
                throw new Error("Wallet is not active");
            }
            // Check if wallet has sufficient balance
            if (walletDoc.solde < montant) {
                throw new Error("Insufficient wallet balance for withdrawal");
            }

            // Create new transfer
            const transfer = new Transfer(transferData);
            savedTransfer = await transfer.save({ session });

            // Update wallet balance (subtract for withdrawal)
            walletDoc.solde -= montant;
            await walletDoc.save({ session });
        });

        // Return created transfer
        res.status(201).json({
            message: "Manual withdrawal created successfully",
            transfer: await Transfer.findById(savedTransfer._id)
                .populate('wallet')
                .populate('admin', 'Nom Prenom email')
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.endSession();
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
    updateTransfer,
    correctTransfer,
    createManualDeposit,
    createManualWithdrawal
};