const router = require("express").Router();
const { loginProfileCtrl , registerAdmin , registerClient, registerLivreur, selectStoreCtrl, registerTeam } = require("../Controllers/authController");
const { createClientFile } = require("../Controllers/clientControllers");
const fileup = require("../Middlewares/fileUpload");




// api/auth/register/role
router.post("/register/admin",registerAdmin);
router.post("/register/client",registerClient);
router.post("/register/livreur",registerLivreur);
router.post("/register/team",registerTeam);

<<<<<<<<< Temporary merge branch 1
=========
// api/auth/login/:role
router.post("/login/:role",loginProfileCtrl);
>>>>>>>>> Temporary merge branch 2

// api/auth/login/:role
router.post("/login/:role",loginProfileCtrl);


router.post("/login",loginProfileCtrl);
// api/auth/selectStore
router.get("/selectStore",selectStoreCtrl);



module.exports= router;
