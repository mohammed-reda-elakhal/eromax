// src/redux/apiCalls/methPayementApiCalls.js

import { toast } from "react-toastify";
import request from "../../utils/request";
import { meth_payementActions } from "../slices/methPayementSlice";

// Get payment methods
export function getMeth_payement() {
  return async (dispatch) => {
    try {
      const { data } = await request.get(`/api/meth`);
      dispatch(meth_payementActions.setMeth_payement(data));
    } catch (error) {
      toast.error(error.message || "Failed to fetch payment methods");
    }
  };
}

// Create a new payment method
export function createMethodePayement(methData) {
  return async (dispatch) => {
    try {
      const { data } = await request.post(`/api/meth`, methData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      dispatch(meth_payementActions.addMeth_payement(data));
      toast.success(data.message);
      return data; // Return data to allow awaiting
    } catch (error) {
      dispatch(meth_payementActions.setError(error.message || "Failed to create payment method"));
      toast.error(error.message || "Failed to create payment method");
      throw error; // Throw error to handle it in the component
    }
  };
}

// Delete a payment method by ID
export const DeleteMethPayement = (id) => {
  return async (dispatch) => {
    try {
      await request.delete(`/api/meth/${id}`);
      dispatch(meth_payementActions.removeMeth_payement(id)); // Dispatch action to remove from state
      toast.success('Payment method deleted successfully');
    } catch (error) {
      dispatch(meth_payementActions.setError(error.message || "Failed to delete payment method"));
      toast.error('Failed to delete payment method');
    }
  };
};
