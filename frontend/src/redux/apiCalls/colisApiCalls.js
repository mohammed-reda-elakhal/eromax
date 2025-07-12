import { toast } from "react-toastify";
import request from "../../utils/request";
import { colisActions } from "../slices/colisSlice";
import Cookies from "js-cookie";
import { decodeToken } from "../../utils/tokenUtils";
import { jwtDecode } from "jwt-decode";
import axios from 'axios';


// Create Multiple Colis Function
export function createColisAdmin(colis) {
  return async (dispatch) => {
    try {
      // Get token and user data from cookies
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      // Check for token and user data
      if (!token || !user) {
        throw new Error('Missing authentication token or user information.');
      }

      // Set up headers with the token
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      // Send a POST request to create a single colis with `replacedColis` if available
      const { data } = await request.post(`/api/colis/admin/${colis?.store}`, colis, config);

      // Display success notification
      toast.success(data.message || 'Colis créés avec succès');

    } catch (error) {
      // Error handling
      toast.error(error.response?.data?.message || error.message || "Failed to create colis");
      console.error("Error creating colis:", error);
      dispatch(colisActions.setError(error.response?.data?.message || "Failed to create colis"));
    }
  };
}
// Create Multiple Colis Function
export function createMultipleColis(colisList) {
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

          // Send POST request to create multiple colis
          const { data } = await request.post('/api/colis', colisList, config);

          // Check if data and data.colis exist
          if (data && Array.isArray(data.colis)) {
              // Dispatch addMultipleColis with the array of colis
              dispatch(colisActions.addMultipleColis(data.colis));
              toast.success(data.message || 'Colis créés avec succès');
          } else {
              // Handle unexpected response structure
              toast.error('Structure de réponse inattendue lors de la création des colis');
              dispatch(colisActions.setError('Structure de réponse inattendue lors de la création des colis'));
          }

      } catch (error) {
          console.error("Failed to create multiple colis:", error);
          // Extract error message from response if available
          const errorMessage = error.response?.data?.message || error.message || "Échec de la création des colis";
          toast.error(errorMessage);
          dispatch(colisActions.setError(errorMessage));
      }
  };
}



// redux/apiCalls/colisApiCalls.js

