import { toast } from "react-toastify";
import request from "../../utils/request";
import { demandeRetraitActions } from "../slices/demandeRetraitSlice";

export function getAlldemandeRetrait() {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/demande-retrait/`);
            dispatch(demandeRetraitActions.setdemandeRetrait(data));
        } catch (error) {
            toast.error(error.message || "Failed to fetch demandeRetrait List");
        }
    };
}

export function getdemandeRetraitByClient(id) {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/demande-retrait/client/${id}`);
            dispatch(demandeRetraitActions.setdemandeRetrait(data));
        } catch (error) {
            toast.error(error.message || "Failed to fetch demandeRetrait List");
        }
    };
}

export function createDemandeRetrait(demandeRetraitData) {
    return async (dispatch) => {
      try {
        // Send the request to create a "Demande de Retrait"
        const { data } = await request.post(`/api/demande-retrait/`, demandeRetraitData);
  
        // If successful, add the new demande to the store
        dispatch(demandeRetraitActions.addDemandeRetrait(data.data));
  
        // Show success message returned from the server
        toast.success(data.message || "Demande de retrait créée avec succès!");
  
      } catch (error) {
        // If it's a server validation error (400), show the message from the server
        if (error.response?.status === 400) {
          toast.warning(error.response.data.message || "Erreur: Vous ne pouvez soumettre qu'une seule demande toutes les 24 heures.");
        } else {
          // For other errors (e.g., network issues or server errors), show a generic error message
          toast.error(error.message || "Erreur lors de la création de la demande de retrait.");
        }
      }
    };
  }
export function validerDemandeRetrait(id_demande) {
    return async (dispatch) => {
      try {
        const { data } = await request.post(`/api/demande-retrait/valide/${id_demande}`);
        
        
        toast.success(data.message);
        dispatch(demandeRetraitActions.updateDemandeRetrait(data)); 
      } catch (error) {
        toast.error(error.message || "Échec de la validation de la demande de retrait");
      }
    };
  }
