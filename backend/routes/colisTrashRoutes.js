const express = require('express');
const router = express.Router();
const {
    moveColisToTrash,
    batchMoveColisToTrash,
    getTrashedColis,
    restoreColisFromTrash,
    batchRestoreColisFromTrash,
    permanentlyDeleteColis,
    batchPermanentlyDeleteColis,
    emptyTrash,
    getTrashStatistics
} = require('../Controllers/colisTrashController');
const { verifyTokenAndAdmin } = require('../Middlewares/VerifyToken');

// All trash routes are admin-only

// Get all trashed colis
router.get('/', verifyTokenAndAdmin, getTrashedColis);

// Get trash statistics
router.get('/statistics', verifyTokenAndAdmin, getTrashStatistics);

// Move colis to trash (single)
router.put('/:id', verifyTokenAndAdmin, moveColisToTrash);

// Batch move to trash
router.put('/batch/move', verifyTokenAndAdmin, batchMoveColisToTrash);

// Restore colis from trash (single)
router.put('/restore/:id', verifyTokenAndAdmin, restoreColisFromTrash);

// Batch restore from trash
router.put('/batch/restore', verifyTokenAndAdmin, batchRestoreColisFromTrash);

// Permanently delete colis (single)
router.delete('/:id', verifyTokenAndAdmin, permanentlyDeleteColis);

// Batch permanently delete
router.delete('/batch/delete', verifyTokenAndAdmin, batchPermanentlyDeleteColis);

// Empty entire trash
router.delete('/empty/all', verifyTokenAndAdmin, emptyTrash);

module.exports = router;

