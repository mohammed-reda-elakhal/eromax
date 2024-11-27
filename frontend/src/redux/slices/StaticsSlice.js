// statics slice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState={
    setAllColis: 0,
    setAllColisLivre: 0,
    setColisLivreByRole:0,
    setColisCancealByRole:0,
    topVilles: [],
    statisticColis : [] ,
    argentStatistic : [] ,
    villeStatistic : []

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
        }
    }

})


const staticsReducer = staticsSlice.reducer;
const staticsActions = staticsSlice.actions;

export { staticsActions, staticsReducer };