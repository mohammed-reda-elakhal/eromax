const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { Reclamation } = require('../Models/Reclamation');
const { Colis } = require('../Models/Colis');
const { Store } = require('../Models/Store');
const { Client } = require('../Models/Client');

/**
 * Get reclamations with role-based access control
 * - Admin/Team: Get all reclamations with optional filtering
 * - Client: Get only their own reclamations
 * @route GET /api/reclamation
 * @access Private
 */
const getReclamations = async (req, res) => {
    try {
        const { status, closed } = req.query;
        const query = {};

        // Apply filters if provided
        if (status) {
            query.status = status;
        }

        if (closed !== undefined) {
            query.closed = closed === 'true';
        }

        // Role-based access control
        // If user is a client, only return their reclamations
        if (req.user.role === 'client' && req.user.store) {
            query.store = req.user.store;
        }
        // If user is not admin or team, they shouldn't see any reclamations
        else if (!['admin', 'team'].includes(req.user.role)) {
            return res.status(403).json({ message: 'You do not have permission to view reclamations' });
        }
        // Admin and team users can see all reclamations (no additional filter)

        const reclamations = await Reclamation.find(query)
            .populate({
                path: 'store',
                select: 'storeName tele',
                populate: {
                    path: 'id_client',
                    model: 'Client',
                    select: 'nom tele'
                }
            })
            .populate({
                path: 'colis',
                select: 'code_suivi ville prix statut',
                populate: {
                    path: 'ville',
                    model: 'Ville',
                    select: 'nom tarif'
                }
            })
            // No need to populate messages since sender info is stored directly in the message
            .populate('messages')
            .sort({ updatedAt: -1 });

        res.status(200).json(reclamations);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve reclamations', error: error.message });
    }
};

/**
 * Get a specific reclamation by ID with role-based access control
 * - Admin/Team: Can view any reclamation
 * - Client: Can only view their own reclamations
 * @route GET /api/reclamation/:id
 * @access Private
 */
const getReclamationById = async (req, res) => {
    try {
        const reclamation = await Reclamation.findById(req.params.id)
            .populate({
                path: 'store',
                select: 'storeName tele',
                populate: {
                    path: 'id_client',
                    model: 'Client',
                    select: 'nom tele'
                }
            })
            .populate({
                path: 'colis',
                select: 'code_suivi ville prix statut',
                populate: {
                    path: 'ville',
                    model: 'Ville',
                    select: 'nom tarif'
                }
            })
            // No need to populate messages since sender info is stored directly in the message
            .populate('messages')
            // Include status history
            .select('+statusHistory');

        if (!reclamation) {
            return res.status(404).json({ message: 'Reclamation not found' });
        }

        // Role-based access control
        // Clients can only view their own reclamations
        if (req.user.role === 'client' && req.user.store) {
            if (reclamation.store._id.toString() !== req.user.store) {
                return res.status(403).json({ message: 'You do not have permission to view this reclamation' });
            }
        }
        // If user is not admin or team, they shouldn't see any reclamations
        else if (!['admin', 'team'].includes(req.user.role)) {
            return res.status(403).json({ message: 'You do not have permission to view reclamations' });
        }

        res.status(200).json(reclamation);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve reclamation', error: error.message });
    }
};

/**
 * Create a new reclamation
 * @route POST /api/reclamation
 * @access Private - Client only
 */
