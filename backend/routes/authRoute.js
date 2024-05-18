const router = require("express").Router();
const { registerProfileCtrl } = require("../Controllers/authController");


// api/auth/register
router.post("/register",registerProfileCtrl);



module.exports= router;
