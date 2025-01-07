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
            
            const token = localStorage.getItem('token');
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

// Action to toggle or set the 'etat' of a facture
export function setFactureEtat(id) {
    return async (dispatch) => {
      try {
        // Make the PUT request to toggle/update the facture etat
        const { data } = await request.put(`/api/facture/pay/${id}`);
        // data.facture should contain _id and etat
        // Dispatch an action that updates the correct facture in the store
        dispatch(
          factureActions.setFactureEtat({
            id: data.facture._id, // Match the '_id' field in the MongoDB response
            etat: data.facture.etat, // The toggled state (true/false)
          })
        );
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
            const token = localStorage.getItem('token');
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


// New Action: Get Facture by Colis ID
export function getFactureByColis(colisId) {
    return async (dispatch) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication token is missing');
                return;
            }

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            };

            const { data } = await request.get(`/api/facture/colis/${colisId}`, config);
            dispatch(factureActions.setFactureDetail(data.facture));
        } catch (error) {
            // Handle specific error messages from backend
            if (error.response && error.response.status === 404) {
                dispatch(factureActions.setFactureDetail(null, null));
                toast.info(error.response.data.message || "Cette colis n'a pas de facture associée.");
            } else {
                toast.error(error.message || "Failed to fetch facture details");
            }
        }
    };
}

// New API call for merging factures
export function mergeFactures(factureCodes) {
    return async (dispatch, getState) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication token is missing');
                return;
            }

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            };

            const { data } = await request.post(`/api/facture/merge`, { factureCodes }, config);
            
            // Dispatch an action to add the merged facture
            dispatch(factureActions.addFacture(data.mergedFacture));

            // Remove original factures from the store
            const state = getState();
            factureCodes.forEach(code => {
                const currentFacture = state.facture.facture.find(f => f.code_facture === code);
                if (currentFacture) {
                    dispatch(factureActions.removeFacture(currentFacture._id));
                }
            });

            toast.success(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to merge factures");
        }
    };
}