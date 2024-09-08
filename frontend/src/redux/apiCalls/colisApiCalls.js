import { toast } from "react-toastify";
import request from "../../utils/request";
import { colisActions } from "../slices/colisSlice";
import Cookies from "js-cookie";
import { decodeToken } from "../../utils/tokenUtils";


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
/*  */

// Fonction pour obtenir le token d'authentification depuis le stockage local ou autre
 const getAuthToken = () => {
    return Cookies.get('token');  
} 
export function addColis(data) {
    return async (dispatch) => {
        const user = JSON.parse(Cookies.get('user'));
        let store // Obtenez le store depuis le localStorage
        let id_user
        if(user && user.role === "client"){
            store = JSON.parse(Cookies.get('store'));
            id_user = store ? store._id : null;
        }else{
            id_user = user ? user._id : null;
        }

        const token = JSON.parse(getAuthToken());
        console.log(token);
        if (!token) {
            toast.error("Token is missing in local storage");
            return;
        }

        try {
            const response = await request.post(`/api/colis/`, 
                data , 
                {
                    headers: {
                        'authorization': `bearer ${token}`
                    },
                    params:{
                        id_user 
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

// Create Colis function
export function createColis(colis) {
    return async (dispatch) => {
        try {
            // Get token and user data from cookies
            const token =Cookies.get('token'); // Retrieve token as a string
            console.log("Token sent to backend:", token);
            const user = JSON.parse(Cookies.get('user')); // Parse user data from cookies
            console.log("User",user);
            // Debugging token to ensure it's correctly retrieved
            console.log("Token from cookies:", token);

            // Ensure both token and user data are available
            if (!token || !user) {
                throw new Error('Missing authentication token or user information.');
            }

            

            const decodedToken = decodeToken(token);
            console.log('Decoded Token:', decodedToken);

            // Check if token is expired
         
            // Determine if the user is a client, admin, or team member
            let idToUse;
            if (user.role === 'client') {
                // For clients, use the store ID from cookies
                const store = JSON.parse(Cookies.get('store')); // Parse store data from cookies
                console.log(store);
                if (!store?._id) {
                    throw new Error('Store information is missing.');
                }
                idToUse = store._id; // Use store ID for clients
            } else if (user.role === 'admin' || user.role === 'team') {
                // For admin or team, use the user ID
                idToUse = user._id; // Use user ID for admin or team
            } else {
                throw new Error('User role is not authorized to create a colis.');
            }

            // Set up headers with token in correct format
            const config = {
                headers: {
                    'authorization': `Bearer ${token}`, // Correct capitalization of Bearer
                    'Content-Type': 'application/json',
                }
            };

            // Make the POST request to create a colis with the determined ID
            const { data } = await request.post(`/api/colis/${idToUse}`, colis, config);

            // Show success notification
            toast.success(data.message);
        } catch (error) {
            // Show error notification
            toast.error(error.response?.data?.message || error.message || "Failed to create colis");
            console.error(error);
        }
    };
}