export function getColis(filters = {}) {
  return async (dispatch) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token is missing');
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`, // Correct capitalization of Bearer
          'Content-Type': 'application/json',
        },
        params: {
          statut: filters.statut || '',
          store: filters.store || '',
          ville: filters.ville || '',
          livreur: filters.livreur || '', // **Added livreur parameter**
          dateFrom: filters.dateFrom || '',
          dateTo: filters.dateTo || '',
          dateRange: filters.dateRange || '',
        },
      };

      dispatch(colisActions.setLoading(true)); // Set loading state to true

      const { data } = await request.get(`/api/colis`, config);

      dispatch(colisActions.setColis(data)); // Use action creator
    } catch (error) {
      console.error("Failed to fetch colis:", error);
      dispatch(colisActions.setError(error.message));
      toast.error("Failed to load colis.");
    }
  };
}


// Fetch post
export function getColisAmeex() {
    return async (dispatch) => {
        try {
            const token = localStorage.getItem('token');
            if(!token){
                toast.error('Authentification token is missing')
            }
            const config = {
                headers: {
                    'authorization': `Bearer ${token}`, // Correct capitalization of Bearer
                    'Content-Type': 'application/json',
                }
            };
            const { data } = await request.get(`/api/colis/send/ameex`, config);
            dispatch(colisActions.setColis(data)); // Use action creator
        } catch (error) {
            console.error("Failed to fetch colis:", error);
            dispatch(colisActions.setError(error.message));
        }
    };
}

// Fetch Colis Ameex Status Async Action
export function getColisAmeexAsyncStatu() {
  return async (dispatch) => {
      try {
          const token = localStorage.getItem('token');
          if (!token) {
              toast.error('Authentication token is missing');
              throw new Error('Authentication token is missing');
          }

          const config = {
              headers: {
                  'Authorization': `Bearer ${token}`, // Correct capitalization
                  'Content-Type': 'application/json',
              }
          };

          // Dispatch loading state
          dispatch(colisActions.setLoading(true));

          // Correctly formatted PUT request
          const { data } = await request.put(`/api/colis/send/ameex`, {}, config);

          // Dispatch loading end
          dispatch(colisActions.setLoading(false));

          // Show success message
          toast.success(data.message);

          // Optionally, refresh the colis data
          dispatch(getColisAmeex()); // Ensure getColisAmeex is correctly imported
      } catch (error) {
          console.error("Failed to fetch colis:", error);
          dispatch(colisActions.setError(error.response?.data?.message || error.message));
          dispatch(colisActions.setLoading(false));
          toast.error(error.response?.data?.message || 'Failed to fetch colis');
      }
  };
}

// set colis pret payant
export const setColisPayant = (identifier) => async (dispatch) => {
  dispatch(colisActions.setLoading(true));
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token is missing');
    }

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    // Make the API request to update the pret_payant field
    const { data } = await request.patch(`/api/colis/pret_payant/${identifier}`, {}, config);

    // Dispatch the updated Colis to the Redux state
    dispatch(colisActions.updateColis(data.data));

    const statusMessage = data.data.pret_payant ? 'marked as ready to pay' : 'unmarked as ready to pay';
    toast.success(`Colis ${statusMessage} successfully!`);

    return data;
  } catch (error) {
    console.error("Error updating Colis payment status:", error);
    dispatch(colisActions.setError(error.message));
    toast.error(error.response?.data?.message || "Failed to update Colis payment status");
    throw error;
  } finally {
    dispatch(colisActions.setLoading(false));
  }
};

// Fetch a single colis by `code_suivi`
export function getColisByCodeSuivi(code_suivi) {
    return async (dispatch) => {
      dispatch(colisActions.setLoading(true));
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Authentication token is missing');
          dispatch(colisActions.setLoading(false));
          return;
        }

        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        };

        const { data } = await request.get(`/api/colis/code_suivi/${code_suivi}`, config);
        dispatch(colisActions.setSelectedColis(data));
      } catch (error) {
        console.error("Failed to fetch colis by code_suivi:", error);
        dispatch(colisActions.setError(error.message));
        toast.error('Failed to fetch colis by code_suivi');
      } finally {
        dispatch(colisActions.setLoading(false));
      }
    };
}

// Update a Colis by _id
export function updateColisById(id, colisData) {
  return async (dispatch) => {
    dispatch(colisActions.setLoading(true));
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token is missing');
        dispatch(colisActions.setLoading(false));
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const { data } = await request.put(`/api/colis/${id}`, colisData, config);
      dispatch(colisActions.updateColis(data));
      
      // Update selectedColis if it matches the updated colis
      dispatch(colisActions.setSelectedColis(data));
      
      // Show specific message if livreur was updated
      if (colisData.livreur !== undefined) {
        if (colisData.livreur) {
          toast.success('Colis updated successfully - Livreur assigned');
        } else {
          toast.success('Colis updated successfully - Livreur removed');
        }
      } else {
        toast.success('Colis updated successfully');
      }
    } catch (error) {
      console.error("Failed to update colis:", error);
      dispatch(colisActions.setError(error.message));
      toast.error('Failed to update colis');
    } finally {
      dispatch(colisActions.setLoading(false));
    }
  };
}

// delete colis
export function deleteColis(id) {
  return async (dispatch) => {
    try {
      const { data } = await request.delete(`/api/colis/${id}` );
      toast.success(data.message);
    } catch (error) {

      console.error("Failed to update colis:", error);
      dispatch(colisActions.setError(error.message));
      toast.error('Failed to update colis');
    }
  };
}
// cloner colis
export function copieColis(id) {
  return async (dispatch) => {
    try {
      dispatch(colisActions.setLoading(true));
      const { data } = await request.post(`/api/colis/copie/${id}`);
      dispatch(colisActions.setLoading(false));
      toast.success(data.message);

      // Optionally refresh the colis list after successful copy
      // dispatch(getColis());

      return data;
    } catch (error) {
      dispatch(colisActions.setLoading(false));
      dispatch(colisActions.setError(error.message));
      toast.error('Failed to copy colis');
      throw error;
    }
  };
}



  // Fetch options for Select fields
  export function fetchOptions() {
    return async (dispatch) => {
      dispatch(colisActions.setLoading(true));
      try {
        // Fetch Villes
        const { data: villes } = await request.get(`/api/ville`);
        dispatch(colisActions.fetchVillesSuccess(villes));

        // Fetch Stores
        const { data: stores } = await request.get(`/api/store`);
        dispatch(colisActions.fetchStoresSuccess(stores));

        // Fetch Livreurs
        const { data: livreurs } = await request.get(`/api/livreur`);
        dispatch(colisActions.fetchLivreursSuccess(livreurs));

        // Fetch Produits
        const { data: produits } = await request.get(`/api/produit`);
        dispatch(colisActions.fetchProduitsSuccess(produits));

      } catch (error) {
        console.error("Failed to fetch options:", error);
        dispatch(colisActions.setError(error.message));
        toast.error('Failed to fetch options');
      } finally {
        dispatch(colisActions.setLoading(false));
      }
    };
  }

// Fetch post
// Fix the request by appending `statu` as a query parameter
export function getColisByStatu(statut) {
    return async (dispatch) => {
        try {
            const token = localStorage.getItem('token');
            if(!token){
                toast.error('Authentification token is missing')
            }
            const config = {
                headers: {
                    'authorization': `Bearer ${token}`, // Correct capitalization of Bearer
                    'Content-Type': 'application/json',
                }
            };
            const { data } = await request.get(`/api/colis/select/status?statu=${statut}`,config);
            dispatch(colisActions.setColis(data)); // Use action creator
            console.log(data);
        } catch (error) {
            console.error("Failed to fetch colis:", error);
            dispatch(colisActions.setError(error.message));
        }
    };
}


export const getColisForClient = (storeId , statut) => async (dispatch) => {
    dispatch(colisActions.setLoading(true));
    try {
        const token = localStorage.getItem('token');
        if(!token){
            toast.error('Authentification token is missing')

        }

        const config = {
            headers: {
                'authorization': `Bearer ${token}`, // Correct capitalization of Bearer
                'Content-Type': 'application/json',
            }
        };
        const { data } = await request.get(`/api/colis/user/${storeId}?statut=${statut}`,config);
        dispatch(colisActions.setColis(data)); // Use action creator
    } catch (error) {
        console.error("Failed to fetch colis for client:", error);
        dispatch(colisActions.setError("Failed to fetch colis: " + error.message));
    }
};



export const ramasserColis = (colisList) => async (dispatch) => {
    dispatch(colisActions.setLoading(true));
    try {
        const { data } = await request.post(`/api/colis/St/multiple` , colisList);
        toast.success(data.message)

    } catch (error) {
        toast.error("Failed to update statu:", error);
        dispatch(colisActions.setError("Failed to fetch colis: " + error.message));
    }
};
/*  */

// Create Colis function
// redux/apiCalls/colisApiCalls.js
// Existing functions...
// Search Colis by code_suivi for replacement (single selection)
export function searchColisByCodeSuivi(code_suivi) {
    return async (dispatch) => {
      try {
        dispatch(colisActions.setSearchLoading(true));

        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Authentification token is missing');
          dispatch(colisActions.setSearchLoading(false));
          return;
        }

        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        };

        const { data } = await request.get(`/api/colis/code_suivi/${code_suivi}`, config);

        // Assume backend returns a single colis or null
        const filteredData = data && data.statut === 'Livrée' && !data.is_remplace ? [data] : [];

        dispatch(colisActions.setSearchResults(filteredData));

        return { searchResults: filteredData };
      } catch (error) {
        console.error("Failed to search colis by code_suivi:", error);
        dispatch(colisActions.setError(error.response?.data?.message || "Failed to search colis"));
        toast.error('Failed to search colis by code_suivi');
        return { searchResults: [] };
      } finally {
        dispatch(colisActions.setSearchLoading(false));
      }
    };
}
  // Create Colis function
export function createColis(colis) {
    return async (dispatch) => {
      try {
        // Get token and user data from cookies
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        // Check for token and user data
        if (!token || !user) {
          throw new Error('Missing authentication token or user information.');
        }

        // Determine the correct ID to use for clients, admin, or team
        let idToUse;
        if (user.role === 'client') {

          const store = JSON.parse(localStorage.getItem("store"));
          if (!store?._id) {
            throw new Error('Store information is missing.');
          }
          idToUse = store._id;
        } else if (user.role === 'admin' || user.role === 'team') {
          idToUse = user._id;
        } else {
          throw new Error('User role is not authorized to create a colis.');
        }

        // Set up headers with the token
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        };

        // Send a POST request to create a single colis with `replacedColis` if available
        const { data } = await request.post(`/api/colis/user/${idToUse}`, colis, config);
      } catch (error) {
        // Error handling
        toast.error(error.response?.data?.message || error.message || "Failed to create colis");
        console.error("Error creating colis:", error);
        dispatch(colisActions.setError(error.response?.data?.message || "Failed to create colis"));
      }
    };
}

export const getColisForLivreur = (userId, statuts = []) => async (dispatch) => {
  dispatch(colisActions.setLoading(true));
  try {
      const token = localStorage.getItem('token'); // Retrieve token as a string
      const config = {
          headers: {
              'Authorization': `Bearer ${token}`, // Correct capitalization of Bearer
              'Content-Type': 'application/json',
          },
          params: {}
      };

      if (statuts.length > 0) {
          config.params.statut = statuts; // Axios handles array parameters correctly
      }

      // Fetch the data from the API
      const { data } = await request.get(`/api/colis/getColisLiv/${userId}`, config);
      dispatch(colisActions.setColis(data)); // Use action creator
  } catch (error) {
      console.error("Failed to fetch colis for livreur:", error);
      dispatch(colisActions.setError("Failed to fetch colis: " + error.message));
  } finally {
      dispatch(colisActions.setLoading(false));
  }
};


export const affecterLivreur=(colisId,livreurId)=>async(dispatch)=>{
    try{
        const token = localStorage.getItem('token');
        if(!token){
            toast.error('Authentification token is missing')
        }
        const config={
            headers:{
                'authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',

            }
        };
        const body={
            colisId:colisId,
            livreurId:livreurId
        }
        const data = await request.post(`api/livreur/colis`,body);

        dispatch(colisActions.updateColis(data.colis));

    }catch(error){
        toast.error(error.response?.data?.message || 'Failed to assign livreur');
        dispatch(colisActions.setError(error.message));

    }
}


export const updateStatut = (colisId, newStatus, comment, date, note) => async (dispatch) => {
  if (!colisId) {
    toast.error('ID de colis manquant');
    return;
  }

  // Retrieve the authentication token
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user')); // Parse user data from localStorage or cookies
  if (!token) {
    toast.error('Authentication token is missing');
    return;
  }

  // Configuration for the API request
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  };

  // Request body
  const body = {
    new_status: newStatus,
    comment,
    note, // Include note if provided
  };

  // Include date based on the status
  if (newStatus === "Programmée" && date) {
    body.date_programme = date;
  } else if (newStatus === "Reporté" && date) {
    body.date_reporte = date;
  }

  try {
    // Make the API request to update the status
    const { data } = await request.put(`/api/colis/St/${colisId}`, body, config);
    console.log('colisID', colisId);

    // Handle success
    dispatch(colisActions.updateColis(data.colis)); // Assuming you have an action to update the colis
    toast.success("Colis status updated successfully!");
  } catch (error) {
    // Handle error
    toast.error(error.response?.data?.message || "Failed to update colis status");
    console.error("Update status error:", error);
  }
};

export const colisProgramme=(colisId,daysToAdd)=>async(dispatch)=>{
    try {
        // Dispatch the loading action
        dispatch(colisActions.setLoading(true));

        // Make the API request to schedule the delivery
        const data = await request.post('http://localhost:8084/api/client/programme', {
            colisId,
            daysToAdd
        });

        // Assuming the response contains the updated colis data
        dispatch(colisActions.addColis(data.colis)); // Add the scheduled colis to the state

        // Dispatch the success state to stop loading
        dispatch(colisActions.setLoading(false));
    } catch (error) {
        console.error("Error scheduling delivery:", error);

        // Dispatch the error action to set the error message
        dispatch(colisActions.setError(error.response?.data?.message || "Error scheduling delivery"));

        // Stop loading in case of failure
        dispatch(colisActions.setLoading(false));
    }


}

export const annulerColis = (idColis, commentaire) => async (dispatch) => {
    try {
        // Faire la requête API pour annuler le colis
        const response = await request.post(`http://localhost:8084/api/client/annuler`, {
            idColis,
            commentaire // Envoyer le commentaire avec la requête
        });
        // Supposons que la réponse contient le colis mis à jour
        dispatch(colisActions.updateColis(response.data.colis)); // Mettez à jour l'état avec le colis annulé

    } catch (error) {
        console.error("Erreur lors de l'annulation du colis :", error);
    }
};