const createReclamation = asyncHandler(async (req, res) => {
    const { colisId, code_suivi, initialMessage } = req.body;

    // Get store ID from authenticated user token
    // This assumes the client user has a store property in their token
    if (req.user.role !== 'client' || !req.user.store) {
        return res.status(403).json({ message: 'Only store clients can create reclamations' });
    }

    const storeId = req.user.store;

    // Check for required fields - either colisId or code_suivi must be provided
    if (!colisId && !code_suivi) {
        return res.status(400).json({ message: 'Either Colis ID or Code Suivi is required.' });
    }

    // Find the colis by ID or code_suivi
    let colis;
    if (colisId) {
        colis = await Colis.findById(colisId);
    } else {
        colis = await Colis.findOne({ code_suivi: code_suivi });
    }

    if (!colis) {
        return res.status(400).json({ message: 'The specified colis does not exist.' });
    }

    // Check if the colis belongs to the store
    if (colis.store.toString() !== storeId) {
        return res.status(403).json({ message: 'The selected colis does not belong to your store.' });
    }

    // Check if any reclamations exist for this colis
    const existingReclamations = await Reclamation.find({ colis: colis._id });

    if (existingReclamations.length > 0) {
        // Check if all existing reclamations are closed
        const allClosed = existingReclamations.every(rec => rec.closed === true);

        if (!allClosed) {
            // Find the first open reclamation to reference in the error message
            const openReclamation = existingReclamations.find(rec => rec.closed === false);
            return res.status(400).json({
                message: 'An open reclamation already exists for this colis. Please wait for it to be closed before creating a new one.',
                reclamationId: openReclamation._id,
                colisCode: colis.code_suivi // Include the code_suivi for reference
            });
        }
        // If all reclamations are closed, we'll allow creating a new one
        console.log(`All ${existingReclamations.length} existing reclamations for colis ${colis.code_suivi} are closed. Creating a new one.`);
    }

    // Create a new reclamation
    const reclamation = new Reclamation({
        store: storeId,
        colis: colis._id,
        messages: [],
        status: 'open',
        closed: false
    });

    // Add initial message if provided
    if (initialMessage) {
        // Get store information to include in the message
        const store = await Store.findById(storeId).select('storeName tele id_client');
        let senderInfo = {
            storeName: store ? store.storeName : '',
            tele: store ? store.tele : ''
        };

        // If store has a client reference, get the client's name
        if (store && store.id_client) {
            try {
                const client = await Client.findById(store.id_client).select('nom');
                if (client) {
                    senderInfo.nom = client.nom;
                }
            } catch (err) {
                console.log('Error fetching client info:', err);
            }
        }

        reclamation.messages.push({
            sender: {
                senderType: 'Store',
                senderId: storeId,
                ...senderInfo
            },
            content: initialMessage,
            read: false,
            createdAt: new Date()
        });
    }

    await reclamation.save();

    // Fetch the created reclamation with populated fields
    const createdReclamation = await Reclamation.findById(reclamation._id)
        .populate({
            path: 'store',
            select: 'storeName tele',
            populate: {
                path: 'id_client',
                model: 'Client',
                select: 'nom tele'
            }
        })
        .populate({
            path: 'colis',
            select: 'code_suivi ville prix statut',
            populate: {
                path: 'ville',
                model: 'Ville',
                select: 'nom tarif'
            }
        })
        .populate({
            path: 'messages',
            populate: [{
                // For Admin and Team senders
                path: 'sender.senderId',
                refPath: 'sender.senderType',
                match: { 'sender.senderType': { $in: ['Admin', 'Team'] } },
                select: 'nom role tele'
            }, {
                // For Store senders
                path: 'sender.senderId',
                refPath: 'sender.senderType',
                match: { 'sender.senderType': 'Store' },
                select: 'storeName tele id_client',
                populate: {
                    path: 'id_client',
                    model: 'Client',
                    select: 'nom tele'
                }
            }]
        });

    res.status(201).json({
        message: "Reclamation created successfully",
        reclamation: createdReclamation
    });
});

/**
 * Get reclamations by store ID
 * @route GET /api/reclamation/store/:storeId
 * @access Private
 */
const getReclamationsByStore = asyncHandler(async (req, res) => {
    try {
        const { storeId } = req.params;
        const reclamations = await Reclamation.find({ store: storeId })
            .populate({
                path: 'store',
                select: 'storeName tele',
                populate: {
                    path: 'id_client',
                    model: 'Client',
                    select: 'nom tele'
                }
            })
            .populate({
                path: 'colis',
                select: 'code_suivi ville prix statut',
                populate: {
                    path: 'ville',
                    model: 'Ville',
                    select: 'nom tarif'
                }
            })
            // No need to populate messages since sender info is stored directly in the message
            .populate('messages')
            .sort({ updatedAt: -1 });

        res.status(200).json(reclamations);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get reclamations by store', error: error.message });
    }
});

/**
 * Get reclamations by colis ID
 * @route GET /api/reclamation/colis/:colisId
 * @access Private
 */
