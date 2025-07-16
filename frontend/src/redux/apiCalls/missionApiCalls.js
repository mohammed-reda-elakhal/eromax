import { toast } from "react-toastify";
import request from "../../utils/request";
import { missionActions } from "../slices/missionSlice";
import Cookies from "js-cookie";

// Fetch today's withdrawal requests (DemandeRetrait)
export function getDemandeRetraitToday() {
    return async (dispatch) => {

          // Get token from cookies
          const token = localStorage.getItem('token');
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
// Get new clients with optional 'days' parameter
export function getNouveauClient(days) {
    return async (dispatch) => {

        try {

            // Get token from cookies
          const token = localStorage.getItem('token');
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

            const { data } = await request.get(`/api/mission/new-client?days=${days}`);
            dispatch(missionActions.setNouveauClient(data));
        } catch (error) {
            toast.error(error.message || "Failed to fetch new clients");
        }
    };
}

// Fetch count of open reclamations (where closed = false)
export function getReclamationToday() {
    return async (dispatch) => {

          // Get token from cookies
          const token = localStorage.getItem('token');
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
            const { data } = await request.get(`/api/mission/reclamation`, config);
            // The API now returns an object with a count property
            dispatch(missionActions.setOpenReclamationsCount(data.count));
        } catch (error) {
            console.error("Error fetching open reclamations count:", error);
            toast.error(error.response?.data?.message || "Échec de la récupération du nombre de réclamations ouvertes");
        }
    };
}

// Fetch today's packages waiting for pickup (Colis ATR)
export function getColisATRToday() {
    return async (dispatch) => {

          // Get token from cookies
          const token = localStorage.getItem('token');
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

// Fetch today's packages waiting for pickup (Colis ATR)
export function getColisRamasser() {
    return async (dispatch) => {

          // Get token from cookies
          const token = localStorage.getItem('token');
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
            const { data } = await request.get(`/api/mission/colis-R` , config);
            dispatch(missionActions.setColisR(data));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch today's packages");
        }
    };
}


// Fetch today's packages waiting for pickup (Colis ATR)
export function getColisExpidée() {
    return async (dispatch) => {

          // Get token from cookies
          const token = localStorage.getItem('token');
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
            const { data } = await request.get(`/api/mission/colis-Ex` , config);
            dispatch(missionActions.setColisExp(data));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch today's packages");
        }
    };
}

// Fetch today's packages waiting for pickup (Colis ATR)
export function getColisPret() {
    return async (dispatch) => {

          // Get token from cookies
          const token = localStorage.getItem('token');
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
            const { data } = await request.get(`/api/mission/colis-Pret` , config);
            dispatch(missionActions.setColisPret(data));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch today's packages");
        }
    };
}

export function getIncompleteWithdrawals() {
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
            };

            const { data } = await request.get(`/api/mission/withdrawal-incomplete`, config);
            dispatch(missionActions.setIncompleteWithdrawals(data.count));
        } catch (error) {
            console.error(error.message || "Failed to fetch incomplete withdrawals count");
        }
    };
}

// Fetch new packages (Colis Nouveau)
export function getColisNouveau() {
    return async (dispatch) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Authentification token est manquant');
            return;
        }
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        };
        try {
            const { data } = await request.get(`/api/mission/colis-nouveau`, config);
            dispatch(missionActions.setColisNouveau(data));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch new packages");
        }
    };
}

