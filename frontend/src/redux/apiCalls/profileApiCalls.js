import { toast } from "react-toastify";
import request from "../../utils/request";
import { profileActions } from "../slices/profileSlice";

// Fetch profile data for a client
export function getProfileClient(userId) {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/client/${userId}`);
            dispatch(profileActions.setProfile(data));
        } catch (error) {
            toast.error(error.message || "Failed to fetch profile");
        }
    };
}
