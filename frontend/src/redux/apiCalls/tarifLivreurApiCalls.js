// tarifLivreurApiCalls.js
import { tarifLivreurActions } from "../slices/tarifLivreurSlice";
import { toast } from "react-toastify";
import request from "../../utils/request";

// Fetch all TarifLivreurs
export function getAllTarifLivreurs() {
  return async (dispatch) => {
    dispatch(tarifLivreurActions.fetchTarifLivreursStart());
    try {
      const { data } = await request.get(`/api/tarif-livreur`);
      dispatch(tarifLivreurActions.fetchTarifLivreursSuccess(data));
    } catch (error) {
      dispatch(tarifLivreurActions.fetchTarifLivreursFailure(error.message || "Failed to fetch TarifLivreurs"));
      toast.error(error.message || "Failed to fetch TarifLivreurs");
    }
  };
}

// Fetch a single TarifLivreur by ID
export function getTarifLivreurById(id) {
  return async (dispatch) => {
    dispatch(tarifLivreurActions.fetchTarifLivreurStart());
    try {
      const { data } = await request.get(`/api/tarif-livreur/${id}`);
      dispatch(tarifLivreurActions.fetchTarifLivreurByIdSuccess(data));
    } catch (error) {
      dispatch(tarifLivreurActions.fetchTarifLivreursFailure(error.message || "Failed to fetch TarifLivreur by ID"));
      toast.error(error.message || "Failed to fetch TarifLivreur by ID");
    }
  };
}

// Fetch TarifLivreurs by Livreur ID
export function getTarifLivreurByLivreur(livreurId) {
  return async (dispatch) => {
    dispatch(tarifLivreurActions.fetchTarifLivreurStart());
    try {
      const { data } = await request.get(`/api/tarif-livreur/livreur/${livreurId}`);
      dispatch(tarifLivreurActions.fetchTarifLivreurByLivreurSuccess(data));
    } catch (error) {
      dispatch(tarifLivreurActions.fetchTarifLivreursFailure(error.message || "Failed to fetch TarifLivreur by Livreur"));
      toast.error(error.message || "Failed to fetch TarifLivreur by Livreur");
    }
  };
}

// Fetch TarifLivreurs by Ville ID
export function getTarifLivreurByVille(villeId) {
  return async (dispatch) => {
    dispatch(tarifLivreurActions.fetchTarifLivreurStart());
    try {
      const { data } = await request.get(`/api/tarif-livreur/ville/${villeId}`);
      dispatch(tarifLivreurActions.fetchTarifLivreurByVilleSuccess(data));
    } catch (error) {
      dispatch(tarifLivreurActions.fetchTarifLivreursFailure(error.message || "Failed to fetch TarifLivreur by Ville"));
      toast.error(error.message || "Failed to fetch TarifLivreur by Ville");
    }
  };
}

// Add a new TarifLivreur
export function createTarifLivreur(tarifLivreurData) {
  return async (dispatch) => {
    dispatch(tarifLivreurActions.fetchTarifLivreursStart());
    try {
      const { data } = await request.post(`/api/tarif-livreur`, tarifLivreurData);
      dispatch(tarifLivreurActions.createTarifLivreurSuccess(data));
      toast.success("TarifLivreur created successfully!");
    } catch (error) {
      dispatch(tarifLivreurActions.fetchTarifLivreursFailure(error.message || "Failed to create TarifLivreur"));
      toast.error(error.message || "Failed to create TarifLivreur");
    }
  };
}

// Update a TarifLivreur
export function updateTarifLivreur(id, updatedData) {
  return async (dispatch) => {
    dispatch(tarifLivreurActions.fetchTarifLivreursStart());
    try {
      const { data } = await request.put(`/api/tarif-livreur/${id}`, updatedData);
      dispatch(tarifLivreurActions.updateTarifLivreurSuccess(data));
      toast.success("TarifLivreur updated successfully!");
    } catch (error) {
      dispatch(tarifLivreurActions.fetchTarifLivreursFailure(error.message || "Failed to update TarifLivreur"));
      toast.error(error.message || "Failed to update TarifLivreur");
    }
  };
}

// Delete a TarifLivreur
export function deleteTarifLivreur(id) {
  return async (dispatch) => {
    dispatch(tarifLivreurActions.fetchTarifLivreursStart());
    try {
      await request.delete(`/api/tarif-livreur/${id}`);
      dispatch(tarifLivreurActions.deleteTarifLivreurSuccess(id));
      toast.success("TarifLivreur deleted successfully!");
    } catch (error) {
      dispatch(tarifLivreurActions.fetchTarifLivreursFailure(error.message || "Failed to delete TarifLivreur"));
      toast.error(error.message || "Failed to delete TarifLivreur");
    }
  };
}
