import { configureStore } from "@reduxjs/toolkit";
import { villeReducer } from "./slices/villeSlice";
import { authReducer } from "./slices/authSlice";
import { profileReducer } from "./slices/profileSlice";
import { colisReducer } from "./slices/colisSlice";
import { livreurReducer } from "./slices/livreurSlice";
import { notificationReducer } from "./slices/notificationSlice";
import { reclamationReducer } from "./slices/reclamationSlice";
import { factureReducer } from "./slices/factureSlice";
import { meth_payementReducer } from "./slices/methPayementSlice";
import { payementReducer } from "./slices/payementSlice";
import { transactionReducer } from "./slices/transactionSlice";
import { demandeRetraitReducer } from "./slices/demandeRetraitSlice";



const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    colis: colisReducer,
    ville: villeReducer,
    livreur: livreurReducer,
    notification: notificationReducer,
    reclamation: reclamationReducer,
    facture: factureReducer,
    meth_payement: meth_payementReducer,
    payement: payementReducer, // Add payement reducer to the store
    transaction:transactionReducer,
    demandeRetrait:demandeRetraitReducer
  },
});

export default store;
