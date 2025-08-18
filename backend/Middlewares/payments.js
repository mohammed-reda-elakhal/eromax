const { Transfer } = require('../Models/Transfer');
const { Wallet } = require('../Models/Wallet');
const { Colis } = require('../Models/Colis');
const { Withdrawal } = require('../Models/Withdrawal');
const { Store } = require('../Models/Store');
const Payement = require('../Models/Payement');
const mongoose = require('mongoose');

// Create transfer function (for manual operations without transactions)
const createTransferOperation = async (id_wallet, type, montant, id_colis = null, session = null) => {
    try {
        // Verify wallet exists and is active
        const wallet = await Wallet.findById(id_wallet).session(session);
        if (!wallet) {
            throw new Error("Wallet not found");
        }
        if (!wallet.active) {
            throw new Error("Wallet is not active");
        }

        // Create transfer object
        const transferData = {
            wallet: id_wallet,
            type,
            montant
        };

        // Add colis if provided and type is not withdrawal
        if (id_colis && type !== 'withdrawal') {
            transferData.colis = id_colis;
        }

        // Add default commentaire for withdrawal type
        if (type === 'withdrawal') {
            transferData.commentaire = 'retrait par client';
        }

        // Create and save transfer
        const transfer = new Transfer(transferData);
        await transfer.save(session ? { session } : {});
        return transfer;
    } catch (error) {
        throw error;
    }
};

// Handle wallet withdrawal (supports external session to avoid nested transactions)
const withdrawalWallet = async (walletId, montant, paymentId, externalSession = null) => {
    const ownSession = !externalSession;
    const session = externalSession || await mongoose.startSession();
    
    const run = async () => {
        const frais = 5; // Fixed frais
        const totalAmount = montant;

        // Verify wallet exists and is active
        const wallet = await Wallet.findById(walletId).session(session);
        if (!wallet) {
            throw new Error("Wallet not found");
        }
        if (!wallet.active) {
            throw new Error("Wallet is not active");
        }

        // Get store and verify client ownership
        const store = await Store.findById(wallet.store).session(session);
        if (!store) {
            throw new Error("Store not found for this wallet");
        }

        // Verify payment method exists and belongs to the same client
        const payment = await Payement.findById(paymentId).session(session);
        if (!payment) {
            throw new Error("Payment method not found");
        }
        if (payment.clientId.toString() !== store.id_client.toString()) {
            throw new Error("Payment method does not belong to the wallet owner");
        }

        // Check if pure montant (after frais) is at least 100
        if (montant < 100) {
            throw new Error("Minimum withdrawal amount must be 100. Please increase your withdrawal amount.");
        }

        // Check if wallet has sufficient balance
        if (wallet.solde < totalAmount) {
            throw new Error("Insufficient balance. Please ensure you have enough balance including the 5 fee.");
        }
        
        /*
        // Check for 24-hour cooldown
        const lastWithdrawal = await Withdrawal.findOne({
            wallet: walletId,
            createdAt: {
                $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
            }
        }).session(session);

        if (lastWithdrawal) {
            const timeLeft = Math.ceil((24 * 60 * 60 * 1000 - (Date.now() - lastWithdrawal.createdAt)) / (1000 * 60 * 60));
            throw new Error(`You can only make one withdrawal every 24 hours. Please wait ${timeLeft} hours before trying again.`);
        }
            */

        // Create transfer record with session
        const transfer = new Transfer({
            wallet: walletId,
            type: 'withdrawal',
            montant: -montant,
            commentaire: 'retrait par client'
        });
        await transfer.save({ session });

        // Update wallet balance
        wallet.solde -= montant;
        await wallet.save({ session });

        return {
            wallet,
            transfer,
            pureMontant: montant - frais,
            frais
        };
    };

    try {
        if (ownSession) {
            return await session.withTransaction(run);
        }
        // When external session/transaction is provided, just run the logic
        return await run();
    } catch (error) {
        throw error;
    } finally {
        if (ownSession) {
            await session.endSession();
        }
    }
};

// Deposit money to wallet
const depositToWallet = async (storeId, montant, colisId) => {
    const session = await mongoose.startSession();
    
    try {
        return await session.withTransaction(async () => {
            // Find wallet by store ID
            const wallet = await Wallet.findOne({ store: storeId }).session(session);
            if (!wallet) {
                throw new Error("Wallet not found for this store");
            }

            // Check if wallet is active
            if (!wallet.active) {
                throw new Error("Wallet is not active");
            }

            // Find colis and check if it's already processed
            const colis = await Colis.findById(colisId).session(session);
            if (!colis) {
                throw new Error("Colis not found");
            }
            if (colis.wallet_prosseced) {
                throw new Error("This colis has already been processed for wallet payment");
            }

            // Create transfer record with session
            const transfer = new Transfer({
                wallet: wallet._id,
                type: 'Deposit',
                montant: montant,
                colis: colisId
            });
            await transfer.save({ session });

            // Update wallet and colis
            wallet.solde += montant;
            await wallet.save({ session });

            colis.wallet_prosseced = true;
            await colis.save({ session });

            return {
                wallet,
                transfer,
                colis
            };
        });
    } catch (error) {
        throw error;
    } finally {
        await session.endSession();
    }
};

module.exports = {
    createTransferOperation,
    depositToWallet,
    withdrawalWallet
};