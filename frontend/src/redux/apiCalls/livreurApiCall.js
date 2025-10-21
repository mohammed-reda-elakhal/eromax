import { toast } from "react-toastify";
import request from "../../utils/request";
import { profileActions } from "../slices/profileSlice";
import Cookies from "js-cookie";
import { livreurActions } from "../slices/livreurSlice";



// get list users 
// params: optional object with filters like { active: true }
export function getLivreurList(params = {}){
    return async(dispatch)=>{
        try{
            // Build query string from params
            const queryParams = new URLSearchParams();
            
            // Add active filter if provided
            if (params.active !== undefined) {
                queryParams.append('active', params.active);
            }
            
            const queryString = queryParams.toString();
            const url = queryString ? `/api/livreur?${queryString}` : '/api/livreur';
            
            const {data} = await request.get(url);
            dispatch(livreurActions.setLivreurList(data))
        }catch(error){
            toast.error(error.message || "Failed to fetch livreur List");
        }
    }
}

