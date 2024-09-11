import { toast } from "react-toastify";
import request from "../../utils/request";
import { profileActions } from "../slices/profileSlice";
import Cookies from "js-cookie";
import { livreurActions } from "../slices/livreurSlice";



// get list users 
export function getLivreurList(){
    return async(dispatch)=>{
        try{
            const {data} = await request.get(`/api/livreur`);
            console.log('Livreur List',data);
            dispatch(livreurActions.setLivreurList(data))
        }catch(error){
            toast.error(error.message || "Failed to fetch livreur List");
        }
    }
}

