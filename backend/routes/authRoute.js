const router = require("express").Router();
const { loginProfileCtrl , registerAdmin , registerClient, registerLivreur, selectStoreCtrl, registerTeam } = require("../Controllers/authController");
<<<<<<< HEAD
const { createClientFile } = require("../Controllers/clientControllers");
const fileup = require("../Middlewares/fileUpload");




=======


>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada
// api/auth/register/role
router.post("/register/admin",registerAdmin);
router.post("/register/client",registerClient);
router.post("/register/livreur",registerLivreur);
router.post("/register/team",registerTeam);

<<<<<<< HEAD

// api/auth/login/:role
router.get("/login/:role",loginProfileCtrl);
// api/auth/login/client/file

=======
// api/auth/login/:role
router.get("/login/:role",loginProfileCtrl);
>>>>>>> c51572a5a7161cff79ea4300c71239ec997b3ada

// api/auth/selectStore
router.get("/selectStore",selectStoreCtrl);



module.exports= router;
