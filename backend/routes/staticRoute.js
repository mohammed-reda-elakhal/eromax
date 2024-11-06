const express = require("express");
const { countColisLivreByLivreur, countColisLivreByClient, countColisLivreByTeam, countColisLivre, countColis, countColisByClinet, countColisByLivreur, countColisByTeam, countColisByRole, countColisLivreByRole, countCanceledColisByRole, countTotalGains } = require("../Controllers/staticController");
const { verifyTokenAdminTeam } = require("../Middlewares/VerifyToken");
const router = express.Router();

// router.get('/livres/livreur/:livreurId',countColisLivreByLivreur);
//router.get('/livres/client/:storeId',countColisLivreByClient);
//router.get('/livres/team/:teamId',countColisLivreByTeam);

router.get('/livres/:role/:id', countColisLivreByRole);
router.get('/annules/:role/:id', countCanceledColisByRole);
router.get('/livres',verifyTokenAdminTeam,countColisLivre);
router.get('/colis',verifyTokenAdminTeam,countColis);
router.get('/gains/total', countTotalGains);
router.get('/colis/client/:storeId',countColisByClinet);
router.get('/colis/livreur/:livreurId',countColisByLivreur);
router.get('/colis/team/:teamId',countColisByTeam);

module.exports= router;

