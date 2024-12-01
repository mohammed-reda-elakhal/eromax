// src/redux/apiCalls/promotionApi.js

import { promotionActions } from "../slices/promotionSlice";
import { toast } from "react-toastify";
import request from "../../utils/request";
import Cookies from "js-cookie";

// Fetch all promotions
export function getAllPromotions() {
  return async (dispatch) => {
    dispatch(promotionActions.fetchPromotionsStart());
    try {
      const response = await request.get(`/api/promotions`);
      const promotions = response.data.data; // Extract the array from response
      dispatch(promotionActions.fetchPromotionsSuccess(promotions));
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to fetch promotions";
      dispatch(promotionActions.fetchPromotionsFailure(errorMessage));
      toast.error(errorMessage);
    }
  };
}

// Fetch a promotion by ID
export function getPromotionById(id) {
  return async (dispatch) => {
    dispatch(promotionActions.fetchPromotionsStart());
    try {
      const response = await request.get(`/api/promotions/${id}`);
      const promotion = response.data.data; // Extract the promotion object
      dispatch(promotionActions.fetchPromotionByIdSuccess(promotion));
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to fetch promotion by ID";
      dispatch(promotionActions.fetchPromotionsFailure(errorMessage));
      toast.error(errorMessage);
    }
  };
}

export function createPromotion(promotionData) {
  return async (dispatch) => {
    dispatch(promotionActions.fetchPromotionsStart());
    try {
      const response = await request.post(`/api/promotions`, promotionData);
      const newPromotion = response.data.data;
      dispatch(promotionActions.createPromotionSuccess(newPromotion));
      toast.success("Promotion created successfully");
      return Promise.resolve();
    } catch (error) {
      console.error('Error creating promotion:', error.response?.data || error.message);
      const errorMessage =
        (error.response?.data?.errors && error.response?.data?.errors.join(', ')) ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to create promotion";
      dispatch(promotionActions.fetchPromotionsFailure(errorMessage));
      return Promise.reject(error);
    }
  };
}


// Update a promotion
export function updatePromotion(id, promotionData) {
  return async (dispatch) => {
    dispatch(promotionActions.fetchPromotionsStart());
    try {
      const response = await request.put(`/api/promotions/${id}`, promotionData);
      const updatedPromotion = response.data.data; // Extract the updated promotion
      dispatch(promotionActions.updatePromotionSuccess(updatedPromotion));
      toast.success("Promotion updated successfully");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to update promotion";
      dispatch(promotionActions.fetchPromotionsFailure(errorMessage));
      console.error(errorMessage);
    }
  };
}

// Delete a promotion
export function deletePromotion(id) {
  return async (dispatch) => {
    dispatch(promotionActions.fetchPromotionsStart());
    try {
      await request.delete(`/api/promotions/${id}`);
      dispatch(promotionActions.deletePromotionSuccess(id));
      toast.success("Promotion deleted successfully");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to delete promotion";
      dispatch(promotionActions.fetchPromotionsFailure(errorMessage));
      console.error(errorMessage);
    }
  };
}

// Toggle promotion status
export function togglePromotionStatus(id) {
  return async (dispatch) => {
    dispatch(promotionActions.fetchPromotionsStart());
    try {
      const response = await request.patch(`/api/promotions/${id}/toggle`);
      const updatedPromotion = response.data.data; // Extract the updated promotion
      dispatch(promotionActions.togglePromotionStatusSuccess(updatedPromotion));
      toast.success(`Promotion ${updatedPromotion.isActive ? "activated" : "deactivated"} successfully`);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to toggle promotion status";
      dispatch(promotionActions.fetchPromotionsFailure(errorMessage));
      console.error(errorMessage);
    }
  };
}


// get valide promotion for user 
export function getValidPromotionsForUser() {
    // Get token from cookies
    const token = localStorage.getItem('token');
    if (!token) {
        toast.error('Authentification token est manquant');
        return;
    }

    // Set up headers with the token
    const config = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };
  return async (dispatch) => {
    dispatch(promotionActions.fetchPromotionsStart());
    try {
      const response = await request.get(`/api/promotions/user/valide` , config);
      const promotions = response.data.data; // Extract the array from response
      dispatch(promotionActions.fetchValidPromotionsSuccess(promotions));
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to fetch valid promotions";
      dispatch(promotionActions.fetchPromotionsFailure(errorMessage));
      console.error(errorMessage);
    }
  };
}