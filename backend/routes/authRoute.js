const router = require("express").Router();
const { loginProfileCtrl , registerAdmin , registerClient, registerLivreur, selectStoreCtrl, registerTeam, getPasswordCtrl, resetUserPasswordCtrl, resetOwnPasswordCtrl } = require("../Controllers/authController");
const { createClientFile } = require("../Controllers/clientControllers");
const fileup = require("../Middlewares/fileUpload");
const { verifyToken, verifyTokenAndAdmin } = require("../Middlewares/VerifyToken");




// api/auth/register/role
router.post("/register/admin",registerAdmin);
router.post("/register/client",registerClient);
router.post("/register/livreur",registerLivreur);
router.post("/register/team",registerTeam);


// api/auth/login/:role
router.post("/login/:role",loginProfileCtrl);


// api/auth/selectStore
router.get("/selectStore",selectStoreCtrl);

router.post("/login",loginProfileCtrl);

router.put('/reset-password', verifyToken, resetOwnPasswordCtrl);
router.put('/:role/reset-password', verifyTokenAndAdmin, resetUserPasswordCtrl);




module.exports= router;
