import { toast } from "react-toastify";
import request from "../../utils/request";
import { stockActions } from "../slices/stockSlice";

/**
 * ============================================================
 * STOCK MANAGEMENT API CALLS
 * ============================================================
 */

// ============ CLIENT API CALLS ============

// Create stock (pending approval)
export function createStock(stockData) {
    return async (dispatch) => {
        try {
            console.log('[Create Stock API] Sending:', stockData);
            
            dispatch(stockActions.setLoading(true));
            const { data } = await request.post("/api/stock/create", stockData);
            
            console.log('[Create Stock API] Response:', data);
            
            dispatch(stockActions.setLoading(false));
            toast.success("Stock créé avec succès! En attente d'approbation.");
            return data;
        } catch (error) {
            console.error('[Create Stock API] Error:', error);
            console.error('[Create Stock API] Error data:', error?.response?.data);
            
            dispatch(stockActions.setLoading(false));
            toast.error(error?.response?.data?.message || "Erreur lors de la création du stock");
            throw error;
        }
    };
}

// Get my stocks
export function getMyStocks(params = {}) {
    return async (dispatch) => {
        try {
            dispatch(stockActions.setLoading(true));
            const queryString = new URLSearchParams(params).toString();
            const { data } = await request.get(`/api/stock/my-stocks?${queryString}`);
            dispatch(stockActions.setMyStocks(data));
            dispatch(stockActions.setLoading(false));
            return data;
        } catch (error) {
            dispatch(stockActions.setLoading(false));
            toast.error(error?.response?.data?.message || "Erreur lors du chargement des stocks");
            throw error;
        }
    };
}

// Get available stocks for colis
export function getAvailableStocks(storeId, search = "") {
    return async (dispatch) => {
        try {
            const { data } = await request.get(
                `/api/stock/available-for-colis?storeId=${storeId}&search=${search}`
            );
            dispatch(stockActions.setAvailableStocks(data.stocks));
            return data.stocks;
        } catch (error) {
            toast.error("Erreur lors du chargement des stocks disponibles");
            throw error;
        }
    };
}

// Get stock detail
export function getStockDetail(stockId) {
    return async (dispatch) => {
        try {
            console.log('[Stock API] Fetching stock detail for ID:', stockId);
            dispatch(stockActions.setLoading(true));
            const { data } = await request.get(`/api/stock/${stockId}`);
            console.log('[Stock API] Stock detail received:', data);
            dispatch(stockActions.setCurrentStock(data));
            dispatch(stockActions.setLoading(false));
            return data;
        } catch (error) {
            console.error('[Stock API] Error fetching stock detail:', error);
            console.error('[Stock API] Error response:', error?.response?.data);
            dispatch(stockActions.setLoading(false));
            toast.error(error?.response?.data?.message || "Erreur lors du chargement du stock");
            throw error;
        }
    };
}

// Get stock movements
export function getStockMovements(params = {}) {
    return async (dispatch) => {
        try {
            dispatch(stockActions.setLoading(true));
            const queryString = new URLSearchParams(params).toString();
            const { data } = await request.get(`/api/stock/my-movements?${queryString}`);
            dispatch(stockActions.setMovements(data));
            dispatch(stockActions.setLoading(false));
            return data;
        } catch (error) {
            dispatch(stockActions.setLoading(false));
            toast.error("Erreur lors du chargement de l'historique");
            throw error;
        }
    };
}

// Update stock info
export function updateStockInfo(stockId, updateData) {
    return async (dispatch) => {
        try {
            dispatch(stockActions.setLoading(true));
            const { data } = await request.put(`/api/stock/${stockId}/info`, updateData);
            dispatch(stockActions.setLoading(false));
            toast.success("Stock mis à jour avec succès");
            return data;
        } catch (error) {
            dispatch(stockActions.setLoading(false));
            toast.error(error?.response?.data?.message || "Erreur lors de la mise à jour");
            throw error;
        }
    };
}

// Request restock
export function requestRestock(stockId, requestData) {
    return async (dispatch) => {
        try {
            const { data } = await request.post(`/api/stock/${stockId}/request-restock`, requestData);
            toast.success("Demande de réapprovisionnement envoyée à l'admin");
            return data;
        } catch (error) {
            toast.error("Erreur lors de l'envoi de la demande");
            throw error;
        }
    };
}

// ============ ADMIN API CALLS ============

// Get pending stocks
export function getPendingStocks(params = {}) {
    return async (dispatch) => {
        try {
            dispatch(stockActions.setLoading(true));
            const queryString = new URLSearchParams(params).toString();
            const { data } = await request.get(`/api/stock/admin/pending?${queryString}`);
            dispatch(stockActions.setPendingStocks(data));
            dispatch(stockActions.setLoading(false));
            return data;
        } catch (error) {
            dispatch(stockActions.setLoading(false));
            toast.error("Erreur lors du chargement des stocks en attente");
            throw error;
        }
    };
}