const getReclamationsByColis = asyncHandler(async (req, res) => {
    try {
        const { colisId } = req.params;
        const reclamations = await Reclamation.find({ colis: colisId })
            .populate({
                path: 'store',
                select: 'storeName tele',
                populate: {
                    path: 'id_client',
                    model: 'Client',
                    select: 'nom tele'
                }
            })
            .populate({
                path: 'colis',
                select: 'code_suivi ville prix statut',
                populate: {
                    path: 'ville',
                    model: 'Ville',
                    select: 'nom tarif'
                }
            })
            // No need to populate messages since sender info is stored directly in the message
            .populate('messages')
            .sort({ updatedAt: -1 });

        res.status(200).json(reclamations);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get reclamations by colis', error: error.message });
    }
});

/**
 * Add a message to a reclamation
 * @route POST /api/reclamation/:id/message
 * @access Private - Client (store) or Admin/Team
 */
const addMessage = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        let senderType, senderId;

        // Determine sender type and ID from authenticated user
        if (req.user.role === 'client' && req.user.store) {
            senderType = 'Store';
            senderId = req.user.store;
        } else if (req.user.role === 'admin') {
            senderType = 'Admin';
            senderId = req.user.id;
        } else if (req.user.role === 'team') {
            senderType = 'Team';
            senderId = req.user.id;
        } else {
            return res.status(403).json({ message: 'Unauthorized to add messages' });
        }

        // Validate content
        if (!content) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        // Find the reclamation
        const reclamation = await Reclamation.findById(id);
        if (!reclamation) {
            return res.status(404).json({ message: 'Reclamation not found' });
        }

        // For store users, verify they own the reclamation
        if (senderType === 'Store' && reclamation.store.toString() !== senderId) {
            return res.status(403).json({ message: 'You can only add messages to your own reclamations' });
        }

        // Get sender information based on type
        let senderInfo = {};

        if (senderType === 'Store') {
            const store = await Store.findById(senderId).select('storeName tele');
            if (store) {
                senderInfo = {
                    storeName: store.storeName,
                    tele: store.tele
                };
            }
        } else if (['Admin', 'Team'].includes(senderType)) {
            // For Admin/Team users, we need to get their information from the database
            // First try to get from req.user
            senderInfo = {
                nom: req.user.nom || req.user.Nom || '',
                role: req.user.role || '',
                tele: req.user.tele || req.user.Tel || ''
            };

            // If we don't have complete information, try to fetch from database
            if (!senderInfo.nom || !senderInfo.tele) {
                try {
                    // Assuming Admin users are stored in the User model
                    const admin = await mongoose.model(senderType).findById(senderId);
                    if (admin) {
                        senderInfo.nom = admin.Nom || admin.nom || '';
                        senderInfo.tele = admin.Tel || admin.tele || '';
                    }
                } catch (err) {
                    console.log('Error fetching admin info:', err);
                }
            }
        }

        // Add the message with sender information
        reclamation.messages.push({
            sender: {
                senderType,
                senderId,
                ...senderInfo
            },
            content,
            read: false,
            createdAt: new Date()
        });

        // If reclamation is closed, reopen it
        if (reclamation.closed) {
            reclamation.closed = false;
            reclamation.status = 'open';
        }

        await reclamation.save();

        // Fetch the updated reclamation with populated fields
        const updatedReclamation = await Reclamation.findById(id)
            .populate({
                path: 'store',
                select: 'storeName tele',
                populate: {
                    path: 'id_client',
                    model: 'Client',
                    select: 'nom tele'
                }
            })
            .populate({
                path: 'colis',
                select: 'code_suivi ville prix statut',
                populate: {
                    path: 'ville',
                    model: 'Ville',
                    select: 'nom tarif'
                }
            })
            .populate({
                path: 'messages',
                populate: [{
                    // For Admin and Team senders
                    path: 'sender.senderId',
                    refPath: 'sender.senderType',
                    match: { 'sender.senderType': { $in: ['Admin', 'Team'] } },
                    select: 'nom role tele'
                }, {
                    // For Store senders
                    path: 'sender.senderId',
                    refPath: 'sender.senderType',
                    match: { 'sender.senderType': 'Store' },
                    select: 'storeName tele id_client',
                    populate: {
                        path: 'id_client',
                        model: 'Client',
                        select: 'nom tele'
                    }
                }]
            });

        res.status(201).json({
            message: 'Message added successfully',
            reclamation: updatedReclamation
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add message', error: error.message });
    }
});

/**
 * Update reclamation status
 * @route PUT /api/reclamation/:id/status
 * @access Private
 */
