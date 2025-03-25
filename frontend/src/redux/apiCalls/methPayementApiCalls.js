import { toast } from "react-toastify";
import request from "../../utils/request";
import { 
    setMeth_payement, 
    addMeth_payement, 
    removeMeth_payement, 
    updateMeth_payement,
    setError,
    setFetching,
    clearError
} from "../slices/methPayementSlice";

// Get payment methods
export function getMeth_payement() {
    return async (dispatch) => {
        dispatch(setFetching(true));
        dispatch(clearError());
        try {
            const { data } = await request.get(`/api/meth`);
            dispatch(setMeth_payement(data));
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || "Failed to fetch payment methods";
            dispatch(setError(errorMessage));
            toast.error(errorMessage);
        } finally {
            dispatch(setFetching(false));
        }
    };
}

// Create a new payment method
export function createMethodePayement(methData) {
    return async (dispatch) => {
        dispatch(setFetching(true));
        dispatch(clearError());
        try {
            // Ensure methData is FormData
            if (!(methData instanceof FormData)) {
                throw new Error('Invalid data format. Expected FormData.');
            }

            const { data } = await request.post(`/api/meth`, methData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                transformRequest: [(data) => data], // Prevent axios from transforming the data
            });

            if (!data) {
                throw new Error('No data received from server');
            }

            dispatch(addMeth_payement(data));
            toast.success('Payment method created successfully');
            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || "Failed to create payment method";
            dispatch(setError(errorMessage));
            toast.error(errorMessage);
            throw error;
        } finally {
            dispatch(setFetching(false));
        }
    };
}

// Delete a payment method by ID
export function DeleteMethPayement(id) {
    return async (dispatch) => {
        dispatch(setFetching(true));
        dispatch(clearError());
        try {
            await request.delete(`/api/meth/${id}`);
            dispatch(removeMeth_payement(id));
            toast.success('Payment method deleted successfully');
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || "Failed to delete payment method";
            dispatch(setError(errorMessage));
            toast.error(errorMessage);
            throw error;
        } finally {
            dispatch(setFetching(false));
        }
    };
}

// Update a payment method by ID
export function updateMethPayement(id, methData) {
    return async (dispatch) => {
        dispatch(setFetching(true));
        dispatch(clearError());
        try {
            const { data } = await request.put(`/api/meth/${id}`, methData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            dispatch(updateMeth_payement(data));
            toast.success('Payment method updated successfully');
            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || "Failed to update payment method";
            dispatch(setError(errorMessage));
            toast.error(errorMessage);
            throw error;
        } finally {
            dispatch(setFetching(false));
        }
    };
}
