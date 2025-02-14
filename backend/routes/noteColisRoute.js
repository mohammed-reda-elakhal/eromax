const express = require('express');
const { GetNoteColisCtrl, GetAllNoteColisCtrl, CreateNoteColisCtrl , CreateOrUpdateNoteAdminCtrl , CreateOrUpdateNoteClientCtrl, CreateOrUpdateNoteLivreurCtrl } = require('../Controllers/noteColisController');
const { verifyToken, verifyTokenAndClient, verifyTokenAndLivreur, verifyTokenAndAdmin } = require('../Middlewares/VerifyToken');


const router = express.Router();


router.post('/',CreateNoteColisCtrl)
router.get('/', GetAllNoteColisCtrl);
router.get('/:colisId' , GetNoteColisCtrl)

router.put('/client'  , verifyTokenAndClient , CreateOrUpdateNoteClientCtrl)
router.put('/livreur'  , verifyTokenAndLivreur , CreateOrUpdateNoteLivreurCtrl)
router.put('/admin'  , verifyTokenAndAdmin , CreateOrUpdateNoteAdminCtrl)






module.exports = router;
