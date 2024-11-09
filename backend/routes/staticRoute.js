const express = require("express");
const { countColisLivreByLivreur, countColisLivreByClient, countColisLivreByTeam, countColisLivre, countColis, countColisByClinet, countColisByLivreur, countColisByTeam, countColisByRole, countColisLivreByRole, countCanceledColisByRole, countTotalGains, countTotalGainsByRole } = require("../Controllers/staticController");
const { verifyTokenAdminTeam } = require("../Middlewares/VerifyToken");
const router = express.Router();
// /api/count/
router.get('/livres/:role/:id', countColisLivreByRole);
router.get('/annules/:role/:id', countCanceledColisByRole);
router.get('/colis/:role/:id',countColisByRole);
router.get('/gains/total', countTotalGains);
router.get('/gains/total/:role/:id', countTotalGainsByRole);

module.exports= router;

