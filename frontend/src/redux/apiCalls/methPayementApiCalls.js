import { toast } from "react-toastify";
import request from "../../utils/request";
import { meth_payementActions } from "../slices/methPayementSlice";

// Get payment methods
export function getMeth_payement() {
  return async (dispatch) => {
    dispatch(meth_payementActions.setFetching(true));
    try {
      const { data } = await request.get(`/api/meth`);
      dispatch(meth_payementActions.setMeth_payement(data));
    } catch (error) {
      toast.error(error.message || "Failed to fetch payment methods");
      dispatch(meth_payementActions.setError(error.message || "Failed to fetch payment methods"));
    } finally {
      dispatch(meth_payementActions.setFetching(false));
    }
  };
}

// Create a new payment method
export function createMethodePayement(methData) {
  return async (dispatch) => {
    dispatch(meth_payementActions.setFetching(true));
    try {
      const { data } = await request.post(`/api/meth`, methData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      dispatch(meth_payementActions.addMeth_payement(data));
      toast.success('Payment method created successfully');
      return data; // Return data to allow awaiting
    } catch (error) {
      dispatch(meth_payementActions.setError(error.message || "Failed to create payment method"));
      toast.error(error.message || "Failed to create payment method");
      throw error; // Throw error to handle it in the component
    } finally {
      dispatch(meth_payementActions.setFetching(false));
    }
  };
}

// Delete a payment method by ID
export const DeleteMethPayement = (id) => {
  return async (dispatch) => {
    dispatch(meth_payementActions.setFetching(true));
    try {
      await request.delete(`/api/meth/${id}`);
      dispatch(meth_payementActions.removeMeth_payement(id)); // Dispatch action to remove from state
      toast.success('Payment method deleted successfully');
    } catch (error) {
      dispatch(meth_payementActions.setError(error.message || "Failed to delete payment method"));
      toast.error('Failed to delete payment method');
    } finally {
      dispatch(meth_payementActions.setFetching(false));
    }
  };
};

// Update a payment method by ID
export const updateMethPayement = (id, methData) => {
  return async (dispatch) => {
    dispatch(meth_payementActions.setFetching(true));
    try {
      const { data } = await request.put(`/api/meth/${id}`, methData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      dispatch(meth_payementActions.updateMeth_payement(data));
      toast.success('Payment method updated successfully');
      return data; // Return data to allow awaiting
    } catch (error) {
      dispatch(meth_payementActions.setError(error.message || "Failed to update payment method"));
      toast.error('Failed to update payment method');
      throw error; // Throw error to handle it in the component
    } finally {
      dispatch(meth_payementActions.setFetching(false));
    }
  };
};
