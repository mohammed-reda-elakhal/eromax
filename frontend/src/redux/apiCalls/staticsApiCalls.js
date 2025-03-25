// statics Api call 
import { toast } from "react-toastify";
import request from "../../utils/request";
import { staticsActions } from "../slices/StaticsSlice";
import Cookies from "js-cookie";


export function getStatisticColis() {
    return async (dispatch) => {
        try {
              // Get token from cookies
          const token = localStorage.getItem('token');
          if (!token) {
              toast.error('Authentification token est manquant');
              return;
          }

          // Set up headers with the token
          const config = {
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
              },
          };

            const { data } = await request.get(`/api/statistic/colis`, config);

            dispatch(staticsActions.setColisData(data.data));

        } catch (error) {
            console.error(error.message || "Failed to fetch colis statistic");
        }
    };
}

export function getStatisticArgent() {
    return async (dispatch) => {
        try {
              // Get token from cookies
          const token = localStorage.getItem('token');
          if (!token) {
              toast.error('Authentification token est manquant');
              return;
          }

          // Set up headers with the token
          const config = {
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
              },
          };

            const { data } = await request.get(`/api/statistic/transaction`, config);

            dispatch(staticsActions.setArgentData(data.data));

        } catch (error) {
            console.error(error.message || "Failed to fetch colis statistic");
        }
    };
}

export function getStatisticVille() {
    return async (dispatch) => {
        try {
              // Get token from cookies
          const token = localStorage.getItem('token');
          if (!token) {
              toast.error('Authentification token est manquant');
              return;
          }

          // Set up headers with the token
          const config = {
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
              },
          };

            const { data } = await request.get(`/api/statistic/ville`, config);

            dispatch(staticsActions.setVilleData(data.data));

        } catch (error) {
            console.error(error.message || "Failed to fetch colis statistic");
        }
    };
}
export function getStatisticClient() {
    return async (dispatch) => {
        try {
              // Get token from cookies
          const token = localStorage.getItem('token');
          if (!token) {
              toast.error('Authentification token est manquant');
              return;
          }

          // Set up headers with the token
          const config = {
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
              },
          };

            const { data } = await request.get(`/api/statistic/client`, config);

            dispatch(staticsActions.setClientData(data.data));

        } catch (error) {
            console.error(error.message || "Failed to fetch colis statistic");
        }
    };
}



export function countColisByRole(role,id) {
    return async (dispatch) => {
        try {
            const { data } = await request.get(`/api/count/colis/${role}/${id}`, {
            });

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
            dispatch(staticsActions.setTotalGains(data.totalGains));
        } catch (error) {
            console.error(error.message || "Failed to fetch reclamations");
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
            console.error(error.message || "Failed to fetch last Transaction ");
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
            console.error(error.message || "Failed to fetch last Transaction ");
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
            console.error(error.message || "Failed to fetch last Transaction ");
        }
    };
}

export function getStatisticColisReporteeProg() {
    return async (dispatch) => {
        try {
            // Get token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentification token est manquant');
                return;
            }
            // Set up headers with the token
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };
            // Call the endpoint that returns both count and list of code_suivi
            const { data } = await request.get(`/api/statistic/colis/reporte`, config);
            // data should be in the format { count: <number>, codes: [ { code_suivi: ... }, ... ] }
            dispatch(staticsActions.setColisReporteeProgData(data));
        } catch (error) {
            console.error(error.message || "Failed to fetch reportée/programmée data");
        }
    };
}

export function getTransferStatistics() {
    return async (dispatch) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication token is missing');
                return;
            }

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };

            const { data } = await request.get(`/api/statistic/transfer/statistics`, config);

            dispatch(staticsActions.setArgentData(data.data));
        } catch (error) {
            console.error(error.message || "Failed to fetch transfer statistics");
        }
    };
}

export function getIncompleteWithdrawals() {
    return async (dispatch) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication token is missing');
                return;
            }

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };

            const { data } = await request.get(`/api/statistic/withdrawal/incomplete`, config);
            dispatch(staticsActions.setIncompleteWithdrawals(data.count));
        } catch (error) {
            console.error(error.message || "Failed to fetch incomplete withdrawals count");
        }
    };
}