// redux/apiCalls/colisApiCalls.js

export const affectationColisAmeex = (colisDataArray) => async (dispatch) => {
  try {

    const codes_suivi = colisDataArray.map(colis => colis.code_suivi);
    const response = await request.post('/api/livreur/ameex', { codes_suivi });

    if (response.status === 200) {
      const { success, errors } = response.data;

      // Handle successes and errors
      if (success.length > 0) {
        toast.success(`${success.length} colis assigned to Ameex successfully`);
      }
      if (errors.length > 0) {
        toast.error(`${errors.length} colis failed to assign to Ameex`);
      }
    } else {
      toast.error(response.data.message || 'Erreur lors de l\'affectation à Ameex');
    }
  } catch (error) {
    console.error('Error in affectationColisAmeex:', error);
    dispatch(colisActions.setError(error.message));
    toast.error('Erreur lors de l\'affectation à Ameex');
  }
};


/*------------- crbt section -------------------- */


/**
 * Fetch all CRBT info for all Colis.
 * Expects the backend to respond with an object like:
 * { message: string, count: number, data: [ ... ] }
 */
export function getAllCrbtInfo() {
  return async (dispatch) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Authentication token is missing");
        return;
      }
      dispatch(colisActions.setLoading(true));

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      };

      const { data } = await request.get('/api/colis/crbt', config);

      // Dispatch the data to Redux; expected payload:
      // { crbtData: [...], count: number }
      dispatch(colisActions.setCrbtData({ crbtData: data.data, count: data.count }));
    } catch (error) {
      console.error("Failed to fetch all CRBT info:", error);
      dispatch(colisActions.setError(error.response?.data?.message || error.message));
      toast.error(error.response?.data?.message || "Failed to fetch CRBT info");
    } finally {
      dispatch(colisActions.setLoading(false));
    }
  };
}

