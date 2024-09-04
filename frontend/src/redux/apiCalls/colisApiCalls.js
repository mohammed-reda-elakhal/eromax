import { toast } from "react-toastify";
import request from "../../utils/request";
import { colisActions } from "../slices/colisSlice";

// Fetch post
export function getColis() {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/colis/`);
            dispatch(colisActions.setColis(data)); // Use action creator
        } catch (error) {
            console.error("Failed to fetch colis:", error);
            dispatch(colisActions.setError(error.message));
        }
    };
}

export const getColisForClient = (storeId) => async (dispatch) => {
    dispatch(colisActions.setLoading(true));
    try {
        const { data } = await request.get(`/api/colis/colisStore/${storeId}`);
        console.log("Fetched data for client:", data);

        if (data && Array.isArray(data.colis)) {
            dispatch(colisActions.setColis(data.colis));
        } else {
            console.error("Unexpected data format:", data);
            dispatch(colisActions.setError("Invalid data format received from server."));
        }
    } catch (error) {
        console.error("Failed to fetch colis for client:", error);
        dispatch(colisActions.setError("Failed to fetch colis: " + error.message));
    }
};


// Fonction pour obtenir le token d'authentification depuis le stockage local ou autre
const getAuthToken = () => {
    return localStorage.getItem('token');  
}
export function addColis(data) {
    return async (dispatch) => {
        const store = JSON.parse(localStorage.getItem('store')); // Obtenez le store depuis le localStorage
        const storeId = store ? store._id : null; // Assurez-vous que le storeId est correct
        console.log(storeId);
        if (!storeId) {
            toast.error("Store ID is missing in local storage");
            return;
        }

        const token = JSON.parse(getAuthToken());
        console.log(token);
        if (!token) {
            toast.error("Token is missing in local storage");
            return;
        }

        try {
            const response = await request.post(`/api/colis/${storeId}`, 
                { ...data }, 
                {
                    headers: {
                        'Authorization': `bearer ${token}`
                    }
                }
            );

            // Handle success
            dispatch(colisActions.addColis(response.data)); // Use the action creator
            toast.success("Colis ajouté avec succès !");
            return response.data; // Return response data if needed
        } catch (error) {
            // Handle error
            dispatch(colisActions.setError(error.message)); // Use the action creator for errors
            toast.error("Erreur lors de l'ajout du colis. Veuillez réessayer.");
            if (error.response && error.response.status === 401) {
                console.log('Erreur d\'authentification');
            }
            return error;
        }
    };
}
