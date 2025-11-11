const { 
    deductStockForDeliveredColis,
    releaseStockForCancelledColis,
    returnStockFromColis
} = require("./stockHelper");

/**
 * ============================================================
 * COLIS STATUS CHANGE - STOCK INTEGRATION
 * Automatically handles stock based on status changes
 * ============================================================
 */

/**
 * @desc    Handle stock operations when colis status changes
 * @param   {Object} colis - Colis object
 * @param   {String} oldStatus - Previous status
 * @param   {String} newStatus - New status
 * @param   {ObjectId} userId - User who made the change
 * @param   {String} userRole - User role
 * @param   {Session} session - MongoDB session
 */
async function handleStockOnStatusChange(colis, oldStatus, newStatus, userId, userRole, session) {
    // Check if colis uses stock
    const usesStock = colis.is_simple === false && 
                      colis.produits && 
                      colis.produits.some(p => p.usesStock === true);
    
    if (!usesStock) {
        return; // No stock operations needed
    }

    try {
        // CASE 1: Colis delivered → Deduct stock
        if (newStatus === "Livrée" && oldStatus !== "Livrée") {
            console.log(`[Stock] Deducting stock for delivered colis: ${colis.code_suivi}`);
            await deductStockForDeliveredColis(colis, userId, userRole, session);
        }

        // CASE 2: Colis cancelled or refused → Release stock reservation
        if ((newStatus === "Annulée" || newStatus === "Refusée") && 
            (oldStatus !== "Annulée" && oldStatus !== "Refusée")) {
            console.log(`[Stock] Releasing stock for ${newStatus.toLowerCase()} colis: ${colis.code_suivi}`);
            await releaseStockForCancelledColis(colis, userId, userRole, session);
        }

        // CASE 3: Colis returned → Return stock to available
        if (newStatus === "En Retour" && oldStatus !== "En Retour") {
            console.log(`[Stock] Returning stock from colis: ${colis.code_suivi}`);
            await returnStockFromColis(colis, userId, userRole, session);
        }

        // Save colis with updated stock info
        await colis.save({ session });

    } catch (stockError) {
        console.error(`[Stock] Error handling stock for colis ${colis.code_suivi}:`, stockError);
        // Don't throw error - log it and continue
        // Stock operations shouldn't block status changes
        // Admin can manually adjust stock if needed
    }
}

/**
 * @desc    Wrapper function to use in status update controllers
 * @usage   Add this after updating colis.statut in your controller
 */
async function updateColisStatusWithStock(colis, newStatus, userId, userRole, session) {
    const oldStatus = colis.statut;
    
    // Update status
    colis.statut = newStatus;
    
    // Handle stock based on status change
    await handleStockOnStatusChange(colis, oldStatus, newStatus, userId, userRole, session);
    
    return colis;
}

module.exports = {
    handleStockOnStatusChange,
    updateColisStatusWithStock
};