/**
 * Fetch a single Colis CRBT detail by identifier.
 * The identifier can be a MongoDB ObjectId or a code_suivi.
 * Expects the backend to respond with an object like:
 * { message: string, data: { ... } }
 */
export function getCrbtDetailByIdentifier(identifier) {
  return async (dispatch) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Authentication token is missing");
        return;
      }
      dispatch(colisActions.setLoading(true));

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      };

      const { data } = await request.get(`/api/colis/crbt/${identifier}`, config);

      // Store the single selected CRBT detail in Redux
      dispatch(colisActions.setSelectedCrbt(data.data));

      toast.success("CRBT detail retrieved successfully");
    } catch (error) {
      console.error("Failed to fetch CRBT detail:", error);
      dispatch(colisActions.setError(error.response?.data?.message || error.message));
      toast.error(error.response?.data?.message || "Failed to fetch CRBT detail");
    } finally {
      dispatch(colisActions.setLoading(false));
    }
  };
}

/**
 * Update the CRBT info of a Colis.
 * Expects a PUT request with a payload like { crbt: { ... } }.
 * Backend should respond with an object containing the updated colis data:
 * { message: string, data: { ... } }
 */
export function updateCrbtInfo(colisId, crbtData) {
  return async (dispatch) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Authentication token is missing");
        return;
      }
      dispatch(colisActions.setLoading(true));

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      };

      const { data } = await request.put(`/api/colis/crbt/${colisId}`, { crbt: crbtData }, config);

      // Update the colis in the Redux store with the new CRBT info.
      dispatch(colisActions.updateColis(data.data));

      toast.success("CRBT info updated successfully");
    } catch (error) {
      console.error("Failed to update CRBT info:", error);
      dispatch(colisActions.setError(error.response?.data?.message || error.message));
      toast.error(error.response?.data?.message || "Failed to update CRBT info");
    } finally {
      dispatch(colisActions.setLoading(false));
    }
  };
}


