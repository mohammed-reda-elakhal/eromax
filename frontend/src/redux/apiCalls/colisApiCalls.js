import { toast } from "react-toastify";
import request from "../../utils/request";
import { colisActions } from "../slices/colisSlice";
import Cookies from "js-cookie";
import { decodeToken } from "../../utils/tokenUtils";
import { jwtDecode } from "jwt-decode";


// Fetch post
export function getColis(statut) {
    return async (dispatch) => {
        try {
            const token = Cookies.get('token');
            if(!token){
                toast.error('Authentification token is missing')
            }
            const config = {
                headers: {
                    'authorization': `Bearer ${token}`, // Correct capitalization of Bearer
                    'Content-Type': 'application/json',
                }
            };
            const { data } = await request.get(`/api/colis?statut=${statut}`, config);
            dispatch(colisActions.setColis(data)); // Use action creator
        } catch (error) {
            console.error("Failed to fetch colis:", error);
            dispatch(colisActions.setError(error.message));
        }
    };
}

// Fetch post
// Fix the request by appending `statu` as a query parameter
export function getColisByStatu(statut) {
    return async (dispatch) => {
        try {
            const token = Cookies.get('token');
            if(!token){
                toast.error('Authentification token is missing')
            }
            const config = {
                headers: {
                    'authorization': `Bearer ${token}`, // Correct capitalization of Bearer
                    'Content-Type': 'application/json',
                }
            };
            const { data } = await request.get(`/api/colis/select/status?statu=${statut}`,config);
            dispatch(colisActions.setColis(data)); // Use action creator
            console.log(data);
        } catch (error) {
            console.error("Failed to fetch colis:", error);
            dispatch(colisActions.setError(error.message));
        }
    };
}


export const getColisForClient = (storeId , statut) => async (dispatch) => {
    dispatch(colisActions.setLoading(true));
    try {
        const token = Cookies.get('token');
        if(!token){
            toast.error('Authentification token is missing')
            
        }

        const config = {
            headers: {
                'authorization': `Bearer ${token}`, // Correct capitalization of Bearer
                'Content-Type': 'application/json',
            }
        };
        const { data } = await request.get(`/api/colis/${storeId}?statut=${statut}`,config);
        dispatch(colisActions.setColis(data)); // Use action creator
    } catch (error) {
        console.error("Failed to fetch colis for client:", error);
        dispatch(colisActions.setError("Failed to fetch colis: " + error.message));
    }
};
/*  */

// Create Colis function
export function createColis(colis) {
    return async (dispatch) => {
        try {
            // Get token and user data from cookies
            const token =Cookies.get('token'); // Retrieve token as a string
            const user = JSON.parse(Cookies.get('user')); // Parse user data from cookies
            // Ensure both token and user data are available
            if (!token || !user) {
                throw new Error('Missing authentication token or user information.');
            }

            


            const decodedToken = decodeToken(token);
            console.log('Decoded Token:', decodedToken);
            

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
export const getColisForLivreur = (userId,statut) => async (dispatch) => {
    dispatch(colisActions.setLoading(true));
    try {
        const token =Cookies.get('token'); // Retrieve token as a string
        const config = {
            headers: {
                'authorization': `Bearer ${token}`, // Correct capitalization of Bearer
                'Content-Type': 'application/json',
            }
        };
        // Fetch the data from the API
        const { data } = await request.get(`/api/colis/getColisLiv/${userId}?statut=${statut}`,config);
        dispatch(colisActions.setColis(data)); // Use action creator
    } catch (error) {
        console.error("Failed to fetch colis for client:", error);
        dispatch(colisActions.setError("Failed to fetch colis: " + error.message));
    }
};
export const affecterLivreur=(colisId,livreurId)=>async(dispatch)=>{
    try{
        const token = Cookies.get('token');
        if(!token){
            toast.error('Authentification token is missing')
        }
        const config={
            headers:{
                'authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',

            }
        };
        const body={
            colisId:colisId,
            livreurId:livreurId
        }
        const data = await request.post(`api/livreur/colis`,body);

        dispatch(colisActions.updateColis(data.colis));

    }catch(error){
        toast.error(error.response?.data?.message || 'Failed to assign livreur');
        dispatch(colisActions.setError(error.message));

    }

}
export const updateStatut = (colisId, newStatus) => async (dispatch) => {
    if (!colisId) {
        toast.error('ID de colis manquant');
        return;
    }
    console.log('inside update api call');
    // Retrieve the authentication token
    const token = Cookies.get('token');
    const user = JSON.parse(Cookies.get('user')); // Parse user data from cookies
    if (!token) {
        toast.error('Authentication token is missing');
        return;
    }
    // Configuration for the API request
    const config = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    };

    // Request body
    const body = {
        new_status: newStatus
    };

    try {
        // Make the API request to update the status
        const {data} = await request.put(`/api/colis/St/${colisId}`,body);
        console.log('colisID',colisId);
        // Handle success
        dispatch(colisActions.updateColis(data.colis)); // Assuming you have an action to update the colis
        toast.success("Colis status updated successfully!");
    } catch (error) {
        // Handle error
        toast.error(error.response?.data?.message || "Failed to update colis status");
        console.error("Update status error:", error);
    }
};

export const colisProgramme=(colisId,daysToAdd)=>async(dispatch)=>{
    try {
        // Dispatch the loading action
        dispatch(colisActions.setLoading(true));

        // Make the API request to schedule the delivery
        const data = await request.post('http://localhost:8084/api/client/programme', {
            colisId,
            daysToAdd
        });

        // Assuming the response contains the updated colis data
        dispatch(colisActions.addColis(data.colis)); // Add the scheduled colis to the state

        // Dispatch the success state to stop loading
        dispatch(colisActions.setLoading(false));
    } catch (error) {
        console.error("Error scheduling delivery:", error);

        // Dispatch the error action to set the error message
        dispatch(colisActions.setError(error.response?.data?.message || "Error scheduling delivery"));

        // Stop loading in case of failure
        dispatch(colisActions.setLoading(false));
    }
    

}