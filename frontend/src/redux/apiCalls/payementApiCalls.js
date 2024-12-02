// src/redux/apiCalls/payementApiCalls.js

import { toast } from "react-toastify";
import request from "../../utils/request";
import {
  setPayements,
  addPayement,
  updatePayement,
  removePayement,
  setSelectedPayement,
  setFetching,
  setError,
} from "../slices/payementSlice";

// Get all payments
export function getAllPayements() {
  return async (dispatch) => {
    dispatch(setFetching(true));
    try {
      const { data } = await request.get("/api/payement"); // API call to get all payments
      dispatch(setPayements(data));
      dispatch(setFetching(false));
    } catch (error) {
      dispatch(setFetching(false));
      dispatch(setError(error.message || "Failed to fetch payments"));
      toast.error(error.message || "Failed to fetch payments");
    }
  };
}

// Get a payment by ID
export function getPayementById(id) {
  return async (dispatch) => {
    dispatch(setFetching(true));
    try {
      const { data } = await request.get(`/api/payement/${id}`); // API call to get a payment by ID
      dispatch(setSelectedPayement(data));
      dispatch(setFetching(false));
    } catch (error) {
      dispatch(setFetching(false));
      dispatch(setError(error.message || "Failed to fetch payment details"));
      toast.error(error.message || "Failed to fetch payment details");
    }
  };
}

// Create a new payment
export function createPayement(payementData) {
  return async (dispatch) => {
    try {
      const { data } = await request.post("/api/payement", payementData); // API call to create a payment
      dispatch(addPayement(data));
      toast.success("Payment created successfully");
      return data; // Return data to allow awaiting
    } catch (error) {
      dispatch(setError(error.message || "Failed to create payment"));
      toast.error(error.message || "Failed to create payment");
      throw error; // Throw error to handle it in the component
    }
  };
}

// Update a payment by ID
export function ModifierPayement(id, payementData) {
  return async (dispatch) => {
    try {
      const { data } = await request.put(`/api/payement/${id}`, payementData); // API call to update a payment
      dispatch(updatePayement(data));
      toast.success("Payment updated successfully");
      return data; // Return data to allow awaiting
    } catch (error) {
      dispatch(setError(error.message || "Failed to update payment"));
      toast.error(error.message || "Failed to update payment");
      throw error; // Throw error to handle it in the component
    }
  };
}

// Delete a payment by ID
export function deletePayement(id) {
  return async (dispatch) => {
    try {
      await request.delete(`/api/payement/${id}`); // API call to delete a payment
      dispatch(removePayement(id));
      toast.success("Payment deleted successfully");
    } catch (error) {
      dispatch(setError(error.message || "Failed to delete payment"));
      toast.error(error.message || "Failed to delete payment");
    }
  };
}



// Get payments by client ID
export function getPaymentsByClientId(clientId) {
  return async (dispatch) => {
    dispatch(setFetching(true));
    try {
      const { data } = await request.get(`/api/payement/client/${clientId}`); // API call to get payments by client ID
      
      // **Ensure that data.payements is an array**
      if (data && Array.isArray(data)) {
        dispatch(setPayements(data));
      } else {
        // If data.payements is not an array, handle accordingly
        dispatch(setPayements([]));
        toast.warn("No payments found for this client.");
      }
      
      dispatch(setFetching(false));
    } catch (error) {
      dispatch(setFetching(false));
      dispatch(setError(error.message || "Failed to fetch payments by client"));
      toast.error(error.message || "Failed to fetch payments by client");
    }
  };
}
