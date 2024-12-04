const express = require("express");
const { countColisLivreByLivreur, countColisLivreByClient, countColisLivreByTeam, countColisLivre, countColis, countColisByClinet, countColisByLivreur, countColisByTeam, countColisByRole, countColisLivreByRole, countCanceledColisByRole, countTotalGains, countTotalGainsByRole, countRetourColisByRole, getLastTransactionByStore, getBigTransByStore, countTopVilleForStore, countBenefitsPerPeriod, countColisParVille, countColisParLivreur, colisStatic, transactionStatistics ,  getTopVilles, getTopClient} = require("../Controllers/staticController");
const { verifyTokenAdminTeam, verifyToken } = require("../Middlewares/VerifyToken");
const router = express.Router();


// /api/count/
router.get('/livres/:role/:id', countColisLivreByRole);
router.get('/annules/:role/:id', countCanceledColisByRole);
router.get('/retour/:role/:id', countRetourColisByRole);
router.get('/colis/:role/:id',countColisByRole);
router.get('/gains/total', countTotalGains);
router.get('/gains/total/:role/:id', countTotalGainsByRole);
router.get("/last-transaction/:storeId",getLastTransactionByStore);
router.get("/big-transaction/:storeId",getBigTransByStore);
router.get("/topVille/:storeId",countTopVilleForStore);
router.get("/benifts",countBenefitsPerPeriod);
router.get('/colis/countParVille', countColisParVille);
router.get('/colis/countParLiv', countColisParLivreur);


router.get("/colis" , verifyToken , colisStatic);
router.get("/transaction" , verifyToken , transactionStatistics);
router.get("/ville" , verifyToken , getTopVilles);
router.get("/client"  , verifyToken , getTopClient);






module.exports= router;
