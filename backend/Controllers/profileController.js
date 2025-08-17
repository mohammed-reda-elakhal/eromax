const asyncHandler = require("express-async-handler");
const { Client } = require("../Models/Client");
const { Colis } = require("../Models/Colis");
const { Livreur } = require("../Models/Livreur");
const { Admin } = require("../Models/Admin");

const { Store } = require("../Models/Store");
const { Wallet } = require("../Models/Wallet");
const Payement = require("../Models/Payement");
const bcrypt = require("bcryptjs");
const Joi = require("joi");

// Validation schemas
const updateProfileSchema = Joi.object({
    nom: Joi.string().trim().min(2).max(100),
    prenom: Joi.string().trim().min(2),
    username: Joi.string().trim().min(2),
    ville: Joi.string(),
    adresse: Joi.string(),
    tele: Joi.string(),
    cin: Joi.string(),
    email: Joi.string().email().trim().min(5).max(100)
});

const updateAdminSchema = Joi.object({
    nom: Joi.string().trim().min(2).max(100),
    prenom: Joi.string().trim().min(2),
    username: Joi.string().trim().min(2),
    tele: Joi.string(),
    email: Joi.string().email().trim().min(5).max(100),
    message: Joi.string().allow(""),
    permission: Joi.string().valid('all', 'none'),
    type: Joi.string().valid('super', 'normal')
});

const updateLivreurSchema = Joi.object({
    nom: Joi.string().trim().min(2).max(100),
    prenom: Joi.string().trim().min(2),
    username: Joi.string().trim().min(2),
    ville: Joi.string(),
    adresse: Joi.string(),
    tele: Joi.string(),
    cin: Joi.string(),
    email: Joi.string().email().trim().min(5).max(100),
    type: Joi.string().valid('simple', 'advanced'),
    domaine: Joi.string(),
    tarif: Joi.number().min(0),
    villes: Joi.array().items(Joi.string()),
    active: Joi.boolean()
});

const updatePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().trim().min(5).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
});

const updateStoreSchema = Joi.object({
    storeName: Joi.string().trim().min(2).max(100),
    adress: Joi.string().trim(),
    Bio: Joi.string().trim(),
    tele: Joi.string().trim(),
    message: Joi.string().trim().max(200),
    default: Joi.boolean()
});

const updatePaymentSchema = Joi.object({
    nom: Joi.string().required(),
    rib: Joi.string().required(),
    default: Joi.boolean()
});

// Helper: generate strong random secret and fingerprint
const crypto = require('crypto');
async function hashSecret(raw) {
    // use bcrypt for compatibility with model validator
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(raw, salt);
}
function generateRawSecret() {
    // 32 bytes -> 64 hex chars
    return crypto.randomBytes(32).toString('hex');
}
function fingerprintOf(secret) {
    // short fingerprint: last 6 characters of the raw secret
    if (!secret) return '';
    return String(secret).slice(-6);
}

// @desc    Get complete client profile data
// @route   GET /api/profile/client/:id
// @access  Private (Client only)
const getClientProfile = asyncHandler(async (req, res) => {
    try {
        const clientId = req.params.id || req.user.id;
        
        // Get client data
        const client = await Client.findById(clientId)
            .select('-password')
            .populate('files', 'url publicId');
        
        if (!client) {
            return res.status(404).json({ message: "Client not found" });
        }

        // Get store data
        const store = await Store.findOne({ id_client: clientId });
        
        // Get wallet data
        let wallet = null;
        if (store) {
            wallet = await Wallet.findOne({ store: store._id });
        }

        // Get payment methods
        const paymentMethods = await Payement.find({ clientId }).populate('idBank');

        const totalColis = await Colis.countDocuments({ store: store._id });

        // Get statistics
        const stats = {
            totalColis,
            storeCount: store ? 1 : 0,
            walletBalance: wallet ? wallet.solde : 0,
            paymentMethodsCount: paymentMethods.length
        };

        res.status(200).json({
            success: true,
            data: {
                client,
                store,
                wallet,
                paymentMethods,
                stats
            }
        });

    } catch (error) {
        console.error("Error fetching client profile:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error",
            error: error.message 
        });
    }
});

