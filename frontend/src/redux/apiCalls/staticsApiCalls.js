// statics Api call 
import { toast } from "react-toastify";
import request from "../../utils/request";
import { staticsActions } from "../slices/StaticsSlice";



export function countColisByRole(role,id) {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/count/colis/${role}/${id}`, {
            });

            dispatch(staticsActions.setAllColis(data.totalColis));

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

            dispatch(staticsActions.setColisLivreByRole(data.totalColis));

        } catch (error) {
            toast.error(error.message || "Failed to fetch reclamations");
        }
    };
}
export function countColisRetourByRole(role,id) {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/count/retour/${role}/${id}`, {
            });

            dispatch(staticsActions.setColisRetour(data.totalColis));

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
            dispatch(staticsActions.setColisCancealByRole(data.totalColis));
        } catch (error) {
            toast.error(error.message || "Failed to fetch reclamations");
        }
    };
}
export function countGainsByRole(role,id) {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/count/gains/total/${role}/${id}`, {
            });
            dispatch(staticsActions.setTotalGains(data.totalGains));
        } catch (error) {
            toast.error(error.message || "Failed to fetch reclamations");
        }
    };
}
export function getLastTransaction(store) {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/count/last-transaction/${store}`, {
            });
            dispatch(staticsActions.setLastTransac(data.transaction));
        } catch (error) {
            toast.error(error.message || "Failed to fetch last Transaction ");
        }
    };
}
export function getBigTransaction(store) {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/count/big-transaction/${store}`, {
            });
            dispatch(staticsActions.setBigTransac(data.transaction));
        } catch (error) {
            toast.error(error.message || "Failed to fetch last Transaction ");
        }
    };
}
export function getTopVille(store) {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/count/topVille/${store}`, {
            });
            dispatch(staticsActions.setTopVille(data.top10Villes));
        } catch (error) {
            toast.error(error.message || "Failed to fetch last Transaction ");
        }
    };
}