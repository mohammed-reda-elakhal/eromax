// src/redux/slices/promotionSlice.js

import { createSlice } from "@reduxjs/toolkit";

const promotionSlice = createSlice({
  name: "promotion",
  initialState: {
    promotions: [], // Should be an array
    validPromotions: [], // Valid promotions for the user
    selectedPromotion: null,
    loading: false,
    error: null,
  },
  reducers: {
    fetchPromotionsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchPromotionsSuccess(state, action) {
      state.promotions = action.payload;
      state.loading = false;
    },
    fetchValidPromotionsSuccess(state, action) {
      state.validPromotions = action.payload;
      state.loading = false;
    },
    fetchPromotionsFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    fetchPromotionByIdSuccess(state, action) {
      state.selectedPromotion = action.payload;
      state.loading = false;
    },
    createPromotionSuccess(state, action) {
      state.promotions.push(action.payload);
      state.loading = false;
    },
    updatePromotionSuccess(state, action) {
      const index = state.promotions.findIndex((p) => p._id === action.payload._id);
      if (index >= 0) {
        state.promotions[index] = action.payload;
      }
      state.loading = false;
    },
    deletePromotionSuccess(state, action) {
      state.promotions = state.promotions.filter((p) => p._id !== action.payload);
      state.loading = false;
    },
    togglePromotionStatusSuccess(state, action) {
      const promotion = state.promotions.find((p) => p._id === action.payload._id);
      if (promotion) {
        promotion.isActive = action.payload.isActive;
      }
      state.loading = false;
    },
  },
});

const promotionReducer = promotionSlice.reducer;
const promotionActions = promotionSlice.actions;

export { promotionActions, promotionReducer };