// redux/apiCalls/colisApiCalls.js
export function fixCrbtForColis(code_suivi) {
  return async (dispatch) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Authentication token is missing");
        return;
      }

      // Setup request headers
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      // Dispatch loading state before making the API call
      dispatch(colisActions.setLoading(true));

      // Send a PATCH request to the fix-crbt API
      const { data } = await request.put(`/api/colis/fix-crbt/${code_suivi}`, {}, config);

      // Update the colis data with the response from the API
      dispatch(colisActions.updateColis(data.colis));

      // Show a success toast message
      toast.success("CRBT data updated successfully");
    } catch (error) {
      console.error("Error fixing CRBT for colis:", error);
      // Handle any errors during the API request
      dispatch(colisActions.setError(error.message || "Failed to update CRBT data"));
      toast.error(error.response?.data?.message || "Failed to update CRBT data");
    } finally {
      dispatch(colisActions.setLoading(false)); // Stop loading after the request completes
    }
  };
}

/**
 * Get tarif_ajouter information for a specific colis
 * @param {string} identifier - The colis ID or code_suivi
 */
export function getTarifAjouter(identifier) {
  return async (dispatch) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Authentication token is missing");
        return;
      }

      dispatch(colisActions.setTarifAjouterLoading(true));

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      };

      const { data } = await request.get(`/api/colis/tarif/${identifier}`, config);

      dispatch(colisActions.setSelectedTarifAjouter(data.data.tarif_ajouter));
      return data.data;

    } catch (error) {
      console.error("Failed to fetch tarif_ajouter:", error);
      dispatch(colisActions.setTarifAjouterError(error.response?.data?.message || error.message));
      toast.error(error.response?.data?.message || "Failed to fetch tarif_ajouter");
    } finally {
      dispatch(colisActions.setTarifAjouterLoading(false));
    }
  };
}

