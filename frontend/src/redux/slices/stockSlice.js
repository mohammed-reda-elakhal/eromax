import { createSlice } from "@reduxjs/toolkit";

const stockSlice = createSlice({
    name: "stock",
    initialState: {
        loading: false,
        myStocks: {
            data: [],
            pagination: null
        },
        availableStocks: [],
        currentStock: null,
        movements: {
            data: [],
            pagination: null
        },
        pendingStocks: {
            data: [],
            pagination: null
        },
        allStocks: {
            data: [],
            pagination: null,
            stats: []
        },
        lowStockAlerts: {
            outOfStock: [],
            lowStock: [],
            summary: {}
        }
    },
    reducers: {
        setLoading(state, action) {
            state.loading = action.payload;
        },
        setMyStocks(state, action) {
            state.myStocks = {
                data: action.payload.data,
                pagination: action.payload.pagination
            };
        },
        setAvailableStocks(state, action) {
            state.availableStocks = action.payload;
        },
        setCurrentStock(state, action) {
            state.currentStock = action.payload;
        },
        setMovements(state, action) {
            state.movements = {
                data: action.payload.data,
                pagination: action.payload.pagination
            };
        },
        setPendingStocks(state, action) {
            state.pendingStocks = {
                data: action.payload.data,
                pagination: action.payload.pagination
            };
        },
        setAllStocks(state, action) {
            state.allStocks = {
                data: action.payload.data,
                pagination: action.payload.pagination,
                stats: action.payload.stats || []
            };
        },
        setLowStockAlerts(state, action) {
            state.lowStockAlerts = action.payload;
        },
        clearCurrentStock(state) {
            state.currentStock = null;
        }
    }
});

const stockReducer = stockSlice.reducer;
const stockActions = stockSlice.actions;

export { stockReducer, stockActions };

