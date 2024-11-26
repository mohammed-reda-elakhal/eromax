import { toast } from "react-toastify";
import request from "../../utils/request";
import { missionActions } from "../slices/missionSlice";
import Cookies from "js-cookie";

// Fetch today's withdrawal requests (DemandeRetrait)
export function getDemandeRetraitToday() {
    return async (dispatch) => {

          // Get token from cookies
          const token = Cookies.get('token');
          if (!token) {
              toast.error('Authentification token est manquant');
              return;
          }

          // Set up headers with the token
          const config = {
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
              },
          };

        try {
            const { data } = await request.get(`/api/mission/demande-retrait` , config);
            dispatch(missionActions.setDemandeRetrait(data));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch today's withdrawal requests");
        }
    };
}

// Fetch today's unresolved reclamations
export function getReclamationToday() {
    return async (dispatch) => {

          // Get token from cookies
          const token = Cookies.get('token');
          if (!token) {
              toast.error('Authentification token est manquant');
              return;
          }

          // Set up headers with the token
          const config = {
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
              },
          };


        try {
            const { data } = await request.get(`/api/mission/reclamation` , config);
            dispatch(missionActions.setReclamation(data));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch today's reclamations");
        }
    };
}

// Fetch today's packages waiting for pickup (Colis ATR)
export function getColisATRToday() {
    return async (dispatch) => {

          // Get token from cookies
          const token = Cookies.get('token');
          if (!token) {
              toast.error('Authentification token est manquant');
              return;
          }

          // Set up headers with the token
          const config = {
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
              },
          };


        try {
            const { data } = await request.get(`/api/mission/colis-ATR` , config);
            dispatch(missionActions.setColis(data));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch today's packages");
        }
    };
}
