import { toast } from "react-toastify";
import request from "../../utils/request";
import { docActions } from "../slices/docSlices";

// Fonction pour télécharger les fichiers
 export const uploadFiles = (role, userId, formData) => {
  return async (dispatch) => {
    try {
      const { data } = await request.post(
        `http://localhost:8084/api/images/files/${role}/${userId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      dispatch(docActions.uploadFiles(data)); // Dispatch action to update the Redux store
      toast.success("Documents téléchargés avec succès");
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de téléchargement");
      console.log(error);
    }
  };
};
export const fetchUserDocuments = (role, userId) => {
  return async (dispatch) => {

    try{
      const data = await request.get(`http://localhost:8084/api/images/files/${role}/${userId}`);
      dispatch(docActions.getFiles(data)); // Dispatch action to update the Redux store
      toast.success("Documents téléchargés avec succès");




    }catch(error){
      toast.error(error.response?.data?.message || "Erreur lors de téléchargement");


    }

  }
  

};