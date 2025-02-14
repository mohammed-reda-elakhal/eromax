import { noteColisActions } from "../slices/noteColisSlice";
import { toast } from "react-toastify";
import request from "../../utils/request";

// Get token and setup config headers
const getConfig = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Authentification token est manquant");
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// Get all NoteColis documents
export function getAllNoteColis() {
  return async (dispatch) => {
    dispatch(noteColisActions.fetchNoteColisStart());
    try {
      const config = getConfig();
      const { data } = await request.get(`/api/note/colis`, config);
      dispatch(noteColisActions.fetchNoteColisSuccess(data));
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch note colis";
      dispatch(noteColisActions.fetchNoteColisFailure(message));
      toast.error(message);
    }
  };
}

// Get a single NoteColis document by colisId
export function getNoteColisById(colisId) {
  return async (dispatch) => {
    dispatch(noteColisActions.fetchNoteColisStart());
    try {
      const config = getConfig();
      const { data } = await request.get(`/api/note/colis/${colisId}`, config);
      dispatch(noteColisActions.fetchNoteColisByIdSuccess(data));
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch note colis by ID";
      dispatch(noteColisActions.fetchNoteColisFailure(message));
      toast.error(message);
    }
  };
}

// Create a NoteColis document (if not exists) by colisId
export function createNoteColis(colisId) {
  return async (dispatch) => {
    dispatch(noteColisActions.fetchNoteColisStart());
    try {
      const config = getConfig();
      const { data } = await request.post(`/api/note/colis`, { colisId }, config);
      dispatch(noteColisActions.createNoteColisSuccess(data));
      toast.success("Note Colis created successfully!");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to create note colis";
      dispatch(noteColisActions.fetchNoteColisFailure(message));
      toast.error(message);
    }
  };
}

// Update or create a client note
export function updateClientNote(noteData) {
  // noteData should contain { colisId, note }
  return async (dispatch) => {
    dispatch(noteColisActions.fetchNoteColisStart());
    try {
      const config = getConfig();
      const { data } = await request.put(
        `/api/note/colis/client`,
        noteData,
        config
      );
      dispatch(noteColisActions.updateNoteColisSuccess(data));
      toast.success("Client note updated successfully!");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update client note";
      dispatch(noteColisActions.fetchNoteColisFailure(message));
      toast.error(message);
    }
  };
}

// Update or create a livreur note
export function updateLivreurNote(noteData) {
  // noteData should contain { colisId, note }
  return async (dispatch) => {
    dispatch(noteColisActions.fetchNoteColisStart());
    try {
      const config = getConfig();
      const { data } = await request.put(
        `/api/note/colis/livreur`,
        noteData,
        config
      );
      dispatch(noteColisActions.updateNoteColisSuccess(data));
      toast.success("Livreur note updated successfully!");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update livreur note";
      dispatch(noteColisActions.fetchNoteColisFailure(message));
      toast.error(message);
    }
  };
}

// Update or add an admin note
export function updateAdminNote(noteData) {
  // noteData should contain { colisId, note }
  return async (dispatch) => {
    dispatch(noteColisActions.fetchNoteColisStart());
    try {
      const config = getConfig();
      const { data } = await request.put(
        `/api/note/colis/admin`,
        noteData,
        config
      );
      dispatch(noteColisActions.updateNoteColisSuccess(data));
      toast.success("Admin note updated successfully!");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update admin note";
      dispatch(noteColisActions.fetchNoteColisFailure(message));
      toast.error(message);
    }
  };
}
