const jwt = require("jsonwebtoken")

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
                    id , role , secret_key
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



module.exports = {
    verifyToken , 
    verifyTokenAndAdmin ,
}