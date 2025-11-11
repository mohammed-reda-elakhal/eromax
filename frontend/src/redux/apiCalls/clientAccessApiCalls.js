import request from "../../utils/request";
import { authActions } from "../slices/authSlice";

/**
 * Get current client's features access (real-time)
 * No need to logout/login to see new features
 */
export function getMyAccess() {
    return async (dispatch) => {
        try {
            const { data } = await request.get("/api/client/my-access");
            
            console.log('[Stock Access] API Response:', data);
            
            if (data.success) {
                // Update user in Redux with latest features_access
                console.log('[Stock Access] Updating user with:', {
                    features_access: data.features_access,
                    stock_config: data.stock_config
                });
                
                dispatch(authActions.updateUserAccess({
                    features_access: data.features_access,
                    stock_config: data.stock_config
                }));
                
                return data;
            }
        } catch (error) {
            // Silent fail for non-clients or if endpoint doesn't exist
            // console.error("Error fetching access:", error);
            return null;
        }
    };
}

