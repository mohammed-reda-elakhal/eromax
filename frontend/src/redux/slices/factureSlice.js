// src/redux/slices/factureSlice.js

import { createSlice } from "@reduxjs/toolkit";

const factureSlice = createSlice({
  name: "facture",
  initialState: {
    facture: [],
    factureRamasser: [],
    factureRetour: [],
    detailFacture: [],
    promotionFacture: [],
    detailFactureRamasser: [],
    detailFactureRetour: [],
  },
  reducers: {
    setFacture(state, action) {
      state.facture = action.payload;
    },
    setFactureRamasser(state, action) {
      state.factureRamasser = action.payload;
    },
    setFactureRetour(state, action) {
      state.factureRetour = action.payload;
    },
    setFactureDetail(state, action) {
      state.detailFacture = action.payload;
    },
    setPromotion(state, action) {
      state.promotionFacture = action.payload;
    },
    setFactureDetailRamasser(state, action) {
      state.detailFactureRamasser = action.payload;
    },
    setFactureDetailRetour(state, action) {
      state.detailFactureRetour = action.payload;
    },
    addFacture(state, action) {
      state.facture.push(action.payload);
    },
    updateFacture(state, action) {
      // Ensure you're comparing with _id
      const index = state.facture.findIndex(
        (facture) => facture._id === action.payload._id
      );
      if (index !== -1) {
        state.facture[index] = action.payload;
      }
    },
    removeFacture(state, action) {
      // action.payload should be the _id
      state.facture = state.facture.filter(
        (facture) => facture._id !== action.payload
      );
    },
    // Important: Use _id from the backend response
    setFactureEtat(state, action) {
      const { id, etat } = action.payload;
      // Compare _id in the local array with id from the action
      const index = state.facture.findIndex((fact) => fact._id === id);
      if (index !== -1) {
        state.facture[index].etat = etat;
      }
    },
  },
});

export const factureActions = factureSlice.actions;
export const factureReducer = factureSlice.reducer;
