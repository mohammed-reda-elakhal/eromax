const jwt = require("jsonwebtoken");
const { Store } = require("../models/Store");

// verify token
function verifyToken(req , res , next){
    const authToken = req.headers.token;
    if(authToken){
        const token = authToken.split(" ")[1];
        try {
            const decodedPayload = jwt.verify(token , process.env.JWT_SECRET);
            req.user  = decodedPayload;
            /*
                decodedPayload = {
                    id , role  , store ( if exist ), secret_key
                }
            */
            next()
        } catch (error) {
            return res.status(401).json({message : "invalid token, access denied"})
        }
    }else{
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

// verify token and client or admin
function verifyTokenAndClientOrAdmin(req , res , next){
    verifyToken(req , res , ()=>{
        if(req.user.role === "admin" || req.user.id === req.params.id){
            next();
        } else {
            return res.status(401).json({ message: "You don't have permession to this operation" });
        }
    })
}

function verifyTokenAndClientOrAdminRole(req , res , next){
    verifyToken(req , res , ()=>{
        if(req.user.role === "admin" || req.user.role === "client"){
            next();
        } else {
            return res.status(401).json({ message: "You don't have permession to this operation" });
        }
    })
}

// verify tokent and client 
function verifyTokenAndClient(req , res , next ){
    verifyToken(req , res , ()=>{
        if(req.user.role === "client" && req.user.id === req.params.id){
            next();
        } else {
            return res.status(401).json({ message: "not allowed to this operation" });
        }
    })
}


// verify token and livreur Role
function verifyTokenAndLivreurRole(req , res , next){
    verifyToken(req , res , ()=>{
        if(req.user.role === "livreur"){
            next();
        } else {
            return res.status(401).json({ message: "not allowed to access" });
        }
    })
}

function verifyTokenAndLivreur(req , res , next){
    verifyToken(req , res , ()=>{
        if(req.user.role === "livreur" && req.user.id === req.params.id){
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
        if (req.user.role === "client") {
            const store = await Store.findOne({ id_client: req.user.id });
            if (store) {
                req.user.store = store; // Attach store to the req.user
                next();
            } else {
                return res.status(401).json({ message: "You don't have a store" });
            }
        } else {
            return res.status(401).json({ message: "Not allowed to access" });
        }
    });
};



module.exports = {
    verifyToken , 
    verifyTokenAndAdmin ,
    verifyTokenAndClientOrAdmin,
    verifyTokenAndClient,
    verifyTokenAndLivreur,
    verifyTokenAndStore,
    verifyTokenAndLivreurRole,
    verifyTokenAndLivreurOrAdmin,
    verifyTokenAndClientOrAdminRole
}