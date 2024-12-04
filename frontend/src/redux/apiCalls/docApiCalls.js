// redux/apiCalls/docApiCalls.js

import { toast } from "react-toastify";
import request from "../../utils/request";
import { docActions } from "../slices/docSlices";

// Function to upload files
export const uploadFiles = (role, userId, formData) => {
  return async (dispatch) => {
    try {
      const { data } = await request.post(`/api/images/files/${role}/${userId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      dispatch(docActions.uploadFiles(data.file)); // Dispatch action with the uploaded file
      toast.success("Documents téléchargés avec succès");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Erreur lors du téléchargement";
      toast.error(errorMsg);
      console.error("Upload Error:", error);
      throw error; // Propagate the error to handle it in the component
    }
  };
};

// Function to fetch user documents
export const fetchUserDocuments = (role, userId) => {
  return async (dispatch) => {
    try {
      const { data } = await request.get(`/api/images/files/${role}/${userId}`);
      dispatch(docActions.getFiles(data.documents)); // Dispatch action with the documents array
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Erreur lors de la récupération des documents";
      toast.error(errorMsg);
      console.error("Fetch Documents Error:", error);
      throw error; // Propagate the error to handle it in the component
    }
  };
};
