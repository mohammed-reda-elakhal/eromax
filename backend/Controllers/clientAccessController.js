const asyncHandler = require("express-async-handler");
const { Client } = require("../Models/Client");
const { Store } = require("../Models/Store");

/**
 * @desc    Get current client's features and access
 * @route   GET /api/client/my-access
 * @access  Private (Client or Team)
 */
const getMyAccess = asyncHandler(async (req, res) => {
    try {
        console.log('[Get My Access] User:', req.user);
        
        let clientId;
        
        // If user is client
        if (req.user.role === 'client') {
            clientId = req.user.id;
        } 
        // If user is team member
        else if (req.user.role === 'team') {
            const store = await Store.findById(req.user.store);
            if (!store) {
                return res.status(404).json({ 
                    success: false,
                    message: "Store not found" 
                });
            }
            clientId = store.id_client;
        }
        // Other roles don't have access features
        else {
            return res.status(200).json({
                success: true,
                features_access: {},
                stock_config: {}
            });
        }
        
        const client = await Client.findById(clientId)
            .select('features_access stock_config nom prenom email')
            .lean();

        if (!client) {
            return res.status(404).json({ 
                success: false,
                message: "Client not found" 
            });
        }

        console.log('[Get My Access] Returning:', {
            features_access: client.features_access,
            stock_config: client.stock_config
        });

        res.status(200).json({
            success: true,
            features_access: client.features_access || {},
            stock_config: client.stock_config || {},
            user: {
                nom: client.nom,
                prenom: client.prenom,
                email: client.email
            }
        });

    } catch (error) {
        console.error("[Get My Access] Error:", error);
        res.status(500).json({ 
            success: false,
            message: "Error fetching access information",
            error: error.message 
        });
    }
});

module.exports = {
    getMyAccess
};

