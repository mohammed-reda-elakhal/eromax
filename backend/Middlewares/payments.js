const { Transfer } = require('../Models/Transfer');
const { Wallet } = require('../Models/Wallet');
const { Colis } = require('../Models/Colis');
const { Withdrawal } = require('../Models/Withdrawal');
const { Store } = require('../Models/Store');
const Payement = require('../Models/Payement');

// Create transfer function
const createTransferOperation = async (id_colis, id_wallet, type, montant) => {
    try {
        // Verify wallet exists and is active
        const wallet = await Wallet.findById(id_wallet);
        if (!wallet) {
            throw new Error("Wallet not found");
        }
        if (!wallet.active) {
            throw new Error("Wallet is not active");
        }

        // Create and save transfer
        const transfer = new Transfer({
            colis: id_colis,
            wallet: id_wallet,
            type,
            montant
        });
        await transfer.save();
        return transfer;
    } catch (error) {
        throw error;
    }
};

// Handle wallet withdrawal
const withdrawalWallet = async (walletId, montant, paymentId) => {
    try {
        const frais = 5; // Fixed frais
        const totalAmount = montant ;

        // Verify wallet exists and is active
        const wallet = await Wallet.findById(walletId);
        if (!wallet) {
            throw new Error("Wallet not found");
        }
        if (!wallet.active) {
            throw new Error("Wallet is not active");
        }

        // Get store and verify client ownership
        const store = await Store.findById(wallet.store);
        if (!store) {
            throw new Error("Store not found for this wallet");
        }

        // Verify payment method exists and belongs to the same client
        const payment = await Payement.findById(paymentId);
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

        // Check for 24-hour cooldown
        const lastWithdrawal = await Withdrawal.findOne({ 
            wallet: walletId,
            createdAt: { 
                $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
            }
        });

        if (lastWithdrawal) {
            const timeLeft = Math.ceil((24 * 60 * 60 * 1000 - (Date.now() - lastWithdrawal.createdAt)) / (1000 * 60 * 60));
            throw new Error(`You can only make one withdrawal every 24 hours. Please wait ${timeLeft} hours before trying again.`);
        }
    

        // Update wallet balance
        wallet.solde -= montant;
        await wallet.save();

        return {
            wallet,
            pureMontant: montant - frais, // This is the amount user requested
            frais
        };
    } catch (error) {
        throw error;
    }
};

// Deposit money to wallet
const depositToWallet = async (storeId, montant, colisId) => {
    try {
        // Find wallet by store ID
        const wallet = await Wallet.findOne({ store: storeId });
        if (!wallet) {
            throw new Error("Wallet not found for this store");
        }

        // Check if wallet is active
        if (!wallet.active) {
            throw new Error("Wallet is not active");
        }

        // Find colis and check if it's already processed
        const colis = await Colis.findById(colisId);
        if (!colis) {
            throw new Error("Colis not found");
        }
        if (colis.wallet_prosseced) {
            throw new Error("This colis has already been processed for wallet payment");
        }

        // Create transfer record first
        const transfer = await createTransferOperation(
            colisId,
            wallet._id,
            'Deposit',
            montant
        );

        // If transfer is created successfully, update wallet and colis
        wallet.solde += montant;
        await wallet.save();

        colis.wallet_prosseced = true;
        await colis.save();

        return {
            wallet,
            transfer,
            colis
        };
    } catch (error) {
        // If any error occurs, we need to handle it at the controller level
        throw error;
    }
};

module.exports = {
    createTransferOperation,
    depositToWallet,
    withdrawalWallet
}; 