import axios from "axios";


const request =  axios.create({
    baseURL : "http://localhost:8084"
})

export default request