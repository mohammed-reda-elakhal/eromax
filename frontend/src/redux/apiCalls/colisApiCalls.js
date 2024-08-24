import { toast } from "react-toastify";
import request from "../../utils/request";
import { colisActions } from "../slices/colisSlice";

// Fetch post
export function getColis() {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/colis/`);
            console.log(data);
            dispatch(colisActions.setColis(data));
        } catch (error) {
            // Handle different error cases
            if (error.response) {
                // The request was made and the server responded with a status code
                if (error.response.status === 401) {
                    toast.error("Unauthorized. Please check your credentials.");
                } else {
                    toast.error(`Error: ${error.response.data.message || "Failed to fetch colis"}`);
                }
            } else if (error.request) {
                // The request was made but no response was received
                toast.error("No response received. Please check your network.");
            } else {
                // Something happened in setting up the request
                toast.error("Error: " + error.message);
            }
        }
    };
}
