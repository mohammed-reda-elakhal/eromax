import { createSlice } from "@reduxjs/toolkit";

const colisSlice = createSlice({
    name: "colis",
    initialState: {
        colis: [],
        selectedColis: null,  // Add a new field for the selected colis
        loading: false,
        error: null,
    },
    reducers: {
        setColis(state, action) {
            if (Array.isArray(action.payload)) {
                state.colis = action.payload;
                state.error = null;
            } else {
                console.error("Invalid payload format:", action.payload);
                state.error = "Invalid data format received from server.";
            }
            state.loading = false;
        },
        setSelectedColis(state, action) {
            state.selectedColis = action.payload; // Add new action for setting the selected colis
            state.loading = false;
        },
        addColis(state, action) {
            if (action.payload && typeof action.payload === 'object') {
                state.colis.push(action.payload);
            } else {
                console.error("Invalid payload format for addColis:", action.payload);
                state.error = "Invalid data format for adding colis.";
            }
        },
        setLoading(state, action) {
            state.loading = action.payload;
        },
        setError(state, action) {
            state.error = action.payload;
        },
        updateColis(state, action) {
            if (Array.isArray(action.payload)) {
                state.colis = action.payload;
            } else {
                console.error("Invalid payload format for updateColis:", action.payload);
                state.error = "Invalid data format for updating colis.";
            }
        },
    },
});

const colisReducer = colisSlice.reducer;
const colisActions = colisSlice.actions;

export { colisActions, colisReducer };
