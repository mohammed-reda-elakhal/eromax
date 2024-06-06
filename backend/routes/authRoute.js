const router = require("express").Router();
const { registerProfileCtrl, loginProfileCtrl } = require("../Controllers/authController");


// api/auth/register
router.post("/register",registerProfileCtrl);

// api/auth/register
router.get("/login",loginProfileCtrl);



module.exports= router;
