const { Withdrawal, validateWithdrawal, WITHDRAWAL_STATUS } = require('../Models/Withdrawal');
const { Wallet } = require('../Models/Wallet');
const asyncHandler = require('express-async-handler');
const { withdrawalWallet } = require('../Middlewares/payments');
const { Store } = require('../Models/Store');
const { cloudinaryUploadImage } = require('../utils/cloudinary');

// Create a new withdrawal
const createWithdrawal = asyncHandler(async (req, res) => {
    try {
        const { wallet, payment, montant } = req.body;
       

        // Validate the request body
        const { error } = validateWithdrawal({ ...req.body, frais: 5 });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        // Process withdrawal using the middleware function
        const withdrawalResult = await withdrawalWallet(wallet, montant, payment);

        // Create new withdrawal record
        const withdrawal = new Withdrawal({
            wallet,
            payment,
            montant: withdrawalResult.pureMontant,
            frais: withdrawalResult.frais,
            statusHistory: [{
                status: WITHDRAWAL_STATUS.WAITING,
                note: 'تم إنشاء طلب السحب'
            }]
        });

        const savedWithdrawal = await withdrawal.save();
        
        // Populate the saved withdrawal with all necessary details
        const populatedWithdrawal = await Withdrawal.findById(savedWithdrawal._id)
            .populate({
                path: 'wallet',
                select: 'key solde store',
                populate: {
                    path: 'store',
                    select: 'storeName'
                }
            })
            .populate({
                path: 'payment',
                select: 'nom rib clientId idBank',
                populate: {
                    path: 'idBank',
                    select: 'Bank image'
                }
            });

        res.status(201).json(populatedWithdrawal);
    } catch (error) {
        console.error('Error in createWithdrawal:', error);
        res.status(400).json({ 
            error: error.message || 'Failed to create withdrawal',
            details: error.stack
        });
    }
});

