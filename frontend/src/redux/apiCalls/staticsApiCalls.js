// statics Api call 
import { toast } from "react-toastify";
import request from "../../utils/request";
import { staticsActions } from "../slices/StaticsSlice";


export function countColisLivre() {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/count/livres`, {
            });
            dispatch(staticsActions.setAllColisLivre(data));
        } catch (error) {
            console.error(error.message || "Failed to fetch reclamations");
        }
    };
}
export function countColisByRole(role,id) {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/count/colis/${role}/${id}`, {
            });
            console.log("Data from countColisByRole:",data.totalColis); // Debug line

            dispatch(staticsActions.setAllColis(data.totalColis));

        } catch (error) {
            console.error(error.message || "Failed to fetch reclamations");
        }
    };
}
export function countColisLivreByRole(role,id) {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/count/livres/${role}/${id}`, {
            });
            console.log("Data from countColisLivreByRole:",data.totalColis); // Debug line

            dispatch(staticsActions.setColisLivreByRole(data.totalColis));

        } catch (error) {
            console.error(error.message || "Failed to fetch reclamations");
        }
    };
}
export function countColisRetourByRole(role,id) {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/count/retour/${role}/${id}`, {
            });
            console.log("Data from countColisRetour ByRole:",data.totalColis); // Debug line

            dispatch(staticsActions.setColisRetour(data.totalColis));

        } catch (error) {
            console.error(error.message || "Failed to fetch reclamations");
        }
    };
}
export function countColisAnnuleByRole(role,id) {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/count/annules/${role}/${id}`, {
            });
            console.log("Data from countColis Annule bt Role:",data.totalColis); // Debug line
            dispatch(staticsActions.setColisCancealByRole(data.totalColis));
        } catch (error) {
            console.error(error.message || "Failed to fetch reclamations");
        }
    };
}
export function countGainsByRole(role,id) {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/count/gains/total/${role}/${id}`, {
            });
            console.log("Total Gains:",data.totalGains); // Debug line
            dispatch(staticsActions.setTotalGains(data.totalGains));
        } catch (error) {
            console.error(error.message || "Failed to fetch reclamations");
        }
    };
}