// Approve stock
export function approveStock(stockId, approvalData) {
    return async (dispatch) => {
        try {
            dispatch(stockActions.setLoading(true));
            const { data } = await request.post(`/api/stock/admin/${stockId}/approve`, approvalData);
            dispatch(stockActions.setLoading(false));
            toast.success("Stock approuvé avec succès");
            return data;
        } catch (error) {
            dispatch(stockActions.setLoading(false));
            toast.error(error?.response?.data?.message || "Erreur lors de l'approbation");
            throw error;
        }
    };
}

// Reject stock
export function rejectStock(stockId, rejectionData) {
    return async (dispatch) => {
        try {
            dispatch(stockActions.setLoading(true));
            const { data } = await request.post(`/api/stock/admin/${stockId}/reject`, rejectionData);
            dispatch(stockActions.setLoading(false));
            toast.success("Stock rejeté");
            return data;
        } catch (error) {
            dispatch(stockActions.setLoading(false));
            toast.error("Erreur lors du rejet");
            throw error;
        }
    };
}

// Get all stocks (admin)
export function getAllStocksAdmin(params = {}) {
    return async (dispatch) => {
        try {
            dispatch(stockActions.setLoading(true));
            const queryString = new URLSearchParams(params).toString();
            const { data } = await request.get(`/api/stock/admin/all?${queryString}`);
            dispatch(stockActions.setAllStocks(data));
            dispatch(stockActions.setLoading(false));
            return data;
        } catch (error) {
            dispatch(stockActions.setLoading(false));
            toast.error("Erreur lors du chargement des stocks");
            throw error;
        }
    };
}

// Adjust stock quantity
export function adjustStockQuantity(stockId, adjustmentData) {
    return async (dispatch) => {
        try {
            dispatch(stockActions.setLoading(true));
            const { data } = await request.post(`/api/stock/admin/${stockId}/adjust`, adjustmentData);
            dispatch(stockActions.setLoading(false));
            toast.success("Quantité ajustée avec succès");
            return data;
        } catch (error) {
            dispatch(stockActions.setLoading(false));
            toast.error(error?.response?.data?.message || "Erreur lors de l'ajustement");
            throw error;
        }
    };
}

// Create stock for client (admin)
export function createStockAdmin(stockData) {
    return async (dispatch) => {
        try {
            dispatch(stockActions.setLoading(true));
            const { data } = await request.post("/api/stock/admin/create", stockData);
            dispatch(stockActions.setLoading(false));
            toast.success("Stock créé et activé avec succès");
            return data;
        } catch (error) {
            dispatch(stockActions.setLoading(false));
            toast.error(error?.response?.data?.message || "Erreur lors de la création");
            throw error;
        }
    };
}

// Delete stock
export function deleteStock(stockId) {
    return async (dispatch) => {
        try {
            dispatch(stockActions.setLoading(true));
            const { data } = await request.delete(`/api/stock/admin/${stockId}`);
            dispatch(stockActions.setLoading(false));
            toast.success("Stock supprimé avec succès");
            return data;
        } catch (error) {
            dispatch(stockActions.setLoading(false));
            toast.error(error?.response?.data?.message || "Erreur lors de la suppression");
            throw error;
        }
    };
}

// Get low stock alerts
export function getLowStockAlerts() {
    return async (dispatch) => {
        try {
            const { data } = await request.get("/api/stock/admin/alerts/low-stock");
            dispatch(stockActions.setLowStockAlerts(data));
            return data;
        } catch (error) {
            toast.error("Erreur lors du chargement des alertes");
            throw error;
        }
    };
}

// Update client stock access
export function updateClientStockAccess(clientId, accessData) {
    return async (dispatch) => {
        try {
            console.log('[API Call] updateClientStockAccess - ClientId:', clientId);
            console.log('[API Call] updateClientStockAccess - Data:', accessData);
            
            dispatch(stockActions.setLoading(true));
            const { data } = await request.put(
                `/api/stock/admin/client/${clientId}/access`,
                accessData
            );
            
            console.log('[API Call] updateClientStockAccess - Response:', data);
            
            dispatch(stockActions.setLoading(false));
            toast.success("Accès mis à jour avec succès");
            return data;
        } catch (error) {
            console.error('[API Call] updateClientStockAccess - Error:', error);
            console.error('[API Call] Error response:', error?.response?.data);
            dispatch(stockActions.setLoading(false));
            toast.error(error?.response?.data?.message || "Erreur lors de la mise à jour des accès");
            throw error;
        }
    };
}

// Get stock movements (admin)
export function getStockMovementsAdmin(stockId, params = {}) {
    return async (dispatch) => {
        try {
            const queryString = new URLSearchParams(params).toString();
            const { data } = await request.get(`/api/stock/admin/${stockId}/movements?${queryString}`);
            return data;
        } catch (error) {
            toast.error("Erreur lors du chargement de l'historique");
            throw error;
        }
    };
}

