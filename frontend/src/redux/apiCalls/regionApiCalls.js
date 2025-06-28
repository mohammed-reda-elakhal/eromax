import { regionActions } from "../slices/regionSlice";
import { toast } from "react-toastify";
import request from "../../utils/request";

// Fetch all regions
export function getAllRegions() {
  return async (dispatch) => {
    dispatch(regionActions.fetchRegionsStart());
    try {
      const { data } = await request.get(`/api/region`);
      dispatch(regionActions.fetchRegionsSuccess(data));
    } catch (error) {
      dispatch(regionActions.fetchRegionsFailure(error.message || "Failed to fetch regions"));
      toast.error(error.message || "Failed to fetch regions");
    }
  };
}

// Fetch a single region by ID
export function getRegionById(id) {
  return async (dispatch) => {
    dispatch(regionActions.fetchRegionsStart());
    try {
      const { data } = await request.get(`/api/region/${id}`);
      dispatch(regionActions.fetchRegionByIdSuccess(data));
    } catch (error) {
      dispatch(regionActions.fetchRegionsFailure(error.message || "Failed to fetch region by ID"));
      toast.error(error.message || "Failed to fetch region by ID");
    }
  };
}

// Add a new region
export function ajoutRegion(regionData) {
  return async (dispatch) => {
    dispatch(regionActions.fetchRegionsStart());
    try {
      const { data } = await request.post(`/api/region`, regionData);
      dispatch(regionActions.addRegionSuccess(data));
      toast.success("Région ajoutée avec succès!");
    } catch (error) {
      dispatch(regionActions.fetchRegionsFailure(error.message || "Failed to add region"));
      toast.error(error.message || "Failed to add region");
    }
  };
}

// Update a region by ID
export function updateRegion(id, updatedData) {
  return async (dispatch) => {
    dispatch(regionActions.fetchRegionsStart());
    try {
      const { data } = await request.put(`/api/region/${id}`, updatedData);
      dispatch(regionActions.updateRegionSuccess(data));
      toast.success("Région mise à jour avec succès!");
    } catch (error) {
      dispatch(regionActions.fetchRegionsFailure(error.message || "Failed to update region"));
      toast.error(error.message || "Failed to update region");
    }
  };
}

// Delete a region by ID
export function deleteRegion(id) {
  return async (dispatch) => {
    dispatch(regionActions.fetchRegionsStart());
    try {
      await request.delete(`/api/region/${id}`);
      dispatch(regionActions.deleteRegionSuccess(id));
      toast.success("Région supprimée avec succès!");
    } catch (error) {
      dispatch(regionActions.fetchRegionsFailure(error.message || "Failed to delete region"));
      toast.error(error.message || "Failed to delete region");
    }
  };
} 