/**
 * Update tarif_ajouter for a specific colis
 * @param {string} identifier - The colis ID or code_suivi
 * @param {Object} tarifData - The tarif_ajouter data to update
 * @param {number} tarifData.value - The value to set
 * @param {string} tarifData.description - The description to set
 */
export function updateTarifAjouter(identifier, tarifData) {
  return async (dispatch) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Authentication token is missing");
        return;
      }

      dispatch(colisActions.setTarifAjouterLoading(true));

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      };

      const { data } = await request.put(
        `/api/colis/tarif/${identifier}`,
        {
          value: tarifData.value,
          description: tarifData.description
        },
        config
      );

      dispatch(colisActions.updateTarifAjouter(data.data));
      toast.success("Tarif ajouter updated successfully");
      return data.data;

    } catch (error) {
      console.error("Failed to update tarif_ajouter:", error);
      dispatch(colisActions.setTarifAjouterError(error.response?.data?.message || error.message));
      toast.error(error.response?.data?.message || "Failed to update tarif_ajouter");
    } finally {
      dispatch(colisActions.setTarifAjouterLoading(false));
    }
  };
}

/**
 * Fetch colis with statut "Ramassée" grouped by region
 * This API returns role-based filtered data grouped by region
 */
export function getColisRamasse() {
  return async (dispatch) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Authentication token is missing");
        return;
      }

      dispatch(colisActions.setColisRamasseLoading(true));

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      };

      const { data } = await request.get('/api/colis/ramassee', config);

      // Dispatch the grouped data to Redux
      dispatch(colisActions.setColisRamasseData({
        total: data.total,
        groupedColis: data.groupedColis
      }));

      return data;
    } catch (error) {
      console.error("Failed to fetch colis ramassée:", error);
      dispatch(colisActions.setColisRamasseError(error.response?.data?.message || error.message));
      toast.error(error.response?.data?.message || "Failed to fetch colis ramassée");
    } finally {
      dispatch(colisActions.setColisRamasseLoading(false));
    }
  };
}