const updateReclamationStatus = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Find the reclamation
        const reclamation = await Reclamation.findById(id);
        if (!reclamation) {
            return res.status(404).json({ message: 'Reclamation not found' });
        }

        // Validate status
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // Get user information for status history
        let updaterInfo = {
            role: req.user.role,
            id: req.user.id,
            nom: req.user.nom || req.user.Nom || '',
            tele: req.user.tele || req.user.Tel || ''
        };

        // If user info is incomplete, try to fetch from database
        if (!updaterInfo.nom || !updaterInfo.tele) {
            try {
                let userModel;
                if (req.user.role === 'admin') {
                    userModel = 'Admin';
                } else if (req.user.role === 'team') {
                    userModel = 'Team';
                } else if (req.user.role === 'client') {
                    userModel = 'Store';
                    // For client users, use store ID instead
                    updaterInfo.id = req.user.store;
                }

                if (userModel) {
                    const user = await mongoose.model(userModel).findById(updaterInfo.id);
                    if (user) {
                        updaterInfo.nom = user.nom || user.Nom || user.storeName || '';
                        updaterInfo.tele = user.tele || user.Tel || '';
                    }
                }
            } catch (err) {
                console.log('Error fetching user info for status update:', err);
            }
        }

        // Use the updateStatus method to update status and track history
        await reclamation.updateStatus(status, updaterInfo);

        // Fetch the updated reclamation with populated fields
        const updatedReclamation = await Reclamation.findById(id)
            .populate({
                path: 'store',
                select: 'storeName tele',
                populate: {
                    path: 'id_client',
                    model: 'Client',
                    select: 'nom tele'
                }
            })
            .populate({
                path: 'colis',
                select: 'code_suivi ville prix statut',
                populate: {
                    path: 'ville',
                    model: 'Ville',
                    select: 'nom tarif'
                }
            })
            // No need to populate messages since sender info is stored directly in the message
            .populate('messages')
            // Include status history
            .select('+statusHistory');

        res.status(200).json({
            message: 'Reclamation status updated successfully',
            reclamation: updatedReclamation
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update reclamation status', error: error.message });
    }
});

/**
 * Delete a reclamation
 * @route DELETE /api/reclamation/:id
 * @access Private
 */
const deleteReclamation = asyncHandler(async (req, res) => {
    try {
        const reclamation = await Reclamation.findById(req.params.id);
        if (!reclamation) {
            return res.status(404).json({ message: 'Reclamation not found' });
        }

        await reclamation.deleteOne();
        res.status(200).json({ message: "Reclamation deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete reclamation", error: error.message });
    }
});

/**
 * Mark a message as read
 * @route PUT /api/reclamation/:id/message/:messageId/read
 * @access Private
 */
