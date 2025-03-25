const express = require("express");
const {colisStatic, transactionStatistics, getTopVilles, getTopClient, getColisReporteeProgramméeCodes, getLastTransfer, getTransferStatistics, WithdrawalNotComplete} = require("../Controllers/staticController");
const { verifyToken } = require("../Middlewares/VerifyToken");
const router = express.Router();

router.get("/colis" , verifyToken , colisStatic);
router.get("/transaction" , verifyToken , transactionStatistics);
router.get("/ville" , verifyToken , getTopVilles);
router.get("/client"  , verifyToken , getTopClient);

router.get("/colis/reporte"  , verifyToken , getColisReporteeProgramméeCodes);
router.get("/transfer/argent", verifyToken, getLastTransfer);
router.get("/transfer/statistics", verifyToken, getTransferStatistics);
router.get("/withdrawal/incomplete", verifyToken, WithdrawalNotComplete);

module.exports= router;
