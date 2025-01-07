const express = require("express");
const {colisStatic, transactionStatistics ,  getTopVilles, getTopClient} = require("../Controllers/staticController");
const { verifyTokenAdminTeam, verifyToken } = require("../Middlewares/VerifyToken");
const router = express.Router();





router.get("/colis" , verifyToken , colisStatic);
router.get("/transaction" , verifyToken , transactionStatistics);
router.get("/ville" , verifyToken , getTopVilles);
router.get("/client"  , verifyToken , getTopClient);






module.exports= router;
