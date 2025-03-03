import { toast } from "react-toastify";
import request from "../../utils/request";
import { factureActions } from "../slices/factureSlice";
import Cookies from "js-cookie";


// get data facture  --------------------------------
export function getFacture(type) {
    return async (dispatch) => {
        try {

            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentification token is missing');
                return;
            }
    
            const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
            };

            const { data } = await request.get(`/api/facture`, {params: { type }} , config);
            dispatch(factureActions.setFacture(data.factures));
        } catch (error) {
            toast.error(error.message || "Failed to fetch notifications");
        }
    };
}


export function getFactureClientByCode(code_facture) {
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
  
        const { data } = await request.get(`/api/facture/detail/client/${code_facture}`, config);
  
        // Dispatch the facture detail to the store
        dispatch(factureActions.setFactureDetail(data.facture));
  
        // Optionally update the promotion if provided in the response
        if (data.promotion) {
          dispatch(factureActions.setPromotion(data.promotion));
        }
      } catch (error) {
        console.error("Error fetching facture details:", error);
        toast.error(
          error.response?.data?.message || error.message || "Failed to fetch facture details"
        );
      }
    };
  }


  export function getFactureLivreurByCode(code_facture) {
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
  
        const { data } = await request.get(`/api/facture/detail/livreur/${code_facture}`, config);
  
        // Dispatch the facture detail to the store
        dispatch(factureActions.setFactureDetail(data.factures));
      } catch (error) {
        console.error("Error fetching facture details:", error);
        toast.error(
          error.response?.data?.message || error.message || "Failed to fetch facture details"
        );
      }
    };
  }

// get data user
export function getFactureGroupeByUser(type) {
    return async (dispatch) => {
        try {

            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentification token is missing');
                return;
            }
    
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                params: {
                    type
                },
            };

            const { data } = await request.get(`/api/facture/groupe/user` , config);
            dispatch(factureActions.setFactureGroupe(data.factures));
        } catch (error) {
            toast.error(error.message || "Failed to fetch notifications");
        }
    };
}

// get data user
export function getFactureByUser(storeId, type) {
    return async (dispatch) => {
        try {

            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentification token is missing');
                return;
            }
    
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
                params: {
                    storeId,
                    type,
                },
            };

            const { data } = await request.get(`/api/facture/user` , config);
            dispatch(factureActions.setFacture(data.factures));
        } catch (error) {
            toast.error(error.message || "Failed to fetch notifications");
        }
    };
}

// get data user
export function getFactureClient(store) {
    return async (dispatch) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication token is missing');
                return;
            }
    
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // add token to the headers
                },
            };

            const { data } = await request.get(`/api/facture/client?store=${store}`, config);
            dispatch(factureActions.setFacture(data.factures));
        } catch (error) {
            toast.error(error.message || "Failed to fetch notifications");
        }
    };
}
// get data user
export function getFactureLivreur(id) {
    return async (dispatch) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication token is missing');
                return;
            }
    
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // add token to the headers
                },
            };

            const { data } = await request.get(`/api/facture/livreur?livreurId=${id}`, config);
            dispatch(factureActions.setFacture(data.factures));
        } catch (error) {
            toast.error(error.message || "Failed to fetch notifications");
        }
    };
}

// get data user
export function getFactureRamasser() {
    return async (dispatch) => {
        try {
            
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentification token is missing');
                return;
            }
    
            const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
            };
            const { data } = await request.get(`/api/facture/ramasser` , config);
            dispatch(factureActions.setFactureRamasser(data.factures));
        } catch (error) {
            toast.error(error.message || "Failed to fetch notifications");
        }
    };
}

export function getFactureRamasserDetailsByCode(codeFacture ) {
    return async (dispatch) => {
        try {
            // Send the type as a query parameter using 'params'
            const { data } = await request.get(`/api/facture/ramasser/${codeFacture}`);
            dispatch(factureActions.setFactureDetailRamasser(data.facture));
        } catch (error) {
            toast.error(error.message || "Failed to fetch facture details");
        }
    };
}


