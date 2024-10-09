import { toast } from "react-toastify";
import request from "../../utils/request";
import { meth_payementActions  } from "../slices/methPayementSlice";
import Cookies from "js-cookie";




// get data user 
// Get notifications with optional visibility filter
export function getMeth_payement() {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/meth`)
            console.log( "back data :" + data);
            
            dispatch(meth_payementActions.setMeth_payement(data));
        } catch (error) {
            toast.error(error.message || "Failed to fetch notifications");
        }
    };
}

// Create a new payment method
export function createMethodePayement(methData) {
    return async (dispatch) => {
      try {
        // Ensure FormData is passed correctly
        const { data } = await request.post(`/api/meth`, methData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        dispatch(meth_payementActions.addMeth_payement(data));
        toast.success(data.message);
      } catch (error) {
        toast.error(error.message || "Failed to create payment method");
      }
    };
  }

// Delete a payment method by ID
export const DeleteMethPayement = (id) => {
    return async (dispatch) => {
      try {
        await request.delete(`/api/meth/${id}`);
        dispatch(meth_payementActions.removeMeth_payement(id)); // Dispatch action to remove from state
        toast.success('Payment method deleted successfully');
      } catch (error) {
        toast.error('Failed to delete payment method');
      }
    };
  };