// Fetch Nouveau Colis
export function getNouveauColis() {
  return async (dispatch) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        dispatch(colisActions.setNouveauColisError('Authentication token is missing'));
        return;
      }
      dispatch(colisActions.setNouveauColisLoading(true));
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      };
      const { data } = await request.get('/api/colis/nouveau', config);
      dispatch(colisActions.setNouveauColisData({ total: data.total, colis: data.colis }));
    } catch (error) {
      dispatch(colisActions.setNouveauColisError(error.response?.data?.message || error.message));
    } finally {
      dispatch(colisActions.setNouveauColisLoading(false));
    }
  };
}

// Fetch Attente de Ramassage Colis
export function getAttenteRamassageColis() {
  return async (dispatch) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        dispatch(colisActions.setAttenteRamassageColisError('Authentication token is missing'));
        return;
      }
      dispatch(colisActions.setAttenteRamassageColisLoading(true));
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      };
      const { data } = await request.get('/api/colis/attente-ramassage', config);
      dispatch(colisActions.setAttenteRamassageColisData({ total: data.total, colis: data.colis }));
    } catch (error) {
      dispatch(colisActions.setAttenteRamassageColisError(error.response?.data?.message || error.message));
    } finally {
      dispatch(colisActions.setAttenteRamassageColisLoading(false));
    }
  };
}

export function getColisPaginated(filters = {}) {
  return async (dispatch) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        dispatch(colisActions.setColisPaginatedError('Authentication token is missing'));
        return;
      }
      dispatch(colisActions.setColisPaginatedLoading(true));
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params: {
          page: filters.page || 1,
          limit: filters.limit || 20,
          client: filters.client || '',
          livreur: filters.livreur || '',
          statut: filters.statut || '',
          ville: filters.ville || '',
          dateFrom: filters.dateFrom || '',
          dateTo: filters.dateTo || '',
          store: filters.store || '', // <-- Add this line
        },
      };
      const { data } = await request.get('/api/colis/paginated', config);
      dispatch(colisActions.setColisPaginatedData(data));
    } catch (error) {
      dispatch(colisActions.setColisPaginatedError(error.response?.data?.message || error.message));
    } finally {
      dispatch(colisActions.setColisPaginatedLoading(false));
    }
  };
}

