import { toast } from "react-toastify";
import request from "../../utils/request";
import { messageActions } from "../slices/messageSlice";
import Cookies from "js-cookie";

// Fetch today's withdrawal requests (DemandeRetrait)
export function getMessage(id) {
    return async (dispatch) => {

        try {
            const { data } = await request.get(`/api/admin/message/${id}`);
            dispatch(messageActions.setMessage(data.messageAdmin));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch today's withdrawal requests");
        }
    };
}

// Update the super admin message
export function updateMessage(newMessage , id) {
    return async (dispatch) => {
        try {
            const { data } = await request.patch(`/api/admin/message/${id}`, {
                message: newMessage
            });

            // Dispatch action to update message in Redux state
            dispatch(messageActions.setMessage(data.superAdmin.message));

            // Show success toast
            toast.success("Super admin message updated successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update message");
        }
    };
}

