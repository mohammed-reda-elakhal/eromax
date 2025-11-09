const asyncHandler = require("express-async-handler");
const { Colis } = require("../Models/Colis");
const mongoose = require("mongoose");

/**
 * @desc    Move colis to trash (soft delete)
 * @route   PUT /api/colis/trash/:id
 * @access  Private (Admin only)
 */
const moveColisToTrash = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        // Find the colis
        const colis = await Colis.findById(id);
        
        if (!colis) {
            return res.status(404).json({ message: "Colis non trouvé" });
        }

        // Check if already trashed
        if (colis.isTrashed) {
            return res.status(400).json({ message: "Ce colis est déjà dans la corbeille" });
        }

        // Move to trash
        colis.isTrashed = true;
        colis.trashedAt = new Date();
        colis.trashedBy = req.user.id;
        
        await colis.save();

        res.status(200).json({
            message: "Colis déplacé vers la corbeille avec succès",
            colis
        });
    } catch (error) {
        console.error("Error moving colis to trash:", error);
        res.status(500).json({ message: "Erreur lors du déplacement vers la corbeille", error: error.message });
    }
});

/**
 * @desc    Batch move colis to trash
 * @route   PUT /api/colis/trash/batch
 * @access  Private (Admin only)
 */
const batchMoveColisToTrash = asyncHandler(async (req, res) => {
    try {
        const { colisIds } = req.body;

        if (!colisIds || !Array.isArray(colisIds) || colisIds.length === 0) {
            return res.status(400).json({ message: "Veuillez fournir un tableau d'IDs de colis" });
        }

        // Update multiple colis at once
        const result = await Colis.updateMany(
            { _id: { $in: colisIds }, isTrashed: false },
            { 
                $set: { 
                    isTrashed: true, 
                    trashedAt: new Date(),
                    trashedBy: req.user.id
                } 
            }
        );

        res.status(200).json({
            message: `${result.modifiedCount} colis déplacés vers la corbeille`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error("Error batch moving colis to trash:", error);
        res.status(500).json({ message: "Erreur lors du déplacement en masse", error: error.message });
    }
});

/**
 * @desc    Get all trashed colis
 * @route   GET /api/colis/trash
 * @access  Private (Admin only)
 */
const getTrashedColis = asyncHandler(async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            ville, 
            store, 
            livreur, 
            statut,
            code_suivi,
            tele,
            dateFrom,
            dateTo
        } = req.query;

        // Build query
        const query = { isTrashed: true };

        if (ville) query.ville = ville;
        if (store) query.store = store;
        if (livreur) query.livreur = livreur;
        if (statut) query.statut = statut;
        if (code_suivi) {
            query.code_suivi = { $regex: code_suivi, $options: 'i' };
        }
        if (tele) {
            query.tele = { $regex: tele, $options: 'i' };
        }

        // Date range filter
        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
            if (dateTo) query.createdAt.$lte = new Date(dateTo);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get trashed colis with pagination
        const trashedColis = await Colis.find(query)
            .populate('ville', 'nom region')
            .populate('store', 'storeName tele adress')
            .populate('livreur', 'nom tele villes')
            .populate('trashedBy', 'nom prenom email')
            .sort({ trashedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Colis.countDocuments(query);

        res.status(200).json({
            colis: trashedColis,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error("Error fetching trashed colis:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des colis supprimés", error: error.message });
    }
});

/**
 * @desc    Restore colis from trash
 * @route   PUT /api/colis/trash/restore/:id
 * @access  Private (Admin only)
 */
const restoreColisFromTrash = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        // Find the colis
        const colis = await Colis.findById(id);
        
        if (!colis) {
            return res.status(404).json({ message: "Colis non trouvé" });
        }

        // Check if it's in trash
        if (!colis.isTrashed) {
            return res.status(400).json({ message: "Ce colis n'est pas dans la corbeille" });
        }

        // Restore from trash
        colis.isTrashed = false;
        colis.trashedAt = null;
        colis.trashedBy = null;
        
        await colis.save();

        res.status(200).json({
            message: "Colis restauré avec succès",
            colis
        });
    } catch (error) {
        console.error("Error restoring colis:", error);
        res.status(500).json({ message: "Erreur lors de la restauration", error: error.message });
    }
});

