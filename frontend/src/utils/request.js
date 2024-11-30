import axios from "axios";

const request = axios.create({
    baseURL: "https://eromax-api.vercel.app/",
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add a request interceptor to include the token
request.interceptors.request.use(
    (config) => {
        // Get the token from localStorage
        const token = localStorage.getItem("token");
        if (token) {
            // Attach token to the Authorization header
            config.headers['Authorization'] = `Bearer ${JSON.parse(token)}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors
request.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle response errors
        if (error.response && error.response.status === 401) {
            // Handle unauthorized errors (e.g., redirect to login)
            localStorage.removeItem("user");
            localStorage.removeItem("store");
            localStorage.removeItem("token");
           
        }
        return Promise.reject(error);
    }
);

export default request;
