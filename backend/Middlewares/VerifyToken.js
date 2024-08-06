const jwt = require("jsonwebtoken");

const { Store } = require("../Models/Store");

// verify token
//genearate token onl
const { Store } = require("../models/Store");

// verify token

function verifyToken(req , res , next){
    const authToken = req.headers.token;
    if(authToken){
        const token = authToken.split(" ")[1];
        try {
            const decodedPayload = jwt.verify(token , process.env.JWT_SECRET);
            req.user  = decodedPayload;
<<<<<<< HEAD
            console.log("Decoded Payload:", decodedPayload);
            /*
                decodedPayload = {
                    id , role  , store ( if exist ), secret_key
=======
            /*
                decodedPayload = {
                    id , role  , store ( if exist ), secret_key
                    req.user.id === id user 
                    req.user.role === " role"
>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada
                }
            */
            next()
        } catch (error) {
<<<<<<< HEAD
            console.error("Invalid token:", error);
            return res.status(401).json({message : "invalid token, access denied"})
        }
    }else{
        console.warn("No token provided");
=======
            return res.status(401).json({message : "invalid token, access denied"})
        }
    }else{
>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada
        return res.status(401).json({message : "no token provided, access denied"})
    }
}

// verify token and admin 
function verifyTokenAndAdmin(req , res , next ){
    verifyToken(req , res , ()=>{
        if(req.user.role === "admin"){
            next();
        } else {
            return res.status(401).json({ message: "not allowed only admin" });
        }
    })
}

// verify token admin team
function verifyTokenAdminTeam(req , res , next ){
    verifyToken(req , res , ()=>{
        if(req.user.role === "admin" || req.user.role === "team" ){
            next();
        } else {
            return res.status(401).json({ message: "not allowed only admin or team" });
        }
    })
}

// verify token client store or team or admin
<<<<<<< HEAD
// les traitement de client admin team 
function verifyTokenStoreTeamAdminClient(req , res , next ){
    verifyToken(req , res , ()=>{
        if(
            req.user.store != "" && req.user.store === req.params.id_user || 
            req.user.role === "team" && req.user.id === req.params.id_user || 
            req.user.role === "admin" && req.user.id === req.params.id_user||
            req.user.role=== "client" && req.user.id === req.params.id_user
        ){
            next();
        } else {
            return res.status(401).json({ message: "You are not allow to this operation" });
        }
    })
}
=======
>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada
function verifyTokenStoreTeamAdmin(req , res , next ){
    verifyToken(req , res , ()=>{
        if(
            req.user.store != "" && req.user.store === req.params.id_user || 
<<<<<<< HEAD
=======

            
>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada
            req.user.role === "team" && req.user.id === req.params.id_user || 
            req.user.role === "admin" && req.user.id === req.params.id_user
        ){
            next();
        } else {
            return res.status(401).json({ message: "You are not allow to this operation" });
        }
    })
}
<<<<<<< HEAD
// verify tokent and client 
function verifyTokenAndClient(req , res , next ){
    verifyToken(req , res , ()=>{
        if(req.user.role ==="client" && req.user.id === req.params.id_client){
=======

// verify tokent and client 
function verifyTokenAndClient(req , res , next ){
    verifyToken(req , res , ()=>{
        if(req.user.role === "client" && req.user.id === req.params.id_user){
>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada
            next();
        } else {
            return res.status(401).json({ message: "not allowed to this operation" });
        }
    })
}


// verify token and livreur

function verifyTokenAndLivreur(req , res , next){
    verifyToken(req , res , ()=>{
        if(req.user.role === "livreur" && req.user.id === req.params.id_user){ // if the id get by params also can get in req.body
            next();
        } else {
            return res.status(401).json({ message: "not allowed to access" });
        }
    })
}
// verify token and livreur or admin
function verifyTokenAndLivreurOrAdmin(req , res , next){
    verifyToken(req , res , ()=>{
        if(req.user.role === "admin" || req.user.role === "livreur"){
            next();
        } else {
            return res.status(401).json({ message: "You don't have permession to this operation" });
        }
    })
}

// verify token and store
const verifyTokenAndStore = async (req, res, next) => {
    verifyToken(req, res, async () => {
<<<<<<< HEAD
        if (req.user.role === "client" && req.user.store === req.body.id_user) {
            next()
           
=======
        if (req.user.role === "client" && req.user.store === req.params.id) {
           next()
>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada
        } else {
            return res.status(401).json({ message: "Not allowed to access" });
        }
    });
};



module.exports = {
    verifyToken , 
    verifyTokenAndAdmin ,
    verifyTokenStoreTeamAdmin ,
    verifyTokenAdminTeam , 
    verifyTokenAndClient ,
    verifyTokenAndLivreur,
    verifyTokenAndLivreurOrAdmin , 
<<<<<<< HEAD
    verifyTokenAndStore,
    verifyTokenStoreTeamAdminClient
=======
    verifyTokenAndStore
>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada
}