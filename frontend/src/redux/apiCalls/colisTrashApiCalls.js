import { toast } from "react-toastify";
import request from "../../utils/request";
import { colisTrashActions } from "../slices/colisTrashSlice";

/**
 * Get all trashed colis
 */
export function getTrashedColis(params = {}) {
  return async (dispatch) => {
    dispatch(colisTrashActions.setLoading(true));
    try {
      const { data } = await request.get('/api/colis/trash', { params });
      dispatch(colisTrashActions.getTrashedColisSuccess(data));
    } catch (error) {
      const message = error.response?.data?.message || "Erreur lors de la récupération des colis supprimés";
      dispatch(colisTrashActions.setError(message));
      toast.error(message);
    }
  };
}

/**
 * Get trash statistics
 */
export function getTrashStatistics() {
  return async (dispatch) => {
    try {
      const { data } = await request.get('/api/colis/trash/statistics');
      dispatch(colisTrashActions.setStatistics(data));
    } catch (error) {
      const message = error.response?.data?.message || "Erreur lors de la récupération des statistiques";
      toast.error(message);
    }
  };
}

/**
 * Move single colis to trash
 */
export function moveColisToTrash(colisId) {
  return async (dispatch) => {
    try {
      const { data } = await request.put(`/api/colis/trash/${colisId}`);
      toast.success(data.message);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Erreur lors du déplacement vers la corbeille";
      toast.error(message);
      throw error;
    }
  };
}

/**
 * Batch move colis to trash
 */
export function batchMoveColisToTrash(colisIds) {
  return async (dispatch) => {
    try {
      const { data } = await request.put('/api/colis/trash/batch/move', { colisIds });
      toast.success(data.message);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Erreur lors du déplacement en masse";
      toast.error(message);
      throw error;
    }
  };
}

/**
 * Restore single colis from trash
 */
export function restoreColisFromTrash(colisId) {
  return async (dispatch) => {
    try {
      const { data } = await request.put(`/api/colis/trash/restore/${colisId}`);
      toast.success(data.message);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Erreur lors de la restauration";
      toast.error(message);
      throw error;
    }
  };
}

/**
 * Batch restore colis from trash
 */
export function batchRestoreColisFromTrash(colisIds) {
  return async (dispatch) => {
    try {
      const { data } = await request.put('/api/colis/trash/batch/restore', { colisIds });
      toast.success(data.message);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Erreur lors de la restauration en masse";
      toast.error(message);
      throw error;
    }
  };
}

/**
 * Permanently delete single colis
 */
export function permanentlyDeleteColis(colisId) {
  return async (dispatch) => {
    try {
      const { data } = await request.delete(`/api/colis/trash/${colisId}`);
      toast.success(data.message);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Erreur lors de la suppression définitive";
      toast.error(message);
      throw error;
    }
  };
}

/**
 * Batch permanently delete colis
 */
export function batchPermanentlyDeleteColis(colisIds) {
  return async (dispatch) => {
    try {
      const { data } = await request.delete('/api/colis/trash/batch/delete', { data: { colisIds } });
      toast.success(data.message);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Erreur lors de la suppression en masse";
      toast.error(message);
      throw error;
    }
  };
}

/**
 * Empty entire trash
 */
export function emptyTrash() {
  return async (dispatch) => {
    try {
      const { data } = await request.delete('/api/colis/trash/empty/all');
      toast.success(data.message);
      dispatch(colisTrashActions.clearTrash());
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Erreur lors du vidage de la corbeille";
      toast.error(message);
      throw error;
    }
  };
}