/**
 * @desc    Batch restore colis from trash
 * @route   PUT /api/colis/trash/restore/batch
 * @access  Private (Admin only)
 */
const batchRestoreColisFromTrash = asyncHandler(async (req, res) => {
    try {
        const { colisIds } = req.body;

        if (!colisIds || !Array.isArray(colisIds) || colisIds.length === 0) {
            return res.status(400).json({ message: "Veuillez fournir un tableau d'IDs de colis" });
        }

        // Update multiple colis at once
        const result = await Colis.updateMany(
            { _id: { $in: colisIds }, isTrashed: true },
            { 
                $set: { 
                    isTrashed: false, 
                    trashedAt: null,
                    trashedBy: null
                } 
            }
        );

        res.status(200).json({
            message: `${result.modifiedCount} colis restaurés`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error("Error batch restoring colis:", error);
        res.status(500).json({ message: "Erreur lors de la restauration en masse", error: error.message });
    }
});

/**
 * @desc    Permanently delete colis from trash
 * @route   DELETE /api/colis/trash/:id
 * @access  Private (Admin only)
 */
const permanentlyDeleteColis = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        // Find the colis
        const colis = await Colis.findById(id);
        
        if (!colis) {
            return res.status(404).json({ message: "Colis non trouvé" });
        }

        // Check if it's in trash
        if (!colis.isTrashed) {
            return res.status(400).json({ message: "Le colis doit être dans la corbeille avant suppression définitive" });
        }

        // Permanently delete
        await Colis.findByIdAndDelete(id);

        res.status(200).json({
            message: "Colis supprimé définitivement",
            code_suivi: colis.code_suivi
        });
    } catch (error) {
        console.error("Error permanently deleting colis:", error);
        res.status(500).json({ message: "Erreur lors de la suppression définitive", error: error.message });
    }
});

/**
 * @desc    Batch permanently delete colis from trash
 * @route   DELETE /api/colis/trash/batch
 * @access  Private (Admin only)
 */
const batchPermanentlyDeleteColis = asyncHandler(async (req, res) => {
    try {
        const { colisIds } = req.body;

        if (!colisIds || !Array.isArray(colisIds) || colisIds.length === 0) {
            return res.status(400).json({ message: "Veuillez fournir un tableau d'IDs de colis" });
        }

        // Delete multiple colis that are in trash
        const result = await Colis.deleteMany({
            _id: { $in: colisIds },
            isTrashed: true
        });

        res.status(200).json({
            message: `${result.deletedCount} colis supprimés définitivement`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error("Error batch permanently deleting colis:", error);
        res.status(500).json({ message: "Erreur lors de la suppression en masse", error: error.message });
    }
});

/**
 * @desc    Empty trash (delete all trashed colis)
 * @route   DELETE /api/colis/trash/empty
 * @access  Private (Admin only)
 */
const emptyTrash = asyncHandler(async (req, res) => {
    try {
        // Delete all trashed colis
        const result = await Colis.deleteMany({ isTrashed: true });

        res.status(200).json({
            message: "Corbeille vidée avec succès",
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error("Error emptying trash:", error);
        res.status(500).json({ message: "Erreur lors du vidage de la corbeille", error: error.message });
    }
});

/**
 * @desc    Get trash statistics
 * @route   GET /api/colis/trash/statistics
 * @access  Private (Admin only)
 */
const getTrashStatistics = asyncHandler(async (req, res) => {
    try {
        const totalTrashed = await Colis.countDocuments({ isTrashed: true });
        
        // Get trash by status
        const byStatus = await Colis.aggregate([
            { $match: { isTrashed: true } },
            { $group: { _id: "$statut", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Get recent trashed (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentTrashed = await Colis.countDocuments({
            isTrashed: true,
            trashedAt: { $gte: sevenDaysAgo }
        });

        res.status(200).json({
            totalTrashed,
            byStatus,
            recentTrashed
        });
    } catch (error) {
        console.error("Error getting trash statistics:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des statistiques", error: error.message });
    }
});

module.exports = {
    moveColisToTrash,
    batchMoveColisToTrash,
    getTrashedColis,
    restoreColisFromTrash,
    batchRestoreColisFromTrash,
    permanentlyDeleteColis,
    batchPermanentlyDeleteColis,
    emptyTrash,
    getTrashStatistics
};

