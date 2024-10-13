import { toast } from "react-toastify";
import request from "../../utils/request";
import { transactionActions } from "../slices/transactionSlice";

export function getAllTransaction() {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/transaction/`);
            console.log('Transaction List', data);
            dispatch(transactionActions.setTransaction(data));
        } catch (error) {
            toast.error(error.message || "Failed to fetch transaction List");
        }
    };
}
