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

// Fetch a single ville by ID
export function getVilleById(id) {
  return async (dispatch) => {
    dispatch(villeActions.fetchVillesStart());
    try {
      const { data } = await request.get(`/api/ville/${id}`);
      dispatch(villeActions.fetchVilleByIdSuccess(data)); // Dispatching to the new action
    } catch (error) {
      dispatch(villeActions.fetchVillesFailure(error.message || "Failed to fetch ville by ID"));
      toast.error(error.message || "Failed to fetch ville by ID");
    }
  };
}

// Fetch a single ville by ID
export function resetVille() {
  return async (dispatch) => {
   
      dispatch(villeActions.fetchVilleByIdSuccess(null)); // Dispatching to the new action
  };
}

// Add a new ville
export function ajoutVille(villeData) {
  return async (dispatch) => {
    dispatch(villeActions.fetchVillesStart());
    try {
      const { data } = await request.post(`/api/ville`, villeData);
      dispatch(villeActions.addVilleSuccess(data));
      toast.success("Ville ajoutée avec succès!");
    } catch (error) {
      dispatch(villeActions.fetchVillesFailure(error.message || "Failed to add ville"));
      toast.error(error.message || "Failed to add ville");
    }
  };
}

// Update a ville by ID
export function updateVille(id, updatedData) {
  return async (dispatch) => {
    dispatch(villeActions.fetchVillesStart());
    try {
      const { data } = await request.put(`/api/ville/${id}`, updatedData);
      dispatch(villeActions.updateVilleSuccess(data));
      toast.success("Ville mise à jour avec succès!");
    } catch (error) {
      dispatch(villeActions.fetchVillesFailure(error.message || "Failed to update ville"));
      toast.error(error.message || "Failed to update ville");
    }
  };
}

// Delete a ville by ID
export function deleteVille(id) {
  return async (dispatch) => {
    dispatch(villeActions.fetchVillesStart());
    try {
      await request.delete(`/api/ville/${id}`);
      dispatch(villeActions.deleteVilleSuccess(id));
      toast.success("Ville supprimée avec succès!");
    } catch (error) {
      dispatch(villeActions.fetchVillesFailure(error.message || "Failed to delete ville"));
      toast.error(error.message || "Failed to delete ville");
    }
  };
}
