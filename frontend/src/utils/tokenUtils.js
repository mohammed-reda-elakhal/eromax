import { jwtDecode } from "jwt-decode";

export const decodeToken = (token) => {
    if (!token) {
        throw new Error('No token provided');
    }
    //-------------------------------------------------------
    /* const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
        .split('')
        .map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload); */
    //------------------------------------------------------------
    // Utilisation simple de jwtDecode
    const decoded = jwtDecode(token);
    const expTime = decoded.exp * 1000; // Convertir l'expiration du token en millisecondes
    if (Date.now() > expTime) {
        throw new Error('Token has expired. Please login again.');
    }
    return decoded;
};
