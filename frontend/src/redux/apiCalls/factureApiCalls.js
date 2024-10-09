import { toast } from "react-toastify";
import request from "../../utils/request";
import { factureActions } from "../slices/factureSlice";
import Cookies from "js-cookie";




// get data user
export function getFacture(type) {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/facture`, {
                params: { type } // Use 'params' for query parameters
            });
            dispatch(factureActions.setFacture(data.factures));
        } catch (error) {
            toast.error(error.message || "Failed to fetch notifications");
        }
    };
}

// Get facture details by code with optional type filter
export function getFactureDetailsByCode(codeFacture ) {
    return async (dispatch) => {
        try {
            // Send the type as a query parameter using 'params'
            const { data } = await request.get(`/api/facture/detail/${codeFacture}`);
            dispatch(factureActions.setFactureDetail(data.list));
        } catch (error) {
            toast.error(error.message || "Failed to fetch facture details");
        }
    };
}


