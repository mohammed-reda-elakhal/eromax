import { villeActions } from "../slices/villeSlice";
import { toast } from "react-toastify";
import request from "../../utils/request";

// Fetch all villes
export function getAllVilles() {
  return async (dispatch) => {
    dispatch(villeActions.fetchVillesStart());
    try {
      const { data } = await request.get(`/api/ville`);
      dispatch(villeActions.fetchVillesSuccess(data));
    } catch (error) {
      dispatch(villeActions.fetchVillesFailure(error.message || "Failed to fetch villes"));
      toast.error(error.message || "Failed to fetch villes");
    }
  };
}