// Get withdrawal by ID
const getWithdrawalById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const withdrawal = await Withdrawal.findById(id)
            .populate({
                path: 'wallet',
                select: 'key solde store',
                populate: {
                    path: 'store',
                    select: 'storeName'
                }
            })
            .populate({
                path: 'payment',
                select: 'nom rib clientId idBank',
                populate: {
                    path: 'idBank',
                    select: 'Bank image'
                }
            });

        if (!withdrawal) {
            return res.status(404).json({ error: 'Withdrawal not found' });
        }

        res.status(200).json(withdrawal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update withdrawal status
const updateWithdrawalStatus = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;

        // Validate status
        if (!Object.values(WITHDRAWAL_STATUS).includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const withdrawal = await Withdrawal.findById(id);
        if (!withdrawal) {
            return res.status(404).json({ error: 'Withdrawal not found' });
        }

        // Check if status transition is valid
        const finalStatuses = [WITHDRAWAL_STATUS.REJECTED, WITHDRAWAL_STATUS.DONE];
        if (finalStatuses.includes(withdrawal.status)) {
            return res.status(400).json({ 
                error: `Cannot change status from ${withdrawal.status} as it is a final status` 
            });
        }

        // Update status and add to history
        withdrawal.status = status;
        withdrawal.statusHistory.push({
            status,
            note: note || getDefaultNote(status)
        });

        // If rejected, refund the wallet
        if (status === WITHDRAWAL_STATUS.REJECTED) {
            const wallet = await Wallet.findById(withdrawal.wallet);
            if (wallet) {
                wallet.solde += (withdrawal.montant + withdrawal.frais);
                await wallet.save();
            }
        }

        const updatedWithdrawal = await withdrawal.save();

        // Populate the updated withdrawal
        const populatedWithdrawal = await Withdrawal.findById(updatedWithdrawal._id)
            .populate({
                path: 'wallet',
                select: 'key solde store',
                populate: {
                    path: 'store',
                    select: 'storeName'
                }
            })
            .populate({
                path: 'payment',
                select: 'nom rib clientId idBank',
                populate: {
                    path: 'idBank',
                    select: 'Bank image'
                }
            });

        res.status(200).json(populatedWithdrawal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper function to get default notes for status changes
const getDefaultNote = (status) => {
    const defaultNotes = {
        [WITHDRAWAL_STATUS.WAITING]: 'تم إنشاء طلب السحب',
        [WITHDRAWAL_STATUS.SEEN]: 'تم رؤية الطلب من قبل الإدارة',
        [WITHDRAWAL_STATUS.CHECKING]: 'جاري مراجعة الطلب من قبل الإدارة',
        [WITHDRAWAL_STATUS.ACCEPTED]: 'تم قبول طلب السحب',
        [WITHDRAWAL_STATUS.REJECTED]: 'تم رفض طلب السحب',
        [WITHDRAWAL_STATUS.PROCESSING]: 'جاري معالجة عملية السحب',
        [WITHDRAWAL_STATUS.DONE]: 'تم إكمال عملية السحب بنجاح'
    };
    return defaultNotes[status] || `تم تغيير الحالة إلى ${status}`;
};

// Get withdrawals by status
const getWithdrawalsByStatus = asyncHandler(async (req, res) => {
    try {
        const { status } = req.params;
        
        // Validate status
        if (!Object.values(WITHDRAWAL_STATUS).includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const withdrawals = await Withdrawal.find({ status })
            .populate({
                path: 'wallet',
                select: 'key solde store',
                populate: {
                    path: 'store',
                    select: 'storeName'
                }
            })
            .populate({
                path: 'payment',
                select: 'nom rib clientId idBank',
                populate: {
                    path: 'idBank',
                    select: 'Bank image'
                }
            })
            .sort({ createdAt: -1 });

        res.status(200).json(withdrawals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all withdrawals
const getAllWithdrawals = asyncHandler(async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10,
            storeName,
            walletKey,
            status,
            startDate,
            endDate
        } = req.query;

        const userRole = req.user.role;
        const storeId = req.user.store;

        // Build query
        let query = {};

        // If user is a client, only show withdrawals for their store
        if (userRole === 'client' && storeId) {
            const wallet = await Wallet.findOne({ store: storeId });
            if (wallet) {
                query.wallet = wallet._id;
            }
        }

        // Store name search (admin only)
        if (userRole === 'admin' && storeName) {
            // Find stores matching the search
            const stores = await Store.find({
                storeName: { $regex: storeName, $options: 'i' }
            });
            
            if (stores.length > 0) {
                // Get wallets for these stores
                const wallets = await Wallet.find({
                    store: { $in: stores.map(store => store._id) }
                });
                
                if (wallets.length > 0) {
                    query.wallet = { $in: wallets.map(wallet => wallet._id) };
                }
            }
        }

        // Wallet key search
        if (walletKey) {
            const wallet = await Wallet.findOne({ key: walletKey });
            if (wallet) {
                query.wallet = wallet._id;
            }
        }

        // Status filter
        if (status) {
            query.status = status;
        }

        // Date range filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate);
            }
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Withdrawal.countDocuments(query);

        // Execute query with pagination
        const withdrawals = await Withdrawal.find(query)
            .populate({
                path: 'wallet',
                select: 'key solde store',
                populate: {
                    path: 'store',
                    select: 'storeName'
                }
            })
            .populate({
                path: 'payment',
                select: 'nom rib clientId idBank',
                populate: {
                    path: 'idBank',
                    select: 'Bank image'
                }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.status(200).json({
            withdrawals,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error in getAllWithdrawals:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get withdrawals by wallet ID
const getWithdrawalsByWalletId = asyncHandler(async (req, res) => {
    try {
        const { walletId } = req.params;
        const withdrawals = await Withdrawal.find({ wallet: walletId })
            .populate({
                path: 'wallet',
                select: 'key solde store',
                populate: {
                    path: 'store',
                    select: 'storeName'
                }
            })
            .populate({
                path: 'payment',
                select: 'nom rib clientId idBank',
                populate: {
                    path: 'idBank',
                    select: 'Bank image'
                }
            })
            .sort({ createdAt: -1 });
        res.status(200).json(withdrawals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get withdrawals by wallet key
const getWithdrawalsByWalletKey = asyncHandler(async (req, res) => {
    try {
        const { key } = req.params;
        const wallet = await Wallet.findOne({ key });
        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        const withdrawals = await Withdrawal.find({ wallet: wallet._id })
            .populate({
                path: 'wallet',
                select: 'key solde store',
                populate: {
                    path: 'store',
                    select: 'storeName'
                }
            })
            .populate({
                path: 'payment',
                select: 'nom rib clientId idBank',
                populate: {
                    path: 'idBank',
                    select: 'Bank image'
                }
            })
            .sort({ createdAt: -1 });
        res.status(200).json(withdrawals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get withdrawals by store ID
const getWithdrawalsByStoreId = asyncHandler(async (req, res) => {
    try {
        const { storeId } = req.params;
        const wallets = await Wallet.find({ store: storeId });
        const walletIds = wallets.map(wallet => wallet._id);

        const withdrawals = await Withdrawal.find({ wallet: { $in: walletIds } })
            .populate({
                path: 'wallet',
                select: 'key solde store',
                populate: {
                    path: 'store',
                    select: 'storeName'
                }
            })
            .populate({
                path: 'payment',
                select: 'nom rib clientId idBank',
                populate: {
                    path: 'idBank',
                    select: 'Bank image'
                }
            })
            .sort({ createdAt: -1 });
        res.status(200).json(withdrawals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = {
    createWithdrawal,
    getAllWithdrawals,
    getWithdrawalsByWalletId,
    getWithdrawalsByWalletKey,
    getWithdrawalsByStoreId,
    getWithdrawalById,
    updateWithdrawalStatus,
    getWithdrawalsByStatus
};