// statics slice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState={
    setAllColis: 0,
    setAllColisLivre: 0,
    setColisLivreByRole:0,
    setColisCancealByRole:0,
    topVilles: [],
    topClient: [],
    statisticColis : [] ,
    argentStatistic: {
        totalTransfers: 0,
        lastTransferMontant: 0,
        largestTransferMontant: 0,
    },
    villeStatistic : [],
      // New state property for reportée/programmée data:
    colisReporteeProg: { count: 0, codes: [] },
    incompleteWithdrawals: 0
};
const staticsSlice = createSlice({
    name: "statics",
    initialState,
    reducers: {
        setColisData(state , action){
            state.statisticColis = action.payload ;
        },
        setArgentData(state , action){
            state.argentStatistic = action.payload ;
        },
        setVilleData(state , action){
            state.villeStatistic = action.payload ;
        },
        setClientData(state , action){
            state.topClient = action.payload ;
        },
        setAllColisLivre(state, action) {
            state.setAllColisLivre = action.payload;
        },
        setAllColis(state, action) {
            state.setAllColis = action.payload;
        }, setColisLivreByRole(state, action) {
            state.setColisLivreByRole = action.payload;
        }, setColisCancealByRole(state, action) {
            state.setColisCancealByRole = action.payload;
        },setTotalGains(state, action) {
            state.setTotalGains = action.payload;
        },setColisRetour(state,action){
            state.setColisRetour = action.payload;
        },
        setLastTransac(state,action){
            state.setLastTransac=action.payload
        },
        setBigTransac(state,action){
            state.setBigTransac=action.payload
        },
        setTopVille(state,action){
            state.topVilles=action.payload
        },
          // New reducer to set the reportée/programmée data
        setColisReporteeProgData(state, action) {
            state.colisReporteeProg = action.payload;
        },
        setIncompleteWithdrawals(state, action) {
            state.incompleteWithdrawals = action.payload;
        }
    }

})


const staticsReducer = staticsSlice.reducer;
const staticsActions = staticsSlice.actions;

export { staticsActions, staticsReducer };