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
import { storeReducer } from "./slices/storeSlice";
import { staticsReducer } from "./slices/StaticsSlice";
import { promotionReducer } from "./slices/promotionSlice";
import { missionReducer } from "./slices/missionSlice";
import { messageReducer } from "./slices/messageSlice";
import { docReducer } from "./slices/docSlices";
import { tarifLivreurReducer } from "./slices/tarifLivreurSlice";
import { noteColisReducer } from "./slices/noteColisSlice";
import { walletReducer } from "./slices/walletSlice";
import { transferReducer } from "./slices/transferSlice";
import { withdrawalReducer } from "./slices/withdrawalSlice";
import { regionReducer } from './slices/regionSlice';
import { profileV2Reducer } from './slices/profileV2Slice';
import colisTrashReducer from './slices/colisTrashSlice';
import { stockReducer } from './slices/stockSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    profileV2: profileV2Reducer,
    colis: colisReducer,
    ville: villeReducer,
    livreur: livreurReducer,
    notification: notificationReducer,
    reclamation: reclamationReducer,
    facture: factureReducer,
    meth_payement: meth_payementReducer,
    payement: payementReducer,
    transaction: transactionReducer,
    demandeRetrait: demandeRetraitReducer,
    store: storeReducer,
    statics: staticsReducer,
    promotion: promotionReducer,
    mission: missionReducer,
    message: messageReducer,
    file: docReducer,
    tarifLivreur: tarifLivreurReducer,
    noteColis: noteColisReducer,
    wallet: walletReducer,
    transfer: transferReducer,
    withdrawal: withdrawalReducer,
    region: regionReducer,
    colisTrash: colisTrashReducer,
    stock: stockReducer
  },
});

export default store;
