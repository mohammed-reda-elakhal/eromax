import { toast } from "react-toastify";
import request from "../../utils/request";
import { demandeRetraitActions } from "../slices/demandeRetraitSlice";

export function getAlldemandeRetrait() {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/demande-retrait/`);
            console.log('demandeRetrait List', data);
            dispatch(demandeRetraitActions.setdemandeRetrait(data));
        } catch (error) {
            toast.error(error.message || "Failed to fetch demandeRetrait List");
        }
    };
}
export function createDemandeRetrait(demandeRetraitData) {
    return async (dispatch) => {
        try {
            const { data } = await request.post(`/api/demande-retrait/`, demandeRetraitData);
            console.log('Nouvelle Demande de Retrait', data);

            // Met à jour le store avec la nouvelle demande
            dispatch(demandeRetraitActions.addDemandeRetrait(data));
            toast.success("Demande de retrait créée avec succès!");
        } catch (error) {
            toast.error(error.message || "Erreur lors de la création de la demande de retrait.");
        }
    };
}
export function validerDemandeRetrait(id_demande) {
    return async (dispatch) => {
      try {
        const { data } = await request.post(`/api/demande-retrait/valide`, { id_demande });
        toast.success("Demande de retrait validée avec succès !");
        dispatch(demandeRetraitActions.updateDemandeRetrait(data)); 
      } catch (error) {
        toast.error(error.message || "Échec de la validation de la demande de retrait");
      }
    };
  }
