// src/redux/apiCalls/reclamationApiCalls.js
import { toast } from "react-toastify";
import request from "../../utils/request";
import { reclamationActions } from "../slices/reclamationSlice";

// Error handler helper function
const handleError = (error, dispatch, defaultMessage) => {
    const errorMessage = error.response?.data?.message || defaultMessage;
    dispatch(reclamationActions.apiRequestFail(errorMessage));
    toast.error(errorMessage);
    return errorMessage;
};

// Get all reclamations (with role-based access)
export function getAllReclamations() {
    return async (dispatch) => {
        dispatch(reclamationActions.apiRequestStart());
        try {
            console.log('Fetching all reclamations with role-based access');
            const { data } = await request.get(`/api/reclamation`);
            console.log('Received all reclamations data:', data);
            dispatch(reclamationActions.getReclamationsSuccess(data));
            return data;
        } catch (error) {
            console.error('Error fetching all reclamations:', error.response?.data || error.message);
            return handleError(error, dispatch, "Failed to fetch reclamations");
        }
    };
}

// Get reclamations by store ID
export function getReclamationsByStore(storeId) {
    return async (dispatch) => {
        dispatch(reclamationActions.apiRequestStart());
        try {
            console.log('Fetching reclamations for store ID:', storeId);
            const { data } = await request.get(`/api/reclamation/store/${storeId}`);
            console.log('Received reclamations data:', data);
            dispatch(reclamationActions.getReclamationsSuccess(data));
            return data;
        } catch (error) {
            console.error('Error fetching store reclamations:', error.response?.data || error.message);
            return handleError(error, dispatch, "Failed to fetch store reclamations");
        }
    };
}

// Get reclamations by colis ID
export function getReclamationsByColis(colisId) {
    return async (dispatch) => {
        dispatch(reclamationActions.apiRequestStart());
        try {
            const { data } = await request.get(`/api/reclamation/colis/${colisId}`);
            dispatch(reclamationActions.getReclamationsSuccess(data));
            return data;
        } catch (error) {
            return handleError(error, dispatch, "Failed to fetch colis reclamations");
        }
    };
}

// Get a single reclamation by ID
export function getReclamationById(id) {
    return async (dispatch) => {
        dispatch(reclamationActions.apiRequestStart());
        try {
            const { data } = await request.get(`/api/reclamation/${id}`);
            dispatch(reclamationActions.getReclamationSuccess(data));
            return data;
        } catch (error) {
            return handleError(error, dispatch, "Failed to fetch reclamation details");
        }
    };
}

// Create a new reclamation
export function createReclamation(reclamationData) {
    return async (dispatch) => {
        dispatch(reclamationActions.apiRequestStart());
        try {
            const { data } = await request.post(`/api/reclamation`, reclamationData);
            dispatch(reclamationActions.createReclamationSuccess(data));
            return data;
        } catch (error) {
            return handleError(error, dispatch, "Failed to create reclamation");
        }
    };
}

// Add a message to a reclamation
export function addMessage(reclamationId, messageContent) {
    return async (dispatch) => {
        dispatch(reclamationActions.apiRequestStart());
        try {
            const { data } = await request.post(`/api/reclamation/${reclamationId}/message`, {
                content: messageContent
            });
            dispatch(reclamationActions.addMessageSuccess(data));
            return data;
        } catch (error) {
            return handleError(error, dispatch, "Failed to add message");
        }
    };
}

// Delete a message from a reclamation
export function deleteMessage(reclamationId, messageId) {
    return async (dispatch) => {
        dispatch(reclamationActions.apiRequestStart());
        try {
            const { data } = await request.delete(`/api/reclamation/${reclamationId}/message/${messageId}`);
            dispatch(reclamationActions.deleteMessageSuccess(data));
            return data;
        } catch (error) {
            return handleError(error, dispatch, "Failed to delete message");
        }
    };
}

// Mark a message as read
export function markMessageAsRead(reclamationId, messageId) {
    return async (dispatch) => {
        dispatch(reclamationActions.apiRequestStart());
        try {
            const { data } = await request.put(`/api/reclamation/${reclamationId}/message/${messageId}/read`);
            dispatch(reclamationActions.markMessageAsReadSuccess(data));
            return data;
        } catch (error) {
            return handleError(error, dispatch, "Failed to mark message as read");
        }
    };
}

// Update reclamation status
export function updateReclamationStatus(reclamationId, status) {
    return async (dispatch) => {
        dispatch(reclamationActions.apiRequestStart());
        try {
            const { data } = await request.put(`/api/reclamation/${reclamationId}/status`, { status });
            dispatch(reclamationActions.updateReclamationStatusSuccess(data));
            return data;
        } catch (error) {
            return handleError(error, dispatch, "Failed to update reclamation status");
        }
    };
}

// Reopen a closed reclamation
export function reopenReclamation(reclamationId) {
    return async (dispatch) => {
        dispatch(reclamationActions.apiRequestStart());
        try {
            const { data } = await request.put(`/api/reclamation/${reclamationId}/reopen`);
            dispatch(reclamationActions.reopenReclamationSuccess(data));
            return data;
        } catch (error) {
            return handleError(error, dispatch, "Failed to reopen reclamation");
        }
    };
}

// Delete a reclamation
export function deleteReclamation(id) {
    return async (dispatch) => {
        dispatch(reclamationActions.apiRequestStart());
        try {
            const { data } = await request.delete(`/api/reclamation/${id}`);
            dispatch(reclamationActions.deleteReclamationSuccess(id));
            return data;
        } catch (error) {
            return handleError(error, dispatch, "Failed to delete reclamation");
        }
    };
}
