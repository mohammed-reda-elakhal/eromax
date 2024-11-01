import { storeActions } from "../slices/storeSlice";
import { toast } from "react-toastify";
import request from "../../utils/request";

// Fetch Stores by User ID
export function getStoreByUser(userId) {
  return async (dispatch) => {
    dispatch(storeActions.fetchStoresStart());
    try {
      const { data } = await request.get(`/api/store/user/${userId}`, {
        withCredentials: true,
      });
      dispatch(storeActions.fetchStoresSuccess(data));
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to fetch stores";
      dispatch(storeActions.fetchStoresFailure(errorMsg));
      toast.error(errorMsg);
    }
  };
}

// Create a New Store
export function createStore(userId, storeData, imageFile) {
  return async (dispatch) => {
    dispatch(storeActions.fetchStoresStart());
    try {
      // Create Store
      const { data } = await request.post(`/api/store/${userId}`, storeData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      dispatch(storeActions.fetchStoresSuccess([...data])); // Assuming data is the new store
      toast.success("Store created successfully");

      // Upload Image if provided
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);

        const uploadResult = await request.post(`/api/store/${data._id}/photo`, imageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        });
        dispatch(storeActions.updateStoreSuccess(uploadResult.data));
        toast.success("Store image uploaded successfully");
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to create store";
      dispatch(storeActions.fetchStoresFailure(errorMsg));
      toast.error(errorMsg);
    }
  };
}

// Update an Existing Store
export function updateStore(storeId, storeData, imageFile) {
  return async (dispatch) => {
    dispatch(storeActions.updateStoreStart());
    try {
      // Update Store Data
      const { data } = await request.put(`/api/store/${storeId}`, storeData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      dispatch(storeActions.updateStoreSuccess(data));
      toast.success("Store updated successfully");

      // Upload New Image if provided
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);

        const uploadResult = await request.post(`/api/store/${storeId}/photo`, imageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        });
        dispatch(storeActions.updateStoreSuccess(uploadResult.data));
        toast.success("Store image updated successfully");
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to update store";
      dispatch(storeActions.updateStoreFailure(errorMsg));
      toast.error(errorMsg);
    }
  };
}

// Delete a Store
export function deleteStore(storeId) {
  return async (dispatch) => {
    dispatch(storeActions.deleteStoreStart());
    try {
      await request.delete(`/api/store/${storeId}`, {
        withCredentials: true,
      });
      dispatch(storeActions.deleteStoreSuccess(storeId));
      toast.success("Store deleted successfully");
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to delete store";
      dispatch(storeActions.deleteStoreFailure(errorMsg));
      toast.error(errorMsg);
    }
  };
}
