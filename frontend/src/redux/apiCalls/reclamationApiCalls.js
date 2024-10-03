// src/store/reclamationApiCalls.js
import { toast } from "react-toastify";
import request from "../../utils/request";
import { reclamationActions } from "../slices/reclamationSlice";
import Cookies from "js-cookie";

// Fetch reclamations with optional resoudre filter
export function getReclamation(resoudre) {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/reclamation`, {
                params: { resoudre }
            });
            dispatch(reclamationActions.setReclamation(data));
        } catch (error) {
            toast.error(error.message || "Failed to fetch reclamations");
        }
    };
}

// Create a new reclamation
export function createReclamation(reclamationData) {
    return async (dispatch) => {
        try {
            const { data } = await request.post(`/api/reclamation`, reclamationData);
            dispatch(reclamationActions.addReclamation(data)); // Assuming you have an addReclamation reducer
            toast.success(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create reclamation");
        }
    };
}

// Update a reclamation
export function updateReclamation(id, updateData) {
    return async (dispatch) => {
        try {
            const { data } = await request.put(`/api/reclamation/${id}`, updateData);
            dispatch(reclamationActions.updateReclamation(data)); // Assuming you have an updateReclamation reducer
            toast.success("Reclamation updated successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update reclamation");
        }
    };
}

// Assuming your Redux setup and utility imports are correct
export function updateReclamationStatus(id) {
    return async (dispatch) => {
        try {
            const { data } = await request.patch(`/api/reclamation/${id}/status`);
            // Assuming your backend correctly returns the updated reclamation
            dispatch(reclamationActions.updateReclamationStatus({ id, resoudre: data.reclamation.resoudre }));
            toast.success("Reclamation status updated successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update reclamation status");
        }
    };
}


// Delete a reclamation
export function deleteReclamation(id) {
    return async (dispatch) => {
        try {
            await request.delete(`/api/reclamation/${id}`);
            dispatch(reclamationActions.deleteReclamation(id)); // Assuming you have a deleteReclamation reducer
            toast.success("Reclamation deleted successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete reclamation");
        }
    };
}