// @desc    Update client profile information
// @route   PUT /api/profile/client/:id
// @access  Private (Client only)
const updateClientProfile = asyncHandler(async (req, res) => {
    try {
        const clientId = req.params.id || req.user.id;
        const updateData = req.body;

       

        // Check if email is being updated and if it's already taken
        if (updateData.email) {
            const existingClient = await Client.findOne({ 
                email: updateData.email, 
                _id: { $ne: clientId } 
            });
            if (existingClient) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists"
                });
            }
        }

        // Update client profile
        const updatedClient = await Client.findByIdAndUpdate(
            clientId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedClient) {
            return res.status(404).json({
                success: false,
                message: "Client not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedClient
        });

    } catch (error) {
        console.error("Error updating client profile:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

// @desc    Update client password
// @route   PUT /api/profile/client/:id/password
// @access  Private (Client only)
const updateClientPassword = asyncHandler(async (req, res) => {
    try {
        const clientId = req.params.id || req.user.id;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validate password data
        const { error } = updatePasswordSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: error.details.map(detail => detail.message)
            });
        }

        // Get client with password
        const client = await Client.findById(clientId);
        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Client not found"
            });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, client.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        client.password = hashedPassword;
        await client.save();

        res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

// @desc    Update client store information
// @route   PUT /api/profile/client/:id/store
// @access  Private (Client only)
const updateClientStore = asyncHandler(async (req, res) => {
    try {
        const clientId = req.user.id;
        const updateData = req.body;

        // Find or create store
        let store = await Store.findOne({ id_client: clientId });
        
        if (!store) {
            // Create new store if it doesn't exist
            store = new Store({
                id_client: clientId,
                ...updateData
            });
        } else {
            // Update existing store
            Object.assign(store, updateData);
        }

        await store.save();

        // Populate client reference
        await store.populate('id_client', 'nom prenom email');

        res.status(200).json({
            success: true,
            message: "Store updated successfully",
            data: store
        });

    } catch (error) {
        console.error("Error updating store:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

// @desc    Get client wallet information
// @route   GET /api/profile/client/:id/wallet
// @access  Private (Client only)
const getClientWallet = asyncHandler(async (req, res) => {
    try {
        const clientId = req.params.id || req.user.id;

        // Get store
        const store = await Store.findOne({ id_client: clientId });
        if (!store) {
            return res.status(404).json({
                success: false,
                message: "Store not found for this client"
            });
        }

        // Get wallet
        const wallet = await Wallet.findOne({ store: store._id });
        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: "Wallet not found for this store"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                wallet,
                store: {
                    id: store._id,
                    storeName: store.storeName,
                    solde: store.solde
                }
            }
        });

    } catch (error) {
        console.error("Error fetching wallet:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

// @desc    Get client payment methods
// @route   GET /api/profile/client/:id/payments
// @access  Private (Client only)
const getClientPayments = asyncHandler(async (req, res) => {
    try {
        const clientId = req.params.id || req.user.id;

        const paymentMethods = await Payement.find({ clientId })
            .populate('idBank', 'nom description');

        res.status(200).json({
            success: true,
            data: paymentMethods
        });

    } catch (error) {
        console.error("Error fetching payment methods:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

// @desc    Add new payment method
// @route   POST /api/profile/client/:id/payments
// @access  Private (Client only)
const addPaymentMethod = asyncHandler(async (req, res) => {
    try {
        const clientId = req.params.id || req.user.id;
        const paymentData = req.body;

        // Validate payment data
        const { error } = updatePaymentSchema.validate(paymentData);
        if (error) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: error.details.map(detail => detail.message)
            });
        }

        // If this is set as default, unset other defaults
        if (paymentData.default) {
            await Payement.updateMany(
                { clientId, default: true },
                { default: false }
            );
        }

        // Create new payment method
        const newPayment = new Payement({
            clientId,
            ...paymentData
        });

        await newPayment.save();

        // Populate bank information
        await newPayment.populate('idBank', 'nom description');

        res.status(201).json({
            success: true,
            message: "Payment method added successfully",
            data: newPayment
        });

    } catch (error) {
        console.error("Error adding payment method:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

// @desc    Update payment method
// @route   PUT /api/profile/client/:id/payments/:paymentId
// @access  Private (Client only)
const updatePaymentMethod = asyncHandler(async (req, res) => {
    try {
        const { paymentId } = req.params;
        const updateData = req.body;

        // Validate update data
        const { error } = updatePaymentSchema.validate(updateData);
        if (error) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: error.details.map(detail => detail.message)
            });
        }

        // If this is set as default, unset other defaults for the same client
        if (updateData.default) {
            const payment = await Payement.findById(paymentId);
            if (payment) {
                await Payement.updateMany(
                    { clientId: payment.clientId, default: true },
                    { default: false }
                );
            }
        }

        // Update payment method
        const updatedPayment = await Payement.findByIdAndUpdate(
            paymentId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('idBank', 'nom description');

        if (!updatedPayment) {
            return res.status(404).json({
                success: false,
                message: "Payment method not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Payment method updated successfully",
            data: updatedPayment
        });

    } catch (error) {
        console.error("Error updating payment method:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

// @desc    Delete payment method
// @route   DELETE /api/profile/client/:id/payments/:paymentId
// @access  Private (Client only)
const deletePaymentMethod = asyncHandler(async (req, res) => {
    try {
        const { paymentId } = req.params;

        const deletedPayment = await Payement.findByIdAndDelete(paymentId);

        if (!deletedPayment) {
            return res.status(404).json({
                success: false,
                message: "Payment method not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Payment method deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting payment method:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

// @desc    Get client statistics and summary
// @route   GET /api/profile/client/:id/stats
// @access  Private (Client only)
const getClientStats = asyncHandler(async (req, res) => {
    try {
        const clientId = req.params.id || req.user.id;

        // Get client data
        const client = await Client.findById(clientId).select('number_colis start_date');
        
        // Get store data
        const store = await Store.findOne({ id_client: clientId });
        
        // Get wallet data
        let wallet = null;
        if (store) {
            wallet = await Wallet.findOne({ store: store._id });
        }

        // Get payment methods count
        const paymentMethodsCount = await Payement.countDocuments({ clientId });

        // Calculate statistics
        const stats = {
            totalColis: client?.number_colis || 0,
            memberSince: client?.start_date || 'N/A',
            storeCount: store ? 1 : 0,
            walletBalance: wallet ? wallet.solde : 0,
            paymentMethodsCount,
            isStoreActive: store ? store.default : false,
            autoDR: store ? store.auto_DR : false
        };

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error("Error fetching client stats:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

// @desc    Update livreur profile information
// @route   PUT /api/profile/livreur/:id
// @access  Private (Livreur only)
const updateLivreurProfile = asyncHandler(async (req, res) => {
    try {
        const livreurId = req.params.id || req.user.id;
        const updateData = req.body;

       
        // Check if email is being updated and if it's already taken
        if (updateData.email) {
            const existingLivreur = await Livreur.findOne({ 
                email: updateData.email, 
                _id: { $ne: livreurId } 
            });
            if (existingLivreur) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists"
                });
            }
        }

        // Update livreur profile
        const updatedLivreur = await Livreur.findByIdAndUpdate(
            livreurId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedLivreur) {
            return res.status(404).json({
                success: false,
                message: "Livreur not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Livreur profile updated successfully",
            data: updatedLivreur
        });

    } catch (error) {
        console.error("Error updating livreur profile:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

// @desc    Update livreur password
// @route   PUT /api/profile/livreur/:id/password
// @access  Private (Livreur only)
const updateLivreurPassword = asyncHandler(async (req, res) => {
    try {
        const livreurId = req.params.id || req.user.id;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validate password data
        const { error } = updatePasswordSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: error.details.map(detail => detail.message)
            });
        }

        // Get livreur with password
        const livreur = await Livreur.findById(livreurId);
        if (!livreur) {
            return res.status(404).json({
                success: false,
                message: "Livreur not found"
            });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, livreur.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        livreur.password = hashedPassword;
        await livreur.save();

        res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (error) {
        console.error("Error updating livreur password:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

// @desc    Get complete livreur profile data with statistics
// @route   GET /api/profile/livreur/:id
// @access  Private (Livreur only)
const getLivreurProfile = asyncHandler(async (req, res) => {
    try {
        const livreurId = req.params.id || req.user.id;
        
        // Get livreur data
        const livreur = await Livreur.findById(livreurId)
            .select('-password')
            .populate('file', 'url publicId');
        
        if (!livreur) {
            return res.status(404).json({ 
                success: false,
                message: "Livreur not found" 
            });
        }

        // Get statistics for colis delivered and not delivered
        const colisLivreCount = await Colis.countDocuments({ 
            livreur: livreurId, 
            statut: "Livrée" 
        });
        
        const colisNonLivreCount = await Colis.countDocuments({ 
            livreur: livreurId, 
            statut: { $ne: "Livrée" } 
        });

        // Get recent colis assigned to this livreur
        const recentColis = await Colis.find({ livreur: livreurId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('ville', 'nom')
            .populate('store', 'storeName')
            .select('code_suivi nom tele ville statut prix createdAt');

        const stats = {
            colisLivre: colisLivreCount,
            colisNonLivre: colisNonLivreCount,
            totalColis: colisLivreCount + colisNonLivreCount,
            deliveryRate: colisLivreCount + colisNonLivreCount > 0 ? 
                ((colisLivreCount / (colisLivreCount + colisNonLivreCount)) * 100).toFixed(2) : 0
        };

        res.status(200).json({
            success: true,
            data: {
                livreur,
                stats,
                recentColis
            }
        });

    } catch (error) {
        console.error("Error fetching livreur profile:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error",
            error: error.message 
        });
    }
});


module.exports = {
    getClientProfile,
    updateClientProfile,
    updateClientPassword,
    updateClientStore,
    getClientWallet,
    getClientPayments,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    getClientStats,
    getLivreurProfile,
    updateLivreurProfile,
    updateLivreurPassword,
    // Self-serve: generate API secret (client)
    generateClientApiSecret: asyncHandler(async (req, res) => {
        const clientId = req.params.id || req.user?.id;
        const client = await Client.findById(clientId).select('+apiSecretHash');
        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }
        
        const raw = generateRawSecret(); // 32 bytes -> 64 hex chars
        const hash = await hashSecret(raw);
        client.apiSecretHash = hash;
        // Persist as pending verification; clear activation timestamp
        client.status = 'pending_verification';
        client.activatedAt = null;
        client.revokedAt = null;
        client.expiresAt = null;
        await client.save();
        // One-time: prevent caching
        res.set('Cache-Control', 'no-store');
        return res.status(201).json({
            success: true,
            message: 'API secret generated. Store it securely; it will not be shown again.',
            data: {
                keyId: client.keyId,
                apiKey: client.apiKey,
                status: client.status,
                secret: raw,
                fingerprint: fingerprintOf(raw)
            }
        });
    }),
    // Self-serve: generate API secret (livreur)
    generateLivreurApiSecret: asyncHandler(async (req, res) => {
        const livreurId = req.params.id || req.user?.id;
        const livreur = await Livreur.findById(livreurId).select('+apiSecretHash');
        if (!livreur) {
            return res.status(404).json({ success: false, message: 'Livreur not found' });
        }
        const raw = generateRawSecret(); // 32 bytes -> 64 hex chars
        const hash = await hashSecret(raw);
        livreur.apiSecretHash = hash;
        // Persist as pending verification; clear activation timestamp
        livreur.status = 'pending_verification';
        livreur.activatedAt = null;
        livreur.revokedAt = null;
        livreur.expiresAt = null;
        await livreur.save();
        // One-time: prevent caching
        res.set('Cache-Control', 'no-store');
        return res.status(201).json({
            success: true,
            message: 'API secret generated. Store it securely; it will not be shown again.',
            data: {
                keyId: livreur.keyId,
                apiKey: livreur.apiKey,
                status: livreur.status,
                secret: raw,
                fingerprint: fingerprintOf(raw)
            }
        });
    }),
    // Self-serve: rotate API secret (client)
    rotateClientApiSecret: asyncHandler(async (req, res) => {
        const clientId = req.params.id || req.user?.id;
        const client = await Client.findById(clientId).select('+apiSecretHash');
        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }
        const hasSecret = !!client.apiSecretHash;
        if (!hasSecret) {
            return res.status(400).json({ success: false, message: 'No existing secret to rotate' });
        }
        // Revoke current
        client.status = 'revoked';
        client.revokedAt = new Date();
        // Generate new
        const raw = generateRawSecret();
        const hash = await hashSecret(raw);
        client.apiSecretHash = hash;
        client.status = 'pending_verification';
        client.activatedAt = null;
        client.expiresAt = null;
        // lastUsedAt intentionally unchanged
        await client.save();
        res.set('Cache-Control', 'no-store');
        return res.status(201).json({
            success: true,
            message: 'API secret rotated. Store it securely; it will not be shown again.',
            data: {
                keyId: client.keyId,
                apiKey: client.apiKey,
                status: client.status,
                secret: raw,
                fingerprint: fingerprintOf(raw)
            }
        });
    }),
    // Self-serve: rotate API secret (livreur)
    rotateLivreurApiSecret: asyncHandler(async (req, res) => {
        const livreurId = req.params.id || req.user?.id;
        const livreur = await Livreur.findById(livreurId).select('+apiSecretHash');
        if (!livreur) {
            return res.status(404).json({ success: false, message: 'Livreur not found' });
        }
        const hasSecret = !!livreur.apiSecretHash;
        if (!hasSecret) {
            return res.status(400).json({ success: false, message: 'No existing secret to rotate' });
        }
        // Revoke current
        livreur.status = 'revoked';
        livreur.revokedAt = new Date();
        // Generate new
        const raw = generateRawSecret();
        const hash = await hashSecret(raw);
        livreur.apiSecretHash = hash;
        livreur.status = 'pending_verification';
        livreur.activatedAt = null;
        livreur.expiresAt = null;
        await livreur.save();
        res.set('Cache-Control', 'no-store');
        return res.status(201).json({
            success: true,
            message: 'API secret rotated. Store it securely; it will not be shown again.',
            data: {
                keyId: livreur.keyId,
                apiKey: livreur.apiKey,
                status: livreur.status,
                secret: raw,
                fingerprint: fingerprintOf(raw)
            }
        });
    }),
    // Self-serve: revoke (delete) API secret (client)
    revokeClientApiSecret: asyncHandler(async (req, res) => {
        const clientId = req.params.id || req.user?.id;
        const client = await Client.findById(clientId).select('+apiSecretHash');
        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }
        if (!client.apiSecretHash) {
            return res.status(400).json({ success: false, message: 'No secret to revoke' });
        }
        client.status = 'revoked';
        client.revokedAt = new Date();
        client.apiSecretHash = undefined; // clear stored hash
        // Keep lastUsedAt unchanged; do not set Cache-Control (no secret in response)
        await client.save();
        return res.status(200).json({ success: true, message: 'API secret revoked. You can now generate a new one.' });
    }),
    // Self-serve: revoke (delete) API secret (livreur)
    revokeLivreurApiSecret: asyncHandler(async (req, res) => {
        const livreurId = req.params.id || req.user?.id;
        const livreur = await Livreur.findById(livreurId).select('+apiSecretHash');
        if (!livreur) {
            return res.status(404).json({ success: false, message: 'Livreur not found' });
        }
        if (!livreur.apiSecretHash) {
            return res.status(400).json({ success: false, message: 'No secret to revoke' });
        }
        livreur.status = 'revoked';
        livreur.revokedAt = new Date();
        livreur.apiSecretHash = undefined; // clear stored hash
        await livreur.save();
        return res.status(200).json({ success: true, message: 'API secret revoked. You can now generate a new one.' });
    }),
    // admin
    getAdminProfile: asyncHandler(async (req, res) => {
        try {
            const adminId = req.params.id || req.user?.id;
            const admin = await Admin.findById(adminId).select('-password');
            if (!admin) {
                return res.status(404).json({ success: false, message: "Admin not found" });
            }
            // Keep shape similar to other profiles
            res.status(200).json({
                success: true,
                data: { admin }
            });
        } catch (error) {
            console.error("Error fetching admin profile:", error);
            res.status(500).json({ success: false, message: "Internal server error", error: error.message });
        }
    }),
    updateAdminProfile: asyncHandler(async (req, res) => {
        try {
            const adminId = req.params.id || req.user?.id;
            const updateData = req.body;
            // email uniqueness
            if (updateData.email) {
                const existing = await Admin.findOne({ email: updateData.email, _id: { $ne: adminId } });
                if (existing) {
                    return res.status(400).json({ success: false, message: "Email already exists" });
                }
            }
            const updated = await Admin.findByIdAndUpdate(
                adminId,
                { $set: updateData },
                { new: true, runValidators: true }
            ).select('-password');
            if (!updated) {
                return res.status(404).json({ success: false, message: "Admin not found" });
            }
            res.status(200).json({ success: true, message: "Admin profile updated successfully", data: updated });
        } catch (error) {
            console.error("Error updating admin profile:", error);
            res.status(500).json({ success: false, message: "Internal server error", error: error.message });
        }
    }),
    updateAdminPassword: asyncHandler(async (req, res) => {
        try {
            const adminId = req.params.id || req.user?.id;
            const { currentPassword, newPassword } = req.body;
            const { error } = updatePasswordSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ success: false, message: "Validation error", errors: error.details.map(d => d.message) });
            }
            const admin = await Admin.findById(adminId);
            if (!admin) {
                return res.status(404).json({ success: false, message: "Admin not found" });
            }
            const isValid = await bcrypt.compare(currentPassword, admin.password);
            if (!isValid) {
                return res.status(400).json({ success: false, message: "Current password is incorrect" });
            }
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(newPassword, salt);
            await admin.save();
            res.status(200).json({ success: true, message: "Password updated successfully" });
        } catch (error) {
            console.error("Error updating admin password:", error);
            res.status(500).json({ success: false, message: "Internal server error", error: error.message });
        }
    })
};
