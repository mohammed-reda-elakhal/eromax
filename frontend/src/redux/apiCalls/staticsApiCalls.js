import { toast } from "react-toastify";
import request from "../../utils/request";
import { staticsActions } from "../slices/StaticsSlice";

export function countColis() {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/count/colis`, {
            });
            dispatch(staticsActions.setAllColis(data));
        } catch (error) {
            toast.error(error.message || "Failed to fetch reclamations");
        }
    };
}
export function countColisLivre() {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/count/livres`, {
            });
            dispatch(staticsActions.setAllColisLivre(data));
        } catch (error) {
            toast.error(error.message || "Failed to fetch reclamations");
        }
    };
}

export function countColisLivreByRole(role,id) {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/count/livres/${role}/${id}`, {
            });
            dispatch(staticsActions.setColisLivreByRole(data));
        } catch (error) {
            toast.error(error.message || "Failed to fetch reclamations");
        }
    };
}
export function countColisAnnuleByRole(role,id) {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/count/annules/${role}/${id}`, {
            });
            dispatch(staticsActions.setColisCancealByRole(data));
        } catch (error) {
            toast.error(error.message || "Failed to fetch reclamations");
        }
    };
}