import { createSlice } from "@reduxjs/toolkit";

const transferSlice = createSlice({
  name: "transfer",
  initialState: {
    transfers: [],
    selectedTransfer: null,
    loading: false,
    error: null,
  },
  reducers: {
    setTransfer(state, action) {
      state.transfers = action.payload;
    },
    fetchTransfersStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchTransfersSuccess(state, action) {
      state.transfers = action.payload;
      state.loading = false;
    },
    fetchTransfersFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    fetchTransferByIdSuccess(state, action) {
      state.selectedTransfer = action.payload;
      state.loading = false;
    },
    createTransferSuccess(state, action) {
      state.transfers.push(action.payload);
      state.loading = false;
    },
    updateTransferSuccess(state, action) {
      const index = state.transfers.findIndex((transfer) => transfer._id === action.payload._id);
      if (index !== -1) {
        state.transfers[index] = action.payload;
      }
      state.loading = false;
    },
    deleteTransferSuccess(state, action) {
      state.transfers = state.transfers.filter((transfer) => transfer._id !== action.payload);
      state.loading = false;
    },
    resetTransferState(state) {
      state.selectedTransfer = null;
    }
  },
});

const transferReducer = transferSlice.reducer;
const transferActions = transferSlice.actions;

export { transferActions, transferReducer }; 