const markMessageAsRead = asyncHandler(async (req, res) => {
    try {
        const { id, messageId } = req.params;

        // Find the reclamation
        const reclamation = await Reclamation.findById(id);
        if (!reclamation) {
            return res.status(404).json({ message: 'Reclamation not found' });
        }

        // Find the message
        const message = reclamation.messages.id(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Mark as read
        message.read = true;
        await reclamation.save();

        // Fetch the updated reclamation with populated fields
        const updatedReclamation = await Reclamation.findById(id)
            .populate({
                path: 'store',
                select: 'storeName tele',
                populate: {
                    path: 'id_client',
                    model: 'Client',
                    select: 'nom tele'
                }
            })
            .populate({
                path: 'colis',
                select: 'code_suivi ville prix statut',
                populate: {
                    path: 'ville',
                    model: 'Ville',
                    select: 'nom tarif'
                }
            })
            .populate({
                path: 'messages',
                populate: [{
                    // For Admin and Team senders
                    path: 'sender.senderId',
                    refPath: 'sender.senderType',
                    match: { 'sender.senderType': { $in: ['Admin', 'Team'] } },
                    select: 'nom role tele'
                }, {
                    // For Store senders
                    path: 'sender.senderId',
                    refPath: 'sender.senderType',
                    match: { 'sender.senderType': 'Store' },
                    select: 'storeName tele id_client',
                    populate: {
                        path: 'id_client',
                        model: 'Client',
                        select: 'nom tele'
                    }
                }]
            });

        res.status(200).json({
            message: 'Message marked as read',
            reclamation: updatedReclamation
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to mark message as read', error: error.message });
    }
});

/**
 * Delete a specific message from a reclamation
 * @route DELETE /api/reclamation/:id/message/:messageId
 * @access Private
 */
const deleteMessage = asyncHandler(async (req, res) => {
    try {
        const { id, messageId } = req.params;

        // Find the reclamation
        const reclamation = await Reclamation.findById(id);
        if (!reclamation) {
            return res.status(404).json({ message: 'Reclamation not found' });
        }

        // Find the message
        const message = reclamation.messages.id(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if user has permission to delete the message
        // Only the sender of the message or an admin can delete it
        if (req.user.role === 'client' && req.user.store) {
            // For store users, check if they are the sender
            if (message.sender.senderType === 'Store' &&
                message.sender.senderId.toString() !== req.user.store) {
                return res.status(403).json({
                    message: 'You can only delete your own messages'
                });
            }
        } else if (!['admin', 'team'].includes(req.user.role)) {
            // If not admin/team or the sender, deny access
            return res.status(403).json({
                message: 'You do not have permission to delete this message'
            });
        }

        // Remove the message
        message.remove();
        await reclamation.save();

        // Fetch the updated reclamation with populated fields
        const updatedReclamation = await Reclamation.findById(id)
            .populate({
                path: 'store',
                select: 'storeName tele',
                populate: {
                    path: 'id_client',
                    model: 'Client',
                    select: 'nom tele'
                }
            })
            .populate({
                path: 'colis',
                select: 'code_suivi ville prix statut',
                populate: {
                    path: 'ville',
                    model: 'Ville',
                    select: 'nom tarif'
                }
            })
            .populate('messages');

        res.status(200).json({
            message: 'Message deleted successfully',
            reclamation: updatedReclamation
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete message', error: error.message });
    }
});

/**
 * Reopen a closed reclamation
 * @route PUT /api/reclamation/:id/reopen
 * @access Private (Admin only)
 */
const reopenReclamation = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        // Find the reclamation
        const reclamation = await Reclamation.findById(id);
        if (!reclamation) {
            return res.status(404).json({ message: 'Reclamation not found' });
        }

        // Check if reclamation is closed
        if (reclamation.status !== 'closed') {
            return res.status(400).json({ message: 'Only closed reclamations can be reopened' });
        }

        // Get user information for status history
        let updaterInfo = {
            role: req.user.role,
            id: req.user.id,
            nom: req.user.nom || req.user.Nom || '',
            tele: req.user.tele || req.user.Tel || ''
        };

        // If user info is incomplete, try to fetch from database
        if (!updaterInfo.nom || !updaterInfo.tele) {
            try {
                let userModel;
                if (req.user.role === 'admin') {
                    userModel = 'Admin';
                } else if (req.user.role === 'team') {
                    userModel = 'Team';
                }

                if (userModel) {
                    const user = await mongoose.model(userModel).findById(updaterInfo.id);
                    if (user) {
                        updaterInfo.nom = user.nom || user.Nom || '';
                        updaterInfo.tele = user.tele || user.Tel || '';
                    }
                }
            } catch (err) {
                console.log('Error fetching user info for status update:', err);
            }
        }

        // Use the updateStatus method to reopen the reclamation
        await reclamation.updateStatus('in_progress', updaterInfo);

        // Fetch the updated reclamation with populated fields
        const updatedReclamation = await Reclamation.findById(id)
            .populate({
                path: 'store',
                select: 'storeName tele',
                populate: {
                    path: 'id_client',
                    model: 'Client',
                    select: 'nom tele'
                }
            })
            .populate({
                path: 'colis',
                select: 'code_suivi ville prix statut',
                populate: {
                    path: 'ville',
                    model: 'Ville',
                    select: 'nom tarif'
                }
            })
            // No need to populate messages since sender info is stored directly in the message
            .populate('messages')
            // Include status history
            .select('+statusHistory');

        res.status(200).json({
            message: 'Reclamation reopened successfully',
            reclamation: updatedReclamation
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reopen reclamation', error: error.message });
    }
});

module.exports = {
    getReclamations,
    getReclamationById,
    createReclamation,
    getReclamationsByStore,
    getReclamationsByColis,
    addMessage,
    updateReclamationStatus,
    reopenReclamation,
    deleteReclamation,
    markMessageAsRead,
    deleteMessage
}