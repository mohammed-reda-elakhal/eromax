import { jwtDecode } from "jwt-decode";

export const decodeToken = (token) => {
    if (!token) {
        throw new Error('No token provided');
    }

    const decoded = jwtDecode(token);
    const expTime = decoded.exp * 1000; // Convertir l'expiration du token en millisecondes
    if (Date.now() > expTime) {
        throw new Error('Token has expired. Please login again.');
    }
    return decoded;
};
