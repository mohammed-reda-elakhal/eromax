const router = require("express").Router();
const { loginProfileCtrl , registerAdmin , registerClient, registerLivreur } = require("../Controllers/authController");


// api/auth/register/role
router.post("/register/admin",registerAdmin);
router.post("/register/client",registerClient);
router.post("/register/livreur",registerLivreur);

// api/auth/login/:role
router.get("/login/:role",loginProfileCtrl);



module.exports= router;
