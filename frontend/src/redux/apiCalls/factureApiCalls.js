import { toast } from "react-toastify";
import request from "../../utils/request";
import { factureActions } from "../slices/factureSlice";
import Cookies from "js-cookie";


// get data user
export function getFacture(type) {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/facture`, {
                params: { type } // Use 'params' for query parameters
            });
            dispatch(factureActions.setFacture(data.factures));
        } catch (error) {
            toast.error(error.message || "Failed to fetch notifications");
        }
    };
}

// get data user
export function getFactureRamasser() {
    return async (dispatch) => {
        try {
            
            const token = Cookies.get('token');
            if (!token) {
                toast.error('Authentification token is missing');
                return;
            }
    
            const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
            };
            const { data } = await request.get(`/api/facture/ramasser` , config);
            dispatch(factureActions.setFactureRamasser(data.factures));
        } catch (error) {
            toast.error(error.message || "Failed to fetch notifications");
        }
    };
}

// Get facture details by code with optional type filter
export function getFactureDetailsByCode(codeFacture ) {
    return async (dispatch) => {
        try {
            // Send the type as a query parameter using 'params'
            const { data } = await request.get(`/api/facture/detail/${codeFacture}`);
            dispatch(factureActions.setFactureDetail(data.facture));
            dispatch(factureActions.setPromotion(data.promotion));
        } catch (error) {
            toast.error(error.message || "Failed to fetch facture details");
        }
    };
}

export function getFactureRamasserDetailsByCode(codeFacture ) {
    return async (dispatch) => {
        try {
            // Send the type as a query parameter using 'params'
            const { data } = await request.get(`/api/facture/ramasser/${codeFacture}`);
            dispatch(factureActions.setFactureDetailRamasser(data.facture));
        } catch (error) {
            toast.error(error.message || "Failed to fetch facture details");
        }
    };
}

export function getFactureDetailsByClient(id_client){
    return async (dispatch)=>{
        try{const {data}=await request.get(`/api/facture/detail/client/${id_client}`);
        dispatch(factureActions.setFacture(data.factures));
    }catch(error){
        toast.error(error.message || "Failed to fetch facture details");
    }
        
    }
}

export function setFactureEtat(id) {
    return async (dispatch) => {
        try {
            // Send a PUT request to update the 'etat' field for the facture with the given ID
            const { data } = await request.put(`/api/facture/pay/${id}`);

            // Dispatch the action to update the Redux state with the new etat
            dispatch(factureActions.setFactureEtat({ id, etat: data.facture.etat }));
            toast.success(data.message);
        } catch (error) {
            toast.error(error.message || "Failed to update facture status");
        }
    };
}


export function getFactureDetailsByLivreur(id){
    return async (dispatch)=>{
        try{const {data}=await request.get(`/api/facture/detail/livreur/${id}`);
        dispatch(factureActions.setFacture(data.factures));
    }catch(error){
        toast.error(error.message || "Failed to fetch facture details");
    }
        
    }
}


// Fetch all FactureRetour with optional type filter
export function getFactureRetour(type) {
    return async (dispatch) => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                toast.error('Authentication token is missing');
                return;
            }
            
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                params: { type } // Use 'params' for query parameters
            };
            
            const { data } = await request.get(`/api/facture/retour`, config);
            
            // Process data to match specified structure
            dispatch(factureActions.setFactureRetour(data.data));
        } catch (error) {
            toast.error(error.message || "Failed to fetch facture data");
        }
    };
}

export function getFactureRetourDetailsByCode(codeFacture ) {
    return async (dispatch) => {
        try {
            // Send the type as a query parameter using 'params'
            const { data } = await request.get(`/api/facture/retour/${codeFacture}`);
            dispatch(factureActions.setFactureDetailRetour(data.facture));
        } catch (error) {
            toast.error(error.message || "Failed to fetch facture details");
        }
    };
}