// Action to toggle or set the 'etat' of a facture
export function setFactureEtat(id) {
    return async (dispatch) => {
      try {
        // Make the PUT request to toggle/update the facture etat
        const { data } = await request.put(`/api/facture/pay/${id}`);
        // data.facture should contain _id and etat
        // Dispatch an action that updates the correct facture in the store
        dispatch(
          factureActions.setFactureEtat({
            id: data.facture._id, // Match the '_id' field in the MongoDB response
            etat: data.facture.etat, // The toggled state (true/false)
          })
        );
        toast.success(data.message);
      } catch (error) {
        toast.error(error.message || "Failed to update facture status");
      }
    };
  }


export function getFactureDetailsByLivreur(id){
    return async (dispatch)=>{
        try{const {data}=await request.get(`/api/facture/detail/livreur/${id}`);
        dispatch(factureActions.setFacture(data.factures));
    }catch(error){
        toast.error(error.message || "Failed to fetch facture details");
    }
        
    }
}


// Fetch all FactureRetour with optional type filter
export function getFactureRetour(type) {
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
                params: { type } // Use 'params' for query parameters
            };
            
            const { data } = await request.get(`/api/facture/retour`, config);
            
            // Process data to match specified structure
            dispatch(factureActions.setFactureRetour(data.data));
        } catch (error) {
            toast.error(error.message || "Failed to fetch facture data");
        }
    };
}

export function getFactureRetourDetailsByCode(codeFacture ) {
    return async (dispatch) => {
        try {
            // Send the type as a query parameter using 'params'
            const { data } = await request.get(`/api/facture/retour/${codeFacture}`);
            dispatch(factureActions.setFactureDetailRetour(data.facture));
        } catch (error) {
            toast.error(error.message || "Failed to fetch facture details");
        }
    };
}


// New Action: Get Facture by Colis ID
export function getFactureByColis(colisId) {
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
                }
            };

            const { data } = await request.get(`/api/facture/colis/${colisId}`, config);
            dispatch(factureActions.setFactureDetail(data.factureContent));
            
        } catch (error) {
            // Handle specific error messages from backend
            if (error.response && error.response.status === 404) {
                dispatch(factureActions.setFactureDetail(null, null));
                toast.info(error.response.data.message || "Cette colis n'a pas de facture associée.");
            } else {
                toast.error(error.message || "Failed to fetch facture details");
            }
        }
    };
}

// New API call for merging factures
export function mergeFactures(factureCodes) {
    return async (dispatch, getState) => {
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
                }
            };

            const { data } = await request.post(`/api/facture/merge`, { factureCodes }, config);
            
            // Dispatch an action to add the merged facture
            dispatch(factureActions.addFacture(data.mergedFacture));

            // Remove original factures from the store
            const state = getState();
            factureCodes.forEach(code => {
                const currentFacture = state.facture.facture.find(f => f.code_facture === code);
                if (currentFacture) {
                    dispatch(factureActions.removeFacture(currentFacture._id));
                }
            });

            toast.success(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to merge factures");
        }
    };
}


// trasfer colis from facture -------------------------

export function transferColisClient({ code_facture_source, code_facture_distinataire, colisCodeSuivi , type }) {
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
  
        const { data } = await request.post(
          `/api/facture/transfer/${type}`,
          { code_facture_source, code_facture_distinataire, colisCodeSuivi },
          config
        );
  
  
        toast.success(data.message);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to transfer colis"
        );
      }
    };
  }
  

  export function removeColisFromFacture(code_facture, code_suivi) {
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

      const { data } = await request.delete(`/api/facture/colis/${code_facture}/${code_suivi}`, config);
      toast.success(data.message);
      // Optionally dispatch an action to update the store if needed.
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to remove colis from facture"
      );
    }
  };
}

export function deleteFacture(code_facture) {
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

      const { data } = await request.delete(`/api/facture/delete/${code_facture}`, config);
      toast.success(data.message);
      dispatch(factureActions.removeFacture(code_facture));
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to delete facture"
      );
    }
  };
}