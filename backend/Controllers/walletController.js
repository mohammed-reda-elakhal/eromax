const asyncHandler = require('express-async-handler');
const {Wallet, validateWallet} = require('../Models/Wallet');
const {Store} = require('../Models/Store');
const {Transfer} = require('../Models/Transfer');
const moment = require('moment');
const mongoose = require('mongoose');

// Generate unique wallet key
const generateWalletKey = () => {
    const date = moment().format('YYYYMMDD-HH-mm');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `EROMAX-WALLET-${date}-${random}`;
};

// Create wallets for all existing stores
const createWalletsForStores = async (req, res) => {
    try {
        // Get all stores without wallets
        const stores = await Store.find();
        const existingWallets = await Wallet.find();
        const storesWithoutWallet = stores.filter(store => 
            !existingWallets.some(wallet => wallet.store.toString() === store._id.toString())
        );

        if (storesWithoutWallet.length === 0) {
            return res.status(200).json({ message: "All stores already have wallets" });
        }

        // Create wallets for stores that don't have one
        const walletPromises = storesWithoutWallet.map(store => {
            const newWallet = new Wallet({
                key: generateWalletKey(),
                store: store._id,
                solde: 0,
                active: false
            });
            return newWallet.save();
        });

        await Promise.all(walletPromises);

        res.status(201).json({
            message: `Created ${storesWithoutWallet.length} new wallets successfully`,
            count: storesWithoutWallet.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get wallet by ID or key
const getWallet = async (req, res) => {
    try {
        const {identifier} = req.params; // can be either ID or key
        let wallet;

        // Check if identifier is a valid MongoDB ObjectId
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            wallet = await Wallet.findById(identifier).populate('store');
        } else {
            wallet = await Wallet.findOne({key: identifier}).populate('store');
        }

        if (!wallet) {
            return res.status(404).json({message: "Wallet not found"});
        }

        res.status(200).json(wallet);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// Get wallet by store ID
const getWalletByStore = async (req, res) => {
    try {
        const {storeId} = req.params;
        const wallet = await Wallet.findOne({store: storeId}).populate('store');

        if (!wallet) {
            return res.status(404).json({message: "Wallet not found for this store"});
        }

        res.status(200).json(wallet);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// Toggle wallet activation
const toggleWalletActivation = async (req, res) => {
    try {
        const { identifier } = req.params;
        let wallet;

        // Check if identifier is a valid MongoDB ObjectId
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            wallet = await Wallet.findById(identifier);
        } else {
            wallet = await Wallet.findOne({ key: identifier });
        }

        if (!wallet) {
            return res.status(404).json({ message: "Wallet not found" });
        }

        wallet.active = !wallet.active;
        await wallet.save();

        res.status(200).json({
            message: `Wallet ${wallet.active ? 'activated' : 'deactivated'} successfully`,
            wallet
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Middleware for depositing money
const depositMoney = async (req, res) => {
    const session = await mongoose.startSession();
    
    try {
        const { identifier } = req.params;
        const { amount } = req.body;
        const adminId = req.user?.id || req.user?._id;

        // Validate admin ID is required
        if (!adminId) {
            return res.status(401).json({ message: "Admin authentication required for manual operations" });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid amount" });
        }

        let wallet, transfer;
        
        await session.withTransaction(async () => {
            // Check if identifier is a valid MongoDB ObjectId
            if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
                wallet = await Wallet.findById(identifier).session(session);
            } else {
                wallet = await Wallet.findOne({ key: identifier }).session(session);
            }

            if (!wallet) {
                throw new Error("Wallet not found");
            }

            if (!wallet.active) {
                throw new Error("Wallet is not active");
            }

            // Create transfer record with required admin field
            transfer = new Transfer({
                wallet: wallet._id,
                type: 'Manuel Depot',
                status: 'validé',
                montant: amount,
                commentaire: `Dépôt manuel de ${amount} DH par l'administrateur`,
                admin: adminId
            });
            
            await transfer.save({ session });

            wallet.solde += amount;
            await wallet.save({ session });
        });

        res.status(200).json({
            message: "Deposit successful",
            newBalance: wallet.solde,
            transfer: transfer
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.endSession();
    }
};

// Middleware for withdrawing money
const withdrawMoney = async (req, res) => {
    const session = await mongoose.startSession();
    
    try {
        const { identifier } = req.params;
        const { amount } = req.body;
        const adminId = req.user?.id || req.user?._id;

        // Validate admin ID is required
        if (!adminId) {
            return res.status(401).json({ message: "Admin authentication required for manual operations" });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid amount" });
        }

        let wallet, transfer;
        
        await session.withTransaction(async () => {
            // Check if identifier is a valid MongoDB ObjectId
            if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
                wallet = await Wallet.findById(identifier).session(session);
            } else {
                wallet = await Wallet.findOne({ key: identifier }).session(session);
            }

            if (!wallet) {
                throw new Error("Wallet not found");
            }

            if (!wallet.active) {
                throw new Error("Wallet is not active");
            }

            if (wallet.solde < amount) {
                throw new Error("Insufficient funds");
            }

            // Create transfer record with required admin field
            transfer = new Transfer({
                wallet: wallet._id,
                type: 'Manuel Withdrawal',
                status: 'validé',
                montant: -amount, // Negative amount for withdrawal
                commentaire: `Retrait manuel de ${amount} DH par l'administrateur`,
                admin: adminId
            });
            
            await transfer.save({ session });

            wallet.solde -= amount;
            await wallet.save({ session });
        });

        res.status(200).json({
            message: "Withdrawal successful",
            newBalance: wallet.solde,
            transfer: transfer
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.endSession();
    }
};

// Reset wallet to initial state
const resetWallet = async (req, res) => {
    const session = await mongoose.startSession();
    
    try {
        let wallet, transfer;
        const { identifier } = req.params;
        
        await session.withTransaction(async () => {
            // Check if identifier is a valid MongoDB ObjectId
            if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
                wallet = await Wallet.findById(identifier).session(session);
            } else {
                wallet = await Wallet.findOne({ key: identifier }).session(session);
            }

            if (!wallet) {
                throw new Error("Wallet not found");
            }

            // Create transfer record for reset operation if wallet has balance
            if (wallet.solde !== 0) {
                transfer = new Transfer({
                    wallet: wallet._id,
                    type: 'Manuel Withdrawal',
                    status: 'validé',
                    montant: -wallet.solde, // Negative amount to reset balance
                    commentaire: `Réinitialisation du portefeuille - Solde précédent: ${wallet.solde} DH`
                });
                
                await transfer.save({ session });
            }

            // Reset wallet to initial state
            wallet.solde = 0;
            wallet.active = false;
            await wallet.save({ session });
        });

        res.status(200).json({
            message: "Wallet reset successfully",
            wallet,
            transfer: transfer || null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await session.endSession();
    }
};

module.exports = {
    createWalletsForStores,
    getWallet,
    getWalletByStore,
    toggleWalletActivation,
    depositMoney,
    withdrawMoney,
    resetWallet
};