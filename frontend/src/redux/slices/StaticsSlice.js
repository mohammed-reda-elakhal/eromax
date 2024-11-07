import { createSlice } from "@reduxjs/toolkit";

const initialState={
    setAllColis: 0,
    setAllColisLivre: 0,
    setColisLivreByRole:0,
    setColisCancealByRole:0
};
const staticsSlice = createSlice({
    name: "statics",
    initialState,
    reducers: {
        setAllColisLivre(state, action) {
            state.setAllColisLivre = action.payload;
        },
        setAllColis(state, action) {
            state.setAllColis = action.payload;
        }, setColisLivreByRole(state, action) {
            state.setColisLivreByRole = action.payload;
        }, setColisCancealByRole(state, action) {
            state.setColisCancealByRole = action.payload;
        }
    }

})


const staticsReducer = staticsSlice.reducer;
const staticsActions = staticsSlice.actions;

export { staticsActions, staticsReducer };